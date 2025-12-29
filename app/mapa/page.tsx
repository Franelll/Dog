"use client";

import { useState, useEffect, Suspense } from "react";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import { Avatar } from "@heroui/avatar";
import { Chip } from "@heroui/chip";
import { Divider } from "@heroui/divider";
import { motion } from "framer-motion";
import { useSearchParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";

import { MapPinIcon } from "@/components/icons";
import { useAuth } from "@/lib/auth-context";
import { locationsApi } from "@/lib/api-services";

// Dynamic import for Leaflet map (client-side only)
const LeafletMap = dynamic(() => import("@/components/leaflet-map"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[500px] bg-gradient-to-br from-emerald-100 to-green-100 dark:from-emerald-950/30 dark:to-green-950/30 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-default-500">Ładowanie mapy...</p>
      </div>
    </div>
  ),
});

type Friend = {
  id: string;
  name: string;
  dog: string;
  breed: string;
  avatar: string;
  status: string | null;
  color: string;
  lat: number;
  lng: number;
};

const COLORS = [
  "bg-pink-500",
  "bg-blue-500",
  "bg-purple-500",
  "bg-emerald-500",
  "bg-rose-500",
  "bg-cyan-500",
  "bg-amber-500",
  "bg-indigo-500",
];

const PARKS = [
  { id: "1", name: "Park Skaryszewski", emoji: "🌳", friends: 0, lat: 52.236, lng: 21.055 },
  { id: "2", name: "Park Łazienkowski", emoji: "🏛️", friends: 0, lat: 52.215, lng: 21.035 },
  { id: "3", name: "Park Mokotowski", emoji: "🌲", friends: 0, lat: 52.205, lng: 21.005 },
];

function MapaPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const friendIdFromUrl = searchParams.get("friend");
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const [friends, setFriends] = useState<Friend[]>([]);
  const [myLocation, setMyLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>({ lat: 52.2297, lng: 21.0122 });
  const [loading, setLoading] = useState(true);
  const [sharingLocation, setSharingLocation] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, authLoading, router]);

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setMyLocation(loc);
          setMapCenter(loc);
        },
        () => {
          // Default to Warsaw if geolocation fails
          setMyLocation({ lat: 52.2297, lng: 21.0122 });
        }
      );
    }
  }, []);

  // Fetch friend locations
  useEffect(() => {
    const fetchLocations = async () => {
      if (!isAuthenticated) return;
      
      try {
        const data = await locationsApi.getFriendsLocations();
        const mappedFriends: Friend[] = data.map((loc: { user_id: number; username: string; latitude: number; longitude: number; is_active: boolean }, index: number) => ({
          id: loc.user_id.toString(),
          name: loc.username,
          dog: "",
          breed: "",
          avatar: loc.username[0].toUpperCase(),
          status: loc.is_active ? "Aktywny" : null,
          color: COLORS[index % COLORS.length],
          lat: loc.latitude,
          lng: loc.longitude,
        }));
        setFriends(mappedFriends);
      } catch (error) {
        console.error("Failed to fetch locations:", error);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchLocations();
    }
  }, [isAuthenticated]);

  // Handle friend from URL param
  useEffect(() => {
    if (friendIdFromUrl) {
      const friend = friends.find((f) => f.id === friendIdFromUrl);
      if (friend) {
        setSelectedFriend(friend);
        setMapCenter({ lat: friend.lat, lng: friend.lng });
      }
    }
  }, [friendIdFromUrl, friends]);

  const activeFriends = friends.filter((f) => f.status !== null);

  // Transform friends for map component
  const mapFriends = friends.map((f) => ({
    id: f.id,
    name: f.name,
    dog: f.dog,
    lat: f.lat,
    lng: f.lng,
    isActive: f.status !== null,
    status: f.status,
  }));

  const handleFriendSelect = (friend: Friend) => {
    setSelectedFriend(friend);
    setMapCenter({ lat: friend.lat, lng: friend.lng });
  };

  const handleWriteMessage = (friend: Friend) => {
    router.push(`/czaty?friend=${encodeURIComponent(friend.name)}`);
  };

  const handleCenterOnMe = () => {
    if (myLocation) {
      setMapCenter(myLocation);
    }
  };

  const handleShareLocation = async () => {
    if (!myLocation) return;
    
    setSharingLocation(true);
    try {
      await locationsApi.updateMyLocation(myLocation.lat, myLocation.lng);
      alert("Lokalizacja udostępniona!");
    } catch (error) {
      console.error("Failed to share location:", error);
      alert("Nie udało się udostępnić lokalizacji");
    } finally {
      setSharingLocation(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 pb-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      >
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg">
            <MapPinIcon size={28} className="text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gradient">Mapa</h1>
            <p className="text-default-500">{activeFriends.length} znajomych w okolicy</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button color="default" variant="flat" startContent={<span>🎯</span>} onPress={handleCenterOnMe}>
            Moja lokalizacja
          </Button>
          <Button 
            color="primary" 
            variant="shadow" 
            startContent={<span>📍</span>}
            isLoading={sharingLocation}
            onPress={handleShareLocation}
          >
            Udostępnij lokalizację
          </Button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Map */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-3"
        >
          <Card className="border border-default-200 overflow-hidden">
            <CardBody className="p-0">
              <LeafletMap
                center={[mapCenter.lat, mapCenter.lng]}
                zoom={14}
                userLocation={myLocation ? [myLocation.lat, myLocation.lng] : undefined}
                friends={mapFriends}
                onFriendClick={(id) => {
                  const friend = friends.find((f) => f.id === id);
                  if (friend) handleFriendSelect(friend);
                }}
              />

              {/* Legend */}
              <div className="p-4 bg-default-50 dark:bg-default-100/10 flex flex-wrap gap-6 text-sm border-t border-default-200">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full border-2 border-white shadow" />
                  <span>Twoja pozycja</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-emerald-500 rounded-full" />
                  <span>Aktywni znajomi</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-400 rounded-full" />
                  <span>Offline znajomi</span>
                </div>
              </div>
            </CardBody>
          </Card>
        </motion.div>

        {/* Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-1 space-y-4"
        >
          {/* Active Friends */}
          <Card className="border border-default-200">
            <CardHeader>
              <p className="font-semibold">🟢 Aktywni w okolicy</p>
            </CardHeader>
            <Divider />
            <CardBody className="p-2">
              {activeFriends.length > 0 ? (
                <div className="flex flex-col gap-2">
                  {activeFriends.map((friend) => (
                    <Button
                      key={friend.id}
                      variant={selectedFriend?.id === friend.id ? "flat" : "light"}
                      color={selectedFriend?.id === friend.id ? "primary" : "default"}
                      className="w-full h-auto py-2 justify-start"
                      onPress={() => handleFriendSelect(friend)}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar name={friend.avatar} size="sm" className={`${friend.color} text-white`} />
                        <div className="text-left">
                          <p className="font-medium text-sm">{friend.name}</p>
                          <p className="text-xs text-default-500 truncate max-w-[120px]">{friend.status}</p>
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-default-500 text-center py-4">Brak aktywnych znajomych</p>
              )}
            </CardBody>
          </Card>

          {/* Nearby Parks */}
          <Card className="border border-default-200">
            <CardHeader>
              <p className="font-semibold">🌳 Parki w pobliżu</p>
            </CardHeader>
            <Divider />
            <CardBody className="p-2">
              <div className="flex flex-col gap-2">
                {PARKS.map((park) => (
                  <Button
                    key={park.id}
                    variant="light"
                    className="w-full h-auto py-2 justify-start"
                    onPress={() => setMapCenter({ lat: park.lat, lng: park.lng })}
                  >
                    <div className="flex items-center gap-3 w-full">
                      <span className="text-2xl">{park.emoji}</span>
                      <div className="flex-1 text-left">
                        <p className="font-medium text-sm">{park.name}</p>
                        <p className="text-xs text-default-500">{park.friends} psiarzy</p>
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </CardBody>
          </Card>

          {/* Selected Friend Details */}
          {selectedFriend && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="border-2 border-primary">
                <CardHeader className="bg-gradient-to-r from-primary/10 to-secondary/10">
                  <div className="flex items-center gap-3">
                    <Avatar name={selectedFriend.avatar} className={`${selectedFriend.color} text-white`} />
                    <div>
                      <p className="font-semibold">{selectedFriend.name}</p>
                      <p className="text-sm text-default-500">🐕 {selectedFriend.dog}</p>
                    </div>
                  </div>
                </CardHeader>
                <Divider />
                <CardBody>
                  <p className="text-sm text-default-600 mb-3">{selectedFriend.breed}</p>
                  {selectedFriend.status && (
                    <Chip color="success" variant="flat" className="mb-3">
                      📢 {selectedFriend.status}
                    </Chip>
                  )}
                  <div className="flex gap-2">
                    <Button size="sm" color="primary" className="flex-1" onPress={() => handleWriteMessage(selectedFriend)}>
                      💬 Napisz
                    </Button>
                    <Button
                      size="sm"
                      variant="bordered"
                      className="flex-1"
                      onPress={() => {
                        // Open in Google Maps for navigation
                        window.open(
                          `https://www.google.com/maps/dir/?api=1&destination=${selectedFriend.lat},${selectedFriend.lng}`,
                          "_blank"
                        );
                      }}
                    >
                      🚶 Nawiguj
                    </Button>
                  </div>
                </CardBody>
              </Card>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

export default function MapaPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      }
    >
      <MapaPageContent />
    </Suspense>
  );
}
