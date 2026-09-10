import { Router } from "express";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import nodemailer from "nodemailer";
import { z } from "zod";
import prisma from "../prisma";
import {
  generateToken,
  authenticateToken,
  requireRole,
  AuthenticatedRequest,
} from "../middleware/auth";
import { recordAuditLog } from "../middleware/audit";
import { successResponse, errorResponse } from "../utils/response";

const router = Router();

/* =========================================================
   EMAIL / OTP CONFIGURATION
   ========================================================= */

const SMTP_HOST = process.env.SMTP_HOST || "smtp.gmail.com";
const SMTP_PORT = Number(process.env.SMTP_PORT || 587);
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;

const OTP_EMAIL_FROM =
  process.env.OTP_EMAIL_FROM || SMTP_USER || "BhoomiSetu";

const mailTransporter =
  SMTP_USER && SMTP_PASS
    ? nodemailer.createTransport({
        host: SMTP_HOST,
        port: SMTP_PORT,
        secure: SMTP_PORT === 465,
        auth: {
          user: SMTP_USER,
          pass: SMTP_PASS,
        },
      })
    : null;

/* =========================================================
   VALIDATION SCHEMAS
   ========================================================= */

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  fullName: z.string().min(2),
  designation: z.string().min(2),
  department: z.string().min(2),
  role: z
    .enum([
      "SUPER_ADMIN",
      "CENTRAL_MINISTRY",
      "STATE_GOVERNMENT",
      "DISTRICT_AUTHORITY",
      "PIA",
      "FIELD_OFFICER",
      "VIEWER",
    ])
    .default("VIEWER"),
  state: z.string().optional(),
  district: z.string().optional(),
  phone: z.string().optional(),
});

/*
 * Existing-account OTP login
 */
const otpRequestSchema = z.object({
  identifier: z.string().email(),
});

const otpVerifySchema = z.object({
  identifier: z.string().email(),
  otp: z.string().regex(/^\d{6}$/, "OTP must be exactly 6 digits"),
});

/*
 * New-account OTP registration
 */
const registerOtpRequestSchema = z.object({
  email: z.string().email(),
});

const registerOtpVerifySchema = z.object({
  email: z.string().email(),
  otp: z.string().regex(/^\d{6}$/, "OTP must be exactly 6 digits"),
  fullName: z.string().min(2),
  password: z.string().min(6),
  designation: z.string().min(2).default("Citizen User"),
  department: z.string().min(2).default("Public"),
  state: z.string().optional(),
  district: z.string().optional(),
  phone: z.string().optional(),
});

/* =========================================================
   OTP HELPERS
   ========================================================= */

function normalizeIdentifier(identifier: string): string {
  return identifier.trim().toLowerCase();
}

function generateOtp(): string {
  return crypto.randomInt(100000, 1000000).toString();
}

function hashOtp(otp: string): string {
  return crypto.createHash("sha256").update(otp).digest("hex");
}

/* =========================================================
   USER RESPONSE HELPER
   ========================================================= */

function sanitizeUser(user: any) {
  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    role: user.role,
    designation: user.designation,
    department: user.department,
    state: user.state,
    district: user.district,
    phone: user.phone,
  };
}

/* =========================================================
   LOGIN - EMAIL + PASSWORD
   POST /api/v1/auth/login
   ========================================================= */

router.post("/login", async (req, res) => {
  try {
    const parseResult = loginSchema.safeParse(req.body);

    if (!parseResult.success) {
      return errorResponse(
        res,
        "Invalid input data",
        400,
        parseResult.error.format()
      );
    }

    const { email, password } = parseResult.data;

    const normalizedEmail = normalizeIdentifier(email);

    const user = await prisma.user.findUnique({
      where: {
        email: normalizedEmail,
      },
    });

    if (!user || !user.active) {
      return errorResponse(
        res,
        "Invalid email or password",
        401
      );
    }

    const isValid = await bcrypt.compare(
      password,
      user.passwordHash
    );

    if (!isValid) {
      await recordAuditLog({
        userId: user.id,
        userName: user.fullName,
        userRole: user.role,
        action: "LOGIN_FAILED",
        entity: "User",
        entityId: user.id,
        details: {
          reason: "Bad password",
        },
        req,
      });

      return errorResponse(
        res,
        "Invalid email or password",
        401
      );
    }

    const token = generateToken(user);

    await recordAuditLog({
      userId: user.id,
      userName: user.fullName,
      userRole: user.role,
      action: "LOGIN",
      entity: "User",
      entityId: user.id,
      details: {
        role: user.role,
        state: user.state,
        district: user.district,
        method: "PASSWORD",
      },
      req,
    });

    return successResponse(
      res,
      {
        token,
        user: sanitizeUser(user),
      },
      "Authentication successful"
    );
  } catch (error: any) {
    console.error("Login error:", error);

    return errorResponse(
      res,
      "Login failed",
      500,
      error.message
    );
  }
});

