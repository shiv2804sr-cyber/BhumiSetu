import { Router } from "express";
import prisma from "../prisma";
import { authenticateToken, requireRole } from "../middleware/auth";
import { successResponse, errorResponse, paginatedResponse } from "../utils/response";

const router = Router();

// GET all audit logs (restricted to SUPER_ADMIN)
router.get("/", authenticateToken, requireRole("SUPER_ADMIN"), async (req, res) => {
  try {
    const { entity, action, userId, page = "1", limit = "50" } = req.query;

    const where: any = {};
    if (entity) where.entity = String(entity);
    if (action) where.action = String(action);
    if (userId) where.userId = String(userId);

    const pageNum = parseInt(String(page), 10) || 1;
    const limitNum = parseInt(String(limit), 10) || 50;
    const skip = (pageNum - 1) * limitNum;

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { timestamp: "desc" },
      }),
      prisma.auditLog.count({ where }),
    ]);

    return paginatedResponse(res, logs, total, pageNum, limitNum);
  } catch (error: any) {
    return errorResponse(res, "Failed to retrieve audit logs", 500, error.message);
  }
});

export default router;
