import { Router } from "express";
import { z } from "zod";
import prisma from "../prisma";
import { authenticateToken, optionalAuth, requireRole, AuthenticatedRequest } from "../middleware/auth";
import { recordAuditLog } from "../middleware/audit";
import { successResponse, errorResponse, paginatedResponse } from "../utils/response";

const router = Router();

// Helper to compute predictive delay risk score based on category, state, area
function calculatePredictiveRisk(category: string, state: string, area: number): { level: "High" | "Medium" | "Low"; score: number; factors: string[] } {
  let score = 20;
  const factors: string[] = [];

  if (category === "Rail" || category === "Urban Development") {
    score += 25;
    factors.push(`Linear corridor alignment density in ${category}`);
  } else if (category === "Highway") {
    score += 15;
    factors.push("Standard NHAI/MoRTH linear alignment protocol");
  } else if (category === "Irrigation") {
    score += 20;
    factors.push("Multi-village command area compensation challenges");
  }

  if (area > 300) {
    score += 25;
    factors.push(`Large-scale land acquisition (>300 Ha: ${area.toFixed(1)} Ha)`);
  } else if (area > 100) {
    score += 10;
    factors.push(`Medium footprint land requirement (${area.toFixed(1)} Ha)`);
  } else {
    factors.push("Compact land footprint (<100 Ha)");
  }

  if (state === "Maharashtra" || state === "Uttar Pradesh") {
    score += 15;
    factors.push(`High density jurisdiction in ${state}`);
  } else {
    factors.push(`Normal statutory processing SLA in ${state}`);
  }

  score = Math.min(Math.max(score, 10), 95);
  const level: "High" | "Medium" | "Low" = score >= 65 ? "High" : score >= 35 ? "Medium" : "Low";

  return { level, score, factors };
}

// GET all projects with filtering
router.get("/", optionalAuth, async (req, res) => {
  try {
    const { state, district, ministry, category, status, search, page = "1", limit = "50" } = req.query;

    const where: any = {};

    if (state && state !== "All States") {
      where.state = String(state);
    }
    if (district && district !== "All Districts") {
      where.district = String(district);
    }
    if (ministry) {
      where.ministry = String(ministry);
    }
    if (category) {
      where.category = String(category);
    }
    if (status) {
      where.status = String(status);
    }
    if (search) {
      where.OR = [
        { projectName: { contains: String(search) } },
        { id: { contains: String(search) } },
        { district: { contains: String(search) } },
      ];
    }

    const pageNum = parseInt(String(page), 10) || 1;
    const limitNum = parseInt(String(limit), 10) || 50;
    const skip = (pageNum - 1) * limitNum;

    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: "desc" },
        include: {
          milestones: { orderBy: { stageNumber: "asc" } },
          _count: {
            select: { parcels: true, awards: true, documents: true, compensationRecords: true },
          },
        },
      }),
      prisma.project.count({ where }),
    ]);

    // Format for frontend compatibility
    const formatted = projects.map((p) => {
      let riskFactors: string[] = [];
      try {
        riskFactors = JSON.parse(p.riskFactors);
      } catch (e) {
        riskFactors = [];
      }

      return {
        id: p.id,
        projectName: p.projectName,
        ministry: p.ministry,
        category: p.category,
        state: p.state,
        district: p.district,
        description: p.description,
        status: p.status,
        dateSubmitted: p.dateSubmitted.toISOString().split("T")[0],
        areaRequired: p.estimatedArea,
        landProposed: p.landProposed,
        landNotified: p.landNotified,
        landAcquired: p.landAcquired,
        riskProfile: {
          level: p.riskLevel,
          score: p.riskScore,
          factors: riskFactors,
        },
        milestones: p.milestones,
        counts: p._count,
      };
    });

    return paginatedResponse(res, formatted, total, pageNum, limitNum);
  } catch (error: any) {
    return errorResponse(res, "Failed to fetch projects", 500, error.message);
  }
});

// GET single project by ID
router.get("/:id", optionalAuth, async (req, res) => {
  try {
    const project = await prisma.project.findUnique({
      where: { id: req.params.id },
      include: {
        milestones: { orderBy: { stageNumber: "asc" } },
        parcels: true,
        awards: true,
        compensationRecords: true,
        rnrRecords: true,
        documents: true,
        grievances: true,
        alerts: true,
        workflowActions: { orderBy: { timestamp: "desc" } },
      },
    });

    if (!project) {
      return errorResponse(res, "Project not found", 404);
    }

    let riskFactors: string[] = [];
    try {
      riskFactors = JSON.parse(project.riskFactors);
    } catch (e) {}

    return successResponse(res, {
      ...project,
      areaRequired: project.estimatedArea,
      riskProfile: {
        level: project.riskLevel,
        score: project.riskScore,
        factors: riskFactors,
      },
    });
  } catch (error: any) {
    return errorResponse(res, "Failed to fetch project", 500, error.message);
  }
});

const createProjectSchema = z.object({
  projectName: z.string().min(3),
  ministry: z.string().min(2),
  category: z.string().min(2),
  state: z.string().min(2),
  district: z.string().min(2),
  description: z.string().optional(),
  areaRequired: z.number().positive(),
  implementingAgency: z.string().optional(),
  responsibleAuthority: z.string().optional(),
});

