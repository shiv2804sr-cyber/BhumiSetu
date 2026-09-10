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
}) {
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
      case "SUPER_ADMIN": 
        return "bg-red-100/80 text-alluvium-red border border-alluvium-red/40";
      case "CENTRAL_MINISTRY": 
        return "bg-amber-100/80 text-earth-accent border border-earth-accent/40";
      case "STATE_GOVERNMENT": 
        return "bg-soft-green text-forest-light border border-forest-light/40";
      default: 
        return "bg-soft-teal text-graticule-teal border border-graticule-teal/40";
    }
  };

  return (
    <aside className="w-64 border-r border-neutral-stone/40 h-[calc(100vh-64px)] overflow-y-auto bg-forest-dark flex flex-col hidden md:flex">
      <nav className="p-4 space-y-1 flex-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-all rounded-lg border-l-4 ${
              activeTab === tab.id
                ? "border-earth-accent bg-soft-green/20 text-cream-soft font-medium shadow-sm"
                : "border-transparent text-secondary-text/80 hover:bg-forest-light/20 hover:text-cream-soft"
            }`}
          >
            <tab.icon className={`h-4 w-4 transition-colors ${activeTab === tab.id ? "text-earth-accent" : "text-secondary-text/70"}`} />
            {tab.label}
          </button>
        ))}
      </nav>
      
      <div className="p-4 border-t border-forest-light/30 bg-forest-light/30 backdrop-blur-sm">
        <div className="flex justify-between items-center mb-2">
          <div className="text-[9px] text-earth-accent/80 font-mono uppercase tracking-widest">Active Session</div>
          {user && (
            <span className={`text-[9px] uppercase font-bold tracking-wider px-2 py-1 border rounded-sm ${getRoleBadgeColor(user.role)}`}>
              {user.role.replace(/_/g, " ")}
            </span>
          )}
        </div>
        <div className="text-sm font-semibold text-cream-soft truncate" title={user?.fullName || "District LAO"}>
          {user?.fullName || "District LAO"}
        </div>
        <div className="text-xs text-secondary-text/80 truncate">
          {user?.district ? `${user.district}, ${user.state}` : user?.state || "National Registry"}
        </div>
        {user && (
          <button 
            onClick={logout}
            className="mt-3 text-xs text-earth-accent/90 hover:text-earth-accent flex items-center gap-1.5 transition-colors font-medium"
          >
            <LogOut className="w-3.5 h-3.5" /> Sign Out
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
    <header className="h-16 border-b border-neutral-stone/40 bg-survey-paper flex items-center justify-between px-6 shrink-0 shadow-sm">
      <div className="flex items-center gap-4">
        {/* Refined B Logo */}
        <div className="h-10 w-10 bg-gradient-to-br from-forest-light to-forest-dark text-cream-soft flex items-center justify-center font-serif font-black text-xl rounded-lg shadow-md border border-earth-accent/60 relative">
          B
          <div className="absolute bottom-0.5 right-0.5 h-1.5 w-1.5 bg-earth-accent rounded-full"></div>
        </div>
        
        <div>
          <h1 className="text-lg leading-tight font-serif font-bold text-registry-ink">BhoomiSetu</h1>
          <div className="text-[9px] uppercase tracking-widest text-earth-accent/80 font-mono">Dept. of Land Resources • MoRD</div>
        </div>
      </div>

      <div className="flex items-center gap-6">
        {/* State & District Selectors */}
        <div className="hidden md:flex items-center border border-neutral-stone/50 rounded-lg bg-cream-soft overflow-hidden text-sm shadow-sm">
          <select 
            value={selectedState} 
            onChange={handleStateChange}
            className="px-4 py-2 bg-transparent outline-none border-r border-neutral-stone/40 text-registry-ink font-medium cursor-pointer hover:bg-soft-green/5 transition-colors"
          >
            {Object.keys(stateDistricts).map(state => (
              <option key={state} value={state}>{state}</option>
            ))}
          </select>
          <select 
            value={selectedDistrict}
            onChange={handleDistrictChange}
            className="px-4 py-2 bg-transparent outline-none text-registry-ink cursor-pointer max-w-[150px] hover:bg-soft-green/5 transition-colors"
          >
            {currentDistricts.map(district => (
              <option key={district} value={district}>{district}</option>
            ))}
          </select>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-5 border-l border-neutral-stone/40 pl-6">
          {/* Language Toggle */}
          <button
            onClick={() => setLanguage(language === "en" ? "hi" : "en")}
            className="text-earth-accent hover:text-forest-light text-sm font-semibold transition-colors"
          >
            {language === "en" ? "EN" : "HI"}
            <span className="text-earth-accent/40 ml-0.5">
              {language === "en" ? " / HI" : " / EN"}
            </span>
          </button>
          
          {/* Notifications */}
          <button 
            onClick={() => setActiveTab && setActiveTab('alerts')}
            className="relative text-earth-accent hover:text-forest-light transition-colors p-1.5 hover:bg-soft-green/20 rounded-lg"
            title="View Alerts"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 h-5 min-w-[20px] px-1.5 bg-alluvium-red text-white text-[10px] font-mono font-bold rounded-full flex items-center justify-center border-2 border-survey-paper shadow-sm">
                {unreadCount}
              </span>
            )}
          </button>

          {/* User Profile */}
          <button 
            onClick={onOpenLogin}
            className="flex items-center gap-3 pl-3 pr-4 py-1.5 bg-cream-soft hover:bg-soft-green/30 border border-neutral-stone/40 rounded-lg text-registry-ink text-xs font-semibold transition-all shadow-sm hover:shadow-md hover:border-forest-light/40"
            title="Switch Role or Sign In"
          >
            <div className="h-7 w-7 rounded-full bg-forest-light/20 border border-forest-light/40 flex items-center justify-center text-forest-light">
              <User className="h-4 w-4" />
            </div>
            <div className="text-left hidden sm:block max-w-[120px] truncate">
              <div className="font-semibold text-registry-ink leading-tight truncate">{user?.fullName?.split(' ')[0] || "Sign In"}</div>
              <div className="text-[9px] text-earth-accent/70 uppercase font-mono truncate">{user?.role?.replace(/_/g, ' ') || "Guest"}</div>
            </div>
          </button>
        </div>
      </div>
    </header>
  );
}