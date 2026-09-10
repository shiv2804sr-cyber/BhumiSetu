import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  X,
  FileText,
  Download,
  Send,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { api } from "../lib/api";

type AwardRecord = {
  id: string;
  projectId: string;
  projectName: string;
  date: string;
  totalAmount: number;
  beneficiariesCount: number;
  status: string;
  issuingAuthority: string;
  awardNoticeUrl?: string | null;
};

type MockProject = {
  id: string;
  projectName: string;
  state: string;
  district: string;
  ministry: string;
  category: string;
  estimatedArea: number;
  description: string;
};

const stateDistricts: Record<string, string[]> = {
  Delhi: [
    "New Delhi",
    "North Delhi",
    "South Delhi",
    "East Delhi",
    "West Delhi",
  ],

  Haryana: [
    "Nuh",
    "Gurugram",
    "Faridabad",
    "Rohtak",
    "Hisar",
    "Ambala",
  ],

  "Uttar Pradesh": [
    "Lucknow",
    "Kanpur",
    "Agra",
    "Varanasi",
    "Noida",
    "Meerut",
  ],

  Maharashtra: [
    "Pune",
    "Mumbai",
    "Nashik",
    "Nagpur",
    "Thane",
  ],

  "Tamil Nadu": [
    "Chennai",
    "Kanchipuram",
    "Coimbatore",
    "Madurai",
  ],

  Karnataka: [
    "Bangalore",
    "Mysore",
    "Belgaum",
    "Mangalore",
    "Hubli",
    "Tumkur",
  ],

  "Madhya Pradesh": [
    "Indore",
    "Bhopal",
    "Jabalpur",
    "Gwalior",
    "Ujjain",
    "Sagar",
  ],

  Rajasthan: [
    "Jaipur",
    "Jodhpur",
    "Udaipur",
    "Ajmer",
    "Bikaner",
    "Kota",
  ],

  Jharkhand: [
    "Ranchi",
    "Dhanbad",
    "Giridih",
    "Bokaro",
    "Hazaribagh",
    "Deoghar",
  ],

  Bihar: [
    "Patna",
    "Gaya",
    "Muzaffarpur",
    "Darbhanga",
    "Bhagalpur",
    "Madhubani",
  ],
};

/* =========================================================
   DEMO PROJECT GENERATOR
   ========================================================= */

const projectTemplates = [
  {
    title: "Integrated Highway Corridor",
    ministry: "Ministry of Road Transport & Highways",
    category: "Highway",
  },
  {
    title: "Regional Rail Connectivity Project",
    ministry: "Ministry of Railways",
    category: "Rail",
  },
  {
    title: "Industrial Growth Corridor",
    ministry: "DPIIT",
    category: "Industrial Corridor",
  },
];

function generateMockProjects(): MockProject[] {
  const projects: MockProject[] = [];
  let counter = 1;

  Object.entries(stateDistricts).forEach(
    ([state, districts]) => {
      districts.forEach((district) => {
        projectTemplates.forEach(
          (template, templateIndex) => {
            projects.push({
              id: `DEMO-${String(counter).padStart(
                4,
                "0"
              )}`,

              projectName:
                `${template.title} - ${district}`,

              state,
              district,

              ministry: template.ministry,

              category: template.category,

              estimatedArea:
                100 +
                counter * 8 +
                templateIndex * 40,

              description:
                `${template.title} for ${district}, ${state}. ` +
                `Demo land acquisition project for BhoomiSetu award workflow.`,
            });

            counter++;
          }
        );
      });
    }
  );

  return projects;
}

const MOCK_PROJECTS = generateMockProjects();

/* =========================================================
   AWARDS COMPONENT
   ========================================================= */

