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
  const fetchShops = useStore((s) => s.fetchShops);
  const fetchProducts = useStore((s) => s.fetchProducts);
  const fetchSales = useStore((s) => s.fetchSales);
  const fetchServiceSales = useStore((s) => s.fetchServiceSales);

  const collapsed = useStore((s) => s.sidebarCollapsed);
  const mobileMenuOpen = useStore((s) => s.mobileMenuOpen);
  const setMobileMenuOpen = useStore((s) => s.setMobileMenuOpen);
  const updateUser = useStore((s) => s.updateUser);

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
      if (res.success && res.data?.user) {
        updateUser({ ...res.data.user, id: String(res.data.user.id) });
      } else if (res.user) { // Handle potential different response shapes
        updateUser({ ...res.user, id: String(res.user.id) });
      }
    }).catch(() => { });

    fetchShops();
    fetchProducts();
    fetchSales();
    fetchServiceSales();
  }, [fetchShops, fetchProducts, fetchSales, fetchServiceSales, updateUser]);

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
