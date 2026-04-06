import { API_CONFIG } from "@/config/api.config";

export const getAssetUrl = (path: string | null | undefined): string => {
  if (!path) return "";
  if (path.startsWith('http')) return path;
  
  // Remove /api from the end of BASE_URL if it exists
  const baseHost = API_CONFIG.BASE_URL.endsWith('/api') 
    ? API_CONFIG.BASE_URL.slice(0, -4) 
    : API_CONFIG.BASE_URL;
    
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `${baseHost}/${cleanPath}`;
};
