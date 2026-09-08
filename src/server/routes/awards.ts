import { Router } from "express";
import { z } from "zod";
import prisma from "../prisma";
import { optionalAuth, authenticateToken, AuthenticatedRequest } from "../middleware/auth";
import { recordAuditLog } from "../middleware/audit";
import { successResponse, errorResponse } from "../utils/response";

const router = Router();

// GET all awards
router.get("/", optionalAuth, async (req, res) => {
  try {
    const { projectId, status } = req.query;
    const where: any = {};
    if (projectId) where.projectId = String(projectId);
    if (status) where.status = String(status);

    const awards = await prisma.award.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return successResponse(res, awards);
  } catch (error: any) {
    return errorResponse(res, "Failed to retrieve awards", 500, error.message);
  }
});

// GET single award
router.get("/:id", async (req, res) => {
  try {
    const award = await prisma.award.findUnique({
      where: { id: req.params.id },
      include: { project: true },
    });

    if (!award) {
      return errorResponse(res, "Award not found", 404);
    }

    return successResponse(res, award);
  } catch (error: any) {
    return errorResponse(res, "Failed to retrieve award", 500, error.message);
  }
});

const awardSchema = z.object({
  projectId: z.string(),
  projectName: z.string(),
  totalAmount: z.number().positive(),
  beneficiariesCount: z.number().int().positive(),
  issuingAuthority: z.string(),
  date: z.string().optional(),
});

// POST Create new Award Draft
router.post("/", authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const parseResult = awardSchema.safeParse(req.body);
    if (!parseResult.success) {
      return errorResponse(res, "Validation failed", 400, parseResult.error.format());
    }

    const data = parseResult.data;
    const count = await prisma.award.count();
    const newId = `AWD-2026-${String(count + 1).padStart(3, "0")}`;
    const dateStr = data.date || new Date().toISOString().split("T")[0];

    const award = await prisma.award.create({
      data: {
        id: newId,
        projectId: data.projectId,
        projectName: data.projectName,
        totalAmount: data.totalAmount,
        beneficiariesCount: data.beneficiariesCount,
        issuingAuthority: data.issuingAuthority,
        date: dateStr,
        status: "Draft",
      },
    });

    await recordAuditLog({
      userId: req.user!.id,
      userName: req.user!.fullName,
      userRole: req.user!.role,
      action: "DRAFT_AWARD",
      entity: "Award",
      entityId: award.id,
      details: { totalAmount: award.totalAmount, beneficiaries: award.beneficiariesCount },
      req,
    });

    return successResponse(res, award, "Award draft created successfully", 201);
  } catch (error: any) {
    return errorResponse(res, "Failed to create award", 500, error.message);
  }
});

// POST Publish Award
router.post("/:id/publish", authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const award = await prisma.award.findUnique({
      where: { id: req.params.id },
    });

    if (!award) {
      return errorResponse(res, "Award not found", 404);
    }

    const updated = await prisma.award.update({
      where: { id: award.id },
      data: { status: "Published" },
    });

    await recordAuditLog({
      userId: req.user!.id,
      userName: req.user!.fullName,
      userRole: req.user!.role,
      action: "PUBLISH_AWARD",
      entity: "Award",
      entityId: award.id,
      req,
    });

    return successResponse(res, updated, "Award published successfully under RFCTLARR Act");
  } catch (error: any) {
    return errorResponse(res, "Failed to publish award", 500, error.message);
  }
});

export default router;