/* =========================================================
   EXISTING ACCOUNT - REQUEST OTP
   POST /api/v1/auth/request-otp

   Used for:
   Existing account -> Login with Email OTP

   IMPORTANT:
   This does NOT create a new account.
   ========================================================= */

router.post("/request-otp", async (req, res) => {
  try {
    const parseResult = otpRequestSchema.safeParse(req.body);

    if (!parseResult.success) {
      return errorResponse(
        res,
        "Please enter a valid email address",
        400,
        parseResult.error.format()
      );
    }

    const identifier = normalizeIdentifier(
      parseResult.data.identifier
    );

    const user = await prisma.user.findUnique({
      where: {
        email: identifier,
      },
    });

    if (!user || !user.active) {
      return errorResponse(
        res,
        "No active BhoomiSetu account found with this email",
        404
      );
    }

    /*
     * Remove previous unused OTPs
     */
    await prisma.otpVerification.deleteMany({
      where: {
        identifier,
        used: false,
      },
    });

    /*
     * Generate OTP
     */
    const otp = generateOtp();
    const otpHash = hashOtp(otp);

    /*
     * OTP valid for 5 minutes
     */
    const expiresAt = new Date(
      Date.now() + 5 * 60 * 1000
    );

    await prisma.otpVerification.create({
      data: {
        identifier,
        otpHash,
        expiresAt,
        attempts: 0,
        used: false,
      },
    });

    /*
     * Audit
     */
    await recordAuditLog({
      userId: user.id,
      userName: user.fullName,
      userRole: user.role,
      action: "OTP_REQUESTED",
      entity: "User",
      entityId: user.id,
      details: {
        method: "EMAIL_OTP",
      },
      req,
    });

    /*
     * DEMO / DEVELOPMENT MODE
     *
     * If SMTP isn't configured,
     * print OTP in terminal.
     */
    if (!mailTransporter) {
      console.log("");
      console.log("==============================================");
      console.log("🔐 BhoomiSetu DEMO OTP - EXISTING ACCOUNT");
      console.log(`📧 Email: ${identifier}`);
      console.log(`🔢 OTP: ${otp}`);
      console.log("⏱️ Valid for: 5 minutes");
      console.log("==============================================");
      console.log("");

      return successResponse(
        res,
        {
          expiresIn: 300,
          demoOtp: otp,
          delivery: "console",
        },
        "OTP generated successfully"
      );
    }

    /*
     * Send email
     */
    await mailTransporter.sendMail({
      from: OTP_EMAIL_FROM,
      to: identifier,
      subject: "BhoomiSetu Login OTP",
      text: `
Your BhoomiSetu login OTP is ${otp}.

This OTP is valid for 5 minutes.

Do not share this OTP with anyone.
      `.trim(),
      html: `
        <div style="
          font-family: Arial, sans-serif;
          max-width: 600px;
          margin: auto;
          padding: 24px;
        ">
          <h2>BhoomiSetu</h2>

          <p>
            National Land Acquisition & Management System
          </p>

          <p>
            Your one-time login verification code is:
          </p>

          <div style="
            font-size: 32px;
            font-weight: bold;
            letter-spacing: 8px;
            padding: 18px;
            text-align: center;
            background: #f3f4f6;
            border-radius: 10px;
            margin: 20px 0;
          ">
            ${otp}
          </div>

          <p>
            This OTP is valid for
            <strong>5 minutes</strong>.
          </p>

          <p>
            If you did not request this login code,
            you can safely ignore this email.
          </p>

          <hr style="margin: 24px 0;" />

          <p style="
            font-size: 12px;
            color: #6b7280;
          ">
            This is an automated message from BhoomiSetu.
          </p>
        </div>
      `,
    });

    return successResponse(
      res,
      {
        expiresIn: 300,
        delivery: "email",
      },
      "OTP sent successfully to your email"
    );
  } catch (error: any) {
    console.error(
      "Existing account OTP request error:",
      error
    );

    return errorResponse(
      res,
      "Failed to send OTP",
      500,
      error.message
    );
  }
});

