import { apiClient, ApiResponse } from "./client";

export const importsApi = {
  importData: async (formData: FormData): Promise<ApiResponse> => {
    return apiClient.post("/import", formData);
  },

  downloadTemplate: async (type: string): Promise<void> => {
    const token = localStorage.getItem("token");
    const baseUrl = (apiClient as any).baseUrl;
    const url = `${baseUrl}/import/template/${type}`;
    
    const response = await fetch(url, {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    const contentType = response.headers.get("Content-Type");
    const isCsv = contentType && contentType.includes("text/csv");
    const extension = isCsv ? "csv" : "xlsx";
    
    if (contentType && contentType.includes("application/json")) {
      const data = await response.json();
      throw new Error(data.message || "Failed to download template");
    }

    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.setAttribute('download', `${type}_template.${extension}`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  },

  clearInventory: async (shopId: number): Promise<ApiResponse> => {
    return apiClient.post("/import/clear", { shop_id: shopId });
  }
};
