import { apiClient, ApiResponse } from "./client";
import { AuditLog } from "@/types/models";

export const auditLogsApi = {
    getAll: async (): Promise<ApiResponse<AuditLog[]>> => {
        const response = await apiClient.get<any[]>("/audit-logs");
        if (response.success && response.data) {
            const mapped = response.data.map(log => ({
                id: log.id,
                userId: log.user_id || log.userId,
                userName: log.user_name || log.userName,
                action: log.action,
                module: log.module,
                details: log.details,
                timestamp: log.created_at || log.timestamp,
                ipAddress: log.ip_address || log.ipAddress
            }));
            return { ...response, data: mapped };
        }
        return response;
    },
    create: async (data: Omit<AuditLog, "id" | "timestamp">): Promise<ApiResponse<AuditLog>> => {
        const response = await apiClient.post<any>("/audit-logs", data);
        if (response.success && response.data) {
            const log = response.data;
            const mapped: AuditLog = {
                id: log.id,
                userId: log.user_id || log.userId,
                userName: log.user_name || log.userName,
                action: log.action,
                module: log.module,
                details: log.details,
                timestamp: log.created_at || log.timestamp,
                ipAddress: log.ip_address || log.ipAddress
            };
            return { ...response, data: mapped };
        }
        return response;
    }
};
