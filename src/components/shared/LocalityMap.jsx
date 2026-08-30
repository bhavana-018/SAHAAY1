import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Circle, useMap } from "react-leaflet";
import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// Leaflet's default marker icon paths break under most bundlers (Vite included) —
// this is the standard fix: point them at the bundler-resolved asset URLs instead.
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// Approximate real-world coordinates for the sample localities (Vijayawada, Andhra
// Pradesh) — close enough for an illustrative map, not surveyed precision.
export const LOCALITY_COORDS = {
  Governorpet: [16.5085, 80.621],
  "Benz Circle": [16.5062, 80.648],
  Patamata: [16.514, 80.656],
  "Auto Nagar": [16.479, 80.61],
  "Ashok Nagar": [16.515, 80.627],
};

// MapContainer only sets its center/zoom once on mount — this recenters it whenever
// the selected locality changes, since Leaflet's own imperative API is the only way
// to move an already-mounted map.
function Recenter({ center }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

export default function LocalityMap({ locality, radiusKm }) {
  const center = LOCALITY_COORDS[locality] || Object.values(LOCALITY_COORDS)[0];

  return (
    <div className="rounded-xl border border-sand-200 h-48 overflow-hidden relative z-0">
      <MapContainer center={center} zoom={13} scrollWheelZoom={false} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Recenter center={center} />
        <Marker position={center} />
        <Circle
          center={center}
          radius={radiusKm * 1000}
          pathOptions={{ color: "#2A7D6E", fillColor: "#2A7D6E", fillOpacity: 0.12, weight: 1.5 }}
        />
      </MapContainer>
    </div>
  );
}
