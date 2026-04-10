import { apiClient } from "./client";

export interface UserRecord {
    id: string;
    name: string;
    email: string;
    role: "admin" | "seller" | "viewer";
    permissions: string[];
    assigned_shops: number[];
    created_at: string;
}

export const ALL_PERMISSIONS = [
    // Shops
    { key: "view_shops", label: "View Shops", group: "Shops" },
    { key: "manage_shops", label: "Manage Shops", group: "Shops" },
    // Inventory
    { key: "view_products", label: "View Products", group: "Inventory" },
    { key: "add_products", label: "Add Products", group: "Inventory" },
    { key: "edit_products", label: "Edit Products", group: "Inventory" },
    { key: "manage_imports", label: "Manage Data Imports", group: "Inventory" },
    // Sales
    { key: "view_sales", label: "View Sales", group: "Sales" },
    { key: "record_sales", label: "Record Sales", group: "Sales" },
    // Expenses
    { key: "view_expenses", label: "View Expenses", group: "Expenses" },
    { key: "record_expenses", label: "Record Expenses", group: "Expenses" },
    { key: "edit_expenses", label: "Edit Expenses", group: "Expenses" },
    { key: "delete_expenses", label: "Delete Expenses", group: "Expenses" },
    // Services
    { key: "view_services", label: "View Services", group: "Services" },
    { key: "record_services", label: "Record Services", group: "Services" },
    // Reports
    { key: "view_reports", label: "View Reports", group: "Reports" },
    { key: "view_summary", label: "View Daily Summary", group: "Reports" },
    // Financials
    { key: "view_profit", label: "View Profit & Margins (Sales)", group: "Financials" },
    { key: "manage_debts", label: "Manage Borrowing & Debts", group: "Financials" },
    // Dashboard Widgets
    { key: "dash_revenue", label: "Dashboard – Today's Revenue Card", group: "Dashboard" },
    { key: "dash_profit", label: "Dashboard – Estimated Profit Card", group: "Dashboard" },
    { key: "dash_inventory_value", label: "Dashboard – Inventory Value Card", group: "Dashboard" },
    { key: "dash_alerts", label: "Dashboard – Critical Alerts Card", group: "Dashboard" },
    { key: "dash_weekly_chart", label: "Dashboard – Weekly Performance Chart", group: "Dashboard" },
    { key: "dash_revenue_sources", label: "Dashboard – Revenue Sources Chart", group: "Dashboard" },
    { key: "dash_inventory_pulse", label: "Dashboard – Inventory Pulse Section", group: "Dashboard" },
    { key: "dash_top_items", label: "Dashboard – Top Items Feed", group: "Dashboard" },
    // Admin
    { key: "view_users", label: "View Users", group: "Admin" },
    { key: "manage_users", label: "Manage Users", group: "Admin" },
    { key: "view_audit_logs", label: "View Audit Logs (Shop Level)", group: "Admin" },
];

export const usersApi = {
    async getAll(): Promise<UserRecord[]> {
        const res = await apiClient.get<UserRecord[]>("/users");
        const raw = Array.isArray(res.data) ? res.data : [];
        return raw.filter((u): u is UserRecord => u != null);
    },
    async create(data: Omit<UserRecord, "id" | "created_at"> & { password: string }): Promise<UserRecord> {
        const res = await apiClient.post<UserRecord>("/users", data);
        return res.data as UserRecord;
    },
    async update(id: string, data: Partial<UserRecord & { password?: string }>): Promise<UserRecord> {
        const res = await apiClient.put<UserRecord>(`/users/${id}`, data);
        return res.data as UserRecord;
    },
    async remove(id: string): Promise<void> {
        await apiClient.delete(`/users/${id}`);
    },
    async assignRole(id: string, role: string): Promise<UserRecord> {
        const res = await apiClient.post<UserRecord>(`/users/${id}/assign-role`, { role });
        return res.data as UserRecord;
    },
};
