import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding BhumiSetu Database...");

  // Clean existing tables in reverse dependency order
  await prisma.auditLog.deleteMany();
  await prisma.workflowAction.deleteMany();
  await prisma.systemAlert.deleteMany();
  await prisma.grievanceRecord.deleteMany();
  await prisma.documentRecord.deleteMany();
  await prisma.rnRRecord.deleteMany();
  await prisma.compensationRecord.deleteMany();
  await prisma.award.deleteMany();
  await prisma.landParcel.deleteMany();
  await prisma.projectMilestone.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();

  // 1. Seed Users with realistic RBAC credentials
  const defaultPasswordHash = await bcrypt.hash("Bhoomi@2026", 10);

  const users = [
    {
      id: "usr-admin-01",
      email: "admin@bhumisetu.gov.in",
      fullName: "Rajeshwar Sharma, IAS",
      designation: "Joint Secretary & Mission Director",
      role: "SUPER_ADMIN",
      department: "Department of Land Resources (DoLR)",
      state: "Delhi",
      district: "New Delhi",
      phone: "+91-11-2338-2026",
      passwordHash: defaultPasswordHash,
    },
    {
      id: "usr-morth-01",
      email: "morth@nic.in",
      fullName: "Anand Verma",
      designation: "Chief Engineer (Land Acquisition)",
      role: "CENTRAL_MINISTRY",
      department: "Ministry of Road Transport & Highways",
      state: "Delhi",
      district: "New Delhi",
      phone: "+91-11-2371-4040",
      passwordHash: defaultPasswordHash,
    },
    {
      id: "usr-rail-01",
      email: "railways@nic.in",
      fullName: "Sunita Roy",
      designation: "Executive Director (Infra)",
      role: "CENTRAL_MINISTRY",
      department: "Ministry of Railways",
      state: "Delhi",
      district: "New Delhi",
      phone: "+91-11-2338-9000",
      passwordHash: defaultPasswordHash,
    },
    {
      id: "usr-mh-state-01",
      email: "state.mh@nic.in",
      fullName: "Sanjay Deshmukh, IAS",
      designation: "Principal Secretary (Revenue)",
      role: "STATE_GOVERNMENT",
      department: "Revenue and Forest Dept, Govt. of Maharashtra",
      state: "Maharashtra",
      district: "Mumbai",
      phone: "+91-22-2202-5566",
      passwordHash: defaultPasswordHash,
    },
    {
      id: "usr-hr-state-01",
      email: "state.hr@nic.in",
      fullName: "Virender Singh, IAS",
      designation: "Director of Land Records",
      role: "STATE_GOVERNMENT",
      department: "Revenue & Disaster Management, Haryana",
      state: "Haryana",
      district: "Rohtak",
      phone: "+91-172-274-1234",
      passwordHash: defaultPasswordHash,
    },
    {
      id: "usr-nuh-lao-01",
      email: "lao.nuh@nic.in",
      fullName: "Mohammad Irfan Khan",
      designation: "District Land Acquisition Officer (LAO)",
      role: "DISTRICT_AUTHORITY",
      department: "District Administration, Nuh",
      state: "Haryana",
      district: "Nuh",
      phone: "+91-1267-274-455",
      passwordHash: defaultPasswordHash,
    },
    {
      id: "usr-pune-lao-01",
      email: "lao.pune@nic.in",
      fullName: "Pooja Kulkarni",
      designation: "Competent Authority & SLAO Pune",
      role: "DISTRICT_AUTHORITY",
      department: "District Collectorate, Pune",
      state: "Maharashtra",
      district: "Pune",
      phone: "+91-20-2612-3344",
      passwordHash: defaultPasswordHash,
    },
    {
      id: "usr-nhai-pia-01",
      email: "pia.nhai@nic.in",
      fullName: "R. K. Meena",
      designation: "Project Director, PIU Gurugram",
      role: "PIA",
      department: "National Highways Authority of India (NHAI)",
      state: "Haryana",
      district: "Gurugram",
      phone: "+91-124-222-7890",
      passwordHash: defaultPasswordHash,
    },
    {
      id: "usr-field-01",
      email: "field.surveyor@nic.in",
      fullName: "Dinesh Chandel",
      designation: "Lead Revenue Surveyor / Kanungo",
      role: "FIELD_OFFICER",
      department: "Tehsil Office, Tauru (Nuh)",
      state: "Haryana",
      district: "Nuh",
      phone: "+91-98123-45678",
      passwordHash: defaultPasswordHash,
    },
    {
      id: "usr-viewer-01",
      email: "viewer@bhumisetu.gov.in",
      fullName: "Citizen Public Access",
      designation: "Transparency Portal Viewer",
      role: "VIEWER",
      department: "Public Grievance & Citizen Portal",
      state: "Delhi",
      district: "New Delhi",
      phone: "+91-11-2338-0000",
      passwordHash: defaultPasswordHash,
    },
  ];

  for (const u of users) {
    await prisma.user.create({ data: u });
  }
  console.log(`Created ${users.length} users.`);

  // 2. Seed Projects
  const projects = [
    {
      id: "PRJ-2026-001",
      projectName: "Delhi-Mumbai Expressway (Phase 4)",
      ministry: "MoRTH",
      category: "Highway",
      state: "Haryana",
      district: "Nuh",
      description: "Greenfield 8-lane expressway connecting Delhi NCT to Vadodara-Mumbai corridor through Nuh & Sohna districts.",
      estimatedArea: 520.0,
      landProposed: 520.0,
      landNotified: 450.5,
      landAcquired: 380.0,
      status: "Award",
      riskLevel: "Low",
      riskScore: 12,
      riskFactors: JSON.stringify(["Favorable historical state timeline", "Low objection count (12)", "Adequate compensation escrow"]),
      dateSubmitted: new Date("2025-11-12T00:00:00Z"),
      startDate: new Date("2025-12-01T00:00:00Z"),
      expectedCompletionDate: new Date("2027-03-31T00:00:00Z"),
      responsibleAuthority: "District Collector, Nuh",
      implementingAgency: "NHAI",
    },
    {
      id: "PRJ-2026-002",
      projectName: "Pune-Nashik Semi High-Speed Rail",
      ministry: "Ministry of Railways",
      category: "Rail",
      state: "Maharashtra",
      district: "Pune",
      description: "235 km semi-high speed electrified railway corridor passing through Pune, Ahmednagar, and Nashik districts.",
      estimatedArea: 145.0,
      landProposed: 145.0,
      landNotified: 120.0,
      landAcquired: 45.0,
      status: "Under Scrutiny",
      riskLevel: "High",
      riskScore: 84,
      riskFactors: JSON.stringify(["High historical district delay rate (68%)", "Urban density delays", "High objection volume (450+)"]),
      dateSubmitted: new Date("2026-01-05T00:00:00Z"),
      startDate: new Date("2026-02-15T00:00:00Z"),
      expectedCompletionDate: new Date("2028-12-31T00:00:00Z"),
      responsibleAuthority: "Competent Authority, Pune",
      implementingAgency: "Maharail (MRIDC)",
    },
    {
      id: "PRJ-2026-003",
      projectName: "Chennai-Bengaluru Industrial Corridor (Node 2)",
      ministry: "DPIIT",
      category: "Industrial Corridor",
      state: "Tamil Nadu",
      district: "Kanchipuram",
      description: "Integrated industrial smart city node at Ponneri / Kanchipuram with dedicated logistics rail siding.",
      estimatedArea: 350.0,
      landProposed: 350.0,
      landNotified: 315.2,
      landAcquired: 180.0,
      status: "Sec 11 Notification",
      riskLevel: "Medium",
      riskScore: 45,
      riskFactors: JSON.stringify(["Approaching Sec 19 Declaration SLA", "Moderate objection count (142)", "Environmental NOC in progress"]),
      dateSubmitted: new Date("2025-08-20T00:00:00Z"),
      startDate: new Date("2025-09-15T00:00:00Z"),
      expectedCompletionDate: new Date("2027-10-31T00:00:00Z"),
      responsibleAuthority: "District LAO, Kanchipuram",
      implementingAgency: "NICDC / TIDCO",
    },
    {
      id: "PRJ-2026-004",
      projectName: "Eastern Dedicated Freight Corridor (Dadri Link)",
      ministry: "Ministry of Railways",
      category: "Rail",
      state: "Uttar Pradesh",
      district: "Noida",
      description: "Strategic freight spur joining Dadri multi-modal transport hub with Western & Eastern DFC junction.",
      estimatedArea: 185.0,
      landProposed: 185.0,
      landNotified: 185.0,
      landAcquired: 172.5,
      status: "Possession",
      riskLevel: "Low",
      riskScore: 18,
      riskFactors: JSON.stringify(["High rate of consent awards (88%)", "Fast-track DBT clearance"]),
      dateSubmitted: new Date("2025-06-10T00:00:00Z"),
      startDate: new Date("2025-07-01T00:00:00Z"),
      expectedCompletionDate: new Date("2026-12-31T00:00:00Z"),
      responsibleAuthority: "District Magistrate, Gautam Buddha Nagar",
      implementingAgency: "DFCCIL",
    },
    {
      id: "PRJ-2026-005",
      projectName: "Godavari Irrigation Canal Network Extension",
      ministry: "Ministry of Jal Shakti",
      category: "Irrigation",
      state: "Maharashtra",
      district: "Nashik",
      description: "Main branch canal and feeder channels serving drought-prone agricultural talukas of Nashik & Jalgaon.",
      estimatedArea: 290.0,
      landProposed: 290.0,
      landNotified: 240.0,
      landAcquired: 160.0,
      status: "Sec 19 Declaration",
      riskLevel: "Medium",
      riskScore: 52,
      riskFactors: JSON.stringify(["Crop seasonal valuation disputes", "Tribal rights verification under PESA"]),
      dateSubmitted: new Date("2025-09-14T00:00:00Z"),
      startDate: new Date("2025-10-01T00:00:00Z"),
      expectedCompletionDate: new Date("2027-06-30T00:00:00Z"),
      responsibleAuthority: "Executive Engineer, Godavari Valley Dev Corp",
      implementingAgency: "Water Resources Dept, Maharashtra",
    }
  ];

  for (const p of projects) {
    await prisma.project.create({ data: p });
  }
  console.log(`Created ${projects.length} projects.`);

  // 3. Seed Milestones for PRJ-2026-001
  const milestonesPrj1 = [
    { projectId: "PRJ-2026-001", stageNumber: 1, name: "Section 11 Notification", status: "completed", targetDate: "2025-10-12", completedDate: "2025-10-12", remarks: "Preliminary notification gazetted in Haryana State Gazette." },
    { projectId: "PRJ-2026-001", stageNumber: 2, name: "Section 19 Declaration", status: "completed", targetDate: "2025-11-05", completedDate: "2025-11-05", remarks: "Declaration published following public hearing." },
    { projectId: "PRJ-2026-001", stageNumber: 3, name: "Section 23 Award Declaration", status: "current", targetDate: "2026-03-15", completedDate: null, remarks: "District LAO compensation awards declared, scrutiny in progress." },
    { projectId: "PRJ-2026-001", stageNumber: 4, name: "Direct Benefit Transfer (DBT)", status: "pending", targetDate: "2026-06-30", completedDate: null, remarks: "PFMS integration ready for electronic disbursement." },
    { projectId: "PRJ-2026-001", stageNumber: 5, name: "Section 38 Land Possession", status: "pending", targetDate: "2026-09-30", completedDate: null, remarks: "Formal panchnama possession hand-over." },
    { projectId: "PRJ-2026-001", stageNumber: 6, name: "R&R Entitlements Settlement", status: "pending", targetDate: "2026-11-30", completedDate: null, remarks: "Housing colony allocation & annuity disbursal." },
  ];
  for (const m of milestonesPrj1) {
    await prisma.projectMilestone.create({ data: m });
  }

  // 4. Seed Land Parcels with real GIS coordinates
  const parcels = [
    {
      id: "pcl-01",
      ulpin: "06122344556677",
      projectId: "PRJ-2026-001",
      state: "Haryana",
      district: "Nuh",
      village: "Khedki",
      surveyNumber: "142/2",
      area: 4.5,
      ownerName: "Gram Panchayat, Khedki",
      ownerType: "Community",
      acquisitionStatus: "Notification",
      notificationStatus: "Section 11 Gazetted",
      awardStatus: "Pending",
      compensationStatus: "Disbursed",
      possessionStatus: "Notice Issued",
      geometryType: "Polygon",
      coordinates: JSON.stringify([
        [
          [77.0120, 28.1180],
          [77.0160, 28.1170],
          [77.0180, 28.1220],
          [77.0140, 28.1230],
          [77.0120, 28.1180]
        ]
      ]),
    },
    {
      id: "pcl-02",
      ulpin: "27122344556688",
      projectId: "PRJ-2026-001",
      state: "Haryana",
      district: "Nuh",
      village: "Tauru Rural",
      surveyNumber: "89/1A",
      area: 1.2,
      ownerName: "Smt. Kavita Patil",
      ownerType: "Private",
      acquisitionStatus: "Award",
      notificationStatus: "Section 19 Declared",
      awardStatus: "Award Declared",
      compensationStatus: "Processing DBT",
      possessionStatus: "Pending Compensation",
      geometryType: "Polygon",
      coordinates: JSON.stringify([
        [
          [77.0200, 28.1310],
          [77.0230, 28.1300],
          [77.0240, 28.1350],
          [77.0210, 28.1360],
          [77.0200, 28.1310]
        ]
      ]),
    },
    {
      id: "pcl-03",
      ulpin: "55443322110099",
      projectId: "PRJ-2026-002",
      state: "Maharashtra",
      district: "Pune",
      village: "Manchar",
      surveyNumber: "215/4",
      area: 2.8,
      ownerName: "Abdul Khan",
      ownerType: "Private",
      acquisitionStatus: "Proposed",
      notificationStatus: "Preliminary Survey",
      awardStatus: "Pending",
      compensationStatus: "Pending",
      possessionStatus: "Unacquired",
      geometryType: "Polygon",
      coordinates: JSON.stringify([
        [
          [73.8500, 18.5200],
          [73.8550, 18.5220],
          [73.8560, 18.5280],
          [73.8490, 18.5260],
          [73.8500, 18.5200]
        ]
      ]),
    },
    {
      id: "corridor-01",
      ulpin: "PROJ-DME-PH4",
      projectId: "PRJ-2026-001",
      state: "Haryana",
      district: "Nuh",
      village: "Expressway Alignment",
      surveyNumber: "Corridor Line",
      area: 450.5,
      ownerName: "MoRTH Alignment",
      ownerType: "Government",
      acquisitionStatus: "Project Corridor",
      geometryType: "LineString",
      coordinates: JSON.stringify([
        [77.0100, 28.1100],
        [77.0150, 28.1250],
        [77.0250, 28.1500]
      ]),
    }
  ];

  for (const pcl of parcels) {
    await prisma.landParcel.create({ data: pcl });
  }
  console.log(`Created ${parcels.length} land parcels.`);

  // 5. Seed Awards
  const awards = [
    {
      id: "AWD-2026-001",
      projectId: "PRJ-2026-001",
      projectName: "Delhi-Mumbai Expressway (Phase 4)",
      date: "2026-03-15",
      totalAmount: 450000000,
      beneficiariesCount: 152,
      status: "Published",
      issuingAuthority: "District Collector, Nuh",
      awardNoticeUrl: "/api/v1/documents/DOC-8823/download",
    },
    {
      id: "AWD-2026-002",
      projectId: "PRJ-2026-002",
      projectName: "Pune-Nashik Semi High-Speed Rail",
      date: "2026-05-22",
      totalAmount: 820000000,
      beneficiariesCount: 340,
      status: "Draft",
      issuingAuthority: "Competent Authority, Pune",
      awardNoticeUrl: null,
    },
    {
      id: "AWD-2026-003",
      projectId: "PRJ-2026-003",
      projectName: "Chennai-Bengaluru Industrial Corridor",
      date: "2026-01-10",
      totalAmount: 120000000,
      beneficiariesCount: 45,
      status: "Under Review",
      issuingAuthority: "District LAO, Kanchipuram",
      awardNoticeUrl: null,
    },
  ];
  for (const a of awards) {
    await prisma.award.create({ data: a });
  }
  console.log(`Created ${awards.length} awards.`);

  // 6. Seed Compensation Records
  const compensations = [
    {
      id: "COMP-101",
      ulpin: "06122344556677",
      projectId: "PRJ-2026-001",
      parcelId: "pcl-01",
      ownerName: "Gram Panchayat, Khedki",
      bankAccountMasked: "SBIN******4412",
      ifscCode: "SBIN0001234",
      marketValue: 8500000,
      solatium: 8500000,
      totalAssessed: 17000000,
      amountDisbursed: 17000000,
      disbursementDate: "2026-08-15",
      status: "Disbursed",
      paymentRef: "PFMS-2026-HR-882190",
    },
    {
      id: "COMP-102",
      ulpin: "27122344556688",
      projectId: "PRJ-2026-001",
      parcelId: "pcl-02",
      ownerName: "Smt. Kavita Patil",
      bankAccountMasked: "HDFC******9901",
      ifscCode: "HDFC0000456",
      marketValue: 4200000,
      solatium: 4200000,
      totalAssessed: 8400000,
      amountDisbursed: 0,
      disbursementDate: null,
      status: "Processing DBT",
      paymentRef: null,
    },
    {
      id: "COMP-103",
      ulpin: "55443322110099",
      projectId: "PRJ-2026-002",
      parcelId: "pcl-03",
      ownerName: "Abdul Khan",
      bankAccountMasked: "PUNB******1288",
      ifscCode: "PUNB0123456",
      marketValue: 3200000,
      solatium: 3200000,
      totalAssessed: 6400000,
      amountDisbursed: 0,
      disbursementDate: null,
      status: "Pending",
      paymentRef: null,
    },
    {
      id: "COMP-104",
      ulpin: "19122344556611",
      projectId: "PRJ-2026-004",
      ownerName: "Ramdas Shinde",
      bankAccountMasked: "BARB******7712",
      ifscCode: "BARB0NOIDAX",
      marketValue: 1900000,
      solatium: 1900000,
      totalAssessed: 3800000,
      amountDisbursed: 3800000,
      disbursementDate: "2026-07-20",
      status: "Disbursed",
      paymentRef: "PFMS-2026-UP-441092",
    },
    {
      id: "COMP-105",
      ulpin: "33122344556622",
      projectId: "PRJ-2026-003",
      ownerName: "Meenakshi Sundaram",
      bankAccountMasked: "IOBA******3321",
      ifscCode: "IOBA0000122",
      marketValue: 4600000,
      solatium: 4600000,
      totalAssessed: 9200000,
      amountDisbursed: 0,
      disbursementDate: null,
      status: "Processing DBT",
      paymentRef: null,
    },
  ];
  for (const c of compensations) {
    await prisma.compensationRecord.create({ data: c });
  }
  console.log(`Created ${compensations.length} compensation records.`);

  // 7. Seed R&R Records
  const rnrRecords = [
    {
      id: "RNR-001",
      ulpin: "06122344556677",
      projectId: "PRJ-2026-001",
      parcelId: "pcl-01",
      familyHead: "Ramesh Singh",
      category: "Agricultural Labourer",
      displacementStatus: "Displaced",
      housingEntitlement: true,
      employmentEntitlement: true,
      annuityEntitlement: false,
      cashGrant: 250000,
      resettlementSite: "Khedki Model Resettlement Colony Sector 4",
      overallStatus: "In Progress",
    },
    {
      id: "RNR-002",
      ulpin: "27122344556688",
      projectId: "PRJ-2026-001",
      parcelId: "pcl-02",
      familyHead: "Smt. Kavita Patil",
      category: "Owner",
      displacementStatus: "Affected Not Displaced",
      housingEntitlement: false,
      employmentEntitlement: false,
      annuityEntitlement: true,
      cashGrant: 50000,
      resettlementSite: null,
      overallStatus: "Settled",
    },
    {
      id: "RNR-003",
      ulpin: "55443322110099",
      projectId: "PRJ-2026-002",
      parcelId: "pcl-03",
      familyHead: "Abdul Khan",
      category: "Owner",
      displacementStatus: "Affected Not Displaced",
      housingEntitlement: false,
      employmentEntitlement: false,
      annuityEntitlement: true,
      cashGrant: 50000,
      resettlementSite: null,
      overallStatus: "Pending",
    },
    {
      id: "RNR-004",
      ulpin: "19122344556611",
      projectId: "PRJ-2026-004",
      familyHead: "Kisan Babu",
      category: "Tenant",
      displacementStatus: "Displaced",
      housingEntitlement: true,
      employmentEntitlement: false,
      annuityEntitlement: true,
      cashGrant: 200000,
      resettlementSite: "Dadri Smart Resettlement Complex",
      overallStatus: "In Progress",
    }
  ];
  for (const r of rnrRecords) {
    await prisma.rnRRecord.create({ data: r });
  }
  console.log(`Created ${rnrRecords.length} R&R records.`);

  // 8. Seed Documents
  const documents = [
    {
      id: "DOC-8821",
      projectId: "PRJ-2026-001",
      title: "Gazette_Sec11_3(A)_Nuh_Signed.pdf",
      type: "Gazette",
      version: "v1.0",
      uploadedBy: "District LAO",
      uploadDate: "2025-10-12",
      checksum: "8f4e2a9b3c5d6e7f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f",
      status: "Verified",
      fileSize: "3.2 MB",
    },
    {
      id: "DOC-8822",
      projectId: "PRJ-2026-002",
      title: "SIA_Report_PuneNashik_Draft.pdf",
      type: "Report",
      version: "v2.1",
      uploadedBy: "PIA Rep",
      uploadDate: "2025-10-25",
      checksum: "3b91ec7d8a9f0e1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b",
      status: "Pending Signature",
      fileSize: "14.8 MB",
    },
    {
      id: "DOC-8823",
      projectId: "PRJ-2026-003",
      title: "Award_Enquiry_Kanchipuram.pdf",
      type: "Legal",
      version: "v1.0",
      uploadedBy: "District LAO",
      uploadDate: "2025-11-05",
      checksum: "7c22df1e2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d",
      status: "Verified",
      fileSize: "5.1 MB",
    },
    {
      id: "DOC-8824",
      projectId: "PRJ-2026-001",
      title: "Cadastral_Map_Khedki_Sec19.pdf",
      type: "Survey",
      version: "v1.2",
      uploadedBy: "Field Surveyor",
      uploadDate: "2026-01-14",
      checksum: "1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b",
      status: "Verified",
      fileSize: "8.4 MB",
    }
  ];
  for (const d of documents) {
    await prisma.documentRecord.create({ data: d });
  }
  console.log(`Created ${documents.length} documents.`);

  // 9. Seed Grievances
  const grievances = [
    {
      trackingId: "G-2026-MH-4421",
      projectId: "PRJ-2026-002",
      category: "Compensation Assessment",
      description: "Market value assessed is lower than recent circle rate revisions in Manchar village.",
      submittedBy: "Ramesh Singh",
      contactNumber: "+91-98765-43210",
      submittedDate: "2026-09-02",
      status: "Open",
      assignedTo: "District LAO",
      priority: "High",
    },
    {
      trackingId: "G-2026-HR-1132",
      projectId: "PRJ-2026-001",
      category: "R&R Eligibility",
      description: "Not included in displaced families list despite residing on parcel for over 5 continuous years.",
      submittedBy: "Abdul Khan",
      contactNumber: "+91-98123-00011",
      submittedDate: "2026-08-15",
      status: "In Progress",
      assignedTo: "SIA Authority",
      priority: "Medium",
      resolutionNotes: "Verification by Tehsildar initiated.",
    },
    {
      trackingId: "G-2026-TN-9984",
      projectId: "PRJ-2026-003",
      category: "Measurement Dispute",
      description: "Acquired area is surveyed as 0.5 Ha but Section 11 gazette notification states 0.8 Ha.",
      submittedBy: "Smt. Kavita Patil",
      contactNumber: "+91-94440-12345",
      submittedDate: "2026-07-10",
      status: "Resolved",
      assignedTo: "Surveyor Dept",
      priority: "Low",
      resolutionNotes: "Resurvey completed; joint demarcation memo signed.",
      resolvedDate: "2026-08-01",
    },
  ];
  for (const g of grievances) {
    await prisma.grievanceRecord.create({ data: g });
  }
  console.log(`Created ${grievances.length} grievances.`);

  // 10. Seed System Alerts
  const alerts = [
    {
      id: "ALT-001",
      type: "Lapse Risk",
      message: "Section 24(2) lapse risk: Award is approaching statutory threshold with pending possession for CBIC Node 2.",
      projectId: "PRJ-2026-003",
      projectName: "CBIC Node 2",
      timestamp: new Date("2026-09-08T10:30:00Z"),
      severity: "Critical",
      isRead: false,
      targetRole: "District LAO",
    },
    {
      id: "ALT-002",
      type: "SLA Breach",
      message: "Sec 19 Declaration delayed by 45 days beyond SIA clearance deadline.",
      projectId: "PRJ-2026-002",
      projectName: "Pune-Nashik Semi High-Speed Rail",
      timestamp: new Date("2026-09-08T08:15:00Z"),
      severity: "Warning",
      isRead: false,
      targetRole: "Central Ministry",
    },
    {
      id: "ALT-003",
      type: "Approval Pending",
      message: "District LAO submitted compensation award for Nuh Expressway Phase.",
      projectId: "PRJ-2026-001",
      projectName: "Delhi-Mumbai Expressway (Phase 4)",
      timestamp: new Date("2026-09-07T16:45:00Z"),
      severity: "Info",
      isRead: true,
      targetRole: "State Government",
    },
  ];
  for (const al of alerts) {
    await prisma.systemAlert.create({ data: al });
  }
  console.log(`Created ${alerts.length} system alerts.`);

  // 11. Seed Audit Logs
  const auditLogs = [
    {
      userId: "usr-nuh-lao-01",
      userName: "Mohammad Irfan Khan",
      userRole: "DISTRICT_AUTHORITY",
      action: "APPROVE",
      entity: "Award",
      entityId: "AWD-2026-001",
      details: JSON.stringify({ amount: 450000000, beneficiaries: 152, note: "Award published under Sec 23" }),
      ipAddress: "10.14.22.8",
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/128.0",
      timestamp: new Date("2026-09-07T16:45:00Z"),
    },
    {
      userId: "usr-admin-01",
      userName: "Rajeshwar Sharma, IAS",
      userRole: "SUPER_ADMIN",
      action: "LOGIN",
      entity: "User",
      entityId: "usr-admin-01",
      details: JSON.stringify({ method: "Password+MFA", status: "Success" }),
      ipAddress: "10.0.1.1",
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Edge/128.0",
      timestamp: new Date("2026-09-08T09:00:00Z"),
    }
  ];
  for (const log of auditLogs) {
    await prisma.auditLog.create({ data: log });
  }
  console.log(`Created ${auditLogs.length} audit logs.`);

  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
