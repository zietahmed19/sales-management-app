import React, { createContext, useContext, useState, useEffect } from 'react';
import arabicTranslations from '../translations/arabic';
import frenchTranslations from '../translations/french';

const SettingsContext = createContext();

const translations = {
  ar: arabicTranslations,
  fr: frenchTranslations
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

export const SettingsProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    const saved = localStorage.getItem('language');
    return saved || 'ar';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
  }, [language]);

  const changeLanguage = (lang) => {
    if (translations[lang]) {
      setLanguage(lang);
    }
  };

  const t = (key) => {
    const keys = key.split('.');
    let value = translations[language].translations;
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return key;
      }
    }
    
    return value;
  };

  return (
    <SettingsContext.Provider value={{
      language,
      changeLanguage,
      t,
      isRTL: language === 'ar',
      availableLanguages: [
        { code: 'ar', name: 'العربية', nativeName: 'العربية' },
        { code: 'fr', name: 'Français', nativeName: 'Français' }
      ]
    }}>
      {children}
    </SettingsContext.Provider>
  );
};
