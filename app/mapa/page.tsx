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
import { addToast } from "@heroui/toast";

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

function MapaPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const friendIdFromUrl = searchParams.get("friend");
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const [friends, setFriends] = useState<Friend[]>([]);
  const [myLocation, setMyLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [locationDenied, setLocationDenied] = useState(false);
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>({
    lat: 52.2297,
    lng: 21.0122,
  });
  const [loading, setLoading] = useState(true);
  const [sharingLocation, setSharingLocation] = useState(false);
  const [previousFriendLocations, setPreviousFriendLocations] = useState<
    Map<string, { lat: number; lng: number }>
  >(new Map());

  // Calculate distance between two points in meters
  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  };

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
          setLocationDenied(false);
        },
        () => {
          // User denied location or error occurred
          setLocationDenied(true);
          setMyLocation(null);
        },
      );
    } else {
      setLocationDenied(true);
    }
  }, []);

  // Fetch friend locations
  useEffect(() => {
    const fetchLocations = async () => {
      if (!isAuthenticated) return;

      try {
        const data = await locationsApi.getFriendsLocations();
        const mappedFriends: Friend[] = data.map(
          (
            loc: {
              user_id: string;
              username: string;
              latitude: number;
              longitude: number;
              is_active: boolean;
            },
            index: number,
          ) => ({
            id: loc.user_id.toString(),
            name: loc.username,
            dog: "",
            breed: "",
            avatar: loc.username[0].toUpperCase(),
            status: loc.is_active ? "Aktywny" : null,
            color: COLORS[index % COLORS.length],
            lat: loc.latitude,
            lng: loc.longitude,
          }),
        );

        setFriends(mappedFriends);

        // Check for nearby dogs
        if (myLocation) {
          mappedFriends.forEach((friend) => {
            if (friend.status) {
              // Only active friends
              const distance = calculateDistance(
                myLocation.lat,
                myLocation.lng,
                friend.lat,
                friend.lng,
              );
              const previousLocation = previousFriendLocations.get(friend.id);

              // Notify if friend is within 50 meters and wasn't before
              if (distance <= 50) {
                const wasNearby = previousLocation
                  ? calculateDistance(
                      myLocation.lat,
                      myLocation.lng,
                      previousLocation.lat,
                      previousLocation.lng,
                    ) <= 50
                  : false;

                if (!wasNearby) {
                  addToast({
                    title: "🐕 Pies w pobliżu!",
                    description: `${friend.name} jest w odległości ${Math.round(distance)} metrów od Ciebie!`,
                    color: "success",
                  });
                }
              }
            }
          });

          // Update previous locations
          const newLocations = new Map();

          mappedFriends.forEach((friend) => {
            newLocations.set(friend.id, { lat: friend.lat, lng: friend.lng });
          });
          setPreviousFriendLocations(newLocations);
        }
      } catch (error) {
        console.error("Failed to fetch locations:", error);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchLocations();
    }
  }, [isAuthenticated, myLocation, previousFriendLocations]);

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
      addToast({
        title: "Sukces",
        description: "Lokalizacja udostępniona!",
        color: "success",
      });
    } catch (error) {
      console.error("Failed to share location:", error);
      addToast({
        title: "Błąd",
        description: "Nie udało się udostępnić lokalizacji",
        color: "danger",
      });
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

  // Show message if location is denied
  if (locationDenied) {
    return (
      <div className="flex flex-col gap-6 pb-8">
        {/* Header */}
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4"
          initial={{ opacity: 0, y: -20 }}
        >
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg">
            <MapPinIcon className="text-white" size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gradient">Mapa</h1>
            <p className="text-default-500">
              Włącz lokalizację, aby zobaczyć mapę
            </p>
          </div>
        </motion.div>

        {/* Location Required Message */}
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          initial={{ opacity: 0, y: 20 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border border-default-200">
            <CardBody className="py-16 text-center">
              <div className="w-24 h-24 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mx-auto mb-6">
                <span className="text-5xl">📍</span>
              </div>
              <h2 className="text-2xl font-bold mb-2">Lokalizacja wyłączona</h2>
              <p className="text-default-500 max-w-md mx-auto mb-6">
                Aby korzystać z mapy i widzieć znajomych w okolicy, musisz
                włączyć udostępnianie lokalizacji w przeglądarce.
              </p>
              <Button
                color="primary"
                size="lg"
                onPress={() => {
                  // Try to request location again
                  if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(
                      (pos) => {
                        const loc = {
                          lat: pos.coords.latitude,
                          lng: pos.coords.longitude,
                        };

                        setMyLocation(loc);
                        setMapCenter(loc);
                        setLocationDenied(false);
                      },
                      () => {
                        addToast({
                          title: "Błąd",
                          description:
                            "Nie można uzyskać lokalizacji. Sprawdź ustawienia przeglądarki.",
                          color: "danger",
                        });
                      },
                    );
                  }
                }}
              >
                Włącz lokalizację
              </Button>
              <p className="text-xs text-default-400 mt-4">
                Wskazówka: Kliknij ikonę kłódki/lokalizacji w pasku adresu
                przeglądarki
              </p>
            </CardBody>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 pb-8">
      {/* Header */}
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        initial={{ opacity: 0, y: -20 }}
      >
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg">
            <MapPinIcon className="text-white" size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gradient">Mapa</h1>
            <p className="text-default-500">
              {activeFriends.length} znajomych w okolicy
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            color="default"
            startContent={<span>🎯</span>}
            variant="flat"
            onPress={handleCenterOnMe}
          >
            Moja lokalizacja
          </Button>
          <Button
            color="primary"
            isLoading={sharingLocation}
            startContent={<span>📍</span>}
            variant="shadow"
            onPress={handleShareLocation}
          >
            Udostępnij lokalizację
          </Button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Map */}
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-3"
          initial={{ opacity: 0, y: 20 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border border-default-200 overflow-hidden">
            <CardBody className="p-0">
              <LeafletMap
                center={[mapCenter.lat, mapCenter.lng]}
                friends={mapFriends}
                userLocation={
                  myLocation ? [myLocation.lat, myLocation.lng] : undefined
                }
                zoom={14}
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
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-1 space-y-4"
          initial={{ opacity: 0, x: 20 }}
          transition={{ delay: 0.2 }}
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
                      className="w-full h-auto py-2 justify-start"
                      color={
                        selectedFriend?.id === friend.id ? "primary" : "default"
                      }
                      variant={
                        selectedFriend?.id === friend.id ? "flat" : "light"
                      }
                      onPress={() => handleFriendSelect(friend)}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar
                          className={`${friend.color} text-white`}
                          name={friend.avatar}
                          size="sm"
                        />
                        <div className="text-left">
                          <p className="font-medium text-sm">{friend.name}</p>
                          <p className="text-xs text-default-500 truncate max-w-[120px]">
                            {friend.status}
                          </p>
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-default-500 text-center py-4">
                  Brak aktywnych znajomych
                </p>
              )}
            </CardBody>
          </Card>

          {/* Selected Friend Details */}
          {selectedFriend && (
            <motion.div
              animate={{ opacity: 1, y: 0 }}
              initial={{ opacity: 0, y: 20 }}
            >
              <Card className="border-2 border-primary">
                <CardHeader className="bg-gradient-to-r from-primary/10 to-secondary/10">
                  <div className="flex items-center gap-3">
                    <Avatar
                      className={`${selectedFriend.color} text-white`}
                      name={selectedFriend.avatar}
                    />
                    <div>
                      <p className="font-semibold">{selectedFriend.name}</p>
                      <p className="text-sm text-default-500">
                        🐕 {selectedFriend.dog}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <Divider />
                <CardBody>
                  <p className="text-sm text-default-600 mb-3">
                    {selectedFriend.breed}
                  </p>
                  {selectedFriend.status && (
                    <Chip className="mb-3" color="success" variant="flat">
                      📢 {selectedFriend.status}
                    </Chip>
                  )}
                  <div className="flex gap-2">
                    <Button
                      className="flex-1"
                      color="primary"
                      size="sm"
                      onPress={() => handleWriteMessage(selectedFriend)}
                    >
                      💬 Napisz
                    </Button>
                    <Button
                      className="flex-1"
                      size="sm"
                      variant="bordered"
                      onPress={() => {
                        // Open in Google Maps for navigation
                        window.open(
                          `https://www.google.com/maps/dir/?api=1&destination=${selectedFriend.lat},${selectedFriend.lng}`,
                          "_blank",
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
