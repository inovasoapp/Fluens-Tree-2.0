"use client";

interface InsertionIndicatorProps {
  isVisible: boolean;
  position: "top" | "bottom";
}

export function InsertionIndicator({
  isVisible,
  position,
}: InsertionIndicatorProps) {
  if (!isVisible) return null;

  return (
    <div
      className={`absolute left-0 right-0 h-0.5 bg-blue-500 rounded-full transition-all duration-200 ${
        position === "top" ? "-top-1" : "-bottom-1"
      } ${isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}
    >
      <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-blue-500 rounded-full -translate-x-1"></div>
      <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-blue-500 rounded-full translate-x-1"></div>
    </div>
  );
}
