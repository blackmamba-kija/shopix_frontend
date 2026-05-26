import { useEffect } from "react";
import { AppSidebar } from "./AppSidebar";
import { TopBar } from "./TopBar";
import { useStore } from "@/store/useStore";
import { authApi } from "@/api/auth.api";
import { authHelper } from "@/utils/helpers/auth.helper";
import { cn } from "@/lib/utils";

interface AppLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export function AppLayout({ children, title, subtitle }: AppLayoutProps) {
  const { refreshAllData, sidebarCollapsed: collapsed, mobileMenuOpen, setMobileMenuOpen, updateUser } = useStore();

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [setMobileMenuOpen]);

  useEffect(() => {
    // Sync profile to get latest permissions/shops
    authApi.getProfile().then((res: any) => {
      const userData = res.data?.user || res.user;
      if (userData) {
        updateUser({ ...userData, id: String(userData.id) });
        
        // Subscription Check
        if (userData.role !== 'admin') {
            const assignedIds = userData.assigned_shops || [];
            if (assignedIds.length > 0) {
                const shops = useStore.getState().shops;
                // Only check if we actually have shops loaded
                if (shops.length > 0) {
                    const userShops = shops.filter(s => assignedIds.includes(Number(s.id)));
                    const hasActiveSub = userShops.some(s => s.subscriptionStatus === 'active');
                    
                    if (!hasActiveSub) {
                        localStorage.removeItem('token');
                        updateUser(null);
                        window.location.href = '/login?expired=true';
                    }
                }
            }
        }
      }
    }).catch(() => { });

    refreshAllData();
  }, [refreshAllData, updateUser]);

  return (
    <div className="min-h-screen bg-background relative overflow-x-hidden">
      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden animate-in fade-in duration-300"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <AppSidebar />
      <div className={cn(
        "transition-all duration-300 min-h-screen flex flex-col",
        "lg:ml-0", // Default mobile
        collapsed ? "lg:ml-[68px]" : "lg:ml-[240px]"
      )}>
        <TopBar title={title} subtitle={subtitle} />
        <main className="p-4 lg:p-6 flex-1 overflow-x-auto">{children}</main>
      </div>
    </div>
  );
}
