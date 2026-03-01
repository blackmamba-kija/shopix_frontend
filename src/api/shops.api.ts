import { apiClient } from "./client";
import { Shop } from "@/types/models";

const mapShop = (s: any): Shop => ({
  id: String(s.id || ""),
  name: String(s.name || ""),
  type: s.type || "stationery",
  location: String(s.location || ""),
  status: s.status || "active",
  createdAt: s.createdAt || s.created_at || (s.created_at ? s.created_at.split('T')[0] : ""),
});

export const shopsApi = {
  async getAll(): Promise<Shop[]> {
    const res = await apiClient.get<any[]>("/shops");
    const rawData = Array.isArray(res.data) ? res.data : [];
    return rawData.map(mapShop);
  },
  async get(id: string): Promise<Shop> {
    const res = await apiClient.get<any>(`/shops/${id}`);
    return mapShop(res.data);
  },
  async create(data: Partial<Shop>): Promise<Shop> {
    const res = await apiClient.post<any>("/shops", data);
    return mapShop(res.data);
  },
  async update(id: string, data: Partial<Shop>): Promise<Shop> {
    const res = await apiClient.put<any>(`/shops/${id}`, data);
    return mapShop(res.data);
  },
  async remove(id: string): Promise<void> {
    await apiClient.delete(`/shops/${id}`);
  },
};
