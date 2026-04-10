import { AppLayout } from "@/components/layout/AppLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { DollarSign, ShoppingCart, TrendingUp, Package, AlertTriangle, Clock, Activity, BarChart3, PieChart as PieChartIcon, Layers, CheckCircle, ArrowUpRight, ShieldCheck, Zap } from "lucide-react";
import { useStore } from "@/store/useStore";
import { usePermissions } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, PieChart, Pie, Cell, Legend
} from "recharts";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Dashboard = () => {
  const allProducts = useStore((s) => s.products);
  const allSales = useStore((s) => s.sales);
  const allServiceSales = useStore((s) => s.serviceSales);
  const allShops = useStore((s) => s.shops);
  const selectedShopId = useStore((s) => s.selectedShopId);
  const { user, isAdmin, canAccessShop } = usePermissions();
  const { t } = useLanguage();

  const products = (allProducts || []).filter(p =>
    p && p.shopId && (selectedShopId === "all" || String(p.shopId) === String(selectedShopId))
  );
  const sales = (allSales || []).filter(s =>
    s && s.shopId && (selectedShopId === "all" || String(s.shopId) === String(selectedShopId))
  );
  const serviceSales = (allServiceSales || []).filter(s =>
    s && s.shopId && (selectedShopId === "all" || String(s.shopId) === String(selectedShopId))
  );

  const lowStockProducts = products.filter((p) => p.quantity > 0 && p.quantity <= 10);
  const outOfStockProducts = products.filter((p) => p.quantity === 0);
  
  const todayDateStr = new Date().toISOString().split("T")[0];
  const todaySales = sales.filter((s) => s.date === todayDateStr);
  const todayServices = serviceSales.filter((s) => s.date === todayDateStr);

  const totalRevenue = todaySales.reduce((sum, s) => sum + Number(s.totalCost || 0), 0) +
    todayServices.reduce((sum, s) => sum + Number(s.total || 0), 0);

  const totalProfit = todaySales.reduce((sum, s) => sum + Number(s.profit || 0), 0) +
    todayServices.reduce((sum, s) => sum + Number(s.total || 0), 0);

  // 1. Inventory Health Data
  const outOfStock = outOfStockProducts.length;
  const lowStock = lowStockProducts.length;
  const healthyStock = products.filter(p => p.quantity > 10).length;

  const inventoryHealthData = [
    { name: t("healthy"), value: healthyStock, color: "hsl(142, 71%, 45%)" },
    { name: t("low"), value: lowStock, color: "hsl(38, 92%, 50%)" },
    { name: t("out"), value: outOfStock, color: "hsl(0, 84%, 60%)" }
  ];

  // 2. Sales vs Services (All Time)
  const productTotal = sales.reduce((sum, s) => sum + Number(s.totalCost || 0), 0);
  const serviceTotal = serviceSales.reduce((sum, s) => sum + Number(s.total || 0), 0);

  const revenueSourceData = [
    { name: t("product sales"), value: productTotal, color: "hsl(var(--primary))" },
    { name: t("service revenue"), value: serviceTotal, color: "hsl(var(--primary) / 0.4)" }
  ];

  // 3. Weekly Trends
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(new Date().getDate() - (6 - i));
    return d.toISOString().split("T")[0];
  });

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const chartWeeklyData = last7Days.map(dateStr => {
    const daySales = sales.filter(s => s.date === dateStr);
    const dayServices = serviceSales.filter(s => s.date === dateStr);
    return {
      name: weekDays[new Date(dateStr).getDay()],
      sales: daySales.reduce((sum, s) => sum + Number(s.totalCost || 0), 0),
      services: dayServices.reduce((sum, s) => sum + Number(s.total || 0), 0),
    };
  });

  const formatTsh = (v: number) => `Tsh ${v.toLocaleString()}`;

  return (
    <AppLayout title={t("dashboard")} subtitle={`${t("operational control center")} – ${user?.name || 'Admin'}`}>
      <div className="space-y-8">
        
        {/* Welcome Section */}
        <div className="relative group">
           <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent rounded-3xl -m-2 opacity-0 group-hover:opacity-100 transition-opacity blur-xl" />
           <div className="relative bg-card border border-border/40 rounded-3xl p-8 overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl" />
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                <div>
                   <h2 className="text-3xl font-black tracking-tight italic">{t("hello")}, {user?.name.split(' ')[0]}!</h2>
                   <p className="text-muted-foreground font-bold mt-1 text-sm">{t("here is what is happening across your shops today.")}</p>
                </div>
                <div className="flex items-center gap-3">
                   <div className="bg-emerald-500/10 text-emerald-600 px-4 py-2 rounded-2xl flex items-center gap-2 border border-emerald-500/20">
                      <Zap className="w-4 h-4" />
                      <span className="text-xs font-black uppercase tracking-wider">{t("systems online")}</span>
                   </div>
                   <div className="bg-primary text-primary-foreground px-4 py-2 rounded-2xl flex items-center gap-2 shadow-lg shadow-primary/20">
                     <ShieldCheck className="w-4 h-4" />
                     <span className="text-xs font-black uppercase tracking-wider">{isAdmin ? t("admin session") : t("manager session")}</span>
                   </div>
                </div>
              </div>
           </div>
        </div>

        {/* Essential Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title={t("total revenue")} value={formatTsh(totalRevenue)} icon={DollarSign} change={t("today's combined")} changeType="positive" className="bg-card shadow-xl border-none" />
          <StatCard title={t("inventory value")} value={formatTsh(products.reduce((sum, p) => sum + (Number(p.quantity) * Number(p.buyingCost)), 0))} icon={Layers} change={`${products.length} ${t("products")}`} changeType="neutral" className="bg-card shadow-xl border-none" />
          <StatCard title={t("est. profit")} value={formatTsh(totalProfit)} icon={TrendingUp} change={t("today's estimate")} changeType="positive" className="bg-card shadow-xl border-none" />
          <StatCard title={t("critical alerts")} value={(lowStock + outOfStock).toString()} icon={AlertTriangle} change={t("items needing attention")} changeType={lowStock + outOfStock > 0 ? "negative" : "neutral"} className="bg-card shadow-xl border-none" />
        </div>

        {/* Detailed Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Performance Chart */}
            <div className="lg:col-span-2 bg-card border-none shadow-2xl rounded-[2.5rem] p-4 group overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-primary/10 transition-colors" />
              <div className="p-6 pb-2 relative z-10">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-primary/10 rounded-2xl">
                      <BarChart3 className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black tracking-tight italic lowercase">{t("weekly performance")}</h3>
                      <p className="text-[10px] uppercase font-black tracking-[0.2em] text-muted-foreground mt-0.5">{t("combined sales & service revenue")}</p>
                    </div>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={340}>
                  <BarChart data={chartWeeklyData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border) / 0.5)" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 900, fill: "hsl(var(--muted-foreground))" }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 900, fill: "hsl(var(--muted-foreground))" }} tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v} dx={-10} />
                    <Tooltip
                      cursor={{ fill: 'hsl(var(--secondary))', opacity: 0.1 }}
                      contentStyle={{ backgroundColor: "rgba(255, 255, 255, 0.8)", backdropFilter: "blur(12px)", border: "none", borderRadius: "24px", boxShadow: "0 25px 50px -12px rgb(0 0 0 / 0.15)", padding: "16px" }}
                      itemStyle={{ fontWeight: 900, fontSize: "12px", textTransform: "lowercase", fontStyle: "italic" }}
                    />
                    <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ paddingBottom: "20px", fontWeight: 900, fontSize: "10px", textTransform: "uppercase", letterSpacing: "1px" }} />
                    <Bar name={t("product sales")} dataKey="sales" fill="hsl(var(--primary))" radius={[8, 8, 8, 8]} barSize={20} />
                    <Bar name={t("service revenue")} dataKey="services" fill="hsl(var(--primary) / 0.2)" radius={[8, 8, 8, 8]} barSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Revenue Distribution */}
            <div className="bg-card border-none shadow-2xl rounded-[2.5rem] p-8 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-primary/10 transition-colors" />
              <div className="flex items-center gap-3 mb-10 relative z-10">
                <div className="p-3 bg-primary/10 rounded-2xl">
                  <PieChartIcon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-black tracking-tight italic lowercase">{t("revenue sources")}</h3>
                  <p className="text-[10px] uppercase font-black tracking-[0.2em] text-muted-foreground mt-0.5">{t("contribution by type")}</p>
                </div>
              </div>
              <div className="relative flex justify-center py-4">
                 <ResponsiveContainer width="100%" height={240}>
                    <PieChart>
                      <Pie
                        data={revenueSourceData}
                        innerRadius={70}
                        outerRadius={95}
                        paddingAngle={10}
                        dataKey="value"
                        stroke="none"
                      >
                        {revenueSourceData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ backgroundColor: "rgba(255, 255, 255, 0.8)", backdropFilter: "blur(12px)", border: "none", borderRadius: "20px" }}
                        formatter={(v: number) => formatTsh(v)}
                      />
                    </PieChart>
                 </ResponsiveContainer>
                 <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <p className="text-[10px] font-black uppercase text-muted-foreground opacity-50">{t("total")}</p>
                    <p className="text-xl font-black tracking-tighter">{( (productTotal + serviceTotal) / 1000).toFixed(1)}k</p>
                 </div>
              </div>
              <div className="mt-10 space-y-4">
                <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-2xl border border-border/40">
                  <div className="flex items-center gap-3">
                     <div className="w-2 h-2 rounded-full bg-primary" />
                     <span className="text-xs font-black uppercase tracking-wider text-muted-foreground">{t("products")}</span>
                  </div>
                  <span className="text-sm font-black italic">{((productTotal / (productTotal + serviceTotal || 1)) * 100).toFixed(1)}%</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-2xl border border-border/40">
                   <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-primary opacity-20" />
                      <span className="text-xs font-black uppercase tracking-wider text-muted-foreground">{t("services")}</span>
                   </div>
                   <span className="text-sm font-black italic">{((serviceTotal / (productTotal + serviceTotal || 1)) * 100).toFixed(1)}%</span>
                </div>
              </div>
            </div>
          </div>

        {/* Inventory & Operational Pulse */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Inventory Health Radar */}
          <div className="bg-card border-none shadow-2xl rounded-[2.5rem] p-8">
            <div className="flex items-center gap-3 mb-10">
              <div className="p-3 bg-primary/10 rounded-2xl">
                <Package className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-black tracking-tight italic lowercase">{t("inventory pulse")}</h3>
                <p className="text-[10px] uppercase font-black tracking-[0.2em] text-muted-foreground mt-0.5">{t("stock availability status")}</p>
              </div>
            </div>
            <div className="space-y-8">
              {inventoryHealthData.map((item) => (
                <div key={item.name} className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{item.name} {t("stock")}</span>
                    <Badge className="bg-secondary text-secondary-foreground border-none font-black text-[9px] px-2 py-0.5 rounded-lg">{item.value} {t("items")}</Badge>
                  </div>
                  <div className="h-4 w-full bg-secondary/50 rounded-2xl overflow-hidden shadow-inner">
                    <div
                      className="h-full transition-all duration-700 ease-out relative"
                      style={{
                        width: `${(item.value / (products.length || 1)) * 100}%`,
                        backgroundColor: item.color
                      }}
                    >
                       <div className="absolute inset-0 bg-white/20 opacity-0 hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-12 p-6 bg-rose-500/5 border border-rose-500/10 rounded-2xl">
              <div className="flex gap-3">
                 <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0" />
                 <p className="text-[11px] text-rose-600 font-bold leading-relaxed italic lowercase">
                    {t("low stock threshold warning")}
                 </p>
              </div>
            </div>
          </div>

          {/* Urgent Actions & Top Items */}
          <div className="lg:col-span-2 space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              {/* Urgent Alerts */}
              <div className="bg-card border-none shadow-2xl rounded-[2.5rem] p-8 h-full">
                <div className="flex items-center justify-between mb-8">
                   <h3 className="text-xl font-black tracking-tight italic lowercase">{t("urgent alerts")}</h3>
                   { (lowStockProducts.length > 0 || outOfStockProducts.length > 0) && (
                      <span className="flex h-3 w-3 relative">
                         <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                         <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
                      </span>
                   )}
                </div>
                <div className="space-y-4">
                  {[...outOfStockProducts, ...lowStockProducts].slice(0, 4).map(p => (
                    <div key={p.id} className={cn("flex items-center gap-4 p-4 rounded-2xl border transition-all hover:scale-[1.02]", p.quantity === 0 ? "bg-rose-50/50 border-rose-100" : "bg-warning/5 border-warning/10")}>
                      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", p.quantity === 0 ? "bg-rose-100 text-rose-600" : "bg-warning/20 text-warning")}>
                        <AlertTriangle className="w-5 h-5" />
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <p className="text-sm font-black text-foreground truncate lowercase leading-none">{p.name}</p>
                        <p className="text-[10px] font-bold text-muted-foreground mt-1 uppercase tracking-wider">{p.quantity === 0 ? t("out of stock") : `${t("only")} ${p.quantity} ${t("remaining")}`}</p>
                      </div>
                    </div>
                  ))}
                  {outOfStockProducts.length === 0 && lowStockProducts.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 opacity-30 text-center">
                      <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
                        <CheckCircle className="w-10 h-10 text-emerald-600" />
                      </div>
                      <p className="text-base font-black italic lowercase">{t("all systems normal")}</p>
                      <p className="text-[10px] font-bold uppercase tracking-widest mt-2">{t("no stock issues detected")}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Today's High Performers */}
              <div className="bg-card border-none shadow-2xl rounded-[2.5rem] p-8 h-full relative overflow-hidden">
                <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="flex items-center justify-between mb-8 relative z-10">
                   <h3 className="text-xl font-black tracking-tight italic lowercase">{t("top items")}</h3>
                   <div className="p-2 bg-primary/10 rounded-lg">
                      <TrendingUp className="w-4 h-4 text-primary" />
                   </div>
                </div>
                <div className="space-y-4 relative z-10">
                  {todaySales.length === 0 && todayServices.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 opacity-30 text-center">
                       <Clock className="w-16 h-16 mb-4" />
                       <p className="text-xs font-black italic lowercase">{t("awaiting transactions")}</p>
                    </div>
                  ) : (
                    ([...todaySales, ...todayServices] as any[])
                      .sort((a, b) => Number(b.totalCost || b.total || 0) - Number(a.totalCost || a.total || 0))
                      .slice(0, 4)
                      .map((item, i) => (
                        <div key={i} className="flex items-center justify-between p-4 bg-secondary/30 rounded-2xl border border-border/40 hover:bg-background transition-colors group">
                          <div className="flex items-center gap-4 overflow-hidden">
                             <div className="w-8 h-8 rounded-full bg-primary/5 border border-primary/10 flex items-center justify-center text-[10px] font-black group-hover:bg-primary group-hover:text-primary-foreground transition-all">0{i+1}</div>
                             <span className="text-sm font-black text-foreground truncate lowercase italic">{item.productName || item.serviceName}</span>
                          </div>
                          <div className="text-right">
                             <span className="text-sm font-black tracking-tighter text-primary">Tsh{(Number(item.totalCost || item.total || 0)).toLocaleString()}</span>
                             <p className="text-[8px] font-black uppercase text-muted-foreground tracking-widest">{t("revenue")}</p>
                          </div>
                        </div>
                      ))
                  )}
                </div>
                { (todaySales.length > 0 || todayServices.length > 0) && (
                   <div className="mt-8 pt-4 border-t border-border/40">
                      <button className="w-full text-[10px] font-black uppercase tracking-widest text-primary hover:tracking-[0.2em] transition-all flex items-center justify-center gap-2 group">
                         {t("view detailed report")}
                         <ArrowUpRight className="w-3 h-3 group-hover:rotate-45 transition-transform" />
                      </button>
                   </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
