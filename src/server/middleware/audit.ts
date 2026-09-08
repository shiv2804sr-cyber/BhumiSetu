import { Request } from "express";
import prisma from "../prisma";
import { AuthenticatedRequest } from "./auth";

interface AuditParams {
  userId?: string | null;
  userName?: string | null;
  userRole?: string | null;
  action: string;
  entity: string;
  entityId?: string | null;
  details?: any;
  req?: Request | AuthenticatedRequest;
}

export async function recordAuditLog({
  userId,
  userName,
  userRole,
  action,
  entity,
  entityId,
  details,
  req,
}: AuditParams) {
  try {
    const authReq = req as AuthenticatedRequest;
    const finalUserId = userId || authReq?.user?.id || null;
    const finalUserName = userName || authReq?.user?.fullName || "System";
    const finalUserRole = userRole || authReq?.user?.role || "SYSTEM";

    const ipAddress = (req?.headers["x-forwarded-for"] as string) || req?.socket?.remoteAddress || "127.0.0.1";
    const userAgent = (req?.headers["user-agent"] as string) || "Internal";

    await prisma.auditLog.create({
      data: {
        userId: finalUserId,
        userName: finalUserName,
        userRole: finalUserRole,
        action,
        entity,
        entityId: entityId ? String(entityId) : null,
        details: typeof details === "object" ? JSON.stringify(details) : details ? String(details) : null,
        ipAddress,
        userAgent,
      },
    });
  } catch (error) {
    console.error("Failed to write audit log:", error);
  }
}
