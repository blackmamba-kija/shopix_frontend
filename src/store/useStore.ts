import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { Product, Sale, Shop, ServiceSale, Notification, AuditLog, Expense } from "@/types/models";
import { shopsApi } from "@/api/shops.api";
import { productsApi } from "@/api/products.api";
import { servicesApi } from "@/api/services.api";
import { salesApi } from "@/api/sales.api";
import { auditLogsApi } from "@/api/audit-logs.api";
import { authHelper, StoredUser } from "@/utils/helpers/auth.helper";
import { toast } from "sonner";
import { apiClient } from "@/api/client";

interface SyncItem {
  id: string;
  type: "SALE" | "PRODUCT" | "SERVICE" | "SHOP";
  action: "CREATE" | "UPDATE" | "DELETE";
  data: any;
  timestamp: number;
}

interface StoreState {
  shops: Shop[];
  products: Product[];
  sales: Sale[];
  serviceSales: ServiceSale[];
  expenses: Expense[];
  notifications: Notification[];
  auditLogs: AuditLog[];
  user: StoredUser | null;
  selectedShopId: string;
  sidebarCollapsed: boolean;
  mobileMenuOpen: boolean;
  syncQueue: SyncItem[];
  isOnline: boolean;
  isSyncing: boolean;

  setOnlineStatus: (status: boolean) => void;
  checkConnectivity: () => Promise<boolean>;
  updateUser: (user: StoredUser | null) => void;
  setSelectedShopId: (id: string) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setMobileMenuOpen: (open: boolean) => void;
  
  fetchShops: () => Promise<void>;
  addShop: (shop: Omit<Shop, "id" | "createdAt" | "status">) => Promise<void>;
  updateShop: (id: string, data: Partial<Shop>) => Promise<void>;
  deleteShop: (id: string) => Promise<void>;

