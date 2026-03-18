"use client";

import { Button } from "@heroui/button";
import { Card, CardBody } from "@heroui/card";
import { Link } from "@heroui/link";
import { motion } from "framer-motion";

import {
  DogIcon,
  MapPinIcon,
  SendIcon,
  ClockIcon,
  HeartFilledIcon,
} from "@/components/icons";
import { useAuth } from "@/lib/auth-context";

const features = [
  {
    icon: <SendIcon size={32} />,
    title: "Grupowy Czat",
    description: "Rozmawiaj ze znajomymi psiarzami w czasie rzeczywistym",
    color: "bg-amber-500",
  },
  {
    icon: <ClockIcon size={32} />,
    title: "Szybkie Ogłoszenia",
    description: "Jednym kliknięciem powiadom znajomych o spacerze",
    color: "bg-purple-500",
  },
  {
    icon: <MapPinIcon size={32} />,
    title: "Mapa Znajomych",
    description: "Zobacz gdzie są Twoi znajomi z psami w okolicy",
    color: "bg-emerald-500",
  },
  {
    icon: <HeartFilledIcon size={32} />,
    title: "Społeczność",
    description: "Poznawaj nowych psiarzy i ich pupili",
    color: "bg-rose-500",
  },
];

const dogBreeds = ["🐕", "🦮", "🐕‍🦺", "🐩", "🐶"];

export default function Home() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex flex-col items-center justify-center overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 bg-paw-pattern opacity-50" />

        {/* Floating dogs decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {dogBreeds.map((dog, i) => (
            <motion.div
              key={i}
              animate={{
                y: [0, -15, 0],
                rotate: [0, i % 2 === 0 ? 5 : -5, 0],
              }}
              className="absolute text-4xl md:text-6xl opacity-20"
              style={{
                left: `${15 + i * 18}%`,
                top: `${20 + (i % 3) * 25}%`,
              }}
              transition={{
                duration: 3 + i * 0.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              {dog}
            </motion.div>
          ))}
        </div>

        {/* Main content */}
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            initial={{ opacity: 0, y: 30 }}
            transition={{ duration: 0.6 }}
          >
            {/* Logo/Icon */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-2xl glow-amber">
                  <DogIcon className="text-white" size={60} />
                </div>
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  className="absolute -bottom-1 -right-1 text-3xl"
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  🐾
                </motion.div>
              </div>
            </div>

            {/* Title */}
            <h1 className="text-5xl md:text-7xl font-extrabold mb-4">
              <span className="text-gradient">Psiarze</span>
            </h1>

            <p className="text-xl md:text-2xl text-default-600 mb-2">
              Aplikacja dla właścicieli psów
            </p>

            <p className="text-lg text-default-500 mb-8 max-w-2xl mx-auto">
              Umów się na spacer ze znajomymi, zobacz gdzie są Twoi przyjaciele
              z pupilami i nigdy nie spaceruj sam!
            </p>

            {/* CTA Buttons */}
            {!isLoading && !isAuthenticated && (
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button
                  as={Link}
                  className="font-semibold px-8 shadow-lg hover:shadow-xl transition-shadow text-lg"
                  color="primary"
                  href="/rejestracja"
                  radius="full"
                  size="lg"
                  startContent={<DogIcon size={24} />}
                >
                  Zarejestruj się
                </Button>
                <Button
                  as={Link}
                  className="font-semibold px-8 border-2"
                  href="/login"
                  radius="full"
                  size="lg"
                  variant="bordered"
                >
                  Zaloguj się
                </Button>
              </div>
            )}
          </motion.div>

          {/* Stats */}
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className="mt-16 grid grid-cols-3 gap-8 max-w-lg mx-auto"
            initial={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            {[
              { value: "1000+", label: "Psiarzy" },
              { value: "500+", label: "Spacerów" },
              { value: "50+", label: "Parków" },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-gradient">
                  {stat.value}
                </div>
                <div className="text-sm text-default-500">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 8, 0] }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <div className="w-6 h-10 rounded-full border-2 border-default-300 flex justify-center pt-2">
            <div className="w-1.5 h-3 rounded-full bg-default-400" />
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            viewport={{ once: true }}
            whileInView={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Wszystko czego potrzebujesz
            </h2>
            <p className="text-default-500 text-lg max-w-2xl mx-auto">
              Psiarze to kompletna aplikacja dla właścicieli psów, która ułatwia
              organizowanie wspólnych spacerów
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                whileInView={{ opacity: 1, y: 0 }}
              >
                <Card className="card-hover h-full bg-default-50/50 backdrop-blur-sm border border-default-200">
                  <CardBody className="p-6 text-center">
                    <div
                      className={`w-16 h-16 ${feature.color} rounded-2xl flex items-center justify-center mx-auto mb-4 text-white shadow-lg`}
                    >
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-semibold mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-default-500">{feature.description}</p>
                  </CardBody>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <motion.div
          className="max-w-4xl mx-auto"
          initial={{ opacity: 0, scale: 0.95 }}
          viewport={{ once: true }}
          whileInView={{ opacity: 1, scale: 1 }}
        >
          <Card className="bg-gradient-to-r from-amber-500 to-amber-600 dark:from-amber-600 dark:to-amber-700 shadow-2xl overflow-hidden">
            <CardBody className="p-8 md:p-12 text-center relative">
              {/* Decorative paws */}
              <div className="absolute top-4 left-4 text-4xl opacity-20">
                🐾
              </div>
              <div className="absolute bottom-4 right-4 text-4xl opacity-20">
                🐾
              </div>
              <div className="absolute top-1/2 right-8 text-6xl opacity-10">
                🐕
              </div>

              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Dołącz do społeczności psiarzy!
              </h2>
              <p className="text-amber-100 text-lg mb-8 max-w-xl mx-auto">
                Zarejestruj się już dziś i zacznij organizować wspólne spacery
                ze znajomymi i ich pupilami.
              </p>
              {!isLoading && !isAuthenticated && (
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    as={Link}
                    className="bg-white text-amber-600 font-semibold px-8 shadow-lg hover:bg-amber-50"
                    href="/rejestracja"
                    radius="full"
                    size="lg"
                  >
                    Rozpocznij za darmo
                  </Button>
                </div>
              )}
            </CardBody>
          </Card>
        </motion.div>
      </section>

      {/* Testimonials placeholder */}
      <section className="py-20 px-4 bg-default-50/50">
        <div className="max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            viewport={{ once: true }}
            whileInView={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Gotowy na wspólne spacery?
            </h2>
            <p className="text-default-500 text-lg mb-8 max-w-2xl mx-auto">
              Dołącz do społeczności psiarzy i organizuj spacery ze znajomymi w
              łatwy sposób!
            </p>
            {!isLoading && !isAuthenticated && (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  as={Link}
                  className="font-semibold px-8"
                  color="primary"
                  href="/rejestracja"
                  radius="full"
                  size="lg"
                  startContent={<span>🐕</span>}
                >
                  Utwórz konto za darmo
                </Button>
                <Button
                  as={Link}
                  className="font-semibold px-8"
                  href="/login"
                  radius="full"
                  size="lg"
                  variant="flat"
                >
                  Mam już konto
                </Button>
              </div>
            )}
          </motion.div>
        </div>
      </section>
    </div>
  );
}
