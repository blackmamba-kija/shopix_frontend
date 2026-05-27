import { apiClient } from "./client";
import { Shop } from "@/types/models";

const mapShop = (s: any): Shop => ({
  id: String(s.id || ""),
  name: String(s.name || ""),
  logo: s.logo || "",
  type: s.type || "stationery",
  location: String(s.location || ""),
  status: s.status || "active",
  createdAt: s.createdAt || s.created_at || "",
  isPaid: Boolean(s.isPaid ?? s.is_paid ?? false),
  subscriptionAmount: Number(s.subscriptionAmount ?? s.subscription_amount ?? 0),
  subscriptionType: s.subscriptionType ?? s.subscription_type ?? null,
  paymentDate: s.paymentDate ?? s.payment_date ?? null,
  subscriptionStartDate: s.subscriptionStartDate ?? s.subscription_start_date ?? null,
  subscriptionEndDate: s.subscriptionEndDate ?? s.subscription_end_date ?? null,
  subscriptionStatus: s.subscriptionStatus ?? s.subscription_status ?? "unpaid",
  subscriptionRemainingDays: (() => {
    const raw = s.subscriptionRemainingDays ?? s.subscription_remaining_days;
    if (raw !== undefined) return Number(raw);
    
    // Auto-calculate if not provided by backend
    const endStr = s.subscriptionEndDate ?? s.subscription_end_date;
    if (!endStr) return 0;
    const end = new Date(endStr);
    const today = new Date();
    const diff = end.getTime() - today.getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  })()
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
  async uploadLogo(id: string, file: File): Promise<string> {
    const formData = new FormData();
    formData.append('logo', file);
    const res = await apiClient.post<any>(`/shops/${id}/logo`, formData);
    return res.data.logo_url;
  },
  async updateSubscription(id: string, data: {
    is_paid: boolean;
    subscription_amount: number;
    subscription_type: string;
    payment_date: string;
    subscription_start_date: string;
    subscription_end_date: string;
    status?: string;
  }): Promise<Shop> {
    const res = await apiClient.put<any>(`/shops/${id}/subscription`, data);
    return mapShop(res.data);
  },
};
