import { useEffect, useRef, useImperativeHandle, forwardRef } from "react";
import { MapContainer, TileLayer, CircleMarker, Circle, useMap } from "react-leaflet";
import type { Vibe } from "@shared/schema";

const DARK_TILE_URL = "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";

interface VisibleUser {
  id: string;
  username: string;
  displayName: string | null;
  isPremium: boolean;
  latitude: number | null;
  longitude: number | null;
}

function RecenterMap({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], 14);
  }, [lat, lng, map]);
  return null;
}

function MapRefSetter({ onMapReady }: { onMapReady: (map: any) => void }) {
  const map = useMap();
  useEffect(() => {
    onMapReady(map);
  }, [map, onMapReady]);
  return null;
}

interface RadarMapProps {
  userLocation: { lat: number; lng: number };
  vibes: Vibe[];
  visibleUsers: VisibleUser[];
  isPremium: boolean;
  onVibeClick: (vibe: Vibe) => void;
  onUserClick: (user: VisibleUser) => void;
}

export interface RadarMapHandle {
  invalidateSize: () => void;
}

const RadarMap = forwardRef<RadarMapHandle, RadarMapProps>(({ userLocation, vibes, visibleUsers, isPremium, onVibeClick, onUserClick }, ref) => {
  const mapInstanceRef = useRef<any>(null);

  useImperativeHandle(ref, () => ({
    invalidateSize: () => {
      if (mapInstanceRef.current) {
        setTimeout(() => {
          mapInstanceRef.current?.invalidateSize();
        }, 200);
      }
    },
  }));

  return (
    <div className="relative w-full h-full">
      <MapContainer
        center={[userLocation.lat, userLocation.lng]}
        zoom={14}
        className="w-full h-full"
        zoomControl={false}
        style={{ background: "#000" }}
      >
        <TileLayer
          url={DARK_TILE_URL}
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
        />
        <RecenterMap lat={userLocation.lat} lng={userLocation.lng} />
        <MapRefSetter onMapReady={(map) => { mapInstanceRef.current = map; }} />

        <CircleMarker
          center={[userLocation.lat, userLocation.lng]}
          radius={8}
          pathOptions={{
            color: "#B8860B",
            fillColor: "#B8860B",
            fillOpacity: 0.8,
            weight: 2,
          }}
        />

        {visibleUsers.filter(u => u.latitude && u.longitude).map((user) => (
          <CircleMarker
            key={`user-${user.id}`}
            center={[user.latitude!, user.longitude!]}
            radius={user.isPremium ? 7 : 5}
            pathOptions={{
              color: user.isPremium ? "#B8860B" : "#EF4444",
              fillColor: user.isPremium ? "#B8860B" : "#EF4444",
              fillOpacity: 0.7,
              weight: user.isPremium ? 2 : 1,
              className: user.isPremium ? "pulse-dot" : "",
            }}
            eventHandlers={{
              click: () => onUserClick(user),
            }}
          />
        ))}

        {vibes.map((vibe) => (
          <Circle
            key={`vibe-${vibe.id}`}
            center={[vibe.latitude, vibe.longitude]}
            radius={200}
            pathOptions={{
              color: vibe.type === "planned" ? "#B8860B" : "#60A5FA",
              fillColor: vibe.type === "planned" ? "#B8860B" : "#60A5FA",
              fillOpacity: 0.15,
              weight: 1,
              dashArray: vibe.type === "planned" ? "6 3" : undefined,
            }}
            eventHandlers={{
              click: () => onVibeClick(vibe),
            }}
          />
        ))}
      </MapContainer>

      <div
        id="ad-banner-map"
        data-admob-slot="banner-map"
        className="absolute bottom-0 left-0 right-0 z-[3] pointer-events-none"
        style={{ minHeight: 0 }}
      />

      <style>{`
        .pulse-dot {
          animation: pulseGold 2s ease-in-out infinite;
        }
        @keyframes pulseGold {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
        .leaflet-container {
          background: #000 !important;
        }
        .leaflet-control-attribution {
          background: rgba(0,0,0,0.6) !important;
          color: #666 !important;
          font-size: 9px !important;
        }
        .leaflet-control-attribution a {
          color: #B8860B !important;
        }
      `}</style>
    </div>
  );
});

RadarMap.displayName = "RadarMap";
export default RadarMap;
