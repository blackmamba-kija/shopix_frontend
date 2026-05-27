import { AppLayout } from "@/components/layout/AppLayout";
import { useStore } from "@/store/useStore";
import { useLanguage } from "@/hooks/useLanguage";
import { Store, Calendar, Zap, CreditCard, ShieldCheck, MapPin, Building2, Info, ArrowUpRight } from "lucide-react";
import { usePermissions } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export default function BusinessHub() {
  const { t } = useLanguage();
  const { shops: shopsRaw, selectedShopId } = useStore();
  const { isAdmin } = usePermissions();

  const selectedShop = shopsRaw.find(s => String(s.id) === selectedShopId);

  return (
    <AppLayout 
      title={t("business hub")} 
      subtitle={t("central management for your retail identity and subscriptions")}
    >
      {!selectedShop ? (
        <div className="bg-card border border-border border-dashed rounded-3xl p-12 text-center animate-in fade-in zoom-in duration-500">
          <Store className="w-16 h-16 text-muted-foreground/20 mx-auto mb-4" />
          <h3 className="font-black text-xl italic uppercase tracking-tight">{t("no shop selected")}</h3>
          <p className="text-sm text-muted-foreground mt-2 max-w-sm mx-auto font-medium">
            {t("please select a specific shop from the top bar to view its business intelligence and subscription details.")}
          </p>
        </div>
      ) : (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          {/* Hero Section: Shop Identity */}
          <div className="relative overflow-hidden rounded-[2.5rem] bg-secondary/30 border border-border/50 p-8 md:p-12">
            <div className="absolute top-0 right-0 w-[40%] h-full bg-gradient-to-l from-primary/10 to-transparent blur-3xl pointer-events-none" />
            
            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-8">
              <div className="w-32 h-32 bg-white rounded-3xl p-2 shadow-2xl border-4 border-white/40 flex items-center justify-center shrink-0">
                <img 
                  src={selectedShop.logo ? `/uploads/${selectedShop.logo}` : "/shopix-logo.png"} 
                  alt={selectedShop.name}
                  className="w-full h-full object-contain"
                  onError={(e) => { (e.target as HTMLImageElement).src = "/shopix-logo.png" }}
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                    <h2 className="text-4xl font-black italic tracking-tighter uppercase leading-none">{selectedShop.name}</h2>
                    <div className={cn(
                        "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border",
                        selectedShop.status === "active" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600" : "bg-rose-500/10 border-rose-500/20 text-rose-600"
                    )}>
                        {t(selectedShop.status)}
                    </div>
                </div>
                <div className="flex flex-wrap items-center gap-6 pt-2">
                   <div className="flex items-center gap-2 text-muted-foreground font-bold text-sm">
                      <MapPin className="w-4 h-4 text-primary" /> {selectedShop.location}
                   </div>
                   <div className="flex items-center gap-2 text-muted-foreground font-bold text-sm">
                      <Building2 className="w-4 h-4 text-primary" /> {t(selectedShop.type)}
                   </div>
                   <div className="flex items-center gap-2 text-muted-foreground font-bold text-sm">
                      <Calendar className="w-4 h-4 text-primary" /> {t("started")}: {new Date(selectedShop.createdAt || Date.now()).toLocaleDateString()}
                   </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
             {/* Left Column: Subscription & Plan */}
             <div className="lg:col-span-2 space-y-8">
                <div className="bg-card border border-border overflow-hidden rounded-[2rem] shadow-sm">
                    <div className="p-6 border-b border-border/50 bg-secondary/20 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <Zap className="w-5 h-5 text-primary" />
                            <h4 className="font-black italic uppercase tracking-tight text-sm">{t("subscription intelligence")}</h4>
                        </div>
                        <div className={cn(
                            "px-4 py-1 rounded-lg text-[10px] font-black uppercase tracking-[0.2em] shadow-sm",
                            selectedShop.subscriptionStatus === "active" ? "bg-emerald-500 text-white" : 
                            selectedShop.subscriptionStatus === "expired" ? "bg-rose-500 text-white" : "bg-amber-500 text-white"
                        )}>
                            {t(selectedShop.subscriptionStatus || "pending")}
                        </div>
                    </div>
                    <div className="p-8">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                            <div className="space-y-4">
                                <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">{t("days remaining")}</p>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-6xl font-black italic tracking-tighter text-primary">{selectedShop.subscriptionRemainingDays ?? 0}</span>
                                    <span className="text-lg font-black italic text-muted-foreground uppercase">{t("days")}</span>
                                </div>
                                <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                                   <div 
                                      className="h-full bg-primary transition-all duration-1000" 
                                      style={{ width: `${Math.min(100, (selectedShop.subscriptionRemainingDays ?? 0) / 3.65)}%` }} 
                                   />
                                </div>
                            </div>

                            <div className="md:col-span-2 grid grid-cols-2 gap-8">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">{t("plan type")}</p>
                                    <p className="text-xl font-bold italic uppercase">{t(selectedShop.subscriptionType || "standard_license")}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">{t("expiry date")}</p>
                                    <p className="text-xl font-bold italic text-rose-600">{selectedShop.subscriptionEndDate ? new Date(selectedShop.subscriptionEndDate).toLocaleDateString() : t("not_set")}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">{t("subscription start")}</p>
                                    <p className="text-sm font-bold text-foreground">{selectedShop.subscriptionStartDate ? new Date(selectedShop.subscriptionStartDate).toLocaleDateString() : "—"}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">{t("last payment")}</p>
                                    <p className="text-sm font-bold text-foreground">{selectedShop.paymentDate ? new Date(selectedShop.paymentDate).toLocaleDateString() : "—"}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Additional Info Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-3xl p-6 relative overflow-hidden group">
                      <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all" />
                      <div className="flex items-start gap-4">
                         <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-600"><ShieldCheck className="w-6 h-6" /></div>
                         <div className="space-y-1">
                            <h5 className="font-black uppercase tracking-tight text-sm italic">{t("legal compliance")}</h5>
                            <p className="text-xs text-muted-foreground font-medium leading-relaxed">{t("your shop is fully compliant with the SHOPIX platform standards for the 2026 fiscal cycle.")}</p>
                         </div>
                      </div>
                   </div>
                   <div className="bg-primary/5 border border-primary/20 rounded-3xl p-6 relative overflow-hidden group">
                      <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-all" />
                      <div className="flex items-start gap-4">
                         <div className="p-3 bg-primary/10 rounded-2xl text-primary"><CreditCard className="w-6 h-6" /></div>
                         <div className="space-y-1">
                            <h5 className="font-black uppercase tracking-tight text-sm italic">{t("payment security")}</h5>
                            <p className="text-xs text-muted-foreground font-medium leading-relaxed">{t("all transactions and subscription payments are secured via encrypted cloud settlement protocols.")}</p>
                         </div>
                      </div>
                   </div>
                </div>
             </div>

             {/* Right Column: Mini Info / Support */}
             <div className="space-y-8">
                <div className="bg-secondary p-8 rounded-[2rem] space-y-6">
                   <div className="flex items-center gap-2">
                       <Info className="w-4 h-4 text-primary" />
                       <h4 className="font-black italic uppercase tracking-tighter text-sm">{t("business help")}</h4>
                   </div>
                   <p className="text-xs text-muted-foreground font-bold leading-relaxed">
                      {t("view detailed records of your business license and subscription history. this information is synced directly from the central administration node.")}
                   </p>
                   <div className="pt-4 space-y-3">
                      <Button variant="outline" className="w-full justify-between font-black uppercase italic tracking-widest text-[10px] h-11 rounded-xl">
                        {t("view invoice history")}
                        <ArrowUpRight className="w-3 h-3" />
                      </Button>
                      <Button className="w-full justify-between font-black uppercase italic tracking-widest text-[10px] h-11 rounded-xl">
                        {t("renew subscription")}
                        <Zap className="w-3 h-3 fill-current" />
                      </Button>
                   </div>
                </div>

                <div className="bg-card border border-border rounded-[2rem] p-8 text-center space-y-4">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                        <Store className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                        <p className="text-xs font-black uppercase text-muted-foreground tracking-widest mb-1">{t("shop id")}</p>
                        <p className="text-sm font-mono font-black text-primary">{selectedShop.id}</p>
                    </div>
                </div>
             </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
