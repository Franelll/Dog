import "@/styles/globals.css";
// import "leaflet/dist/leaflet.css"; // Commented out to use CDN
import { Metadata, Viewport } from "next";
import { Link } from "@heroui/link";
import clsx from "clsx";

import { Providers } from "./providers";

import { siteConfig } from "@/config/site";
import { fontSans } from "@/config/fonts";
import { Navbar } from "@/components/navbar";
import { DogIcon } from "@/components/icons";

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s - ${siteConfig.name}`,
  },
  description: siteConfig.description,
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fffbeb" },
    { media: "(prefers-color-scheme: dark)", color: "#1c1917" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html suppressHydrationWarning lang="pl">
      <head>
        <link
          crossOrigin=""
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          rel="stylesheet"
        />
      </head>
      <body
        className={clsx(
          "min-h-screen text-foreground bg-background font-sans antialiased",
          fontSans.variable,
        )}
      >
        <Providers themeProps={{ attribute: "class", defaultTheme: "light" }}>
          <div className="relative flex flex-col min-h-screen bg-psiarze-gradient">
            <Navbar />
            <main className="container mx-auto max-w-7xl pt-8 px-4 sm:px-6 flex-grow">
              {children}
            </main>
            <footer className="w-full border-t border-default-100 bg-default-50/50 backdrop-blur-sm mt-auto">
              <div className="container mx-auto max-w-7xl px-6 py-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                  {/* Brand */}
                  <div className="md:col-span-2">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
                        <DogIcon className="text-white" size={24} />
                      </div>
                      <span className="font-bold text-xl text-gradient">
                        Psiarze
                      </span>
                    </div>
                    <p className="text-default-500 text-sm max-w-xs">
                      Aplikacja dla właścicieli psów. Umów się na spacer ze
                      znajomymi i nigdy nie spaceruj sam!
                    </p>
                    <div className="flex gap-2 mt-4">
                      <span className="text-2xl">🐕</span>
                      <span className="text-2xl">🦮</span>
                      <span className="text-2xl">🐕‍🦺</span>
                      <span className="text-2xl">🐩</span>
                    </div>
                  </div>

                  {/* Links */}
                  <div>
                    <h4 className="font-semibold mb-4">Nawigacja</h4>
                    <ul className="space-y-2 text-sm text-default-500">
                      <li>
                        <Link className="hover:text-primary" href="/">
                          Strona główna
                        </Link>
                      </li>
                      <li>
                        <Link className="hover:text-primary" href="/psiarze">
                          Aplikacja
                        </Link>
                      </li>
                      <li>
                        <Link className="hover:text-primary" href="/about">
                          O nas
                        </Link>
                      </li>
                      <li>
                        <Link className="hover:text-primary" href="/blog">
                          Blog
                        </Link>
                      </li>
                    </ul>
                  </div>

                  {/* Contact */}
                  <div>
                    <h4 className="font-semibold mb-4">Kontakt</h4>
                    <ul className="space-y-2 text-sm text-default-500">
                      <li>📧 kontakt@psiarze.pl</li>
                      <li>📱 +48 123 456 789</li>
                      <li>📍 Warszawa, Polska</li>
                    </ul>
                  </div>
                </div>

                <div className="border-t border-default-200 mt-8 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                  <p className="text-sm text-default-400">
                    © 2024 Psiarze. Wszystkie prawa zastrzeżone.
                  </p>
                  <div className="flex items-center gap-1 text-sm text-default-400">
                    <span>Zrobione z</span>
                    <span className="text-red-500">❤️</span>
                    <span>dla psiarzy</span>
                    <span className="ml-1">🐾</span>
                  </div>
                </div>
              </div>
            </footer>
          </div>
        </Providers>
      </body>
    </html>
  );
}
