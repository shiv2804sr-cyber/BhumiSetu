import { Router } from "express";
import { z } from "zod";
import prisma from "../prisma";
import { optionalAuth, authenticateToken, AuthenticatedRequest } from "../middleware/auth";
import { recordAuditLog } from "../middleware/audit";
import { successResponse, errorResponse } from "../utils/response";

const router = Router();

// GET all grievances
router.get("/", optionalAuth, async (req, res) => {
  try {
    const { status, priority, trackingId, projectId, search } = req.query;

    const where: any = {};
    if (status) where.status = String(status);
    if (priority) where.priority = String(priority);
    if (trackingId) where.trackingId = { contains: String(trackingId) };
    if (projectId) where.projectId = String(projectId);
    if (search) {
      where.OR = [
        { trackingId: { contains: String(search) } },
        { description: { contains: String(search) } },
        { submittedBy: { contains: String(search) } },
      ];
    }

    const grievances = await prisma.grievanceRecord.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return successResponse(res, grievances);
  } catch (error: any) {
    return errorResponse(res, "Failed to retrieve grievances", 500, error.message);
  }
});

const grievanceSchema = z.object({
  projectId: z.string().optional(),
  category: z.string().min(2),
  description: z.string().min(5),
  submittedBy: z.string().min(2),
  contactNumber: z.string().optional(),
  priority: z.enum(["High", "Medium", "Low"]).default("Medium"),
  stateCode: z.string().default("IN"),
});

// POST Submit Grievance
router.post("/", optionalAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const parseResult = grievanceSchema.safeParse(req.body);
    if (!parseResult.success) {
      return errorResponse(res, "Validation failed", 400, parseResult.error.format());
    }

    const data = parseResult.data;
    const trackingId = `G-2026-${data.stateCode.toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const todayStr = new Date().toISOString().split("T")[0];

    const grievance = await prisma.grievanceRecord.create({
      data: {
        trackingId,
        projectId: data.projectId || null,
        category: data.category,
        description: data.description,
        submittedBy: data.submittedBy,
        contactNumber: data.contactNumber || null,
        submittedDate: todayStr,
        status: "Open",
        assignedTo: "District LAO",
        priority: data.priority,
      },
    });

    await recordAuditLog({
      userId: req.user?.id,
      userName: req.user?.fullName || data.submittedBy,
      userRole: req.user?.role || "CITIZEN",
      action: "SUBMIT_GRIEVANCE",
      entity: "GrievanceRecord",
      entityId: grievance.id,
      details: { trackingId, category: data.category },
      req,
    });

    return successResponse(res, grievance, "Grievance registered successfully", 201);
  } catch (error: any) {
    return errorResponse(res, "Failed to register grievance", 500, error.message);
  }
});

// PUT Update Grievance Status
router.put("/:id/status", authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { status, resolutionNotes } = req.body;
    if (!status || !["Open", "In Progress", "Resolved"].includes(status)) {
      return errorResponse(res, "Invalid status. Must be Open, In Progress, or Resolved", 400);
    }

    const data: any = { status };
    if (resolutionNotes) data.resolutionNotes = resolutionNotes;
    if (status === "Resolved") {
      data.resolvedDate = new Date().toISOString().split("T")[0];
    }

    const updated = await prisma.grievanceRecord.update({
      where: { id: req.params.id },
      data,
    });

    await recordAuditLog({
      userId: req.user!.id,
      userName: req.user!.fullName,
      userRole: req.user!.role,
      action: "UPDATE_GRIEVANCE_STATUS",
      entity: "GrievanceRecord",
      entityId: updated.id,
      details: { newStatus: status, resolutionNotes },
      req,
    });

    return successResponse(res, updated, `Grievance status updated to ${status}`);
  } catch (error: any) {
    return errorResponse(res, "Failed to update grievance", 500, error.message);
  }
});

export default router;
