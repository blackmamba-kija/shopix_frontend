import { create } from "zustand";
import { Product, Sale, Shop, ServiceSale } from "@/types/models";
import { shopsApi } from "@/api/shops.api";
import { productsApi } from "@/api/products.api";
import { servicesApi } from "@/api/services.api";
import { salesApi } from "@/api/sales.api";
import { auditLogsApi } from "@/api/audit-logs.api";
import { authHelper, StoredUser } from "@/utils/helpers/auth.helper";
import {
  products as initialProducts,
  sales as initialSales,
  serviceSales as initialServiceSales,
  notifications as initialNotifications
} from "@/data/mockData";
import { Notification, AuditLog } from "@/types/models";

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
}

export const useStore = create<StoreState>((set, get) => ({
  shops: [],
  products: [],
  sales: [],
  serviceSales: [],
  notifications: initialNotifications,
  auditLogs: [],
  user: authHelper.getUser(),
  selectedShopId: "all",
  updateUser: (user) => {
    if (user) authHelper.setUser(user);
    else authHelper.clearUser();
    set({ user });
  },
  setSelectedShopId: (id: string) => set({ selectedShopId: id }),

  fetchShops: async () => {
    const shops = await shopsApi.getAll();
    set({ shops });
  },
  addShop: async (shop) => {
    const newShop = await shopsApi.create(shop);
    set((state) => ({ shops: [...state.shops, newShop] }));

    // Log action
    const user = authHelper.getUser();
    get().addAuditLog({
      userId: user?.id || "0",
      userName: user?.name || "System",
      action: "CREATE",
      module: "SHOPS",
      details: `Added shop: ${newShop.name}`
    });
  },
  updateShop: async (id, data) => {
    const updatedShop = await shopsApi.update(id, data);
    set((state) => ({ shops: state.shops.map((s) => s.id === id ? updatedShop : s) }));

    // Log action
    const user = authHelper.getUser();
    get().addAuditLog({
      userId: user?.id || "0",
      userName: user?.name || "System",
      action: "UPDATE",
      module: "SHOPS",
      details: `Updated shop: ${updatedShop.name}`
    });
  },
  deleteShop: async (id) => {
    const shopName = get().shops.find(s => s.id === id)?.name || id;
    await shopsApi.remove(id);
    set((state) => ({ shops: state.shops.filter((s) => s.id !== id) }));

    // Log action
    const user = authHelper.getUser();
    get().addAuditLog({
      userId: user?.id || "0",
      userName: user?.name || "System",
      action: "DELETE",
      module: "SHOPS",
      details: `Deleted shop: ${shopName}`
    });
  },

  fetchProducts: async () => {
    const products = await productsApi.getAll();
    set({ products });
  },
  addProduct: async (product) => {
    const newProduct = await productsApi.create(product);
    set((state) => ({ products: [...state.products, newProduct] }));

    // Log action
    const user = authHelper.getUser();
    get().addAuditLog({
      userId: user?.id || "0",
      userName: user?.name || "System",
      action: "CREATE",
      module: "INVENTORY",
      details: `Added product: ${newProduct.name} to shop ${get().shops.find(s => s.id === newProduct.shopId)?.name || newProduct.shopId}`
    });
  },
  updateProduct: async (id, data) => {
    const updatedProduct = await productsApi.update(id, data);
    set((state) => ({ products: state.products.map((p) => p.id === id ? updatedProduct : p) }));

    // Log action
    const user = authHelper.getUser();
    get().addAuditLog({
      userId: user?.id || "0",
      userName: user?.name || "System",
      action: "UPDATE",
      module: "INVENTORY",
      details: `Updated product: ${updatedProduct.name}`
    });
  },
  deleteProduct: async (id) => {
    const productName = get().products.find(p => p.id === id)?.name || id;
    await productsApi.remove(id);
    set((state) => ({ products: state.products.filter((p) => p.id !== id) }));

    // Log action
    const user = authHelper.getUser();
    get().addAuditLog({
      userId: user?.id || "0",
      userName: user?.name || "System",
      action: "DELETE",
      module: "INVENTORY",
      details: `Deleted product: ${productName}`
    });
  },

  fetchSales: async () => {
    const sales = await salesApi.getAll();
    set({ sales });
  },
  addSale: async ({ productId, shopId, quantity }) => {
    const newSale = await salesApi.create({ productId, shopId, quantity });
    set((state) => ({ sales: [...state.sales, newSale] }));

    // Add Audit Log
    const user = authHelper.getUser();
    get().addAuditLog({
      userId: user?.id || "0",
      userName: user?.name || "System",
      action: "CREATE",
      module: "SALES",
      details: `Sold ${quantity}x ${newSale.productName}`
    });

    // Add Notification
    get().addNotification({
      type: "success",
      title: "Sale Recorded",
      message: `${quantity}x ${newSale.productName} at ${get().shops.find(s => String(s.id) === String(shopId))?.name || "Shop"}`
    });

    await get().fetchProducts();
  },

  fetchServiceSales: async () => {
    const serviceSales = await servicesApi.getAll();
    set({ serviceSales });
  },
  addServiceSale: async (service) => {
    const newServiceSale = await servicesApi.create(service);
    set((state) => ({ serviceSales: [...state.serviceSales, newServiceSale] }));

    // Add Audit Log
    const user = authHelper.getUser();
    get().addAuditLog({
      userId: user?.id || "0",
      userName: user?.name || "System",
      action: "CREATE",
      module: "SERVICES",
      details: `Provided service: ${newServiceSale.serviceName}`
    });
  },

  addNotification: (notification) => {
    const newNotification: Notification = {
      ...notification,
      id: Math.random().toString(36).substr(2, 9),
      time: "Just now",
      read: false,
    };
    set((state) => ({ notifications: [newNotification, ...state.notifications] }));
  },

  markNotificationAsRead: (id) => {
    set((state) => ({
      notifications: state.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
    }));
  },

  fetchAuditLogs: async () => {
    const response = await auditLogsApi.getAll();
    if (response.success && response.data) {
      set({ auditLogs: response.data });
    }
  },

  addAuditLog: async (log) => {
    const response = await auditLogsApi.create(log);
    if (response.success && response.data) {
      set((state) => ({ auditLogs: [response.data!, ...state.auditLogs] }));
    }
  },

  sidebarCollapsed: false,
  setSidebarCollapsed: (collapsed: boolean) => set({ sidebarCollapsed: collapsed }),
  mobileMenuOpen: false,
  setMobileMenuOpen: (open: boolean) => set({ mobileMenuOpen: open }),
}));
