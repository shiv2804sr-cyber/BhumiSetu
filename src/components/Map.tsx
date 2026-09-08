import { useState, useEffect, useRef } from "react";
import Map, { Source, Layer, NavigationControl, MapRef } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import { ParcelProperties } from "../types";

const locationCoordinates: Record<string, { longitude: number, latitude: number, zoom: number }> = {
  "All States": { longitude: 78.9629, latitude: 20.5937, zoom: 4 },
  "Delhi": { longitude: 77.2090, latitude: 28.6139, zoom: 10 },
  "New Delhi": { longitude: 77.2090, latitude: 28.6139, zoom: 12 },
  "North Delhi": { longitude: 77.1416, latitude: 28.7495, zoom: 11 },
  "South Delhi": { longitude: 77.2038, latitude: 28.4842, zoom: 11 },
  "East Delhi": { longitude: 77.2924, latitude: 28.6415, zoom: 11 },
  "West Delhi": { longitude: 77.0697, latitude: 28.6432, zoom: 11 },
  "Haryana": { longitude: 76.0856, latitude: 29.0588, zoom: 7 },
  "Nuh": { longitude: 77.018, latitude: 28.125, zoom: 12.5 },
  "Gurugram": { longitude: 77.0266, latitude: 28.4595, zoom: 11 },
  "Faridabad": { longitude: 77.3178, latitude: 28.4089, zoom: 11 },
  "Rohtak": { longitude: 76.5706, latitude: 28.8955, zoom: 11 },
  "Hisar": { longitude: 75.7139, latitude: 29.1492, zoom: 11 },
  "Ambala": { longitude: 76.7821, latitude: 30.3752, zoom: 11 },
  "Uttar Pradesh": { longitude: 80.9462, latitude: 26.8467, zoom: 6 },
  "Lucknow": { longitude: 80.9462, latitude: 26.8467, zoom: 11 },
  "Kanpur": { longitude: 80.3319, latitude: 26.4499, zoom: 11 },
  "Agra": { longitude: 78.0081, latitude: 27.1767, zoom: 11 },
  "Varanasi": { longitude: 82.9739, latitude: 25.3176, zoom: 11 },
  "Noida": { longitude: 77.3910, latitude: 28.5355, zoom: 11 },
  "Meerut": { longitude: 77.7082, latitude: 28.9845, zoom: 11 },
  "Maharashtra": { longitude: 75.7139, latitude: 19.7515, zoom: 6 },
  "Pune": { longitude: 73.8567, latitude: 18.5204, zoom: 11 },
  "Mumbai": { longitude: 72.8777, latitude: 19.0760, zoom: 11 },
  "Nashik": { longitude: 73.7898, latitude: 19.9975, zoom: 11 },
  "Nagpur": { longitude: 79.0882, latitude: 21.1458, zoom: 11 },
  "Thane": { longitude: 72.9781, latitude: 19.2183, zoom: 11 },
  "Tamil Nadu": { longitude: 78.6569, latitude: 11.1271, zoom: 6 },
  "Chennai": { longitude: 80.2707, latitude: 13.0827, zoom: 11 },
  "Kanchipuram": { longitude: 79.7036, latitude: 12.8342, zoom: 11 },
  "Coimbatore": { longitude: 76.9558, latitude: 11.0168, zoom: 11 },
  "Madurai": { longitude: 78.1198, latitude: 9.9252, zoom: 11 },
  "All Districts": { longitude: 78.9629, latitude: 20.5937, zoom: 4 }
};

