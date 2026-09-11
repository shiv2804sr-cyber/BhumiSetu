import { useEffect, useRef, useState } from "react";
import Map, {
  GeolocateControl,
  Layer,
  NavigationControl,
  Source,
  type MapRef,
} from "react-map-gl/maplibre";

import "maplibre-gl/dist/maplibre-gl.css";

interface GISMapProps {
  selectedState?: string;
  selectedDistrict?: string;
}

interface ParcelProperties {
  ulpin?: string;
  status?: string;
  area?: number | string;
  state?: string;
  district?: string;
  village?: string;
  project?: string;
  [key: string]: any;
}

interface ParcelFeature {
  type: "Feature";
  id?: string | number;
  properties?: ParcelProperties;
  geometry: {
    type: string;
    coordinates: any;
  };
}

interface ParcelCollection {
  type: "FeatureCollection";
  features: ParcelFeature[];
}

/* =========================================================
   STATE LOCATIONS
========================================================= */

const stateCoordinates: Record<string, [number, number]> = {
  "All States": [78.9629, 22.5937],

  Delhi: [77.1025, 28.7041],
  Haryana: [76.0856, 29.0588],
  "Uttar Pradesh": [80.9462, 26.8467],
  Maharashtra: [75.7139, 19.7515],
  "Tamil Nadu": [78.6569, 11.1271],
  Karnataka: [75.7139, 15.3173],
  "Madhya Pradesh": [78.1734, 22.9734],
  Rajasthan: [74.2179, 27.0238],
  Jharkhand: [85.2799, 23.6102],
  Bihar: [85.3131, 25.0961],
  Gujarat: [71.1924, 22.2587],
  Punjab: [75.3412, 31.1471],
  "West Bengal": [87.855, 22.9868],
  Odisha: [85.0985, 20.9517],
  Telangana: [79.0193, 18.1124],
  Kerala: [76.2711, 10.8505],
  "Andhra Pradesh": [79.74, 15.9129],
  Chhattisgarh: [81.8661, 21.2787],
  Uttarakhand: [79.0193, 30.0668],
  "Himachal Pradesh": [77.1734, 31.1048],
  Assam: [92.9376, 26.2006],
  Goa: [74.124, 15.2993],
};

/* =========================================================
   STATUS COLOURS
========================================================= */

const STATUS_COLORS: Record<string, string> = {
  "Section 11 Notification": "#FF7A00",
  "Section 11": "#FF7A00",
  Notification: "#FF7A00",

  Award: "#00C853",
  "Section 23 Award": "#00C853",

  Possession: "#008CFF",
  "Section 38 Possession": "#008CFF",
  "Section 38 Land Possession": "#008CFF",

  Settlement: "#8B3DFF",
  "R&R Settlement": "#8B3DFF",
  "R&R Entitlements Settlement": "#8B3DFF",

  "Under Review": "#FFD600",
  Review: "#FFD600",

  Disbursed: "#00C9A7",
  "Direct Benefit Transfer (DBT)": "#00C9A7",
  "PFMS Direct Benefit Transfer": "#00C9A7",

  Disputed: "#FF1744",

  Pending: "#FF3D9A",

  Approved: "#7CFC00",

  "In Progress": "#4F46E5",

  Survey: "#00B8D9",

  Processing: "#D500F9",

  Draft: "#FF9800",

  Completed: "#00A896",
};

const DEFAULT_COLOR = "#22D3EE";

/* =========================================================
   GET STATUS COLOUR
========================================================= */

