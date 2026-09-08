import { Map as MapIcon, FileText, ClipboardCheck, HandCoins, Home, FileBarChart, ShieldAlert, Bell, User, LayoutDashboard, Database, FolderOpen } from "lucide-react";

export function Sidebar({ activeTab, setActiveTab }: { activeTab: string, setActiveTab: (tab: string) => void }) {
  const tabs = [
    { id: "dashboard", label: "National Dashboard", icon: LayoutDashboard },
    { id: "proposals", label: "Proposals", icon: FileText },
    { id: "map", label: "GIS Map", icon: MapIcon },
    { id: "compensation", label: "Compensation", icon: HandCoins },
    { id: "rnr", label: "R&R", icon: Home },
    { id: "documents", label: "Documents", icon: FolderOpen },
    { id: "awards", label: "Awards", icon: ClipboardCheck },
    { id: "reports", label: "Reports", icon: FileBarChart },
    { id: "grievance", label: "Grievance", icon: ShieldAlert },
  ];

  return (
    <aside className="w-64 border-r border-graticule-teal/30 h-[calc(100vh-64px)] overflow-y-auto bg-survey-paper flex flex-col hidden md:flex">
      <nav className="p-4 space-y-1 flex-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm transition-colors rounded-none border-l-2 ${
              activeTab === tab.id
                ? "border-tilled-earth bg-graticule-teal/10 text-registry-ink font-medium"
                : "border-transparent text-registry-ink/70 hover:bg-graticule-teal/5 hover:text-registry-ink"
            }`}
          >
            <tab.icon className={`h-4 w-4 ${activeTab === tab.id ? "text-tilled-earth" : "text-graticule-teal"}`} />
            {tab.label}
          </button>
        ))}
      </nav>
      <div className="p-4 border-t border-graticule-teal/30">
        <div className="text-xs text-graticule-teal mb-2 font-mono uppercase tracking-wider">Session Info</div>
        <div className="text-sm font-medium">District LAO</div>
        <div className="text-xs text-registry-ink/70">New Delhi, NCT</div>
      </div>
    </aside>
  );
}

export function TopNav({ 
  setActiveTab,
  selectedState = "All States",
  setSelectedState,
  selectedDistrict = "All Districts",
  setSelectedDistrict
}: { 
  setActiveTab?: (tab: string) => void,
  selectedState?: string,
  setSelectedState?: (s: string) => void,
  selectedDistrict?: string,
  setSelectedDistrict?: (d: string) => void
}) {
  const stateDistricts: Record<string, string[]> = {
    "All States": ["All Districts"],
    "Delhi": ["All Districts", "New Delhi", "North Delhi", "South Delhi", "East Delhi", "West Delhi"],
    "Haryana": ["All Districts", "Nuh", "Gurugram", "Faridabad", "Rohtak", "Hisar", "Ambala"],
    "Uttar Pradesh": ["All Districts", "Lucknow", "Kanpur", "Agra", "Varanasi", "Noida", "Meerut"],
    "Maharashtra": ["All Districts", "Pune", "Mumbai", "Nashik", "Nagpur", "Thane"],
    "Tamil Nadu": ["All Districts", "Chennai", "Kanchipuram", "Coimbatore", "Madurai"]
  };

  const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newState = e.target.value;
    if (setSelectedState) setSelectedState(newState);
    if (setSelectedDistrict) setSelectedDistrict("All Districts"); // Reset district on state change
  };

  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (setSelectedDistrict) setSelectedDistrict(e.target.value);
  };

  const currentDistricts = stateDistricts[selectedState] || ["All Districts"];

  return (
    <header className="h-16 border-b border-graticule-teal/30 bg-survey-paper flex items-center justify-between px-6 shrink-0">
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 bg-registry-ink text-survey-paper flex items-center justify-center font-serif font-bold text-lg rounded-sm">
          B
        </div>
        <div>
          <h1 className="text-xl leading-tight">BhoomiSetu</h1>
          <div className="text-[10px] uppercase tracking-widest text-tilled-earth font-mono">Dept. of Land Resources</div>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="hidden md:flex items-center border border-graticule-teal/30 rounded-sm bg-white overflow-hidden text-sm">
          <select 
            value={selectedState} 
            onChange={handleStateChange}
            className="px-3 py-1.5 bg-transparent outline-none border-r border-graticule-teal/30 text-registry-ink font-medium cursor-pointer"
          >
            {Object.keys(stateDistricts).map(state => (
              <option key={state} value={state}>{state}</option>
            ))}
          </select>
          <select 
            value={selectedDistrict}
            onChange={handleDistrictChange}
            className="px-3 py-1.5 bg-transparent outline-none text-registry-ink cursor-pointer max-w-[150px]"
          >
            {currentDistricts.map(district => (
              <option key={district} value={district}>{district}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-4 border-l border-graticule-teal/30 pl-6">
          <button className="text-graticule-teal hover:text-registry-ink text-sm font-medium">
            EN <span className="text-graticule-teal/50">/ HI</span>
          </button>
          <button 
            onClick={() => setActiveTab && setActiveTab('alerts')}
            className="relative text-graticule-teal hover:text-registry-ink transition-colors"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 h-2.5 w-2.5 bg-alluvium-red rounded-full border-2 border-survey-paper"></span>
          </button>
          <button className="h-8 w-8 rounded-full bg-graticule-teal/10 flex items-center justify-center text-registry-ink border border-graticule-teal/30 hover:bg-graticule-teal/20 transition-colors">
            <User className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
