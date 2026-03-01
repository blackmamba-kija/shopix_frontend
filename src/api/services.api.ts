import { apiClient } from "./client";
import { ServiceSale } from "@/types/models";

const mapServiceSale = (s: any): ServiceSale => ({
  id: String(s.id || ""),
  serviceName: String(s.serviceName || s.service_name || ""),
  shopId: String(s.shopId || s.shop_id || ""),
  quantity: Number(s.quantity || 0),
  pricePerUnit: Number(s.pricePerUnit || s.unit_price || 0),
  total: Number(s.total || s.total_amount || (Number(s.unit_price || 0) * Number(s.quantity || 0))),
  date: (s.date || s.service_date || (s.created_at || "")).split(/[ T]/)[0] || new Date().toISOString().split('T')[0],
  time: s.time || s.service_time || (s.created_at ? s.created_at.split('T')[1].substring(0, 5) : "00:00")
});

export const servicesApi = {
  async getAll(): Promise<ServiceSale[]> {
    const res = await apiClient.get<any[]>("/service-sales");
    const rawData = Array.isArray(res.data) ? res.data : [];
    return rawData.map(mapServiceSale);
  },
  async get(id: string): Promise<ServiceSale> {
    const res = await apiClient.get<any>(`/service-sales/${id}`);
    return mapServiceSale(res.data);
  },
  async create(data: Partial<ServiceSale>): Promise<ServiceSale> {
    const res = await apiClient.post<any>("/service-sales", data);
    return mapServiceSale(res.data);
  },
  async update(id: string, data: Partial<ServiceSale>): Promise<ServiceSale> {
    const res = await apiClient.put<any>(`/service-sales/${id}`, data);
    return mapServiceSale(res.data);
  },
  async remove(id: string): Promise<void> {
    await apiClient.delete(`/service-sales/${id}`);
  },
};
