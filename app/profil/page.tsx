"use client";

import { useState } from "react";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Avatar } from "@heroui/avatar";
import { Divider } from "@heroui/divider";
import { Chip } from "@heroui/chip";
import { motion } from "framer-motion";

import { DogIcon, MapPinIcon } from "@/components/icons";

// Demo user data - in real app this would come from auth/database
const INITIAL_USER = {
  name: "Jan Kowalski",
  email: "jan@example.com",
  phone: "+48 123 456 789",
  location: "Warszawa, Mokotów",
  avatar: "J",
  dog: {
    name: "Reksio",
    breed: "Golden Retriever",
    age: 3,
    weight: 32,
    photo: "🐕",
  },
  stats: {
    walks: 127,
    friends: 12,
    parks: 8,
  },
};

export default function ProfilPage() {
  const [user, setUser] = useState(INITIAL_USER);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState(user);

  const handleSave = () => {
    setUser(editForm);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditForm(user);
    setIsEditing(false);
  };

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto pb-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-3xl font-bold text-gradient mb-2">Mój Profil</h1>
        <p className="text-default-500">Zarządzaj swoimi danymi i profilem psa</p>
      </motion.div>

      {/* Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
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
                  name={user.avatar}
                  className="w-28 h-28 text-3xl bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-xl"
                />
                <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-white dark:bg-default-100 rounded-full flex items-center justify-center shadow-lg text-2xl">
                  {user.dog.photo}
                </div>
              </div>

              {/* User Info */}
              <div className="flex-1 text-center sm:text-left">
                <h2 className="text-2xl font-bold">{user.name}</h2>
                <div className="flex items-center justify-center sm:justify-start gap-2 text-default-500 mt-1">
                  <MapPinIcon size={16} />
                  <span>{user.location}</span>
                </div>
                <div className="flex flex-wrap gap-2 mt-3 justify-center sm:justify-start">
                  <Chip color="primary" variant="flat" size="sm">
                    🐕 {user.dog.name}
                  </Chip>
                  <Chip color="secondary" variant="flat" size="sm">
                    {user.dog.breed}
                  </Chip>
                </div>
              </div>

              {/* Edit Button */}
              <Button
                color={isEditing ? "danger" : "primary"}
                variant={isEditing ? "flat" : "shadow"}
                onPress={() => isEditing ? handleCancel() : setIsEditing(true)}
                className="absolute top-4 right-4"
              >
                {isEditing ? "Anuluj" : "Edytuj"}
              </Button>
            </div>
          </CardHeader>

          <CardBody className="px-6 pb-6">
            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4 rounded-xl bg-default-50">
                <p className="text-3xl font-bold text-primary">{user.stats.walks}</p>
                <p className="text-sm text-default-500">Spacerów</p>
              </div>
              <div className="text-center p-4 rounded-xl bg-default-50">
                <p className="text-3xl font-bold text-secondary">{user.stats.friends}</p>
                <p className="text-sm text-default-500">Znajomych</p>
              </div>
              <div className="text-center p-4 rounded-xl bg-default-50">
                <p className="text-3xl font-bold text-success">{user.stats.parks}</p>
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
                  label="Imię i nazwisko"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  isReadOnly={!isEditing}
                  variant={isEditing ? "bordered" : "flat"}
                />
                <Input
                  label="Email"
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  isReadOnly={!isEditing}
                  variant={isEditing ? "bordered" : "flat"}
                />
                <Input
                  label="Telefon"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  isReadOnly={!isEditing}
                  variant={isEditing ? "bordered" : "flat"}
                />
                <Input
                  label="Lokalizacja"
                  value={editForm.location}
                  onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                  isReadOnly={!isEditing}
                  variant={isEditing ? "bordered" : "flat"}
                />
              </div>
            </div>

            <Divider className="my-6" />

            {/* Dog Details */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <DogIcon size={20} className="text-amber-500" />
                Profil psa
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Imię psa"
                  value={editForm.dog.name}
                  onChange={(e) => setEditForm({ 
                    ...editForm, 
                    dog: { ...editForm.dog, name: e.target.value }
                  })}
                  isReadOnly={!isEditing}
                  variant={isEditing ? "bordered" : "flat"}
                  startContent={<span>🐕</span>}
                />
                <Input
                  label="Rasa"
                  value={editForm.dog.breed}
                  onChange={(e) => setEditForm({ 
                    ...editForm, 
                    dog: { ...editForm.dog, breed: e.target.value }
                  })}
                  isReadOnly={!isEditing}
                  variant={isEditing ? "bordered" : "flat"}
                />
                <Input
                  label="Wiek (lata)"
                  type="number"
                  value={editForm.dog.age.toString()}
                  onChange={(e) => setEditForm({ 
                    ...editForm, 
                    dog: { ...editForm.dog, age: parseInt(e.target.value) || 0 }
                  })}
                  isReadOnly={!isEditing}
                  variant={isEditing ? "bordered" : "flat"}
                />
                <Input
                  label="Waga (kg)"
                  type="number"
                  value={editForm.dog.weight.toString()}
                  onChange={(e) => setEditForm({ 
                    ...editForm, 
                    dog: { ...editForm.dog, weight: parseInt(e.target.value) || 0 }
                  })}
                  isReadOnly={!isEditing}
                  variant={isEditing ? "bordered" : "flat"}
                />
              </div>
            </div>

            {/* Save Button */}
            {isEditing && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6"
              >
                <Button
                  color="primary"
                  variant="shadow"
                  size="lg"
                  className="w-full font-semibold"
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
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="border border-default-200">
          <CardBody className="p-4">
            <h3 className="font-semibold mb-4">Szybkie akcje</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Button variant="flat" color="primary" className="h-auto py-4 flex-col gap-2">
                <span className="text-2xl">📷</span>
                <span className="text-xs">Zmień zdjęcie</span>
              </Button>
              <Button variant="flat" color="secondary" className="h-auto py-4 flex-col gap-2">
                <span className="text-2xl">🔔</span>
                <span className="text-xs">Powiadomienia</span>
              </Button>
              <Button variant="flat" color="success" className="h-auto py-4 flex-col gap-2">
                <span className="text-2xl">🔒</span>
                <span className="text-xs">Prywatność</span>
              </Button>
              <Button variant="flat" color="warning" className="h-auto py-4 flex-col gap-2">
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
