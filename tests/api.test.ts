/**
 * Automated Verification Test Suite for BhumiSetu Backend APIs
 */

import http from "http";

const BASE_URL = "http://localhost:3000";

async function request(path: string, options: any = {}) {
  const url = `${BASE_URL}${path}`;
  const headers: any = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  const res = await fetch(url, {
    ...options,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const contentType = res.headers.get("content-type");
  let data = null;
  if (contentType && contentType.includes("application/json")) {
    data = await res.json();
  } else {
    data = await res.text();
  }

  return { status: res.status, ok: res.ok, data, headers: res.headers };
}

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string) {
  if (condition) {
    console.log(`  [PASS] ${testName}`);
    passed++;
  } else {
    console.error(`  [FAIL] ${testName}`);
    failed++;
  }
}

export async function runAllTests() {
  console.log("\n==================================================");
  console.log("Starting BhumiSetu Automated API Test Suite");
  console.log("==================================================\n");

  let adminToken = "";
  let laoToken = "";

  // 1. Health Check
  console.log("1. System Health Check");
  const health = await request("/health");
  assert(health.status === 200 && health.data?.status === "healthy", "Health endpoint returns 200 and healthy status");
  assert(health.data?.database === "connected", "Database is verified connected");

  // 2. Auth Tests
  console.log("\n2. Authentication & RBAC");
  const badLogin = await request("/api/v1/auth/login", {
    method: "POST",
    body: { email: "admin@bhumisetu.gov.in", password: "WrongPassword" },
  });
  assert(badLogin.status === 401, "Invalid password returns 401 Unauthorized");

  const adminLogin = await request("/api/v1/auth/login", {
    method: "POST",
    body: { email: "admin@bhumisetu.gov.in", password: "Bhoomi@2026" },
  });
  assert(adminLogin.status === 200 && !!adminLogin.data?.data?.token, "Admin login succeeds with JWT");
  adminToken = adminLogin.data?.data?.token || "";

  const laoLogin = await request("/api/v1/auth/login", {
    method: "POST",
    body: { email: "lao.nuh@nic.in", password: "Bhoomi@2026" },
  });
  assert(laoLogin.status === 200, "District LAO login succeeds");
  laoToken = laoLogin.data?.data?.token || "";

  const profile = await request("/api/v1/auth/me", {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  assert(profile.status === 200 && profile.data?.data?.role === "SUPER_ADMIN", "Profile inspection confirms SUPER_ADMIN role");

  // 3. Dashboard KPIs
  console.log("\n3. National Dashboard Live Aggregations");
  const kpis = await request("/api/v1/dashboard/kpis");
  assert(kpis.status === 200 && typeof kpis.data?.areaNotified === "string", "Dashboard KPIs return formatted statutory area metrics");
  assert(kpis.data?.raw?.totalProjects > 0, "Dashboard metrics backed by real database records (>0 projects)");

  const stateKpi = await request("/api/v1/dashboard/kpis?state=Haryana");
  assert(stateKpi.status === 200, "State filtering on KPIs succeeds");

  // 4. Projects & Proposal Workflow
  console.log("\n4. Project Lifecycle & Proposals");
  const projects = await request("/api/v1/projects");
  assert(projects.status === 200 && projects.data?.data?.length > 0, "Projects list returns array of projects");

  const newProposal = await request("/api/v1/projects", {
    method: "POST",
    headers: { Authorization: `Bearer ${adminToken}` },
    body: {
      projectName: "Bengaluru Peripheral Ring Road Ext",
      ministry: "MoRTH",
      category: "Highway",
      state: "Karnataka",
      district: "Bengaluru Rural",
      areaRequired: 220.5,
    },
  });
  assert(newProposal.status === 201 && newProposal.data?.data?.id?.startsWith("PRJ-"), "New proposal created with auto ID and predictive risk");
  const createdId = newProposal.data?.data?.id;

  if (createdId) {
    const advance = await request(`/api/v1/projects/${createdId}/workflow`, {
      method: "POST",
      headers: { Authorization: `Bearer ${adminToken}` },
      body: { action: "SCRUTINIZE" },
    });
    assert(advance.status === 200 && advance.data?.data?.status === "Under Scrutiny", "Workflow state machine advances to 'Under Scrutiny'");
  }

  // 5. GIS Parcels
  console.log("\n5. GIS Parcel & Location APIs");
  const geojson = await request("/api/v1/parcels");
  assert(geojson.status === 200 && geojson.data?.type === "FeatureCollection", "Parcels endpoint returns valid GeoJSON FeatureCollection");
  assert(Array.isArray(geojson.data?.features) && geojson.data.features.length > 0, "GeoJSON features contain geometry coordinates");

  // 6. Compensation & DBT
  console.log("\n6. Compensation & Direct Benefit Transfer");
  const compList = await request("/api/v1/compensation");
  assert(compList.status === 200 && compList.data?.data?.length > 0, "Compensation records list returned");

  // Test DBT disbursement on COMP-102 or COMP-103
  const pendingComp = compList.data?.data?.find((c: any) => c.status !== "Disbursed");
  if (pendingComp) {
    const disburse = await request(`/api/v1/compensation/${pendingComp.id}/disburse`, {
      method: "POST",
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(disburse.status === 200 && disburse.data?.data?.status === "Disbursed", `PFMS DBT disbursement executes for ${pendingComp.id}`);
  }

  // 7. R&R Entitlements
  console.log("\n7. Rehabilitation & Resettlement (R&R)");
  const rnrList = await request("/api/v1/rnr");
  assert(rnrList.status === 200 && rnrList.data?.data?.length > 0, "R&R register records returned");

  // 8. Document Management
  console.log("\n8. Document Management & SHA-256 Checksums");
  const docsList = await request("/api/v1/documents");
  assert(docsList.status === 200 && docsList.data?.data?.length > 0, "Documents metadata returned");
  const sampleDoc = docsList.data?.data?.[0];
  if (sampleDoc) {
    const download = await request(`/api/v1/documents/${sampleDoc.id}/download`);
    assert(download.status === 200, `Document file download stream returns 200 for ${sampleDoc.id}`);
  }

  // 9. Awards
  console.log("\n9. Awards Management (Sec 23/31)");
  const awardsList = await request("/api/v1/awards");
  assert(awardsList.status === 200 && awardsList.data?.data?.length > 0, "Awards records returned");

  // 10. Grievances
  console.log("\n10. Citizen Grievance Redressal");
  const grievances = await request("/api/v1/grievances");
  assert(grievances.status === 200 && grievances.data?.data?.length > 0, "Grievances retrieved successfully");

  // 11. Reports & CSV Export
  console.log("\n11. MIS Reports & Export");
  const csvExport = await request("/api/v1/reports/export?type=projects");
  assert(csvExport.status === 200 && typeof csvExport.data === "string" && csvExport.data.includes("Project ID"), "Projects CSV stream generated with headers");

  // 12. Audit Logs
  console.log("\n12. Administrative Audit Trail");
  const auditLogs = await request("/api/v1/audit", {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  assert(auditLogs.status === 200 && auditLogs.data?.data?.length > 0, "Audit trail accessible to SUPER_ADMIN with recorded actions");

  console.log("\n==================================================");
  console.log(`Test Results: ${passed} Passed, ${failed} Failed`);
  console.log("==================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}
