import { Product, Sale, Shop, Notification, DailySummary, ServiceSale } from "@/types/models";

export const shops: Shop[] = [
  { id: "1", name: "Glamour Beauty Hub", type: "cosmetics", location: "Downtown Mall, Block A", status: "active", createdAt: "2024-01-15" },
  { id: "2", name: "Office Pro Supplies", type: "stationery", location: "Business Park, Suite 12", status: "active", createdAt: "2024-02-01" },
  { id: "3", name: "Rose Cosmetics", type: "cosmetics", location: "City Center, Floor 2", status: "active", createdAt: "2024-03-10" },
  { id: "4", name: "Paper & Pen Station", type: "stationery", location: "Market Street, Shop 5", status: "inactive", createdAt: "2024-04-20" },
];

export const products: Product[] = [
  { id: "1", name: "Maybelline Fit Me Foundation", category: "Foundation", shopId: "1", manufacturer: "Maybelline", registrationDate: "2024-06-01", expiryDate: "2025-12-01", buyingCost: 12, sellingPrice: 22, quantity: 45, supplier: "Beauty Wholesale Co", batchNumber: "MFM-2024-001", status: "approved" },
  { id: "2", name: "MAC Lipstick Ruby Woo", category: "Lipstick", shopId: "1", manufacturer: "MAC", registrationDate: "2024-06-15", expiryDate: "2026-01-15", buyingCost: 15, sellingPrice: 28, quantity: 30, supplier: "MAC Distributors", batchNumber: "MAC-RW-001", status: "approved" },
  { id: "3", name: "A4 Printing Paper (500 sheets)", category: "Paper", shopId: "2", manufacturer: "Double A", registrationDate: "2024-05-10", buyingCost: 4, sellingPrice: 7, quantity: 200, supplier: "Paper World Ltd", batchNumber: "DA-A4-500", status: "approved" },
  { id: "4", name: "HP 61 Black Ink Cartridge", category: "Ink & Toner", shopId: "2", manufacturer: "HP", registrationDate: "2024-07-01", buyingCost: 18, sellingPrice: 32, quantity: 15, supplier: "Tech Supplies Inc", batchNumber: "HP61-BK", status: "approved" },
  { id: "5", name: "L'Oreal True Match Concealer", category: "Concealer", shopId: "3", manufacturer: "L'Oreal", registrationDate: "2024-08-01", expiryDate: "2025-08-01", buyingCost: 8, sellingPrice: 16, quantity: 3, supplier: "Beauty Wholesale Co", batchNumber: "LTM-CC-001", status: "approved" },
  { id: "6", name: "Stapler Heavy Duty", category: "Office Supplies", shopId: "2", manufacturer: "Kangaro", registrationDate: "2024-04-15", buyingCost: 6, sellingPrice: 12, quantity: 50, supplier: "Office Gear Ltd", batchNumber: "KNG-HD-100", status: "approved" },
  { id: "7", name: "Nivea Body Lotion 400ml", category: "Skincare", shopId: "1", manufacturer: "Nivea", registrationDate: "2024-09-01", expiryDate: "2025-03-15", buyingCost: 5, sellingPrice: 10, quantity: 8, supplier: "Beiersdorf AG", batchNumber: "NIV-BL-400", status: "pending" },
  { id: "8", name: "Gel Pen Set (12 pcs)", category: "Writing", shopId: "4", manufacturer: "Pilot", registrationDate: "2024-07-20", buyingCost: 3, sellingPrice: 6.5, quantity: 80, supplier: "Pen Masters", batchNumber: "PLT-GP-12", status: "approved" },
];

