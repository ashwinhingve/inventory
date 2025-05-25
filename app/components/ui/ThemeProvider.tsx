'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface ThemeContextType {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  applyTextStyles: (element: 'heading' | 'body' | 'subtitle' | 'caption') => string;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // Check system preference on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDarkMode(prefersDark);
      
      // Add listener for changes
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = (e: MediaQueryListEvent) => setIsDarkMode(e.matches);
      
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, []);
  
  // Apply dark mode class to document
  useEffect(() => {
    if (typeof document !== 'undefined') {
      if (isDarkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [isDarkMode]);
  
  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
  };
  
  // Helper to apply text styling classes
  const applyTextStyles = (element: 'heading' | 'body' | 'subtitle' | 'caption'): string => {
    switch (element) {
      case 'heading':
        return 'text-heading';
      case 'body':
        return 'text-body';
      case 'subtitle':
        return 'text-subtitle';
      case 'caption':
        return 'text-caption';
      default:
        return 'text-body';
    }
  };
  
  return (
  <ThemeContext.Provider 
      value={{ 
        isDarkMode,
        toggleDarkMode,
        applyTextStyles
      }}
    >
      {children}
    </ThemeContext.Provider>
);
} 