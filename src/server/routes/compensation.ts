import { Router } from "express";
import { z } from "zod";
import prisma from "../prisma";
import { optionalAuth, authenticateToken, requireRole, AuthenticatedRequest } from "../middleware/auth";
import { recordAuditLog } from "../middleware/audit";
import { successResponse, errorResponse } from "../utils/response";

const router = Router();

// GET all compensation records with optional filters
router.get("/", optionalAuth, async (req, res) => {
  try {
    const { projectId, status, state, district } = req.query;

    const where: any = {};
    if (projectId) where.projectId = String(projectId);
    if (status) where.status = String(status);
    if (state && state !== "All States") {
      where.project = { state: String(state) };
    }
    if (district && district !== "All Districts") {
      where.project = { ...where.project, district: String(district) };
    }

    const records = await prisma.compensationRecord.findMany({
      where,
      include: {
        project: { select: { projectName: true, state: true, district: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    // Match existing frontend structure
    const formatted = records.map((r) => ({
      id: r.id,
      ulpin: r.ulpin,
      ownerName: r.ownerName,
      marketValue: r.marketValue,
      solatium: r.solatium,
      totalAssessed: r.totalAssessed,
      amountDisbursed: r.amountDisbursed,
      disbursementDate: r.disbursementDate,
      status: r.status,
      projectId: r.projectId,
      projectName: r.project?.projectName,
    }));

    return successResponse(res, formatted);
  } catch (error: any) {
    return errorResponse(res, "Failed to retrieve compensation records", 500, error.message);
  }
});

// GET single compensation record
router.get("/:id", async (req, res) => {
  try {
    const record = await prisma.compensationRecord.findUnique({
      where: { id: req.params.id },
      include: { project: true, parcel: true },
    });

    if (!record) {
      return errorResponse(res, "Compensation record not found", 404);
    }

    return successResponse(res, record);
  } catch (error: any) {
    return errorResponse(res, "Failed to retrieve compensation record", 500, error.message);
  }
});

const assessmentSchema = z.object({
  ulpin: z.string(),
  projectId: z.string(),
  parcelId: z.string().optional(),
  ownerName: z.string(),
  bankAccountMasked: z.string().optional(),
  ifscCode: z.string().optional(),
  marketValue: z.number().positive(),
  solatiumMultiplier: z.number().default(1.0), // 100% statutory solatium under RFCTLARR Act 2013
});

// POST Create new compensation assessment
router.post("/", authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const parseResult = assessmentSchema.safeParse(req.body);
    if (!parseResult.success) {
      return errorResponse(res, "Validation failed", 400, parseResult.error.format());
    }

    const data = parseResult.data;
    const solatium = data.marketValue * data.solatiumMultiplier;
    const totalAssessed = data.marketValue + solatium;

    const count = await prisma.compensationRecord.count();
    const newId = `COMP-${100 + count + 1}`;

    const record = await prisma.compensationRecord.create({
      data: {
        id: newId,
        ulpin: data.ulpin,
        projectId: data.projectId,
        parcelId: data.parcelId || null,
        ownerName: data.ownerName,
        bankAccountMasked: data.bankAccountMasked || "SBIN******0000",
        ifscCode: data.ifscCode || "SBIN0001234",
        marketValue: data.marketValue,
        solatium,
        totalAssessed,
        amountDisbursed: 0,
        status: "Pending",
      },
    });

    await recordAuditLog({
      userId: req.user!.id,
      userName: req.user!.fullName,
      userRole: req.user!.role,
      action: "ASSESS_COMPENSATION",
      entity: "CompensationRecord",
      entityId: record.id,
      details: { totalAssessed, ulpin: record.ulpin },
      req,
    });

    return successResponse(res, record, "Compensation assessed successfully", 201);
  } catch (error: any) {
    return errorResponse(res, "Failed to create compensation assessment", 500, error.message);
  }
});

// POST Trigger PFMS Direct Benefit Transfer (DBT) Disbursement
router.post("/:id/disburse", authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const record = await prisma.compensationRecord.findUnique({
      where: { id: req.params.id },
    });

    if (!record) {
      return errorResponse(res, "Compensation record not found", 404);
    }

    if (record.status === "Disbursed") {
      return errorResponse(res, "Compensation has already been disbursed", 400);
    }

    const todayStr = new Date().toISOString().split("T")[0];
    const paymentRef = `PFMS-2026-DBT-${Math.floor(100000 + Math.random() * 900000)}`;

    const updated = await prisma.compensationRecord.update({
      where: { id: record.id },
      data: {
        amountDisbursed: record.totalAssessed,
        disbursementDate: todayStr,
        status: "Disbursed",
        paymentRef,
      },
    });

    await recordAuditLog({
      userId: req.user!.id,
      userName: req.user!.fullName,
      userRole: req.user!.role,
      action: "DISBURSE_COMPENSATION",
      entity: "CompensationRecord",
      entityId: record.id,
      details: { amount: record.totalAssessed, paymentRef },
      req,
    });

    return successResponse(res, updated, `DBT Disbursement of ₹${record.totalAssessed} processed with Ref: ${paymentRef}`);
  } catch (error: any) {
    return errorResponse(res, "Disbursement failed", 500, error.message);
  }
});

export default router;
