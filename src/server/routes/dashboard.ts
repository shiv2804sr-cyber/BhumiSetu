import { Router } from "express";
import prisma from "../prisma";
import { optionalAuth } from "../middleware/auth";
import { successResponse, errorResponse } from "../utils/response";

const router = Router();

// Helper to format currency into Crores / Lakhs
function formatINR(value: number): string {
  if (value >= 1e7) {
    return `₹${(value / 1e7).toLocaleString("en-IN", { maximumFractionDigits: 1 })} Cr`;
  }
  if (value >= 1e5) {
    return `₹${(value / 1e5).toLocaleString("en-IN", { maximumFractionDigits: 1 })} Lakh`;
  }
  return `₹${value.toLocaleString("en-IN")}`;
}

// GET /api/v1/dashboard/kpis - Dynamic database metrics computed in real-time
router.get("/kpis", optionalAuth, async (req, res) => {
  try {
    const { state, district, ministry } = req.query;

    const projectWhere: any = {};
    if (state && state !== "All States") projectWhere.state = String(state);
    if (district && district !== "All Districts") projectWhere.district = String(district);
    if (ministry) projectWhere.ministry = String(ministry);

    // Aggregate from Projects
    const projectAggregates = await prisma.project.aggregate({
      where: projectWhere,
      _sum: {
        landProposed: true,
        landNotified: true,
        landAcquired: true,
      },
      _count: {
        id: true,
      },
    });

    // Aggregate Compensation
    const compensationWhere: any = {};
    if (state && state !== "All States" || district && district !== "All Districts") {
      compensationWhere.project = projectWhere;
    }
    const compensationAggregates = await prisma.compensationRecord.aggregate({
      where: compensationWhere,
      _sum: {
        totalAssessed: true,
        amountDisbursed: true,
      },
    });

    // Aggregate R&R Families
    const rnrWhere: any = {};
    if (state && state !== "All States" || district && district !== "All Districts") {
      rnrWhere.project = projectWhere;
    }
    const [totalFamilies, settledFamilies] = await Promise.all([
      prisma.rnRRecord.count({ where: rnrWhere }),
      prisma.rnRRecord.count({ where: { ...rnrWhere, overallStatus: "Settled" } }),
    ]);

    const areaNotifiedHa = projectAggregates._sum.landNotified || 0;
    const areaAcquiredHa = projectAggregates._sum.landAcquired || 0;
    const compAssessed = compensationAggregates._sum.totalAssessed || 0;
    const compDisbursed = compensationAggregates._sum.amountDisbursed || 0;

    const kpiResponse = {
      areaNotified: `${areaNotifiedHa.toLocaleString("en-IN", { maximumFractionDigits: 1 })} Ha`,
      areaAcquired: `${areaAcquiredHa.toLocaleString("en-IN", { maximumFractionDigits: 1 })} Ha`,
      compensationAssessed: formatINR(compAssessed),
      compensationDisbursed: formatINR(compDisbursed),
      familiesAffected: totalFamilies.toLocaleString("en-IN"),
      familiesRnR: settledFamilies.toLocaleString("en-IN"),
      // Raw numerical fields for rich charts
      raw: {
        totalProjects: projectAggregates._count.id,
        areaProposed: projectAggregates._sum.landProposed || 0,
        areaNotified: areaNotifiedHa,
        areaAcquired: areaAcquiredHa,
        compensationAssessed: compAssessed,
        compensationDisbursed: compDisbursed,
        familiesAffected: totalFamilies,
        familiesSettled: settledFamilies,
      },
    };

    return res.json(kpiResponse);
  } catch (error: any) {
    return errorResponse(res, "Failed to compute dashboard KPIs", 500, error.message);
  }
});

// GET /api/v1/dashboard/summary - Rich summary with risk breakdown and state distributions
router.get("/summary", optionalAuth, async (req, res) => {
  try {
    const { state, district } = req.query;
    const where: any = {};
    if (state && state !== "All States") where.state = String(state);
    if (district && district !== "All Districts") where.district = String(district);

    const [
      highRiskProjects,
      mediumRiskProjects,
      lowRiskProjects,
      totalProjects,
      stateBreakdown,
      recentAlerts,
    ] = await Promise.all([
      prisma.project.count({ where: { ...where, riskLevel: "High" } }),
      prisma.project.count({ where: { ...where, riskLevel: "Medium" } }),
      prisma.project.count({ where: { ...where, riskLevel: "Low" } }),
      prisma.project.count({ where }),
      prisma.project.groupBy({
        by: ["state"],
        _count: { id: true },
        _sum: { landAcquired: true, estimatedArea: true },
      }),
      prisma.systemAlert.findMany({
        take: 5,
        orderBy: { timestamp: "desc" },
      }),
    ]);

    return successResponse(res, {
      totalProjects,
      riskDistribution: {
        high: highRiskProjects,
        medium: mediumRiskProjects,
        low: lowRiskProjects,
      },
      stateBreakdown,
      recentAlerts,
    });
  } catch (error: any) {
    return errorResponse(res, "Failed to generate dashboard summary", 500, error.message);
  }
});

export default router;
