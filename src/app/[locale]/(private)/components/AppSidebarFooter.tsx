"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
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

import { ChevronUp, Power, SettingsIcon } from "lucide-react";
import Link from "next/link";

export function AppSidebarFooter() {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

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
                className={`h-16 ${isCollapsed ? "py-2 px-2" : "py-4"}`}
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
                      <span className="text-xs font-light">plano Gratuito</span>
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

              <div className="h-1">
                <Separator className="data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-px bg-sidebar-border" />
              </div>

              <div className="h-1">
                <Separator className="data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-px bg-sidebar-border" />
              </div>

              <DropdownMenuItem asChild>
                <button className="cursor-pointer">Ver todos os planos</button>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <span>Saiba mais</span>
              </DropdownMenuItem>

              <div className="h-1">
                <Separator className="data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-px bg-sidebar-border" />
              </div>

              <DropdownMenuItem>
                <button onClick={handleAuth} className="w-full py-2 flex gap-2">
                  <Power />
                  Sair
                </button>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarFooter>
  );
}
