"use client";

import { useState, useEffect } from "react";
import { Card, CardBody } from "@heroui/card";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Avatar } from "@heroui/avatar";
import { Chip } from "@heroui/chip";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

import { DogIcon } from "@/components/icons";
import { useAuth } from "@/lib/auth-context";
import { friendsApi } from "@/lib/api-services";

type Friend = {
  id: string;
  name: string;
  status: string | null;
  color: string;
  lastSeen: string;
};

export default function ZnajomiPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
      return;
    }

    if (isAuthenticated) {
      loadFriends();
    }
  }, [isAuthenticated, authLoading, router]);

  const loadFriends = async () => {
    setIsLoading(true);
    try {
      const requests = await friendsApi.getRequests();
      // Filter only accepted requests and transform to Friend type
      const acceptedFriends = requests
        .filter((r: any) => r.status === "accepted")
        .map((r: any, idx: number) => ({
          id: r.from_user_id,
          name: `Użytkownik ${idx + 1}`, // Backend doesn't return user details in friend request
          status: null,
          color: ["bg-pink-500", "bg-blue-500", "bg-purple-500", "bg-emerald-500", "bg-rose-500", "bg-cyan-500"][idx % 6],
          lastSeen: "Niedawno",
        }));
      setFriends(acceptedFriends);
    } catch (err) {
      console.error("Failed to load friends:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredFriends = friends.filter((f) =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleWriteMessage = (friend: Friend) => {
    router.push(`/czaty?friend=${encodeURIComponent(friend.name)}`);
  };

  const handleShowOnMap = (friend: Friend) => {
    router.push(`/mapa?friend=${friend.id}`);
  };

  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-default-500">Ładowanie znajomych...</p>
        </div>
      </div>
    );
  }

  const activeFriends = filteredFriends.filter((f) => f.status !== null);

  return (
    <div className="flex flex-col gap-6 pb-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      >
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center shadow-lg">
            <span className="text-2xl">👥</span>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gradient">Znajomi</h1>
            <p className="text-default-500">{friends.length} psiarzy w Twojej grupie</p>
          </div>
        </div>
        <Button color="primary" variant="shadow" startContent={<span>➕</span>}>
          Dodaj znajomego
        </Button>
      </motion.div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Input
          placeholder="Szukaj znajomego..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          radius="full"
          size="lg"
          classNames={{ inputWrapper: "bg-default-100 shadow-sm" }}
          startContent={<span className="text-default-400">🔍</span>}
        />
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="grid grid-cols-3 gap-4"
      >
        <Card className="border border-default-200">
          <CardBody className="text-center py-4">
            <p className="text-3xl font-bold text-primary">{friends.length}</p>
            <p className="text-sm text-default-500">Znajomych</p>
          </CardBody>
        </Card>
        <Card className="border border-default-200">
          <CardBody className="text-center py-4">
            <p className="text-3xl font-bold text-success">{activeFriends.length}</p>
            <p className="text-sm text-default-500">Aktywnych</p>
          </CardBody>
        </Card>
        <Card className="border border-default-200">
          <CardBody className="text-center py-4">
            <p className="text-3xl font-bold text-secondary">0</p>
            <p className="text-sm text-default-500">Zaproszenia</p>
          </CardBody>
        </Card>
      </motion.div>

      {/* Empty state when no friends */}
      {friends.length === 0 && !searchQuery && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <span className="text-6xl mb-4 block">👋</span>
          <p className="text-xl font-semibold text-default-600">Nie masz jeszcze znajomych</p>
          <p className="text-default-400 mb-4">Zaproś innych psiarzy, żeby zacząć!</p>
          <Button color="primary" size="lg">
            ➕ Dodaj pierwszego znajomego
          </Button>
        </motion.div>
      )}

      {/* All Friends Section */}
      {friends.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-lg font-semibold mb-4">Wszyscy znajomi ({filteredFriends.length})</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredFriends.map((friend, idx) => (
              <motion.div
                key={friend.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.03 }}
                whileHover={{ y: -4 }}
              >
                <Card className="border border-default-200 overflow-hidden hover:border-primary/50 transition-colors">
                  <CardBody className="p-0">
                    <div className="flex items-stretch">
                      <div className={`w-2 ${friend.color}`} />
                      <div className="flex-1 p-4">
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            <Avatar name={friend.name[0]} size="lg" className={`${friend.color} text-white text-xl`} />
                            {friend.status && (
                              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-success rounded-full border-2 border-white flex items-center justify-center">
                                <span className="text-white text-[10px]">✓</span>
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-lg">{friend.name}</p>
                              {friend.status && (
                                <Chip size="sm" color="success" variant="dot">Online</Chip>
                              )}
                            </div>
                            <p className="text-xs text-default-400 mt-1">{friend.lastSeen}</p>
                          </div>
                        </div>
                        <div className="flex gap-2 mt-4">
                          <Button 
                            size="sm" 
                            color="primary" 
                            variant="flat" 
                            className="flex-1"
                            onPress={() => handleWriteMessage(friend)}
                          >
                            💬 Napisz
                          </Button>
                          <Button 
                            size="sm" 
                            variant="bordered"
                            onPress={() => handleShowOnMap(friend)}
                          >
                            📍
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </motion.div>
            ))}

            {/* Add Friend Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: filteredFriends.length * 0.03 }}
              whileHover={{ y: -4 }}
            >
              <Card className="border-2 border-dashed border-default-300 bg-transparent hover:border-primary hover:bg-primary/5 transition-all cursor-pointer h-full min-h-[150px]">
                <CardBody className="flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full bg-default-100 flex items-center justify-center mx-auto mb-3">
                      <span className="text-3xl">➕</span>
                    </div>
                    <p className="font-semibold text-default-600">Dodaj znajomego</p>
                    <p className="text-sm text-default-400">Zaproś kogoś do grupy</p>
                  </div>
                </CardBody>
              </Card>
            </motion.div>
          </div>
        </motion.div>
      )}

      {/* No results */}
      {filteredFriends.length === 0 && searchQuery && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <span className="text-6xl mb-4 block">🔍</span>
          <p className="text-xl font-semibold text-default-600">Nie znaleziono znajomych</p>
          <p className="text-default-400">Spróbuj innej frazy wyszukiwania</p>
        </motion.div>
      )}
    </div>
  );
}