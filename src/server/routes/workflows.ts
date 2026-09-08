import { Router } from "express";
import { z } from "zod";
import prisma from "../prisma";
import { authenticateToken, requireRole, AuthenticatedRequest } from "../middleware/auth";
import { recordAuditLog } from "../middleware/audit";
import { successResponse, errorResponse } from "../utils/response";

const router = Router();

// Standard RFCTLARR Act 2013 Workflow Stages
export const WORKFLOW_STAGES = [
  "Proposal Draft",
  "Submitted",
  "Digital Scrutiny",
  "Approved",
  "Section 11 Notification",
  "Section 19 Declaration",
  "Section 23 Award",
  "Compensation Assessment",
  "Compensation Disbursement",
  "Section 38 Possession",
  "R&R Settlement",
  "Completed",
  "Rejected",
];

// GET workflow history for a project
router.get("/:projectId", async (req, res) => {
  try {
    const { projectId } = req.params;

    const [project, actions] = await Promise.all([
      prisma.project.findUnique({
        where: { id: projectId },
        select: { id: true, projectName: true, status: true },
      }),
      prisma.workflowAction.findMany({
        where: { projectId },
        orderBy: { timestamp: "asc" },
      }),
    ]);

    if (!project) {
      return errorResponse(res, "Project not found", 404);
    }

    return successResponse(res, {
      project,
      currentStatus: project.status,
      history: actions,
      stages: WORKFLOW_STAGES,
    });
  } catch (error: any) {
    return errorResponse(res, "Failed to retrieve workflow history", 500, error.message);
  }
});

const transitionSchema = z.object({
  action: z.enum([
    "SUBMIT",
    "SCRUTINIZE",
    "APPROVE",
    "REJECT",
    "NOTIFY_SEC11",
    "DECLARE_SEC19",
    "DECLARE_AWARD",
    "DISBURSE_COMPENSATION",
    "TAKE_POSSESSION",
    "SETTLE_RNR",
    "CLOSE",
  ]),
  comments: z.string().optional(),
});

// POST Advance project through statutory workflow
router.post("/:projectId/transition", authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { projectId } = req.params;
    const parseResult = transitionSchema.safeParse(req.body);
    if (!parseResult.success) {
      return errorResponse(res, "Validation failed", 400, parseResult.error.format());
    }

    const { action, comments } = parseResult.data;

    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return errorResponse(res, "Project not found", 404);
    }

    let newStatus = project.status;
    let milestoneToUpdate: number | null = null;

    switch (action) {
      case "SUBMIT":
        newStatus = "Submitted";
        break;
      case "SCRUTINIZE":
        newStatus = "Under Scrutiny";
        break;
      case "APPROVE":
        newStatus = "Approved";
        break;
      case "REJECT":
        newStatus = "Rejected";
        break;
      case "NOTIFY_SEC11":
        newStatus = "Sec 11 Notification";
        milestoneToUpdate = 1;
        break;
      case "DECLARE_SEC19":
        newStatus = "Sec 19 Declaration";
        milestoneToUpdate = 2;
        break;
      case "DECLARE_AWARD":
        newStatus = "Award";
        milestoneToUpdate = 3;
        break;
      case "DISBURSE_COMPENSATION":
        newStatus = "Compensation";
        milestoneToUpdate = 4;
        break;
      case "TAKE_POSSESSION":
        newStatus = "Possession";
        milestoneToUpdate = 5;
        break;
      case "SETTLE_RNR":
        newStatus = "R&R";
        milestoneToUpdate = 6;
        break;
      case "CLOSE":
        newStatus = "Completed";
        break;
    }

    // Update project
    const updated = await prisma.project.update({
      where: { id: projectId },
      data: { status: newStatus },
    });

    // Update milestone if mapped
    if (milestoneToUpdate) {
      await prisma.projectMilestone.updateMany({
        where: { projectId, stageNumber: milestoneToUpdate },
        data: {
          status: "completed",
          completedDate: new Date().toISOString().split("T")[0],
        },
      });
    }

    // Record workflow action
    const actionRecord = await prisma.workflowAction.create({
      data: {
        projectId,
        stage: newStatus,
        action,
        performedById: req.user!.id,
        performedByName: req.user!.fullName,
        userRole: req.user!.role,
        previousStatus: project.status,
        newStatus,
        comments: comments || `Action ${action} executed by ${req.user!.fullName}`,
      },
    });

    await recordAuditLog({
      userId: req.user!.id,
      userName: req.user!.fullName,
      userRole: req.user!.role,
      action: `WORKFLOW_${action}`,
      entity: "Project",
      entityId: projectId,
      details: { previousStatus: project.status, newStatus, comments },
      req,
    });

    return successResponse(res, {
      project: updated,
      action: actionRecord,
    }, `Workflow advanced: ${newStatus}`);
  } catch (error: any) {
    return errorResponse(res, "Workflow transition failed", 500, error.message);
  }
});

export default router;
