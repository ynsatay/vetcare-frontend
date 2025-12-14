import React, { createContext, useContext, useMemo, useState, useEffect } from 'react';
import translations from '../i18n/translations.js';
import axiosInstance from '../api/axiosInstance.ts';

const LanguageContext = createContext({ lang: 'tr', setLanguage: () => {}, t: (k) => k });

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState(() => {
    try {
      const saved = localStorage.getItem('language');
      return saved === 'en' ? 'en' : 'tr';
    } catch {
      return 'tr';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('language', lang);
    } catch {}
  }, [lang]);
  
  useEffect(() => {
    const uid = Number(localStorage.getItem('userid') || 0);
    if (!uid) return;
    axiosInstance.get('/getUser', { params: { id: uid } })
      .then((res) => {
        const user = res.data?.user || res.data;
        const code = (user?.language === 1) ? 'en' : 'tr';
        setLang(code);
      })
      .catch(() => {});
  }, []);

  const t = useMemo(() => {
    const dict = translations[lang] || {};
    return (key) => (dict[key] ?? key);
  }, [lang]);

  const value = useMemo(() => ({
    lang,
    setLanguage: setLang,
    t
  }), [lang, t]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLanguage = () => useContext(LanguageContext);
