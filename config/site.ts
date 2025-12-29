export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: "Psiarze",
  description: "Aplikacja dla właścicieli psów - umów się na spacer ze znajomymi!",
  navItems: [
    {
      label: "Start",
      href: "/",
      icon: "🏠",
    },
    {
      label: "Czaty",
      href: "/czaty",
      icon: "💬",
    },
    {
      label: "Mapa",
      href: "/mapa",
      icon: "🗺️",
    },
    {
      label: "Znajomi",
      href: "/znajomi",
      icon: "👥",
    },
  ],
  navMenuItems: [
    {
      label: "Start",
      href: "/",
      icon: "🏠",
    },
    {
      label: "Czaty",
      href: "/czaty",
      icon: "💬",
    },
    {
      label: "Mapa",
      href: "/mapa",
      icon: "🗺️",
    },
    {
      label: "Znajomi",
      href: "/znajomi",
      icon: "👥",
    },
    {
      label: "Mój Profil",
      href: "/profil",
      icon: "🐕",
    },
    {
      label: "Ustawienia",
      href: "/ustawienia",
      icon: "⚙️",
    },
  ],
  links: {
    github: "https://github.com/heroui-inc/heroui",
    twitter: "https://twitter.com/hero_ui",
    docs: "https://heroui.com",
    discord: "https://discord.gg/9b6yyZKmH4",
    sponsor: "https://patreon.com/jrgarciadev",
  },
};
