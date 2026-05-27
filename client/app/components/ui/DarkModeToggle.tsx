// components/ui/DarkModeToggle.tsx
"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export default function DarkModeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-9 h-9" />; // placeholder برای جلوگیری از جابجایی
  }

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="p-2 rounded-xl transition-all duration-300 hover:bg-primary/10 group"
      aria-label="تغییر حالت تاریک/روشن"
    >
      {theme === "dark" ? (
        <Sun className="h-5 w-5 text-primary transition-all duration-300 group-hover:scale-110" />
      ) : (
        <Moon className="h-5 w-5 text-muted-foreground transition-all duration-300 group-hover:scale-110 group-hover:text-primary" />
      )}
    </button>
  );
}
