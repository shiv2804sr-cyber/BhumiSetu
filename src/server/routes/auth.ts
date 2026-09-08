import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import prisma from "../prisma";
import { generateToken, authenticateToken, requireRole, AuthenticatedRequest } from "../middleware/auth";
import { recordAuditLog } from "../middleware/audit";
import { successResponse, errorResponse } from "../utils/response";

const router = Router();

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
  role: z.enum([
    "SUPER_ADMIN",
    "CENTRAL_MINISTRY",
    "STATE_GOVERNMENT",
    "DISTRICT_AUTHORITY",
    "PIA",
    "FIELD_OFFICER",
    "VIEWER",
  ]).default("VIEWER"),
  state: z.string().optional(),
  district: z.string().optional(),
  phone: z.string().optional(),
});

// Login
router.post("/login", async (req, res) => {
  try {
    const parseResult = loginSchema.safeParse(req.body);
    if (!parseResult.success) {
      return errorResponse(res, "Invalid input data", 400, parseResult.error.format());
    }

    const { email, password } = parseResult.data;

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user || !user.active) {
      return errorResponse(res, "Invalid email or password", 401);
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      await recordAuditLog({
        userId: user.id,
        userName: user.fullName,
        userRole: user.role,
        action: "LOGIN_FAILED",
        entity: "User",
        entityId: user.id,
        details: { reason: "Bad password" },
        req,
      });
      return errorResponse(res, "Invalid email or password", 401);
    }

    const token = generateToken(user);

    await recordAuditLog({
      userId: user.id,
      userName: user.fullName,
      userRole: user.role,
      action: "LOGIN",
      entity: "User",
      entityId: user.id,
      details: { role: user.role, state: user.state, district: user.district },
      req,
    });

    return successResponse(res, {
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        designation: user.designation,
        department: user.department,
        state: user.state,
        district: user.district,
        phone: user.phone,
      },
    }, "Authentication successful");
  } catch (error: any) {
    return errorResponse(res, "Login failed", 500, error.message);
  }
});

// Register (open for testing or restricted by admin in production)
router.post("/register", async (req, res) => {
  try {
    const parseResult = registerSchema.safeParse(req.body);
    if (!parseResult.success) {
      return errorResponse(res, "Validation failed", 400, parseResult.error.format());
    }

    const data = parseResult.data;
    const existing = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
    });

    if (existing) {
      return errorResponse(res, "User with this email already exists", 409);
    }

    const passwordHash = await bcrypt.hash(data.password, 10);

    const user = await prisma.user.create({
      data: {
        email: data.email.toLowerCase(),
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
      details: { role: user.role },
      req,
    });

    const token = generateToken(user);

    return successResponse(res, {
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        designation: user.designation,
        department: user.department,
        state: user.state,
        district: user.district,
      },
    }, "Account registered successfully", 201);
  } catch (error: any) {
    return errorResponse(res, "Registration failed", 500, error.message);
  }
});

// Get Current User Profile
router.get("/me", authenticateToken, async (req: AuthenticatedRequest, res) => {
  return successResponse(res, req.user);
});

// Change Password
router.post("/change-password", authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword || newPassword.length < 6) {
      return errorResponse(res, "New password must be at least 6 characters long", 400);
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
    });

    if (!user) {
      return errorResponse(res, "User not found", 404);
    }

    const isValid = await bcrypt.compare(oldPassword, user.passwordHash);
    if (!isValid) {
      return errorResponse(res, "Incorrect current password", 400);
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: newHash },
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

    return successResponse(res, null, "Password updated successfully");
  } catch (error: any) {
    return errorResponse(res, "Failed to update password", 500, error.message);
  }
});

// List Users (SUPER_ADMIN only)
router.get("/users", authenticateToken, requireRole("SUPER_ADMIN"), async (req, res) => {
  try {
    const users = await prisma.user.findMany({
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
      orderBy: { createdAt: "desc" },
    });

    return successResponse(res, users);
  } catch (error: any) {
    return errorResponse(res, "Failed to fetch users", 500, error.message);
  }
});

// Logout
router.post("/logout", authenticateToken, async (req: AuthenticatedRequest, res) => {
  await recordAuditLog({
    userId: req.user?.id,
    userName: req.user?.fullName,
    userRole: req.user?.role,
    action: "LOGOUT",
    entity: "User",
    entityId: req.user?.id,
    req,
  });

  return successResponse(res, null, "Logged out successfully");
});

export default router;