function getStatusColor(status?: string): string {
  if (!status) {
    return DEFAULT_COLOR;
  }

  if (STATUS_COLORS[status]) {
    return STATUS_COLORS[status];
  }

  const normalized = status.toLowerCase();

  if (normalized.includes("notification")) {
    return "#FF7A00";
  }

  if (normalized.includes("award")) {
    return "#00C853";
  }

  if (normalized.includes("possession")) {
    return "#008CFF";
  }

  if (normalized.includes("settlement")) {
    return "#8B3DFF";
  }

  if (normalized.includes("review")) {
    return "#FFD600";
  }

  if (
    normalized.includes("disburs") ||
    normalized.includes("dbt")
  ) {
    return "#00C9A7";
  }

  if (normalized.includes("disput")) {
    return "#FF1744";
  }

  if (normalized.includes("pending")) {
    return "#FF3D9A";
  }

  if (normalized.includes("approved")) {
    return "#7CFC00";
  }

  if (normalized.includes("progress")) {
    return "#4F46E5";
  }

  if (normalized.includes("survey")) {
    return "#00B8D9";
  }

  if (normalized.includes("processing")) {
    return "#D500F9";
  }

  if (normalized.includes("draft")) {
    return "#FF9800";
  }

  if (normalized.includes("completed")) {
    return "#00A896";
  }

  return DEFAULT_COLOR;
}

/* =========================================================
   COMPONENT
========================================================= */

