import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Store,
  Package,
  ShoppingCart,
  FileText,
  CreditCard,
  Settings,
  Bell,
  Printer,
  ChevronLeft,
  ChevronRight,
  Users,
  LogOut,
  Shield,
  TrendingUp,
  HelpCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { usePermissions } from "@/hooks/useAuth";
import { authHelper } from "@/utils/helpers/auth.helper";
import { useStore } from "@/store/useStore";
import { useLanguage } from "@/hooks/useLanguage";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/", permission: null },
  { icon: Store, label: "Shops", path: "/shops", permission: "view_shops" },
  { icon: Package, label: "Inventory", path: "/inventory", permission: "view_products" },
  { icon: ShoppingCart, label: "Sales", path: "/sales", permission: "view_sales" },
  { icon: CreditCard, label: "Debts", path: "/debts", permission: "view_sales" },
  { icon: Printer, label: "Services", path: "/services", permission: "view_services" },
  { icon: FileText, label: "Reports", path: "/reports", permission: "view_reports" },
  { icon: Bell, label: "Notifications", path: "/notifications", permission: null },
  { icon: Users, label: "Users", path: "/users", permission: "view_users" },
  { icon: Shield, label: "Audit Logs", path: "/audit-logs", permission: "view_audit_logs" },
  { icon: TrendingUp, label: "Daily Summary", path: "/operational-summary", permission: "view_summary" },
  { icon: HelpCircle, label: "Guide", path: "/guide", permission: null },
  { icon: Settings, label: "Settings", path: "/settings", permission: null },
];

export function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const collapsed = useStore((s) => s.sidebarCollapsed);
  const setCollapsed = useStore((s) => s.setSidebarCollapsed);
  const mobileMenuOpen = useStore((s) => s.mobileMenuOpen);
  const setMobileMenuOpen = useStore((s) => s.setMobileMenuOpen);
  const updateUser = useStore((s) => s.updateUser);
  const { can, isAdmin, user } = usePermissions();
  const { t } = useLanguage();
  const shops = useStore((s) => s.shops);
  const selectedShopId = useStore((s) => s.selectedShopId);

  const selectedShop = shops.find(s => String(s.id) === String(selectedShopId));
  const displayLogo = selectedShop?.logo || "/shopix-logo.png";
  const displayName = selectedShop?.name || "SHOPIX";

  // Filter nav items: admins see everything, others see what they have permission for
  const visibleItems = navItems.filter(item =>
    item.permission === null ? true : can(item.permission)
  );

  const handleLogout = () => {
    localStorage.removeItem("token");
    updateUser(null);
    navigate("/login");
  };

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-50 h-screen sidebar-gradient border-r border-sidebar-border transition-all duration-300 flex flex-col shadow-2xl lg:shadow-none",
        collapsed ? "w-[68px]" : "w-[240px]",
        mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}
    >
      {/* Logo Section */}
      <div className={"flex items-center gap-3 h-32 border-b border-sidebar-border/50 transition-all duration-300 " + (collapsed ? "px-1 justify-center" : "px-3")}>
        <div className={cn(
          "rounded-[2.5rem] bg-white p-1.5 shadow-[0_0_40px_-10px_rgba(244,114,182,0.3)] flex-shrink-0 border border-white/20 transition-all duration-300 overflow-hidden flex items-center justify-center",
          collapsed ? "w-16 h-16" : "w-20 h-20"
        )}>
          <img
            src={displayLogo}
            alt={displayName}
            className="w-full h-full object-contain"
            onError={(e) => { (e.target as HTMLImageElement).src = "/shopix-logo.png" }}
          />
        </div>
        {!collapsed && (
          <div className="animate-in fade-in slide-in-from-left duration-500 overflow-hidden">
            <h1 className="text-lg font-black tracking-tight leading-none italic truncate max-w-[120px]">
              <span className="bg-gradient-to-br from-rose-400 via-orange-300 to-rose-500 bg-clip-text text-transparent uppercase">{displayName}</span>
            </h1>
            <div className="flex items-center gap-1.5 mt-1">
              <div className="w-1 h-1 rounded-full bg-rose-500 animate-pulse" />
              <p className="text-[9px] text-sidebar-muted font-bold uppercase tracking-[0.15em]">Shop Control</p>
            </div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {visibleItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => {
                if (window.innerWidth < 1024) setMobileMenuOpen(false);
              }}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group",
                isActive
                  ? "bg-sidebar-accent text-sidebar-primary"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <item.icon className={cn("w-[18px] h-[18px] shrink-0", isActive && "text-sidebar-primary")} />
              <span className={cn("truncate", collapsed && "lg:hidden")}>{t(item.label)}</span>
            </Link>
          );
        })}
      </nav>

      {/* User info + logout */}
      {!collapsed && user && (
        <div className="mx-2 mb-2 p-3 rounded-lg bg-sidebar-accent/50 border border-sidebar-border">
          <p className="text-xs font-semibold text-sidebar-accent-foreground truncate">{user.name}</p>
          <p className="text-[10px] text-sidebar-muted capitalize">{user.role}</p>
        </div>
      )}
      <button
        onClick={handleLogout}
        className="mx-2 mb-1 flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-sidebar-muted hover:text-destructive hover:bg-destructive/10 transition-colors"
      >
        <LogOut className="w-4 h-4 shrink-0" />
        {!collapsed && <span>{t("Logout")}</span>}
      </button>

      {/* Collapse toggle (Desktop only) */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="mx-2 mb-4 hidden lg:flex items-center justify-center py-2 rounded-lg text-sidebar-muted hover:text-sidebar-accent-foreground hover:bg-sidebar-accent transition-colors"
      >
        {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>
    </aside>
  );
}
