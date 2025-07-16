import Navigation from "@/components/ui/navigation";
import Hero from "./components/hero";
import { LanguageSelect } from "@/components/LanguageSelect";

export default function LandingPage() {
  return (
    <main className="min-h-dvh">
      <Navigation />
      <LanguageSelect />

      <Hero />
    </main>
  );
}
