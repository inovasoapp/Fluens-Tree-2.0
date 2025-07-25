"use client";

import { useEffect, useState } from "react";

interface InsertionIndicatorProps {
  isVisible: boolean;
  position: "top" | "bottom" | "between";
  index?: number;
}

export function InsertionIndicator({
  isVisible,
  position,
  index,
}: InsertionIndicatorProps) {
  const [shouldRender, setShouldRender] = useState(false);
  const [isAnimatingIn, setIsAnimatingIn] = useState(false);
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);

  useEffect(() => {
    if (isVisible && !shouldRender) {
      setShouldRender(true);
      setIsAnimatingOut(false);
      requestAnimationFrame(() => {
        setIsAnimatingIn(true);
      });
    } else if (!isVisible && shouldRender) {
      setIsAnimatingIn(false);
      setIsAnimatingOut(true);
      const timer = setTimeout(() => {
        setShouldRender(false);
        setIsAnimatingOut(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isVisible, shouldRender]);

  if (!shouldRender) return null;

  return (
    <div
      className={`w-full transition-all duration-300 ease-out ${
        position === "top" ? "mb-2" : ""
      } ${position === "bottom" ? "mt-2" : ""} ${
        position === "between" ? "my-2" : ""
      } ${
        isAnimatingIn && !isAnimatingOut
          ? "opacity-100 scale-y-100 translate-y-0"
          : ""
      } ${isAnimatingOut ? "opacity-0 scale-y-50 -translate-y-1" : ""} ${
        !isAnimatingIn && !isAnimatingOut
          ? "opacity-0 scale-y-50 translate-y-1"
          : ""
      }`}
      style={{
        transformOrigin: "center",
        height: isAnimatingOut ? "0px" : "auto",
      }}
    >
      <div
        className={`relative w-full h-0.5 rounded-full transition-all duration-300 ease-out ${
          isAnimatingIn ? "opacity-100 scale-x-100" : "opacity-0 scale-x-0"
        }`}
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, #3b82f6 20%, #60a5fa 50%, #3b82f6 80%, transparent 100%)",
          boxShadow: "0 0 12px rgba(59, 130, 246, 0.6)",
          transformOrigin: "center",
        }}
      >
        <div
          className="absolute inset-0 rounded-full animate-pulse"
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, rgba(59, 130, 246, 0.4) 20%, rgba(96, 165, 250, 0.6) 50%, rgba(59, 130, 246, 0.4) 80%, transparent 100%)",
            boxShadow: "0 0 16px rgba(59, 130, 246, 0.4)",
          }}
        />

        <div className="relative w-full h-full">
          <div
            className={`absolute left-0 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-blue-500 rounded-full shadow-lg transition-all duration-300 ease-out ${
              isAnimatingIn
                ? "opacity-100 scale-100 translate-x-0"
                : "opacity-0 scale-50 -translate-x-2"
            }`}
            style={{ boxShadow: "0 0 8px rgba(59, 130, 246, 0.8)" }}
          />

          <div
            className={`absolute right-0 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-blue-500 rounded-full shadow-lg transition-all duration-300 ease-out ${
              isAnimatingIn
                ? "opacity-100 scale-100 translate-x-0"
                : "opacity-0 scale-50 translate-x-2"
            }`}
            style={{ boxShadow: "0 0 8px rgba(59, 130, 246, 0.8)" }}
          />

          <div
            className={`absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1 h-1 bg-blue-400 rounded-full transition-all duration-300 ease-out delay-150 ${
              isAnimatingIn ? "opacity-100 scale-100" : "opacity-0 scale-0"
            }`}
          />

          {position === "top" && isAnimatingIn && (
            <div
              className={`absolute left-1/2 transform -translate-x-1/2 -top-8 text-xs text-blue-600 dark:text-blue-400 font-medium bg-white dark:bg-zinc-800 px-3 py-1.5 rounded-md shadow-lg border border-blue-200 dark:border-blue-700 transition-all duration-300 ease-out delay-200 ${
                isAnimatingIn
                  ? "opacity-100 translate-y-0 scale-100"
                  : "opacity-0 translate-y-2 scale-95"
              }`}
            >
              <div className="flex items-center space-x-1">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
                <span>Inserir aqui</span>
              </div>
              <div className="absolute left-1/2 transform -translate-x-1/2 top-full">
                <div className="w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-blue-200 dark:border-t-blue-700" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
