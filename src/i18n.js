
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import enTranslation from '@/locales/en.json';
import zuTranslation from '@/locales/zu.json';
import afTranslation from '@/locales/af.json';
import tnTranslation from '@/locales/tn.json';

const resources = {
  en: { translation: enTranslation },
  zu: { translation: zuTranslation },
  af: { translation: afTranslation },
  tn: { translation: tnTranslation },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
  