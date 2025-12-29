"use client";

import { useState } from "react";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Link } from "@heroui/link";
import { Checkbox } from "@heroui/checkbox";
import { Divider } from "@heroui/divider";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

import { DogIcon } from "@/components/icons";

export default function RejeestracjaPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // User data
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);

  // Dog data
  const [dogName, setDogName] = useState("");
  const [dogBreed, setDogBreed] = useState("");
  const [dogAge, setDogAge] = useState("");

  const handleStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name || !email || !password) {
      setError("Wypełnij wszystkie pola");
      return;
    }
    if (password !== confirmPassword) {
      setError("Hasła nie są takie same");
      return;
    }
    if (password.length < 6) {
      setError("Hasło musi mieć minimum 6 znaków");
      return;
    }
    if (!acceptTerms) {
      setError("Musisz zaakceptować regulamin");
      return;
    }

    setStep(2);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Demo registration
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Save user data
    localStorage.setItem("psiarze_user", JSON.stringify({
      name: name,
      email: email,
      avatar: name[0].toUpperCase(),
      dog: {
        name: dogName || "Pies",
        breed: dogBreed || "Mieszaniec",
        age: dogAge || 2
      }
    }));

    setIsLoading(false);
    router.push("/czaty");
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Card className="border border-default-200 shadow-xl">
          <CardHeader className="flex flex-col items-center pt-8 pb-0">
            {/* Logo */}
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg mb-4">
              <DogIcon size={40} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gradient">
              {step === 1 ? "Dołącz do Psiarzy!" : "Opowiedz o swoim psie"}
            </h1>
            <p className="text-default-500 text-sm mt-1">
              {step === 1 ? "Utwórz swoje konto" : "Krok 2 z 2"}
            </p>

            {/* Progress indicator */}
            <div className="flex gap-2 mt-4">
              <div className={`w-16 h-1.5 rounded-full ${step >= 1 ? "bg-primary" : "bg-default-200"}`} />
              <div className={`w-16 h-1.5 rounded-full ${step >= 2 ? "bg-primary" : "bg-default-200"}`} />
            </div>
          </CardHeader>

          <CardBody className="px-8 py-6">
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-3 rounded-lg bg-danger-50 text-danger-600 text-sm text-center mb-4"
              >
                {error}
              </motion.div>
            )}

            {step === 1 ? (
              <form onSubmit={handleStep1} className="flex flex-col gap-4">
                <Input
                  label="Imię i nazwisko"
                  placeholder="Jan Kowalski"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  variant="bordered"
                  startContent={<span className="text-default-400">👤</span>}
                  isRequired
                />

                <Input
                  type="email"
                  label="Email"
                  placeholder="twoj@email.pl"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  variant="bordered"
                  startContent={<span className="text-default-400">📧</span>}
                  isRequired
                />

                <Input
                  type="password"
                  label="Hasło"
                  placeholder="Minimum 6 znaków"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  variant="bordered"
                  startContent={<span className="text-default-400">🔒</span>}
                  isRequired
                />

                <Input
                  type="password"
                  label="Powtórz hasło"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  variant="bordered"
                  startContent={<span className="text-default-400">🔒</span>}
                  isRequired
                />

                <Checkbox
                  isSelected={acceptTerms}
                  onValueChange={setAcceptTerms}
                  size="sm"
                >
                  <span className="text-sm">
                    Akceptuję{" "}
                    <Link href="#" size="sm">regulamin</Link> i{" "}
                    <Link href="#" size="sm">politykę prywatności</Link>
                  </span>
                </Checkbox>

                <Button
                  type="submit"
                  color="primary"
                  size="lg"
                  radius="full"
                  className="font-semibold mt-2"
                >
                  Dalej →
                </Button>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="flex flex-col gap-4">
                <div className="text-center mb-2">
                  <span className="text-5xl">🐕</span>
                  <p className="text-default-500 text-sm mt-2">
                    Możesz to uzupełnić później
                  </p>
                </div>

                <Input
                  label="Imię psa"
                  placeholder="np. Burek, Luna, Max"
                  value={dogName}
                  onChange={(e) => setDogName(e.target.value)}
                  variant="bordered"
                  startContent={<span className="text-default-400">🐶</span>}
                />

                <Input
                  label="Rasa"
                  placeholder="np. Labrador, Golden Retriever"
                  value={dogBreed}
                  onChange={(e) => setDogBreed(e.target.value)}
                  variant="bordered"
                  startContent={<span className="text-default-400">🦮</span>}
                />

                <Input
                  type="number"
                  label="Wiek (lata)"
                  placeholder="np. 3"
                  value={dogAge}
                  onChange={(e) => setDogAge(e.target.value)}
                  variant="bordered"
                  startContent={<span className="text-default-400">📅</span>}
                />

                <div className="flex gap-3 mt-2">
                  <Button
                    type="button"
                    variant="bordered"
                    size="lg"
                    radius="full"
                    className="flex-1"
                    onPress={() => setStep(1)}
                  >
                    ← Wstecz
                  </Button>
                  <Button
                    type="submit"
                    color="primary"
                    size="lg"
                    radius="full"
                    className="flex-1 font-semibold"
                    isLoading={isLoading}
                  >
                    {isLoading ? "Tworzenie..." : "🐕 Utwórz konto"}
                  </Button>
                </div>

                <Button
                  type="submit"
                  variant="light"
                  size="sm"
                  className="text-default-500"
                >
                  Pomiń i dokończ później
                </Button>
              </form>
            )}

            <Divider className="my-6" />

            {/* Login Link */}
            <p className="text-center text-sm text-default-500">
              Masz już konto?{" "}
              <Link href="/login" className="text-primary font-semibold">
                Zaloguj się
              </Link>
            </p>
          </CardBody>
        </Card>
      </motion.div>
    </div>
  );
}
