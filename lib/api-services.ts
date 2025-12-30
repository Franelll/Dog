import { apiClient } from "@/lib/api";

const TOKEN_KEY = "psiarze_token";

function getToken() {
  if (typeof window !== "undefined") {
    return localStorage.getItem(TOKEN_KEY);
  }
  return null;
}

async function request<T>(endpoint: string, options: any = {}) {
  const token = getToken();
  if (!token) throw new Error("Not authenticated");
  return apiClient<T>(endpoint, { ...options, token });
}

// ============ FRIENDS ============

export const friendsApi = {
  getRequests: () => request<any[]>("/friends/requests"),
  sendRequest: (toUserId: string) => request("/friends/requests", { method: "POST", body: JSON.stringify({ to_user_id: toUserId }) }),
  accept: (requestId: string) => request(`/friends/requests/${requestId}/accept`, { method: "POST" }),
  reject: (requestId: string) => request(`/friends/requests/${requestId}/reject`, { method: "POST" }),
};

// ============ CHATS ============

export const chatsApi = {
  getRooms: () => request<any[]>("/chats/rooms"),
  createRoom: (otherUserId: string) => request("/chats/rooms", { method: "POST", body: JSON.stringify({ other_user_id: otherUserId }) }),
  getMessages: (roomId: string) => request<any[]>(`/chats/rooms/${roomId}/messages`),
  sendMessage: (roomId: string, text: string, kind: "text" | "announce" = "text") => 
    request(`/chats/rooms/${roomId}/messages`, { method: "POST", body: JSON.stringify({ text, kind }) }),
};

// ============ LOCATIONS ============

export const locationsApi = {
  updateMyLocation: (lat: number, lng: number) => request("/locations/me", { method: "PUT", body: JSON.stringify({ latitude: lat, longitude: lng }) }),
  getFriendsLocations: () => request<any[]>("/locations/friends"),
};

// ============ DOGS ============

export const dogsApi = {
  getMyDogs: () => request<any[]>("/dogs/mine"),
  addDog: (data: { name: string; breed: string; age: number; weight: number }) => request("/dogs/mine", { method: "POST", body: JSON.stringify(data) }),
  deleteDog: (dogId: string) => request(`/dogs/mine/${dogId}`, { method: "DELETE" }),
};

// ============ USERS ============

export const usersApi = {
  getMe: () => request<any>("/users/me"),
  discover: (search?: string) => request<any[]>(`/users/discover${search ? `?search=${encodeURIComponent(search)}` : ""}`),
};
