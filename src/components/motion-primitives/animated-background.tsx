"use client";
import { cn } from "@/lib/utils";
import { AnimatePresence, Transition, motion } from "motion/react";
import {
  Children,
  cloneElement,
  ReactElement,
  useEffect,
  useState,
  useId,
} from "react";

export type AnimatedBackgroundNavItem = {
  name: string;
  href: string;
  onClick: () => void;
};

export type AnimatedBackgroundProps = {
  children?: React.ReactNode;
  defaultValue?: string | AnimatedBackgroundNavItem;
  onValueChange?: (newActiveId: string | null) => void;
  className?: string;
  transition?: Transition;
  enableHover?: boolean;
};

export function AnimatedBackground({
  children,
  defaultValue,
  onValueChange,
  className,
  transition,
  enableHover = false,
}: AnimatedBackgroundProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const uniqueId = useId();

  // Suporte para array de objetos navItem
  let items: AnimatedBackgroundNavItem[] | undefined = undefined;
  if (
    Array.isArray(children) &&
    children.length > 0 &&
    typeof children[0] === "object" &&
    "name" in children[0]
  ) {
    items = children as AnimatedBackgroundNavItem[];
  }

  const handleSetActiveId = (id: string | null) => {
    setActiveId(id);
    if (onValueChange) {
      onValueChange(id);
    }
  };

  useEffect(() => {
    if (defaultValue !== undefined) {
      if (typeof defaultValue === "string") setActiveId(defaultValue);
      else if (typeof defaultValue === "object" && "name" in defaultValue)
        setActiveId(defaultValue.name);
    }
  }, [defaultValue]);

  if (items) {
    return (
      <div className={className}>
        {items.map((item, index) => {
          const id = item.name;
          const interactionProps = enableHover
            ? {
                onMouseEnter: () => handleSetActiveId(id),
                onMouseLeave: () => handleSetActiveId(null),
              }
            : {
                onClick: () => handleSetActiveId(id),
              };
          return (
            <div
              key={id}
              className={cn(
                "relative inline-flex",
                activeId === id ? "font-bold" : "",
                className
              )}
              data-id={id}
              data-checked={activeId === id ? "true" : "false"}
              {...interactionProps}
            >
              <AnimatePresence initial={false}>
                {activeId === id && (
                  <motion.div
                    layoutId={`background-${uniqueId}`}
                    className={cn("absolute inset-0", className)}
                    transition={transition}
                    initial={{ opacity: defaultValue ? 1 : 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  />
                )}
              </AnimatePresence>
              <div className="z-10">
                <a href={item.href} onClick={item.onClick}>
                  {item.name}
                </a>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return Children.map(children, (child: any, index) => {
    const id = child.props["data-id"];

    const interactionProps = enableHover
      ? {
          onMouseEnter: () => handleSetActiveId(id),
          onMouseLeave: () => handleSetActiveId(null),
        }
      : {
          onClick: () => handleSetActiveId(id),
        };

    return cloneElement(
      child,
      {
        key: index,
        className: cn("relative inline-flex", child.props.className),
        "data-checked": activeId === id ? "true" : "false",
        ...interactionProps,
      },
      <>
        <AnimatePresence initial={false}>
          {activeId === id && (
            <motion.div
              layoutId={`background-${uniqueId}`}
              className={cn("absolute inset-0", className)}
              transition={transition}
              initial={{ opacity: defaultValue ? 1 : 0 }}
              animate={{
                opacity: 1,
              }}
              exit={{
                opacity: 0,
              }}
            />
          )}
        </AnimatePresence>
        <div className="z-10">{child.props.children}</div>
      </>
    );
  });
}
