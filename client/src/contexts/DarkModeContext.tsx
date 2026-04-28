import React, { createContext, useContext, useEffect, useState } from "react";

interface DarkModeContextType {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  setAutoMode: (enabled: boolean) => void;
  isAutoMode: boolean;
}

const DarkModeContext = createContext<DarkModeContextType | undefined>(undefined);

export const DarkModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isAutoMode, setIsAutoMode] = useState(true);

  // Determine dark mode based on time of day (6 PM to 6 AM)
  const isDarkModeByTime = (): boolean => {
    const hour = new Date().getHours();
    return hour >= 18 || hour < 6; // Dark mode from 6 PM to 6 AM
  };

  // Check system preference for dark mode
  const isDarkModeBySystem = (): boolean => {
    if (typeof window !== "undefined") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    return false;
  };

  // Initialize dark mode on mount
  useEffect(() => {
    const savedAutoMode = localStorage.getItem("sentinel-auto-mode");
    const savedDarkMode = localStorage.getItem("sentinel-dark-mode");

    if (savedAutoMode !== null) {
      setIsAutoMode(JSON.parse(savedAutoMode));
    }

    if (savedAutoMode === null || JSON.parse(savedAutoMode)) {
      // Auto mode: use time-based or system preference
      const timeBasedDark = isDarkModeByTime();
      const systemDark = isDarkModeBySystem();
      setIsDarkMode(timeBasedDark || systemDark);
    } else if (savedDarkMode !== null) {
      // Manual mode: use saved preference
      setIsDarkMode(JSON.parse(savedDarkMode));
    }
  }, []);

  // Update dark mode based on time every minute
  useEffect(() => {
    if (!isAutoMode) return;

    const interval = setInterval(() => {
      const timeBasedDark = isDarkModeByTime();
      const systemDark = isDarkModeBySystem();
      setIsDarkMode(timeBasedDark || systemDark);
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [isAutoMode]);

  // Listen for system preference changes
  useEffect(() => {
    if (!isAutoMode) return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e: MediaQueryListEvent) => {
      if (isAutoMode) {
        setIsDarkMode(e.matches || isDarkModeByTime());
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [isAutoMode]);

  // Apply dark mode to DOM
  useEffect(() => {
    const html = document.documentElement;
    if (isDarkMode) {
      html.classList.add("dark");
    } else {
      html.classList.remove("dark");
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsAutoMode(false);
    localStorage.setItem("sentinel-auto-mode", JSON.stringify(false));
    setIsDarkMode(!isDarkMode);
    localStorage.setItem("sentinel-dark-mode", JSON.stringify(!isDarkMode));
  };

  const setAutoModeHandler = (enabled: boolean) => {
    setIsAutoMode(enabled);
    localStorage.setItem("sentinel-auto-mode", JSON.stringify(enabled));

    if (enabled) {
      const timeBasedDark = isDarkModeByTime();
      const systemDark = isDarkModeBySystem();
      setIsDarkMode(timeBasedDark || systemDark);
    }
  };

  return (
    <DarkModeContext.Provider
      value={{
        isDarkMode,
        toggleDarkMode,
        setAutoMode: setAutoModeHandler,
        isAutoMode,
      }}
    >
      {children}
    </DarkModeContext.Provider>
  );
};

export const useDarkMode = () => {
  const context = useContext(DarkModeContext);
  if (!context) {
    throw new Error("useDarkMode must be used within DarkModeProvider");
  }
  return context;
};
