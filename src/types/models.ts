export interface Shop {
  id: string;
  name: string;
  logo?: string;
  type: string;
  location: string;
  status: "active" | "inactive";
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  shopId: string;
  manufacturer: string;
  registrationDate: string;
  expiryDate?: string;
  buyingCost: number;
  sellingPrice: number;
  quantity: number;
  supplier: string;
  batchNumber: string;
  barcode?: string;
  status: "pending" | "approved" | "rejected";
}

export interface Sale {
  id: string;
  productId: string;
  productName: string;
  shopId: string;
  quantity: number;
  sellingPrice: number;
  totalCost: number;
  profit: number;
  date: string;
  time: string;
}

export interface ServiceSale {
  id: string;
  serviceName: string;
  shopId: string;
  quantity: number;
  pricePerUnit: number;
  total: number;
  date: string;
  time: string;
}

export interface Notification {
  id: string;
  type: "warning" | "success" | "pending" | "expiry" | "info";
  title: string;
  message: string;
  time: string;
  read: boolean;
}

export interface DailySummary {
  totalSales: number;
  totalRevenue: number;
  totalCost: number;
  totalProfit: number;
  transactions: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "seller" | "viewer";
  assignedShops: string[];
  status: "active" | "inactive";
  permissions?: string[];
}

export interface Expense {
  id: string;
  shopId: string;
  userId: string;
  category: string;
  amount: number;
  description?: string;
  date: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  module: string;
  details: string;
  timestamp: string;
  ipAddress?: string;
}
