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
  product: { en: "Product", sw: "Bidhaa" },
  price: { en: "Price", sw: "Bei" },
  quantity: { en: "Quantity", sw: "Idadi" },
  "total amount": { en: "Total Amount", sw: "Jumla" },
  "amount paid": { en: "Amount Paid", sw: "Kiasi Kilicholipwa" },
  balance: { en: "Balance", sw: "Baki" },
  customer: { en: "Customer", sw: "Mteja" },
  save: { en: "Save", sw: "Hifadhi" },
  cancel: { en: "Cancel", sw: "Ghairi" },
  action: { en: "Action", sw: "Kitendo" },
  actions: { en: "Actions", sw: "Vitendo" },
  "add new": { en: "Add New", sw: "Ongeza Mpya" },
  "search...": { en: "Search...", sw: "Tafuta..." },
  "add product": { en: "Add Product", sw: "Ongeza Bidhaa" },
  "restock items": { en: "Restock Items", sw: "Ongeza Stoo" },
  "quick restock": { en: "Quick Restock", sw: "Ongeza Haraka" },
  "edit details": { en: "Edit Details", sw: "Badili Taarifa" },
  "delete item": { en: "Delete Item", sw: "Futa Bidhaa" },
  "product name": { en: "Product Name", sw: "Jina la Bidhaa" },
  category: { en: "Category", sw: "Aina" },
  "buying cost": { en: "Buying Cost", sw: "Gharama ya Kununua" },
  "selling price": { en: "Selling Price", sw: "Bei ya Kuuza" },
  status: { en: "Status", sw: "Hali" },
  "record sale": { en: "Record Sale", sw: "Rekodi Mauzo" },
  "sale date": { en: "Sale Date", sw: "Tarehe ya Mauzo" },
  "total cost": { en: "Total Cost", sw: "Jumla ya Gharama" },
  profit: { en: "Profit", sw: "Faida" },
  date: { en: "Date", sw: "Tarehe" },
  time: { en: "Time", sw: "Muda" },
  name: { en: "Name", sw: "Jina" },
  location: { en: "Location", sw: "Eneo" },
  role: { en: "Role", sw: "Cheo" },
  email: { en: "Email", sw: "Barua Pepe" },
  "new shop": { en: "New Shop", sw: "Duka Jipya" },
  "add user": { en: "Add User", sw: "Ongeza Mtumiaji" },
  "system overview": { en: "System Overview", sw: "Muhtasari wa Mfumo" },
  "total products": { en: "Total Products", sw: "Jumla ya Bidhaa" },
  "total sales": { en: "Total Sales", sw: "Jumla ya Mauzo" },
  "revenue": { en: "Revenue", sw: "Mapato" },
  "manage your products and track stock levels": { en: "Manage your products and track stock levels", sw: "Simamia bidhaa na kiasi kilichopo" },
  "track daily product sales and transactions": { en: "Track daily product sales and transactions", sw: "Fuatilia mauzo na miamala ya kila siku" },
  "manage borrowing and installments": { en: "Manage borrowing and installments", sw: "Simamia mikopo na malipo ya awamu" },
  "search borrower...": { en: "Search Borrower...", sw: "Tafuta Mkopaji..." },
  "issue debt": { en: "Issue Debt", sw: "Toa Mkopo" },
  "new borrowing": { en: "New Borrowing", sw: "Kukopa Kupya" },
  "borrower name": { en: "Borrower Name", sw: "Jina la Mkopaji" },
  "phone number": { en: "Phone Number", sw: "Namba ya Simu" },
  "optional": { en: "Optional", sw: "Sio Lazima" },
  "initial paid amount": { en: "Amount Paid (Initial)", sw: "Kiasi Alicholipia Awali" },
  "due date": { en: "Due Date", sw: "Tarehe ya Mwisho" },
  "create debt": { en: "Create Debt", sw: "Tengeneza Mkopo" },
  "loading debts...": { en: "Loading debts...", sw: "Inapakia mikopo..." },
  "no borrowings found": { en: "No borrowings found", sw: "Hakuna mikopo iliyopatikana" },
  "issued": { en: "Issued", sw: "Imetolewa" },
  "due": { en: "Due", sw: "Mwisho" },
  "total": { en: "Total", sw: "Jumla" },
  "paid": { en: "Paid", sw: "Imelipwa" },
  "pay installment": { en: "Pay Installment", sw: "Lipa Awamu" },
  "shop": { en: "Shop", sw: "Duka" },
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