export function GISMap({
  selectedState = "All States",
  selectedDistrict = "All Districts",
}: GISMapProps) {
  const mapRef = useRef<MapRef | null>(null);

  const [parcels, setParcels] = useState<ParcelCollection>({
    type: "FeatureCollection",
    features: [],
  });

  const [hoverInfo, setHoverInfo] = useState<{
    x: number;
    y: number;
    properties: ParcelProperties;
  } | null>(null);

  const [mapReady, setMapReady] = useState(false);

  const [isLoading, setIsLoading] = useState(true);

  /* =======================================================
     LOAD PARCELS
  ======================================================= */

  useEffect(() => {
    let cancelled = false;

    async function loadParcels() {
      try {
        setIsLoading(true);

        const response = await fetch("/api/parcels");

        if (!response.ok) {
          throw new Error("Failed to fetch parcel data");
        }

        const data = await response.json();

        if (cancelled) {
          return;
        }

        let collection: ParcelCollection;

        if (data?.type === "FeatureCollection") {
          collection = data as ParcelCollection;
        } else if (Array.isArray(data)) {
          collection = {
            type: "FeatureCollection",
            features: data as ParcelFeature[],
          };
        } else if (Array.isArray(data?.features)) {
          collection = {
            type: "FeatureCollection",
            features: data.features as ParcelFeature[],
          };
        } else {
          collection = {
            type: "FeatureCollection",
            features: [],
          };
        }

        setParcels(collection);
      } catch (error) {
        console.error(
          "Failed to load GIS parcel data:",
          error
        );

        if (!cancelled) {
          setParcels({
            type: "FeatureCollection",
            features: [],
          });
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadParcels();

    return () => {
      cancelled = true;
    };
  }, []);

  /* =======================================================
     MOVE MAP WHEN STATE / DISTRICT CHANGES
  ======================================================= */

  useEffect(() => {
    if (!mapReady || !mapRef.current) {
      return;
    }

    const coordinates =
      stateCoordinates[selectedState] ||
      stateCoordinates["All States"];

    mapRef.current.flyTo({
      center: coordinates,
      zoom:
        selectedState === "All States"
          ? 4.6
          : 6.3,
      duration: 1200,
      essential: true,
    });
  }, [
    selectedState,
    selectedDistrict,
    mapReady,
  ]);

  /* =======================================================
     MAP LOAD
  ======================================================= */

  const handleMapLoad = () => {
    setMapReady(true);
  };

  /* =======================================================
     MOUSE HOVER
  ======================================================= */

  const handleMouseMove = (event: any) => {
    const feature = event.features?.[0];

    if (!feature) {
      setHoverInfo(null);
      return;
    }

    setHoverInfo({
      x: event.point.x,
      y: event.point.y,
      properties: feature.properties || {},
    });
  };

  const handleMouseLeave = () => {
    setHoverInfo(null);
  };

  /* =======================================================
     ESRI STREET MAP
  ======================================================= */

  const mapStyle = {
    version: 8 as const,

    sources: {
      esri: {
        type: "raster" as const,

        tiles: [
          "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}",
        ],

        tileSize: 256,

        attribution:
          "Tiles © Esri | Map data contributors",
      },
    },

    layers: [
      {
        id: "esri-base-map",

        type: "raster" as const,

        source: "esri",

        minzoom: 0,

        maxzoom: 19,

        paint: {
          "raster-opacity": 1,

          "raster-saturation": 0.18,

          "raster-contrast": 0.08,

          "raster-brightness-min": 0.05,

          "raster-brightness-max": 1,
        },
      },
    ],
  };

  /* =======================================================
     PARCEL FILL COLOUR
  ======================================================= */

  const parcelColorExpression: any = [
    "match",
    ["get", "status"],

    "Section 11 Notification",
    "#FF7A00",

    "Section 11",
    "#FF7A00",

    "Notification",
    "#FF7A00",

    "Award",
    "#00C853",

    "Section 23 Award",
    "#00C853",

    "Possession",
    "#008CFF",

    "Section 38 Possession",
    "#008CFF",

    "Section 38 Land Possession",
    "#008CFF",

    "Settlement",
    "#8B3DFF",

    "R&R Settlement",
    "#8B3DFF",

    "R&R Entitlements Settlement",
    "#8B3DFF",

    "Under Review",
    "#FFD600",

    "Review",
    "#FFD600",

    "Disbursed",
    "#00C9A7",

    "Direct Benefit Transfer (DBT)",
    "#00C9A7",

    "PFMS Direct Benefit Transfer",
    "#00C9A7",

    "Disputed",
    "#FF1744",

    "Pending",
    "#FF3D9A",

    "Approved",
    "#7CFC00",

    "In Progress",
    "#4F46E5",

    "Survey",
    "#00B8D9",

    "Processing",
    "#D500F9",

    "Draft",
    "#FF9800",

    "Completed",
    "#00A896",

    DEFAULT_COLOR,
  ];

  /* =======================================================
     PARCEL BORDER COLOUR
  ======================================================= */

  const parcelLineExpression: any = [
    "match",
    ["get", "status"],

    "Section 11 Notification",
    "#C2410C",

    "Section 11",
    "#C2410C",

    "Notification",
    "#C2410C",

    "Award",
    "#047857",

    "Section 23 Award",
    "#047857",

    "Possession",
    "#0369A1",

    "Section 38 Possession",
    "#0369A1",

    "Section 38 Land Possession",
    "#0369A1",

    "Settlement",
    "#6D28D9",

    "R&R Settlement",
    "#6D28D9",

    "R&R Entitlements Settlement",
    "#6D28D9",

    "Under Review",
    "#B45309",

    "Review",
    "#B45309",

    "Disbursed",
    "#0F766E",

    "Direct Benefit Transfer (DBT)",
    "#0F766E",

    "PFMS Direct Benefit Transfer",
    "#0F766E",

    "Disputed",
    "#BE123C",

    "Pending",
    "#BE185D",

    "Approved",
    "#4D7C0F",

    "In Progress",
    "#3730A3",

    "Survey",
    "#0E7490",

    "Processing",
    "#A21CAF",

    "Draft",
    "#C2410C",

    "Completed",
    "#0F766E",

    "#155E75",
  ];

  /* =======================================================
     LEGEND
  ======================================================= */

  const legendItems: Array<[string, string]> = [
    ["Section 11 Notification", "#FF7A00"],
    ["Award", "#00C853"],
    ["Possession", "#008CFF"],
    ["Settlement", "#8B3DFF"],
    ["Under Review", "#FFD600"],
    ["Disbursed", "#00C9A7"],
    ["Disputed", "#FF1744"],
    ["Pending", "#FF3D9A"],
    ["Approved", "#7CFC00"],
    ["In Progress", "#4F46E5"],
    ["Survey", "#00B8D9"],
    ["Processing", "#D500F9"],
  ];

  /* =======================================================
     RETURN
  ======================================================= */

  return (
    <div className="relative w-full h-full min-h-[500px] overflow-hidden bg-sky-100">

      {/* ===================================================
          MAP
      =================================================== */}

      <Map
        ref={mapRef}

        initialViewState={{
          longitude: 78.9629,
          latitude: 22.5937,
          zoom: 4.6,
        }}

        mapStyle={mapStyle as any}

        style={{
          width: "100%",
          height: "100%",
        }}

        minZoom={3}
        maxZoom={17}

        interactiveLayerIds={[
          "parcel-fill",
          "parcel-outline",
          "proposed-alignment",
        ]}

        onLoad={handleMapLoad}

        onMouseMove={handleMouseMove}

        onMouseLeave={handleMouseLeave}

        cursor={
          hoverInfo
            ? "pointer"
            : "grab"
        }
      >

        {/* =================================================
            NAVIGATION CONTROLS
        ================================================= */}

        <NavigationControl
          position="top-right"
          showCompass={true}
          visualizePitch={true}
        />

        <GeolocateControl
          position="top-right"
          trackUserLocation={false}
          showAccuracyCircle={false}
        />

        {/* =================================================
            PARCEL SOURCE
        ================================================= */}

        <Source
          id="parcels"
          type="geojson"
          data={parcels as any}
        >

          {/* PARCEL FILL */}

          <Layer
            id="parcel-fill"
            type="fill"
            paint={{
              "fill-color":
                parcelColorExpression,

              "fill-opacity": [
                "case",

                [
                  "boolean",
                  ["feature-state", "hover"],
                  false,
                ],

                0.9,

                0.68,
              ],
            }}
          />

          {/* PARCEL OUTLINE */}

          <Layer
            id="parcel-outline"
            type="line"
            paint={{
              "line-color":
                parcelLineExpression,

              "line-width": [
                "case",

                [
                  "boolean",
                  ["feature-state", "hover"],
                  false,
                ],

                3.5,

                1.6,
              ],

              "line-opacity": 0.95,
            }}
          />

        </Source>

        {/* =================================================
            PROPOSED ALIGNMENT
        ================================================= */}

        <Source
          id="alignment"
          type="geojson"
          data={{
            type: "FeatureCollection",
            features: [],
          }}
        >

          <Layer
            id="proposed-alignment"
            type="line"
            paint={{
              "line-color": "#FF3D00",

              "line-width": [
                "interpolate",
                ["linear"],
                ["zoom"],

                4,
                2,

                7,
                4,

                12,
                6,
              ],

              "line-opacity": 0.9,

              "line-dasharray": [
                2,
                1,
              ],
            }}
          />

        </Source>

      </Map>

      {/* ===================================================
          TOP COLOUR STRIP
      =================================================== */}

      <div
        className="
          absolute
          top-0
          left-0
          right-0
          h-[5px]
          z-20
          bg-gradient-to-r
          from-orange-500
          via-green-500
          via-blue-500
          via-purple-500
          to-pink-500
        "
      />

      {/* ===================================================
          INDIA VIEW BUTTON
      =================================================== */}

      <button
        onClick={() => {
          mapRef.current?.flyTo({
            center: [
              78.9629,
              22.5937,
            ],

            zoom: 4.6,

            duration: 1000,
          });
        }}

        className="
          absolute
          top-4
          left-4
          z-20
          rounded-xl
          bg-white/95
          backdrop-blur-sm
          shadow-lg
          border
          border-white
          px-4
          py-3
          text-sm
          font-semibold
          text-slate-700
          hover:bg-white
          transition-all
        "
      >
        🇮🇳 India View
      </button>

      {/* ===================================================
          STATE BADGE
      =================================================== */}

      <div
        className="
          absolute
          top-4
          left-[125px]
          z-20
          flex
          items-center
          gap-2
          rounded-xl
          bg-white/95
          backdrop-blur-sm
          shadow-lg
          px-4
          py-3
          text-sm
          font-semibold
          text-slate-700
        "
      >

        <span
          className="
            w-3
            h-3
            rounded-full
            bg-emerald-500
            shadow-[0_0_8px_rgba(16,185,129,0.8)]
          "
        />

        {selectedState === "All States"
          ? "India"
          : selectedState}

      </div>

      {/* ===================================================
          COMPACT LEGEND
      =================================================== */}

      <div
        className="
          absolute
          left-3
          bottom-3
          z-20
          w-[255px]
          max-w-[calc(100%-24px)]
          overflow-hidden
          rounded-xl
          bg-white/95
          backdrop-blur-sm
          shadow-xl
          border
          border-white
        "
      >

        {/* LEGEND HEADER */}

        <div
          className="
            px-3
            py-2.5
            bg-gradient-to-r
            from-cyan-500
            via-blue-600
            to-purple-600
            text-white
          "
        >

          <div
            className="
              text-[8px]
              tracking-[0.2em]
              font-semibold
              uppercase
              opacity-90
            "
          >
            BhoomiSetu GIS
          </div>

          <div
            className="
              text-sm
              font-bold
              leading-tight
            "
          >
            Parcel Visualization
          </div>

        </div>

        {/* LEGEND ITEMS */}

        <div className="px-3 py-2.5">

          <div className="grid grid-cols-1 gap-[3px]">

            {legendItems.map(
              ([label, color]) => (
                <div
                  key={label}
                  className="
                    flex
                    items-center
                    gap-2
                    min-h-[23px]
                  "
                >

                  <span
                    className="
                      w-[15px]
                      h-[15px]
                      shrink-0
                      rounded-[5px]
                      border-2
                      border-white
                      shadow-sm
                    "
                    style={{
                      backgroundColor:
                        color,

                      boxShadow:
                        `0 0 0 1px ${color}55`,
                    }}
                  />

                  <span
                    className="
                      text-[11px]
                      font-semibold
                      text-slate-700
                      leading-none
                    "
                  >
                    {label}
                  </span>

                </div>
              )
            )}

          </div>

          {/* DIVIDER */}

          <div
            className="
              my-2
              border-t
              border-slate-200
            "
          />

          {/* PROPOSED ALIGNMENT */}

          <div
            className="
              flex
              items-center
              gap-2
            "
          >

            <div
              className="
                flex
                items-center
                gap-[3px]
              "
            >

              <span
                className="
                  w-3
                  h-[3px]
                  bg-orange-600
                "
              />

              <span
                className="
                  w-3
                  h-[3px]
                  bg-orange-600
                "
              />

              <span
                className="
                  w-3
                  h-[3px]
                  bg-orange-600
                "
              />

            </div>

            <span
              className="
                text-[11px]
                font-semibold
                text-slate-700
              "
            >
              Proposed Alignment
            </span>

          </div>

        </div>

      </div>

      {/* ===================================================
          LIVE GIS BADGE
      =================================================== */}

      <div
        className="
          absolute
          right-4
          bottom-4
          z-20
          flex
          items-center
          gap-2
          rounded-full
          bg-slate-900/90
          text-white
          px-3
          py-1.5
          shadow-lg
          text-[10px]
          font-semibold
        "
      >

        <span
          className="
            w-2
            h-2
            rounded-full
            bg-emerald-400
            animate-pulse
          "
        />

        Live GIS Data

      </div>

      {/* ===================================================
          LOADING
      =================================================== */}

      {isLoading && (
        <div
          className="
            absolute
            inset-0
            z-30
            flex
            items-center
            justify-center
            pointer-events-none
          "
        >

          <div
            className="
              flex
              items-center
              gap-2
              rounded-full
              bg-white/95
              backdrop-blur-sm
              shadow-lg
              px-4
              py-2.5
              text-xs
              font-semibold
              text-slate-700
            "
          >

            <span
              className="
                w-3
                h-3
                rounded-full
                border-2
                border-blue-500
                border-t-transparent
                animate-spin
              "
            />

            Loading GIS parcels...

          </div>

        </div>
      )}

      {/* ===================================================
          HOVER POPUP
      =================================================== */}

      {hoverInfo && (
        <div
          className="
            absolute
            z-40
            pointer-events-none
            w-[220px]
            rounded-xl
            overflow-hidden
            bg-white
            shadow-2xl
            border
            border-white
          "
          style={{
            left: Math.min(
              hoverInfo.x + 15,
              typeof window !== "undefined"
                ? window.innerWidth - 245
                : hoverInfo.x + 15
            ),

            top: Math.max(
              hoverInfo.y - 100,
              15
            ),
          }}
        >

          {/* POPUP HEADER */}

          <div
            className="
              px-3
              py-2.5
              bg-gradient-to-r
              from-cyan-500
              via-blue-600
              to-violet-600
            "
          >

            <div
              className="
                text-[9px]
                uppercase
                tracking-wider
                text-white/80
                font-semibold
              "
            >
              BhoomiSetu GIS
            </div>

            <div
              className="
                text-sm
                font-bold
                text-white
              "
            >
              Parcel Details
            </div>

          </div>

          {/* POPUP BODY */}

          <div className="p-3 space-y-2">

            {/* ULPIN */}

            {hoverInfo.properties.ulpin && (
              <div>

                <div
                  className="
                    text-[9px]
                    uppercase
                    text-slate-400
                    font-bold
                  "
                >
                  ULPIN
                </div>

                <div
                  className="
                    text-xs
                    font-semibold
                    text-slate-700
                    break-all
                  "
                >
                  {String(
                    hoverInfo.properties.ulpin
                  )}
                </div>

              </div>
            )}

            {/* STATUS */}

            {hoverInfo.properties.status && (
              <div
                className="
                  flex
                  items-center
                  justify-between
                  gap-2
                "
              >

                <span
                  className="
                    text-[10px]
                    text-slate-400
                    font-semibold
                  "
                >
                  Status
                </span>

                <span
                  className="
                    px-2
                    py-1
                    rounded-full
                    text-[9px]
                    font-bold
                    text-white
                  "
                  style={{
                    backgroundColor:
                      getStatusColor(
                        String(
                          hoverInfo
                            .properties
                            .status
                        )
                      ),
                  }}
                >
                  {String(
                    hoverInfo
                      .properties
                      .status
                  )}
                </span>

              </div>
            )}

            {/* AREA */}

            {hoverInfo.properties.area && (
              <div
                className="
                  flex
                  items-center
                  justify-between
                "
              >

                <span
                  className="
                    text-[10px]
                    text-slate-400
                    font-semibold
                  "
                >
                  Area
                </span>

                <span
                  className="
                    text-xs
                    font-bold
                    text-slate-700
                  "
                >
                  {String(
                    hoverInfo.properties.area
                  )}
                </span>

              </div>
            )}

            {/* STATE */}

            {hoverInfo.properties.state && (
              <div
                className="
                  flex
                  items-center
                  justify-between
                  gap-2
                "
              >

                <span
                  className="
                    text-[10px]
                    text-slate-400
                    font-semibold
                  "
                >
                  State
                </span>

                <span
                  className="
                    text-[10px]
                    font-bold
                    text-slate-700
                    text-right
                  "
                >
                  {String(
                    hoverInfo
                      .properties
                      .state
                  )}
                </span>

              </div>
            )}

            {/* DISTRICT */}

            {hoverInfo.properties.district && (
              <div
                className="
                  flex
                  items-center
                  justify-between
                  gap-2
                "
              >

                <span
                  className="
                    text-[10px]
                    text-slate-400
                    font-semibold
                  "
                >
                  District
                </span>

                <span
                  className="
                    text-[10px]
                    font-bold
                    text-slate-700
                    text-right
                  "
                >
                  {String(
                    hoverInfo
                      .properties
                      .district
                  )}
                </span>

              </div>
            )}

          </div>

        </div>
      )}

    </div>
  );
}