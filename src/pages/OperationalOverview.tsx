import { useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useStore } from "@/store/useStore";
import {
    TrendingUp,
    Package,
    DollarSign,
    Layers,
    Calendar,
    AlertCircle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/hooks/useLanguage";

const OperationalOverview = () => {
    const { sales, products, shops, expenses, fetchExpenses, selectedShopId } = useStore();
    const navigate = useNavigate();
    const { t } = useLanguage();

    useEffect(() => {
        fetchExpenses();
    }, [fetchExpenses]);

    const today = format(new Date(), "yyyy-MM-dd");

    const shopFilter = (item: any) => selectedShopId === "all" || String(item.shopId) === String(selectedShopId);

    const filteredSales = sales.filter(s => s.date === today && shopFilter(s));
    const filteredExpenses = expenses.filter(e => e.date === today && shopFilter(e));
    const filteredProducts = products.filter(p => shopFilter(p));

    const totalRevenue = filteredSales.reduce((sum, s) => sum + s.totalCost, 0);
    const totalSalesProfit = filteredSales.reduce((sum, s) => sum + s.profit, 0);
    const totalExpenses = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
    const netProfit = totalSalesProfit - totalExpenses;
    const totalStock = filteredProducts.reduce((sum, p) => sum + p.quantity, 0);
    const totalValue = filteredProducts.reduce((sum, p) => sum + p.quantity * p.buyingCost, 0);

    const lowStockCount = filteredProducts.filter(p => p.quantity < 10).length;

    return (
        <AppLayout title={t("operational summary")} subtitle={t("daily business metrics and stock visibility")}>
            <div className="space-y-6">
                {/* Status Header */}
                <div className="flex items-center justify-between bg-blue-600/10 border border-blue-600/20 p-4 rounded-xl">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-600 p-2 rounded-lg">
                            <Calendar className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-blue-600 dark:text-blue-400 leading-tight">{t("operational status")}</p>
                            <p className="text-xs text-blue-500 dark:text-blue-300 font-medium font-sans">{t("monitoring data for")} {format(new Date(), "MMMM dd, yyyy")}</p>
                        </div>
                    </div>
                    <Badge className="bg-blue-600 hover:bg-blue-700 font-bold px-3 py-1">{t("live data")}</Badge>
                </div>

                {/* Global Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card
                        className="bg-card border border-blue-200/50 shadow-sm overflow-hidden relative group cursor-pointer hover:ring-2 hover:ring-blue-500/20 transition-all active:scale-[0.98]"
                        onClick={() => navigate("/sales")}
                    >
                        <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full -mr-8 -mt-8 group-hover:bg-blue-500/10 transition-colors" />
                        <CardContent className="p-6">
                            <div className="p-2 bg-blue-500/10 w-fit rounded-lg mb-2">
                                <TrendingUp className="w-6 h-6 text-blue-600" />
                            </div>
                            <p className="text-muted-foreground text-[10px] font-black uppercase tracking-widest">{t("today's revenue")}</p>
                            <h3 className="text-2xl font-black mt-1 text-foreground">
                                {totalRevenue.toLocaleString()} <span className="text-xs font-medium text-muted-foreground/60">Tsh</span>
                            </h3>
                            <p className="text-[10px] text-blue-600 font-bold mt-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                {t("view sales details")} &rarr;
                            </p>
                        </CardContent>
                    </Card>

                    <Card
                        className="bg-card border border-emerald-200/50 shadow-sm overflow-hidden relative group cursor-pointer hover:ring-2 hover:ring-emerald-500/20 transition-all active:scale-[0.98]"
                        onClick={() => navigate("/sales")}
                    >
                        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full -mr-8 -mt-8 group-hover:bg-emerald-500/10 transition-colors" />
                        <CardContent className="p-6">
                            <div className="p-2 bg-emerald-500/10 w-fit rounded-lg mb-2">
                                <DollarSign className="w-6 h-6 text-emerald-600" />
                            </div>
                            <p className="text-muted-foreground text-[10px] font-black uppercase tracking-widest">{t("today's profit")}</p>
                            <h3 className="text-2xl font-black mt-1 text-foreground">
                                {netProfit.toLocaleString()} <span className="text-xs font-medium text-muted-foreground/60">Tsh</span>
                            </h3>
                            <p className="text-[10px] text-emerald-600 font-bold mt-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                {t("view profit analysis")} &rarr;
                            </p>
                        </CardContent>
                    </Card>

                    <Card
                        className="bg-card border border-rose-200/50 shadow-sm overflow-hidden relative group cursor-pointer hover:ring-2 hover:ring-rose-500/20 transition-all active:scale-[0.98]"
                        onClick={() => navigate("/expenses")}
                    >
                        <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-full -mr-8 -mt-8 group-hover:bg-rose-500/10 transition-colors" />
                        <CardContent className="p-6">
                            <div className="p-2 bg-rose-500/10 w-fit rounded-lg mb-2">
                                <DollarSign className="w-6 h-6 text-rose-600" />
                            </div>
                            <p className="text-muted-foreground text-[10px] font-black uppercase tracking-widest">{t("expenses")}</p>
                            <h3 className="text-2xl font-black mt-1 text-foreground">
                                {totalExpenses.toLocaleString()} <span className="text-xs font-medium text-muted-foreground/60">Tsh</span>
                            </h3>
                            <p className="text-[10px] text-rose-600 font-bold mt-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                {t("view expenses")} &rarr;
                            </p>
                        </CardContent>
                    </Card>

                    <Card
                        className="bg-card border border-indigo-200/50 shadow-sm overflow-hidden relative group cursor-pointer hover:ring-2 hover:ring-indigo-500/20 transition-all active:scale-[0.98]"
                        onClick={() => navigate("/inventory")}
                    >
                        <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full -mr-8 -mt-8 transition-colors" />
                        <CardContent className="p-6">
                            <div className="p-2 bg-indigo-500/10 w-fit rounded-lg mb-2">
                                <Package className="w-6 h-6 text-indigo-600" />
                            </div>
                            <p className="text-muted-foreground text-[10px] font-black uppercase tracking-widest">{t("inventory cost")}</p>
                            <h3 className="text-2xl font-black mt-1 text-foreground tracking-tight">
                                {totalValue.toLocaleString()} <span className="text-xs font-medium text-muted-foreground/60">Tsh</span>
                            </h3>
                            <p className="text-[10px] text-indigo-600 font-bold mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                {t("full asset valuation")} &rarr;
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Visibility Details */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <Card className="lg:col-span-2 border-none shadow-md overflow-hidden bg-card">
                        <CardHeader className="bg-muted/30 border-b border-border">
                            <CardTitle className="text-base font-bold flex items-center gap-2">
                                <Package className="w-4 h-4 text-primary" /> {t("stock health overview")}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="space-y-8">
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <p className="text-xs font-bold text-muted-foreground uppercase">{t("stock utilization rate")}</p>
                                        <span className="text-xs font-bold text-foreground">72%</span>
                                    </div>
                                    <Progress value={72} className="h-2 bg-muted" />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div
                                        className="p-4 bg-muted/20 rounded-xl border border-border cursor-pointer hover:bg-muted/30 transition-colors"
                                        onClick={() => navigate("/inventory")}
                                    >
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">{t("items monitored")}</p>
                                        <p className="text-xl font-black text-foreground">{filteredProducts.length}</p>
                                    </div>
                                    <div
                                        className={`p-4 rounded-xl border cursor-pointer transition-all active:scale-95 ${lowStockCount > 0 ? 'bg-amber-50 border-amber-100 hover:bg-amber-100' : 'bg-green-50 border-green-100 hover:bg-green-100'}`}
                                        onClick={() => navigate("/inventory")}
                                    >
                                        <div className="flex items-center gap-2 mb-1">
                                            <AlertCircle className={`w-3 h-3 ${lowStockCount > 0 ? 'text-amber-600' : 'text-green-600'}`} />
                                            <p className={`text-[10px] font-bold uppercase tracking-wider ${lowStockCount > 0 ? 'text-amber-500' : 'text-green-500'}`}>{t("low stock alerts")}</p>
                                        </div>
                                        <p className={`text-xl font-black ${lowStockCount > 0 ? 'text-amber-700' : 'text-green-700'}`}>{lowStockCount}</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-md overflow-hidden bg-card">
                        <CardHeader className="bg-muted/30 border-b border-border">
                            <CardTitle className="text-base font-bold flex items-center gap-2">
                                <TrendingUp className="w-4 h-4 text-emerald-600" /> {t("performance")}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 flex flex-col items-center justify-center h-full">
                            <div className="relative w-32 h-32 flex items-center justify-center">
                                <svg className="w-full h-full transform -rotate-90">
                                    <circle
                                        cx="64"
                                        cy="64"
                                        r="58"
                                        stroke="currentColor"
                                        strokeWidth="8"
                                        fill="transparent"
                                        className="text-muted/30"
                                    />
                                    <circle
                                        cx="64"
                                        cy="64"
                                        r="58"
                                        stroke="currentColor"
                                        strokeWidth="8"
                                        strokeDasharray={364}
                                        strokeDashoffset={364 - (364 * 85) / 100}
                                        strokeLinecap="round"
                                        fill="transparent"
                                        className="text-blue-600"
                                    />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <p className="text-2xl font-black text-foreground">85%</p>
                                    <p className="text-[8px] font-bold text-muted-foreground uppercase">{t("target")}</p>
                                </div>
                            </div>
                            <p className="text-[11px] text-muted-foreground text-center mt-6 font-medium max-w-[200px]">
                                {t("currently performing at 85% of today's expected operational volume.")}
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
};

export default OperationalOverview;
