"use client";

import { useState, useEffect } from "react";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Avatar } from "@heroui/avatar";
import { Divider } from "@heroui/divider";
import { Chip } from "@heroui/chip";
import { addToast } from "@heroui/toast";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

import { DogIcon, MapPinIcon } from "@/components/icons";
import { useAuth } from "@/lib/auth-context";
import { dogsApi, friendsApi } from "@/lib/api-services";

type Dog = {
  id?: string;
  name: string;
  breed: string;
  age: number;
  weight: number;
  photo: string;
};

type UserData = {
  name: string;
  email: string;
  phone: string;
  location: string;
  avatar: string;
  dog: Dog;
  stats: {
    walks: number;
    friends: number;
    parks: number;
  };
};

export default function ProfilPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  const [userData, setUserData] = useState<UserData | null>(null);
  const [dogs, setDogs] = useState<Dog[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [friendCount, setFriendCount] = useState(0);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, authLoading, router]);

  // Fetch user data and dogs
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        // Fetch dogs
        const dogsData = await dogsApi.getMyDogs();
        const mappedDogs: Dog[] = dogsData.map(
          (dog: {
            id: string;
            name: string;
            breed: string;
            age: number;
            weight: number;
          }) => ({
            id: dog.id,
            name: dog.name,
            breed: dog.breed || "",
            age: dog.age || 0,
            weight: dog.weight || 0,
            photo: "🐕",
          }),
        );

        setDogs(mappedDogs);

        // Fetch friends count
        try {
          const friendsData = await friendsApi.getRequests();
          const acceptedFriends = friendsData.filter(
            (req: { status: string }) => req.status === "accepted",
          );

          setFriendCount(acceptedFriends.length);
        } catch {
          setFriendCount(0);
        }

        // Create user data
        const newUserData: UserData = {
          name: user.username,
          email: user.email,
          phone: "",
          location: "Warszawa",
          avatar: user.username[0].toUpperCase(),
          dog: mappedDogs[0] || {
            name: "",
            breed: "",
            age: 0,
            weight: 0,
            photo: "🐕",
          },
          stats: {
            walks: 0,
            friends: friendCount,
            parks: 0,
          },
        };

        setUserData(newUserData);
        setEditForm(newUserData);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated && user) {
      fetchData();
    }
  }, [isAuthenticated, user, friendCount]);

  const handleSave = async () => {
    if (!editForm) return;

    try {
      // Update dog if exists
      if (editForm.dog.name) {
        if (dogs.length === 0) {
          // Create new dog
          await dogsApi.addDog({
            name: editForm.dog.name,
            breed: editForm.dog.breed,
            age: editForm.dog.age || undefined,
            weight: editForm.dog.weight || undefined,
          });
        } else if (dogs[0]?.id) {
          // Update existing dog
          await dogsApi.updateDog(dogs[0].id, {
            name: editForm.dog.name,
            breed: editForm.dog.breed,
            age: editForm.dog.age || undefined,
            weight: editForm.dog.weight || undefined,
          });
        }
      }

      setUserData(editForm);
      setIsEditing(false);

      // Refresh dogs data to get updated info from server
      const dogsData = await dogsApi.getMyDogs();
      const mappedDogs: Dog[] = dogsData.map(
        (dog: {
          id: string;
          name: string;
          breed: string;
          age: number;
          weight: number;
        }) => ({
          id: dog.id,
          name: dog.name,
          breed: dog.breed || "",
          age: dog.age || 0,
          weight: dog.weight || 0,
          photo: "🐕",
        }),
      );

      setDogs(mappedDogs);

      addToast({
        title: "Sukces",
        description: "Profil został zaktualizowany",
        color: "success",
      });
    } catch (error: any) {
      addToast({
        title: "Błąd",
        description: error.message || "Nie udało się zapisać zmian",
        color: "danger",
      });
    }
  };

  const handleCancel = () => {
    setEditForm(userData);
    setIsEditing(false);
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!userData || !editForm) {
    return (
      <div className="text-center py-12">
        <p className="text-default-500">Nie udało się załadować profilu</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto pb-8">
      {/* Header */}
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
        initial={{ opacity: 0, y: -20 }}
      >
        <h1 className="text-3xl font-bold text-gradient mb-2">Mój Profil</h1>
        <p className="text-default-500">
          Zarządzaj swoimi danymi i profilem psa
        </p>
      </motion.div>

      {/* Profile Card */}
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        initial={{ opacity: 0, y: 20 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="border border-default-200 shadow-lg">
          <CardHeader className="relative overflow-hidden pb-0">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-amber-400/20 via-orange-400/20 to-amber-500/20" />

            <div className="relative flex flex-col sm:flex-row items-center gap-6 p-6 w-full">
              {/* Avatar */}
              <div className="relative">
                <Avatar
                  className="w-28 h-28 text-3xl bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-xl"
                  name={userData.avatar}
                />
                <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-white dark:bg-default-100 rounded-full flex items-center justify-center shadow-lg text-2xl">
                  {userData.dog.photo}
                </div>
              </div>

              {/* User Info */}
              <div className="flex-1 text-center sm:text-left">
                <h2 className="text-2xl font-bold">{userData.name}</h2>
                <div className="flex items-center justify-center sm:justify-start gap-2 text-default-500 mt-1">
                  <MapPinIcon size={16} />
                  <span>{userData.location}</span>
                </div>
                {userData.dog.name && (
                  <div className="flex flex-wrap gap-2 mt-3 justify-center sm:justify-start">
                    <Chip color="primary" size="sm" variant="flat">
                      🐕 {userData.dog.name}
                    </Chip>
                    {userData.dog.breed && (
                      <Chip color="secondary" size="sm" variant="flat">
                        {userData.dog.breed}
                      </Chip>
                    )}
                  </div>
                )}
              </div>

              {/* Edit Button */}
              <Button
                className="absolute top-4 right-4"
                color={isEditing ? "danger" : "primary"}
                variant={isEditing ? "flat" : "shadow"}
                onPress={() =>
                  isEditing ? handleCancel() : setIsEditing(true)
                }
              >
                {isEditing ? "Anuluj" : "Edytuj"}
              </Button>
            </div>
          </CardHeader>

          <CardBody className="px-6 pb-6">
            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4 rounded-xl bg-default-50">
                <p className="text-3xl font-bold text-primary">
                  {userData.stats.walks}
                </p>
                <p className="text-sm text-default-500">Spacerów</p>
              </div>
              <div className="text-center p-4 rounded-xl bg-default-50">
                <p className="text-3xl font-bold text-secondary">
                  {friendCount}
                </p>
                <p className="text-sm text-default-500">Znajomych</p>
              </div>
              <div className="text-center p-4 rounded-xl bg-default-50">
                <p className="text-3xl font-bold text-success">
                  {userData.stats.parks}
                </p>
                <p className="text-sm text-default-500">Parków</p>
              </div>
            </div>

            <Divider className="my-4" />

            {/* User Details Form */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                👤 Dane użytkownika
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  isReadOnly={!isEditing}
                  label="Imię i nazwisko"
                  value={editForm.name}
                  variant={isEditing ? "bordered" : "flat"}
                  onChange={(e) =>
                    setEditForm({ ...editForm, name: e.target.value })
                  }
                />
                <Input
                  isReadOnly={!isEditing}
                  label="Email"
                  type="email"
                  value={editForm.email}
                  variant={isEditing ? "bordered" : "flat"}
                  onChange={(e) =>
                    setEditForm({ ...editForm, email: e.target.value })
                  }
                />
                <Input
                  isReadOnly={!isEditing}
                  label="Telefon"
                  value={editForm.phone}
                  variant={isEditing ? "bordered" : "flat"}
                  onChange={(e) =>
                    setEditForm({ ...editForm, phone: e.target.value })
                  }
                />
                <Input
                  isReadOnly={!isEditing}
                  label="Lokalizacja"
                  value={editForm.location}
                  variant={isEditing ? "bordered" : "flat"}
                  onChange={(e) =>
                    setEditForm({ ...editForm, location: e.target.value })
                  }
                />
              </div>
            </div>

            <Divider className="my-6" />

            {/* Dog Details */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <DogIcon className="text-amber-500" size={20} />
                Profil psa
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  isReadOnly={!isEditing}
                  label="Imię psa"
                  startContent={<span>🐕</span>}
                  value={editForm.dog.name}
                  variant={isEditing ? "bordered" : "flat"}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      dog: { ...editForm.dog, name: e.target.value },
                    })
                  }
                />
                <Input
                  isReadOnly={!isEditing}
                  label="Rasa"
                  value={editForm.dog.breed}
                  variant={isEditing ? "bordered" : "flat"}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      dog: { ...editForm.dog, breed: e.target.value },
                    })
                  }
                />
                <Input
                  isReadOnly={!isEditing}
                  label="Wiek (lata)"
                  type="number"
                  value={editForm.dog.age.toString()}
                  variant={isEditing ? "bordered" : "flat"}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      dog: {
                        ...editForm.dog,
                        age: parseInt(e.target.value) || 0,
                      },
                    })
                  }
                />
                <Input
                  isReadOnly={!isEditing}
                  label="Waga (kg)"
                  type="number"
                  value={editForm.dog.weight.toString()}
                  variant={isEditing ? "bordered" : "flat"}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      dog: {
                        ...editForm.dog,
                        weight: parseInt(e.target.value) || 0,
                      },
                    })
                  }
                />
              </div>
            </div>

            {/* Save Button */}
            {isEditing && (
              <motion.div
                animate={{ opacity: 1, y: 0 }}
                className="mt-6"
                initial={{ opacity: 0, y: 10 }}
              >
                <Button
                  className="w-full font-semibold"
                  color="primary"
                  size="lg"
                  variant="shadow"
                  onPress={handleSave}
                >
                  💾 Zapisz zmiany
                </Button>
              </motion.div>
            )}
          </CardBody>
        </Card>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        initial={{ opacity: 0, y: 20 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="border border-default-200">
          <CardBody className="p-4">
            <h3 className="font-semibold mb-4">Szybkie akcje</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Button
                className="h-auto py-4 flex-col gap-2"
                color="primary"
                variant="flat"
              >
                <span className="text-2xl">📷</span>
                <span className="text-xs">Zmień zdjęcie</span>
              </Button>
              <Button
                className="h-auto py-4 flex-col gap-2"
                color="secondary"
                variant="flat"
              >
                <span className="text-2xl">🔔</span>
                <span className="text-xs">Powiadomienia</span>
              </Button>
              <Button
                className="h-auto py-4 flex-col gap-2"
                color="success"
                variant="flat"
              >
                <span className="text-2xl">🔒</span>
                <span className="text-xs">Prywatność</span>
              </Button>
              <Button
                className="h-auto py-4 flex-col gap-2"
                color="warning"
                variant="flat"
              >
                <span className="text-2xl">❓</span>
                <span className="text-xs">Pomoc</span>
              </Button>
            </div>
          </CardBody>
        </Card>
      </motion.div>
    </div>
  );
}
