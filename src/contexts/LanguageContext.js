import React, { createContext, useContext, useState, useEffect } from 'react';
import arabicTranslations from '../translations/arabic';
import frenchTranslations from '../translations/french';

const LanguageContext = createContext();

const translations = {
  ar: arabicTranslations,
  fr: frenchTranslations
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    const saved = localStorage.getItem('app_language');
    return saved || 'ar';
  });

  useEffect(() => {
    localStorage.setItem('app_language', language);
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
    let value = translations[language]?.translations || translations[language];
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return key;
      }
    }
    
    return value || key;
  };

  return (
    <LanguageContext.Provider value={{
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
    </LanguageContext.Provider>
  );
};

export default LanguageContext;
