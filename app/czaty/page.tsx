"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { Card, CardBody, CardHeader, CardFooter } from "@heroui/card";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Avatar } from "@heroui/avatar";
import { Chip } from "@heroui/chip";
import { Divider } from "@heroui/divider";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";

import { SendIcon } from "@/components/icons";
import { useAuth } from "@/lib/auth-context";
import { chatsApi } from "@/lib/api-services";

type Message = {
  id: string;
  from: string;
  text: string;
  time: string;
  type: "chat" | "status";
  avatar?: string;
};

type ChatRoom = {
  id: string;
  name: string;
  icon: string;
  lastMessage: string;
  time: string;
  unread: number;
  members: number;
};

function CzatyPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roomIdFromUrl = searchParams.get("room");
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
  const [messagesByRoom, setMessagesByRoom] = useState<Record<string, Message[]>>({});
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  
  const currentMessages = selectedRoom ? messagesByRoom[selectedRoom.id] || [] : [];

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, authLoading, router]);

  // Fetch chat rooms
  useEffect(() => {
    const fetchRooms = async () => {
      if (!isAuthenticated) return;
      
      try {
        const data = await chatsApi.getRooms();
        const mappedRooms: ChatRoom[] = data.map((room: { id: string; name: string }) => ({
          id: room.id,
          name: room.name || "Czat",
          icon: "💬",
          lastMessage: "",
          time: "",
          unread: 0,
          members: 2,
        }));
        setRooms(mappedRooms);
        
        // Select room from URL or first room
        if (roomIdFromUrl) {
          let urlRoom = mappedRooms.find(r => r.id === roomIdFromUrl);
          if (!urlRoom) {
            // Room from URL not in list yet, add it
            urlRoom = {
              id: roomIdFromUrl,
              name: "Nowy czat",
              icon: "💬",
              lastMessage: "",
              time: "",
              unread: 0,
              members: 2,
            };
            setRooms(prev => [urlRoom!, ...prev]);
          }
          setSelectedRoom(urlRoom);
        } else if (mappedRooms.length > 0) {
          setSelectedRoom(mappedRooms[0]);
        }
      } catch (error) {
        console.error("Failed to fetch rooms:", error);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchRooms();
    }
  }, [isAuthenticated, roomIdFromUrl]);

  // Fetch messages for selected room
  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedRoom || !user) return;
      
      try {
        const data = await chatsApi.getMessages(selectedRoom.id);
        const mappedMessages: Message[] = data.map((msg: { id: string; text: string; sender_id: string; created_at: string }) => {
          const isMe = user.id === msg.sender_id;
          return {
            id: msg.id,
            from: isMe ? "Ty" : (selectedRoom.name || "Użytkownik"),
            text: msg.text,
            time: new Date(msg.created_at).toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" }),
            type: "chat" as const,
            avatar: isMe ? "Ty" : (selectedRoom.name?.[0] || "U"),
          };
        });
        
        // Deduplicate messages by ID
        setMessagesByRoom(prev => {
          const existingIds = new Set((prev[selectedRoom.id] || []).map(m => m.id));
          const newMessages = mappedMessages.filter(m => !existingIds.has(m.id));
          return {
            ...prev,
            [selectedRoom.id]: [...(prev[selectedRoom.id] || []), ...newMessages],
          };
        });
      } catch (error) {
        console.error("Failed to fetch messages:", error);
      }
    };

    fetchMessages();

    // Poll for new messages every 3 seconds
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [selectedRoom, user]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedRoom) return;
    
    try {
      await chatsApi.sendMessage(selectedRoom.id, newMessage);
      
      const msg: Message = {
        id: Date.now().toString(),
        from: "Ty",
        text: newMessage,
        time: new Date().toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" }),
        type: "chat",
        avatar: "Ty",
      };
      setMessagesByRoom(prev => ({
        ...prev,
        [selectedRoom.id]: [...(prev[selectedRoom.id] || []), msg],
      }));
      setNewMessage("");
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const announceWalk = async (minutes: number) => {
    if (!selectedRoom) return;
    
    const text = `Za ${minutes} min będę w parku! 🐕‍🦺`;
    
    try {
      await chatsApi.sendMessage(selectedRoom.id, text, "announce");
      
      const msg: Message = {
        id: Date.now().toString(),
        from: "Ty",
        text,
        time: new Date().toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" }),
        type: "status",
        avatar: "J",
      };
      setMessagesByRoom(prev => ({
        ...prev,
        [selectedRoom.id]: [...(prev[selectedRoom.id] || []), msg],
      }));
    } catch (error) {
      console.error("Failed to announce walk:", error);
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentMessages]);

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
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-lg">
            <span className="text-2xl">💬</span>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gradient">Czaty</h1>
            <p className="text-default-500">Rozmawiaj ze znajomymi psiarzami</p>
          </div>
        </div>
      </motion.div>

      {/* Quick Announce */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="border border-default-200 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30">
          <CardBody className="p-4">
            <p className="text-sm font-medium mb-3 flex items-center gap-2">
              <span>⚡</span> Szybkie ogłoszenie spaceru:
            </p>
            <div className="flex flex-wrap gap-2">
              {[10, 20, 30].map((mins) => (
                <Button
                  key={mins}
                  size="sm"
                  color="primary"
                  variant="flat"
                  onPress={() => announceWalk(mins)}
                >
                  🐕 Za {mins} min
                </Button>
              ))}
              <Button size="sm" color="success" variant="flat" onPress={() => announceWalk(5)}>
                🏃 Już idę!
              </Button>
            </div>
          </CardBody>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat Rooms List */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-1"
        >
          <Card className="border border-default-200 h-full">
            <CardHeader>
              <p className="font-semibold">Grupy czatowe</p>
            </CardHeader>
            <Divider />
            <CardBody className="p-2">
              {rooms.length === 0 ? (
                <div className="text-center py-8">
                  <span className="text-4xl block mb-2">💬</span>
                  <p className="text-default-500 text-sm">Brak aktywnych czatów</p>
                  <p className="text-default-400 text-xs">Dodaj znajomych, aby rozpocząć rozmowę</p>
                </div>
              ) : (
                <div className="flex flex-col gap-1">
                  {rooms.map((room) => (
                    <motion.div
                      key={room.id}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                    >
                      <Button
                        variant={selectedRoom?.id === room.id ? "flat" : "light"}
                        color={selectedRoom?.id === room.id ? "primary" : "default"}
                        className="w-full h-auto py-3 justify-start"
                        onPress={() => setSelectedRoom(room)}
                      >
                        <div className="flex items-center gap-3 w-full">
                          <span className="text-2xl">{room.icon}</span>
                          <div className="flex-1 text-left">
                            <div className="flex items-center justify-between">
                              <p className="font-semibold text-sm">{room.name}</p>
                              {room.time && <span className="text-xs text-default-400">{room.time}</span>}
                            </div>
                            {room.lastMessage && (
                              <p className="text-xs text-default-500 truncate">{room.lastMessage}</p>
                            )}
                          </div>
                          {room.unread > 0 && (
                            <Chip size="sm" color="primary" variant="solid" className="min-w-6 h-6">
                              {room.unread}
                            </Chip>
                          )}
                        </div>
                      </Button>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>
        </motion.div>

        {/* Active Chat */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2"
        >
          {selectedRoom ? (
            <Card className="border border-default-200 h-full flex flex-col">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{selectedRoom.icon}</span>
                  <div>
                    <p className="font-semibold text-lg">{selectedRoom.name}</p>
                    <p className="text-sm text-default-500">{selectedRoom.members} członków</p>
                  </div>
                </div>
              </CardHeader>
              <Divider />
              <CardBody className="flex-1 overflow-hidden p-0">
                <div className="flex flex-col gap-4 h-80 overflow-y-auto p-4">
                  <AnimatePresence>
                    {currentMessages.map((msg, index) => (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ delay: index * 0.03 }}
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
                                : "bg-gradient-to-br from-blue-400 to-blue-600"
                          } text-white`}
                        />
                        <div
                          className={`rounded-2xl p-3 max-w-[75%] ${
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
                          <p className={`text-xs mt-1 ${msg.from === "Ty" ? "text-amber-200" : "text-default-400"}`}>
                            {msg.time}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                    <div ref={messagesEndRef} />
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
                    classNames={{ inputWrapper: "bg-default-100" }}
                    startContent={<span className="text-default-400">💬</span>}
                  />
                  <Button color="primary" isIconOnly radius="full" onPress={sendMessage}>
                    <SendIcon size={20} />
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ) : (
            <Card className="border border-default-200 h-full flex items-center justify-center">
              <CardBody className="text-center">
                <span className="text-6xl mb-4">💬</span>
                <p className="text-default-500">Wybierz grupę, żeby rozpocząć czat</p>
              </CardBody>
            </Card>
          )}
        </motion.div>
      </div>
    </div>
  );
}

export default function CzatyPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    }>
      <CzatyPageContent />
    </Suspense>
  );
}