// POST Create new Project Proposal
router.post("/", optionalAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const parseResult = createProjectSchema.safeParse(req.body);
    if (!parseResult.success) {
      return errorResponse(res, "Validation failed", 400, parseResult.error.format());
    }

    const data = parseResult.data;
    const count = await prisma.project.count();
    const newId = `PRJ-2026-${String(count + 1).padStart(3, "0")}`;

    const risk = calculatePredictiveRisk(data.category, data.state, data.areaRequired);

    const project = await prisma.project.create({
      data: {
        id: newId,
        projectName: data.projectName,
        ministry: data.ministry,
        category: data.category,
        state: data.state,
        district: data.district,
        description: data.description || `Land acquisition proposal for ${data.projectName}`,
        estimatedArea: data.areaRequired,
        landProposed: data.areaRequired,
        landNotified: 0,
        landAcquired: 0,
        status: "Submitted",
        riskLevel: risk.level,
        riskScore: risk.score,
        riskFactors: JSON.stringify(risk.factors),
        dateSubmitted: new Date(),
        responsibleAuthority: data.responsibleAuthority || `District LAO, ${data.district}`,
        implementingAgency: data.implementingAgency || data.ministry,
        milestones: {
          create: [
            { stageNumber: 1, name: "Section 11 Notification", status: "pending", remarks: "Pending initial scrutiny and gazette publication" },
            { stageNumber: 2, name: "Section 19 Declaration", status: "pending", remarks: "Preliminary SIA report required" },
            { stageNumber: 3, name: "Section 23 Award Declaration", status: "pending", remarks: "Inquiry under Sec 23" },
            { stageNumber: 4, name: "Direct Benefit Transfer (DBT)", status: "pending", remarks: "PFMS escrow disbursement" },
            { stageNumber: 5, name: "Section 38 Land Possession", status: "pending", remarks: "Physical possession of land" },
            { stageNumber: 6, name: "R&R Entitlements Settlement", status: "pending", remarks: "Statutory Rehabilitation" },
          ],
        },
      },
      include: {
        milestones: true,
      },
    });

    // Record workflow action
    await prisma.workflowAction.create({
      data: {
        projectId: project.id,
        stage: "Submission",
        action: "SUBMIT",
        performedById: req.user?.id || null,
        performedByName: req.user?.fullName || "Central Ministry Officer",
        userRole: req.user?.role || "CENTRAL_MINISTRY",
        previousStatus: "Draft",
        newStatus: "Submitted",
        comments: "Initial proposal submitted for digital scrutiny.",
      },
    });

    await recordAuditLog({
      userId: req.user?.id,
      userName: req.user?.fullName,
      userRole: req.user?.role,
      action: "CREATE",
      entity: "Project",
      entityId: project.id,
      details: { projectName: project.projectName, area: project.estimatedArea },
      req,
    });

    return successResponse(
      res,
      {
        ...project,
        areaRequired: project.estimatedArea,
        riskProfile: risk,
      },
      "Proposal submitted successfully",
      201
    );
  } catch (error: any) {
    return errorResponse(res, "Failed to create project proposal", 500, error.message);
  }
});

// Update Project status / Scrutiny action
router.post("/:id/workflow", authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { action, comments, newStatus } = req.body;
    const project = await prisma.project.findUnique({
      where: { id: req.params.id },
    });

    if (!project) {
      return errorResponse(res, "Project not found", 404);
    }

    const validTransitions: Record<string, string[]> = {
      SUBMIT: ["Submitted", "Under Scrutiny"],
      SCRUTINIZE: ["Under Scrutiny"],
      APPROVE: ["Approved", "Sec 11 Notification"],
      REJECT: ["Rejected"],
      NOTIFY: ["Sec 11 Notification", "Sec 19 Declaration"],
      AWARD: ["Award"],
      DISBURSE: ["Compensation"],
      POSSESS: ["Possession"],
      CLOSE: ["Completed"],
    };

    const targetStatus = newStatus || (action === "APPROVE" ? "Approved" : action === "REJECT" ? "Rejected" : "Under Scrutiny");

    const updated = await prisma.project.update({
      where: { id: project.id },
      data: { status: targetStatus },
    });

    await prisma.workflowAction.create({
      data: {
        projectId: project.id,
        stage: targetStatus,
        action: action || "STATUS_UPDATE",
        performedById: req.user!.id,
        performedByName: req.user!.fullName,
        userRole: req.user!.role,
        previousStatus: project.status,
        newStatus: targetStatus,
        comments: comments || `Status transitioned to ${targetStatus}`,
      },
    });

    await recordAuditLog({
      userId: req.user!.id,
      userName: req.user!.fullName,
      userRole: req.user!.role,
      action: action || "UPDATE_STATUS",
      entity: "Project",
      entityId: project.id,
      details: { previous: project.status, new: targetStatus, comments },
      req,
    });

    return successResponse(res, updated, `Project status updated to ${targetStatus}`);
  } catch (error: any) {
    return errorResponse(res, "Workflow update failed", 500, error.message);
  }
});

export default router;
