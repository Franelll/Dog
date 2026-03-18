"use client";

import { useState, useEffect } from "react";
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

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      router.push("/czaty");
    }
  }, [isAuthenticated, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Wprowadź email i hasło");

      return;
    }

    setIsLoading(true);

    try {
      await login(email, password);
      router.push("/czaty");
    } catch (err: any) {
      setError(err.message || "Błąd logowania. Sprawdź dane.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
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
              Witaj ponownie!
            </h1>
            <p className="text-default-500 text-sm mt-1">
              Zaloguj się do swojego konta
            </p>
          </CardHeader>

          <CardBody className="px-8 py-6">
            <form className="flex flex-col gap-4" onSubmit={handleLogin}>
              {error && (
                <motion.div
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-3 rounded-lg bg-danger-50 text-danger-600 text-sm text-center"
                  initial={{ opacity: 0, scale: 0.95 }}
                >
                  {error}
                </motion.div>
              )}

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
                placeholder="••••••••"
                startContent={<span className="text-default-400">🔒</span>}
                type="password"
                value={password}
                variant="bordered"
                onChange={(e) => setPassword(e.target.value)}
              />

              <div className="flex justify-between items-center">
                <Checkbox
                  isSelected={rememberMe}
                  size="sm"
                  onValueChange={setRememberMe}
                >
                  Zapamiętaj mnie
                </Checkbox>
                <Link className="text-primary" href="#" size="sm">
                  Zapomniałeś hasła?
                </Link>
              </div>

              <Button
                className="font-semibold mt-2"
                color="primary"
                isLoading={isLoading}
                radius="full"
                size="lg"
                type="submit"
              >
                {isLoading ? "Logowanie..." : "🐕 Zaloguj się"}
              </Button>
            </form>

            <Divider className="my-6" />

            {/* Social Login */}
            <div className="flex flex-col gap-3">
              <p className="text-center text-sm text-default-500 mb-2">
                Lub kontynuuj przez
              </p>
              <div className="flex gap-3">
                <Button
                  className="flex-1"
                  startContent={<span>🔵</span>}
                  variant="bordered"
                >
                  Google
                </Button>
                <Button
                  className="flex-1"
                  startContent={<span>📘</span>}
                  variant="bordered"
                >
                  Facebook
                </Button>
              </div>
            </div>

            <Divider className="my-6" />

            {/* Register Link */}
            <p className="text-center text-sm text-default-500">
              Nie masz konta?{" "}
              <Link className="text-primary font-semibold" href="/rejestracja">
                Zarejestruj się
              </Link>
            </p>
          </CardBody>
        </Card>
      </motion.div>
    </div>
  );
}
