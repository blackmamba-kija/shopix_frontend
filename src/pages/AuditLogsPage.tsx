import { AppLayout } from "@/components/layout/AppLayout";
import { useStore } from "@/store/useStore";
import { format } from "date-fns";
import { Shield, Search, FileText, User, Activity, Calendar, Lock } from "lucide-react";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usersApi, UserRecord } from "@/api/users.api";
import { useLanguage } from "@/hooks/useLanguage";
import { usePermissions } from "@/hooks/useAuth";

const actionColors: Record<string, string> = {
    CREATE: "bg-emerald-500/10 text-emerald-600 border-emerald-200",
    CREATE_USER: "bg-emerald-500/10 text-emerald-600 border-emerald-200",
    UPDATE: "bg-blue-500/10 text-blue-600 border-blue-200",
    UPDATE_USER: "bg-blue-500/10 text-blue-600 border-blue-200",
    DELETE: "bg-rose-500/10 text-rose-600 border-rose-200",
    DELETE_USER: "bg-rose-500/10 text-rose-600 border-rose-200",
    LOGIN: "bg-purple-500/10 text-purple-600 border-purple-200",
    LOGOUT: "bg-slate-500/10 text-slate-600 border-slate-200",
};

const AuditLogsPage = () => {
    const { t } = useLanguage();
    const { isAdmin, can } = usePermissions();
    const hasAccess = isAdmin || can("view_audit_logs");

    const auditLogs = useStore((s) => s.auditLogs);
    const fetchLogs = useStore((s) => s.fetchAuditLogs);
    const shops = useStore((s) => s.shops);
    const [searchTerm, setSearchTerm] = useState("");
    const [users, setUsers] = useState<UserRecord[]>([]);

    useEffect(() => {
        const load = async () => {
            fetchLogs();
            if (isAdmin) {
                const u = await usersApi.getAll();
                setUsers(u);
            }
        };
        if (hasAccess) load();
    }, [fetchLogs, hasAccess, isAdmin]);

    if (!hasAccess) {
        return (
            <AppLayout title={t("audit logs")} subtitle="">
                <div className="flex flex-col items-center justify-center min-h-[50vh] gap-6 opacity-40">
                    <Lock className="w-24 h-24" />
                    <p className="text-2xl font-black italic">{t("you don't have permission to view audit logs")}</p>
                </div>
            </AppLayout>
        );
    }

    const filteredLogs = auditLogs.filter(
        (log) =>
            log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.module.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.details.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // For admins: group by user for summary
    const summaryList = users.map((user) => {
        const userLogs = auditLogs.filter((l) => String(l.userId) === String(user.id) || l.userName === user.name);
        return {
            name: user.name,
            email: user.email,
            role: user.role,
            actions: userLogs.length,
            lastActive: userLogs.length > 0 ? userLogs[0].timestamp : null,
            modules: new Set(userLogs.map((l) => l.module)),
        };
    });

    const getShopName = (shopId?: string) => {
        if (!shopId) return null;
        return shops.find((s) => String(s.id) === String(shopId))?.name;
    };

    return (
        <AppLayout
            title={t("audit logs")}
            subtitle={isAdmin ? t("track all administrative and security actions across the system") : t("activity logs for your assigned shops")}
        >
            <div className="space-y-8">
                {/* Stats Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="bg-card border-none shadow-xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-primary/10 transition-colors" />
                        <CardContent className="p-8">
                            <div className="flex items-center justify-between relative z-10">
                                <div>
                                    <p className="text-muted-foreground text-[10px] font-black uppercase tracking-widest">{t("total events")}</p>
                                    <h3 className="text-4xl font-black mt-2 tracking-tighter">{auditLogs.length.toLocaleString()}</h3>
                                </div>
                                <div className="p-4 bg-primary/10 rounded-2xl"><Activity className="w-8 h-8 text-primary" /></div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-card border-none shadow-xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-emerald-500/10 transition-colors" />
                        <CardContent className="p-8">
                            <div className="flex items-center justify-between relative z-10">
                                <div>
                                    <p className="text-muted-foreground text-[10px] font-black uppercase tracking-widest">{t("active users")}</p>
                                    <h3 className="text-4xl font-black mt-2 tracking-tighter">{new Set(auditLogs.map((l) => l.userId)).size}</h3>
                                </div>
                                <div className="p-4 bg-emerald-500/10 rounded-2xl"><Shield className="w-8 h-8 text-emerald-600" /></div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-card border-none shadow-xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-orange-500/10 transition-colors" />
                        <CardContent className="p-8">
                            <div className="flex items-center justify-between relative z-10">
                                <div>
                                    <p className="text-muted-foreground text-[10px] font-black uppercase tracking-widest">{t("monitoring period")}</p>
                                    <h3 className="text-2xl font-black mt-3 tracking-tight">{isAdmin ? t("full system") : t("your shops")}</h3>
                                </div>
                                <div className="p-4 bg-orange-500/10 rounded-2xl"><Calendar className="w-8 h-8 text-orange-600" /></div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Tabbed Interface */}
                <Tabs defaultValue="feed" className="w-full">
                    <TabsList className="mb-6 p-1.5 bg-secondary/50 rounded-2xl h-14 w-fit">
                        <TabsTrigger value="feed" className="px-6 rounded-xl font-bold gap-2 text-sm data-[state=active]:shadow-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                            <Activity className="w-4 h-4" /> {t("activity feed")}
                        </TabsTrigger>
                        {isAdmin && (
                            <TabsTrigger value="users" className="px-6 rounded-xl font-bold gap-2 text-sm data-[state=active]:shadow-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                                <User className="w-4 h-4" /> {t("user activity summary")}
                            </TabsTrigger>
                        )}
                    </TabsList>

                    {/* Activity Feed Tab */}
                    <TabsContent value="feed" className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="bg-card border border-border/40 rounded-2xl shadow-sm overflow-hidden">
                            <div className="p-6 bg-secondary/20 border-b border-border/40 flex flex-col sm:flex-row items-center gap-4">
                                <div className="relative flex-1 w-full">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <Input
                                        placeholder={t("search by user, action, module or details...")}
                                        className="pl-11 h-12 bg-background border-none shadow-inner rounded-xl font-bold"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                                <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 px-4 py-2 h-auto font-black uppercase tracking-wider text-[10px] rounded-xl whitespace-nowrap">
                                    {filteredLogs.length} {t("results")}
                                </Badge>
                            </div>

                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-secondary/10 hover:bg-secondary/10 border-b border-border/40">
                                            <TableHead className="w-[160px] font-black uppercase text-[10px] tracking-widest pl-6">{t("timestamp")}</TableHead>
                                            <TableHead className="font-black uppercase text-[10px] tracking-widest">{t("user")}</TableHead>
                                            <TableHead className="font-black uppercase text-[10px] tracking-widest">{t("action")}</TableHead>
                                            <TableHead className="font-black uppercase text-[10px] tracking-widest">{t("module")}</TableHead>
                                            {isAdmin && <TableHead className="font-black uppercase text-[10px] tracking-widest">{t("shop")}</TableHead>}
                                            <TableHead className="font-black uppercase text-[10px] tracking-widest pr-6">{t("details")}</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredLogs.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={isAdmin ? 6 : 5} className="h-64 text-center">
                                                    <div className="flex flex-col items-center gap-4 opacity-30">
                                                        <FileText className="w-16 h-16" />
                                                        <p className="text-xl font-black italic">{t("no audit logs found")}</p>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            filteredLogs.map((log) => (
                                                <TableRow key={log.id} className="hover:bg-primary/5 transition-colors border-b border-border/40 last:border-0 group">
                                                    <TableCell className="text-[11px] font-bold text-muted-foreground pl-6 whitespace-nowrap">
                                                        {format(new Date(log.timestamp), "MMM dd, yyyy HH:mm")}
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-black text-primary text-sm group-hover:scale-110 transition-transform">
                                                                {log.userName.charAt(0).toUpperCase()}
                                                            </div>
                                                            <span className="font-bold text-sm tracking-tight">{log.userName}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline" className={`font-black text-[9px] uppercase tracking-wider py-1 px-2 border ${actionColors[log.action] || "bg-primary/5 text-primary border-primary/20"}`}>
                                                            {log.action}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-sm font-black text-foreground/80 lowercase italic whitespace-nowrap">
                                                        {log.module}
                                                    </TableCell>
                                                    {isAdmin && (
                                                        <TableCell className="text-xs font-bold text-muted-foreground">
                                                            {getShopName(log.shopId) ? (
                                                                <Badge variant="outline" className="text-[9px] font-black uppercase">{getShopName(log.shopId)}</Badge>
                                                            ) : <span className="opacity-30">—</span>}
                                                        </TableCell>
                                                    )}
                                                    <TableCell className="text-sm font-medium text-muted-foreground max-w-sm py-4 pr-6 truncate">
                                                        {log.details}
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    </TabsContent>

                    {/* User Summary Tab (Admin Only) */}
                    {isAdmin && (
                        <TabsContent value="users" className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {summaryList.length === 0 ? (
                                    <div className="col-span-full py-24 text-center bg-card rounded-2xl border border-dashed border-border/40 opacity-30">
                                        <p className="text-xl font-black italic">{t("no user activity recorded yet")}</p>
                                    </div>
                                ) : (
                                    summaryList.map((summary: any) => (
                                        <Card key={summary.name} className="border-none shadow-xl bg-card overflow-hidden group hover:shadow-2xl transition-all duration-300">
                                            <CardHeader className="flex flex-row items-center gap-5 pb-6 border-b border-border/40">
                                                <div className="w-16 h-16 rounded-[1.25rem] bg-gradient-to-br from-primary to-rose-500 flex items-center justify-center text-primary-foreground text-2xl font-black shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform">
                                                    {summary.name.charAt(0)}
                                                </div>
                                                <div className="flex-1 overflow-hidden">
                                                    <CardTitle className="text-lg font-black tracking-tight truncate">{summary.name}</CardTitle>
                                                    <CardDescription className="text-xs truncate font-bold text-muted-foreground mt-0.5">{summary.email}</CardDescription>
                                                </div>
                                            </CardHeader>
                                            <CardContent className="p-6 space-y-4">
                                                <div className="flex justify-between items-center">
                                                    <Badge className="capitalize font-black tracking-wider text-[10px] bg-secondary text-secondary-foreground border-none px-3 py-1">{t(summary.role)}</Badge>
                                                    {summary.lastActive ? (
                                                        <span className="text-[10px] font-black uppercase text-muted-foreground flex items-center gap-1.5">
                                                            <Activity className="w-3 h-3 text-emerald-500" />
                                                            {format(new Date(summary.lastActive), "MMM dd")}
                                                        </span>
                                                    ) : (
                                                        <span className="text-[10px] font-black uppercase text-muted-foreground/30 italic">{t("no activity")}</span>
                                                    )}
                                                </div>
                                                <div className="flex justify-between items-center border-t border-border/40 pt-4">
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{t("total actions")}</span>
                                                    <span className="text-lg font-black text-foreground">{summary.actions.toLocaleString()}</span>
                                                </div>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {Array.from(summary.modules).map((mod: any) => (
                                                        <Badge key={mod} variant="outline" className="text-[9px] font-black uppercase tracking-wider py-0.5 px-2 text-primary/70 border-primary/10">{mod}</Badge>
                                                    ))}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))
                                )}
                            </div>
                        </TabsContent>
                    )}
                </Tabs>
            </div>
        </AppLayout>
    );
};

export default AuditLogsPage;
