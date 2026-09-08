import { Router } from "express";
import { z } from "zod";
import prisma from "../prisma";
import { optionalAuth, authenticateToken, AuthenticatedRequest } from "../middleware/auth";
import { recordAuditLog } from "../middleware/audit";
import { successResponse, errorResponse } from "../utils/response";

const router = Router();

// GET all R&R records with filtering
router.get("/", optionalAuth, async (req, res) => {
  try {
    const { projectId, status, state, district } = req.query;

    const where: any = {};
    if (projectId) where.projectId = String(projectId);
    if (status) where.overallStatus = String(status);
    if (state && state !== "All States") {
      where.project = { state: String(state) };
    }
    if (district && district !== "All Districts") {
      where.project = { ...where.project, district: String(district) };
    }

    const records = await prisma.rnRRecord.findMany({
      where,
      include: {
        project: { select: { projectName: true, state: true, district: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    // Format for frontend compatibility
    const formatted = records.map((r) => ({
      id: r.id,
      ulpin: r.ulpin,
      familyHead: r.familyHead,
      category: r.category,
      displacementStatus: r.displacementStatus,
      entitlements: {
        housing: r.housingEntitlement,
        employment: r.employmentEntitlement,
        annuity: r.annuityEntitlement,
      },
      cashGrant: r.cashGrant,
      resettlementSite: r.resettlementSite,
      overallStatus: r.overallStatus,
      projectId: r.projectId,
      projectName: r.project?.projectName,
    }));

    return successResponse(res, formatted);
  } catch (error: any) {
    return errorResponse(res, "Failed to retrieve R&R records", 500, error.message);
  }
});

const rnrSchema = z.object({
  ulpin: z.string(),
  projectId: z.string(),
  parcelId: z.string().optional(),
  familyHead: z.string(),
  category: z.enum(["Owner", "Tenant", "Agricultural Labourer"]),
  displacementStatus: z.enum(["Displaced", "Affected Not Displaced"]),
  housing: z.boolean().default(false),
  employment: z.boolean().default(false),
  annuity: z.boolean().default(false),
  cashGrant: z.number().default(0),
  resettlementSite: z.string().optional(),
});

// POST Create new R&R record
router.post("/", authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const parseResult = rnrSchema.safeParse(req.body);
    if (!parseResult.success) {
      return errorResponse(res, "Validation failed", 400, parseResult.error.format());
    }

    const data = parseResult.data;
    const count = await prisma.rnRRecord.count();
    const newId = `RNR-${String(count + 1).padStart(3, "0")}`;

    const record = await prisma.rnRRecord.create({
      data: {
        id: newId,
        ulpin: data.ulpin,
        projectId: data.projectId,
        parcelId: data.parcelId || null,
        familyHead: data.familyHead,
        category: data.category,
        displacementStatus: data.displacementStatus,
        housingEntitlement: data.housing,
        employmentEntitlement: data.employment,
        annuityEntitlement: data.annuity,
        cashGrant: data.cashGrant,
        resettlementSite: data.resettlementSite || null,
        overallStatus: "Pending",
      },
    });

    await recordAuditLog({
      userId: req.user!.id,
      userName: req.user!.fullName,
      userRole: req.user!.role,
      action: "REGISTER_RNR",
      entity: "RnRRecord",
      entityId: record.id,
      details: { familyHead: record.familyHead, displacementStatus: record.displacementStatus },
      req,
    });

    return successResponse(res, record, "R&R record created successfully", 201);
  } catch (error: any) {
    return errorResponse(res, "Failed to create R&R record", 500, error.message);
  }
});

// PUT Update R&R settlement status
router.put("/:id/status", authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { status } = req.body;
    if (!status || !["Pending", "In Progress", "Settled"].includes(status)) {
      return errorResponse(res, "Invalid status. Must be Pending, In Progress, or Settled", 400);
    }

    const updated = await prisma.rnRRecord.update({
      where: { id: req.params.id },
      data: { overallStatus: status },
    });

    await recordAuditLog({
      userId: req.user!.id,
      userName: req.user!.fullName,
      userRole: req.user!.role,
      action: "UPDATE_RNR_STATUS",
      entity: "RnRRecord",
      entityId: updated.id,
      details: { newStatus: status },
      req,
    });

    return successResponse(res, updated, `R&R status updated to ${status}`);
  } catch (error: any) {
    return errorResponse(res, "Failed to update R&R record", 500, error.message);
  }
});

export default router;
