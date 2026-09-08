import React, { useState, useEffect } from "react";
import { 
  Map as MapIcon, 
  FileText, 
  ClipboardCheck, 
  HandCoins, 
  Home, 
  FileBarChart, 
  ShieldAlert, 
  Bell, 
  User, 
  LayoutDashboard, 
  LogOut, 
  FolderOpen,
  UserCheck
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

export function Sidebar({
  activeTab,
  setActiveTab,
  language,
}: {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  language: "en" | "hi";
}) ( { activeTab: string, setActiveTab: (tab: string) => void }) {
  const { user, logout } = useAuth();

 const tabs = [
  {
    id: "dashboard",
    label: language === "hi" ? "राष्ट्रीय डैशबोर्ड" : "National Dashboard",
    icon: LayoutDashboard,
  },
  {
    id: "proposals",
    label: language === "hi" ? "प्रस्ताव" : "Proposals",
    icon: FileText,
  },
  {
    id: "map",
    label: language === "hi" ? "जीआईएस मानचित्र" : "GIS Map",
    icon: MapIcon,
  },
  {
    id: "compensation",
    label: language === "hi" ? "मुआवज़ा" : "Compensation",
    icon: HandCoins,
  },
  {
    id: "rnr",
    label: "R&R",
    icon: Home,
  },
  {
    id: "documents",
    label: language === "hi" ? "दस्तावेज़" : "Documents",
    icon: FolderOpen,
  },
  {
    id: "awards",
    label: language === "hi" ? "पुरस्कार" : "Awards",
    icon: ClipboardCheck,
  },
  {
    id: "reports",
    label: language === "hi" ? "रिपोर्ट्स" : "Reports",
    icon: FileBarChart,
  },
  {
    id: "grievance",
    label: language === "hi" ? "शिकायत" : "Grievance",
    icon: ShieldAlert,
  },
];
  const getRoleBadgeColor = (role?: string) => {
    switch (role) {
      case "SUPER_ADMIN": return "bg-alluvium-red/10 text-alluvium-red border-alluvium-red/30";
      case "CENTRAL_MINISTRY": return "bg-tilled-earth/10 text-tilled-earth border-tilled-earth/30";
      case "STATE_GOVERNMENT": return "bg-cultivated-green/10 text-cultivated-green border-cultivated-green/30";
      default: return "bg-graticule-teal/10 text-graticule-teal border-graticule-teal/30";
    }
  };

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
      
      <div className="p-4 border-t border-graticule-teal/30 bg-white/40">
        <div className="flex justify-between items-center mb-1">
          <div className="text-[10px] text-graticule-teal font-mono uppercase tracking-wider">Active Session</div>
          {user && (
            <span className={`text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 border rounded-xs ${getRoleBadgeColor(user.role)}`}>
              {user.role.replace(/_/g, " ")}
            </span>
          )}
        </div>
        <div className="text-sm font-semibold text-registry-ink truncate" title={user?.fullName || "District LAO"}>
          {user?.fullName || "District LAO"}
        </div>
        <div className="text-xs text-registry-ink/70 truncate">
          {user?.district ? `${user.district}, ${user.state}` : user?.state || "National Registry"}
        </div>
        {user && (
          <button 
            onClick={logout}
            className="mt-2 text-xs text-alluvium-red/80 hover:text-alluvium-red flex items-center gap-1 transition-colors"
          >
            <LogOut className="w-3 h-3" /> Sign Out
          </button>
        )}
      </div>
    </aside>
  );

}
 export function TopNav({
  setActiveTab,
  selectedState = "All States",
  setSelectedState,
  selectedDistrict = "All Districts",
  setSelectedDistrict,
  onOpenLogin,
  language,
  setLanguage,
}: {
  setActiveTab?: (tab: string) => void;
  selectedState?: string;
  setSelectedState?: (s: string) => void;
  selectedDistrict?: string;
  setSelectedDistrict?: (d: string) => void;
  onOpenLogin?: () => void;
  language: "en" | "hi";
  setLanguage: (language: "en" | "hi") => void;
}) {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(3);

  useEffect(() => {
    fetch("/api/v1/alerts")
      .then((res) => res.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : data?.data || [];
        const unread = list.filter((a: any) => !a.isRead).length;
        setUnreadCount(unread);
      })
      .catch(() => {});
  }, []);

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
    if (setSelectedDistrict) setSelectedDistrict("All Districts");
  };

  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (setSelectedDistrict) setSelectedDistrict(e.target.value);
  };

  const currentDistricts = stateDistricts[selectedState] || ["All Districts"];

  return (
    <header className="h-16 border-b border-graticule-teal/30 bg-survey-paper flex items-center justify-between px-6 shrink-0">
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 bg-registry-ink text-survey-paper flex items-center justify-center font-serif font-bold text-lg rounded-sm shadow-xs">
          B
        </div>
        <div>
          <h1 className="text-xl leading-tight font-serif font-semibold text-registry-ink">BhoomiSetu</h1>
          <div className="text-[10px] uppercase tracking-widest text-tilled-earth font-mono">Dept. of Land Resources • MoRD</div>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="hidden md:flex items-center border border-graticule-teal/30 rounded-sm bg-white overflow-hidden text-sm shadow-xs">
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
  <button
    onClick={() => setLanguage(language === "en" ? "hi" : "en")}
    className="text-graticule-teal hover:text-registry-ink text-sm font-medium"
  >
    {language === "en" ? "EN" : "HI"}
    <span className="text-graticule-teal/50">
      {language === "en" ? " / HI" : " / EN"}
    </span>
  </button>
          
          <button 
            onClick={() => setActiveTab && setActiveTab('alerts')}
            className="relative text-graticule-teal hover:text-registry-ink transition-colors p-1"
            title="View Alerts"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 h-4 min-w-[16px] px-1 bg-alluvium-red text-white text-[10px] font-mono font-bold rounded-full flex items-center justify-center border-2 border-survey-paper">
                {unreadCount}
              </span>
            )}
          </button>

          <button 
            onClick={onOpenLogin}
            className="flex items-center gap-2 pl-2 pr-3 py-1 bg-white hover:bg-graticule-teal/10 border border-graticule-teal/30 rounded-sm text-registry-ink text-xs font-medium transition-colors shadow-xs"
            title="Switch Role or Sign In"
          >
            <div className="h-6 w-6 rounded-full bg-graticule-teal/20 flex items-center justify-center text-registry-ink">
              <User className="h-3.5 w-3.5" />
            </div>
            <div className="text-left hidden sm:block max-w-[120px] truncate">
              <div className="font-semibold text-registry-ink leading-tight truncate">{user?.fullName?.split(' ')[0] || "Sign In"}</div>
              <div className="text-[10px] text-graticule-teal uppercase font-mono truncate">{user?.role?.replace(/_/g, ' ') || "Guest"}</div>
            </div>
          </button>
        </div>
      </div>
    </header>
  );
}
