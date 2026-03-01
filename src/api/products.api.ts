import { apiClient } from "./client";
import { Product } from "@/types/models";

const mapProduct = (p: any): Product => ({
  id: String(p.id || ""),
  name: String(p.name || ""),
  category: String(p.category || ""),
  shopId: String(p.shopId || p.shop_id || ""),
  manufacturer: String(p.manufacturer || ""),
  registrationDate: p.registrationDate || p.registration_date || (p.created_at ? p.created_at.split('T')[0] : ""),
  expiryDate: p.expiryDate || p.expiry_date || undefined,
  buyingCost: Number(p.buyingCost || p.cost_price || 0),
  sellingPrice: Number(p.sellingPrice || p.selling_price || 0),
  quantity: Number(p.quantity || 0),
  supplier: String(p.supplier || ""),
  batchNumber: String(p.batchNumber || p.batch_number || ""),
  barcode: String(p.barcode || ""),
  status: p.status || p.approval_status || "approved",
});

export const productsApi = {
  async getAll(): Promise<Product[]> {
    const res = await apiClient.get<any[]>("/products");
    const rawData = Array.isArray(res.data) ? res.data : [];
    return rawData.map(mapProduct);
  },
  async get(id: string): Promise<Product> {
    const res = await apiClient.get<any>(`/products/${id}`);
    return mapProduct(res.data);
  },
  async create(data: Partial<Product>): Promise<Product> {
    const res = await apiClient.post<any>("/products", data);
    return mapProduct(res.data);
  },
  async update(id: string, data: Partial<Product>): Promise<Product> {
    const res = await apiClient.put<any>(`/products/${id}`, data);
    return mapProduct(res.data);
  },
  async remove(id: string): Promise<void> {
    await apiClient.delete(`/products/${id}`);
  },
};
