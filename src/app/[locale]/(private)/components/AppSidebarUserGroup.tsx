"use client";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  ChartSpline,
  CircuitBoard,
  Combine,
  Group,
  Headset,
  Home,
  ListVideo,
  Settings,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useI18n } from "@/lib/locales/client";

// Definindo tipos para as chaves de tradução para evitar erros de tipagem
type SidebarTranslationKey =
  | "sidebar.application"
  | "sidebar.home"
  | "sidebar.leads"
  | "sidebar.myLinks"
  | "sidebar.analytics"
  | "sidebar.integrations"
  | "sidebar.settings"
  | "sidebar.support"
  | "sidebar.tutorials"
  | "sidebar.supportHelp"
  | "sidebar.tickets";

// Definindo o tipo para os itens do menu
interface MenuItem {
  titleKey: SidebarTranslationKey;
  url: string;
  icon: React.ElementType;
}

export function AppSidebarUserGroup() {
  const pathname = usePathname();
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  const t = useI18n();

  // Função para verificar se o item está ativo
  const isActive = (url: string) => {
    // Verifica se o pathname contém a URL do item (exceto para o dashboard que deve ser exato)
    if (url === "/dashboard") {
      return pathname === url || pathname.endsWith("/overview");
    }
    return pathname.includes(url);
  };

  // Definindo os itens com as chaves de tradução tipadas
  const items: MenuItem[] = [
    {
      titleKey: "sidebar.home",
      url: "/overview",
      icon: Home,
    },
    {
      titleKey: "sidebar.leads",
      url: "/leads",
      icon: Users,
    },
    {
      titleKey: "sidebar.myLinks",
      url: "/my-links",
      icon: CircuitBoard,
    },
    {
      titleKey: "sidebar.analytics",
      url: "/analytics",
      icon: ChartSpline,
    },
    {
      titleKey: "sidebar.integrations",
      url: "/integrations",
      icon: Combine,
    },
    {
      titleKey: "sidebar.settings",
      url: "/settings",
      icon: Settings,
    },
  ];

  const supportItems: MenuItem[] = [
    {
      titleKey: "sidebar.tutorials",
      url: "/tutorials",
      icon: ListVideo,
    },
    {
      titleKey: "sidebar.supportHelp",
      url: "/support",
      icon: Headset,
    },
    {
      titleKey: "sidebar.tickets",
      url: "/tickets",
      icon: Group,
    },
  ];

  return (
    <>
      <SidebarGroup>
        <SidebarGroupLabel className="font-heading">
          {t("sidebar.application")}
        </SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {items.map((item) => {
              const active = isActive(item.url);
              const title = t(item.titleKey);

              return (
                <SidebarMenuItem key={item.titleKey} className="">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Link
                          href={item.url}
                          className={`flex items-center gap-2 rounded-md p-2 transition-all ${
                            active
                              ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                              : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                          }`}
                          aria-label={title}
                        >
                          <item.icon strokeWidth={1} size={20} />
                          <span
                            className={`font-heading ${
                              isCollapsed ? "hidden" : "block"
                            }`}
                          >
                            {title}
                          </span>
                        </Link>
                      </TooltipTrigger>
                      {isCollapsed && (
                        <TooltipContent side="right">{title}</TooltipContent>
                      )}
                    </Tooltip>
                  </TooltipProvider>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      <SidebarGroup>
        <SidebarGroupLabel className="font-heading">
          {t("sidebar.support")}
        </SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {supportItems.map((item) => {
              const active = isActive(item.url);
              const title = t(item.titleKey);

              return (
                <SidebarMenuItem key={item.titleKey} className="">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Link
                          href={item.url}
                          className={`flex items-center gap-2 rounded-md p-2 transition-all ${
                            active
                              ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                              : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                          }`}
                          aria-label={title}
                        >
                          <item.icon strokeWidth={1} size={20} />
                          <span
                            className={`font-heading ${
                              isCollapsed ? "hidden" : "block"
                            }`}
                          >
                            {title}
                          </span>
                        </Link>
                      </TooltipTrigger>
                      {isCollapsed && (
                        <TooltipContent side="right">{title}</TooltipContent>
                      )}
                    </Tooltip>
                  </TooltipProvider>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </>
  );
}
