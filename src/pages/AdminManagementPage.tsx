import { AppLayout } from "@/components/layout/AppLayout";
import { useStore } from "@/store/useStore";
import { usePermissions } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import { useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ManageSubscriptionDialog } from "@/components/forms/ManageSubscriptionDialog";
import { Shop } from "@/types/models";
import {
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  CreditCard,
  Store,
  TrendingUp,
  AlertTriangle,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { StatCard } from "@/components/dashboard/StatCard";

type SubFilter = "all" | "active" | "unpaid" | "expired";

const statusConfig = {
  active: {
    label: "Active",
    icon: CheckCircle2,
    badge: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    row: "hover:bg-emerald-500/5",
  },
  unpaid: {
    label: "Unpaid",
    icon: XCircle,
    badge: "bg-rose-500/10 text-rose-600 border-rose-500/20",
    row: "hover:bg-rose-500/5",
  },
  expired: {
    label: "Expired",
    icon: Clock,
    badge: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    row: "hover:bg-amber-500/5",
  },
};

const AdminManagementPage = () => {
  const { isAdmin } = usePermissions();
  if (!isAdmin) return <Navigate to="/" replace />;

  const shops = useStore((s) => s.shops);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<SubFilter>("all");
  const [managingShop, setManagingShop] = useState<Shop | null>(null);

  const filtered = useMemo(() => {
    return shops.filter((s) => {
      const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
        (s.location ?? "").toLowerCase().includes(search.toLowerCase());
      const matchesFilter = filter === "all" || s.subscriptionStatus === filter;
      return matchesSearch && matchesFilter;
    });
  }, [shops, search, filter]);

  const activeCount = shops.filter((s) => s.subscriptionStatus === "active").length;
  const unpaidCount = shops.filter((s) => s.subscriptionStatus === "unpaid").length;
  const expiredCount = shops.filter((s) => s.subscriptionStatus === "expired").length;
  const totalRevenue = shops
    .filter((s) => s.isPaid)
    .reduce((sum, s) => sum + (s.subscriptionAmount || 0), 0);

  const filterTabs: { key: SubFilter; label: string; count: number; color: string }[] = [
    { key: "all", label: "All Shops", count: shops.length, color: "text-foreground border-foreground/20 bg-secondary/50" },
    { key: "active", label: "Active", count: activeCount, color: "text-emerald-600 border-emerald-500/30 bg-emerald-500/10" },
    { key: "unpaid", label: "Unpaid", count: unpaidCount, color: "text-rose-600 border-rose-500/30 bg-rose-500/10" },
    { key: "expired", label: "Expired", count: expiredCount, color: "text-amber-600 border-amber-500/30 bg-amber-500/10" },
  ];



  return (
    <AppLayout title="Admin Management" subtitle="Manage shop subscriptions, payments & access control">
      <div className="flex flex-col gap-6">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Shops" value={String(shops.length)} icon={Store} change="Registered" changeType="neutral" />
          <StatCard title="Active Subs" value={String(activeCount)} icon={ShieldCheck} change="Paid & valid" changeType="positive" />
          <StatCard title="Unpaid" value={String(unpaidCount)} icon={AlertTriangle} change="Need attention" changeType="negative" />
          <StatCard title="Sub Revenue" value={`Tsh${totalRevenue.toLocaleString()}`} icon={TrendingUp} change="Total collected" changeType="positive" />
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search shops..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-10 bg-secondary/50 border-border rounded-xl"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {filterTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={cn(
                  "px-3 py-1.5 rounded-xl text-xs font-bold border transition-all",
                  filter === tab.key ? tab.color : "text-muted-foreground border-border bg-secondary/30 hover:bg-secondary"
                )}
              >
                {tab.label}
                <span className="ml-1.5 opacity-70">({tab.count})</span>
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-md">
          <Table>
            <TableHeader className="bg-secondary/30">
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="py-4 font-bold text-muted-foreground">Shop</TableHead>
                <TableHead className="py-4 font-bold text-muted-foreground">Status</TableHead>
                <TableHead className="py-4 font-bold text-muted-foreground">Sub Type</TableHead>
                <TableHead className="py-4 font-bold text-muted-foreground text-right">Amount (Tsh)</TableHead>
                <TableHead className="py-4 font-bold text-muted-foreground text-center">Payment Date</TableHead>
                <TableHead className="py-4 font-bold text-muted-foreground text-center">Start Date</TableHead>
                <TableHead className="py-4 font-bold text-muted-foreground text-center">End Date</TableHead>
                <TableHead className="py-4 font-bold text-muted-foreground text-center">Access</TableHead>
                <TableHead className="py-4 font-bold text-muted-foreground text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-border">
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-20 text-muted-foreground">
                    <div className="flex flex-col items-center gap-3">
                      <Store className="w-10 h-10 opacity-20" />
                      <p className="text-sm font-medium opacity-50">No shops found</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((shop) => {
                  const cfg = statusConfig[shop.subscriptionStatus] ?? statusConfig.unpaid;
                  const StatusIcon = cfg.icon;
                  const days = shop.subscriptionRemainingDays;
                  const isExpiringSoon = shop.subscriptionStatus === 'active' && days !== null && days <= 30;

                  return (
                    <TableRow key={shop.id} className={cn("transition-all group", cfg.row)}>
                      <TableCell className="p-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">
                            {shop.name}
                          </span>
                          <span className="text-xs text-muted-foreground">{shop.location || "—"}</span>
                        </div>
                      </TableCell>

                      <TableCell className="p-4">
                        <Badge className={cn("capitalize text-xs border font-bold gap-1.5", cfg.badge)}>
                          <StatusIcon className="w-3 h-3" />
                          {cfg.label}
                        </Badge>
                      </TableCell>

                      <TableCell className="p-4">
                        <span className="text-sm text-foreground font-medium">
                          {shop.subscriptionType === "6_months" ? "6 Months"
                          : shop.subscriptionType === "1_year" ? "1 Year"
                          : shop.subscriptionType === "custom" ? "Custom"
                          : <span className="text-muted-foreground italic">Not Set</span>}
                        </span>
                      </TableCell>

                      <TableCell className="p-4 text-right">
                        <span className="font-mono font-bold text-foreground">
                          {shop.subscriptionAmount > 0 ? shop.subscriptionAmount.toLocaleString() : <span className="text-muted-foreground">—</span>}
                        </span>
                      </TableCell>

                      <TableCell className="p-4 text-center">
                        <span className="text-sm text-foreground">{shop.paymentDate ?? <span className="text-muted-foreground">—</span>}</span>
                      </TableCell>

                      <TableCell className="p-4 text-center">
                        <span className="text-sm text-foreground">{shop.subscriptionStartDate ?? <span className="text-muted-foreground">—</span>}</span>
                      </TableCell>

                      <TableCell className="p-4 text-center">
                        <div className="flex flex-col items-center">
                          <span className={cn("text-sm font-bold", isExpiringSoon ? "text-amber-500" : "text-foreground")}>
                            {shop.subscriptionEndDate ?? <span className="text-muted-foreground font-normal">—</span>}
                          </span>
                          {isExpiringSoon && (
                            <span className="text-[9px] font-bold text-amber-500 uppercase">Expires in {days}d</span>
                          )}
                          {days !== null && days < 0 && (
                            <span className="text-[9px] font-bold text-rose-500 uppercase">Expired</span>
                          )}
                        </div>
                      </TableCell>

                      <TableCell className="p-4 text-center">
                        <Badge
                          className={cn(
                            "text-xs border font-bold",
                            shop.status === "active"
                              ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                              : "bg-rose-500/10 text-rose-600 border-rose-500/20"
                          )}
                        >
                          {shop.status === "active" ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>

                      <TableCell className="p-4 text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setManagingShop(shop)}
                          className="h-8 gap-1.5 px-3 bg-primary/5 hover:bg-primary/10 border-primary/20 text-primary font-bold text-xs"
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                          Manage
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {managingShop && (
        <ManageSubscriptionDialog
          shop={managingShop}
          open={!!managingShop}
          onOpenChange={(open) => !open && setManagingShop(null)}
        />
      )}
    </AppLayout>
  );
};

export default AdminManagementPage;