export function GISMap({ selectedState = "All States", selectedDistrict = "All Districts" }: { selectedState?: string, selectedDistrict?: string }) {
  const mapRef = useRef<MapRef>(null);
  const [parcels, setParcels] = useState<any>(null);
  const [hoverInfo, setHoverInfo] = useState<{
    feature: any;
    x: number;
    y: number;
  } | null>(null);

  useEffect(() => {
    fetch("/api/parcels")
      .then((res) => res.json())
      .then((data) => setParcels(data))
      .catch((err) => console.error("Failed to load parcels", err));
  }, []);

  useEffect(() => {
    let target = locationCoordinates[selectedDistrict];
    if (selectedDistrict === "All Districts" || !target) {
      target = locationCoordinates[selectedState];
    }
    
    if (target && mapRef.current) {
      mapRef.current.flyTo({
        center: [target.longitude, target.latitude],
        zoom: target.zoom,
        duration: 2000
      });
    }
  }, [selectedState, selectedDistrict]);

  const onHover = (event: any) => {
    const {
      features,
      point: { x, y }
    } = event;
    const hoveredFeature = features && features[0];
    
    if (hoveredFeature) {
      setHoverInfo({ feature: hoveredFeature, x, y });
    } else {
      setHoverInfo(null);
    }
  };

  return (
    <div className="relative w-full h-full bg-slate-100 overflow-hidden border border-graticule-teal/30">
      <Map
        ref={mapRef}
        initialViewState={{
          longitude: locationCoordinates[selectedDistrict]?.longitude || locationCoordinates[selectedState]?.longitude || 78.9629,
          latitude: locationCoordinates[selectedDistrict]?.latitude || locationCoordinates[selectedState]?.latitude || 20.5937,
          zoom: locationCoordinates[selectedDistrict]?.zoom || locationCoordinates[selectedState]?.zoom || 4
        }}
        style={{ width: "100%", height: "100%" }}
        mapStyle={{
          version: 8,
          sources: {
            osm: {
              type: "raster",
              tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
              tileSize: 256,
              attribution: "&copy; OpenStreetMap Contributors"
            }
          },
          layers: [
            {
              id: "osm",
              type: "raster",
              source: "osm"
            }
          ]
        }}
        interactiveLayerIds={parcels ? ["parcels-fill", "corridor-line"] : []}
        onMouseMove={onHover}
        onMouseLeave={() => setHoverInfo(null)}
        cursor={hoverInfo ? "pointer" : "grab"}
      >
        <NavigationControl position="top-right" />
        
        {parcels && (
          <Source id="parcels" type="geojson" data={parcels}>
            <Layer
              id="parcels-fill"
              type="fill"
              filter={['==', ['geometry-type'], 'Polygon']}
              paint={{
                "fill-color": [
                  "match",
                  ["get", "status"],
                  "Notification", "#A8672E", // Tilled Earth
                  "Award", "#2F6B3A", // Cultivated Green
                  "#5E7B78" // Graticule Teal
                ],
                "fill-opacity": [
                  "case",
                  ["boolean", ["feature-state", "hover"], false],
                  0.8,
                  0.4
                ]
              }}
            />
            <Layer
              id="parcels-line"
              type="line"
              filter={['==', ['geometry-type'], 'Polygon']}
              paint={{
                "line-color": "#10233F", // Registry Ink
                "line-width": 1
              }}
            />
            <Layer
              id="corridor-line"
              type="line"
              filter={['==', ['geometry-type'], 'LineString']}
              paint={{
                "line-color": "#A8672E", // Tilled Earth
                "line-width": 4,
                "line-dasharray": [2, 2]
              }}
            />
          </Source>
        )}

        {hoverInfo && (
          <div
            className="absolute bg-white p-3 border border-graticule-teal/30 shadow-sm pointer-events-none text-sm min-w-[200px] z-10"
            style={{ left: hoverInfo.x, top: hoverInfo.y, transform: "translate(-50%, -100%)", marginTop: "-10px" }}
          >
            {hoverInfo.feature.properties.ulpin !== "N/A" && hoverInfo.feature.properties.ulpin && (
              <div className="font-mono text-xs text-graticule-teal mb-1">ULPIN: {hoverInfo.feature.properties.ulpin}</div>
            )}
            <div className="font-semibold text-registry-ink mb-1">{hoverInfo.feature.properties.owner}</div>
            <div className="flex justify-between text-registry-ink/80 text-xs">
              <span>Status:</span>
              <span className="font-medium">{hoverInfo.feature.properties.status}</span>
            </div>
            {hoverInfo.feature.properties.area > 0 && (
              <div className="flex justify-between text-registry-ink/80 text-xs mt-0.5">
                <span>Area:</span>
                <span>{hoverInfo.feature.properties.area} Ha</span>
              </div>
            )}
          </div>
        )}
      </Map>

      <div className="absolute bottom-6 left-6 bg-white p-4 border border-graticule-teal/30 shadow-sm text-sm z-10">
        <h4 className="font-serif mb-2 text-registry-ink font-semibold">Map Legend</h4>
        <div className="space-y-2 text-registry-ink/80">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-tilled-earth/40 border border-registry-ink"></div>
            <span>Section 11 Notification</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-cultivated-green/40 border border-registry-ink"></div>
            <span>Award / Possession</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-1 border-t-2 border-dashed border-tilled-earth"></div>
            <span>Proposed Alignment</span>
          </div>
        </div>
      </div>
    </div>
  );
}
