"use client";

import { useState, useEffect } from "react";
import { Card, CardBody, CardHeader, CardFooter } from "@heroui/card";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Avatar } from "@heroui/avatar";
import { Chip } from "@heroui/chip";
import { Tabs, Tab } from "@heroui/tabs";
import { Divider } from "@heroui/divider";
import { motion, AnimatePresence } from "framer-motion";

import { DogIcon, MapPinIcon, SendIcon, ClockIcon } from "@/components/icons";

// Demo friends data
const DEMO_FRIENDS = [
  { id: "1", name: "Kasia", dog: "Burek", breed: "Labrador", avatar: "K", status: null, lat: 52.2297, lng: 21.0122, color: "bg-pink-500" },
  { id: "2", name: "Marcin", dog: "Luna", breed: "Golden Retriever", avatar: "M", status: null, lat: 52.2320, lng: 21.0150, color: "bg-blue-500" },
  { id: "3", name: "Ania", dog: "Max", breed: "Beagle", avatar: "A", status: "Za 15 min w parku! 🐕", lat: 52.2280, lng: 21.0100, color: "bg-purple-500" },
  { id: "4", name: "Tomek", dog: "Rocky", breed: "Husky", avatar: "T", status: null, lat: 52.2310, lng: 21.0080, color: "bg-emerald-500" },
];

type Message = {
  id: string;
  from: string;
  text: string;
  time: string;
  type: "chat" | "status";
  avatar?: string;
};

type Friend = {
  id: string;
  name: string;
  dog: string;
  breed: string;
  avatar: string;
  status: string | null;
  lat: number;
  lng: number;
  color: string;
};

