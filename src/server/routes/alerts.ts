import { Router } from "express";
import prisma from "../prisma";
import { optionalAuth, authenticateToken, AuthenticatedRequest } from "../middleware/auth";
import { successResponse, errorResponse } from "../utils/response";

const router = Router();

// GET alerts
router.get("/", optionalAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { severity, unreadOnly, role } = req.query;
    const where: any = {};

    if (severity) where.severity = String(severity);
    if (unreadOnly === "true") where.isRead = false;
    if (role) where.targetRole = String(role);

    const alerts = await prisma.systemAlert.findMany({
      where,
      orderBy: { timestamp: "desc" },
    });

    const formatted = alerts.map((a) => ({
      id: a.id,
      type: a.type,
      message: a.message,
      projectId: a.projectId,
      projectName: a.projectName,
      timestamp: a.timestamp.toISOString(),
      severity: a.severity,
      isRead: a.isRead,
    }));

    return successResponse(res, formatted);
  } catch (error: any) {
    return errorResponse(res, "Failed to retrieve alerts", 500, error.message);
  }
});

// Mark alert as read
router.post("/:id/read", optionalAuth, async (req, res) => {
  try {
    const updated = await prisma.systemAlert.update({
      where: { id: req.params.id },
      data: { isRead: true },
    });

    return successResponse(res, updated, "Alert marked as read");
  } catch (error: any) {
    return errorResponse(res, "Failed to update alert", 500, error.message);
  }
});

export default router;
