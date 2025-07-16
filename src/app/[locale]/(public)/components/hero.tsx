"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useThemeStore } from "../../../../components/ThemeToggle";
import TiltedCard from "@/components/TiltedCard";

export default function Hero() {
  const { theme } = useThemeStore();
  const isDark = theme === "dark";
  const radialGradient = isDark
    ? "radial-gradient(circle at 70% 30%, rgba(155, 135, 245, 0.15) 0%, rgba(13, 10, 25, 0) 60%)"
    : "radial-gradient(circle at 70% 30%, rgba(155, 135, 245, 0.18) 0%, rgba(255, 255, 255, 0) 60%)";
  // Extrair cor primária do CSS para usar nos shadows
  const primaryOklch = "oklch(0.6726 0.2904 341.4084)";
  // Sombra para container principal
  const shadowClass = isDark
    ? `shadow-[0_0_50px_${primaryOklch
        .replace(/oklch\(|\)/g, "")
        .replace(/ /g, ",")},0.22)]`
    : `shadow-[0_0_50px_${primaryOklch
        .replace(/oklch\(|\)/g, "")
        .replace(/ /g, ",")},0.10)]`;
  // Sombra para botão "Get Started"
  const buttonShadow = isDark
    ? `shadow-[0_0_20px_${primaryOklch
        .replace(/oklch\(|\)/g, "")
        .replace(/ /g, ",")},0.32)]`
    : `shadow-[0_0_20px_${primaryOklch
        .replace(/oklch\(|\)/g, "")
        .replace(/ /g, ",")},0.13)]`;
  return (
    <section
      className={
        `relative w-full h-full  overflow-hidden pb-10 pt-32 font-light antialiased md:pb-32 md:pt-40 ` +
        (isDark ? "bg-[#0a0613] text-white" : "bg-[#f8f8fa] text-zinc-900")
      }
      style={{
        background: isDark
          ? "linear-gradient(135deg, #0a0613 0%, #150d27 100%)"
          : "linear-gradient(135deg, #f8f8fa 0%, #e6e6f0 100%)",
      }}
    >
      <div
        className="absolute right-0 top-0 w-full"
        style={{
          background: radialGradient,
        }}
      />
      <div
        className="absolute left-0 top-0 h-full w-full -scale-x-100"
        style={{
          background: radialGradient,
        }}
      />

      <div className="container relative z-10 mx-auto max-w-2xl px-4 text-center md:max-w-4xl md:px-6 lg:max-w-7xl ">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <span className="mb-6 inline-block rounded-full border border-primary/30 px-3 py-2 text-xs text-primary">
            NEXT GENERATION OF CRYPTO TRADING
          </span>
          <h1 className="mx-auto mb-6 max-w-4xl text-4xl font-light md:text-5xl lg:text-7xl">
            Trade Smarter with <span className="text-primary">AI-Powered</span>{" "}
            Crypto Insights
          </h1>
          <p
            className={`mx-auto mb-10 max-w-2xl text-lg md:text-xl ${
              isDark ? "text-white/60" : "text-zinc-700/80"
            }`}
          >
            Lunexa combines artificial intelligence with cutting-edge trading
            strategies to help you maximize your crypto investments with
            precision and ease.
          </p>

          <div className="mb-10 flex flex-col items-center justify-center gap-4 sm:mb-0 sm:flex-row">
            <Link
              href="/signup"
              className={`relative w-full overflow-hidden rounded-full border border-white/10 px-8 py-2 text-white transition-all sm:w-auto duration-300 hover:border-primary/30  hover:brightness-85 button-gradient ${
                isDark ? "text-zinc-50" : "text-zinc-50 "
              }`}
            >
              Get Started
            </Link>
            <a
              href="#how-it-works"
              className={`flex w-full items-center justify-center gap-2 transition-colors hover:text-primary sm:w-auto ${
                isDark
                  ? "text-white/70 hover:text-white"
                  : "text-zinc-700/80 hover:text-zinc-900"
              }`}
            >
              <span>Learn how it works</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m6 9 6 6 6-6"></path>
              </svg>
            </a>
          </div>
        </motion.div>
        <motion.div
          className="relative h-[800px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
        >
          <div className="relative flex h-40 w-full overflow-hidden md:h-64">
            <img
              src="https://blocks.mvp-subha.me/assets/earth.png"
              alt="Earth"
              className="absolute left-1/2 top-0 -z-10 mx-auto -translate-x-1/2 px-4 opacity-80"
            />
          </div>

          <div className="hidden lg:block relative z-10 mx-auto max-w-5xl h-full rounded-lg ">
            <TiltedCard
              imageSrc="https://blocks.mvp-subha.me/assets/lunexa-db.png"
              altText="FluensTree - App Album Cover"
              captionText="FluensTree - App"
              containerHeight="400px"
              containerWidth="1024px"
              imageHeight="580px"
              imageWidth="1024px"
              rotateAmplitude={6}
              scaleOnHover={1.1}
              showMobileWarning={false}
              showTooltip={true}
              displayOverlayContent={true}
              overlayContent={
                <p className="tilted-card-demo-text">FluensTree - App</p>
              }
            />
          </div>
          <div
            className={`block lg:hidden  relative z-10 mx-auto max-w-5xl overflow-hidden rounded-lg border border-white/10 ${shadowClass}`}
          >
            <img
              src="https://blocks.mvp-subha.me/assets/lunexa-db.png"
              alt="Lunexa Dashboard"
              width={1920}
              height={1080}
              className="h-auto w-full rounded-lg border border-white/10"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
