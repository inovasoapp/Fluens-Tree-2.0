import Image from "next/image";
import { useThemeStore } from "./ThemeToggle";

export default function Logo() {
  const { theme } = useThemeStore();
  const isDark = theme === "dark";

  const src = isDark ? "/fluens-tree-logo.svg" : "/fluens-tree-logo-dark.svg";
  return <Image src={src} alt="Logo" width={140} height={100} />;
}
