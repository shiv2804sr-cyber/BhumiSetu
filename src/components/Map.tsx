import {
  useState,
  useEffect,
  useRef,
} from "react";

import Map, {
  Source,
  Layer,
  NavigationControl,
  GeolocateControl,
  MapRef,
} from "react-map-gl/maplibre";

import "maplibre-gl/dist/maplibre-gl.css";

type LocationCoordinate = {
  longitude: number;
  latitude: number;
  zoom: number;
};

const INDIA_DEFAULT: LocationCoordinate = {
  longitude: 78.9629,
  latitude: 20.5937,
  zoom: 4,
};

/*
|--------------------------------------------------------------------------
| STATE + DISTRICT COORDINATES
|--------------------------------------------------------------------------
|
| State select -> state location
| District select -> district location
|
*/

const locationCoordinates: Record<
  string,
  LocationCoordinate
> = {
  /* =========================================================
     INDIA
     ========================================================= */

  "All States": {
    longitude: 78.9629,
    latitude: 20.5937,
    zoom: 4,
  },

  "All Districts": {
    longitude: 78.9629,
    latitude: 20.5937,
    zoom: 4,
  },

  /* =========================================================
     DELHI
     ========================================================= */

  Delhi: {
    longitude: 77.209,
    latitude: 28.6139,
    zoom: 9,
  },

  "New Delhi": {
    longitude: 77.209,
    latitude: 28.6139,
    zoom: 12,
  },

  "North Delhi": {
    longitude: 77.1416,
    latitude: 28.7495,
    zoom: 11,
  },

  "South Delhi": {
    longitude: 77.2038,
    latitude: 28.4842,
    zoom: 11,
  },

  "East Delhi": {
    longitude: 77.2924,
    latitude: 28.6415,
    zoom: 11,
  },

  "West Delhi": {
    longitude: 77.0697,
    latitude: 28.6432,
    zoom: 11,
  },

  /* =========================================================
     HARYANA
     ========================================================= */

  Haryana: {
    longitude: 76.0856,
    latitude: 29.0588,
    zoom: 7,
  },

  Nuh: {
    longitude: 77.018,
    latitude: 28.125,
    zoom: 12,
  },

  Gurugram: {
    longitude: 77.0266,
    latitude: 28.4595,
    zoom: 11,
  },

  Faridabad: {
    longitude: 77.3178,
    latitude: 28.4089,
    zoom: 11,
  },

  Rohtak: {
    longitude: 76.5706,
    latitude: 28.8955,
    zoom: 11,
  },

  Hisar: {
    longitude: 75.7139,
    latitude: 29.1492,
    zoom: 11,
  },

  Ambala: {
    longitude: 76.7821,
    latitude: 30.3752,
    zoom: 11,
  },

  /* =========================================================
     UTTAR PRADESH
     ========================================================= */

  "Uttar Pradesh": {
    longitude: 80.9462,
    latitude: 26.8467,
    zoom: 6,
  },

  Lucknow: {
    longitude: 80.9462,
    latitude: 26.8467,
    zoom: 11,
  },

  Kanpur: {
    longitude: 80.3319,
    latitude: 26.4499,
    zoom: 11,
  },

  Agra: {
    longitude: 78.0081,
    latitude: 27.1767,
    zoom: 11,
  },

  Varanasi: {
    longitude: 82.9739,
    latitude: 25.3176,
    zoom: 11,
  },

  Noida: {
    longitude: 77.391,
    latitude: 28.5355,
    zoom: 11,
  },

  Meerut: {
    longitude: 77.7082,
    latitude: 28.9845,
    zoom: 11,
  },

  /* =========================================================
     MAHARASHTRA
     ========================================================= */

  Maharashtra: {
    longitude: 75.7139,
    latitude: 19.7515,
    zoom: 6,
  },

  Pune: {
    longitude: 73.8567,
    latitude: 18.5204,
    zoom: 11,
  },

  Mumbai: {
    longitude: 72.8777,
    latitude: 19.076,
    zoom: 11,
  },

  Nashik: {
    longitude: 73.7898,
    latitude: 19.9975,
    zoom: 11,
  },

  Nagpur: {
    longitude: 79.0882,
    latitude: 21.1458,
    zoom: 11,
  },

  Thane: {
    longitude: 72.9781,
    latitude: 19.2183,
    zoom: 11,
  },

  /* =========================================================
     TAMIL NADU
     ========================================================= */

  "Tamil Nadu": {
    longitude: 78.6569,
    latitude: 11.1271,
    zoom: 6,
  },

  Chennai: {
    longitude: 80.2707,
    latitude: 13.0827,
    zoom: 11,
  },

  Kanchipuram: {
    longitude: 79.7036,
    latitude: 12.8342,
    zoom: 11,
  },

  Coimbatore: {
    longitude: 76.9558,
    latitude: 11.0168,
    zoom: 11,
  },

  Madurai: {
    longitude: 78.1198,
    latitude: 9.9252,
    zoom: 11,
  },

  /* =========================================================
     KARNATAKA
     ========================================================= */

  Karnataka: {
    longitude: 75.7139,
    latitude: 15.3173,
    zoom: 6,
  },

  Bangalore: {
    longitude: 77.5946,
    latitude: 12.9716,
    zoom: 11,
  },

  Mysore: {
    longitude: 76.6394,
    latitude: 12.2958,
    zoom: 11,
  },

  Belgaum: {
    longitude: 74.4977,
    latitude: 15.8497,
    zoom: 11,
  },

  Mangalore: {
    longitude: 74.856,
    latitude: 12.9141,
    zoom: 11,
  },

  Hubli: {
    longitude: 75.124,
    latitude: 15.3647,
    zoom: 11,
  },

  Tumkur: {
    longitude: 77.101,
    latitude: 13.3379,
    zoom: 11,
  },

  /* =========================================================
     MADHYA PRADESH
     ========================================================= */

  "Madhya Pradesh": {
    longitude: 78.6569,
    latitude: 22.9734,
    zoom: 6,
  },

  Indore: {
    longitude: 75.8577,
    latitude: 22.7196,
    zoom: 11,
  },

  Bhopal: {
    longitude: 77.4126,
    latitude: 23.2599,
    zoom: 11,
  },

  Jabalpur: {
    longitude: 79.9864,
    latitude: 23.1815,
    zoom: 11,
  },

  Gwalior: {
    longitude: 78.1828,
    latitude: 26.2183,
    zoom: 11,
  },

  Ujjain: {
    longitude: 75.7885,
    latitude: 23.1765,
    zoom: 11,
  },

  Sagar: {
    longitude: 78.7378,
    latitude: 23.8388,
    zoom: 11,
  },

  /* =========================================================
     RAJASTHAN
     ========================================================= */

  Rajasthan: {
    longitude: 74.2179,
    latitude: 27.0238,
    zoom: 6,
  },

  Jaipur: {
    longitude: 75.7873,
    latitude: 26.9124,
    zoom: 11,
  },

  Jodhpur: {
    longitude: 73.0243,
    latitude: 26.2389,
    zoom: 11,
  },

  Udaipur: {
    longitude: 73.7125,
    latitude: 24.5854,
    zoom: 11,
  },

  Ajmer: {
    longitude: 74.6399,
    latitude: 26.4499,
    zoom: 11,
  },

  Bikaner: {
    longitude: 73.3119,
    latitude: 28.0229,
    zoom: 11,
  },

  Kota: {
    longitude: 75.8648,
    latitude: 25.2138,
    zoom: 11,
  },

  /* =========================================================
     JHARKHAND
     ========================================================= */

  Jharkhand: {
    longitude: 85.2799,
    latitude: 23.6102,
    zoom: 6,
  },

  Ranchi: {
    longitude: 85.3096,
    latitude: 23.3441,
    zoom: 11,
  },

  Dhanbad: {
    longitude: 86.4304,
    latitude: 23.7957,
    zoom: 11,
  },

  Giridih: {
    longitude: 86.3003,
    latitude: 24.186,
    zoom: 11,
  },

  Bokaro: {
    longitude: 86.1511,
    latitude: 23.6693,
    zoom: 11,
  },

  Hazaribagh: {
    longitude: 85.3637,
    latitude: 23.9925,
    zoom: 11,
  },

  Deoghar: {
    longitude: 86.6953,
    latitude: 24.4763,
    zoom: 11,
  },

  /* =========================================================
     BIHAR
     ========================================================= */

  Bihar: {
    longitude: 85.3131,
    latitude: 25.0961,
    zoom: 6,
  },

  Patna: {
    longitude: 85.1376,
    latitude: 25.5941,
    zoom: 11,
  },

  Gaya: {
    longitude: 84.9994,
    latitude: 24.7914,
    zoom: 11,
  },

  Muzaffarpur: {
    longitude: 85.391,
    latitude: 26.1197,
    zoom: 11,
  },

  Darbhanga: {
    longitude: 85.9009,
    latitude: 26.1542,
    zoom: 11,
  },

  Bhagalpur: {
    longitude: 86.9842,
    latitude: 25.2425,
    zoom: 11,
  },

  Madhubani: {
    longitude: 86.0717,
    latitude: 26.3489,
    zoom: 11,
  },
};

