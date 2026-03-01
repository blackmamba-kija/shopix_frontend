import { apiClient } from "./client";
import { Sale } from "@/types/models";

const mapSale = (s: any): Sale => ({
  id: String(s.id || ""),
  productId: String(s.productId || s.product_id || ""),
  productName: s.productName || s.product?.name || "Unknown Product",
  shopId: String(s.shopId || s.shop_id || ""),
  quantity: Number(s.quantity || 0),
  sellingPrice: Number(s.sellingPrice || s.selling_price || 0),
  totalCost: Number(s.totalCost || s.total_cost || (Number(s.sellingPrice || s.selling_price || 0) * Number(s.quantity || 0))),
  profit: Number(s.profit || 0),
  date: (s.date || s.sale_date || (s.created_at || "")).split(/[ T]/)[0] || new Date().toISOString().split('T')[0],
  time: s.time || s.sale_time || (s.created_at ? s.created_at.split('T')[1].substring(0, 5) : "00:00")
});

export const salesApi = {
  async getAll(): Promise<Sale[]> {
    const res = await apiClient.get<any>("/sales");
    const rawData = res.data || [];
    return rawData.map(mapSale);
  },
  async get(id: string): Promise<Sale> {
    const res = await apiClient.get<any>(`/sales/${id}`);
    return mapSale(res.data);
  },
  async create(data: Partial<Sale>): Promise<Sale> {
    const res = await apiClient.post<any>("/sales", data);
    return mapSale(res.data);
  },
  async update(id: string, data: Partial<Sale>): Promise<Sale> {
    const res = await apiClient.put<any>(`/sales/${id}`, data);
    return mapSale(res.data);
  },
  async remove(id: string): Promise<void> {
    await apiClient.delete(`/sales/${id}`);
  },
};
