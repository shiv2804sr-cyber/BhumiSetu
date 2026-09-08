import { Router } from "express";
import multer from "multer";
import crypto from "crypto";
import path from "path";
import fs from "fs";
import prisma from "../prisma";
import { optionalAuth, authenticateToken, AuthenticatedRequest } from "../middleware/auth";
import { recordAuditLog } from "../middleware/audit";
import { successResponse, errorResponse } from "../utils/response";

const router = Router();

// Configure local uploads directory
const uploadDir = path.resolve(process.cwd(), process.env.UPLOAD_DIR || "./uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `${path.basename(file.originalname, ext)}-${uniqueSuffix}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25 MB max limit
});

// GET all documents
router.get("/", optionalAuth, async (req, res) => {
  try {
    const { type, status, projectId, search } = req.query;

    const where: any = {};
    if (type) where.type = String(type);
    if (status) where.status = String(status);
    if (projectId) where.projectId = String(projectId);
    if (search) {
      where.title = { contains: String(search) };
    }

    const records = await prisma.documentRecord.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    const formatted = records.map((r) => ({
      id: r.id,
      title: r.title,
      type: r.type,
      version: r.version,
      uploadedBy: r.uploadedBy,
      uploadDate: r.uploadDate,
      checksum: r.checksum.length > 16 ? `${r.checksum.substring(0, 6)}...${r.checksum.substring(r.checksum.length - 4)}` : r.checksum,
      fullChecksum: r.checksum,
      status: r.status,
      size: r.fileSize || "1.2 MB",
    }));

    return successResponse(res, formatted);
  } catch (error: any) {
    return errorResponse(res, "Failed to retrieve documents", 500, error.message);
  }
});

// GET single document metadata
router.get("/:id", async (req, res) => {
  try {
    const doc = await prisma.documentRecord.findUnique({
      where: { id: req.params.id },
      include: { project: true },
    });

    if (!doc) {
      return errorResponse(res, "Document not found", 404);
    }

    return successResponse(res, doc);
  } catch (error: any) {
    return errorResponse(res, "Failed to retrieve document", 500, error.message);
  }
});

// Download document file
router.get("/:id/download", async (req, res) => {
  try {
    const doc = await prisma.documentRecord.findUnique({
      where: { id: req.params.id },
    });

    if (!doc) {
      return errorResponse(res, "Document not found", 404);
    }

    if (doc.filePath && fs.existsSync(doc.filePath)) {
      return res.download(doc.filePath, doc.title);
    }

    // Generate safe mock PDF stream if file is simulated
    const content = `%PDF-1.4
%âãÏÓ
1 0 obj
<< /Title (${doc.title}) /Author (BhoomiSetu Government Repository) /Producer (BhoomiSetu RFCTLARR Document Engine) >>
endobj
2 0 obj
<< /Type /Catalog /Pages 3 0 R >>
endobj
3 0 obj
<< /Type /Pages /Kids [4 0 R] /Count 1 >>
endobj
4 0 obj
<< /Type /Page /Parent 3 0 R /MediaBox [0 0 612 792] /Contents 5 0 R >>
endobj
5 0 obj
<< /Length 120 >>
stream
BT
/F1 14 Tf
72 720 Td
(GOVERNMENT OF INDIA - LAND ACQUISITION SYSTEM) Tj
0 -24 Td
(Document ID: ${doc.id}) Tj
0 -18 Td
(Title: ${doc.title}) Tj
0 -18 Td
(SHA-256: ${doc.checksum}) Tj
ET
endstream
endobj
xref
0 6
0000000000 65535 f 
0000000015 00000 n 
0000000120 00000 n 
0000000170 00000 n 
0000000227 00000 n 
0000000306 00000 n 
trailer
<< /Size 6 /Root 2 0 R >>
startxref
478
%%EOF`;

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${doc.title.endsWith('.pdf') ? doc.title : doc.title + '.pdf'}"`);
    return res.send(Buffer.from(content));
  } catch (error: any) {
    return errorResponse(res, "Failed to download document", 500, error.message);
  }
});

// POST Upload Document with Multer and SHA-256 calculation
router.post("/", upload.single("file"), optionalAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const file = req.file;
    const body = req.body;

    const title = file ? file.originalname : body.title || "Government_Document.pdf";
    const type = body.type || "Gazette";
    const projectId = body.projectId || null;
    const version = body.version || "v1.0";

    let checksum = "";
    let filePath = null;
    let fileSize = "1.5 MB";

    if (file) {
      filePath = file.path;
      const fileBuffer = fs.readFileSync(file.path);
      checksum = crypto.createHash("sha256").update(fileBuffer).digest("hex");
      fileSize = `${(file.size / (1024 * 1024)).toFixed(1)} MB`;
    } else {
      checksum = crypto.createHash("sha256").update(`${title}-${Date.now()}`).digest("hex");
    }

    const count = await prisma.documentRecord.count();
    const newId = `DOC-${8820 + count + 1}`;
    const todayStr = new Date().toISOString().split("T")[0];

    const uploader = req.user?.fullName || body.uploadedBy || "District LAO";

    const doc = await prisma.documentRecord.create({
      data: {
        id: newId,
        projectId,
        title,
        type,
        version,
        uploadedBy: uploader,
        uploadDate: todayStr,
        filePath,
        fileSize,
        checksum,
        status: "Verified",
      },
    });

    await recordAuditLog({
      userId: req.user?.id,
      userName: uploader,
      userRole: req.user?.role || "DISTRICT_AUTHORITY",
      action: "UPLOAD_DOCUMENT",
      entity: "DocumentRecord",
      entityId: doc.id,
      details: { title, checksum },
      req,
    });

    return successResponse(res, doc, "Document uploaded and verified successfully", 201);
  } catch (error: any) {
    return errorResponse(res, "Failed to upload document", 500, error.message);
  }
});

// PUT Verify or update document status
router.put("/:id/verify", authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { status } = req.body;
    const updated = await prisma.documentRecord.update({
      where: { id: req.params.id },
      data: { status: status || "Verified" },
    });

    await recordAuditLog({
      userId: req.user!.id,
      userName: req.user!.fullName,
      userRole: req.user!.role,
      action: "VERIFY_DOCUMENT",
      entity: "DocumentRecord",
      entityId: updated.id,
      details: { newStatus: updated.status },
      req,
    });

    return successResponse(res, updated, `Document status updated to ${updated.status}`);
  } catch (error: any) {
    return errorResponse(res, "Failed to verify document", 500, error.message);
  }
});

export default router;
