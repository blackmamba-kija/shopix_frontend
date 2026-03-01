import { apiClient, ApiResponse } from "./client";
import { AuditLog } from "@/types/models";

export const auditLogsApi = {
    getAll: async (): Promise<ApiResponse<AuditLog[]>> => {
        return apiClient.get<AuditLog[]>("/audit-logs");
    },
    create: async (data: Omit<AuditLog, "id" | "timestamp">): Promise<ApiResponse<AuditLog>> => {
        return apiClient.post<AuditLog>("/audit-logs", data);
    }
};
