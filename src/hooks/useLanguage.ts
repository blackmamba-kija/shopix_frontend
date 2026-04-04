import { create } from "zustand";

type Language = "en" | "sw";

interface LanguageState {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const dict: Record<string, { en: string; sw: string }> = {
  dashboard: { en: "Dashboard", sw: "Dashibodi" },
  shops: { en: "Shops", sw: "Maduka" },
  inventory: { en: "Inventory", sw: "Stoo" },
  sales: { en: "Sales", sw: "Mauzo" },
  services: { en: "Services", sw: "Huduma" },
  reports: { en: "Reports", sw: "Ripoti" },
  users: { en: "Users", sw: "Watumiaji" },
  settings: { en: "Settings", sw: "Mipangilio" },
  notifications: { en: "Notifications", sw: "Taarifa" },
  "audit logs": { en: "Audit Logs", sw: "Kumbukumbu (Logs)" },
  "daily summary": { en: "Daily Summary", sw: "Ripoti ya Leo" },
  "active shop": { en: "Active Shop", sw: "Duka la Sasa" },
  logout: { en: "Logout", sw: "Toka" },
  debts: { en: "Debts / Borrowing", sw: "Madeni / Kukopa" },
  "all shops (admin)": { en: "All Shops (Admin)", sw: "Maduka Yote (Admin)" },
  "all my shops": { en: "All My Shops", sw: "Maduka Yangu Yote" },
};

export const useLanguage = create<LanguageState>((set, get) => ({
  language: (localStorage.getItem("language") as Language) || "en",
  setLanguage: (lang: Language) => {
    localStorage.setItem("language", lang);
    set({ language: lang });
  },
  t: (key: string) => {
    const k = key.toLowerCase();
    const lang = get().language;
    return dict[k]?.[lang] || key;
  }
}));
