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

const items = [
  {
    title: "Home",
    url: "/overview",
    icon: Home,
  },
  {
    title: "Leads",
    url: "/leads",
    icon: Users,
  },
  {
    title: "My links",
    url: "/my-links",
    icon: CircuitBoard,
  },
  {
    title: "Analytics",
    url: "/analytics",
    icon: ChartSpline,
  },
  {
    title: "Integrations",
    url: "/integrations",
    icon: Combine,
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
  },
];

const supportItems = [
  {
    title: "Tutorials",
    url: "/tutorials",
    icon: ListVideo,
  },
  {
    title: "Support",
    url: "/support",
    icon: Headset,
  },
  {
    title: "Tickets",
    url: "/tickets",
    icon: Group,
  },
];

export function AppSidebarUserGroup() {
  const pathname = usePathname();
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  // Função para verificar se o item está ativo
  const isActive = (url: string) => {
    // Verifica se o pathname contém a URL do item (exceto para o dashboard que deve ser exato)
    if (url === "/dashboard") {
      return pathname === url || pathname.endsWith("/overview");
    }
    return pathname.includes(url);
  };

  return (
    <>
      <SidebarGroup>
        <SidebarGroupLabel className="font-heading">
          Application
        </SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {items.map((item) => {
              const active = isActive(item.url);

              return (
                <SidebarMenuItem key={item.title} className="">
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
                          aria-label={item.title}
                        >
                          <item.icon strokeWidth={1} size={20} />
                          <span
                            className={`font-heading ${
                              isCollapsed ? "hidden" : "block"
                            }`}
                          >
                            {item.title}
                          </span>
                        </Link>
                      </TooltipTrigger>
                      {isCollapsed && (
                        <TooltipContent side="right">
                          {item.title}
                        </TooltipContent>
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
        <SidebarGroupLabel className="font-heading">Suporte</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {supportItems.map((item) => {
              const active = isActive(item.url);

              return (
                <SidebarMenuItem key={item.title} className="">
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
                          aria-label={item.title}
                        >
                          <item.icon strokeWidth={1} size={20} />
                          <span
                            className={`font-heading ${
                              isCollapsed ? "hidden" : "block"
                            }`}
                          >
                            {item.title}
                          </span>
                        </Link>
                      </TooltipTrigger>
                      {isCollapsed && (
                        <TooltipContent side="right">
                          {item.title}
                        </TooltipContent>
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