/* =========================================================
   GIS MAP
   ========================================================= */

export function GISMap({
  selectedState = "All States",
  selectedDistrict = "All Districts",
}: {
  selectedState?: string;
  selectedDistrict?: string;
}) {
  const mapRef = useRef<MapRef>(null);

  const [parcels, setParcels] =
    useState<any>(null);

  const [hoverInfo, setHoverInfo] =
    useState<{
      feature: any;
      x: number;
      y: number;
    } | null>(null);

  /* =========================================================
     LOAD PARCEL DATA
     ========================================================= */

  useEffect(() => {
    fetch("/api/parcels")
      .then((res) => {
        if (!res.ok) {
          throw new Error(
            `Parcel API failed: ${res.status}`
          );
        }

        return res.json();
      })
      .then((data) => {
        setParcels(data);
      })
      .catch((err) => {
        console.error(
          "Failed to load parcels",
          err
        );
      });
  }, []);

  /* =========================================================
     AUTO MOVE MAP WHEN STATE / DISTRICT CHANGES
     ========================================================= */

  useEffect(() => {
    if (!mapRef.current) {
      return;
    }

    /*
     * Priority:
     *
     * 1. Selected district
     * 2. Selected state
     * 3. India
     */

    let target: LocationCoordinate | undefined;

    if (
      selectedDistrict &&
      selectedDistrict !== "All Districts" &&
      locationCoordinates[selectedDistrict]
    ) {
      target =
        locationCoordinates[
          selectedDistrict
        ];
    } else if (
      selectedState &&
      selectedState !== "All States" &&
      locationCoordinates[selectedState]
    ) {
      target =
        locationCoordinates[
          selectedState
        ];
    } else {
      target = INDIA_DEFAULT;
    }

    /*
     * Smooth map movement.
     */

    mapRef.current.flyTo({
      center: [
        target.longitude,
        target.latitude,
      ],

      zoom: target.zoom,

      duration: 1800,

      essential: true,
    });
  }, [
    selectedState,
    selectedDistrict,
  ]);

  /* =========================================================
     HOVER
     ========================================================= */

  const onHover = (event: any) => {
    const {
      features,
      point: { x, y },
    } = event;

    const hoveredFeature =
      features && features[0];

    if (hoveredFeature) {
      setHoverInfo({
        feature: hoveredFeature,
        x,
        y,
      });
    } else {
      setHoverInfo(null);
    }
  };

  /* =========================================================
     RESET INDIA VIEW
     ========================================================= */

  const resetIndiaView = () => {
    if (!mapRef.current) {
      return;
    }

    mapRef.current.flyTo({
      center: [
        INDIA_DEFAULT.longitude,
        INDIA_DEFAULT.latitude,
      ],
      zoom: INDIA_DEFAULT.zoom,
      duration: 1600,
      essential: true,
    });
  };

  /* =========================================================
     INITIAL LOCATION
     ========================================================= */

  const initialTarget =
    selectedDistrict &&
    selectedDistrict !== "All Districts" &&
    locationCoordinates[selectedDistrict]
      ? locationCoordinates[selectedDistrict]
      : selectedState &&
          selectedState !== "All States" &&
          locationCoordinates[selectedState]
        ? locationCoordinates[selectedState]
        : INDIA_DEFAULT;

  /* =========================================================
     RENDER
     ========================================================= */

  return (
    <div className="relative w-full h-full bg-slate-100 overflow-hidden border border-graticule-teal/30">

      <Map
        ref={mapRef}
        initialViewState={{
          longitude:
            initialTarget.longitude,

          latitude:
            initialTarget.latitude,

          zoom:
            initialTarget.zoom,
        }}
        style={{
          width: "100%",
          height: "100%",
        }}
        mapStyle={{
          version: 8,

          sources: {
            osm: {
              type: "raster",

              tiles: [
                "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
              ],

              tileSize: 256,

              attribution:
                "&copy; OpenStreetMap Contributors",
            },
          },

          layers: [
            {
              id: "osm",

              type: "raster",

              source: "osm",
            },
          ],
        }}

        /* ===================================================
           MAP INTERACTION
           =================================================== */

        interactiveLayerIds={
          parcels
            ? [
                "parcels-fill",
                "corridor-line",
              ]
            : []
        }

        onMouseMove={onHover}

        onMouseLeave={() =>
          setHoverInfo(null)
        }

        cursor={
          hoverInfo
            ? "pointer"
            : "grab"
        }
      >

        {/* ===================================================
            ZOOM + / -
            CURRENT NAVIGATION CONTROL
            =================================================== */}

        <NavigationControl
          position="top-right"
          showCompass={true}
          showZoom={true}
        />

        {/* ===================================================
            REAL DEVICE LOCATION
            =================================================== */}

        <GeolocateControl
          position="top-right"
          positionOptions={{
            enableHighAccuracy: true,
          }}
          trackUserLocation={false}
          showUserLocation={true}
          showAccuracyCircle={true}
        />

        {/* ===================================================
            PARCEL DATA
            =================================================== */}

        {parcels && (
          <Source
            id="parcels"
            type="geojson"
            data={parcels}
          >

            {/* PARCEL FILL */}

            <Layer
              id="parcels-fill"
              type="fill"
              filter={[
                "==",
                ["geometry-type"],
                "Polygon",
              ]}
              paint={{
                "fill-color": [
                  "match",
                  ["get", "status"],

                  "Notification",
                  "#A8672E",

                  "Award",
                  "#2F6B3A",

                  "#5E7B78",
                ],

                "fill-opacity": [
                  "case",

                  [
                    "boolean",
                    [
                      "feature-state",
                      "hover",
                    ],
                    false,
                  ],

                  0.8,

                  0.4,
                ],
              }}
            />

            {/* PARCEL BORDER */}

            <Layer
              id="parcels-line"
              type="line"
              filter={[
                "==",
                ["geometry-type"],
                "Polygon",
              ]}
              paint={{
                "line-color":
                  "#10233F",

                "line-width": 1,
              }}
            />

            {/* PROJECT CORRIDOR */}

            <Layer
              id="corridor-line"
              type="line"
              filter={[
                "==",
                ["geometry-type"],
                "LineString",
              ]}
              paint={{
                "line-color":
                  "#A8672E",

                "line-width": 4,

                "line-dasharray": [
                  2,
                  2,
                ],
              }}
            />

          </Source>
        )}

        {/* ===================================================
            HOVER INFORMATION
            =================================================== */}

        {hoverInfo && (
          <div
            className="absolute bg-white p-3 border border-graticule-teal/30 shadow-lg pointer-events-none text-sm min-w-[200px] z-10 rounded-sm"
            style={{
              left: hoverInfo.x,
              top: hoverInfo.y,

              transform:
                "translate(-50%, -100%)",

              marginTop: "-10px",
            }}
          >

            {hoverInfo.feature
              ?.properties
              ?.ulpin !== "N/A" &&
              hoverInfo.feature
                ?.properties
                ?.ulpin && (
                <div className="font-mono text-xs text-graticule-teal mb-1">
                  ULPIN:{" "}
                  {
                    hoverInfo.feature
                      .properties
                      .ulpin
                  }
                </div>
              )}

            <div className="font-semibold text-registry-ink mb-1">
              {
                hoverInfo.feature
                  ?.properties
                  ?.owner
              }
            </div>

            <div className="flex justify-between text-registry-ink/80 text-xs">
              <span>
                Status:
              </span>

              <span className="font-medium">
                {
                  hoverInfo.feature
                    ?.properties
                    ?.status
                }
              </span>
            </div>

            {hoverInfo.feature
              ?.properties
              ?.area > 0 && (
              <div className="flex justify-between text-registry-ink/80 text-xs mt-0.5">

                <span>
                  Area:
                </span>

                <span>
                  {
                    hoverInfo.feature
                      .properties
                      .area
                  }{" "}
                  Ha
                </span>

              </div>
            )}

          </div>
        )}

      </Map>

      {/* =====================================================
          RESET INDIA BUTTON
          ===================================================== */}

      <button
        type="button"
        onClick={resetIndiaView}
        className="absolute top-4 left-4 z-20 bg-white border border-graticule-teal/30 shadow-md px-3 py-2 rounded-sm text-xs font-semibold text-registry-ink hover:bg-graticule-teal/10 transition-colors"
      >
        🇮🇳 India View
      </button>

      {/* =====================================================
          CURRENT LOCATION LABEL
          ===================================================== */}

      <div className="absolute top-4 left-32 z-20 bg-white/95 backdrop-blur-sm border border-graticule-teal/30 shadow-md px-3 py-2 rounded-sm text-xs text-registry-ink">

        <span className="font-semibold">
          {selectedDistrict &&
          selectedDistrict !==
            "All Districts"
            ? selectedDistrict
            : selectedState &&
                selectedState !==
                  "All States"
              ? selectedState
              : "India"}
        </span>

      </div>

      {/* =====================================================
          MAP LEGEND
          ===================================================== */}

      <div className="absolute bottom-6 left-6 bg-white p-4 border border-graticule-teal/30 shadow-sm text-sm z-10">

        <h4 className="font-serif mb-2 text-registry-ink font-semibold">
          Map Legend
        </h4>

        <div className="space-y-2 text-registry-ink/80">

          <div className="flex items-center gap-2">

            <div className="w-4 h-4 bg-tilled-earth/40 border border-registry-ink" />

            <span>
              Section 11 Notification
            </span>

          </div>

          <div className="flex items-center gap-2">

            <div className="w-4 h-4 bg-cultivated-green/40 border border-registry-ink" />

            <span>
              Award / Possession
            </span>

          </div>

          <div className="flex items-center gap-2">

            <div className="w-4 h-1 border-t-2 border-dashed border-tilled-earth" />

            <span>
              Proposed Alignment
            </span>

          </div>

        </div>

      </div>

    </div>
  );
}