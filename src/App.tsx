/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import GlobalHindiTranslator from "./components/GlobalHindiTranslator";

import { AuthProvider } from "./context/AuthContext";

import { Sidebar, TopNav } from "./components/Layout";

import {
  KPILedger,
  WorkflowTracker,
  PredictiveRisk,
} from "./components/Dashboard";

import { GISMap } from "./components/Map";
import { Proposals } from "./components/Proposals";
import { Compensation } from "./components/Compensation";
import { RnR } from "./components/RnR";
import { Documents } from "./components/Documents";
import { AlertsPanel } from "./components/Alerts";
import { MapView } from "./components/MapView";
import { Awards } from "./components/Awards";
import { Reports } from "./components/Reports";
import { Grievances } from "./components/Grievance";
import { LoginModal } from "./components/LoginModal";


function MainApp() {
  /* =====================================================
     ACTIVE TAB
     ===================================================== */

  const [activeTab, setActiveTab] =
    useState("dashboard");


  /* =====================================================
     STATE / DISTRICT
     ===================================================== */

  const [selectedState, setSelectedState] =
    useState("All States");

  const [selectedDistrict, setSelectedDistrict] =
    useState("All Districts");


  /* =====================================================
     LOGIN MODAL
     ===================================================== */

  const [isLoginModalOpen, setIsLoginModalOpen] =
    useState(false);


  /* =====================================================
     LANGUAGE
     ===================================================== */

  const [language, setLanguage] =
    useState<"en" | "hi">(() => {
      const stored =
        localStorage.getItem(
          "bhumisetu_language"
        );

      if (
        stored === "hi" ||
        stored === "en"
      ) {
        return stored;
      }

      return "en";
    });


  /* =====================================================
     LANGUAGE CHANGE
     ===================================================== */

  const handleLanguageChange = (newLang: "en" | "hi") => {
  localStorage.setItem("bhumisetu_language", newLang);

  // Hindi -> English:
  // DOM translator द्वारा बदला हुआ text पूरी तरह reset करने के लिए page reload
  if (newLang === "en") {
    window.location.reload();
    return;
  }

  setLanguage(newLang);
};

  /* =====================================================
     DASHBOARD TEXT
     ===================================================== */

  const t = {
    liveParcelMap:
      language === "hi"
        ? "लाइव भूमि पार्सल मानचित्र"
        : "Live Parcel Map",

    autoSync:
      language === "hi"
        ? "स्वचालित सिंक सक्रिय"
        : "Auto-sync active",

    module:
      language === "hi"
        ? "मॉड्यूल"
        : "Module",

    subsequentPhase:
      language === "hi"
        ? "यह मॉड्यूल आगामी निर्माण चरणों में उपलब्ध होगा।"
        : "This module is available in subsequent build phases.",
  };


  /* =====================================================
     MAIN UI
     ===================================================== */

  return (
    <div className="min-h-screen bg-survey-paper text-registry-ink flex flex-col font-sans">

      {/* =================================================
          GLOBAL HINDI TRANSLATOR

          This single component translates the complete
          visible website when language === "hi".
          ================================================= */}

      <GlobalHindiTranslator
        language={language}
      />


      {/* =================================================
          TOP NAVIGATION
          ================================================= */}

      <TopNav
        setActiveTab={setActiveTab}

        selectedState={selectedState}
        setSelectedState={setSelectedState}

        selectedDistrict={selectedDistrict}
        setSelectedDistrict={setSelectedDistrict}

        onOpenLogin={() =>
          setIsLoginModalOpen(true)
        }

        language={language}

        setLanguage={handleLanguageChange}
      />


      {/* =================================================
          MAIN APPLICATION LAYOUT
          ================================================= */}

      <div className="flex flex-1 overflow-hidden">


        {/* =================================================
            SIDEBAR
            ================================================= */}

        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          language={language}
        />


        {/* =================================================
            MAIN CONTENT
            ================================================= */}

        <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">


          {/* =================================================
              DASHBOARD
              ================================================= */}

          {activeTab === "dashboard" && (
            <>
              <KPILedger
                selectedState={selectedState}
                selectedDistrict={selectedDistrict}
                language={language}
              />


              <div className="flex-1 p-6 flex flex-col lg:flex-row gap-6">


                {/* =================================================
                    GIS MAP SECTION
                    ================================================= */}

                <div className="flex-[2] min-h-[500px] lg:min-h-0 flex flex-col shadow-sm">


                  {/* MAP HEADER */}

                  <div className="p-4 bg-white border-x border-t border-graticule-teal/30 font-serif font-semibold text-registry-ink flex justify-between items-center">

                    <h2>
                      {t.liveParcelMap}
                    </h2>


                    <span className="text-xs font-sans font-normal text-registry-ink/60 bg-graticule-teal/10 px-2 py-1">
                      {t.autoSync}
                    </span>

                  </div>


                  {/* MAP */}

                  <div className="flex-1 min-h-0 relative">

                    <div className="absolute inset-0">

                      <GISMap
                        selectedState={selectedState}
                        selectedDistrict={selectedDistrict}
                      />

                    </div>

                  </div>

                </div>


                {/* =================================================
                    RIGHT SIDE DASHBOARD
                    ================================================= */}

                <div className="flex-1 min-w-[300px] flex flex-col">


                  {/* WORKFLOW TRACKER */}

                  <div className="shadow-sm">

                    <WorkflowTracker
                      language={language}
                    />

                  </div>


                  {/* PREDICTIVE RISK */}

                  <PredictiveRisk
                    language={language}
                  />

                </div>

              </div>
            </>
          )}


          {/* =================================================
              PROJECT PROPOSALS
              ================================================= */}

          {activeTab === "proposals" && (
            <Proposals
              selectedState={selectedState}
              selectedDistrict={selectedDistrict}
            />
          )}


          {/* =================================================
              COMPENSATION
              ================================================= */}

          {activeTab === "compensation" && (
            <Compensation
              selectedState={selectedState}
              selectedDistrict={selectedDistrict}
            />
          )}


          {/* =================================================
              R&R
              ================================================= */}

          {activeTab === "rnr" && (
            <RnR
              selectedState={selectedState}
              selectedDistrict={selectedDistrict}
            />
          )}


          {/* =================================================
              DOCUMENTS
              ================================================= */}

          {activeTab === "documents" && (
            <Documents />
          )}


          {/* =================================================
              ALERTS
              ================================================= */}

          {activeTab === "alerts" && (
            <AlertsPanel />
          )}


          {/* =================================================
              MAP
              ================================================= */}

          {activeTab === "map" && (
            <MapView
              selectedState={selectedState}
              selectedDistrict={selectedDistrict}
            />
          )}


          {/* =================================================
              AWARDS
              ================================================= */}

          {activeTab === "awards" && (
            <Awards />
          )}


          {/* =================================================
              REPORTS
              ================================================= */}

          {activeTab === "reports" && (
            <Reports />
          )}


          {/* =================================================
              GRIEVANCE
              ================================================= */}

          {activeTab === "grievance" && (
            <Grievances />
          )}


          {/* =================================================
              FALLBACK MODULE
              ================================================= */}

          {activeTab !== "dashboard" &&
            activeTab !== "proposals" &&
            activeTab !== "compensation" &&
            activeTab !== "rnr" &&
            activeTab !== "documents" &&
            activeTab !== "alerts" &&
            activeTab !== "map" &&
            activeTab !== "awards" &&
            activeTab !== "reports" &&
            activeTab !== "grievance" && (

              <div className="p-8 flex items-center justify-center h-full text-registry-ink/60">

                <div className="text-center">


                  {/* ICON */}

                  <div className="text-4xl mb-4 text-graticule-teal/40 flex justify-center">

                    <svg
                      className="w-16 h-16"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >

                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1}
                        d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                      />

                    </svg>

                  </div>


                  {/* MODULE TITLE */}

                  <h3 className="font-serif text-xl text-registry-ink mb-2">

                    {activeTab
                      .charAt(0)
                      .toUpperCase() +
                      activeTab.slice(1)}

                    {" "}

                    {t.module}

                  </h3>


                  {/* DESCRIPTION */}

                  <p>
                    {t.subsequentPhase}
                  </p>

                </div>

              </div>
            )}

        </main>

      </div>


      {/* =================================================
          LOGIN MODAL
          ================================================= */}

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() =>
          setIsLoginModalOpen(false)
        }
      />

    </div>
  );
}


/* =========================================================
   APP ROOT
   ========================================================= */

export default function App() {
  return (
    <AuthProvider>

      <MainApp />

    </AuthProvider>
  );
}