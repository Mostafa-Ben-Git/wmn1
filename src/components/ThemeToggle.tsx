// src/components/ThemeToggle.tsx
import { Button } from "@/components/ui/button";
import { useTheme } from "./ThemeProvider";
import { MoonIcon, SunIcon } from "lucide-react";

export function ThemeToggle() {
  const { setTheme, theme } = useTheme();

  function handleToggle() {
    setTheme(theme === "dark" ? "light" : "dark");
  }

  return (
    <Button variant="outline" size="icon" className="rounded-full" onClick={handleToggle}>
      <SunIcon className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <MoonIcon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
