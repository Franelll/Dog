import { apiClient } from "@/lib/api";

// ============ FRIENDS ============

export interface FriendRequest {
  id: string;
  from_user_id: string;
  to_user_id: string;
  status: "pending" | "accepted" | "rejected";
  created_at: string;
}

export async function getFriendRequests(token: string): Promise<FriendRequest[]> {
  return apiClient<FriendRequest[]>("/friends/requests", { token });
}

export async function sendFriendRequest(toUserId: string, token: string): Promise<FriendRequest> {
  return apiClient<FriendRequest>("/friends/requests", {
    method: "POST",
    body: JSON.stringify({ to_user_id: toUserId }),
    token,
  });
}

export async function acceptFriendRequest(requestId: string, token: string): Promise<FriendRequest> {
  return apiClient<FriendRequest>(`/friends/requests/${requestId}/accept`, {
    method: "POST",
    token,
  });
}

export async function rejectFriendRequest(requestId: string, token: string): Promise<FriendRequest> {
  return apiClient<FriendRequest>(`/friends/requests/${requestId}/reject`, {
    method: "POST",
    token,
  });
}

// ============ CHATS ============

export interface ChatRoom {
  id: string;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  room_id: string;
  sender_id: string;
  kind: "text" | "announce";
  text: string;
  created_at: string;
}

export async function getChatRooms(token: string): Promise<ChatRoom[]> {
  return apiClient<ChatRoom[]>("/chats/rooms", { token });
}

export async function createChatRoom(otherUserId: string, token: string): Promise<ChatRoom> {
  return apiClient<ChatRoom>("/chats/rooms", {
    method: "POST",
    body: JSON.stringify({ other_user_id: otherUserId }),
    token,
  });
}

export async function getRoomMessages(roomId: string, token: string): Promise<ChatMessage[]> {
  return apiClient<ChatMessage[]>(`/chats/rooms/${roomId}/messages`, { token });
}

export async function sendChatMessage(
  roomId: string,
  text: string,
  kind: "text" | "announce",
  token: string
): Promise<ChatMessage> {
  return apiClient<ChatMessage>(`/chats/rooms/${roomId}/messages`, {
    method: "POST",
    body: JSON.stringify({ text, kind }),
    token,
  });
}

// ============ LOCATIONS ============

export interface UserLocation {
  user_id: string;
  lat: number;
  lng: number;
  is_sharing: boolean;
  created_at: string;
}

export async function updateMyLocation(
  lat: number,
  lng: number,
  isSharing: boolean,
  token: string
): Promise<UserLocation> {
  return apiClient<UserLocation>("/locations/me", {
    method: "PUT",
    body: JSON.stringify({ lat, lng, is_sharing: isSharing }),
    token,
  });
}

export async function getFriendLocations(token: string): Promise<UserLocation[]> {
  return apiClient<UserLocation[]>("/locations/friends", { token });
}

// ============ USERS ============

export interface UserPublic {
  id: string;
  email: string;
  username: string;
  created_at: string;
}

export async function getCurrentUser(token: string): Promise<UserPublic> {
  return apiClient<UserPublic>("/users/me", { token });
}
