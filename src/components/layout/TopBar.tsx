import { Bell, Search, LogOut, ChevronDown, Store, Menu } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "@/store/useStore";
import { usePermissions } from "@/hooks/useAuth";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface TopBarProps {
  title: string;
  subtitle?: string;
}

export function TopBar({ title, subtitle }: TopBarProps) {
  const storeNotifications = useStore((s) => s.notifications);
  const markAsRead = useStore((s) => s.markNotificationAsRead);
  const unreadCount = storeNotifications.filter((n) => !n.read).length;
  const [showNotifications, setShowNotifications] = useState(false);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || '{"name":"User", "role": "seller"}');

  const { filterShops, isAdmin } = usePermissions();
  const shopsRaw = useStore((s) => s.shops);
  const selectedShopId = useStore((s) => s.selectedShopId);
  const setSelectedShopId = useStore((s) => s.setSelectedShopId);
  const mobileMenuOpen = useStore((s) => s.mobileMenuOpen);
  const setMobileMenuOpen = useStore((s) => s.setMobileMenuOpen);

  const shops = useMemo(() => filterShops(shopsRaw), [filterShops, shopsRaw]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  // Automatically select the first shop if none selected and not admin
  useEffect(() => {
    if (selectedShopId === "all" && !isAdmin && shops.length > 0) {
      setSelectedShopId(String(shops[0].id));
    }
  }, [shops, isAdmin, selectedShopId, setSelectedShopId]);

  return (
    <header className="h-16 border-b border-border bg-card flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          className="lg:hidden p-0 h-9 w-9 bg-secondary/50 rounded-xl"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <Menu className="w-5 h-5 text-slate-700" />
        </Button>
        <div className="hidden sm:block">
          <h1 className="text-lg font-semibold text-foreground leading-tight">{title}</h1>
          {subtitle && <p className="text-[10px] text-muted-foreground">{subtitle}</p>}
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Universal Shop Switcher */}
        <div className="flex items-center gap-1 sm:gap-2 bg-secondary/30 sm:bg-secondary/50 p-0.5 sm:p-1 rounded-xl border border-border/50">
          <div className="flex items-center gap-2 px-2 sm:px-3 py-1 sm:py-1.5 border-r border-border/50">
            <Store className="w-3.5 h-3.5 sm:w-4 h-4 text-primary" />
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight hidden md:inline">Active Shop</span>
          </div>
          <Select value={selectedShopId} onValueChange={setSelectedShopId}>
            <SelectTrigger className="w-[140px] sm:w-[180px] h-8 border-none bg-transparent hover:bg-secondary transition-all focus:ring-0 shadow-none text-xs font-bold">
              <SelectValue placeholder="Select Shop" />
            </SelectTrigger>
            <SelectContent>
              {isAdmin && <SelectItem value="all" className="text-xs font-bold">All Shops (Admin)</SelectItem>}
              {shops.map((s) => (
                <SelectItem key={s.id} value={String(s.id)} className="text-xs font-medium">
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="relative hidden lg:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search..."
            className="pl-9 w-40 h-9 bg-secondary/50 border-none text-xs focus-visible:ring-1 focus-visible:ring-primary/20"
          />
        </div>

        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-lg hover:bg-secondary transition-colors"
          >
            <Bell className="w-5 h-5 text-muted-foreground" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-12 w-80 bg-card border border-border rounded-lg shadow-lg animate-fade-in z-50">
              <div className="p-3 border-b border-border">
                <h3 className="text-sm font-semibold text-foreground">Notifications</h3>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {storeNotifications.length === 0 ? (
                  <div className="p-8 text-center">
                    <p className="text-xs text-muted-foreground">No notifications</p>
                  </div>
                ) : (
                  storeNotifications.slice(0, 10).map((n) => (
                    <div
                      key={n.id}
                      onClick={() => markAsRead(n.id)}
                      className={`p-3 border-b border-border last:border-0 cursor-pointer transition-colors hover:bg-secondary/50 ${!n.read ? "bg-primary/5" : ""}`}
                    >
                      <p className="text-sm font-medium text-foreground">{n.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{n.message}</p>
                      <p className="text-[10px] text-muted-foreground mt-1">{n.time}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-pink-600 to-blue-600 flex items-center justify-center">
            <span className="text-xs font-semibold text-white">{user.name?.charAt(0).toUpperCase() || "U"}</span>
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-sm font-medium text-foreground leading-none">{user.name || "User"}</p>
            <p className="text-[11px] text-muted-foreground capitalize">{user.role || "Seller"}</p>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="ml-2 h-8 w-8 p-0">
                <ChevronDown className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-2 py-1.5">
                <p className="text-sm font-semibold text-foreground">{user.name || "User"}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate("/settings")}>
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
