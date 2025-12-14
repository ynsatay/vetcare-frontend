import React, { createContext, useContext, useMemo, useState, useEffect } from 'react';
import translations from '../i18n/translations.js';
import axiosInstance from '../api/axiosInstance.ts';
import { AuthContext } from './usercontext.tsx';

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
  const { userid } = useContext(AuthContext);

  useEffect(() => {
    try {
      localStorage.setItem('language', lang);
    } catch {}
  }, [lang]);
  
  useEffect(() => {
    const uid = Number(userid || localStorage.getItem('userid') || 0);
    if (!uid) return;
    axiosInstance.get('/getUser', { params: { id: uid } })
      .then((res) => {
        const user = res.data?.user || res.data;
        const raw = user?.language;
        const code =
          typeof raw === 'number'
            ? (raw === 1 ? 'en' : 'tr')
            : (String(raw).toLowerCase() === 'en' ? 'en' : 'tr');
        setLang(code);
        try {
          document.cookie = `vetcare_lang=${code};path=/;max-age=31536000`;
          localStorage.setItem('language', code);
        } catch {}
      })
      .catch(() => {});
  }, [userid]);

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
