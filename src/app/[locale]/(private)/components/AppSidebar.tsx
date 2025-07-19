import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar";

import Image from "next/image";
import { ReactNode } from "react";

interface AppSidebarProps {
  children: ReactNode;
}

export function AppSidebar({ children }: AppSidebarProps) {
  return (
    <Sidebar collapsible="icon">
      <SidebarContent className="bg-sidebar">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <span className="flex gap-3 items-center">
                  <SidebarTrigger className="flex items-center justify-start px-2" />

                  <Image
                    src="/fluens-tree-logo.svg"
                    width={150}
                    height={150}
                    alt="logo"
                  />
                </span>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        {children}
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  );
}
