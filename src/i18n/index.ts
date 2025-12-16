import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en from "./en.json";
import hi from "./hi.json";

// Check if we're on the client side
const isClient = typeof window !== "undefined";

// Get initial language - only from localStorage on client after hydration will be handled separately
const getInitialLanguage = () => {
  // Always start with "en" for SSR consistency
  // The actual language detection happens after hydration via detectLanguage()
  return "en";
};

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    hi: { translation: hi },
  },
  lng: getInitialLanguage(),
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});

// Function to detect and apply saved language preference after hydration
export const detectLanguage = () => {
  if (!isClient) return;

  const savedLanguage = localStorage.getItem("i18nextLng");
  if (savedLanguage && ["en", "hi"].includes(savedLanguage)) {
    i18n.changeLanguage(savedLanguage);
  }
};

// Function to change language and persist to localStorage
export const changeLanguage = (lang: string) => {
  i18n.changeLanguage(lang);
  if (isClient) {
    localStorage.setItem("i18nextLng", lang);
  }
};

export default i18n;