/* =========================================================
   EXISTING ACCOUNT - VERIFY OTP
   POST /api/v1/auth/verify-otp

   Existing account -> OTP login
   ========================================================= */

router.post("/verify-otp", async (req, res) => {
  try {
    const parseResult = otpVerifySchema.safeParse(req.body);

    if (!parseResult.success) {
      return errorResponse(
        res,
        "Invalid email or OTP",
        400,
        parseResult.error.format()
      );
    }

    const identifier = normalizeIdentifier(
      parseResult.data.identifier
    );

    const otp = parseResult.data.otp;

    /*
     * Existing user must exist
     */
    const user = await prisma.user.findUnique({
      where: {
        email: identifier,
      },
    });

    if (!user || !user.active) {
      return errorResponse(
        res,
        "No active BhoomiSetu account found with this email",
        404
      );
    }

    /*
     * Find latest unused OTP
     */
    const otpRecord =
      await prisma.otpVerification.findFirst({
        where: {
          identifier,
          used: false,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

    if (!otpRecord) {
      return errorResponse(
        res,
        "OTP not found. Please request a new OTP.",
        400
      );
    }

    /*
     * Check expiry
     */
    if (
      otpRecord.expiresAt.getTime() <
      Date.now()
    ) {
      await prisma.otpVerification.update({
        where: {
          id: otpRecord.id,
        },
        data: {
          used: true,
        },
      });

      return errorResponse(
        res,
        "OTP has expired. Please request a new OTP.",
        400
      );
    }

    /*
     * Check attempt limit
     */
    if (otpRecord.attempts >= 5) {
      await prisma.otpVerification.update({
        where: {
          id: otpRecord.id,
        },
        data: {
          used: true,
        },
      });

      return errorResponse(
        res,
        "Too many incorrect attempts. Please request a new OTP.",
        429
      );
    }

    /*
     * Compare OTP hash
     */
    const submittedOtpHash = hashOtp(otp);

    if (
      submittedOtpHash !==
      otpRecord.otpHash
    ) {
      const updatedAttempts =
        otpRecord.attempts + 1;

      await prisma.otpVerification.update({
        where: {
          id: otpRecord.id,
        },
        data: {
          attempts: updatedAttempts,
          used: updatedAttempts >= 5,
        },
      });

      return errorResponse(
        res,
        `Incorrect OTP. ${Math.max(
          0,
          5 - updatedAttempts
        )} attempt(s) remaining.`,
        401
      );
    }

    /*
     * OTP successfully used
     */
    await prisma.otpVerification.update({
      where: {
        id: otpRecord.id,
      },
      data: {
        used: true,
      },
    });

    /*
     * Generate login token
     */
    const token = generateToken(user);

    /*
     * Audit
     */
    await recordAuditLog({
      userId: user.id,
      userName: user.fullName,
      userRole: user.role,
      action: "LOGIN",
      entity: "User",
      entityId: user.id,
      details: {
        role: user.role,
        state: user.state,
        district: user.district,
        method: "EMAIL_OTP",
      },
      req,
    });

    return successResponse(
      res,
      {
        token,
        user: sanitizeUser(user),
      },
      "OTP verified successfully"
    );
  } catch (error: any) {
    console.error(
      "OTP verification error:",
      error
    );

    return errorResponse(
      res,
      "OTP verification failed",
      500,
      error.message
    );
  }
});

/* =========================================================
   NEW ACCOUNT - REQUEST REGISTRATION OTP
   POST /api/v1/auth/register/request-otp

   New email -> OTP -> account creation
   ========================================================= */

router.post(
  "/register/request-otp",
  async (req, res) => {
    try {
      const parseResult =
        registerOtpRequestSchema.safeParse(
          req.body
        );

      if (!parseResult.success) {
        return errorResponse(
          res,
          "Please enter a valid email address",
          400,
          parseResult.error.format()
        );
      }

      const email = normalizeIdentifier(
        parseResult.data.email
      );

      /*
       * Check whether account already exists
       */
      const existingUser =
        await prisma.user.findUnique({
          where: {
            email,
          },
        });

      if (existingUser) {
        if (!existingUser.active) {
          return errorResponse(
            res,
            "This account is currently inactive. Please contact the administrator.",
            403
          );
        }

        return errorResponse(
          res,
          "An account with this email already exists. Please login instead.",
          409
        );
      }

      /*
       * Delete previous registration OTP
       */
      await prisma.otpVerification.deleteMany({
        where: {
          identifier: email,
          used: false,
        },
      });

      /*
       * Generate OTP
       */
      const otp = generateOtp();
      const otpHash = hashOtp(otp);

      const expiresAt = new Date(
        Date.now() + 5 * 60 * 1000
      );

      await prisma.otpVerification.create({
        data: {
          identifier: email,
          otpHash,
          expiresAt,
          attempts: 0,
          used: false,
        },
      });

      /*
       * DEMO / DEVELOPMENT MODE
       */
      if (!mailTransporter) {
        console.log("");
        console.log("==============================================");
        console.log("🆕 BhoomiSetu NEW ACCOUNT OTP");
        console.log(`📧 Email: ${email}`);
        console.log(`🔢 OTP: ${otp}`);
        console.log("⏱️ Valid for: 5 minutes");
        console.log("==============================================");
        console.log("");

        return successResponse(
          res,
          {
            expiresIn: 300,
            demoOtp: otp,
            delivery: "console",
          },
          "Registration OTP generated successfully"
        );
      }

      /*
       * Send registration email
       */
      await mailTransporter.sendMail({
        from: OTP_EMAIL_FROM,
        to: email,
        subject:
          "BhoomiSetu Account Verification OTP",
        text: `
You requested to create a new BhoomiSetu account.

Your verification OTP is ${otp}.

This OTP is valid for 5 minutes.

Do not share this OTP with anyone.
        `.trim(),
        html: `
          <div style="
            font-family: Arial, sans-serif;
            max-width: 600px;
            margin: auto;
            padding: 24px;
          ">
            <h2>BhoomiSetu</h2>

            <p>
              National Land Acquisition & Management System
            </p>

            <p>
              You requested to create a new
              BhoomiSetu account.
            </p>

            <p>
              Use the following OTP to verify
              your email address:
            </p>

            <div style="
              font-size: 32px;
              font-weight: bold;
              letter-spacing: 8px;
              padding: 18px;
              text-align: center;
              background: #f3f4f6;
              border-radius: 10px;
              margin: 20px 0;
            ">
              ${otp}
            </div>

            <p>
              This OTP is valid for
              <strong>5 minutes</strong>.
            </p>

            <p>
              If you did not request an account,
              you can safely ignore this email.
            </p>

            <hr style="margin: 24px 0;" />

            <p style="
              font-size: 12px;
              color: #6b7280;
            ">
              This is an automated message from BhoomiSetu.
            </p>
          </div>
        `,
      });

      return successResponse(
        res,
        {
          expiresIn: 300,
          delivery: "email",
        },
        "Verification OTP sent successfully to your email"
      );
    } catch (error: any) {
      console.error(
        "Registration OTP request error:",
        error
      );

      return errorResponse(
        res,
        "Failed to send registration OTP",
        500,
        error.message
      );
    }
  }
);

/* =========================================================
   NEW ACCOUNT - VERIFY OTP + CREATE ACCOUNT
   POST /api/v1/auth/register/verify-otp

   OTP verified -> create user -> automatic login
   ========================================================= */

router.post(
  "/register/verify-otp",
  async (req, res) => {
    try {
      const parseResult =
        registerOtpVerifySchema.safeParse(
          req.body
        );

      if (!parseResult.success) {
        return errorResponse(
          res,
          "Invalid registration details",
          400,
          parseResult.error.format()
        );
      }

      const {
        email,
        otp,
        fullName,
        password,
        designation,
        department,
        state,
        district,
        phone,
      } = parseResult.data;

      const identifier =
        normalizeIdentifier(email);

      /*
       * Make sure account still doesn't exist
       */
      const existingUser =
        await prisma.user.findUnique({
          where: {
            email: identifier,
          },
        });

      if (existingUser) {
        return errorResponse(
          res,
          "An account with this email already exists. Please login instead.",
          409
        );
      }

      /*
       * Find latest unused OTP
       */
      const otpRecord =
        await prisma.otpVerification.findFirst({
          where: {
            identifier,
            used: false,
          },
          orderBy: {
            createdAt: "desc",
          },
        });

      if (!otpRecord) {
        return errorResponse(
          res,
          "OTP not found. Please request a new OTP.",
          400
        );
      }

      /*
       * Check expiry
       */
      if (
        otpRecord.expiresAt.getTime() <
        Date.now()
      ) {
        await prisma.otpVerification.update({
          where: {
            id: otpRecord.id,
          },
          data: {
            used: true,
          },
        });

        return errorResponse(
          res,
          "OTP has expired. Please request a new OTP.",
          400
        );
      }

      /*
       * Check attempt limit
       */
      if (otpRecord.attempts >= 5) {
        await prisma.otpVerification.update({
          where: {
            id: otpRecord.id,
          },
          data: {
            used: true,
          },
        });

        return errorResponse(
          res,
          "Too many incorrect attempts. Please request a new OTP.",
          429
        );
      }

      /*
       * Compare OTP
       */
      const submittedOtpHash =
        hashOtp(otp);

      if (
        submittedOtpHash !==
        otpRecord.otpHash
      ) {
        const updatedAttempts =
          otpRecord.attempts + 1;

        await prisma.otpVerification.update({
          where: {
            id: otpRecord.id,
          },
          data: {
            attempts: updatedAttempts,
            used: updatedAttempts >= 5,
          },
        });

        return errorResponse(
          res,
          `Incorrect OTP. ${Math.max(
            0,
            5 - updatedAttempts
          )} attempt(s) remaining.`,
          401
        );
      }

      /*
       * Mark OTP used
       */
      await prisma.otpVerification.update({
        where: {
          id: otpRecord.id,
        },
        data: {
          used: true,
        },
      });

      /*
       * Hash password
       */
      const passwordHash =
        await bcrypt.hash(
          password,
          10
        );

      /*
       * Create account
       *
       * IMPORTANT:
       * Self-registration ALWAYS gets VIEWER.
       *
       * User cannot create their own
       * SUPER_ADMIN / PIA / government role.
       */
      const user =
        await prisma.user.create({
          data: {
            email: identifier,
            passwordHash,
            fullName,
            designation,
            department,
            role: "VIEWER",
            state: state || null,
            district: district || null,
            phone: phone || null,
          },
        });

      /*
       * Audit registration
       */
      await recordAuditLog({
        userId: user.id,
        userName: user.fullName,
        userRole: user.role,
        action: "REGISTER",
        entity: "User",
        entityId: user.id,
        details: {
          method: "EMAIL_OTP",
          role: user.role,
        },
        req,
      });

      /*
       * Automatic login
       */
      const token =
        generateToken(user);

      return successResponse(
        res,
        {
          token,
          user: sanitizeUser(user),
        },
        "Account created and login successful",
        201
      );
    } catch (error: any) {
      console.error(
        "Registration OTP verification error:",
        error
      );

      return errorResponse(
        res,
        "Account creation failed",
        500,
        error.message
      );
    }
  }
);

/* =========================================================
   STANDARD REGISTER
   POST /api/v1/auth/register

   Existing registration route preserved.
   ========================================================= */

router.post("/register", async (req, res) => {
  try {
    const parseResult =
      registerSchema.safeParse(req.body);

    if (!parseResult.success) {
      return errorResponse(
        res,
        "Validation failed",
        400,
        parseResult.error.format()
      );
    }

    const data = parseResult.data;

    const normalizedEmail =
      normalizeIdentifier(data.email);

    const existing =
      await prisma.user.findUnique({
        where: {
          email: normalizedEmail,
        },
      });

    if (existing) {
      return errorResponse(
        res,
        "User with this email already exists",
        409
      );
    }

    const passwordHash =
      await bcrypt.hash(
        data.password,
        10
      );

    const user =
      await prisma.user.create({
        data: {
          email: normalizedEmail,
          passwordHash,
          fullName: data.fullName,
          designation: data.designation,
          department: data.department,
          role: data.role,
          state: data.state || null,
          district: data.district || null,
          phone: data.phone || null,
        },
      });

    await recordAuditLog({
      userId: user.id,
      userName: user.fullName,
      userRole: user.role,
      action: "REGISTER",
      entity: "User",
      entityId: user.id,
      details: {
        role: user.role,
        method: "PASSWORD",
      },
      req,
    });

    const token =
      generateToken(user);

    return successResponse(
      res,
      {
        token,
        user: sanitizeUser(user),
      },
      "Account registered successfully",
      201
    );
  } catch (error: any) {
    console.error(
      "Registration error:",
      error
    );

    return errorResponse(
      res,
      "Registration failed",
      500,
      error.message
    );
  }
});

/* =========================================================
   GET CURRENT USER PROFILE
   GET /api/v1/auth/me
   ========================================================= */

router.get(
  "/me",
  authenticateToken,
  async (
    req: AuthenticatedRequest,
    res
  ) => {
    return successResponse(
      res,
      req.user
    );
  }
);

/* =========================================================
   CHANGE PASSWORD
   POST /api/v1/auth/change-password
   ========================================================= */

router.post(
  "/change-password",
  authenticateToken,
  async (
    req: AuthenticatedRequest,
    res
  ) => {
    try {
      const {
        oldPassword,
        newPassword,
      } = req.body;

      if (
        !oldPassword ||
        !newPassword ||
        newPassword.length < 6
      ) {
        return errorResponse(
          res,
          "New password must be at least 6 characters long",
          400
        );
      }

      const user =
        await prisma.user.findUnique({
          where: {
            id: req.user!.id,
          },
        });

      if (!user) {
        return errorResponse(
          res,
          "User not found",
          404
        );
      }

      const isValid =
        await bcrypt.compare(
          oldPassword,
          user.passwordHash
        );

      if (!isValid) {
        return errorResponse(
          res,
          "Incorrect current password",
          400
        );
      }

      const newHash =
        await bcrypt.hash(
          newPassword,
          10
        );

      await prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          passwordHash: newHash,
        },
      });

      await recordAuditLog({
        userId: user.id,
        userName: user.fullName,
        userRole: user.role,
        action: "CHANGE_PASSWORD",
        entity: "User",
        entityId: user.id,
        req,
      });

      return successResponse(
        res,
        null,
        "Password updated successfully"
      );
    } catch (error: any) {
      return errorResponse(
        res,
        "Failed to update password",
        500,
        error.message
      );
    }
  }
);

