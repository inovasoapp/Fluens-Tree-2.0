"use client";

import { useState, useEffect } from "react";

interface ToastProps {
  message: string;
  type?: "success" | "error" | "warning" | "info";
  duration?: number;
  onClose?: () => void;
}

export function Toast({
  message,
  type = "info",
  duration = 3000,
  onClose,
}: ToastProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      if (onClose) onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!isVisible) return null;

  const getTypeStyles = () => {
    switch (type) {
      case "success":
        return "bg-green-500 text-white";
      case "error":
        return "bg-red-500 text-white";
      case "warning":
        return "bg-yellow-500 text-white";
      case "info":
      default:
        return "bg-blue-500 text-white";
    }
  };

  return (
    <div
      className={`fixed bottom-4 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-md shadow-lg z-50 ${getTypeStyles()} animate-in fade-in slide-in-from-bottom duration-300`}
    >
      <div className="flex items-center space-x-2">
        {type === "error" && <span>⚠️</span>}
        {type === "success" && <span>✅</span>}
        {type === "warning" && <span>⚠️</span>}
        {type === "info" && <span>ℹ️</span>}
        <span>{message}</span>
      </div>
    </div>
  );
}

// Sistema de toast global
type ToastItem = {
  id: string;
  message: string;
  type: "success" | "error" | "warning" | "info";
};

let toasts: ToastItem[] = [];
let listeners: Function[] = [];

export const toast = {
  show: (
    message: string,
    type: "success" | "error" | "warning" | "info" = "info"
  ) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast = { id, message, type };
    toasts = [...toasts, newToast];
    listeners.forEach((listener) => listener(toasts));

    // Auto-remove after 3 seconds
    setTimeout(() => {
      toast.remove(id);
    }, 3000);

    return id;
  },

  remove: (id: string) => {
    toasts = toasts.filter((t) => t.id !== id);
    listeners.forEach((listener) => listener(toasts));
  },

  subscribe: (listener: Function) => {
    listeners.push(listener);
    listener(toasts);
    return () => {
      listeners = listeners.filter((l) => l !== listener);
    };
  },
};

export function ToastContainer() {
  const [toastItems, setToastItems] = useState<ToastItem[]>([]);

  useEffect(() => {
    return toast.subscribe((items: ToastItem[]) => {
      setToastItems([...items]);
    });
  }, []);

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 space-y-2">
      {toastItems.map((item) => (
        <Toast
          key={item.id}
          message={item.message}
          type={item.type}
          onClose={() => toast.remove(item.id)}
        />
      ))}
    </div>
  );
}
