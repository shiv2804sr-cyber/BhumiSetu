import bhumisetuLogo from "../assets/bhumisetu-logo.png";
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
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

/* =========================================================
   COMMON ROLE TRANSLATION
   Used by both Sidebar and TopNav
   ========================================================= */

const translateRole = (
  role?: string,
  language: "en" | "hi" = "en"
) => {
  if (!role) {
    return language === "hi"
      ? "अतिथि"
      : "GUEST";
  }

  if (language === "en") {
    return role.replace(/_/g, " ");
  }

  const roleTranslations: Record<string, string> = {
    SUPER_ADMIN: "सुपर एडमिन",
    CENTRAL_MINISTRY: "केंद्रीय मंत्रालय",
    STATE_GOVERNMENT: "राज्य सरकार",
    DISTRICT_AUTHORITY: "जिला प्राधिकरण",
    PIA: "पीआईए",
    FIELD_OFFICER: "फील्ड अधिकारी",
    VIEWER: "दर्शक",
    ADMIN: "एडमिन",
    USER: "उपयोगकर्ता",
  };

  return roleTranslations[role] || role.replace(/_/g, " ");
};

/* =========================================================
   SIDEBAR
   ========================================================= */

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
      label:
        language === "hi"
          ? "राष्ट्रीय डैशबोर्ड"
          : "National Dashboard",
      icon: LayoutDashboard,
    },
    {
      id: "proposals",
      label:
        language === "hi"
          ? "प्रस्ताव"
          : "Proposals",
      icon: FileText,
    },
    {
      id: "map",
      label:
        language === "hi"
          ? "जीआईएस मानचित्र"
          : "GIS Map",
      icon: MapIcon,
    },
    {
      id: "compensation",
      label:
        language === "hi"
          ? "मुआवज़ा"
          : "Compensation",
      icon: HandCoins,
    },
    {
      id: "rnr",
      label: "R&R",
      icon: Home,
    },
    {
      id: "documents",
      label:
        language === "hi"
          ? "दस्तावेज़"
          : "Documents",
      icon: FolderOpen,
    },
    {
      id: "awards",
      label:
        language === "hi"
          ? "पुरस्कार"
          : "Awards",
      icon: ClipboardCheck,
    },
    {
      id: "reports",
      label:
        language === "hi"
          ? "रिपोर्ट"
          : "Reports",
      icon: FileBarChart,
    },
    {
      id: "grievance",
      label:
        language === "hi"
          ? "शिकायत"
          : "Grievance",
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

      {/* =====================================================
          NAVIGATION
          ===================================================== */}

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
            <tab.icon
              className={`h-4 w-4 transition-colors ${
                activeTab === tab.id
                  ? "text-earth-accent"
                  : "text-secondary-text/70"
              }`}
            />

            {tab.label}
          </button>
        ))}
      </nav>

      {/* =====================================================
          ACTIVE SESSION
          ===================================================== */}

      <div className="p-4 border-t border-forest-light/30 bg-forest-light/30 backdrop-blur-sm">

        <div className="flex justify-between items-center mb-2">

          <div className="text-[9px] text-earth-accent/80 font-mono uppercase tracking-widest">
            {language === "hi"
              ? "सक्रिय सत्र"
              : "Active Session"}
          </div>

          {/* Role Badge */}

          <span
            className={`text-[9px] uppercase font-bold tracking-wider px-2 py-1 border rounded-sm ${getRoleBadgeColor(
              user?.role
            )}`}
          >
            {translateRole(user?.role, language)}
          </span>
        </div>

        {/* ===================================================
            USER NAME
            =================================================== */}

        <div
          className="text-sm font-semibold text-cream-soft truncate"
          title={
            user?.fullName ||
            (language === "hi"
              ? "अतिथि उपयोगकर्ता"
              : "Guest User")
          }
        >
          {user?.fullName ||
            (language === "hi"
              ? "अतिथि उपयोगकर्ता"
              : "Guest User")}
        </div>

        {/* ===================================================
            DISTRICT / STATE
            =================================================== */}

        {user && (
          <div className="text-xs text-secondary-text/80 truncate">
            {user.district
              ? `${user.district}, ${user.state}`
              : user.state || ""}
          </div>
        )}

        {/* ===================================================
            SIGN OUT
            =================================================== */}

        {user && (
          <button
            onClick={logout}
            className="mt-3 text-xs text-earth-accent/90 hover:text-earth-accent flex items-center gap-1.5 transition-colors font-medium"
          >
            <LogOut className="w-3.5 h-3.5" />

            {language === "hi"
              ? "साइन आउट"
              : "Sign Out"}
          </button>
        )}
      </div>
    </aside>
  );
}

