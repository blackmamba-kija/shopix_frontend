import { AppLayout } from "@/components/layout/AppLayout";
import { useLanguage } from "@/hooks/useLanguage";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { BookOpen, Store, Package, ShoppingCart, User, Shield, HelpCircle, CreditCard, Printer, FileText } from "lucide-react";

const HelpPage = () => {
    const { t } = useLanguage();

    return (
        <AppLayout title={t("help")} subtitle={t("user guide and manual")}>
            <div className="max-w-5xl mx-auto space-y-8 pb-12">
                <Card className="border-none shadow-xl bg-gradient-to-br from-primary/5 via-transparent to-primary/5 overflow-hidden">
                    <CardHeader className="pb-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
                            <BookOpen className="w-6 h-6 text-primary" />
                        </div>
                        <CardTitle className="text-3xl font-black italic tracking-tight">{t("user guide")}</CardTitle>
                        <CardDescription className="text-lg">
                            {t("help_welcome")}
                        </CardDescription>
                    </CardHeader>
                </Card>

                <Tabs defaultValue="basics" className="w-full">
                    <TabsList className="bg-secondary/50 p-1 rounded-xl mb-8 flex flex-wrap h-auto gap-1">
                        <TabsTrigger value="basics" className="rounded-lg font-bold px-6 py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">{t("basics")}</TabsTrigger>
                        <TabsTrigger value="inventory" className="rounded-lg font-bold px-6 py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">{t("inventory")}</TabsTrigger>
                        <TabsTrigger value="sales" className="rounded-lg font-bold px-6 py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">{t("sales_debts_guide_title")}</TabsTrigger>
                        <TabsTrigger value="admin" className="rounded-lg font-bold px-6 py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">{t("admin_guide_title")}</TabsTrigger>
                    </TabsList>

                    <TabsContent value="basics" className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
                                <CardHeader className="pb-2">
                                    <Store className="w-8 h-8 text-rose-500 mb-2" />
                                    <CardTitle>{t("help_managing_shops")}</CardTitle>
                                </CardHeader>
                                <CardContent className="text-sm text-muted-foreground leading-relaxed">
                                    {t("help_managing_shops_desc")}
                                </CardContent>
                            </Card>

                            <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
                                <CardHeader className="pb-2">
                                    <HelpCircle className="w-8 h-8 text-blue-500 mb-2" />
                                    <CardTitle>{t("help_navigation")}</CardTitle>
                                </CardHeader>
                                <CardContent className="text-sm text-muted-foreground leading-relaxed">
                                    {t("help_navigation_desc")}
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="inventory" className="space-y-4 bg-card p-6 rounded-2xl border border-border shadow-sm">
                        <h3 className="text-xl font-bold flex items-center gap-2 mb-4">
                            <Package className="w-5 h-5 text-orange-500" />
                            {t("inventory_guide_title")}
                        </h3>
                        <Accordion type="single" collapsible className="w-full">
                            <AccordionItem value="item-1">
                                <AccordionTrigger className="font-bold text-sm">{t("help_how_to_add_products")}</AccordionTrigger>
                                <AccordionContent className="text-muted-foreground">
                                    {t("help_how_to_add_products_desc")}
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="item-2">
                                <AccordionTrigger className="font-bold text-sm">{t("help_updating_stock")}</AccordionTrigger>
                                <AccordionContent className="text-muted-foreground">
                                    {t("help_updating_stock_desc")}
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="item-3">
                                <AccordionTrigger className="font-bold text-sm">{t("help_edit_delete")}</AccordionTrigger>
                                <AccordionContent className="text-muted-foreground">
                                    {t("help_edit_delete_desc")}
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </TabsContent>

                    <TabsContent value="sales" className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <Card className="border-emerald-100 bg-emerald-50/30">
                                    <CardHeader className="pb-2">
                                        <ShoppingCart className="w-8 h-8 text-emerald-600 mb-2" />
                                        <CardTitle className="text-emerald-700">{t("help_recording_sales")}</CardTitle>
                                    </CardHeader>
                                    <CardContent className="text-sm text-muted-foreground">
                                        {t("help_recording_sales_desc")}
                                    </CardContent>
                                </Card>
                                <Card className="border-blue-100 bg-blue-50/30">
                                    <CardHeader className="pb-2">
                                        <Printer className="w-8 h-8 text-blue-600 mb-2" />
                                        <CardTitle className="text-blue-700">{t("help_printing_services")}</CardTitle>
                                    </CardHeader>
                                    <CardContent className="text-sm text-muted-foreground">
                                        {t("help_printing_services_desc")}
                                    </CardContent>
                                </Card>
                            </div>
                            <Card className="border-amber-100 bg-amber-50/30">
                                <CardHeader className="pb-2">
                                    <CreditCard className="w-8 h-8 text-amber-600 mb-2" />
                                    <CardTitle className="text-amber-700">{t("help_managing_debts")}</CardTitle>
                                </CardHeader>
                                <CardContent className="text-sm text-muted-foreground space-y-3">
                                    <p>{t("help_managing_debts_desc")}</p>
                                    <ul className="list-disc pl-4 space-y-2">
                                        <li><strong>{t("record_new_debt_tip")}</strong></li>
                                        <li><strong>{t("installment_tip")}</strong></li>
                                        <li><strong>{t("debt_status_tip")}</strong></li>
                                    </ul>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="admin" className="space-y-6">
                        <div className="bg-secondary/20 rounded-2xl p-6 border border-border">
                            <h3 className="text-xl font-bold flex items-center gap-2 mb-6">
                                <Shield className="w-5 h-5 text-indigo-600" />
                                {t("admin_guide_title")}
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <h4 className="font-bold flex items-center gap-2">
                                        <User className="w-4 h-4" /> {t("help_user_mgmt")}
                                    </h4>
                                    <p className="text-sm text-muted-foreground">
                                        {t("help_user_mgmt_desc")}
                                    </p>
                                </div>
                                <div className="space-y-3">
                                    <h4 className="font-bold flex items-center gap-2">
                                        <FileText className="w-4 h-4" /> {t("help_reports_analytics")}
                                    </h4>
                                    <p className="text-sm text-muted-foreground">
                                        {t("help_reports_analytics_desc")}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>

                <div className="flex justify-center pt-8 border-t border-border/50">
                    <p className="text-sm text-muted-foreground italic flex items-center gap-2">
                        <HelpCircle className="w-4 h-4" />
                        {t("help_more_info")}
                    </p>
                </div>
            </div>
        </AppLayout>
    );
};

export default HelpPage;
