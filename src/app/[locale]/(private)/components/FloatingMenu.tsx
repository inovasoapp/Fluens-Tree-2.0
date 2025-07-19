"use client";

import React, { useState } from "react";
import {
  Menu,
  Users,
  Link as LinkIcon,
  BarChart3,
  Puzzle,
  Settings,
  ChevronDown,
  Home,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  href: string;
}

export const FloatingMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const [isActiveItem, setIsActiveItem] = useState(false);

  const currentPage = pathname.split("/").filter(Boolean).pop();

  console.log(
    "VERIFICANDO O PATHNAME " + pathname.split("/").filter(Boolean).pop()
  );

  const menuItems: MenuItem[] = [
    {
      id: "overview",
      label: "Overview",
      icon: <Home size={18} strokeWidth={1} />,
      href: "/overview",
    },
    {
      id: "leads",
      label: "Leads",
      icon: <Users size={18} strokeWidth={1} />,
      href: "/leads",
    },
    {
      id: "my-links",
      label: "My Links",
      icon: <LinkIcon size={18} strokeWidth={1} />,
      href: "/my-links",
    },
    {
      id: "analytics",
      label: "Analytics",
      icon: <BarChart3 size={18} strokeWidth={1} />,
      href: "/analytics",
    },
    {
      id: "integrations",
      label: "Integrations",
      icon: <Puzzle size={18} strokeWidth={1} />,
      href: "/integrations",
    },
    {
      id: "settings",
      label: "Settings",
      icon: <Settings size={18} strokeWidth={1} />,
      href: "/settings",
    },
  ];

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleItemClick = (href: string) => {
    console.log(`Navegando para: ${href}`);
    setIsOpen(false);
  };

  // Função para verificar se o item está ativo
  // const isActiveItem = (href: string) => {
  //   console.log("Verificando " + pathname.includes(href));
  //   return pathname === href || pathname.startsWith(href + "/");
  // };

  // console.log(isActiveItem);

  return (
    <div className="fixed top-6 left-6 z-50">
      <div className="relative z-50">
        {/* Trigger Button */}
        <Button
          onClick={handleToggle}
          className={`relative z-50 flex items-center justify-center w-12 h-12 rounded-full bg-primary backdrop-blur-sm hover:bg-primary text-white shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105 p-0 leading-none`}
        >
          <Menu size={20} className="pointer-events-none" />
          <span className="absolute z-40 top-1/2 transform -translate-y-1/2 left-10 bg-primary/50 backdrop-blur-sm py-2 px-4 rounded-r-full text-sm font-light text-white">
            {currentPage}
          </span>
        </Button>

        {/* Menu Items */}
        <div className="absolute z-30 top-16 left-0 flex flex-col gap-2">
          {menuItems.map((item, index) => {
            const isActive =
              item.href === "/" + pathname.split("/").filter(Boolean).pop();

            return (
              <div
                key={item.id}
                className={`
                  transform transition-all duration-600 ease-out
                  ${
                    isOpen
                      ? "translate-y-0 opacity-100 scale-100 rotate-0"
                      : "translate-y-[-50px] opacity-0 scale-0 rotate-[-5deg]"
                  }
                `}
                style={{
                  transitionDelay: isOpen
                    ? `${index * 120}ms`
                    : `${(menuItems.length - 1 - index) * 100}ms`,
                  transformOrigin: "top left",
                }}
              >
                <Link href={item.href} className="">
                  <button
                    onClick={() => handleItemClick(item.href)}
                    className={`
                      group flex relative items-center gap-3 px-4 py-3
                      w-48 rounded-full
                      shadow-md hover:shadow-lg
                      overflow-hidden
                      transition-all duration-300
                      transform hover:scale-[1.02]
                      text-left backdrop-blur-2xl
                      ${
                        isActive
                          ? "bg-primary text-white border-primary"
                          : "bg-card/80 hover:border-primary text-zinc-700 "
                      }
                    `}
                  >
                    <div
                      className={`z-40
                      flex-shrink-0 transition-all duration-300
                      ${
                        isActive
                          ? "text-white"
                          : "text-zinc-500 dark:text-zinc-200 group-hover:text-zinc-50"
                      }
                    `}
                    >
                      {item.icon}
                    </div>
                    <span
                      className={`z-40
                      text-sm font-light transition-all duration-300
                      ${
                        isActive
                          ? "text-white font-medium"
                          : "text-zinc-500 dark:text-zinc-200 group-hover:text-zinc-50"
                      }
                    `}
                    >
                      {item.label}
                    </span>

                    {/* <div className="absolute top-1/2 transform -translate-y-1/2 left-1 group-hover:left-0 rounded-full w-2 h-2 bg-primary group-hover:w-full group-hover:h-full transition-all duration-300" /> */}
                    <div className="absolute top-1/2 transform -translate-y-1/2 left-1 -translate-x-[98%] group-hover:translate-x-0 group-hover:left-0 rounded-full w-full h-full bg-primary/10 transition-all duration-300" />
                  </button>
                </Link>
              </div>
            );
          })}
        </div>

        {/* Backdrop */}
        {isOpen && (
          <div
            className="fixed inset-0 -z-10 bg-black/20 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
        )}
      </div>
    </div>
  );
};