export default function PsiarzePage() {
  const [friends] = useState<Friend[]>(DEMO_FRIENDS);
  const [messages, setMessages] = useState<Message[]>([
    { id: "1", from: "Kasia", text: "Hej, kto dzisiaj na spacer? ☀️", time: "14:30", type: "chat", avatar: "K" },
    { id: "2", from: "Ania", text: "Za 15 min w parku! 🐕", time: "14:35", type: "status", avatar: "A" },
    { id: "3", from: "Marcin", text: "Super, też wychodzę z Luną!", time: "14:36", type: "chat", avatar: "M" },
    { id: "4", from: "Tomek", text: "Czekajcie na mnie! 🏃", time: "14:38", type: "chat", avatar: "T" },
  ]);
  const [newMessage, setNewMessage] = useState("");
  const [myLocation, setMyLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedTab, setSelectedTab] = useState("chat");

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setMyLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => setMyLocation({ lat: 52.2297, lng: 21.0122 })
      );
    }
  }, []);

  const sendMessage = () => {
    if (!newMessage.trim()) return;
    const msg: Message = {
      id: Date.now().toString(),
      from: "Ty",
      text: newMessage,
      time: new Date().toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" }),
      type: "chat",
      avatar: "T",
    };
    setMessages([...messages, msg]);
    setNewMessage("");
  };

  const announceWalk = (minutes: number) => {
    const msg: Message = {
      id: Date.now().toString(),
      from: "Ty",
      text: `Za ${minutes} min będę w parku! 🐕‍🦺`,
      time: new Date().toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" }),
      type: "status",
      avatar: "T",
    };
    setMessages([...messages, msg]);
  };

  const onlineFriends = friends.filter(f => f.status !== null).length;

  return (
    <div className="flex flex-col gap-6 pb-8">
      {/* Header */}
      <motion.div 
        className="flex items-center gap-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg glow-amber">
          <DogIcon size={36} className="text-white" />
        </div>
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-gradient">Psiarze</h1>
          <p className="text-default-500">
            {onlineFriends} znajomych aktywnych • {friends.length} w grupie
          </p>
        </div>
      </motion.div>

      {/* Quick Status Cards */}
      <motion.div 
        className="grid grid-cols-2 md:grid-cols-4 gap-3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        {[
          { label: "Za 10 min", icon: "⚡", color: "from-emerald-400 to-emerald-600" },
          { label: "Za 20 min", icon: "🚶", color: "from-amber-400 to-amber-600" },
          { label: "Za 30 min", icon: "☕", color: "from-purple-400 to-purple-600" },
          { label: "Już idę!", icon: "🏃", color: "from-rose-400 to-rose-600" },
        ].map((item, i) => (
          <motion.div
            key={i}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              className={`w-full h-auto py-4 bg-gradient-to-r ${item.color} text-white font-semibold shadow-lg`}
              onPress={() => announceWalk(i === 3 ? 5 : (i + 1) * 10)}
            >
              <div className="flex flex-col items-center gap-1">
                <span className="text-2xl">{item.icon}</span>
                <span>{item.label}</span>
              </div>
            </Button>
          </motion.div>
        ))}
      </motion.div>

      {/* Main Content Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Tabs
          selectedKey={selectedTab}
          onSelectionChange={(key) => setSelectedTab(key as string)}
          aria-label="Psiarze tabs"
          color="primary"
          variant="underlined"
          classNames={{
            tabList: "gap-6 w-full relative rounded-none p-0 border-b border-default-200",
            cursor: "w-full bg-primary",
            tab: "max-w-fit px-0 h-12",
            tabContent: "group-data-[selected=true]:text-primary font-medium",
          }}
        >
          {/* Chat Tab */}
          <Tab
            key="chat"
            title={
              <div className="flex items-center gap-2">
                <SendIcon size={18} />
                <span>Czat</span>
                <Chip size="sm" color="primary" variant="flat">{messages.length}</Chip>
              </div>
            }
          >
            <Card className="mt-6 shadow-lg border border-default-100">
              <CardHeader className="flex gap-3 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30">
                <div className="flex flex-col">
                  <p className="text-lg font-semibold">💬 Grupowy czat psiarzy</p>
                  <p className="text-small text-default-500">{friends.length} znajomych w grupie</p>
                </div>
              </CardHeader>
              <Divider />
              <CardBody className="p-0">
                {/* Messages */}
                <div className="flex flex-col gap-4 max-h-96 overflow-y-auto p-4">
                  <AnimatePresence>
                    {messages.map((msg, index) => (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ delay: index * 0.05 }}
                        className={`flex gap-3 ${msg.from === "Ty" ? "flex-row-reverse" : ""}`}
                      >
                        <Avatar
                          name={msg.avatar || msg.from[0]}
                          size="sm"
                          className={`${
                            msg.type === "status" 
                              ? "bg-gradient-to-br from-emerald-400 to-emerald-600" 
                              : msg.from === "Ty"
                                ? "bg-gradient-to-br from-amber-400 to-amber-600"
                                : "bg-gradient-to-br from-purple-400 to-purple-600"
                          } text-white`}
                        />
                        <div
                          className={`rounded-2xl p-4 max-w-[75%] shadow-sm ${
                            msg.from === "Ty"
                              ? "bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-tr-none"
                              : msg.type === "status"
                                ? "bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/50 dark:to-teal-950/50 border-2 border-emerald-200 dark:border-emerald-800 rounded-tl-none"
                                : "bg-default-100 rounded-tl-none"
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <p className={`text-xs font-semibold ${msg.from === "Ty" ? "text-amber-100" : "text-default-600"}`}>
                              {msg.from}
                            </p>
                            {msg.type === "status" && <span className="text-xs">📢</span>}
                          </div>
                          <p className={`text-sm ${msg.from === "Ty" ? "text-white" : ""}`}>{msg.text}</p>
                          <p className={`text-xs mt-2 ${msg.from === "Ty" ? "text-amber-200" : "text-default-400"}`}>
                            {msg.time}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </CardBody>
              <Divider />
              <CardFooter className="p-4">
                <div className="flex gap-3 w-full">
                  <Input
                    placeholder="Napisz wiadomość..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                    radius="full"
                    classNames={{ 
                      inputWrapper: "bg-default-100 shadow-sm",
                    }}
                    startContent={<span className="text-default-400">💬</span>}
                  />
                  <Button 
                    color="primary" 
                    isIconOnly 
                    radius="full"
                    className="shadow-lg"
                    onPress={sendMessage}
                  >
                    <SendIcon size={20} />
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </Tab>

          {/* Map Tab */}
          <Tab
            key="map"
            title={
              <div className="flex items-center gap-2">
                <MapPinIcon size={18} />
                <span>Mapa</span>
              </div>
            }
          >
            <Card className="mt-6 shadow-lg border border-default-100">
              <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30">
                <div className="flex flex-col">
                  <p className="text-lg font-semibold">📍 Mapa znajomych</p>
                  <p className="text-small text-default-500">Zobacz gdzie są Twoi znajomi z psami</p>
                </div>
              </CardHeader>
              <Divider />
              <CardBody className="p-0">
                {/* Interactive Map Placeholder */}
                <div className="relative w-full h-80 md:h-96 bg-gradient-to-br from-emerald-100 via-green-100 to-teal-100 dark:from-emerald-950/50 dark:via-green-950/50 dark:to-teal-950/50 overflow-hidden">
                  {/* Grid pattern */}
                  <div className="absolute inset-0 opacity-30">
                    {[...Array(12)].map((_, i) => (
                      <div key={`h-${i}`} className="absolute w-full h-px bg-emerald-300 dark:bg-emerald-700" style={{ top: `${i * 8.33}%` }} />
                    ))}
                    {[...Array(12)].map((_, i) => (
                      <div key={`v-${i}`} className="absolute h-full w-px bg-emerald-300 dark:bg-emerald-700" style={{ left: `${i * 8.33}%` }} />
                    ))}
                  </div>

                  {/* Park areas */}
                  <motion.div 
                    className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-emerald-400/30 dark:bg-emerald-600/30 rounded-full flex items-center justify-center"
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                    <div className="text-center">
                      <span className="text-4xl">🌳</span>
                      <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300 mt-1">Park Miejski</p>
                    </div>
                  </motion.div>

                  {/* Streets */}
                  <div className="absolute top-0 left-1/4 w-2 h-full bg-gray-300/50 dark:bg-gray-600/50" />
                  <div className="absolute top-1/3 left-0 w-full h-2 bg-gray-300/50 dark:bg-gray-600/50" />

                  {/* My location */}
                  {myLocation && (
                    <motion.div 
                      className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                    >
                      <div className="relative">
                        <div className="absolute inset-0 w-6 h-6 bg-blue-500 rounded-full animate-ping opacity-50" />
                        <div className="relative w-6 h-6 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full border-3 border-white shadow-lg flex items-center justify-center">
                          <span className="text-xs">📍</span>
                        </div>
                        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white text-xs font-semibold px-2 py-1 rounded-full whitespace-nowrap shadow-lg">
                          Ty
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Friends on map */}
                  {friends.map((friend, idx) => {
                    const positions = [
                      { x: 25, y: 30 },
                      { x: 70, y: 25 },
                      { x: 35, y: 70 },
                      { x: 75, y: 65 },
                    ];
                    const pos = positions[idx % positions.length];

                    return (
                      <motion.div
                        key={friend.id}
                        className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group z-10"
                        style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: idx * 0.1 }}
                        whileHover={{ scale: 1.1 }}
                      >
                        <div className="relative">
                          {friend.status && (
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white z-10 flex items-center justify-center">
                              <span className="text-[8px]">✓</span>
                            </div>
                          )}
                          <Avatar
                            name={friend.avatar}
                            size="md"
                            className={`${friend.color} text-white border-3 border-white shadow-lg`}
                          />
                          {/* Tooltip */}
                          <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200 z-30">
                            <Card className="shadow-xl min-w-[140px]">
                              <CardBody className="p-3">
                                <p className="font-semibold text-sm">{friend.name}</p>
                                <p className="text-xs text-default-500">🐕 {friend.dog}</p>
                                <p className="text-xs text-default-400">{friend.breed}</p>
                                {friend.status && (
                                  <Chip size="sm" color="success" variant="flat" className="mt-2">
                                    Aktywny
                                  </Chip>
                                )}
                              </CardBody>
                            </Card>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Legend */}
                <div className="p-4 bg-default-50 dark:bg-default-100/10 flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full" />
                    <span>Twoja pozycja</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-emerald-500 rounded-full" />
                    <span>Aktywni znajomi</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-gray-400 rounded-full" />
                    <span>Offline</span>
                  </div>
                </div>
              </CardBody>
            </Card>
          </Tab>

          {/* Friends Tab */}
          <Tab
            key="friends"
            title={
              <div className="flex items-center gap-2">
                <DogIcon size={18} />
                <span>Znajomi</span>
                <Chip size="sm" variant="flat">{friends.length}</Chip>
              </div>
            }
          >
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              {friends.map((friend, idx) => (
                <motion.div
                  key={friend.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Card className="card-hover border border-default-100">
                    <CardBody className="p-0">
                      <div className="flex items-stretch">
                        {/* Left color bar */}
                        <div className={`w-2 ${friend.color}`} />
                        
                        <div className="flex-1 p-4">
                          <div className="flex items-center gap-4">
                            <div className="relative">
                              <Avatar
                                name={friend.avatar}
                                size="lg"
                                className={`${friend.color} text-white text-xl`}
                              />
                              {friend.status && (
                                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center">
                                  <span className="text-[10px]">✓</span>
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
                              <div className="flex items-center gap-2 text-default-500 mt-1">
                                <span>🐕</span>
                                <span className="font-medium">{friend.dog}</span>
                                <span className="text-default-300">•</span>
                                <span className="text-sm">{friend.breed}</span>
                              </div>
                              {friend.status && (
                                <p className="text-sm text-emerald-600 dark:text-emerald-400 mt-2 font-medium">
                                  📢 {friend.status}
                                </p>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex gap-2 mt-4">
                            <Button size="sm" color="primary" variant="flat" className="flex-1">
                              💬 Napisz
                            </Button>
                            <Button size="sm" variant="bordered" className="flex-1">
                              📍 Pokaż na mapie
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
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: friends.length * 0.1 }}
              >
                <Card className="card-hover border-2 border-dashed border-default-200 bg-transparent hover:border-primary hover:bg-primary/5 transition-all cursor-pointer h-full min-h-[180px]">
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
          </Tab>
        </Tabs>
      </motion.div>
    </div>
  );
}
