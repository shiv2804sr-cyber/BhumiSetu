/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { AuthProvider } from "./context/AuthContext";
import { Sidebar, TopNav } from "./components/Layout";
import { KPILedger, WorkflowTracker, PredictiveRisk } from "./components/Dashboard";
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
  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedState, setSelectedState] = useState("All States");
  const [selectedDistrict, setSelectedDistrict] = useState("All Districts");
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [language, setLanguage] = useState<"en" | "hi">(() => {
    const stored = localStorage.getItem("bhumisetu_language");
    return (stored === "hi" || stored === "en") ? stored : "en";
  });

  // Persist language preference to localStorage
  const handleLanguageChange = (newLang: "en" | "hi") => {
    localStorage.setItem("bhumisetu_language", newLang);
    setLanguage(newLang);
  };

  return (
    <div className="min-h-screen bg-survey-paper text-registry-ink flex flex-col font-sans">
  <TopNav
  setActiveTab={setActiveTab}
  selectedState={selectedState}
  setSelectedState={setSelectedState}
  selectedDistrict={selectedDistrict}
  setSelectedDistrict={setSelectedDistrict}
  onOpenLogin={() => setIsLoginModalOpen(true)}
  language={language}
  setLanguage={handleLanguageChange}
/>
      <div className="flex flex-1 overflow-hidden">
       <Sidebar
  activeTab={activeTab}
  setActiveTab={setActiveTab}
  language={language}
/>
        
        <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          {activeTab === "dashboard" && (
            <>
              <KPILedger selectedState={selectedState} selectedDistrict={selectedDistrict} />
              <div className="flex-1 p-6 flex flex-col lg:flex-row gap-6">
                <div className="flex-[2] min-h-[500px] lg:min-h-0 flex flex-col shadow-sm">
                  <div className="p-4 bg-white border-x border-t border-graticule-teal/30 font-serif font-semibold text-registry-ink flex justify-between items-center">
                    <h2>Live Parcel Map</h2>
                    <span className="text-xs font-sans font-normal text-registry-ink/60 bg-graticule-teal/10 px-2 py-1">Auto-sync active</span>
                  </div>
                  <div className="flex-1 min-h-0 relative">
                    <div className="absolute inset-0">
                      <GISMap selectedState={selectedState} selectedDistrict={selectedDistrict} />
                    </div>
                  </div>
                </div>
                
                <div className="flex-1 min-w-[300px] flex flex-col">
                  <div className="shadow-sm">
                    <WorkflowTracker />
                  </div>
                  <PredictiveRisk />
                </div>
              </div>
            </>
          )}

          {activeTab === "proposals" && <Proposals selectedState={selectedState} selectedDistrict={selectedDistrict} />}
          {activeTab === "compensation" && <Compensation selectedState={selectedState} selectedDistrict={selectedDistrict} />}
          {activeTab === "rnr" && <RnR selectedState={selectedState} selectedDistrict={selectedDistrict} />}
          {activeTab === "documents" && <Documents />}
          {activeTab === "alerts" && <AlertsPanel />}
          {activeTab === "map" && <MapView selectedState={selectedState} selectedDistrict={selectedDistrict} />}
          {activeTab === "awards" && <Awards />}
          {activeTab === "reports" && <Reports />}
          {activeTab === "grievance" && <Grievances />}

          {activeTab !== "dashboard" && activeTab !== "proposals" && activeTab !== "compensation" && activeTab !== "rnr" && activeTab !== "documents" && activeTab !== "alerts" && activeTab !== "map" && activeTab !== "awards" && activeTab !== "reports" && activeTab !== "grievance" && (
            <div className="p-8 flex items-center justify-center h-full text-registry-ink/60">
              <div className="text-center">
                <div className="text-4xl mb-4 text-graticule-teal/40 flex justify-center">
                  <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <h3 className="font-serif text-xl text-registry-ink mb-2">{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Module</h3>
                <p>This module is available in subsequent build phases.</p>
              </div>
            </div>
          )}
        </main>
      </div>

      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
