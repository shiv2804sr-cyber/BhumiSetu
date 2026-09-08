import { Router } from "express";
import prisma from "../prisma";
import { optionalAuth, authenticateToken, AuthenticatedRequest } from "../middleware/auth";
import { recordAuditLog } from "../middleware/audit";
import { successResponse, errorResponse } from "../utils/response";

const router = Router();

// Static report catalog backed by database tracking
let reportCatalog = [
  { id: "REP-991", title: "Q3 State-wise Acquisition Progress", type: "Progress", generatedDate: "2026-09-01", generatedBy: "System", format: "PDF", size: "2.4 MB" },
  { id: "REP-992", title: "DBT Disbursement Delay Analysis", type: "Financial", generatedDate: "2026-08-28", generatedBy: "Admin", format: "XLSX", size: "1.1 MB" },
  { id: "REP-993", title: "Pending R&R Settlements - Maharashtra", type: "Social", generatedDate: "2026-08-15", generatedBy: "SIA Officer", format: "PDF", size: "3.5 MB" },
  { id: "REP-994", title: "National Highway Linear Corridors Audit", type: "Progress", generatedDate: "2026-09-05", generatedBy: "MoRTH Cell", format: "CSV", size: "840 KB" },
];

// GET all reports
router.get("/", optionalAuth, async (req, res) => {
  return successResponse(res, reportCatalog);
});

// GET /api/v1/reports/export - Export live data as CSV
router.get("/export", optionalAuth, async (req, res) => {
  try {
    const { type = "projects" } = req.query;

    if (type === "projects") {
      const projects = await prisma.project.findMany();
      const headers = "Project ID,Project Name,Ministry,Category,State,District,Status,Estimated Area (Ha),Land Notified (Ha),Land Acquired (Ha),Risk Score\n";
      const rows = projects
        .map(
          (p) =>
            `"${p.id}","${p.projectName.replace(/"/g, '""')}","${p.ministry}","${p.category}","${p.state}","${p.district}","${p.status}",${p.estimatedArea},${p.landNotified},${p.landAcquired},${p.riskScore}`
        )
        .join("\n");

      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", 'attachment; filename="BhumiSetu_Projects_Report.csv"');
      return res.send(headers + rows);
    }

    if (type === "compensation") {
      const records = await prisma.compensationRecord.findMany({
        include: { project: { select: { projectName: true } } },
      });
      const headers = "Ref ID,ULPIN,Project Name,Beneficiary,Market Value,Solatium,Total Assessed,Amount Disbursed,Status,Disbursement Date\n";
      const rows = records
        .map(
          (r) =>
            `"${r.id}","${r.ulpin}","${r.project.projectName.replace(/"/g, '""')}","${r.ownerName}",${r.marketValue},${r.solatium},${r.totalAssessed},${r.amountDisbursed},"${r.status}","${r.disbursementDate || ""}"`
        )
        .join("\n");

      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", 'attachment; filename="BhumiSetu_Compensation_Report.csv"');
      return res.send(headers + rows);
    }

    return errorResponse(res, "Unsupported export type", 400);
  } catch (error: any) {
    return errorResponse(res, "Failed to export report data", 500, error.message);
  }
});

// POST Generate new report entry
router.post("/generate", optionalAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { title, type, format = "PDF" } = req.body;
    const newId = `REP-${Math.floor(1000 + Math.random() * 9000)}`;
    const todayStr = new Date().toISOString().split("T")[0];
    const uploader = req.user?.fullName || "System Administrator";

    const newReport = {
      id: newId,
      title: title || `Statutory Report - ${todayStr}`,
      type: type || "Progress",
      generatedDate: todayStr,
      generatedBy: uploader,
      format: format.toUpperCase(),
      size: "1.8 MB",
    };

    reportCatalog.unshift(newReport);

    await recordAuditLog({
      userId: req.user?.id,
      userName: uploader,
      userRole: req.user?.role || "SUPER_ADMIN",
      action: "GENERATE_REPORT",
      entity: "Report",
      entityId: newId,
      details: { title: newReport.title, format: newReport.format },
      req,
    });

    return successResponse(res, newReport, "Report generated successfully", 201);
  } catch (error: any) {
    return errorResponse(res, "Failed to generate report", 500, error.message);
  }
});

export default router;
