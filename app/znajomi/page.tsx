"use client";

import { useState } from "react";
import { Card, CardBody } from "@heroui/card";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Avatar } from "@heroui/avatar";
import { Chip } from "@heroui/chip";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

import { DogIcon } from "@/components/icons";

type Friend = {
  id: string;
  name: string;
  dog: string;
  breed: string;
  avatar: string;
  status: string | null;
  color: string;
  lastSeen: string;
};

const DEMO_FRIENDS: Friend[] = [
  { id: "1", name: "Kasia", dog: "Burek", breed: "Labrador", avatar: "K", status: null, color: "bg-pink-500", lastSeen: "2 godz. temu" },
  { id: "2", name: "Marcin", dog: "Luna", breed: "Golden Retriever", avatar: "M", status: "Na spacerze", color: "bg-blue-500", lastSeen: "Teraz" },
  { id: "3", name: "Ania", dog: "Max", breed: "Beagle", avatar: "A", status: "Za 15 min w parku!", color: "bg-purple-500", lastSeen: "Teraz" },
  { id: "4", name: "Tomek", dog: "Rocky", breed: "Husky", avatar: "T", status: null, color: "bg-emerald-500", lastSeen: "1 godz. temu" },
  { id: "5", name: "Magda", dog: "Bella", breed: "Corgi", avatar: "M", status: null, color: "bg-rose-500", lastSeen: "30 min temu" },
  { id: "6", name: "Piotr", dog: "Charlie", breed: "Border Collie", avatar: "P", status: "Szukam towarzystwa!", color: "bg-cyan-500", lastSeen: "Teraz" },
];

export default function ZnajomiPage() {
  const router = useRouter();
  const [friends] = useState<Friend[]>(DEMO_FRIENDS);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredFriends = friends.filter(
    (f) =>
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.dog.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeFriends = filteredFriends.filter((f) => f.status !== null);

  const handleWriteMessage = (friend: Friend) => {
    // Navigate to chat with friend's name as param
    router.push(`/czaty?friend=${encodeURIComponent(friend.name)}`);
  };

  const handleShowOnMap = (friend: Friend) => {
    // Navigate to map with friend's id
    router.push(`/mapa?friend=${friend.id}`);
  };

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
          placeholder="Szukaj znajomego lub psa..."
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
            <p className="text-3xl font-bold text-secondary">{friends.length}</p>
            <p className="text-sm text-default-500">Psów 🐕</p>
          </CardBody>
        </Card>
      </motion.div>

      {/* Active Friends Section */}
      {activeFriends.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="w-3 h-3 bg-success rounded-full animate-pulse" />
            <h2 className="text-lg font-semibold">Aktywni teraz ({activeFriends.length})</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeFriends.map((friend, idx) => (
              <motion.div
                key={friend.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
                whileHover={{ y: -4 }}
              >
                <Card className="border-2 border-success/30 bg-success/5 overflow-hidden">
                  <CardBody className="p-0">
                    <div className="flex items-stretch">
                      <div className={`w-2 ${friend.color}`} />
                      <div className="flex-1 p-4">
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            <Avatar name={friend.avatar} size="lg" className={`${friend.color} text-white text-xl`} />
                            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-success rounded-full border-2 border-white flex items-center justify-center">
                              <span className="text-white text-[10px]">✓</span>
                            </div>
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-lg">{friend.name}</p>
                            <div className="flex items-center gap-1 text-default-500">
                              <DogIcon size={14} />
                              <span className="font-medium">{friend.dog}</span>
                              <span className="text-default-300">•</span>
                              <span className="text-sm">{friend.breed}</span>
                            </div>
                          </div>
                        </div>
                        <div className="mt-3 p-2 rounded-lg bg-success/10">
                          <p className="text-sm text-success-700 dark:text-success-400 font-medium">
                            📢 {friend.status}
                          </p>
                        </div>
                        <div className="flex gap-2 mt-4">
                          <Button 
                            size="sm" 
                            color="primary" 
                            className="flex-1"
                            onPress={() => handleWriteMessage(friend)}
                          >
                            💬 Napisz
                          </Button>
                          <Button 
                            size="sm" 
                            variant="bordered" 
                            className="flex-1"
                            onPress={() => handleShowOnMap(friend)}
                          >
                            📍 Mapa
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* All Friends Section */}
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
                          <Avatar name={friend.avatar} size="lg" className={`${friend.color} text-white text-xl`} />
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
                          <div className="flex items-center gap-1 text-default-500 mt-1">
                            <DogIcon size={14} />
                            <span className="font-medium">{friend.dog}</span>
                            <span className="text-default-300">•</span>
                            <span className="text-sm">{friend.breed}</span>
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
            <Card className="border-2 border-dashed border-default-300 bg-transparent hover:border-primary hover:bg-primary/5 transition-all cursor-pointer h-full min-h-[200px]">
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