  fetchProducts: () => Promise<void>;
  addProduct: (product: Omit<Product, "id" | "registrationDate" | "status">) => Promise<void>;
  updateProduct: (id: string, data: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;

  fetchSales: () => Promise<void>;
  addSale: (sale: { productId: string; shopId: string; quantity: number, sellingPrice?: number }) => Promise<void>;

  fetchServiceSales: () => Promise<void>;
  addServiceSale: (service: Omit<ServiceSale, "id" | "date" | "time" | "total">) => Promise<void>;

  fetchExpenses: () => Promise<void>;
  addExpense: (expense: Partial<Expense>) => Promise<void>;
  removeExpense: (id: string) => Promise<void>;

  addNotification: (notification: Omit<Notification, "id" | "time" | "read">) => void;
  markNotificationAsRead: (id: string) => void;

  fetchAuditLogs: () => Promise<void>;
  addAuditLog: (log: Omit<AuditLog, "id" | "timestamp">) => Promise<void>;

  syncOfflineData: () => Promise<void>;
  clearSyncQueue: () => void;
  refreshAllData: () => Promise<void>;
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      shops: [],
      products: [],
      sales: [],
      serviceSales: [],
      expenses: [],
      notifications: [],
      auditLogs: [],
      user: authHelper.getUser(),
      selectedShopId: "all",
      syncQueue: [],
      isOnline: navigator.onLine,
      isSyncing: false,

      setOnlineStatus: (status: boolean) => {
        const wasOffline = !get().isOnline;
        set({ isOnline: status });
        if (status && wasOffline && get().syncQueue.length > 0) {
          get().syncOfflineData();
        }
      },

      checkConnectivity: async () => {
        try {
          // Simple check for online status
          const isOnline = navigator.onLine;
          if (isOnline) set({ isOnline: true });
          return isOnline;
        } catch (e) {
          set({ isOnline: false });
          return false;
        }
      },

      updateUser: (user) => {
        if (user) authHelper.setUser(user);
        else authHelper.clearUser();
        set({ user });
      },

      setSelectedShopId: (id: string) => set({ selectedShopId: id }),

      fetchShops: async () => {
        if (!get().isOnline) return;
        try {
          const shops = await shopsApi.getAll();
          set({ shops });
        } catch (e) {
          console.error("Fetch shops failed", e);
        }
      },

      fetchExpenses: async () => {
        if (!get().isOnline || get().user?.role !== "admin") return;
        try {
          const { expensesApi } = await import("@/api/expenses.api");
          const expenses = await expensesApi.getAll();
          set({ expenses });
        } catch (e) {
          console.error("Fetch expenses failed", e);
        }
      },

      addShop: async (shop) => {
        if (!get().isOnline) {
          const tempId = `temp_${Date.now()}`;
          const newShop: Shop = { ...shop, id: tempId, createdAt: new Date().toISOString(), status: "active" };
          set((state) => ({ 
            shops: [...state.shops, newShop],
            syncQueue: [...state.syncQueue, { id: tempId, type: "SHOP", action: "CREATE", data: shop, timestamp: Date.now() }]
          }));
          toast.info("Saved offline. Will sync when online.");
          return;
        }
        const newShop = await shopsApi.create(shop);
        set((state) => ({ shops: [...state.shops, newShop] }));
        get().addAuditLog({ userId: get().user?.id || "0", userName: get().user?.name || "System", action: "CREATE", module: "SHOPS", details: `Added shop: ${newShop.name}` });
      },

      updateShop: async (id, data) => {
        if (!get().isOnline) {
          set((state) => ({ 
            shops: state.shops.map((s) => s.id === id ? { ...s, ...data } : s),
            syncQueue: [...state.syncQueue, { id, type: "SHOP", action: "UPDATE", data, timestamp: Date.now() }]
          }));
          return;
        }
        const updatedShop = await shopsApi.update(id, data);
        set((state) => ({ shops: state.shops.map((s) => s.id === id ? updatedShop : s) }));
      },

      deleteShop: async (id) => {
        if (!get().isOnline) {
          set((state) => ({ 
            shops: state.shops.filter((s) => s.id !== id),
            syncQueue: [...state.syncQueue, { id, type: "SHOP", action: "DELETE", data: null, timestamp: Date.now() }]
          }));
          return;
        }
        await shopsApi.remove(id);
        set((state) => ({ shops: state.shops.filter((s) => s.id !== id) }));
      },

      fetchProducts: async () => {
        if (!get().isOnline) return;
        try {
          const products = await productsApi.getAll();
          set({ products });
        } catch (e) {
          console.error("Fetch products failed", e);
        }
      },

      addProduct: async (product) => {
        if (!get().isOnline) {
          const tempId = `temp_${Date.now()}`;
          const newProd: Product = { ...product, id: tempId, registrationDate: new Date().toISOString(), status: "pending" };
          set((state) => ({ 
            products: [...state.products, newProd],
            syncQueue: [...state.syncQueue, { id: tempId, type: "PRODUCT", action: "CREATE", data: product, timestamp: Date.now() }]
          }));
          toast.info("Product saved offline.");
          return;
        }
        const newProduct = await productsApi.create(product);
        set((state) => ({ products: [...state.products, newProduct] }));
      },

      updateProduct: async (id, data) => {
        if (!get().isOnline) {
          set((state) => ({ 
             products: state.products.map(p => p.id === id ? { ...p, ...data } : p),
             syncQueue: [...state.syncQueue, { id, type: "PRODUCT", action: "UPDATE", data, timestamp: Date.now() }]
          }));
          return;
        }
        const updatedProduct = await productsApi.update(id, data);
        set((state) => ({ products: state.products.map((p) => p.id === id ? updatedProduct : p) }));
      },

      deleteProduct: async (id) => {
        if (!get().isOnline) {
          set((state) => ({ 
            products: state.products.filter(p => p.id !== id),
            syncQueue: [...state.syncQueue, { id, type: "PRODUCT", action: "DELETE", data: null, timestamp: Date.now() }]
          }));
          return;
        }
        await productsApi.remove(id);
        set((state) => ({ products: state.products.filter((p) => p.id !== id) }));
      },

      fetchSales: async () => {
        if (!get().isOnline) return;
        const sales = await salesApi.getAll();
        set({ sales });
      },

      addSale: async ({ productId, shopId, quantity, sellingPrice }) => {
        if (!get().isOnline) {
          const tempId = `sale_${Date.now()}`;
          const product = get().products.find(p => String(p.id) === String(productId));
          const actualPrice = sellingPrice || product?.sellingPrice || 0;
          const newSale: Sale = {
            id: tempId,
            productId,
            shopId,
            quantity,
            productName: product?.name || "Offline Item",
            sellingPrice: actualPrice,
            totalCost: actualPrice * quantity,
            date: new Date().toISOString().split('T')[0],
            time: new Date().toLocaleTimeString(),
            profit: (actualPrice - (product?.buyingCost || 0)) * quantity
          };

          set((state) => ({
            sales: [...state.sales, newSale],
            products: state.products.map(p => String(p.id) === String(productId) ? { ...p, quantity: p.quantity - quantity } : p),
            syncQueue: [...state.syncQueue, { id: tempId, type: "SALE", action: "CREATE", data: { productId, shopId, quantity, sellingPrice }, timestamp: Date.now() }]
          }));
          
          toast.success("Sale saved offline!");
          get().addNotification({ type: "success", title: "Offline Sale", message: `${quantity}x ${newSale.productName} saved locally.` });
          return;
        }

        const newSale = await salesApi.create({ productId, shopId, quantity, sellingPrice });
        set((state) => ({ sales: [...state.sales, newSale] }));
        await get().fetchProducts();
        get().addNotification({ type: "success", title: "Sale Recorded", message: `${quantity}x ${newSale.productName} recorded.` });
      },

      fetchServiceSales: async () => {
        if (!get().isOnline) return;
        const serviceSales = await servicesApi.getAll();
        set({ serviceSales });
      },

      addServiceSale: async (service) => {
        if (!get().isOnline) {
           const tempId = `srv_${Date.now()}`;
           const newSrv: ServiceSale = { ...service, id: tempId, date: new Date().toISOString().split('T')[0], time: new Date().toLocaleTimeString(), total: (service as any).total || 0 };
           set((state) => ({
             serviceSales: [...state.serviceSales, newSrv],
             syncQueue: [...state.syncQueue, { id: tempId, type: "SERVICE", action: "CREATE", data: service, timestamp: Date.now() }]
           }));
           toast.success("Service recorded offline.");
           return;
        }
        const newServiceSale = await servicesApi.create(service);
        set((state) => ({ serviceSales: [...state.serviceSales, newServiceSale] }));
      },

      addNotification: (notification) => {
        const newNotification: Notification = { ...notification, id: Math.random().toString(36).substr(2, 9), time: "Just now", read: false };
        set((state) => ({ notifications: [newNotification, ...state.notifications] }));
      },

      markNotificationAsRead: (id) => {
        set((state) => ({ notifications: state.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)) }));
      },

      fetchAuditLogs: async () => {
        if (!get().isOnline || get().user?.role !== "admin") return;
        const response = await auditLogsApi.getAll();
        if (response.success && response.data) set({ auditLogs: response.data });
      },

      addAuditLog: async (log) => {
         if (!get().isOnline || get().user?.role !== "admin") return;
         try {
           const response = await auditLogsApi.create(log);
           if (response.success && response.data) set((state) => ({ auditLogs: [response.data!, ...state.auditLogs] }));
         } catch (e) {
           console.error("Failed to add audit log", e);
         }
      },

      syncOfflineData: async () => {
        const { syncQueue, isOnline, isSyncing } = get();
        if (!isOnline || syncQueue.length === 0 || isSyncing) return;

        set({ isSyncing: true });
        toast.loading(`Syncing ${syncQueue.length} offline actions...`, { id: "sync" });

        const successfulItems: string[] = [];
        const idMapping: Record<string, string> = {};

        for (const item of syncQueue) {
          try {
            let data = { ...item.data };
            
            // Map temp IDs to real IDs if they were created in the same session
            if (item.type === "SALE" && data.productId && idMapping[data.productId]) {
                data.productId = idMapping[data.productId];
            }
            if (item.type === "PRODUCT" && item.action === "UPDATE" && idMapping[item.id]) {
                // If we are updating a product that was just created, use its new ID
            }

            let result: any = null;
            if (item.type === "SALE" && item.action === "CREATE") result = await salesApi.create(data);
            if (item.type === "PRODUCT" && item.action === "CREATE") result = await productsApi.create(data);
            if (item.type === "PRODUCT" && item.action === "UPDATE") {
                const targetId = idMapping[item.id] || item.id;
                result = await productsApi.update(targetId, data);
            }
            if (item.type === "SERVICE" && item.action === "CREATE") result = await servicesApi.create(data);
            if (item.type === "SHOP" && item.action === "CREATE") result = await shopsApi.create(data);
            if (item.type === "SHOP" && item.action === "UPDATE") result = await shopsApi.update(item.id, data);

            // If creation was successful, record the mapping
            if (result && result.id && item.id.startsWith("temp_")) {
                idMapping[item.id] = result.id;
            }

            successfulItems.push(item.id);
          } catch (e) {
            console.error(`Sync failed for item ${item.id}`, item, e);
            // Stop syncing if we hit a network error (not a validation error)
            if (e instanceof Error && (e.message.includes("Network") || e.message.includes("Failed to fetch"))) {
                set({ isOnline: false });
                break;
            }
          }
        }

        // Only remove items that were successfully synced
        if (successfulItems.length > 0) {
          set((state) => ({
            syncQueue: state.syncQueue.filter(item => !successfulItems.includes(item.id))
          }));
        }

        toast.success(`Sync complete! ${successfulItems.length} items synced.`, { id: "sync" });
        set({ isSyncing: false });
        await get().refreshAllData();
      },

      clearSyncQueue: () => {
        if (confirm("Are you sure you want to clear the offline sync queue? Any unsynced changes will be lost.")) {
          set({ syncQueue: [] });
          toast.success("Sync queue cleared.");
        }
      },

      refreshAllData: async () => {
        if (!get().isOnline) return;
        const isAdmin = get().user?.role === "admin";
        
        try {
          const promises = [
            get().fetchShops(),
            get().fetchProducts(),
            get().fetchSales(),
            get().fetchServiceSales(),
          ];

          if (isAdmin) {
            promises.push(get().fetchAuditLogs());
            promises.push(get().fetchExpenses());
          }

          await Promise.all(promises);
        } catch (e) {
          console.error("Refresh all data failed", e);
        }
      },

      addExpense: async (expense) => {
        try {
          const { expensesApi } = await import("@/api/expenses.api");
          const newExpense = await expensesApi.create(expense);
          set((state) => ({ expenses: [newExpense, ...state.expenses] }));
        } catch (e) {
          console.error("Add expense failed", e);
          throw e;
        }
      },

      removeExpense: async (id) => {
        try {
          const { expensesApi } = await import("@/api/expenses.api");
          await expensesApi.remove(id);
          set((state) => ({ expenses: state.expenses.filter((e) => e.id !== id) }));
        } catch (e) {
          console.error("Remove expense failed", e);
          throw e;
        }
      },

      sidebarCollapsed: false,
      setSidebarCollapsed: (collapsed: boolean) => set({ sidebarCollapsed: collapsed }),
      mobileMenuOpen: false,
      setMobileMenuOpen: (open: boolean) => set({ mobileMenuOpen: open }),
    }),
    {
      name: "shopix-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
