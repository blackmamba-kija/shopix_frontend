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
            const res = await apiClient.get<AnnouncementRecord | null>("/announcements/active");
            return res.data || null;
        } catch {
            return null;
        }
    },

    getAll: async (): Promise<AnnouncementRecord[]> => {
        const res = await apiClient.get<AnnouncementRecord[]>("/announcements");
        return res.data || [];
    },

    create: async (data: Partial<AnnouncementRecord>): Promise<AnnouncementRecord> => {
        const res = await apiClient.post<AnnouncementRecord>("/announcements", data);
        return res.data!;
    },

    update: async (id: number, data: Partial<AnnouncementRecord>): Promise<AnnouncementRecord> => {
        const res = await apiClient.put<AnnouncementRecord>(`/announcements/${id}`, data);
        return res.data!;
    },

    toggle: async (id: number): Promise<{ is_active: boolean; message: string }> => {
        const res = await apiClient.post<{ message: string; data: AnnouncementRecord }>(`/announcements/${id}/toggle`, {});
        return { is_active: (res.data as any)?.data?.is_active ?? false, message: res.message || "Updated" };
    },

    remove: async (id: number): Promise<void> => {
        await apiClient.delete(`/announcements/${id}`);
    },
};
