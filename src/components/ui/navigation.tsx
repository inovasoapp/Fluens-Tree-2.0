import { useState, useEffect } from "react";
import { Command, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import Link from "next/link";
import { ThemeToggle, useThemeStore } from "../ThemeToggle";
import { AnimatedBackground } from "../motion-primitives/animated-background";
import Logo from "../logo";

const Navigation = () => {
  const { theme } = useThemeStore();
  const isDark = theme === "dark";
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    if (sectionId === "testimonials") {
      const testimonialSection = document.querySelector(".animate-marquee");
      if (testimonialSection) {
        const yOffset = -100; // Offset to account for the fixed header
        const y =
          testimonialSection.getBoundingClientRect().top +
          window.pageYOffset +
          yOffset;
        window.scrollTo({ top: y, behavior: "smooth" });
      }
    } else if (sectionId === "cta") {
      const ctaSection = document.querySelector(".button-gradient");
      if (ctaSection) {
        const yOffset = -100;
        const y =
          ctaSection.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: "smooth" });
      }
    } else {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  const navItems = [
    {
      name: "Início",
      href: "#hero",
      onClick: () => window.scrollTo({ top: 0, behavior: "smooth" }),
    },
    {
      name: "Problemas",
      href: "#problemas",
      onClick: () => scrollToSection("problemas"),
    },
    {
      name: "Soluções",
      href: "#solucoes",
      onClick: () => scrollToSection("solucoes"),
    },
    {
      name: "Sobre",
      href: "#sobre",
      onClick: () => scrollToSection("sobre"),
    },
    {
      name: "Planos",
      href: "#planos",
      onClick: () => scrollToSection("planos"),
    },
    {
      name: "FAQ",
      href: "#faq",
      onClick: () => scrollToSection("faq"),
    },
  ];

  return (
    <header
      className={`fixed top-3.5 left-1/2 -translate-x-1/2 z-50 transition-all duration-500 rounded-full 
        ${
          isScrolled
            ? `${
                isDark
                  ? "h-14 bg-zinc-900/40 backdrop-blur-xl border border-white/10 scale-95 w-[90%] max-w-[920px]"
                  : "h-14 bg-white/80 backdrop-blur-xl border border-zinc-200 scale-95 w-[90%] max-w-[920px]"
              }`
            : `${
                isDark
                  ? "h-14 bg-zinc-900/40 w-full max-w-[1024px]"
                  : "h-14 bg-white w-full max-w-[1024px] border border-zinc-200"
              }`
        }`}
    >
      <div className="mx-auto h-full px-3">
        <nav
          className={`flex items-center justify-between h-full ${
            isDark ? "" : "text-zinc-900"
          }`}
        >
          <div className="flex items-center gap-2">
            <Logo />
            {/* <Command
              className={`w-5 h-5 ${isDark ? "text-primary" : "text-primary"}`}
              strokeWidth={1}
            />
            <span
              className={`font-bold ${
                isDark ? "text-neutral-200" : "text-zinc-900"
              }`}
            >
              CryptoTrade
            </span> */}
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center ">
            <AnimatedBackground
              defaultValue={navItems[0]}
              className="rounded-full bg-primary/20 dark:bg-primary/20"
              transition={{
                type: "tween",
                bounce: 0.2,
                duration: 0.3,
              }}
              enableHover
            >
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  data-id={item.name}
                  onClick={(e) => {
                    e.preventDefault();
                    if (item.onClick) {
                      item.onClick();
                    }
                  }}
                  className={`text-sm px-4 py-2 font-light  ${
                    isDark
                      ? "text-zinc-200 hover:text-zinc-50"
                      : "text-zinc-700 hover:text-zinc-800"
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </AnimatedBackground>
            <span
              className={`mx-2 select-none ${
                isDark ? "text-neutral-800" : "text-zinc-300"
              }`}
            >
              |
            </span>

            <Link
              href="/login"
              className={`text-sm font-light transition-all duration-300 ml-4 ${
                isDark
                  ? "text-zinc-200 hover:text-primary"
                  : "text-zinc-700 hover:text-primary"
              }`}
            >
              Login
            </Link>
            <Link href="/signup">
              <Button
                onClick={() => scrollToSection("cta")}
                size="sm"
                className={`button-gradient rounded-full font-light px-6 ml-6 ${
                  isDark ? "" : "bg-primary/90 text-white border-primary/20"
                }`}
              >
                Get Start
              </Button>
            </Link>
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className={`glass border-0 ${
                    isDark
                      ? "bg-primary text-neutral-100"
                      : "bg-primary/90 text-white"
                  }`}
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent
                className={`${
                  isDark
                    ? "bg-neutral-950/80 border-neutral-900"
                    : "bg-white/90 border-zinc-200"
                } backdrop-blur-md px-4 border-l-[1px]`}
              >
                <div className="flex flex-col gap-4 mt-8 h-full pb-4">
                  {navItems.map((item) => (
                    <a
                      key={item.name}
                      href={item.href}
                      className={`text-lg font-light transition-colors ${
                        isDark
                          ? "text-muted-foreground hover:text-primary"
                          : "text-zinc-700 hover:text-primary"
                      }`}
                      onClick={(e) => {
                        e.preventDefault();
                        setIsMobileMenuOpen(false);
                        if (item.onClick) {
                          item.onClick();
                        }
                      }}
                    >
                      {item.name}
                    </a>
                  ))}

                  <div className="flex flex-1 h-full flex-col items-center gap-3 mt-4">
                    <Link
                      href="/login"
                      className={`w-full flex items-center justify-center rounded-md py-2 text-lg font-light ${
                        isDark
                          ? "bg-neutral-900/60 text-muted-foreground hover:text-primary"
                          : "bg-zinc-100 text-zinc-700 hover:text-primary"
                      }`}
                    >
                      Login
                    </Link>
                    <Link href="/signup" className="flex flex-1 w-full">
                      <Button
                        onClick={() => {
                          setIsMobileMenuOpen(false);
                          scrollToSection("cta");
                        }}
                        className={`button-gradient flex w-full py-5 ${
                          isDark
                            ? ""
                            : "bg-primary/90 text-white border-primary/20"
                        }`}
                      >
                        Start Trading
                      </Button>
                    </Link>

                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                      }}
                      className={`w-full py-5 mt-auto text-lg font-light border-[1px] ${
                        isDark
                          ? "bg-neutral-950 text-neutral-500 border-neutral-800"
                          : "bg-zinc-100 text-zinc-700 border-zinc-300"
                      }`}
                    >
                      Fechar
                    </Button>

                    <ThemeToggle />
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Navigation;
