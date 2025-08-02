import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('app_theme');
    return saved === 'dark';
  });

  useEffect(() => {
    const theme = isDarkMode ? 'dark' : 'light';
    localStorage.setItem('app_theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
    document.body.className = isDarkMode ? 'dark-theme' : 'light-theme';
    
    // Update CSS variables based on theme
    const root = document.documentElement;
    if (isDarkMode) {
      root.style.setProperty('--bg-primary', '#1a1a1a');
      root.style.setProperty('--bg-secondary', '#2d2d2d');
      root.style.setProperty('--text-primary', '#ffffff');
      root.style.setProperty('--text-secondary', '#b0b0b0');
      root.style.setProperty('--border-color', '#404040');
    } else {
      root.style.setProperty('--bg-primary', '#ffffff');
      root.style.setProperty('--bg-secondary', '#f8f9fa');
      root.style.setProperty('--text-primary', '#212529');
      root.style.setProperty('--text-secondary', '#6c757d');
      root.style.setProperty('--border-color', '#dee2e6');
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };

  const setTheme = (theme) => {
    setIsDarkMode(theme === 'dark');
  };

  return (
    <ThemeContext.Provider value={{ 
      isDarkMode, 
      toggleTheme,
      setTheme,
      theme: isDarkMode ? 'dark' : 'light' 
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContext;
