"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useAnimationController } from "@/lib/animation-controller";

interface InsertionIndicatorProps {
  isVisible: boolean;
  position: "top" | "bottom" | "between";
  index?: number;
  mousePosition?: { x: number; y: number };
  confidence?: number;
}

interface AnimationState {
  isAnimatingIn: boolean;
  isAnimatingOut: boolean;
  shouldRender: boolean;
  staggerPhase: number;
}

export function InsertionIndicator({
  isVisible,
  position,
  index,
  mousePosition,
  confidence = 1.0,
}: InsertionIndicatorProps) {
  const [animationState, setAnimationState] = useState<AnimationState>({
    isAnimatingIn: false,
    isAnimatingOut: false,
    shouldRender: false,
    staggerPhase: 0,
  });

  const [interpolatedPosition, setInterpolatedPosition] =
    useState(mousePosition);
  const animationController = useAnimationController();
  const containerRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastPositionRef = useRef(mousePosition);

  // Smooth position interpolation for real-time updates
  const interpolatePosition = useCallback(
    (targetPosition?: { x: number; y: number }) => {
      if (!targetPosition || !lastPositionRef.current) {
        setInterpolatedPosition(targetPosition);
        lastPositionRef.current = targetPosition;
        return;
      }

      const startPosition = lastPositionRef.current;
      const startTime = performance.now();
      const duration = 100; // 100ms interpolation

      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Smooth easing function
        const easeProgress = 1 - Math.pow(1 - progress, 3);

        const interpolated = {
          x:
            startPosition.x +
            (targetPosition.x - startPosition.x) * easeProgress,
          y:
            startPosition.y +
            (targetPosition.y - startPosition.y) * easeProgress,
        };

        setInterpolatedPosition(interpolated);

        if (progress < 1) {
          animationFrameRef.current = requestAnimationFrame(animate);
        } else {
          lastPositionRef.current = targetPosition;
        }
      };

      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      animationFrameRef.current = requestAnimationFrame(animate);
    },
    []
  );

  // Handle position updates with smooth interpolation
  useEffect(() => {
    interpolatePosition(mousePosition);
  }, [mousePosition, interpolatePosition]);

  // Enhanced visibility management with staggered animations
  useEffect(() => {
    if (isVisible && !animationState.shouldRender) {
      setAnimationState((prev) => ({
        ...prev,
        shouldRender: true,
        isAnimatingOut: false,
        staggerPhase: 0,
      }));

      // Staggered animation sequence
      const startStaggeredAnimation = async () => {
        try {
          // Phase 1: Container appears
          requestAnimationFrame(() => {
            setAnimationState((prev) => ({
              ...prev,
              isAnimatingIn: true,
              staggerPhase: 1,
            }));
          });

          // Phase 2: Line animation (50ms delay)
          setTimeout(() => {
            setAnimationState((prev) => ({
              ...prev,
              staggerPhase: 2,
            }));
          }, 50);

          // Phase 3: End points animation (100ms delay)
          setTimeout(() => {
            setAnimationState((prev) => ({
              ...prev,
              staggerPhase: 3,
            }));
          }, 100);

          // Phase 4: Center dot and text (150ms delay)
          setTimeout(() => {
            setAnimationState((prev) => ({
              ...prev,
              staggerPhase: 4,
            }));
          }, 150);
        } catch (error) {
          console.warn("Animation sequence failed:", error);
        }
      };

      startStaggeredAnimation();
    } else if (!isVisible && animationState.shouldRender) {
      setAnimationState((prev) => ({
        ...prev,
        isAnimatingIn: false,
        isAnimatingOut: true,
        staggerPhase: 0,
      }));

      // Cleanup timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        setAnimationState((prev) => ({
          ...prev,
          shouldRender: false,
          isAnimatingOut: false,
        }));
      }, 250); // Reduced from 300ms for snappier feel
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isVisible, animationState.shouldRender]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Accessibility announcements
  const announceToScreenReader = useCallback((message: string) => {
    const announcement = document.createElement("div");
    announcement.setAttribute("aria-live", "polite");
    announcement.setAttribute("aria-atomic", "true");
    announcement.className = "sr-only";
    announcement.textContent = message;

    document.body.appendChild(announcement);

    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }, []);

  // Announce position changes to screen readers
  useEffect(() => {
    if (isVisible && animationState.isAnimatingIn) {
      const positionText =
        position === "top"
          ? "above"
          : position === "bottom"
          ? "below"
          : "between";
      const indexText =
        typeof index === "number" ? ` at position ${index + 1}` : "";
      const confidenceText = confidence < 0.8 ? " (approximate position)" : "";

      announceToScreenReader(
        `Drop zone ${positionText}${indexText}${confidenceText}`
      );
    }
  }, [
    isVisible,
    animationState.isAnimatingIn,
    position,
    index,
    confidence,
    announceToScreenReader,
  ]);

  if (!animationState.shouldRender) return null;

  // Calculate confidence-based styling
  const confidenceOpacity = Math.max(0.4, confidence);
  const confidenceScale = 0.8 + confidence * 0.2;

  return (
    <div
      ref={containerRef}
      className={`w-full transition-all duration-250 ease-out ${
        position === "top" ? "mb-2" : ""
      } ${position === "bottom" ? "mt-2" : ""} ${
        position === "between" ? "my-2" : ""
      }`}
      style={{
        transformOrigin: "center",
        opacity: animationState.isAnimatingOut ? 0 : confidenceOpacity,
        transform: `scale(${
          animationState.isAnimatingIn ? confidenceScale : 0.9
        }) ${
          animationState.isAnimatingOut ? "translateY(-4px)" : "translateY(0)"
        }`,
        height: animationState.isAnimatingOut ? "0px" : "auto",
      }}
      role="status"
      aria-label={`Insertion indicator ${position}${
        typeof index === "number" ? ` at position ${index + 1}` : ""
      }`}
      aria-live="polite"
    >
      {/* Main gradient line with staggered animation */}
      <div
        className={`relative w-full h-0.5 rounded-full transition-all duration-200 ease-out`}
        style={{
          background: `linear-gradient(90deg, transparent 0%, rgba(59, 130, 246, ${confidenceOpacity}) 20%, rgba(96, 165, 250, ${confidenceOpacity}) 50%, rgba(59, 130, 246, ${confidenceOpacity}) 80%, transparent 100%)`,
          boxShadow: `0 0 12px rgba(59, 130, 246, ${confidenceOpacity * 0.6})`,
          transformOrigin: "center",
          opacity: animationState.staggerPhase >= 2 ? 1 : 0,
          transform: `scaleX(${animationState.staggerPhase >= 2 ? 1 : 0})`,
        }}
      >
        {/* Animated pulse overlay */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: `linear-gradient(90deg, transparent 0%, rgba(59, 130, 246, ${
              confidenceOpacity * 0.4
            }) 20%, rgba(96, 165, 250, ${
              confidenceOpacity * 0.6
            }) 50%, rgba(59, 130, 246, ${
              confidenceOpacity * 0.4
            }) 80%, transparent 100%)`,
            boxShadow: `0 0 16px rgba(59, 130, 246, ${
              confidenceOpacity * 0.4
            })`,
            animation:
              animationState.staggerPhase >= 2
                ? "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite"
                : "none",
          }}
        />

        <div className="relative w-full h-full">
          {/* Left endpoint with staggered animation */}
          <div
            className="absolute left-0 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-blue-500 rounded-full shadow-lg transition-all duration-200 ease-out"
            style={{
              boxShadow: `0 0 8px rgba(59, 130, 246, ${
                confidenceOpacity * 0.8
              })`,
              opacity: animationState.staggerPhase >= 3 ? confidenceOpacity : 0,
              transform: `translate(-50%, -50%) scale(${
                animationState.staggerPhase >= 3 ? 1 : 0.5
              }) translateX(${
                animationState.staggerPhase >= 3 ? "0" : "-8px"
              })`,
            }}
          />

          {/* Right endpoint with staggered animation */}
          <div
            className="absolute right-0 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-blue-500 rounded-full shadow-lg transition-all duration-200 ease-out"
            style={{
              boxShadow: `0 0 8px rgba(59, 130, 246, ${
                confidenceOpacity * 0.8
              })`,
              opacity: animationState.staggerPhase >= 3 ? confidenceOpacity : 0,
              transform: `translate(50%, -50%) scale(${
                animationState.staggerPhase >= 3 ? 1 : 0.5
              }) translateX(${animationState.staggerPhase >= 3 ? "0" : "8px"})`,
            }}
          />

          {/* Center dot with delayed staggered animation */}
          <div
            className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1 h-1 bg-blue-400 rounded-full transition-all duration-200 ease-out"
            style={{
              opacity:
                animationState.staggerPhase >= 4 ? confidenceOpacity * 0.8 : 0,
              transform: `translate(-50%, -50%) scale(${
                animationState.staggerPhase >= 4 ? 1 : 0
              })`,
            }}
          />

          {/* Position indicator text with enhanced accessibility */}
          {position === "top" && animationState.staggerPhase >= 4 && (
            <div
              className="absolute left-1/2 transform -translate-x-1/2 -top-8 text-xs text-blue-600 dark:text-blue-400 font-medium bg-white dark:bg-zinc-800 px-3 py-1.5 rounded-md shadow-lg border border-blue-200 dark:border-blue-700 transition-all duration-200 ease-out"
              style={{
                opacity:
                  animationState.staggerPhase >= 4 ? confidenceOpacity : 0,
                transform: `translate(-50%, 0) scale(${
                  animationState.staggerPhase >= 4 ? 1 : 0.95
                }) translateY(${
                  animationState.staggerPhase >= 4 ? "0" : "8px"
                })`,
              }}
              role="tooltip"
              aria-label={`Insert here${
                confidence < 0.8 ? " (approximate position)" : ""
              }`}
            >
              <div className="flex items-center space-x-1">
                <div
                  className="w-1.5 h-1.5 bg-blue-500 rounded-full"
                  style={{
                    animation:
                      animationState.staggerPhase >= 4
                        ? "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite"
                        : "none",
                  }}
                />
                <span>Inserir aqui</span>
                {confidence < 0.8 && (
                  <span className="text-blue-400 text-xs">~</span>
                )}
              </div>
              <div className="absolute left-1/2 transform -translate-x-1/2 top-full">
                <div className="w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-blue-200 dark:border-t-blue-700" />
              </div>
            </div>
          )}

          {/* Real-time position feedback for mouse tracking */}
          {interpolatedPosition && animationState.staggerPhase >= 2 && (
            <div
              className="absolute w-0.5 h-0.5 bg-blue-300 rounded-full opacity-60 transition-all duration-100 ease-out pointer-events-none"
              style={{
                left: `${Math.min(
                  Math.max(
                    0,
                    (interpolatedPosition.x / window.innerWidth) * 100
                  ),
                  100
                )}%`,
                top: "50%",
                transform: "translate(-50%, -50%)",
                display: confidence > 0.5 ? "block" : "none",
              }}
            />
          )}
        </div>
      </div>

      {/* Confidence indicator for debugging/development */}
      {process.env.NODE_ENV === "development" && (
        <div className="absolute -right-12 top-0 text-xs text-gray-400 font-mono">
          {Math.round(confidence * 100)}%
        </div>
      )}
    </div>
  );
}
