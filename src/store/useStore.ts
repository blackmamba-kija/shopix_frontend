import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { Product, Sale, Shop, ServiceSale, Notification, AuditLog } from "@/types/models";
import { shopsApi } from "@/api/shops.api";
import { productsApi } from "@/api/products.api";
import { servicesApi } from "@/api/services.api";
import { salesApi } from "@/api/sales.api";
import { auditLogsApi } from "@/api/audit-logs.api";
import { authHelper, StoredUser } from "@/utils/helpers/auth.helper";
import { toast } from "sonner";

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
  selectedShopId: string;
  setSelectedShopId: (id: string) => void;
  fetchShops: () => Promise<void>;
  addShop: (shop: Omit<Shop, "id" | "createdAt">) => Promise<void>;
  updateShop: (id: string, data: Partial<Shop>) => Promise<void>;
  deleteShop: (id: string) => Promise<void>;
  fetchProducts: () => Promise<void>;
  addProduct: (product: Omit<Product, "id" | "registrationDate" | "status">) => Promise<void>;
  updateProduct: (id: string, data: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  fetchSales: () => Promise<void>;
  addSale: (sale: { productId: string; shopId: string; quantity: number }) => Promise<void>;
  fetchServiceSales: () => Promise<void>;
  addServiceSale: (service: Omit<ServiceSale, "id" | "date" | "time" | "total">) => Promise<void>;
  notifications: Notification[];
  auditLogs: AuditLog[];
  user: StoredUser | null;
  updateUser: (user: StoredUser | null) => void;
  addNotification: (notification: Omit<Notification, "id" | "time" | "read">) => void;
  markNotificationAsRead: (id: string) => void;
  fetchAuditLogs: () => Promise<void>;
  addAuditLog: (log: Omit<AuditLog, "id" | "timestamp">) => Promise<void>;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  
  // Offline Sync State
  syncQueue: SyncItem[];
  isOnline: boolean;
  setOnlineStatus: (status: boolean) => void;
  syncOfflineData: () => Promise<void>;
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      shops: [],
      products: [],
      sales: [],
      serviceSales: [],
      notifications: [],
      auditLogs: [],
      user: authHelper.getUser(),
      selectedShopId: "all",
      syncQueue: [],
      isOnline: navigator.onLine,

      setOnlineStatus: (status: boolean) => {
        set({ isOnline: status });
        if (status && get().syncQueue.length > 0) {
          get().syncOfflineData();
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

      addShop: async (shop) => {
        if (!get().isOnline) {
          const tempId = `temp_${Date.now()}`;
          const newShop: Shop = { ...shop, id: tempId, createdAt: new Date().toISOString() };
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

      addSale: async ({ productId, shopId, quantity }) => {
        if (!get().isOnline) {
          const tempId = `sale_${Date.now()}`;
          const product = get().products.find(p => String(p.id) === String(productId));
          const newSale: Sale = {
            id: tempId,
            productId,
            shopId,
            quantity,
            productName: product?.name || "Offline Item",
            sellingPrice: product?.sellingPrice || 0,
            totalCost: (product?.sellingPrice || 0) * quantity,
            date: new Date().toISOString().split('T')[0],
            time: new Date().toLocaleTimeString(),
            profit: ((product?.sellingPrice || 0) - (product?.buyingCost || 0)) * quantity
          };

          set((state) => ({
            sales: [...state.sales, newSale],
            products: state.products.map(p => String(p.id) === String(productId) ? { ...p, quantity: p.quantity - quantity } : p),
            syncQueue: [...state.syncQueue, { id: tempId, type: "SALE", action: "CREATE", data: { productId, shopId, quantity }, timestamp: Date.now() }]
          }));
          
          toast.success("Sale saved offline!");
          get().addNotification({ type: "success", title: "Offline Sale", message: `${quantity}x ${newSale.productName} saved locally.` });
          return;
        }

        const newSale = await salesApi.create({ productId, shopId, quantity });
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
        if (!get().isOnline) return;
        const response = await auditLogsApi.getAll();
        if (response.success && response.data) set({ auditLogs: response.data });
      },

      addAuditLog: async (log) => {
         if (!get().isOnline) return;
         const response = await auditLogsApi.create(log);
         if (response.success && response.data) set((state) => ({ auditLogs: [response.data!, ...state.auditLogs] }));
      },

      syncOfflineData: async () => {
        const { syncQueue, isOnline } = get();
        if (!isOnline || syncQueue.length === 0) return;

        toast.loading(`Syncing ${syncQueue.length} offline actions...`, { id: "sync" });

        for (const item of syncQueue) {
          try {
            if (item.type === "SALE" && item.action === "CREATE") await salesApi.create(item.data);
            if (item.type === "PRODUCT" && item.action === "CREATE") await productsApi.create(item.data);
            if (item.type === "PRODUCT" && item.action === "UPDATE") await productsApi.update(item.id, item.data);
            if (item.type === "SERVICE" && item.action === "CREATE") await servicesApi.create(item.data);
            if (item.type === "SHOP" && item.action === "CREATE") await shopsApi.create(item.data);
            if (item.type === "SHOP" && item.action === "UPDATE") await shopsApi.update(item.id, item.data);
          } catch (e) {
            console.error("Sync item failed", item, e);
          }
        }

        set({ syncQueue: [] });
        toast.success("Sync complete!", { id: "sync" });
        // Refresh all data
        await Promise.all([get().fetchProducts(), get().fetchSales(), get().fetchShops(), get().fetchServiceSales()]);
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
