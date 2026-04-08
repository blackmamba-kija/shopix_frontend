import { AppLayout } from "@/components/layout/AppLayout";
import { useStore } from "@/store/useStore";
import { Badge } from "@/components/ui/badge";
import { AddServiceSaleDialog } from "@/components/forms/AddServiceSaleDialog";
import { ImportDialog } from "@/components/forms/ImportDialog";
import { usePermissions } from "@/hooks/useAuth";
import { Printer, Search, Filter, Calendar as CalendarIcon, DollarSign, TrendingUp, History, FileSpreadsheet } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatCard } from "@/components/dashboard/StatCard";
import { useLanguage } from "@/hooks/useLanguage";
import { useRef } from "react";

const ServicesPage = () => {
  const { formatTsh, t } = useLanguage();
  const allServiceSales = useStore((s) => s.serviceSales);
  const allShops = useStore((s) => s.shops);
  const { can, isAdmin, canAccessShop } = usePermissions();

  // State for filters
  const [search, setSearch] = useState("");
  const globalShopId = useStore((s) => s.selectedShopId);
  const setSelectedShopId = useStore((s) => s.setSelectedShopId);
  const selectedShop = globalShopId;
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");

  const dateFromRef = useRef<HTMLInputElement>(null);
  const dateToRef = useRef<HTMLInputElement>(null);

  const serviceSales = (allServiceSales || []).filter(s =>
    s && s.shopId &&
    (selectedShop === "all" || String(s.shopId) === String(selectedShop))
  );
  const shops = (allShops || []).filter(s => s && s.id);
  const canRecordServices = isAdmin || can("record_services");

  const today = new Date().toISOString().split('T')[0];
  const todayItems = serviceSales.filter(s => s.date === today);
  const todayRevenue = todayItems.reduce((sum, s) => sum + Number(s.total || 0), 0);

  const filtered = serviceSales.filter((s) => {
    const matchesSearch = s.serviceName.toLowerCase().includes(search.toLowerCase());
    const matchesDateFrom = !dateFrom || s.date >= dateFrom;
    const matchesDateTo = !dateTo || s.date <= dateTo;
    const matchesMinAmount = !minAmount || Number(s.total) >= parseFloat(minAmount);
    const matchesMaxAmount = !maxAmount || Number(s.total) <= parseFloat(maxAmount);
    return matchesSearch && matchesDateFrom && matchesDateTo && matchesMinAmount && matchesMaxAmount;
  });

  const getShop = (shopId: string) => shops.find((s) => s.id === shopId);

  return (
    <AppLayout title={t("service sales")} subtitle={t("printing, photocopy, and custom services")}>
      <div className="flex flex-col gap-6">
        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard title={t("today's services")} value={todayItems.length.toString()} icon={History} change={t("records added today")} changeType="neutral" />
          {isAdmin && (
            <>
              <StatCard title={t("today's earnings")} value={formatTsh(todayRevenue)} icon={DollarSign} change={t("cash collected today")} changeType="positive" />
              <StatCard title={t("filtered total")} value={formatTsh(filtered.reduce((sum, s) => sum + Number(s.total || 0), 0))} icon={TrendingUp} change={`${filtered.length} entries matching filters`} changeType="neutral" />
            </>
          )}
          {!isAdmin && (
            <StatCard title={t("active volume")} value={filtered.length.toString()} icon={TrendingUp} change={t("total filtered entries")} changeType="neutral" />
          )}
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          {/* Filters Bar */}
          <div className="flex flex-wrap items-center gap-3 bg-card border border-border p-3 rounded-xl w-full md:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder={t("search...")} className="pl-9 h-9 bg-secondary/50 border-none font-bold" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>

            <Select value={selectedShop} onValueChange={setSelectedShopId}>
              <SelectTrigger className="w-full sm:w-44 h-9 bg-secondary/50 border-none font-bold">
                <SelectValue placeholder={t("all shops")} />
              </SelectTrigger>
              <SelectContent>
                {isAdmin && <SelectItem value="all">{t("all shops")}</SelectItem>}
                {shops.map(s => <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>)}
              </SelectContent>
            </Select>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-36 group cursor-pointer" onClick={() => (dateFromRef.current as any)?.showPicker?.()}>
                <CalendarIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-primary transition-colors group-hover:text-primary-foreground pointer-events-none" />
                <Input
                  ref={dateFromRef}
                  type="date"
                  className="pl-9 h-9 text-xs cursor-pointer hover:bg-primary/5 transition-colors bg-secondary/50 border-none font-bold"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                />
              </div>
              <span className="text-muted-foreground font-bold uppercase text-[10px]">{t("to")}</span>
              <div className="relative flex-1 sm:w-36 group cursor-pointer" onClick={() => (dateToRef.current as any)?.showPicker?.()}>
                <CalendarIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-primary transition-colors group-hover:text-primary-foreground pointer-events-none" />
                <Input
                  ref={dateToRef}
                  type="date"
                  className="pl-9 h-9 text-xs cursor-pointer hover:bg-primary/5 transition-colors bg-secondary/50 border-none font-bold"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Input placeholder="Min" type="number" className="w-full sm:w-24 h-9 text-xs bg-secondary/50 border-none font-bold" value={minAmount} onChange={(e) => setMinAmount(e.target.value)} />
              <Input placeholder="Max" type="number" className="w-full sm:w-24 h-9 text-xs bg-secondary/50 border-none font-bold" value={maxAmount} onChange={(e) => setMaxAmount(e.target.value)} />
            </div>

            {(search || selectedShop !== "all" || dateFrom || dateTo || minAmount || maxAmount) && (
              <Button variant="ghost" size="sm" onClick={() => { setSearch(""); setSelectedShopId("all"); setDateFrom(""); setDateTo(""); setMinAmount(""); setMaxAmount(""); }} className="h-9 px-3 font-bold uppercase transition-all hover:bg-destructive/10 hover:text-destructive">
                {t("clear")}
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {canRecordServices && (
              <>
                <ImportDialog 
                  type="services" 
                  trigger={
                    <Button variant="outline" className="h-10 rounded-xl shadow-sm gap-2 px-4 border-border hover:bg-secondary transition-all shrink-0 font-bold">
                      <FileSpreadsheet className="w-4 h-4 text-primary" /> {t("import")}
                    </Button>
                  }
                />
                <AddServiceSaleDialog />
              </>
            )}
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/30">
                  <th className="text-left p-4 text-[10px] font-bold text-muted-foreground tracking-wider uppercase">{t("service")}</th>
                  <th className="text-left p-4 text-[10px] font-bold text-muted-foreground tracking-wider uppercase">{t("shop")}</th>
                  <th className="text-left p-4 text-[10px] font-bold text-muted-foreground tracking-wider uppercase">{t("date & time")}</th>
                  <th className="text-right p-4 text-[10px] font-bold text-muted-foreground tracking-wider uppercase">{t("qty")}</th>
                  <th className="text-right p-4 text-[10px] font-bold text-muted-foreground tracking-wider uppercase">{t("unit price")}</th>
                  <th className="text-right p-4 text-[10px] font-bold text-muted-foreground tracking-wider uppercase">{t("total")}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center text-muted-foreground py-16">
                      <div className="flex flex-col items-center gap-2">
                        <Filter className="w-8 h-8 opacity-20" />
                        <p>{t("no service sales match your current filters.")}</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filtered.map((s) => {
                    const shop = getShop(s.shopId);
                    return (
                      <tr key={s.id} className="border-b border-border last:border-0 hover:bg-secondary/20 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                              <Printer className="w-4 h-4 text-primary" />
                            </div>
                            <span className="font-semibold text-foreground">{s.serviceName}</span>
                          </div>
                        </td>
                        <td className="p-4"><Badge variant="outline" className="font-medium">{shop?.name}</Badge></td>
                        <td className="p-4 text-muted-foreground font-medium">
                          <div>{s.date}</div>
                          <div className="text-[10px] opacity-70">{s.time}</div>
                        </td>
                        <td className="p-4 text-right text-foreground font-medium">{s.quantity}</td>
                        <td className="p-4 text-right text-muted-foreground font-mono">{formatTsh(s.pricePerUnit)}</td>
                        <td className="p-4 text-right">
                          <span className="font-bold text-lg text-foreground">{formatTsh(s.total)}</span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default ServicesPage;
