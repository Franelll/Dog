"use client";

import {
  Navbar as HeroUINavbar,
  NavbarContent,
  NavbarMenu,
  NavbarMenuToggle,
  NavbarBrand,
  NavbarItem,
  NavbarMenuItem,
} from "@heroui/navbar";
import { Button } from "@heroui/button";
import { Link } from "@heroui/link";
import { Avatar } from "@heroui/avatar";
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@heroui/dropdown";
import { link as linkStyles } from "@heroui/theme";
import NextLink from "next/link";
import clsx from "clsx";
import { useRouter } from "next/navigation";

import { siteConfig } from "@/config/site";
import { ThemeSwitch } from "@/components/theme-switch";
import { DogIcon } from "@/components/icons";
import { useAuth } from "@/lib/auth-context";

export const Navbar = () => {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const userInitial = user?.username?.[0]?.toUpperCase() || "?";
  const displayName = user?.username || "Gość";

  return (
    <HeroUINavbar 
      maxWidth="xl" 
      position="sticky"
      classNames={{
        base: "bg-background/70 backdrop-blur-lg border-b border-default-100",
        wrapper: "px-4 sm:px-6",
      }}
    >
      <NavbarContent className="basis-1/5 sm:basis-full" justify="start">
        <NavbarBrand as="li" className="gap-3 max-w-fit">
          <NextLink className="flex justify-start items-center gap-2 group" href="/">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-md group-hover:shadow-lg group-hover:scale-105 transition-all">
              <DogIcon size={24} className="text-white" />
            </div>
            <p className="font-bold text-xl text-gradient">Psiarze</p>
          </NextLink>
        </NavbarBrand>
        <ul className="hidden lg:flex gap-6 justify-start ml-6">
          {siteConfig.navItems.map((item) => (
            <NavbarItem key={item.href}>
              <NextLink
                className={clsx(
                  linkStyles({ color: "foreground" }),
                  "data-[active=true]:text-primary data-[active=true]:font-medium font-medium hover:text-primary transition-colors flex items-center gap-1.5",
                )}
                color="foreground"
                href={item.href}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </NextLink>
            </NavbarItem>
          ))}
        </ul>
      </NavbarContent>

      <NavbarContent
        className="hidden sm:flex basis-1/5 sm:basis-full"
        justify="end"
      >
        <NavbarItem className="hidden sm:flex gap-3 items-center">
          <ThemeSwitch />
          
          {isAuthenticated ? (
            /* Profile Dropdown */
            <Dropdown placement="bottom-end">
              <DropdownTrigger>
                <Avatar
                  as="button"
                  className="transition-transform hover:scale-105 bg-gradient-to-br from-amber-400 to-orange-500 text-white cursor-pointer"
                  name={userInitial}
                  size="sm"
                />
              </DropdownTrigger>
              <DropdownMenu aria-label="Profile Actions" variant="flat">
                <DropdownItem key="profile" className="h-14 gap-2">
                  <p className="font-semibold">Zalogowany jako</p>
                  <p className="font-semibold text-primary">{displayName}</p>
                </DropdownItem>
                <DropdownItem key="my_profile" as={NextLink} href="/profil" textValue="Mój profil">
                  🐕 Mój profil
                </DropdownItem>
                <DropdownItem key="settings" as={NextLink} href="/ustawienia" textValue="Ustawienia">
                  ⚙️ Ustawienia
                </DropdownItem>
                <DropdownItem key="help" textValue="Pomoc">
                  ❓ Pomoc
                </DropdownItem>
                <DropdownItem key="logout" color="danger" textValue="Wyloguj" onPress={handleLogout}>
                  🚪 Wyloguj się
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          ) : (
            <div className="flex gap-2">
              <Button as={NextLink} href="/login" variant="flat" size="sm">
                Zaloguj
              </Button>
              <Button as={NextLink} href="/rejestracja" color="primary" size="sm">
                Rejestracja
              </Button>
            </div>
          )}
        </NavbarItem>
      </NavbarContent>

      <NavbarContent className="sm:hidden basis-1 pl-4" justify="end">
        <ThemeSwitch />
        {isAuthenticated ? (
          <Dropdown placement="bottom-end">
            <DropdownTrigger>
              <Avatar
                as="button"
                className="transition-transform bg-gradient-to-br from-amber-400 to-orange-500 text-white"
                name={userInitial}
                size="sm"
              />
            </DropdownTrigger>
            <DropdownMenu aria-label="Profile Actions" variant="flat">
              <DropdownItem key="profile" className="h-14 gap-2" textValue={`Signed in as ${displayName}`}>
                <p className="font-semibold">Zalogowany jako</p>
                <p className="font-semibold text-primary">{displayName}</p>
              </DropdownItem>
              <DropdownItem key="my_profile" as={NextLink} href="/profil" textValue="Mój profil">
                🐕 Mój profil
              </DropdownItem>
              <DropdownItem key="logout" color="danger" textValue="Wyloguj" onPress={handleLogout}>
                🚪 Wyloguj się
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        ) : (
          <Button as={NextLink} href="/login" variant="flat" size="sm">
            Zaloguj
          </Button>
        )}
        <NavbarMenuToggle />
      </NavbarContent>

      <NavbarMenu className="pt-6 bg-background/95 backdrop-blur-lg">
        <div className="mx-4 mt-2 flex flex-col gap-3">
          {siteConfig.navMenuItems.map((item, index) => (
            <NavbarMenuItem key={`${item.label}-${index}`}>
              <Link
                color={
                  item.label === "Mój Profil"
                    ? "primary"
                    : "foreground"
                }
                href={item.href}
                size="lg"
                className="w-full py-2 flex items-center gap-2"
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            </NavbarMenuItem>
          ))}
        </div>
      </NavbarMenu>
    </HeroUINavbar>
  );
};
