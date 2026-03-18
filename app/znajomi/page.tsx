"use client";

import { useState, useEffect } from "react";
import { Card, CardBody } from "@heroui/card";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Avatar } from "@heroui/avatar";
import { Chip } from "@heroui/chip";
import { addToast } from "@heroui/toast";
import { Modal, ModalContent, ModalHeader, ModalBody } from "@heroui/modal";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

import { useAuth } from "@/lib/auth-context";
import {
  friendsApi,
  usersApi,
  chatsApi,
  locationsApi,
} from "@/lib/api-services";

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

type Friend = {
  id: string;
  name: string;
  status: string | null;
  color: string;
  lastSeen: string;
};

type FriendRequest = {
  id: string;
  from_user_id: string;
  to_user_id: string;
  status: string;
  from_username?: string;
  to_username?: string;
};

type DiscoverUser = {
  id: string;
  username: string;
  email: string;
};

export default function ZnajomiPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  const [friends, setFriends] = useState<Friend[]>([]);
  const [pendingRequests, setPendingRequests] = useState<FriendRequest[]>([]);
  const [sentRequests, setSentRequests] = useState<FriendRequest[]>([]);
  const [discoverUsers, setDiscoverUsers] = useState<DiscoverUser[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [discoverSearch, setDiscoverSearch] = useState("");
  const [showDiscoverModal, setShowDiscoverModal] = useState(false);
  const [sendingRequest, setSendingRequest] = useState<string | null>(null);
  const [processingRequest, setProcessingRequest] = useState<string | null>(
    null,
  );

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");

      return;
    }

    if (isAuthenticated) {
      loadFriendsData();
    }
  }, [isAuthenticated, authLoading, router]);

  // Load discover users when search changes (min 2 characters)
  useEffect(() => {
    if (showDiscoverModal && discoverSearch.length >= 2) {
      loadDiscoverUsers();
    } else if (showDiscoverModal) {
      setDiscoverUsers([]);
    }
  }, [showDiscoverModal, discoverSearch]);

  const loadFriendsData = async () => {
    setIsLoading(true);
    try {
      const requests = await friendsApi.getRequests();

      // Separate requests by status and direction
      const accepted: Friend[] = [];
      const pending: FriendRequest[] = [];
      const sent: FriendRequest[] = [];

      requests.forEach((r: FriendRequest, idx: number) => {
        if (r.status === "accepted") {
          // Friend - show the other user
          const friendId =
            r.from_user_id === user?.id ? r.to_user_id : r.from_user_id;

          accepted.push({
            id: friendId,
            name:
              r.from_user_id === user?.id
                ? r.to_username || `Użytkownik`
                : r.from_username || `Użytkownik`,
            status: null,
            color: COLORS[idx % COLORS.length],
            lastSeen: "Niedawno",
          });
        } else if (r.status === "pending") {
          if (r.to_user_id === user?.id) {
            // Incoming request
            pending.push(r);
          } else {
            // Sent request
            sent.push(r);
          }
        }
      });

      setFriends(accepted);
      setPendingRequests(pending);
      setSentRequests(sent);
    } catch (err) {
      console.error("Failed to load friends:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadDiscoverUsers = async () => {
    try {
      const users = await usersApi.discover(discoverSearch || undefined);

      setDiscoverUsers(users);
    } catch (err) {
      console.error("Failed to load users:", err);
    }
  };

  const handleSendRequest = async (toUserId: string) => {
    setSendingRequest(toUserId);
    try {
      await friendsApi.sendRequest(toUserId);
      // Remove from discover list
      setDiscoverUsers((prev) => prev.filter((u) => u.id !== toUserId));
      // Reload data
      await loadFriendsData();
    } catch (err: any) {
      addToast({
        title: "Błąd",
        description: err.message || "Nie udało się wysłać zaproszenia",
        color: "danger",
      });
    } finally {
      setSendingRequest(null);
    }
  };

  const handleAcceptRequest = async (requestId: string) => {
    setProcessingRequest(requestId);
    try {
      await friendsApi.accept(requestId);
      await loadFriendsData();
    } catch (err: any) {
      addToast({
        title: "Błąd",
        description: err.message || "Nie udało się zaakceptować zaproszenia",
        color: "danger",
      });
    } finally {
      setProcessingRequest(null);
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    setProcessingRequest(requestId);
    try {
      await friendsApi.reject(requestId);
      await loadFriendsData();
    } catch (err: any) {
      addToast({
        title: "Błąd",
        description: err.message || "Nie udało się odrzucić zaproszenia",
        color: "danger",
      });
    } finally {
      setProcessingRequest(null);
    }
  };

  const filteredFriends = friends.filter((f) =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleWriteMessage = async (friend: Friend) => {
    try {
      // Create or get existing chat room
      const room = await chatsApi.createRoom(friend.id);

      router.push(`/czaty?room=${room.id}`);
    } catch (err: any) {
      addToast({
        title: "Błąd",
        description: err.message || "Nie udało się otworzyć czatu",
        color: "danger",
      });
    }
  };

  const handleShowOnMap = async (friend: Friend) => {
    try {
      // Check if friend shares location
      await locationsApi.getFriendLocation(friend.id);
      router.push(`/mapa?friend=${friend.id}`);
    } catch (err: any) {
      addToast({
        title: "Brak lokalizacji",
        description: err.message || "Znajomy nie udostępnia swojej lokalizacji",
        color: "warning",
      });
    }
  };

  // Filter discover users to exclude those we already have relationship with
  const availableDiscoverUsers = discoverUsers.filter((u) => {
    const isFriend = friends.some((f) => f.id === u.id);
    const hasPending = pendingRequests.some((r) => r.from_user_id === u.id);
    const hasSent = sentRequests.some((r) => r.to_user_id === u.id);

    return !isFriend && !hasPending && !hasSent;
  });

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
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        initial={{ opacity: 0, y: -20 }}
      >
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center shadow-lg">
            <span className="text-2xl">👥</span>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gradient">Znajomi</h1>
            <p className="text-default-500">
              {friends.length} psiarzy w Twojej grupie
            </p>
          </div>
        </div>
        <Button
          color="primary"
          startContent={<span>➕</span>}
          variant="shadow"
          onPress={() => setShowDiscoverModal(true)}
        >
          Dodaj znajomego
        </Button>
      </motion.div>

      {/* Search */}
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        initial={{ opacity: 0, y: 20 }}
        transition={{ delay: 0.1 }}
      >
        <Input
          classNames={{ inputWrapper: "bg-default-100 shadow-sm" }}
          placeholder="Szukaj znajomego..."
          radius="full"
          size="lg"
          startContent={<span className="text-default-400">🔍</span>}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </motion.div>

      {/* Stats */}
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-3 gap-4"
        initial={{ opacity: 0, y: 20 }}
        transition={{ delay: 0.15 }}
      >
        <Card className="border border-default-200">
          <CardBody className="text-center py-4">
            <p className="text-3xl font-bold text-primary">{friends.length}</p>
            <p className="text-sm text-default-500">Znajomych</p>
          </CardBody>
        </Card>
        <Card className="border border-default-200">
          <CardBody className="text-center py-4">
            <p className="text-3xl font-bold text-success">
              {activeFriends.length}
            </p>
            <p className="text-sm text-default-500">Aktywnych</p>
          </CardBody>
        </Card>
        <Card className="border border-default-200">
          <CardBody className="text-center py-4">
            <p className="text-3xl font-bold text-secondary">
              {pendingRequests.length}
            </p>
            <p className="text-sm text-default-500">Zaproszenia</p>
          </CardBody>
        </Card>
      </motion.div>

      {/* Pending Friend Requests */}
      {pendingRequests.length > 0 && (
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          initial={{ opacity: 0, y: 20 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <span>📬</span> Oczekujące zaproszenia ({pendingRequests.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pendingRequests.map((req, idx) => (
              <motion.div
                key={req.id}
                animate={{ opacity: 1, scale: 1 }}
                initial={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: idx * 0.03 }}
              >
                <Card className="border-2 border-amber-400/50 bg-amber-50/50 dark:bg-amber-900/20">
                  <CardBody className="p-4">
                    <div className="flex items-center gap-4">
                      <Avatar
                        className={`${COLORS[idx % COLORS.length]} text-white text-xl`}
                        name={(req.from_username || "U")[0]}
                        size="lg"
                      />
                      <div className="flex-1">
                        <p className="font-semibold">
                          {req.from_username || `Użytkownik`}
                        </p>
                        <p className="text-xs text-default-400">
                          Chce zostać Twoim znajomym
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button
                        className="flex-1"
                        color="success"
                        isLoading={processingRequest === req.id}
                        size="sm"
                        onPress={() => handleAcceptRequest(req.id)}
                      >
                        ✓ Akceptuj
                      </Button>
                      <Button
                        className="flex-1"
                        color="danger"
                        isLoading={processingRequest === req.id}
                        size="sm"
                        variant="flat"
                        onPress={() => handleRejectRequest(req.id)}
                      >
                        ✕ Odrzuć
                      </Button>
                    </div>
                  </CardBody>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Sent Requests */}
      {sentRequests.length > 0 && (
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          initial={{ opacity: 0, y: 20 }}
          transition={{ delay: 0.25 }}
        >
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <span>📤</span> Wysłane zaproszenia ({sentRequests.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sentRequests.map((req, idx) => (
              <motion.div
                key={req.id}
                animate={{ opacity: 1, scale: 1 }}
                initial={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: idx * 0.03 }}
              >
                <Card className="border border-default-200 opacity-75">
                  <CardBody className="p-4">
                    <div className="flex items-center gap-4">
                      <Avatar
                        className="bg-default-300 text-white text-xl"
                        name={(req.to_username || "U")[0]}
                        size="lg"
                      />
                      <div className="flex-1">
                        <p className="font-semibold">
                          {req.to_username || `Użytkownik`}
                        </p>
                        <Chip color="warning" size="sm" variant="flat">
                          Oczekuje
                        </Chip>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Empty state when no friends */}
      {friends.length === 0 && !searchQuery && pendingRequests.length === 0 && (
        <motion.div
          animate={{ opacity: 1 }}
          className="text-center py-12"
          initial={{ opacity: 0 }}
        >
          <span className="text-6xl mb-4 block">👋</span>
          <p className="text-xl font-semibold text-default-600">
            Nie masz jeszcze znajomych
          </p>
          <p className="text-default-400 mb-4">
            Znajdź innych psiarzy i wyślij im zaproszenie!
          </p>
          <Button
            color="primary"
            size="lg"
            onPress={() => setShowDiscoverModal(true)}
          >
            ➕ Znajdź psiarzy
          </Button>
        </motion.div>
      )}

      {/* All Friends Section */}
      {friends.length > 0 && (
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          initial={{ opacity: 0, y: 20 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-lg font-semibold mb-4">
            Wszyscy znajomi ({filteredFriends.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredFriends.map((friend, idx) => (
              <motion.div
                key={friend.id}
                animate={{ opacity: 1, scale: 1 }}
                initial={{ opacity: 0, scale: 0.95 }}
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
                            <Avatar
                              className={`${friend.color} text-white text-xl`}
                              name={friend.name[0]}
                              size="lg"
                            />
                            {friend.status && (
                              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-success rounded-full border-2 border-white flex items-center justify-center">
                                <span className="text-white text-[10px]">
                                  ✓
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-lg">
                                {friend.name}
                              </p>
                              {friend.status && (
                                <Chip color="success" size="sm" variant="dot">
                                  Online
                                </Chip>
                              )}
                            </div>
                            <p className="text-xs text-default-400 mt-1">
                              {friend.lastSeen}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2 mt-4">
                          <Button
                            className="flex-1"
                            color="primary"
                            size="sm"
                            variant="flat"
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
              animate={{ opacity: 1, scale: 1 }}
              initial={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: filteredFriends.length * 0.03 }}
              whileHover={{ y: -4 }}
            >
              <Card
                isPressable
                className="border-2 border-dashed border-default-300 bg-transparent hover:border-primary hover:bg-primary/5 transition-all cursor-pointer h-full min-h-[150px]"
                onPress={() => setShowDiscoverModal(true)}
              >
                <CardBody className="flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full bg-default-100 flex items-center justify-center mx-auto mb-3">
                      <span className="text-3xl">➕</span>
                    </div>
                    <p className="font-semibold text-default-600">
                      Dodaj znajomego
                    </p>
                    <p className="text-sm text-default-400">Znajdź psiarzy</p>
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
          animate={{ opacity: 1 }}
          className="text-center py-12"
          initial={{ opacity: 0 }}
        >
          <span className="text-6xl mb-4 block">🔍</span>
          <p className="text-xl font-semibold text-default-600">
            Nie znaleziono znajomych
          </p>
          <p className="text-default-400">Spróbuj innej frazy wyszukiwania</p>
        </motion.div>
      )}

      {/* Discover Users Modal */}
      <Modal
        isOpen={showDiscoverModal}
        scrollBehavior="inside"
        size="2xl"
        onOpenChange={setShowDiscoverModal}
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            <h2 className="text-xl font-bold">🔍 Znajdź psiarzy</h2>
            <p className="text-sm text-default-500 font-normal">
              Wyszukaj użytkowników i wyślij im zaproszenie do znajomych
            </p>
          </ModalHeader>
          <ModalBody className="pb-6">
            <Input
              classNames={{ inputWrapper: "bg-default-100" }}
              placeholder="Szukaj po nazwie użytkownika..."
              radius="full"
              size="lg"
              startContent={<span className="text-default-400">🔍</span>}
              value={discoverSearch}
              onChange={(e) => setDiscoverSearch(e.target.value)}
            />

            {discoverSearch.length < 2 ? (
              <div className="text-center py-8">
                <span className="text-4xl block mb-2">✍️</span>
                <p className="text-default-500">
                  Wpisz minimum 2 znaki aby wyszukać użytkownika
                </p>
              </div>
            ) : availableDiscoverUsers.length === 0 ? (
              <div className="text-center py-8">
                <span className="text-4xl block mb-2">🐕</span>
                <p className="text-default-500">
                  Nie znaleziono użytkowników o nazwie "{discoverSearch}"
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                {availableDiscoverUsers.map((u, idx) => (
                  <Card key={u.id} className="border border-default-200">
                    <CardBody className="p-4">
                      <div className="flex items-center gap-3">
                        <Avatar
                          className={`${COLORS[idx % COLORS.length]} text-white`}
                          name={u.username[0].toUpperCase()}
                          size="md"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold truncate">{u.username}</p>
                          <p className="text-xs text-default-400 truncate">
                            {u.email}
                          </p>
                        </div>
                        <Button
                          color="primary"
                          isLoading={sendingRequest === u.id}
                          size="sm"
                          onPress={() => handleSendRequest(u.id)}
                        >
                          ➕ Dodaj
                        </Button>
                      </div>
                    </CardBody>
                  </Card>
                ))}
              </div>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </div>
  );
}