export function Awards() {
  const [awards, setAwards] = useState<AwardRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const [isDraftModalOpen, setIsDraftModalOpen] =
    useState(false);

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState("");

  const [successMessage, setSuccessMessage] =
    useState("");

  /* Draft form */
  const [draftState, setDraftState] =
    useState("Haryana");

  const [draftDistrict, setDraftDistrict] =
    useState("Nuh");

  const [draftProjectId, setDraftProjectId] =
    useState("");

  const [draftAmount, setDraftAmount] =
    useState("");

  const [draftBeneficiaries, setDraftBeneficiaries] =
    useState("");

  /* =========================================================
     PROJECTS FOR SELECTED DISTRICT
     ========================================================= */

  const districtsForDraft =
    stateDistricts[draftState] || [];

  const projectsForDraft = useMemo(() => {
    return MOCK_PROJECTS.filter(
      (project) =>
        project.state === draftState &&
        project.district === draftDistrict
    );
  }, [draftState, draftDistrict]);

  const selectedProject = useMemo(() => {
    return (
      MOCK_PROJECTS.find(
        (project) =>
          project.id === draftProjectId
      ) || null
    );
  }, [draftProjectId]);

  /* =========================================================
     LOAD AWARDS
     ========================================================= */

  const loadAwards = async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      /*
       * IMPORTANT:
       * api.awards.getAll() automatically sends:
       *
       * Authorization: Bearer <bhumisetu_token>
       */
      const data = await api.awards.getAll();

      setAwards(
        Array.isArray(data)
          ? data
          : []
      );
    } catch (error: any) {
      console.error(
        "Load Awards Error:",
        error
      );

      setErrorMessage(
        error?.message ||
          "Unable to load awards."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAwards();
  }, []);

  /* =========================================================
     OPEN MODAL
     ========================================================= */

  const openDraftModal = () => {
    setErrorMessage("");
    setSuccessMessage("");

    const state = "Haryana";
    const district =
      stateDistricts[state]?.[0] || "Nuh";

    const firstProject =
      MOCK_PROJECTS.find(
        (project) =>
          project.state === state &&
          project.district === district
      );

    setDraftState(state);
    setDraftDistrict(district);

    setDraftProjectId(
      firstProject?.id || ""
    );

    setDraftAmount("");
    setDraftBeneficiaries("");

    setIsDraftModalOpen(true);
  };

  /* =========================================================
     STATE CHANGE
     ========================================================= */

  const handleStateChange = (
    newState: string
  ) => {
    setDraftState(newState);

    const firstDistrict =
      stateDistricts[newState]?.[0] || "";

    setDraftDistrict(firstDistrict);

    const firstProject =
      MOCK_PROJECTS.find(
        (project) =>
          project.state === newState &&
          project.district === firstDistrict
      );

    setDraftProjectId(
      firstProject?.id || ""
    );
  };

  /* =========================================================
     DISTRICT CHANGE
     ========================================================= */

  const handleDistrictChange = (
    newDistrict: string
  ) => {
    setDraftDistrict(newDistrict);

    const firstProject =
      MOCK_PROJECTS.find(
        (project) =>
          project.state === draftState &&
          project.district === newDistrict
      );

    setDraftProjectId(
      firstProject?.id || ""
    );
  };

  /* =========================================================
     PROJECT CHANGE
     ========================================================= */

  const handleProjectChange = (
    projectId: string
  ) => {
    setDraftProjectId(projectId);
  };

  /* =========================================================
     CREATE AWARD DRAFT
     ========================================================= */

  const handleDraftSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (isSubmitting) return;

    setErrorMessage("");
    setSuccessMessage("");

    /* -------------------------
       VALIDATION
       ------------------------- */

    if (!draftState) {
      setErrorMessage(
        "Please select a state."
      );
      return;
    }

    if (!draftDistrict) {
      setErrorMessage(
        "Please select a district."
      );
      return;
    }

    if (!draftProjectId) {
      setErrorMessage(
        "Please select a project."
      );
      return;
    }

    if (
      !draftAmount ||
      Number(draftAmount) <= 0
    ) {
      setErrorMessage(
        "Please enter a valid award amount."
      );
      return;
    }

    if (
      !draftBeneficiaries ||
      Number(draftBeneficiaries) <= 0
    ) {
      setErrorMessage(
        "Please enter beneficiaries count."
      );
      return;
    }

    const project =
      MOCK_PROJECTS.find(
        (item) =>
          item.id === draftProjectId
      );

    if (!project) {
      setErrorMessage(
        "Selected project not found."
      );
      return;
    }

    try {
      setIsSubmitting(true);

      /* =====================================================
         STEP 1
         CHECK IF SAME PROJECT ALREADY EXISTS
         ===================================================== */

      let realProjectId = "";

      try {
        /*
         * Authenticated API call.
         */
        const backendProjects =
          await api.projects.getAll({
            state: project.state,
            district: project.district,
          });

        const existingProject =
          Array.isArray(backendProjects)
            ? backendProjects.find(
                (p: any) =>
                  p.projectName ===
                    project.projectName &&
                  p.state === project.state &&
                  p.district ===
                    project.district
              )
            : null;

        if (existingProject?.id) {
          realProjectId =
            existingProject.id;
        }
      } catch (lookupError) {
        /*
         * If project lookup fails,
         * we'll try to create the project.
         */
        console.warn(
          "Project lookup warning:",
          lookupError
        );
      }

      /* =====================================================
         STEP 2
         CREATE REAL PROJECT IF NEEDED
         ===================================================== */

      if (!realProjectId) {
        /*
         * IMPORTANT:
         * This uses api.projects.create()
         * instead of fetch().
         *
         * JWT is automatically injected by api.ts.
         */
        const createdProject =
          await api.projects.create({
            projectName:
              project.projectName,

            ministry:
              project.ministry,

            category:
              project.category,

            state:
              project.state,

            district:
              project.district,

            description:
              project.description,

            estimatedArea:
              project.estimatedArea,

            landProposed:
              project.estimatedArea,

            landNotified: 0,

            landAcquired: 0,

            status: "Draft",

            riskLevel: "Medium",

            riskScore: 50,

            riskFactors:
              JSON.stringify([]),

            responsibleAuthority:
              `District Collector, ${project.district}`,

            implementingAgency:
              project.ministry,
          });

        /*
         * api.ts already unwraps data.data
         * if backend uses response wrapper.
         */
        realProjectId =
          createdProject?.id ||
          createdProject?.project?.id ||
          createdProject?.data?.id ||
          "";

        if (!realProjectId) {
          console.error(
            "Project API response:",
            createdProject
          );

          throw new Error(
            "Project was created but Project ID was not returned."
          );
        }
      }

      /* =====================================================
         STEP 3
         CREATE AWARD
         ===================================================== */

      const awardPayload = {
        projectId:
          realProjectId,

        projectName:
          project.projectName,

        date:
          new Date()
            .toISOString()
            .split("T")[0],

        totalAmount:
          Number(draftAmount),

        beneficiariesCount:
          Number(draftBeneficiaries),

        status: "Draft",

        issuingAuthority:
          `District Collector, ${draftDistrict}`,
      };

      console.log(
        "Creating Award Draft:",
        awardPayload
      );

      /*
       * IMPORTANT:
       * Authenticated API call.
       *
       * api.awards.create()
       * automatically adds:
       *
       * Authorization:
       * Bearer <bhumisetu_token>
       */
      const createdAward =
        await api.awards.create(
          awardPayload
        );

      console.log(
        "Award Draft Created:",
        createdAward
      );

      /* =====================================================
         SUCCESS
         ===================================================== */

      setSuccessMessage(
        "Award Draft created successfully!"
      );

      setDraftAmount("");
      setDraftBeneficiaries("");

      /*
       * Refresh table.
       */
      await loadAwards();

      /*
       * Close modal after short delay
       * so user can see success message.
       */
      setTimeout(() => {
        setIsDraftModalOpen(false);
        setSuccessMessage("");
      }, 900);

    } catch (error: any) {
      console.error(
        "Create Award Draft Error:",
        error
      );

      setErrorMessage(
        error?.message ||
          "Failed to create Award Draft."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  /* =========================================================
     PUBLISH AWARD
     ========================================================= */

  const handlePublish = async (
    awardId: string
  ) => {
    try {
      setErrorMessage("");
      setSuccessMessage("");

      /*
       * Authenticated API call.
       */
      await api.awards.publish(
        awardId
      );

      await loadAwards();

      setSuccessMessage(
        "Award published successfully!"
      );

      setTimeout(() => {
        setSuccessMessage("");
      }, 2500);

    } catch (error: any) {
      console.error(
        "Publish Award Error:",
        error
      );

      setErrorMessage(
        error?.message ||
          "Failed to publish award."
      );
    }
  };

  /* =========================================================
     DOWNLOAD
     ========================================================= */

  const handleDownload = (
    award: AwardRecord
  ) => {
    if (!award.awardNoticeUrl) {
      setErrorMessage(
        "Award notice is not available yet."
      );
      return;
    }

    window.open(
      award.awardNoticeUrl,
      "_blank"
    );
  };

  /* =========================================================
     STATUS
     ========================================================= */

  const getStatusStyle = (
    status: string
  ) => {
    switch (status) {
      case "Published":
        return "bg-green-100 text-green-700 border-green-200";

      case "Draft":
        return "bg-amber-100 text-amber-700 border-amber-200";

      case "Under Review":
        return "bg-blue-100 text-blue-700 border-blue-200";

      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  /* =========================================================
     UI
     ========================================================= */

  return (
    <div className="p-6 space-y-6">

      {/* ===================================================
          HEADER
          =================================================== */}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

        <div>
          <div className="flex items-center gap-3">

            <div className="p-2.5 rounded-lg bg-soft-green">
              <FileText className="h-5 w-5 text-forest-dark" />
            </div>

            <div>
              <h1 className="text-xl font-bold text-forest-dark">
                Award Management
              </h1>

              <p className="text-sm text-gray-500">
                Draft, review and publish land acquisition awards
              </p>
            </div>

          </div>
        </div>

        <button
          type="button"
          onClick={openDraftModal}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-forest-dark text-white rounded-md font-semibold hover:bg-forest-light transition-colors"
        >
          <Plus className="h-4 w-4" />
          New Award Draft
        </button>

      </div>

      {/* ===================================================
          SUCCESS
          =================================================== */}

      {successMessage && (
        <div className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">

          <CheckCircle2 className="h-5 w-5" />

          <span>
            {successMessage}
          </span>

        </div>
      )}

      {/* ===================================================
          ERROR
          =================================================== */}

      {errorMessage &&
        !isDraftModalOpen && (
          <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">

            <AlertCircle className="h-5 w-5" />

            <span>
              {errorMessage}
            </span>

          </div>
        )}

      {/* ===================================================
          AWARD REGISTER
          =================================================== */}

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">

        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">

          <div>
            <h2 className="font-semibold text-forest-dark">
              Award Register
            </h2>

            <p className="text-xs text-gray-500 mt-1">
              All award drafts and published awards
            </p>
          </div>

          <div className="text-xs text-gray-500">
            {awards.length} records
          </div>

        </div>

        {loading ? (

          <div className="flex items-center justify-center py-16">

            <Loader2 className="h-6 w-6 animate-spin text-forest-dark" />

            <span className="ml-2 text-sm text-gray-500">
              Loading awards...
            </span>

          </div>

        ) : awards.length === 0 ? (

          <div className="py-16 text-center text-gray-500">

            <FileText className="h-10 w-10 mx-auto mb-3 opacity-40" />

            <p className="font-medium">
              No awards found
            </p>

            <p className="text-sm mt-1">
              Create your first award draft.
            </p>

          </div>

        ) : (

          <div className="overflow-x-auto">

            <table className="w-full text-sm">

              <thead className="bg-gray-50 border-b border-gray-200">

                <tr>

                  <th className="text-left px-6 py-4 font-semibold text-gray-600">
                    Award ID
                  </th>

                  <th className="text-left px-6 py-4 font-semibold text-gray-600">
                    Project
                  </th>

                  <th className="text-left px-6 py-4 font-semibold text-gray-600">
                    Date
                  </th>

                  <th className="text-left px-6 py-4 font-semibold text-gray-600">
                    Amount
                  </th>

                  <th className="text-left px-6 py-4 font-semibold text-gray-600">
                    Beneficiaries
                  </th>

                  <th className="text-left px-6 py-4 font-semibold text-gray-600">
                    Authority
                  </th>

                  <th className="text-left px-6 py-4 font-semibold text-gray-600">
                    Status
                  </th>

                  <th className="text-right px-6 py-4 font-semibold text-gray-600">
                    Actions
                  </th>

                </tr>

              </thead>

              <tbody className="divide-y divide-gray-100">

                {awards.map((award) => (

                  <tr
                    key={award.id}
                    className="hover:bg-gray-50 transition-colors"
                  >

                    <td className="px-6 py-4 font-mono text-xs text-gray-600">
                      {award.id}
                    </td>

                    <td className="px-6 py-4">

                      <div className="font-medium text-gray-800">
                        {award.projectName}
                      </div>

                      <div className="text-xs text-gray-400 mt-1">
                        {award.projectId}
                      </div>

                    </td>

                    <td className="px-6 py-4 text-gray-600">
                      {award.date || "-"}
                    </td>

                    <td className="px-6 py-4 font-semibold text-gray-800">
                      ₹
                      {Number(
                        award.totalAmount || 0
                      ).toLocaleString("en-IN")}
                    </td>

                    <td className="px-6 py-4 text-gray-700">
                      {Number(
                        award.beneficiariesCount || 0
                      ).toLocaleString("en-IN")}
                    </td>

                    <td className="px-6 py-4 text-gray-600">
                      {award.issuingAuthority || "-"}
                    </td>

                    <td className="px-6 py-4">

                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full border text-xs font-semibold ${getStatusStyle(
                          award.status
                        )}`}
                      >
                        {award.status}
                      </span>

                    </td>

                    <td className="px-6 py-4">

                      <div className="flex items-center justify-end gap-2">

                        {award.status !==
                          "Published" && (
                          <button
                            type="button"
                            onClick={() =>
                              handlePublish(
                                award.id
                              )
                            }
                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md bg-forest-dark text-white text-xs font-semibold hover:bg-forest-light"
                          >
                            <Send className="h-3.5 w-3.5" />
                            Publish
                          </button>
                        )}

                        {award.awardNoticeUrl && (
                          <button
                            type="button"
                            onClick={() =>
                              handleDownload(
                                award
                              )
                            }
                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md border border-gray-300 text-gray-700 text-xs font-semibold hover:bg-gray-50"
                          >
                            <Download className="h-3.5 w-3.5" />
                            Download
                          </button>
                        )}

                      </div>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        )}

      </div>

      {/* ===================================================
          CREATE AWARD MODAL
          =================================================== */}

      {isDraftModalOpen && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">

          <div className="w-full max-w-2xl bg-white rounded-xl shadow-2xl max-h-[90vh] overflow-y-auto">

            {/* MODAL HEADER */}

            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200">

              <div>
                <h2 className="text-lg font-bold text-forest-dark">
                  Create Award Draft
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  Select state, district and project
                </p>
              </div>

              <button
                type="button"
                disabled={isSubmitting}
                onClick={() =>
                  setIsDraftModalOpen(false)
                }
                className="p-2 rounded-md hover:bg-gray-100 text-gray-500 disabled:opacity-50"
              >
                <X className="h-5 w-5" />
              </button>

            </div>

            {/* FORM */}

            <form
              onSubmit={handleDraftSubmit}
              className="p-6 space-y-5"
            >

              {/* ERROR */}

              {errorMessage && (
                <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">

                  <AlertCircle className="h-5 w-5 mt-0.5 shrink-0" />

                  <div>

                    <div className="font-semibold">
                      Unable to create award
                    </div>

                    <div className="mt-1">
                      {errorMessage}
                    </div>

                  </div>

                </div>
              )}

              {/* STATE + DISTRICT */}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                <div>

                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    State
                  </label>

                  <select
                    value={draftState}
                    disabled={isSubmitting}
                    onChange={(e) =>
                      handleStateChange(
                        e.target.value
                      )
                    }
                    className="w-full h-11 px-3 border border-gray-300 rounded-md bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-forest-light"
                  >

                    {Object.keys(
                      stateDistricts
                    ).map((state) => (
                      <option
                        key={state}
                        value={state}
                      >
                        {state}
                      </option>
                    ))}

                  </select>

                </div>

                <div>

                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    District
                  </label>

                  <select
                    value={draftDistrict}
                    disabled={isSubmitting}
                    onChange={(e) =>
                      handleDistrictChange(
                        e.target.value
                      )
                    }
                    className="w-full h-11 px-3 border border-gray-300 rounded-md bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-forest-light"
                  >

                    {districtsForDraft.map(
                      (district) => (
                        <option
                          key={district}
                          value={district}
                        >
                          {district}
                        </option>
                      )
                    )}

                  </select>

                </div>

              </div>

              {/* PROJECT */}

              <div>

                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Target Project
                </label>

                <select
                  value={draftProjectId}
                  disabled={
                    isSubmitting ||
                    projectsForDraft.length === 0
                  }
                  onChange={(e) =>
                    handleProjectChange(
                      e.target.value
                    )
                  }
                  className="w-full h-11 px-3 border border-gray-300 rounded-md bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-forest-light"
                >

                  {projectsForDraft.length === 0 ? (

                    <option value="">
                      No projects available
                    </option>

                  ) : (

                    projectsForDraft.map(
                      (project) => (
                        <option
                          key={project.id}
                          value={project.id}
                        >
                          {project.projectName}
                        </option>
                      )
                    )

                  )}

                </select>

              </div>

              {/* PROJECT INFO */}

              {selectedProject && (

                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">

                  <div className="grid grid-cols-2 gap-4">

                    <div>
                      <div className="text-xs text-gray-500">
                        State
                      </div>

                      <div className="text-sm font-semibold text-gray-800 mt-1">
                        {selectedProject.state}
                      </div>
                    </div>

                    <div>
                      <div className="text-xs text-gray-500">
                        District
                      </div>

                      <div className="text-sm font-semibold text-gray-800 mt-1">
                        {selectedProject.district}
                      </div>
                    </div>

                    <div>
                      <div className="text-xs text-gray-500">
                        Category
                      </div>

                      <div className="text-sm font-semibold text-gray-800 mt-1">
                        {selectedProject.category}
                      </div>
                    </div>

                    <div>
                      <div className="text-xs text-gray-500">
                        Estimated Area
                      </div>

                      <div className="text-sm font-semibold text-gray-800 mt-1">
                        {selectedProject.estimatedArea} Ha
                      </div>
                    </div>

                  </div>

                </div>

              )}

              {/* AMOUNT + BENEFICIARIES */}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                <div>

                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Total Award Amount (₹)
                  </label>

                  <input
                    type="number"
                    min="1"
                    value={draftAmount}
                    disabled={isSubmitting}
                    onChange={(e) =>
                      setDraftAmount(
                        e.target.value
                      )
                    }
                    placeholder="e.g. 450000000"
                    className="w-full h-11 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-forest-light"
                  />

                </div>

                <div>

                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Beneficiaries
                  </label>

                  <input
                    type="number"
                    min="1"
                    value={draftBeneficiaries}
                    disabled={isSubmitting}
                    onChange={(e) =>
                      setDraftBeneficiaries(
                        e.target.value
                      )
                    }
                    placeholder="e.g. 152"
                    className="w-full h-11 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-forest-light"
                  />

                </div>

              </div>

              {/* AUTHORITY */}

              <div>

                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Issuing Authority
                </label>

                <input
                  type="text"
                  readOnly
                  value={`District Collector, ${draftDistrict}`}
                  className="w-full h-11 px-3 border border-gray-300 rounded-md bg-gray-50 text-gray-700"
                />

              </div>

              {/* INFO */}

              <div className="rounded-md bg-blue-50 border border-blue-100 px-4 py-3 text-xs text-blue-700">

                Award will be created as a{" "}
                <strong>Draft</strong> for the
                selected state and district.

              </div>

              {/* BUTTONS */}

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">

                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() =>
                    setIsDraftModalOpen(false)
                  }
                  className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-md font-semibold hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="min-w-[190px] px-5 py-2.5 bg-forest-dark text-white rounded-md font-semibold hover:bg-forest-light disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
                >

                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      Create Award Draft
                    </>
                  )}

                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}