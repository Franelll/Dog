"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";

function useFixLeafletDefaultIcons() {
  useEffect(() => {
    try {
      // Fix dla domyślnych ikon Leaflet (w Next często nie znajdują się assety)
      // Guardy żeby nie wywalało całej strony mapy.
      const iconDefault = (L as any)?.Icon?.Default;
      if (!iconDefault?.prototype) return;

      delete (iconDefault.prototype as any)._getIconUrl;
      iconDefault.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });
    } catch (e) {
      console.error("Leaflet icon fix failed:", e);
    }
  }, []);
}

type Friend = {
  id: string;
  name: string;
  dog: string;
  lat: number;
  lng: number;
  isActive: boolean;
  status: string | null;
};

type LeafletMapProps = {
  center: [number, number];
  zoom: number;
  userLocation?: [number, number];
  friends: Friend[];
  onFriendClick?: (id: string) => void;
  className?: string;
};

// Component to handle map center changes
function MapCenterHandler({ center }: { center: [number, number] }) {
  const map = useMap();
  
  useEffect(() => {
    if (center && !isNaN(center[0]) && !isNaN(center[1])) {
      map.setView(center, map.getZoom());
    }
  }, [center, map]);
  
  return null;
}

// Custom icon for user
const createUserIcon = () => {
  return L.divIcon({
    className: "custom-marker",
    html: `
      <div style="
        width: 40px;
        height: 40px;
        background: linear-gradient(135deg, #3B82F6, #1D4ED8);
        border-radius: 50%;
        border: 4px solid white;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: 12px;
      ">Ty</div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20],
  });
};

// Custom icon for friends
const createFriendIcon = (name: string, isActive: boolean) => {
  const bgColor = isActive ? "#10B981" : "#6B7280";
  const initial = name.charAt(0).toUpperCase();
  
  return L.divIcon({
    className: "custom-marker",
    html: `
      <div style="
        position: relative;
        width: 36px;
        height: 36px;
      ">
        <div style="
          width: 36px;
          height: 36px;
          background: ${bgColor};
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 4px 12px rgba(0,0,0,0.25);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 14px;
          cursor: pointer;
        ">${initial}</div>
        ${isActive ? `
          <div style="
            position: absolute;
            top: -2px;
            right: -2px;
            width: 12px;
            height: 12px;
            background: #22C55E;
            border-radius: 50%;
            border: 2px solid white;
          "></div>
        ` : ""}
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -18],
  });
};

export default function LeafletMap({ 
  center, 
  zoom, 
  userLocation, 
  friends, 
  onFriendClick,
  className = "" 
}: LeafletMapProps) {
  useFixLeafletDefaultIcons();

  const [isReady, setIsReady] = useState(false);
  const [tilesLoaded, setTilesLoaded] = useState(0);
  const [tileErrors, setTileErrors] = useState(0);
  
  return (
    <div className={`relative w-full ${className}`} style={{ height: "500px", border: "2px solid red" }}>
      <div className="pointer-events-none absolute left-2 top-2 z-[1000] rounded-md bg-black/60 px-2 py-1 text-xs text-white">
        ready: {isReady ? "yes" : "no"} · tiles: {tilesLoaded} · errors: {tileErrors}
      </div>

      <MapContainer
        center={center}
        zoom={zoom}
        className="h-full w-full"
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={true}
        zoomControl={true}
        whenReady={() => setIsReady(true)}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          eventHandlers={{
            tileload: () => setTilesLoaded((v) => v + 1),
            tileerror: () => setTileErrors((v) => v + 1),
          }}
        />
      
      <MapCenterHandler center={center} />
      
      {/* User location marker */}
      {userLocation && (
        <Marker position={userLocation} icon={createUserIcon()}>
          <Popup>
            <div className="text-center">
              <b>Twoja lokalizacja</b>
            </div>
          </Popup>
        </Marker>
      )}
      
      {/* Friend markers */}
      {friends
        .filter(f => typeof f.lat === 'number' && typeof f.lng === 'number')
        .map((friend) => (
        <Marker
          key={friend.id}
          position={[friend.lat, friend.lng]}
          icon={createFriendIcon(friend.name, friend.isActive)}
          eventHandlers={{
            click: () => {
              if (onFriendClick) onFriendClick(friend.id);
            },
          }}
        >
          <Popup>
            <div className="text-center min-w-[120px]">
              <b>{friend.name}</b>
              <br />
              <span className="text-gray-600">🐕 {friend.dog}</span>
              {friend.status && (
                <>
                  <br />
                  <span className="text-emerald-600 text-sm">📢 {friend.status}</span>
                </>
              )}
            </div>
          </Popup>
        </Marker>
      ))}
      </MapContainer>
    </div>
  );
}