/* =========================================================
   LIST USERS - SUPER ADMIN ONLY
   GET /api/v1/auth/users
   ========================================================= */

router.get(
  "/users",
  authenticateToken,
  requireRole("SUPER_ADMIN"),
  async (req, res) => {
    try {
      const users =
        await prisma.user.findMany({
          select: {
            id: true,
            email: true,
            fullName: true,
            designation: true,
            department: true,
            role: true,
            state: true,
            district: true,
            phone: true,
            active: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        });

      return successResponse(
        res,
        users
      );
    } catch (error: any) {
      return errorResponse(
        res,
        "Failed to fetch users",
        500,
        error.message
      );
    }
  }
);

/* =========================================================
   LOGOUT
   POST /api/v1/auth/logout
   ========================================================= */

router.post(
  "/logout",
  authenticateToken,
  async (
    req: AuthenticatedRequest,
    res
  ) => {
    await recordAuditLog({
      userId: req.user?.id,
      userName: req.user?.fullName,
      userRole: req.user?.role,
      action: "LOGOUT",
      entity: "User",
      entityId: req.user?.id,
      req,
    });

    return successResponse(
      res,
      null,
      "Logged out successfully"
    );
  }
);

/* =========================================================
   EXPORT ROUTER
   ========================================================= */

export default router;