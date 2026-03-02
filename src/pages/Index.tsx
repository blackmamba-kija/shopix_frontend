import { AppLayout } from "@/components/layout/AppLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { DollarSign, ShoppingCart, TrendingUp, Package, AlertTriangle, Clock, Activity, BarChart3, PieChart as PieChartIcon, Layers, CheckCircle } from "lucide-react";
import { useStore } from "@/store/useStore";
import { usePermissions } from "@/hooks/useAuth";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, PieChart, Pie, Cell, Legend
} from "recharts";

const Dashboard = () => {
  const allProducts = useStore((s) => s.products);
  const allSales = useStore((s) => s.sales);
  const allServiceSales = useStore((s) => s.serviceSales);
  const allShops = useStore((s) => s.shops);
  const selectedShopId = useStore((s) => s.selectedShopId);
  const { user, canAccessShop } = usePermissions();

  const products = (allProducts || []).filter(p =>
    p && p.shopId && (selectedShopId === "all" || String(p.shopId) === String(selectedShopId))
  );
  const sales = (allSales || []).filter(s =>
    s && s.shopId && (selectedShopId === "all" || String(s.shopId) === String(selectedShopId))
  );
  const serviceSales = (allServiceSales || []).filter(s =>
    s && s.shopId && (selectedShopId === "all" || String(s.shopId) === String(selectedShopId))
  );

  const lowStockProducts = products.filter((p) => p.quantity <= 10);
  const expiringProducts = products.filter((p) => {
    if (!p.expiryDate) return false;
    const diff = new Date(p.expiryDate).getTime() - Date.now();
    return diff < 90 * 24 * 60 * 60 * 1000 && diff > 0;
  });
  const pendingApprovals = products.filter((p) => p.status === "pending");

  const todayDateStr = new Date().toISOString().split("T")[0];
  const todaySales = sales.filter((s) => s.date === todayDateStr);
  const todayServices = serviceSales.filter((s) => s.date === todayDateStr);

  const totalRevenue = todaySales.reduce((sum, s) => sum + Number(s.totalCost || 0), 0) +
    todayServices.reduce((sum, s) => sum + Number(s.total || 0), 0);

  const totalProfit = todaySales.reduce((sum, s) => sum + Number(s.profit || 0), 0) +
    todayServices.reduce((sum, s) => sum + Number(s.total || 0), 0);

  // 1. Inventory Health Data
  const outOfStock = products.filter(p => p.quantity === 0).length;
  const lowStock = products.filter(p => p.quantity > 0 && p.quantity <= 10).length;
  const healthyStock = products.filter(p => p.quantity > 10).length;

  const inventoryHealthData = [
    { name: "Healthy", value: healthyStock, color: "hsl(142, 71%, 45%)" },
    { name: "Low", value: lowStock, color: "hsl(38, 92%, 50%)" },
    { name: "Out", value: outOfStock, color: "hsl(0, 84%, 60%)" }
  ];

  // 2. Sales vs Services (All Time)
  const productTotal = sales.reduce((sum, s) => sum + Number(s.totalCost || 0), 0);
  const serviceTotal = serviceSales.reduce((sum, s) => sum + Number(s.total || 0), 0);

  const revenueSourceData = [
    { name: "Product Sales", value: productTotal, color: "hsl(221, 83%, 53%)" },
    { name: "Service Revenue", value: serviceTotal, color: "hsl(262, 83%, 58%)" }
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

  const formatTsh = (v: number) => `Tsh${v.toLocaleString()}`;

  return (
    <AppLayout title="Dashboard" subtitle={`Performance Overview for ${user?.name || 'Admin'}`}>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard title="Total Revenue" value={formatTsh(totalRevenue)} icon={DollarSign} change="Today's combined" changeType="positive" />
        <StatCard title="Inventory Value" value={formatTsh(products.reduce((sum, p) => sum + (Number(p.quantity) * Number(p.buyingCost)), 0))} icon={Layers} change={`${products.length} products`} changeType="neutral" />
        <StatCard title="Est. Profit" value={formatTsh(totalProfit)} icon={TrendingUp} change="Today's estimate" changeType="positive" />
        <StatCard title="Critical Alerts" value={(lowStock + outOfStock).toString()} icon={AlertTriangle} change="Items needing attention" changeType={lowStock + outOfStock > 0 ? "negative" : "neutral"} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Main Performance Chart */}
        <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              <h3 className="text-sm font-bold text-foreground">Weekly Performance (Sales vs Services)</h3>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartWeeklyData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v} />
              <Tooltip
                cursor={{ fill: 'hsl(var(--secondary))', opacity: 0.4 }}
                contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "12px", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)" }}
              />
              <Legend verticalAlign="top" align="right" iconType="circle" />
              <Bar name="Product Sales" dataKey="sales" fill="hsl(221, 83%, 53%)" radius={[6, 6, 0, 0]} barSize={24} />
              <Bar name="Service Revenue" dataKey="services" fill="hsl(262, 83%, 58%)" radius={[6, 6, 0, 0]} barSize={24} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue Distribution */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <PieChartIcon className="w-5 h-5 text-primary" />
            <h3 className="text-sm font-bold text-foreground">Revenue Source (All Time)</h3>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={revenueSourceData}
                innerRadius={60}
                outerRadius={80}
                paddingAngle={8}
                dataKey="value"
              >
                {revenueSourceData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "12px" }}
                formatter={(v: number) => formatTsh(v)}
              />
              <Legend verticalAlign="bottom" iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-xs font-medium">
              <span className="text-muted-foreground">Products</span>
              <span className="text-foreground">{((productTotal / (productTotal + serviceTotal || 1)) * 100).toFixed(1)}%</span>
            </div>
            <div className="flex justify-between text-xs font-medium">
              <span className="text-muted-foreground">Services</span>
              <span className="text-foreground">{((serviceTotal / (productTotal + serviceTotal || 1)) * 100).toFixed(1)}%</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Inventory Stock Health */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 className="w-5 h-5 text-primary" />
            <h3 className="text-sm font-bold text-foreground">Inventory Health</h3>
          </div>
          <div className="space-y-6">
            {inventoryHealthData.map((item) => (
              <div key={item.name} className="space-y-2">
                <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider">
                  <span className="text-muted-foreground">{item.name} Stock</span>
                  <span className="text-foreground">{item.value} items</span>
                </div>
                <div className="h-3 w-full bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full transition-all duration-500"
                    style={{
                      width: `${(item.value / (products.length || 1)) * 100}%`,
                      backgroundColor: item.color
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 p-4 bg-primary/5 border border-primary/10 rounded-xl">
            <p className="text-[11px] text-primary font-semibold leading-relaxed">
              * Low stock threshold is set to 10 units. Consider restocking items in the "Low" and "Out" categories immediately.
            </p>
          </div>
        </div>

        {/* Actionable Alerts & Top Performers */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm h-full">
              <h3 className="text-sm font-bold text-foreground mb-4">Urgent Alerts</h3>
              <div className="space-y-3">
                {lowStockProducts.slice(0, 3).map(p => (
                  <div key={p.id} className="flex items-center gap-3 p-3 bg-warning/10 border border-warning/20 rounded-xl">
                    <AlertTriangle className="w-4 h-4 text-warning" />
                    <div className="flex-1 overflow-hidden">
                      <p className="text-xs font-bold text-foreground truncate">{p.name}</p>
                      <p className="text-[10px] text-muted-foreground">Only {p.quantity} remaining</p>
                    </div>
                  </div>
                ))}
                {expiringProducts.length === 0 && lowStockProducts.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-6 opacity-40">
                    <CheckCircle className="w-8 h-8 text-success mb-2" />
                    <p className="text-xs font-medium">All systems normal</p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm h-full">
              <h3 className="text-sm font-bold text-foreground mb-4">Today's Top Items</h3>
              <div className="space-y-3">
                {sales.length === 0 && serviceSales.length === 0 ? (
                  <p className="text-xs text-muted-foreground py-10 text-center">No transactions yet today</p>
                ) : (
                  ([...sales, ...serviceSales] as any[])
                    .sort((a, b) => Number(b.totalCost || b.total || 0) - Number(a.totalCost || a.total || 0))
                    .slice(0, 3)
                    .map((item, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-secondary/30 rounded-xl">
                        <span className="text-xs font-bold text-foreground truncate max-w-[120px]">{item.productName || item.serviceName}</span>
                        <span className="text-xs font-black text-primary">Tsh{(Number(item.totalCost || item.total || 0)).toLocaleString()}</span>
                      </div>
                    ))
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
