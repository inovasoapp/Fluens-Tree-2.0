"use client";

import { useState, useEffect } from "react";
import { InsertionIndicator } from "./InsertionIndicator";

export function InsertionIndicatorDemo() {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState<"top" | "bottom" | "between">("top");
  const [confidence, setConfidence] = useState(1.0);
  const [mousePosition, setMousePosition] = useState<
    { x: number; y: number } | undefined
  >();
  const [index, setIndex] = useState(0);

  // Simulate mouse tracking
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    if (isVisible) {
      window.addEventListener("mousemove", handleMouseMove);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [isVisible]);

  return (
    <div className="p-8 space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">
          Enhanced InsertionIndicator Demo
        </h1>

        {/* Controls */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md space-y-4">
          <h2 className="text-lg font-semibold">Controls</h2>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsVisible(!isVisible)}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                isVisible
                  ? "bg-red-500 hover:bg-red-600 text-white"
                  : "bg-blue-500 hover:bg-blue-600 text-white"
              }`}
            >
              {isVisible ? "Hide" : "Show"} Indicator
            </button>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium">Position:</label>
            <div className="flex space-x-2">
              {(["top", "bottom", "between"] as const).map((pos) => (
                <button
                  key={pos}
                  onClick={() => setPosition(pos)}
                  className={`px-3 py-1 rounded text-sm transition-colors ${
                    position === pos
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
                  }`}
                >
                  {pos}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium">
              Confidence: {Math.round(confidence * 100)}%
            </label>
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.1"
              value={confidence}
              onChange={(e) => setConfidence(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium">Index:</label>
            <input
              type="number"
              min="0"
              max="10"
              value={index}
              onChange={(e) => setIndex(parseInt(e.target.value) || 0)}
              className="px-3 py-1 border rounded-md dark:bg-gray-700 dark:border-gray-600"
            />
          </div>
        </div>

        {/* Demo Area */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-4">Demo Area</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            {isVisible
              ? "Move your mouse around to see real-time position tracking!"
              : 'Click "Show Indicator" to see the enhanced animations.'}
          </p>

          {/* Mock elements to show context */}
          <div className="space-y-4">
            <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-md">
              Mock Element 1
            </div>

            {/* Insertion Indicator */}
            <InsertionIndicator
              isVisible={isVisible}
              position={position}
              confidence={confidence}
              mousePosition={mousePosition}
              index={index}
            />

            <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-md">
              Mock Element 2
            </div>

            <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-md">
              Mock Element 3
            </div>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-4">Enhanced Features</h2>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start space-x-2">
              <span className="text-green-500 font-bold">✓</span>
              <span>
                <strong>Staggered Animations:</strong> Elements appear in
                sequence for smooth visual flow
              </span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-green-500 font-bold">✓</span>
              <span>
                <strong>Real-time Position Updates:</strong> Smooth
                interpolation of mouse position
              </span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-green-500 font-bold">✓</span>
              <span>
                <strong>Confidence-based Styling:</strong> Visual feedback
                adapts to positioning accuracy
              </span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-green-500 font-bold">✓</span>
              <span>
                <strong>Accessibility Support:</strong> Screen reader
                announcements and ARIA attributes
              </span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-green-500 font-bold">✓</span>
              <span>
                <strong>Performance Optimized:</strong> Smooth 60fps animations
                with proper cleanup
              </span>
            </li>
          </ul>
        </div>

        {/* Debug Info */}
        {process.env.NODE_ENV === "development" && (
          <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg text-xs font-mono">
            <h3 className="font-semibold mb-2">Debug Info:</h3>
            <div>Visible: {isVisible.toString()}</div>
            <div>Position: {position}</div>
            <div>Confidence: {confidence}</div>
            <div>Index: {index}</div>
            <div>
              Mouse:{" "}
              {mousePosition ? `${mousePosition.x}, ${mousePosition.y}` : "N/A"}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
