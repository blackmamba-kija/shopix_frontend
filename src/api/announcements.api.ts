import { apiClient } from "./client";

export interface AnnouncementRecord {
    id: number;
    title: string;
    description?: string;
    video_url?: string;
    is_active: boolean;
    created_by?: number;
    created_at?: string;
    updated_at?: string;
}

export const announcementsApi = {
    getActive: async (): Promise<AnnouncementRecord | null> => {
        try {
            const res = await apiClient.get<any>("/announcements/active");
            if (!res || !res.success) return null;
            const item = (res.data as any)?.data || res.data;
            if (!item || !item.id) return null;
            return item;
        } catch {
            return null;
        }
    },

    getAll: async (): Promise<AnnouncementRecord[]> => {
        try {
            const res = await apiClient.get<any>("/announcements");
            const list = (res.data as any)?.data || res.data || [];
            return Array.isArray(list) ? list : [];
        } catch {
            return [];
        }
    },

    create: async (data: Partial<AnnouncementRecord>): Promise<AnnouncementRecord> => {
        const res = await apiClient.post<any>("/announcements", data);
        return (res.data as any)?.data || res.data;
    },

    update: async (id: number, data: Partial<AnnouncementRecord>): Promise<AnnouncementRecord> => {
        const res = await apiClient.put<any>(`/announcements/${id}`, data);
        return (res.data as any)?.data || res.data;
    },

    toggle: async (id: number): Promise<{ is_active: boolean; message: string }> => {
        const res = await apiClient.post<any>(`/announcements/${id}/toggle`, {});
        const item = (res.data as any)?.data || res.data;
        return { is_active: Boolean(item?.is_active), message: res.message || "Updated" };
    },

    remove: async (id: number): Promise<void> => {
        await apiClient.delete(`/announcements/${id}`);
    },
};
