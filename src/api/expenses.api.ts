import { apiClient } from "./client";
import { Expense } from "@/types/models";

const mapExpense = (e: any): Expense => ({
  id: String(e.id || ""),
  shopId: String(e.shop_id || ""),
  userId: String(e.user_id || ""),
  category: String(e.category || ""),
  amount: Number(e.amount || 0),
  description: e.description || "",
  date: e.date || "",
});

export const expensesApi = {
  async getAll(): Promise<Expense[]> {
    const res = await apiClient.get<any[]>("/expenses");
    return (res.data || []).map(mapExpense);
  },
  async create(data: Partial<Expense>): Promise<Expense> {
    const res = await apiClient.post<any>("/expenses", {
      shopId: data.shopId,
      amount: data.amount,
      category: data.category,
      description: data.description,
      date: data.date,
    });
    return mapExpense(res.data);
  },
  async update(id: string, data: Partial<Expense>): Promise<Expense> {
    const res = await apiClient.put<any>(`/expenses/${id}`, data);
    return mapExpense(res.data);
  },
  async remove(id: string): Promise<void> {
    await apiClient.delete(`/expenses/${id}`);
  },
};
