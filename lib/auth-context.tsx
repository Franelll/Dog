"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { apiClient } from "@/lib/api";

interface User {
  id: string;
  email: string;
  username: string;
  created_at: string;
}

interface Dog {
  id: string;
  owner_id: string;
  name: string;
  breed: string;
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  dogs: Dog[];
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, username: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  refreshDogs: () => Promise<void>;
  addDog: (name: string, breed: string) => Promise<Dog>;
  deleteDog: (dogId: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = "psiarze_token";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [dogs, setDogs] = useState<Dog[]>([]);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const saveToken = (newToken: string) => {
    localStorage.setItem(TOKEN_KEY, newToken);
    setToken(newToken);
  };

  const clearAuth = () => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
    setDogs([]);
  };

  const refreshUser = useCallback(async () => {
    if (!token) return;
    try {
      const userData = await apiClient<User>("/users/me", { token });
      setUser(userData);
    } catch (err) {
      console.error("Failed to fetch user:", err);
      clearAuth();
    }
  }, [token]);

  const refreshDogs = useCallback(async () => {
    if (!token) return;
    try {
      const dogsData = await apiClient<Dog[]>("/dogs/mine", { token });
      setDogs(dogsData);
    } catch (err) {
      console.error("Failed to fetch dogs:", err);
    }
  }, [token]);

  // Load token from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_KEY);
    if (storedToken) {
      setToken(storedToken);
    } else {
      setIsLoading(false);
    }
  }, []);

  // Fetch user data when token changes
  useEffect(() => {
    if (token) {
      setIsLoading(true);
      Promise.all([refreshUser(), refreshDogs()]).finally(() => setIsLoading(false));
    }
  }, [token, refreshUser, refreshDogs]);

  const login = async (email: string, password: string) => {
    const response = await apiClient<{ access_token: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    saveToken(response.access_token);
  };

  const register = async (email: string, username: string, password: string) => {
    const response = await apiClient<{ access_token: string }>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, username, password }),
    });
    saveToken(response.access_token);
  };

  const logout = () => {
    clearAuth();
  };

  const addDog = async (name: string, breed: string): Promise<Dog> => {
    if (!token) throw new Error("Not authenticated");
    const dog = await apiClient<Dog>("/dogs/mine", {
      method: "POST",
      body: JSON.stringify({ name, breed }),
      token,
    });
    setDogs((prev) => [dog, ...prev]);
    return dog;
  };

  const deleteDog = async (dogId: string) => {
    if (!token) throw new Error("Not authenticated");
    await apiClient(`/dogs/mine/${dogId}`, {
      method: "DELETE",
      token,
    });
    setDogs((prev) => prev.filter((d) => d.id !== dogId));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        dogs,
        token,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        refreshUser,
        refreshDogs,
        addDog,
        deleteDog,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
