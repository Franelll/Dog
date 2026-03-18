"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Link } from "@heroui/link";
import { Checkbox } from "@heroui/checkbox";
import { Divider } from "@heroui/divider";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

import { DogIcon } from "@/components/icons";
import { useAuth } from "@/lib/auth-context";

export default function RejeestracjaPage() {
  const router = useRouter();
  const { register, addDog, isAuthenticated } = useAuth();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // User data
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);

  // Dog data
  const [dogName, setDogName] = useState("");
  const [dogBreed, setDogBreed] = useState("");

  const isRegisteringRef = useRef(false);

  // Redirect if already logged in (but not during registration flow)
  useEffect(() => {
    if (isAuthenticated && !isRegisteringRef.current) {
      router.push("/czaty");
    }
  }, [isAuthenticated, router]);

  const handleStep1 = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!username || !email || !password) {
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

    setIsLoading(true);
    isRegisteringRef.current = true;

    try {
      await register(email, username, password);
      setStep(2);
    } catch (err: any) {
      isRegisteringRef.current = false;
      setError(err.message || "Błąd rejestracji.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // User is already registered in step 1
      // Add dog if provided
      if (dogName) {
        await addDog(dogName, dogBreed || "Mieszaniec");
      }

      router.push("/czaty");
    } catch (err: any) {
      setError(err.message || "Błąd dodawania psa.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-8">
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
      >
        <Card className="border border-default-200 shadow-xl">
          <CardHeader className="flex flex-col items-center pt-8 pb-0">
            {/* Logo */}
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg mb-4">
              <DogIcon className="text-white" size={40} />
            </div>
            <h1 className="text-2xl font-bold text-gradient">
              {step === 1 ? "Dołącz do Psiarzy!" : "Opowiedz o swoim psie"}
            </h1>
            <p className="text-default-500 text-sm mt-1">
              {step === 1 ? "Utwórz swoje konto" : "Krok 2 z 2"}
            </p>

            {/* Progress indicator */}
            <div className="flex gap-2 mt-4">
              <div
                className={`w-16 h-1.5 rounded-full ${step >= 1 ? "bg-primary" : "bg-default-200"}`}
              />
              <div
                className={`w-16 h-1.5 rounded-full ${step >= 2 ? "bg-primary" : "bg-default-200"}`}
              />
            </div>
          </CardHeader>

          <CardBody className="px-8 py-6">
            {error && (
              <motion.div
                animate={{ opacity: 1, scale: 1 }}
                className="p-3 rounded-lg bg-danger-50 text-danger-600 text-sm text-center mb-4"
                initial={{ opacity: 0, scale: 0.95 }}
              >
                {error}
              </motion.div>
            )}

            {step === 1 ? (
              <form className="flex flex-col gap-4" onSubmit={handleStep1}>
                <Input
                  isRequired
                  label="Nazwa użytkownika"
                  placeholder="jan_kowalski"
                  startContent={<span className="text-default-400">👤</span>}
                  value={username}
                  variant="bordered"
                  onChange={(e) => setUsername(e.target.value)}
                />

                <Input
                  isRequired
                  label="Email"
                  placeholder="twoj@email.pl"
                  startContent={<span className="text-default-400">📧</span>}
                  type="email"
                  value={email}
                  variant="bordered"
                  onChange={(e) => setEmail(e.target.value)}
                />

                <Input
                  isRequired
                  label="Hasło"
                  placeholder="Minimum 6 znaków"
                  startContent={<span className="text-default-400">🔒</span>}
                  type="password"
                  value={password}
                  variant="bordered"
                  onChange={(e) => setPassword(e.target.value)}
                />

                <Input
                  isRequired
                  label="Powtórz hasło"
                  placeholder="••••••••"
                  startContent={<span className="text-default-400">🔒</span>}
                  type="password"
                  value={confirmPassword}
                  variant="bordered"
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />

                <Checkbox
                  isSelected={acceptTerms}
                  size="sm"
                  onValueChange={setAcceptTerms}
                >
                  <span className="text-sm">
                    Akceptuję{" "}
                    <Link href="#" size="sm">
                      regulamin
                    </Link>{" "}
                    i{" "}
                    <Link href="#" size="sm">
                      politykę prywatności
                    </Link>
                  </span>
                </Checkbox>

                <Button
                  className="font-semibold mt-2"
                  color="primary"
                  isLoading={isLoading}
                  radius="full"
                  size="lg"
                  type="submit"
                >
                  Dalej →
                </Button>
              </form>
            ) : (
              <form className="flex flex-col gap-4" onSubmit={handleRegister}>
                <div className="text-center mb-2">
                  <span className="text-5xl">🐕</span>
                  <p className="text-default-500 text-sm mt-2">
                    Możesz to uzupełnić później
                  </p>
                </div>

                <Input
                  label="Imię psa"
                  placeholder="np. Burek, Luna, Max"
                  startContent={<span className="text-default-400">🐶</span>}
                  value={dogName}
                  variant="bordered"
                  onChange={(e) => setDogName(e.target.value)}
                />

                <Input
                  label="Rasa"
                  placeholder="np. Labrador, Golden Retriever"
                  startContent={<span className="text-default-400">🦮</span>}
                  value={dogBreed}
                  variant="bordered"
                  onChange={(e) => setDogBreed(e.target.value)}
                />

                <div className="flex gap-3 mt-2">
                  <Button
                    className="flex-1"
                    radius="full"
                    size="lg"
                    type="button"
                    variant="bordered"
                    onPress={() => setStep(1)}
                  >
                    ← Wstecz
                  </Button>
                  <Button
                    className="flex-1 font-semibold"
                    color="primary"
                    isLoading={isLoading}
                    radius="full"
                    size="lg"
                    type="submit"
                  >
                    {isLoading ? "Tworzenie..." : "🐕 Utwórz konto"}
                  </Button>
                </div>

                <Button
                  className="text-default-500"
                  size="sm"
                  type="button"
                  variant="light"
                  onPress={() => router.push("/czaty")}
                >
                  Pomiń i dokończ później
                </Button>
              </form>
            )}

            <Divider className="my-6" />

            {/* Login Link */}
            <p className="text-center text-sm text-default-500">
              Masz już konto?{" "}
              <Link className="text-primary font-semibold" href="/login">
                Zaloguj się
              </Link>
            </p>
          </CardBody>
        </Card>
      </motion.div>
    </div>
  );
}