export const sales: Sale[] = [
  { id: "1", productId: "1", productName: "Maybelline Fit Me Foundation", shopId: "1", quantity: 2, sellingPrice: 22, totalCost: 44, profit: 20, date: "2026-02-27", time: "09:15" },
  { id: "2", productId: "3", productName: "A4 Printing Paper (500 sheets)", shopId: "2", quantity: 10, sellingPrice: 7, totalCost: 70, profit: 30, date: "2026-02-27", time: "10:30" },
  { id: "3", productId: "2", productName: "MAC Lipstick Ruby Woo", shopId: "1", quantity: 1, sellingPrice: 28, totalCost: 28, profit: 13, date: "2026-02-27", time: "11:45" },
  { id: "4", productId: "4", productName: "HP 61 Black Ink Cartridge", shopId: "2", quantity: 3, sellingPrice: 32, totalCost: 96, profit: 42, date: "2026-02-26", time: "14:20" },
  { id: "5", productId: "6", productName: "Stapler Heavy Duty", shopId: "2", quantity: 5, sellingPrice: 12, totalCost: 60, profit: 30, date: "2026-02-26", time: "15:00" },
  { id: "6", productId: "5", productName: "L'Oreal True Match Concealer", shopId: "3", quantity: 2, sellingPrice: 16, totalCost: 32, profit: 16, date: "2026-02-25", time: "09:00" },
];

export const serviceSales: ServiceSale[] = [
  { id: "1", serviceName: "Color Printing (A4)", shopId: "2", quantity: 50, pricePerUnit: 0.5, total: 25, date: "2026-02-27", time: "10:00" },
  { id: "2", serviceName: "Photocopy (B&W)", shopId: "2", quantity: 200, pricePerUnit: 0.1, total: 20, date: "2026-02-27", time: "11:30" },
  { id: "3", serviceName: "Lamination A4", shopId: "4", quantity: 15, pricePerUnit: 1, total: 15, date: "2026-02-26", time: "13:00" },
];

export const notifications: Notification[] = [
  { id: "1", type: "warning", title: "Low Stock Alert", message: "L'Oreal True Match Concealer is running low (3 units)", time: "5 min ago", read: false },
  { id: "2", type: "pending", title: "Stock Approval Pending", message: "Nivea Body Lotion 400ml awaiting approval", time: "1 hour ago", read: false },
  { id: "3", type: "expiry", title: "Expiry Warning", message: "Nivea Body Lotion 400ml expires on Mar 15, 2025", time: "2 hours ago", read: false },
  { id: "4", type: "success", title: "Sale Recorded", message: "10x A4 Printing Paper sold at Office Pro Supplies", time: "3 hours ago", read: true },
  { id: "5", type: "info", title: "Restock Request", message: "HP 61 Ink Cartridge restock requested by seller", time: "5 hours ago", read: true },
];

export const dailySummary: DailySummary = {
  totalSales: 142,
  totalRevenue: 4280,
  totalCost: 2850,
  totalProfit: 1430,
  transactions: 18,
};

export const weeklySalesData = [
  { day: "Mon", sales: 580, profit: 210 },
  { day: "Tue", sales: 720, profit: 290 },
  { day: "Wed", sales: 650, profit: 245 },
  { day: "Thu", sales: 890, profit: 380 },
  { day: "Fri", sales: 1100, profit: 450 },
  { day: "Sat", sales: 960, profit: 390 },
  { day: "Sun", sales: 380, profit: 140 },
];

export const monthlySalesData = [
  { month: "Sep", cosmetics: 3200, stationery: 4100 },
  { month: "Oct", cosmetics: 3800, stationery: 3900 },
  { month: "Nov", cosmetics: 4200, stationery: 4500 },
  { month: "Dec", cosmetics: 5100, stationery: 5800 },
  { month: "Jan", cosmetics: 3900, stationery: 4200 },
  { month: "Feb", cosmetics: 4280, stationery: 4600 },
];

export const topProducts = [
  { name: "A4 Paper", sold: 320, revenue: 2240 },
  { name: "Fit Me Foundation", sold: 85, revenue: 1870 },
  { name: "MAC Ruby Woo", sold: 62, revenue: 1736 },
  { name: "HP 61 Ink", sold: 45, revenue: 1440 },
  { name: "Stapler HD", sold: 40, revenue: 480 },
];
