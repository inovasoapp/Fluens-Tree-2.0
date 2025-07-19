"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  SidebarFooter,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

import { Separator } from "@radix-ui/react-separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { ChevronUp, Globe, Languages, Power, SettingsIcon } from "lucide-react";
import Link from "next/link";
import {
  useChangeLocale,
  useCurrentLocale,
  useI18n,
} from "@/lib/locales/client";
import { Button } from "@/components/ui/button";

export function AppSidebarFooter() {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  const currentLocale = useCurrentLocale();
  const changeLocale = useChangeLocale();
  const t = useI18n();

  const languages = [
    { code: "en", name: "English" },
    { code: "pt-BR", name: "Português (BR)" },
    { code: "es", name: "Español" },
  ];

  function handleAuth() {
    // Implementar lógica de logout quando necessário
    console.log("Logout clicked");
  }

  return (
    <SidebarFooter className="mt-auto">
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                className={`${isCollapsed ? "py-2 px-2" : "py-6"}`}
              >
                <Avatar>
                  <AvatarImage
                    src="https://plus.unsplash.com/premium_photo-1671656349218-5218444643d8?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                    className=" object-cover"
                  />
                  <AvatarFallback>Rodolfo</AvatarFallback>
                </Avatar>
                {!isCollapsed && (
                  <>
                    <div className="flex flex-col justify-center">
                      <span className="text-base font-heading">Rodolfo</span>
                      <span className="text-xs font-light">
                        {t("sidebar.freePlan")}
                      </span>
                    </div>
                    <ChevronUp className="ml-auto" />
                  </>
                )}
              </SidebarMenuButton>
            </DropdownMenuTrigger>

            <DropdownMenuContent side="top" className="w-[240px] flex flex-col">
              <DropdownMenuItem asChild>
                <Link
                  href="/"
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <div className="flex gap-2">
                    <Avatar>
                      <AvatarImage
                        src="https://plus.unsplash.com/premium_photo-1671656349218-5218444643d8?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                        className="object-cover"
                      />
                      <AvatarFallback>Rodolfo</AvatarFallback>
                    </Avatar>

                    <div className="flex flex-col items-start">
                      <span className="font-heading">Rodolfo</span>
                      <span className="text-xs font-light text-zinc-400 dark:text-zinc-500">
                        rodolfo@gmail.com
                      </span>
                    </div>
                  </div>

                  <span className="ml-auto">
                    <SettingsIcon
                      strokeWidth={1}
                      size={24}
                      className="text-zinc-300 dark:text-zinc-600"
                    />
                  </span>
                </Link>
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              {/* Seletor de idioma */}
              <DropdownMenuLabel className="flex items-center gap-2 py-2">
                <Globe size={16} />
                <span>{t("sidebar.language")}</span>
              </DropdownMenuLabel>

              {languages.map((lang) => (
                <DropdownMenuItem
                  key={lang.code}
                  className={`flex items-center gap-2 cursor-pointer ${
                    currentLocale === lang.code
                      ? "bg-primary/10 font-medium"
                      : ""
                  }`}
                  onClick={() =>
                    changeLocale(lang.code as "en" | "pt-BR" | "es")
                  }
                >
                  <div className="w-4 h-4 flex items-center justify-center">
                    {currentLocale === lang.code && (
                      <div className="w-2 h-2 rounded-full bg-primary" />
                    )}
                  </div>
                  {lang.name}
                </DropdownMenuItem>
              ))}

              <DropdownMenuSeparator />

              <DropdownMenuItem asChild>
                <button className="cursor-pointer">
                  {t("sidebar.viewAllPlans")}
                </button>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <span>{t("sidebar.learnMore")}</span>
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem>
                <button onClick={handleAuth} className="w-full py-2 flex gap-2">
                  <Power />
                  {t("sidebar.logout")}
                </button>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarFooter>
  );
}