/* =========================================================
   TOP NAVIGATION
   ========================================================= */

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

  /* =======================================================
     LOAD ALERT COUNT
     ======================================================= */

  useEffect(() => {
    fetch("/api/v1/alerts")
      .then((res) => res.json())
      .then((data) => {
        const list = Array.isArray(data)
          ? data
          : data?.data || [];

        const unread = list.filter(
          (a: any) => !a.isRead
        ).length;

        setUnreadCount(unread);
      })
      .catch(() => {});
  }, []);

  /* =======================================================
     STATE / DISTRICT DATA
     ======================================================= */

  const stateDistricts: Record<string, string[]> = {
    "All States": ["All Districts"],

    Delhi: [
      "All Districts",
      "New Delhi",
      "North Delhi",
      "South Delhi",
      "East Delhi",
      "West Delhi",
    ],

    Haryana: [
      "All Districts",
      "Nuh",
      "Gurugram",
      "Faridabad",
      "Rohtak",
      "Hisar",
      "Ambala",
    ],

    "Uttar Pradesh": [
      "All Districts",
      "Lucknow",
      "Kanpur",
      "Agra",
      "Varanasi",
      "Noida",
      "Meerut",
    ],

    Maharashtra: [
      "All Districts",
      "Pune",
      "Mumbai",
      "Nashik",
      "Nagpur",
      "Thane",
    ],

    "Tamil Nadu": [
      "All Districts",
      "Chennai",
      "Kanchipuram",
      "Coimbatore",
      "Madurai",
    ],

    Karnataka: [
      "All Districts",
      "Bangalore",
      "Mysore",
      "Belgaum",
      "Mangalore",
      "Hubli",
      "Tumkur",
    ],

    "Madhya Pradesh": [
      "All Districts",
      "Indore",
      "Bhopal",
      "Jabalpur",
      "Gwalior",
      "Ujjain",
      "Sagar",
    ],

    Rajasthan: [
      "All Districts",
      "Jaipur",
      "Jodhpur",
      "Udaipur",
      "Ajmer",
      "Bikaner",
      "Kota",
    ],

    Jharkhand: [
      "All Districts",
      "Ranchi",
      "Dhanbad",
      "Giridih",
      "Bokaro",
      "Hazaribagh",
      "Deoghar",
    ],

    Bihar: [
      "All Districts",
      "Patna",
      "Gaya",
      "Muzaffarpur",
      "Darbhanga",
      "Bhagalpur",
      "Madhubani",
    ],
  };

  /* =======================================================
     STATE TRANSLATION
     ======================================================= */

  const translateState = (state: string) => {
    if (language === "en") {
      return state;
    }

    const stateTranslations: Record<string, string> = {
      "All States": "सभी राज्य",

      Delhi: "दिल्ली",
      Haryana: "हरियाणा",
      "Uttar Pradesh": "उत्तर प्रदेश",
      Maharashtra: "महाराष्ट्र",
      "Tamil Nadu": "तमिलनाडु",
      Karnataka: "कर्नाटक",
      "Madhya Pradesh": "मध्य प्रदेश",
      Rajasthan: "राजस्थान",
      Jharkhand: "झारखंड",
      Bihar: "बिहार",
    };

    return stateTranslations[state] || state;
  };

  /* =======================================================
     DISTRICT TRANSLATION
     ======================================================= */

  const translateDistrict = (district: string) => {
    if (language === "en") {
      return district;
    }

    const districtTranslations: Record<string, string> = {
      "All Districts": "सभी जिले",

      "New Delhi": "नई दिल्ली",
      "North Delhi": "उत्तर दिल्ली",
      "South Delhi": "दक्षिण दिल्ली",
      "East Delhi": "पूर्वी दिल्ली",
      "West Delhi": "पश्चिमी दिल्ली",

      Nuh: "नूंह",
      Gurugram: "गुरुग्राम",
      Faridabad: "फरीदाबाद",
      Rohtak: "रोहतक",
      Hisar: "हिसार",
      Ambala: "अंबाला",

      Lucknow: "लखनऊ",
      Kanpur: "कानपुर",
      Agra: "आगरा",
      Varanasi: "वाराणसी",
      Noida: "नोएडा",
      Meerut: "मेरठ",

      Pune: "पुणे",
      Mumbai: "मुंबई",
      Nashik: "नासिक",
      Nagpur: "नागपुर",
      Thane: "ठाणे",

      Chennai: "चेन्नई",
      Kanchipuram: "कांचीपुरम",
      Coimbatore: "कोयंबटूर",
      Madurai: "मदुरै",

      Bangalore: "बेंगलुरु",
      Mysore: "मैसूर",
      Belgaum: "बेलगावी",
      Mangalore: "मंगलुरु",
      Hubli: "हुबली",
      Tumkur: "तुमकुरु",

      Indore: "इंदौर",
      Bhopal: "भोपाल",
      Jabalpur: "जबलपुर",
      Gwalior: "ग्वालियर",
      Ujjain: "उज्जैन",
      Sagar: "सागर",

      Jaipur: "जयपुर",
      Jodhpur: "जोधपुर",
      Udaipur: "उदयपुर",
      Ajmer: "अजमेर",
      Bikaner: "बीकानेर",
      Kota: "कोटा",

      Ranchi: "रांची",
      Dhanbad: "धनबाद",
      Giridih: "गिरिडीह",
      Bokaro: "बोकारो",
      Hazaribagh: "हजारीबाग",
      Deoghar: "देवघर",

      Patna: "पटना",
      Gaya: "गया",
      Muzaffarpur: "मुजफ्फरपुर",
      Darbhanga: "दरभंगा",
      Bhagalpur: "भागलपुर",
      Madhubani: "मधुबनी",
    };

    return districtTranslations[district] || district;
  };

  /* =======================================================
     STATE CHANGE
     ======================================================= */

  const handleStateChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const newState = e.target.value;

    if (setSelectedState) {
      setSelectedState(newState);
    }

    if (setSelectedDistrict) {
      setSelectedDistrict("All Districts");
    }
  };

  /* =======================================================
     DISTRICT CHANGE
     ======================================================= */

  const handleDistrictChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    if (setSelectedDistrict) {
      setSelectedDistrict(e.target.value);
    }
  };

  const currentDistricts =
    stateDistricts[selectedState] || ["All Districts"];

  /* =======================================================
     RENDER
     ======================================================= */

  return (
    <header className="h-16 border-b border-neutral-stone/40 bg-survey-paper flex items-center justify-between px-6 shrink-0 shadow-sm">

      {/* ===================================================
          LEFT SECTION
          =================================================== */}

      <div className="flex items-center gap-1">

        {/* BhoomiSetu Logo */}

        <div className="h-18 w-18 flex items-center justify-center shrink-0">
          <img
            src={bhumisetuLogo}
            alt="BhoomiSetu Logo"
            className="h-full w-full object-contain"
          />
        </div>

        {/* Brand */}

        <div>
          <h1 className="text-lg leading-tight font-serif font-bold tracking-tight">

            <span className="text-forest-dark">
              Bhoomi
            </span>

            <span className="text-earth-accent">
              Setu
            </span>

          </h1>

          <div className="text-[9px] uppercase tracking-widest text-earth-accent/80 font-mono">
            {language === "hi"
              ? "भूमि संसाधन विभाग • भारत सरकार"
              : "Department of Land Resources • Government of India"}
          </div>
        </div>
      </div>

      {/* ===================================================
          RIGHT SECTION
          =================================================== */}

      <div className="flex items-center gap-6">

        {/* =================================================
            STATE & DISTRICT
            ================================================= */}

        <div className="hidden md:flex items-center border border-neutral-stone/50 rounded-lg bg-cream-soft overflow-hidden text-sm shadow-sm">

          {/* State Selector */}

          <select
            value={selectedState}
            onChange={handleStateChange}
            className="px-4 py-2 bg-transparent outline-none border-r border-neutral-stone/40 text-registry-ink font-medium cursor-pointer hover:bg-soft-green/5 transition-colors"
          >
            {Object.keys(stateDistricts).map((state) => (
              <option
                key={state}
                value={state}
              >
                {translateState(state)}
              </option>
            ))}
          </select>

          {/* District Selector */}

          <select
            value={selectedDistrict}
            onChange={handleDistrictChange}
            className="px-4 py-2 bg-transparent outline-none text-registry-ink cursor-pointer max-w-[150px] hover:bg-soft-green/5 transition-colors"
          >
            {currentDistricts.map((district) => (
              <option
                key={district}
                value={district}
              >
                {translateDistrict(district)}
              </option>
            ))}
          </select>
        </div>

        {/* =================================================
            RIGHT CONTROLS
            ================================================= */}

        <div className="flex items-center gap-5 border-l border-neutral-stone/40 pl-6">

          {/* =================================================
              LANGUAGE TOGGLE
              ================================================= */}

          <button
            onClick={() =>
              setLanguage(
                language === "en"
                  ? "hi"
                  : "en"
              )
            }
            className="text-earth-accent hover:text-forest-light text-sm font-semibold transition-colors"
          >
            {language === "en"
              ? "EN"
              : "HI"}

            <span className="text-earth-accent/40 ml-0.5">
              {language === "en"
                ? " / HI"
                : " / EN"}
            </span>
          </button>

          {/* =================================================
              NOTIFICATIONS
              ================================================= */}

          <button
            onClick={() =>
              setActiveTab &&
              setActiveTab("alerts")
            }
            className="relative text-earth-accent hover:text-forest-light transition-colors p-1.5 hover:bg-soft-green/20 rounded-lg"
            title={
              language === "hi"
                ? "सूचनाएं देखें"
                : "View Alerts"
            }
          >
            <Bell className="h-5 w-5" />

            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 h-5 min-w-[20px] px-1.5 bg-alluvium-red text-white text-[10px] font-mono font-bold rounded-full flex items-center justify-center border-2 border-survey-paper shadow-sm">
                {unreadCount}
              </span>
            )}
          </button>

          {/* =================================================
              USER PROFILE
              ================================================= */}

          <button
            onClick={onOpenLogin}
            className="flex items-center gap-3 pl-3 pr-4 py-1.5 bg-cream-soft hover:bg-soft-green/30 border border-neutral-stone/40 rounded-lg text-registry-ink text-xs font-semibold transition-all shadow-sm hover:shadow-md hover:border-forest-light/40"
            title={
              language === "hi"
                ? "भूमिका बदलें या साइन इन करें"
                : "Switch Role or Sign In"
            }
          >

            {/* User Icon */}

            <div className="h-7 w-7 rounded-full bg-forest-light/20 border border-forest-light/40 flex items-center justify-center text-forest-light">
              <User className="h-4 w-4" />
            </div>

            {/* User Details */}

            <div className="text-left hidden sm:block max-w-[120px] truncate">

              {/* First Name */}

              <div className="font-semibold text-registry-ink leading-tight truncate">
                {user?.fullName?.split(" ")[0] ||
                  (language === "hi"
                    ? "अतिथि"
                    : "Guest")}
              </div>

              {/* Role */}

              <div className="text-[9px] text-earth-accent/70 uppercase font-mono truncate">
                {user?.role
                  ? translateRole(
                      user.role,
                      language
                    )
                  : language === "hi"
                    ? "अतिथि उपयोगकर्ता"
                    : "Guest User"}
              </div>

            </div>
          </button>
        </div>
      </div>
    </header>
  );
}