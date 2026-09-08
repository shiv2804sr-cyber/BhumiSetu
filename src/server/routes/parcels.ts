import { Router } from "express";
import { z } from "zod";
import prisma from "../prisma";
import { optionalAuth, authenticateToken, requireRole, AuthenticatedRequest } from "../middleware/auth";
import { recordAuditLog } from "../middleware/audit";
import { successResponse, errorResponse } from "../utils/response";

const router = Router();

// GET GeoJSON FeatureCollection for MapLibre
router.get("/", async (req, res) => {
  try {
    const { state, district, projectId } = req.query;

    const where: any = {};
    if (state && state !== "All States") {
      where.state = String(state);
    }
    if (district && district !== "All Districts") {
      where.district = String(district);
    }
    if (projectId) {
      where.projectId = String(projectId);
    }

    const parcels = await prisma.landParcel.findMany({
      where,
      include: {
        project: { select: { projectName: true, id: true } },
      },
    });

    const features = parcels
      .map((p) => {
        let coords: any = null;
        try {
          coords = p.coordinates ? JSON.parse(p.coordinates) : null;
        } catch (e) {
          coords = null;
        }

        if (!coords) return null;

        return {
          type: "Feature",
          properties: {
            id: p.id,
            ulpin: p.ulpin,
            status: p.acquisitionStatus,
            owner: p.ownerName,
            area: p.area,
            village: p.village,
            surveyNumber: p.surveyNumber,
            projectId: p.projectId,
            projectName: p.project?.projectName,
            compensationStatus: p.compensationStatus,
            possessionStatus: p.possessionStatus,
          },
          geometry: {
            type: p.geometryType,
            coordinates: coords,
          },
        };
      })
      .filter(Boolean);

    return res.json({
      type: "FeatureCollection",
      features,
    });
  } catch (error: any) {
    return errorResponse(res, "Failed to load GIS parcel features", 500, error.message);
  }
});

// GET parcel list with tabular details
router.get("/list", optionalAuth, async (req, res) => {
  try {
    const { state, district, projectId, search } = req.query;
    const where: any = {};

    if (state && state !== "All States") where.state = String(state);
    if (district && district !== "All Districts") where.district = String(district);
    if (projectId) where.projectId = String(projectId);
    if (search) {
      where.OR = [
        { ulpin: { contains: String(search) } },
        { ownerName: { contains: String(search) } },
        { surveyNumber: { contains: String(search) } },
      ];
    }

    const parcels = await prisma.landParcel.findMany({
      where,
      include: {
        project: { select: { id: true, projectName: true } },
        compensation: true,
        rnr: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return successResponse(res, parcels);
  } catch (error: any) {
    return errorResponse(res, "Failed to load parcel list", 500, error.message);
  }
});

// GET single parcel by ULPIN or ID
router.get("/:idOrUlpin", async (req, res) => {
  try {
    const param = req.params.idOrUlpin;
    const parcel = await prisma.landParcel.findFirst({
      where: {
        OR: [{ id: param }, { ulpin: param }],
      },
      include: {
        project: true,
        compensation: true,
        rnr: true,
      },
    });

    if (!parcel) {
      return errorResponse(res, "Land parcel not found", 404);
    }

    return successResponse(res, parcel);
  } catch (error: any) {
    return errorResponse(res, "Failed to retrieve parcel", 500, error.message);
  }
});

const createParcelSchema = z.object({
  ulpin: z.string().min(10),
  projectId: z.string(),
  state: z.string(),
  district: z.string(),
  village: z.string(),
  surveyNumber: z.string(),
  area: z.number().positive(),
  ownerName: z.string(),
  ownerType: z.string().default("Private"),
  acquisitionStatus: z.string().default("Proposed"),
  geometryType: z.enum(["Polygon", "LineString", "Point"]).default("Polygon"),
  coordinates: z.string().optional(),
});

// POST Create new Land Parcel
router.post("/", authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const parseResult = createParcelSchema.safeParse(req.body);
    if (!parseResult.success) {
      return errorResponse(res, "Validation failed", 400, parseResult.error.format());
    }

    const data = parseResult.data;

    const existing = await prisma.landParcel.findUnique({
      where: { ulpin: data.ulpin },
    });
    if (existing) {
      return errorResponse(res, "ULPIN already registered in national registry", 409);
    }

    const parcel = await prisma.landParcel.create({
      data: {
        ulpin: data.ulpin,
        projectId: data.projectId,
        state: data.state,
        district: data.district,
        village: data.village,
        surveyNumber: data.surveyNumber,
        area: data.area,
        ownerName: data.ownerName,
        ownerType: data.ownerType,
        acquisitionStatus: data.acquisitionStatus,
        geometryType: data.geometryType,
        coordinates: data.coordinates || null,
      },
    });

    await recordAuditLog({
      userId: req.user!.id,
      userName: req.user!.fullName,
      userRole: req.user!.role,
      action: "CREATE",
      entity: "LandParcel",
      entityId: parcel.id,
      details: { ulpin: parcel.ulpin, area: parcel.area },
      req,
    });

    return successResponse(res, parcel, "Land parcel registered successfully", 201);
  } catch (error: any) {
    return errorResponse(res, "Failed to create parcel", 500, error.message);
  }
});

export default router;
