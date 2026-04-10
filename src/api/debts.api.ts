import { apiClient } from "./client";

export interface DebtPayment {
  id: string;
  debtId: string;
  amount: number;
  paymentDate: string;
}

export interface Debt {
  id: string;
  customerName: string;
  phone?: string;
  shopId: string;
  productId?: string;
  quantity: number;
  totalAmount: number;
  amountPaid: number;
  status: "unpaid" | "partial" | "paid";
  dueDate?: string;
  createdAt: string;
  product?: any;
  shop?: any;
  payments?: DebtPayment[];
}

export const debtsApi = {
  async getAll(): Promise<Debt[]> {
    const res = await apiClient.get<any>("/debts");
    const data = res.data?.data || res.data || [];
    return data.map((d: any) => ({
      id: String(d.id),
      customerName: d.customer_name,
      phone: d.phone,
      shopId: String(d.shop_id),
      productId: d.product_id ? String(d.product_id) : undefined,
      quantity: Number(d.quantity),
      totalAmount: Number(d.total_amount),
      amountPaid: Number(d.amount_paid),
      status: d.status,
      dueDate: d.due_date,
      createdAt: d.created_at,
      product: d.product,
      shop: d.shop,
      payments: d.payments?.map((p: any) => ({
        id: String(p.id),
        debtId: String(p.debt_id),
        amount: Number(p.amount),
        paymentDate: p.created_at
      }))
    }));
  },
  async create(data: any): Promise<Debt> {
    const res = await apiClient.post<any>("/debts", data);
    return res.data.data;
  },
  async pay(id: string, amount: number): Promise<Debt> {
    const res = await apiClient.post<any>(`/debts/${id}/pay`, { amount });
    return res.data.data;
  },
  async remove(id: string): Promise<void> {
    await apiClient.delete(`/debts/${id}`);
  },
  async update(id: string, data: Partial<Debt>): Promise<Debt> {
    const res = await apiClient.put<any>(`/debts/${id}`, data);
    return res.data?.data || res.data;
  }
};
