import { Map as MapIcon, Layers, Filter } from "lucide-react";
import { GISMap } from "./Map";

export function MapView({ selectedState, selectedDistrict }: { selectedState?: string, selectedDistrict?: string }) {
  return (
    <div className="flex-1 flex flex-col h-full w-full min-h-0">
      <div className="px-8 py-6 border-b border-graticule-teal/30 bg-white flex justify-between items-center shrink-0">
        <div>
          <h2 className="text-3xl font-serif font-semibold text-registry-ink flex items-center gap-3">
            <MapIcon className="w-8 h-8 text-tilled-earth" />
            GIS Map View
          </h2>
          <p className="text-registry-ink/60 mt-1 text-sm">Interactive spatial visualization of corridors and affected land parcels.</p>
        </div>
        <div className="flex gap-4">
          <button className="px-4 py-2 bg-survey-paper border border-graticule-teal/30 rounded-sm text-registry-ink text-sm font-medium hover:bg-graticule-teal/10 transition-colors flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filter
          </button>
        </div>
      </div>
      <div className="flex flex-1 min-h-0">
        <div className="w-64 bg-white border-r border-graticule-teal/30 p-6 flex flex-col gap-6 overflow-y-auto shrink-0 z-10 shadow-sm relative">
          <div>
            <h3 className="font-serif font-semibold text-registry-ink mb-4 flex items-center gap-2">
              <Layers className="w-5 h-5 text-graticule-teal" />
              Active Layers
            </h3>
            <div className="space-y-4">
              <label className="flex items-center gap-3 text-sm text-registry-ink cursor-pointer">
                <input type="checkbox" defaultChecked className="w-4 h-4 text-alluvium-red rounded-sm border-graticule-teal/30" />
                <span>Project Corridors</span>
              </label>
              <label className="flex items-center gap-3 text-sm text-registry-ink cursor-pointer">
                <input type="checkbox" defaultChecked className="w-4 h-4 text-alluvium-red rounded-sm border-graticule-teal/30" />
                <span>Affected Parcels</span>
              </label>
              <label className="flex items-center gap-3 text-sm text-registry-ink cursor-pointer">
                <input type="checkbox" className="w-4 h-4 text-alluvium-red rounded-sm border-graticule-teal/30" />
                <span>Revenue Village Boundaries</span>
              </label>
              <label className="flex items-center gap-3 text-sm text-registry-ink cursor-pointer">
                <input type="checkbox" className="w-4 h-4 text-alluvium-red rounded-sm border-graticule-teal/30" />
                <span>Eco-Sensitive Zones</span>
              </label>
            </div>
          </div>
          
          <div className="pt-6 border-t border-graticule-teal/20 mt-auto">
            <h4 className="text-xs font-semibold text-registry-ink/50 uppercase tracking-wider mb-3">Target Project</h4>
            <select className="w-full bg-survey-paper border border-graticule-teal/30 p-2 text-sm rounded-sm text-registry-ink">
              <option>Delhi-Mumbai Exp. (Nuh)</option>
              <option>Pune-Nashik Rail</option>
              <option>CBIC Node 2</option>
            </select>
          </div>
        </div>
        <div className="flex-1 relative min-h-0">
          <div className="absolute inset-0">
            <GISMap selectedState={selectedState} selectedDistrict={selectedDistrict} />
          </div>
        </div>
      </div>
    </div>
  );
}
