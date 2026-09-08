import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import prisma from "../prisma";
import { errorResponse } from "../utils/response";

export interface AuthenticatedUser {
  id: string;
  email: string;
  fullName: string;
  role: string;
  department: string;
  state?: string | null;
  district?: string | null;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}

const JWT_SECRET = process.env.JWT_SECRET || "bhumisetu-gov-secure-jwt-key-2026-production-ready";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "24h";

export function generateToken(user: { id: string; email: string; fullName: string; role: string; department: string; state?: string | null; district?: string | null }): string {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      department: user.department,
      state: user.state,
      district: user.district,
    },
    JWT_SECRET,
    { expiresIn: "24h" }
  );
}

export async function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.startsWith("Bearer ") ? authHeader.substring(7) : null;

  if (!token) {
    return errorResponse(res, "Authentication token required", 401);
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthenticatedUser;
    
    // Validate that user still exists and is active
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, email: true, fullName: true, role: true, department: true, state: true, district: true, active: true },
    });

    if (!user || !user.active) {
      return errorResponse(res, "User account is invalid or deactivated", 401);
    }

    req.user = user;
    next();
  } catch (err: any) {
    return errorResponse(res, "Invalid or expired session token", 401, err.message);
  }
}

export async function optionalAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.startsWith("Bearer ") ? authHeader.substring(7) : null;

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthenticatedUser;
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, email: true, fullName: true, role: true, department: true, state: true, district: true, active: true },
    });

    if (user && user.active) {
      req.user = user;
    }
  } catch (err) {
    // Ignore invalid token in optionalAuth
  }
  next();
}

export function requireRole(...allowedRoles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return errorResponse(res, "Authentication required", 401);
    }

    // SUPER_ADMIN always has full access
    if (req.user.role === "SUPER_ADMIN") {
      return next();
    }

    const hasRole = allowedRoles.some((role) => {
      // Direct match or normalized comparison
      return req.user?.role.toUpperCase() === role.toUpperCase();
    });

    if (!hasRole) {
      return errorResponse(
        res,
        `Access denied. Required role(s): ${allowedRoles.join(", ")}. Your role: ${req.user.role}`,
        403
      );
    }

    next();
  };
}
