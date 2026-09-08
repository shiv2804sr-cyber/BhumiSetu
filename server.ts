import express, { Request, Response, NextFunction } from "express";
import path from "path";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import apiV1Router from "./src/server/routes/index";
import prisma from "./src/server/prisma";

// Load environment variables
dotenv.config();

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  // Security & Middleware
  app.use(
    helmet({
      contentSecurityPolicy: false, // Allows OpenStreetMap raster tiles & inline styles for MapLibre
      crossOriginResourcePolicy: { policy: "cross-origin" },
    })
  );
  app.use(cors());
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));

  // Static uploads directory
  const uploadsPath = path.resolve(process.cwd(), process.env.UPLOAD_DIR || "uploads");
  app.use("/uploads", express.static(uploadsPath));

  // Health check endpoint
  app.get("/health", async (req, res) => {
    try {
      await prisma.$queryRaw`SELECT 1`;
      res.json({
        status: "healthy",
        uptime: process.uptime(),
        database: "connected",
        timestamp: new Date().toISOString(),
      });
    } catch (err: any) {
      res.status(503).json({
        status: "degraded",
        database: "disconnected",
        error: err.message,
      });
    }
  });

  // Mount Primary Versioned REST APIs
  app.use("/api/v1", apiV1Router);

  // Backwards-compatible routes for existing frontend components
  app.get("/api/proposals", async (req, res, next) => {
    try {
      const projects = await prisma.project.findMany({
        orderBy: { createdAt: "desc" },
      });
      const formatted = projects.map((p) => {
        let riskFactors: string[] = [];
        try {
          riskFactors = JSON.parse(p.riskFactors);
        } catch (e) {}
        return {
          id: p.id,
          projectName: p.projectName,
          ministry: p.ministry,
          category: p.category,
          state: p.state,
          district: p.district,
          status: p.status,
          dateSubmitted: p.dateSubmitted.toISOString().split("T")[0],
          areaRequired: p.estimatedArea,
          riskProfile: {
            level: p.riskLevel,
            score: p.riskScore,
            factors: riskFactors,
          },
        };
      });
      res.json(formatted);
    } catch (e) {
      next(e);
    }
  });

  app.post("/api/proposals", async (req, res, next) => {
    try {
      const count = await prisma.project.count();
      const newId = `PRJ-2026-${String(count + 1).padStart(3, "0")}`;
      const data = req.body;
      const project = await prisma.project.create({
        data: {
          id: newId,
          projectName: data.projectName,
          ministry: data.ministry,
          category: data.category,
          state: data.state,
          district: data.district,
          estimatedArea: Number(data.areaRequired) || 10,
          landProposed: Number(data.areaRequired) || 10,
          landNotified: 0,
          landAcquired: 0,
          status: "Submitted",
          riskLevel: "Medium",
          riskScore: 45,
          riskFactors: JSON.stringify(["Initial review pending", "Standard SLA applies"]),
          dateSubmitted: new Date(),
        },
      });
      res.json({
        ...project,
        areaRequired: project.estimatedArea,
        riskProfile: {
          level: project.riskLevel,
          score: project.riskScore,
          factors: ["Initial review pending", "Standard SLA applies"],
        },
      });
    } catch (e) {
      next(e);
    }
  });

  app.get("/api/alerts", async (req, res, next) => {
    try {
      const alerts = await prisma.systemAlert.findMany({
        orderBy: { timestamp: "desc" },
      });
      res.json(
        alerts.map((a) => ({
          id: a.id,
          type: a.type,
          message: a.message,
          projectId: a.projectId,
          projectName: a.projectName,
          timestamp: a.timestamp.toISOString(),
          severity: a.severity,
          isRead: a.isRead,
        }))
      );
    } catch (e) {
      next(e);
    }
  });

  app.get("/api/compensation", async (req, res, next) => {
    try {
      const records = await prisma.compensationRecord.findMany({
        orderBy: { createdAt: "desc" },
      });
      res.json(records);
    } catch (e) {
      next(e);
    }
  });

  app.get("/api/rnr", async (req, res, next) => {
    try {
      const records = await prisma.rnRRecord.findMany({
        orderBy: { createdAt: "desc" },
      });
      res.json(
        records.map((r) => ({
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
          overallStatus: r.overallStatus,
        }))
      );
    } catch (e) {
      next(e);
    }
  });

  app.get("/api/documents", async (req, res, next) => {
    try {
      const docs = await prisma.documentRecord.findMany({
        orderBy: { createdAt: "desc" },
      });
      res.json(
        docs.map((d) => ({
          id: d.id,
          title: d.title,
          type: d.type,
          version: d.version,
          uploadedBy: d.uploadedBy,
          uploadDate: d.uploadDate,
          checksum: d.checksum.length > 16 ? `${d.checksum.substring(0, 6)}...${d.checksum.substring(d.checksum.length - 4)}` : d.checksum,
          status: d.status,
        }))
      );
    } catch (e) {
      next(e);
    }
  });

  app.get("/api/awards", async (req, res, next) => {
    try {
      const awards = await prisma.award.findMany({
        orderBy: { createdAt: "desc" },
      });
      res.json(awards);
    } catch (e) {
      next(e);
    }
  });

  app.get("/api/reports", async (req, res) => {
    res.json([
      { id: "REP-991", title: "Q3 State-wise Acquisition Progress", type: "Progress", generatedDate: "2026-09-01", generatedBy: "System", format: "PDF", size: "2.4 MB" },
      { id: "REP-992", title: "DBT Disbursement Delay Analysis", type: "Financial", generatedDate: "2026-08-28", generatedBy: "Admin", format: "XLSX", size: "1.1 MB" },
      { id: "REP-993", title: "Pending R&R Settlements - Maharashtra", type: "Social", generatedDate: "2026-08-15", generatedBy: "SIA Officer", format: "PDF", size: "3.5 MB" },
      { id: "REP-994", title: "National Highway Linear Corridors Audit", type: "Progress", generatedDate: "2026-09-05", generatedBy: "MoRTH Cell", format: "CSV", size: "840 KB" },
    ]);
  });

  app.get("/api/grievances", async (req, res, next) => {
    try {
      const list = await prisma.grievanceRecord.findMany({
        orderBy: { createdAt: "desc" },
      });
      res.json(list);
    } catch (e) {
      next(e);
    }
  });

  app.get("/api/kpis", async (req, res, next) => {
    try {
      const [projSum, compSum, famCount, rnrCount] = await Promise.all([
        prisma.project.aggregate({
          _sum: { landNotified: true, landAcquired: true },
        }),
        prisma.compensationRecord.aggregate({
          _sum: { totalAssessed: true, amountDisbursed: true },
        }),
        prisma.rnRRecord.count(),
        prisma.rnRRecord.count({ where: { overallStatus: "Settled" } }),
      ]);

      const formatINR = (val: number) => `₹${(val / 1e7).toLocaleString("en-IN", { maximumFractionDigits: 0 })} Cr`;

      res.json({
        areaNotified: `${(projSum._sum.landNotified || 145210).toLocaleString("en-IN")} Ha`,
        areaAcquired: `${(projSum._sum.landAcquired || 128500).toLocaleString("en-IN")} Ha`,
        compensationAssessed: formatINR(compSum._sum.totalAssessed || 424500000000),
        compensationDisbursed: formatINR(compSum._sum.amountDisbursed || 398000000000),
        familiesAffected: (famCount || 34205).toLocaleString("en-IN"),
        familiesRnR: (rnrCount || 28450).toLocaleString("en-IN"),
      });
    } catch (e) {
      next(e);
    }
  });

  app.get("/api/parcels", async (req, res, next) => {
    try {
      const parcels = await prisma.landParcel.findMany();
      const features = parcels
        .map((p) => {
          let coords = null;
          try {
            coords = p.coordinates ? JSON.parse(p.coordinates) : null;
          } catch (e) {}
          if (!coords) return null;
          return {
            type: "Feature",
            properties: {
              id: p.id,
              ulpin: p.ulpin,
              status: p.acquisitionStatus,
              owner: p.ownerName,
              area: p.area,
            },
            geometry: {
              type: p.geometryType,
              coordinates: coords,
            },
          };
        })
        .filter(Boolean);

      res.json({
        type: "FeatureCollection",
        features,
      });
    } catch (e) {
      next(e);
    }
  });

  // Centralized Error Handling Middleware
  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error("Internal Server Error:", err);
    res.status(err.status || 500).json({
      success: false,
      error: err.message || "An unexpected internal server error occurred",
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`BhoomiSetu National Platform running at http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Fatal error during server startup:", err);
});
