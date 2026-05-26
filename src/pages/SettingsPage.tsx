import { Link } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Settings, Users, Store, CreditCard, Bell, Palette } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useTheme } from "@/components/theme-provider";
import { useLanguage } from "@/hooks/useLanguage";
import { useStore } from "@/store/useStore";
import { usePermissions } from "@/hooks/useAuth";
import { Zap, Calendar, Heart } from "lucide-react";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const { theme, setTheme, color, setColor } = useTheme();
  const { t } = useLanguage();
  const { shops: shopsRaw, selectedShopId } = useStore();
  const { isAdmin } = usePermissions();

  const selectedShop = shopsRaw.find(s => String(s.id) === selectedShopId);
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success(t("settings saved successfully"));
  };

  return (
    <AppLayout title={t("settings")} subtitle={t("system configuration and preferences")}>
      <div className="max-w-4xl">
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-6 h-auto p-1 bg-secondary rounded-lg mb-6">
            <TabsTrigger value="general" className="py-2.5 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow"><Settings className="w-4 h-4 mr-2 hidden sm:inline" /> {t("general")}</TabsTrigger>
            <TabsTrigger value="users" className="py-2.5 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow"><Users className="w-4 h-4 mr-2 hidden sm:inline" /> {t("users")}</TabsTrigger>
            <TabsTrigger value="shops" className="py-2.5 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow"><Store className="w-4 h-4 mr-2 hidden sm:inline" /> {t("shops")}</TabsTrigger>
            <TabsTrigger value="currency" className="py-2.5 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow"><CreditCard className="w-4 h-4 mr-2 hidden sm:inline" /> {t("billing")}</TabsTrigger>
            {!isAdmin && (
              <TabsTrigger value="subscription" className="py-2.5 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow"><Zap className="w-4 h-4 mr-2 hidden sm:inline" /> {t("subscription")}</TabsTrigger>
            )}
            <TabsTrigger value="notifications" className="py-2.5 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow"><Bell className="w-4 h-4 mr-2 hidden sm:inline" /> {t("alerts")}</TabsTrigger>
            <TabsTrigger value="appearance" className="py-2.5 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow"><Palette className="w-4 h-4 mr-2 hidden sm:inline" /> {t("theme")}</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-6 mt-0 animate-in fade-in slide-in-from-bottom-2">
            <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-bold mb-4">{t("system settings")}</h3>
              <form onSubmit={handleSave} className="space-y-4 max-w-lg">
                <div className="space-y-2">
                  <Label>{t("company name")}</Label>
                  <Input defaultValue="SHOPIX" />
                </div>
                <div className="space-y-2">
                  <Label>{t("contact email")}</Label>
                  <Input type="email" defaultValue="admin@shopix.com" />
                </div>
                <div className="flex items-center justify-between pt-2">
                  <div className="space-y-0.5">
                    <Label className="text-base text-foreground">{t("maintenance mode")}</Label>
                    <p className="text-sm text-muted-foreground">{t("temporarily disable access to the system.")}</p>
                  </div>
                  <Switch />
                </div>
                <div className="pt-4 border-t border-border flex justify-end">
                  <Button type="submit">{t("save changes")}</Button>
                </div>
              </form>
            </div>
          </TabsContent>

          <TabsContent value="users" className="space-y-6 mt-0 animate-in fade-in slide-in-from-bottom-2">
            <div className="bg-card border border-border rounded-xl p-6 shadow-sm flex flex-col items-center justify-center py-12 text-center">
              <Users className="w-12 h-12 text-muted-foreground/30 mb-4" />
              <h3 className="text-lg font-bold mb-1">{t("user management")}</h3>
              <p className="text-sm text-muted-foreground max-w-md">{t("manage sellers, administrators, and assign roles across your shops in the user management module.")}</p>
              <Button variant="outline" className="mt-6" asChild><Link to="/users">{t("open user directory")}</Link></Button>
            </div>
          </TabsContent>

          <TabsContent value="appearance" className="space-y-6 mt-0 animate-in fade-in slide-in-from-bottom-2">
            <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-bold mb-4">{t("theme & appearance")}</h3>
              <div className="space-y-6 max-w-lg">
                <div className="flex justify-between items-center">
                  <div className="space-y-0.5">
                    <Label className="text-base">{t("dark mode")}</Label>
                    <p className="text-sm text-muted-foreground">{t("toggle the application's dark mode visual theme.")}</p>
                  </div>
                  <Switch
                    checked={theme === "dark"}
                    onCheckedChange={(checked) => {
                      setTheme(checked ? "dark" : "light");
                      toast.success(`${t("active")} ${checked ? "Dark" : "Light"} Mode!`);
                    }}
                  />
                </div>
                <div className="space-y-2 border-t border-border pt-4">
                  <Label>{t("primary color accent")}</Label>
                  <Select
                    value={color}
                    onValueChange={(v: "blue" | "pink" | "emerald") => {
                      setColor(v);
                      toast.success(`${t("theme color changed to")} ${v}!`);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t("select theme color")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="blue">{t("blue (default)")}</SelectItem>
                      <SelectItem value="pink">{t("pink")}</SelectItem>
                      <SelectItem value="emerald">{t("emerald")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="subscription" className="space-y-6 mt-0 animate-in fade-in slide-in-from-bottom-2">
            {!selectedShop ? (
              <div className="bg-card border border-border rounded-xl p-8 text-center">
                <Store className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                <h3 className="font-bold text-lg">{t("no shop selected")}</h3>
                <p className="text-sm text-muted-foreground mt-1">{t("please select a specific shop from the top bar to view subscription details.")}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-card border border-border rounded-xl p-6 shadow-sm overflow-hidden relative group">
                   <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-primary/10 transition-colors" />
                   <div className="relative z-10">
                     <div className="flex items-center gap-3 mb-6">
                       <div className="p-3 bg-primary/10 rounded-2xl"><Zap className="w-5 h-5 text-primary" /></div>
                       <div>
                         <h3 className="text-lg font-black tracking-tight italic lowercase">{t("subscription status")}</h3>
                         <p className="text-[10px] uppercase font-black tracking-[0.2em] text-muted-foreground mt-0.5">{selectedShop.name}</p>
                       </div>
                     </div>
                     
                     <div className="space-y-4">
                        <div className="flex justify-between items-center p-3 bg-secondary/30 rounded-xl">
                          <span className="text-xs font-bold text-muted-foreground uppercase">{t("status")}</span>
                          <span className={cn(
                            "text-xs font-black px-3 py-1 rounded-lg uppercase tracking-wider",
                            selectedShop.subscriptionStatus === "active" ? "bg-emerald-500/10 text-emerald-600" : 
                            selectedShop.subscriptionStatus === "expired" ? "bg-amber-500/10 text-amber-600" :
                            "bg-rose-500/10 text-rose-600"
                          )}>
                            {t(selectedShop.subscriptionStatus || "unpaid")}
                          </span>
                        </div>

                        <div className="flex justify-between items-center p-3 bg-secondary/30 rounded-xl">
                          <span className="text-xs font-bold text-muted-foreground uppercase">{t("remaining days")}</span>
                          <span className="text-base font-black italic text-primary">
                            {selectedShop.subscriptionRemainingDays ?? 0} {t("days")}
                          </span>
                        </div>
                     </div>
                   </div>
                </div>

                <div className="bg-card border border-border rounded-xl p-6 shadow-sm overflow-hidden relative group">
                   <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-secondary/10 transition-colors" />
                   <div className="relative z-10">
                     <div className="flex items-center gap-3 mb-6">
                       <div className="p-3 bg-secondary/30 rounded-2xl"><Calendar className="w-5 h-5 text-foreground" /></div>
                       <div>
                         <h3 className="text-lg font-black tracking-tight italic lowercase">{t("plan details")}</h3>
                         <p className="text-[10px] uppercase font-black tracking-[0.2em] text-muted-foreground mt-0.5">{t("expiry & cycle")}</p>
                       </div>
                     </div>

                     <div className="space-y-4">
                        <div className="flex justify-between items-center p-3 border-b border-border/50">
                          <span className="text-xs font-bold text-muted-foreground uppercase">{t("start date")}</span>
                          <span className="text-xs font-black">{selectedShop.subscriptionStartDate ? new Date(selectedShop.subscriptionStartDate).toLocaleDateString() : "—"}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 border-b border-border/50">
                          <span className="text-xs font-bold text-muted-foreground uppercase">{t("expiry date")}</span>
                          <span className="text-xs font-black text-rose-600 italic">{selectedShop.subscriptionEndDate ? new Date(selectedShop.subscriptionEndDate).toLocaleDateString() : "—"}</span>
                        </div>
                        <div className="flex justify-between items-center p-3">
                          <span className="text-xs font-bold text-muted-foreground uppercase">{t("last payment")}</span>
                          <span className="text-xs font-black">{selectedShop.paymentDate ? new Date(selectedShop.paymentDate).toLocaleDateString() : "—"}</span>
                        </div>
                     </div>
                   </div>
                </div>
                
                <div className="md:col-span-2 bg-primary/5 border border-primary/20 rounded-2xl p-6 flex flex-col md:flex-row items-center gap-6">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                    <Heart className="w-8 h-8 text-primary" />
                  </div>
                  <div className="flex-1 text-center md:text-left">
                     <h4 className="font-black italic text-lg leading-tight uppercase tracking-tight">{t("need help with payment?")}</h4>
                     <p className="text-sm text-muted-foreground font-medium mt-1">{t("if your subscription has expired or you need to upgrade, please contact our support team to renew your access.")}</p>
                  </div>
                  <Button className="font-black uppercase italic tracking-widest">{t("contact support")}</Button>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="shops" className="space-y-6 mt-0 animate-in fade-in slide-in-from-bottom-2">
            <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-bold mb-4">{t("shop policies & configuration")}</h3>
              <form onSubmit={handleSave} className="space-y-6 max-w-lg">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base text-foreground">{t("require approval for new products")}</Label>
                    <p className="text-sm text-muted-foreground">{t("admins must approve products before they go live.")}</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base text-foreground">{t("allow negative inventory")}</Label>
                    <p className="text-sm text-muted-foreground">{t("permit recording sales even if stock is zero.")}</p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base text-foreground">{t("enable waitlists / pre-orders")}</Label>
                    <p className="text-sm text-muted-foreground">{t("customers can request items out of stock.")}</p>
                  </div>
                  <Switch />
                </div>
                <div className="pt-4 border-t border-border flex justify-end">
                  <Button type="submit">{t("save shop policies")}</Button>
                </div>
              </form>
            </div>
          </TabsContent>

          <TabsContent value="currency" className="space-y-6 mt-0 animate-in fade-in slide-in-from-bottom-2">
            <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-bold mb-4">{t("billing & financial settings")}</h3>
              <form onSubmit={handleSave} className="space-y-4 max-w-lg">
                <div className="space-y-2">
                   <Label>{t("base currency")}</Label>
                   <Select defaultValue="tsh">
                       <SelectTrigger><SelectValue placeholder={t("base currency")}/></SelectTrigger>
                       <SelectContent>
                           <SelectItem value="tsh">{t("tanzanian shilling (tzs)")}</SelectItem>
                           <SelectItem value="usd">{t("us dollar (usd)")}</SelectItem>
                           <SelectItem value="kes">{t("kenyan shilling (kes)")}</SelectItem>
                       </SelectContent>
                   </Select>
                </div>
                <div className="space-y-2">
                   <Label>{t("default vat / tax rate (%)")}</Label>
                   <Input type="number" defaultValue="18" min="0" max="100"/>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <div className="space-y-0.5">
                    <Label className="text-base text-foreground">{t("generate invoices automatically")}</Label>
                    <p className="text-sm text-muted-foreground">{t("create pdf receipts for every sale.")}</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="pt-4 border-t border-border flex justify-end">
                  <Button type="submit">{t("apply financial settings")}</Button>
                </div>
              </form>
            </div>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6 mt-0 animate-in fade-in slide-in-from-bottom-2">
            <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-bold mb-4">{t("notification preferences")}</h3>
              <form onSubmit={handleSave} className="space-y-6 max-w-lg">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base text-foreground">{t("low stock alerts")}</Label>
                    <p className="text-sm text-muted-foreground">{t("get notified when product stock falls below 3.")}</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base text-foreground">{t("daily sales summary")}</Label>
                    <p className="text-sm text-muted-foreground">{t("receive an email recap of daily transactions.")}</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base text-foreground">{t("new device login alerts")}</Label>
                    <p className="text-sm text-muted-foreground">{t("security alerts for unfamiliar ip logins.")}</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="pt-4 border-t border-border flex justify-end">
                  <Button type="submit">{t("save preferences")}</Button>
                </div>
              </form>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
