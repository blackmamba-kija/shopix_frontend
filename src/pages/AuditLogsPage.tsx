import { AppLayout } from "@/components/layout/AppLayout";
import { useStore } from "@/store/useStore";
import { format } from "date-fns";
import { Shield, Search, FileText, User, Activity } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usersApi, UserRecord } from "@/api/users.api";

const AuditLogsPage = () => {
    const auditLogs = useStore((s) => s.auditLogs);
    const fetchLogs = useStore((s) => s.fetchAuditLogs);
    const [searchTerm, setSearchTerm] = useState("");
    const [users, setUsers] = useState<UserRecord[]>([]);

    useEffect(() => {
        const load = async () => {
            fetchLogs();
            const u = await usersApi.getAll();
            setUsers(u);
        };
        load();
    }, [fetchLogs]);

    const filteredLogs = auditLogs.filter(
        (log) =>
            log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.module.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.details.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Group logs by user for summary, including all users
    const summaryList = users.map(user => {
        const userLogs = auditLogs.filter(l => String(l.userId) === String(user.id) || l.userName === user.name);
        return {
            name: user.name,
            email: user.email,
            role: user.role,
            actions: userLogs.length,
            lastActive: userLogs.length > 0 ? userLogs[0].timestamp : null,
            modules: new Set(userLogs.map(l => l.module))
        };
    });

    return (
        <AppLayout title="Audit Logs" subtitle="Track all administrative and security actions across the system">
            <div className="space-y-6">
                {/* Stats Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="bg-gradient-to-br from-slate-900 to-slate-800 text-white border-none">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-slate-400 text-sm font-medium">Total Events</p>
                                    <h3 className="text-3xl font-bold mt-1">{auditLogs.length}</h3>
                                </div>
                                <div className="p-3 bg-white/10 rounded-xl">
                                    <Activity className="w-6 h-6 text-blue-400" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-card border border-border">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-muted-foreground text-sm font-medium">Active Admins</p>
                                    <h3 className="text-3xl font-bold mt-1 text-foreground">
                                        {new Set(auditLogs.map(l => l.userId)).size}
                                    </h3>
                                </div>
                                <div className="p-3 bg-primary/10 rounded-xl">
                                    <Shield className="w-6 h-6 text-primary" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-card border border-border">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-muted-foreground text-sm font-medium">Monitoring Period</p>
                                    <h3 className="text-xl font-bold mt-1 text-foreground">Last 30 Days</h3>
                                </div>
                                <div className="p-3 bg-emerald-500/10 rounded-xl">
                                    <FileText className="w-6 h-6 text-emerald-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Tabbed Interface */}
                <Tabs defaultValue="feed" className="w-full">
                    <TabsList className="mb-4">
                        <TabsTrigger value="feed">
                            <Activity className="w-4 h-4 mr-2" /> Activity Feed
                        </TabsTrigger>
                        <TabsTrigger value="users">
                            <User className="w-4 h-4 mr-2" /> User Activity Summary
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="feed">
                        <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                            <div className="p-4 bg-muted/30 border-b border-border flex items-center gap-4">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search by user, action, module or details..."
                                        className="pl-9 bg-muted/20"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                                <Badge variant="outline" className="bg-muted px-3 py-1.5 h-auto">
                                    {filteredLogs.length} Results
                                </Badge>
                            </div>

                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-muted/20">
                                            <TableHead className="w-[180px]">Timestamp</TableHead>
                                            <TableHead>User</TableHead>
                                            <TableHead>Action</TableHead>
                                            <TableHead>Module</TableHead>
                                            <TableHead>Details</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredLogs.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={5} className="h-48 text-center text-muted-foreground">
                                                    <div className="flex flex-col items-center gap-2">
                                                        <Activity className="w-8 h-8 opacity-20" />
                                                        <p>No audit logs found</p>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            filteredLogs.map((log) => (
                                                <TableRow key={log.id} className="hover:bg-muted/30 transition-colors">
                                                    <TableCell className="text-xs font-mono text-muted-foreground">
                                                        {format(new Date(log.timestamp), "MMM dd, yyyy HH:mm:ss")}
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                                                                <User className="w-3 h-3 text-primary" />
                                                            </div>
                                                            <span className="font-semibold text-sm">{log.userName}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline" className="font-bold text-[10px] uppercase">
                                                            {log.action}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-sm font-medium">
                                                        {log.module}
                                                    </TableCell>
                                                    <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
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

                    <TabsContent value="users">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {summaryList.length === 0 ? (
                                <div className="col-span-full py-12 text-center text-muted-foreground">
                                    No user activity recorded yet
                                </div>
                            ) : (
                                summaryList.map((summary: any) => (
                                    <Card key={summary.name} className="border-border bg-card">
                                        <CardHeader className="flex flex-row items-center gap-4 pb-2">
                                            <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-lg font-bold">
                                                {summary.name.charAt(0)}
                                            </div>
                                            <div className="flex-1 overflow-hidden">
                                                <CardTitle className="text-base truncate">{summary.name}</CardTitle>
                                                <CardDescription className="text-xs truncate text-muted-foreground">
                                                    {summary.email}
                                                </CardDescription>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-4">
                                                <div className="flex justify-between items-center text-xs">
                                                    <Badge variant="secondary" className="capitalize">{summary.role}</Badge>
                                                    {summary.lastActive ? (
                                                        <span className="text-muted-foreground">
                                                            Active: {format(new Date(summary.lastActive), "MMM dd")}
                                                        </span>
                                                    ) : (
                                                        <span className="text-muted-foreground/50 italic">No activity</span>
                                                    )}
                                                </div>
                                                <div className="flex justify-between items-center text-xs font-semibold border-t border-border pt-3">
                                                    <span className="text-muted-foreground">Total Actions</span>
                                                    <span className="text-foreground bg-muted px-2.5 py-0.5 rounded-full">{summary.actions}</span>
                                                </div>
                                                <div className="flex flex-wrap gap-1">
                                                    {Array.from(summary.modules).map((mod: any) => (
                                                        <Badge key={mod} variant="outline" className="text-[10px]">
                                                            {mod}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))
                            )}
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </AppLayout>
    );
};

export default AuditLogsPage;
