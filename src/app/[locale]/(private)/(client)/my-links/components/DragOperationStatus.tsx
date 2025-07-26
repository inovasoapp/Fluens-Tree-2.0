"use client";

import { useEffect, useState } from "react";
import { useBioBuilderStore } from "@/stores/bio-builder-store";

interface DragOperationStatusProps {
  className?: string;
}

type OperationStatus =
  | "idle"
  | "starting"
  | "dragging"
  | "positioning"
  | "completing"
  | "error";

interface StatusConfig {
  icon: string;
  message: string;
  color: string;
  bgColor: string;
  borderColor: string;
  animation: string;
}

const statusConfigs: Record<OperationStatus, StatusConfig> = {
  idle: {
    icon: "⚪",
    message: "Ready",
    color: "text-gray-500",
    bgColor: "bg-gray-100 dark:bg-gray-800",
    borderColor: "border-gray-300 dark:border-gray-600",
    animation: "",
  },
  starting: {
    icon: "🚀",
    message: "Starting drag operation...",
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-50 dark:bg-blue-900/20",
    borderColor: "border-blue-300 dark:border-blue-600",
    animation: "animate-pulse",
  },
  dragging: {
    icon: "✋",
    message: "Dragging element",
    color: "text-purple-600 dark:text-purple-400",
    bgColor: "bg-purple-50 dark:bg-purple-900/20",
    borderColor: "border-purple-300 dark:border-purple-600",
    animation: "animate-status-bounce",
  },
  positioning: {
    icon: "🎯",
    message: "Finding position...",
    color: "text-orange-600 dark:text-orange-400",
    bgColor: "bg-orange-50 dark:bg-orange-900/20",
    borderColor: "border-orange-300 dark:border-orange-600",
    animation: "animate-operation-spin",
  },
  completing: {
    icon: "✅",
    message: "Completing operation",
    color: "text-green-600 dark:text-green-400",
    bgColor: "bg-green-50 dark:bg-green-900/20",
    borderColor: "border-green-300 dark:border-green-600",
    animation: "animate-pulse",
  },
  error: {
    icon: "❌",
    message: "Operation failed",
    color: "text-red-600 dark:text-red-400",
    bgColor: "bg-red-50 dark:bg-red-900/20",
    borderColor: "border-red-300 dark:border-red-600",
    animation: "animate-pulse",
  },
};

export function DragOperationStatus({
  className = "",
}: DragOperationStatusProps) {
  const { dragState } = useBioBuilderStore();
  const [operationStatus, setOperationStatus] =
    useState<OperationStatus>("idle");
  const [isVisible, setIsVisible] = useState(false);
  const [operationDetails, setOperationDetails] = useState<{
    elementName?: string;
    confidence?: number;
    position?: string;
  }>({});

  // Track drag operation status based on store state
  useEffect(() => {
    const {
      isDragging,
      draggedElement,
      draggedTemplate,
      dragOverIndex,
      insertionPosition,
      dragOperationId,
    } = dragState;

    if (!isDragging && !dragOperationId) {
      setOperationStatus("idle");
      setIsVisible(false);
      setOperationDetails({});
      return;
    }

    setIsVisible(true);

    if (dragOperationId && !isDragging) {
      setOperationStatus("starting");
      setOperationDetails({
        elementName:
          draggedElement?.data.text || draggedTemplate?.name || "Element",
      });
    } else if (isDragging && (dragOverIndex !== null || insertionPosition)) {
      setOperationStatus("positioning");
      setOperationDetails({
        elementName:
          draggedElement?.data.text || draggedTemplate?.name || "Element",
        position: insertionPosition || "calculating...",
      });
    } else if (isDragging) {
      setOperationStatus("dragging");
      setOperationDetails({
        elementName:
          draggedElement?.data.text || draggedTemplate?.name || "Element",
      });
    }
  }, [dragState]);

  // Auto-hide after successful completion
  useEffect(() => {
    if (operationStatus === "completing") {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setOperationStatus("idle");
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [operationStatus]);

  if (!isVisible || operationStatus === "idle") {
    return null;
  }

  const config = statusConfigs[operationStatus];

  return (
    <div
      className={`fixed top-4 right-4 z-50 transition-all duration-300 ease-out ${className}`}
      style={{
        transform: isVisible ? "translateY(0)" : "translateY(-100%)",
        opacity: isVisible ? 1 : 0,
      }}
    >
      <div
        className={`
          flex items-center space-x-3 px-4 py-3 rounded-lg shadow-lg border backdrop-blur-sm
          ${config.bgColor} ${config.borderColor} ${config.animation}
          transition-all duration-300 ease-out
        `}
      >
        {/* Status icon */}
        <div className="flex-shrink-0">
          <span className="text-lg">{config.icon}</span>
        </div>

        {/* Status content */}
        <div className="flex flex-col min-w-0">
          <div className={`text-sm font-medium ${config.color}`}>
            {config.message}
          </div>

          {operationDetails.elementName && (
            <div className="text-xs opacity-75 truncate max-w-32">
              {operationDetails.elementName}
            </div>
          )}

          {operationDetails.position && (
            <div className="text-xs opacity-60">
              Position: {operationDetails.position}
            </div>
          )}
        </div>

        {/* Progress indicator for positioning */}
        {operationStatus === "positioning" && (
          <div className="flex-shrink-0">
            <div className="w-4 h-4 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Success indicator */}
        {operationStatus === "completing" && (
          <div className="flex-shrink-0">
            <div className="w-4 h-4 bg-green-500 rounded-full animate-ping" />
          </div>
        )}
      </div>

      {/* Progress bar for long operations */}
      {(operationStatus === "positioning" ||
        operationStatus === "starting") && (
        <div className="mt-2 w-full h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              operationStatus === "positioning"
                ? "bg-orange-400 animate-progress-fill"
                : "bg-blue-400 animate-pulse"
            }`}
          />
        </div>
      )}
    </div>
  );
}
