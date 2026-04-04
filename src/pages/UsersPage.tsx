import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { usersApi, UserRecord, ALL_PERMISSIONS } from "@/api/users.api";
import { shopsApi } from "@/api/shops.api";
import { useStore } from "@/store/useStore";
import { Shop } from "@/types/models";
import { toast } from "sonner";
import {
    Users, Plus, Trash2, Edit2, ShieldCheck, ShieldAlert,
    Eye, Search, RefreshCw, Store, Lock, Mail, Key
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/hooks/useLanguage";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

/* ─── helpers ──────────────────────────────────────────── */
const roleColors: Record<string, string> = {
    admin: "text-rose-600  border-rose-200  bg-rose-50  dark:bg-rose-950/30  dark:border-rose-800",
    seller: "text-blue-600 border-blue-200 bg-blue-50 dark:bg-blue-950/30 dark:border-blue-800",
    viewer: "text-slate-600 border-slate-200 bg-slate-50 dark:bg-slate-900/30 dark:border-slate-700",
};
const RoleIcon = ({ role }: { role: string }) => {
    if (role === "admin") return <ShieldCheck className="w-3.5 h-3.5 mr-1" />;
    if (role === "seller") return <ShieldAlert className="w-3.5 h-3.5 mr-1" />;
    return <Eye className="w-3.5 h-3.5 mr-1" />;
};

/* group permissions by section */
const permGroups = ALL_PERMISSIONS.reduce<Record<string, typeof ALL_PERMISSIONS>>((acc, p) => {
    (acc[p.group] ||= []).push(p);
    return acc;
}, {});

/* ─── PermissionsPanel ──────────────────────────────────── */
function PermissionsPanel({
    selected, onChange, shops, assignedShops, onShopsChange,
}: {
    selected: string[];
    onChange: (v: string[]) => void;
    shops: Shop[];
    assignedShops: number[];
    onShopsChange: (v: number[]) => void;
}) {
    const { t } = useLanguage();
    const toggle = (key: string) =>
        onChange(selected.includes(key) ? selected.filter(k => k !== key) : [...selected, key]);

    const toggleShop = (id: number) =>
        onShopsChange(assignedShops.includes(id) ? assignedShops.filter(s => s !== id) : [...assignedShops, id]);

    return (
        <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {/* Permissions */}
            <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-4 flex items-center gap-2">
                    <Lock className="w-3 h-3 text-primary" /> {t("permissions")}
                </p>
                <div className="space-y-5">
                    {Object.entries(permGroups).map(([group, items]) => (
                        <div key={group} className="bg-secondary/20 p-4 rounded-xl border border-border/40">
                            <p className="text-[10px] font-black text-primary uppercase mb-3 italic tracking-wider">{group}</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {items.map(p => (
                                    <label key={p.key} className="flex items-center gap-3 cursor-pointer group select-none">
                                        <Checkbox
                                            id={p.key}
                                            checked={selected.includes(p.key)}
                                            onCheckedChange={() => toggle(p.key)}
                                            className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                        />
                                        <span className="text-xs font-bold text-foreground/80 group-hover:text-primary transition-colors">{p.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Shop assignment */}
            {shops.length > 0 && (
                <div className="pt-2 border-t border-border/40">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-4 flex items-center gap-2">
                        <Store className="w-3 h-3 text-primary" /> {t("assign shops")}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-secondary/20 p-4 rounded-xl border border-border/40">
                        {shops.map(s => (
                            <label key={s.id} className="flex items-center gap-3 cursor-pointer group select-none">
                                <Checkbox
                                    id={`shop-${s.id}`}
                                    checked={assignedShops.includes(Number(s.id))}
                                    onCheckedChange={() => toggleShop(Number(s.id))}
                                    className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                />
                                <span className="text-xs font-bold text-foreground/80 group-hover:text-primary transition-colors truncate">{s.name}</span>
                            </label>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

/* ─── AddUserDialog ─────────────────────────────────────── */
function AddUserDialog({ shops, onSuccess }: { shops: Shop[]; onSuccess: () => void }) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const { t } = useLanguage();
    const [form, setForm] = useState({ name: "", email: "", password: "", role: "seller" as UserRecord["role"] });
    const [permissions, setPermissions] = useState<string[]>([]);
    const [assignedShops, setAssignedShops] = useState<number[]>([]);

    const reset = () => {
        setForm({ name: "", email: "", password: "", role: "seller" });
        setPermissions([]);
        setAssignedShops([]);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name || !form.email || !form.password) { toast.error(t("please fill all required fields")); return; }
        setLoading(true);
        try {
            await usersApi.create({ ...form, permissions, assigned_shops: assignedShops });

            // Log action
            const actor = useStore.getState().user;
            useStore.getState().addAuditLog({
                userId: actor?.id || "0",
                userName: actor?.name || "System",
                action: "CREATE_USER",
                module: "Users",
                details: `Created user ${form.name} (${form.email})`
            });

            toast.success(t("user created"));
            reset(); setOpen(false); onSuccess();
        } catch (err: any) {
            toast.error(err.message || t("error"));
        } finally { setLoading(false); }
    };

    return (
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) reset(); }}>
            <DialogTrigger asChild>
                <Button className="h-11 rounded-xl shadow-md gap-2 px-6 font-black hover:scale-[1.02] transition-transform">
                    <Plus className="w-5 h-5" /> {t("add user")}
                </Button>
            </DialogTrigger>
            <DialogContent aria-describedby={undefined} className="sm:max-w-2xl rounded-2xl border-none shadow-2xl p-0 overflow-hidden">
                <div className="bg-primary/5 p-6 border-b border-border/40">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black italic tracking-tight flex items-center gap-3">
                            <Users className="w-6 h-6 text-primary" /> {t("create new user")}
                        </DialogTitle>
                    </DialogHeader>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2 flex flex-col">
                            <Label className="font-bold text-[10px] uppercase text-muted-foreground ml-1">{t("full name")} *</Label>
                            <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="John Doe" className="bg-secondary/40 h-12 border-none rounded-xl font-bold" />
                        </div>
                        <div className="space-y-2 flex flex-col">
                            <Label className="font-bold text-[10px] uppercase text-muted-foreground ml-1">{t("email")} *</Label>
                            <Input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="john@example.com" className="bg-secondary/40 h-12 border-none rounded-xl font-bold" />
                        </div>
                        <div className="space-y-2 flex flex-col">
                            <Label className="font-bold text-[10px] uppercase text-muted-foreground ml-1">{t("password")} *</Label>
                            <Input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="******" className="bg-secondary/40 h-12 border-none rounded-xl font-bold" />
                        </div>
                        <div className="space-y-2 flex flex-col">
                            <Label className="font-bold text-[10px] uppercase text-muted-foreground ml-1">{t("role")} *</Label>
                            <Select value={form.role} onValueChange={(v: UserRecord["role"]) => setForm(f => ({ ...f, role: v }))}>
                                <SelectTrigger className="bg-secondary/40 h-12 border-none rounded-xl font-bold"><SelectValue /></SelectTrigger>
                                <SelectContent className="rounded-xl border-none shadow-xl">
                                    <SelectItem value="admin" className="font-bold">{t("admin - full access")}</SelectItem>
                                    <SelectItem value="seller" className="font-bold">{t("seller - sales & inventory")}</SelectItem>
                                    <SelectItem value="viewer" className="font-bold">{t("viewer - read only")}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="bg-secondary/10 rounded-2xl p-1 border border-border/40">
                        <PermissionsPanel
                            selected={permissions} onChange={setPermissions}
                            shops={shops} assignedShops={assignedShops} onShopsChange={setAssignedShops}
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <Button type="button" variant="outline" onClick={() => { setOpen(false); reset(); }} disabled={loading} className="h-12 px-6 rounded-xl font-bold uppercase tracking-wider">{t("cancel")}</Button>
                        <Button type="submit" disabled={loading} className="h-12 px-8 rounded-xl font-black uppercase tracking-wider shadow-lg shadow-primary/20">
                            {loading ? t("creating...") : t("create new user")}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}

/* ─── EditUserDialog ────────────────────────────────────── */
function EditUserDialog({ user, shops, onSuccess }: { user: UserRecord; shops: Shop[]; onSuccess: () => void }) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const { t } = useLanguage();
    const [form, setForm] = useState({ name: user.name, email: user.email, role: user.role, password: "" });
    const [permissions, setPermissions] = useState<string[]>(user.permissions ?? []);
    const [assignedShops, setAssignedShops] = useState<number[]>(user.assigned_shops?.map(Number) ?? []);

    useEffect(() => {
        if (open) {
            setForm({ name: user.name, email: user.email, role: user.role, password: "" });
            setPermissions(user.permissions ?? []);
            setAssignedShops(user.assigned_shops?.map(Number) ?? []);
        }
    }, [open, user]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload: any = { name: form.name, email: form.email, role: form.role, permissions, assigned_shops: assignedShops };
            if (form.password) payload.password = form.password;
            await usersApi.update(user.id, payload);

            // Log action
            const actor = useStore.getState().user;
            useStore.getState().addAuditLog({
                userId: actor?.id || "0",
                userName: actor?.name || "System",
                action: "UPDATE_USER",
                module: "Users",
                details: `Updated user ${form.name} (${form.email})`
            });

            toast.success(t("success"));
            setOpen(false); onSuccess();
        } catch { toast.error(t("error")); }
        finally { setLoading(false); }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="h-9 px-4 text-primary hover:text-primary hover:bg-primary/10 rounded-xl font-bold">
                    <Edit2 className="w-4 h-4 mr-2" />{t("edit")}
                </Button>
            </DialogTrigger>
            <DialogContent aria-describedby={undefined} className="sm:max-w-2xl rounded-2xl border-none shadow-2xl p-0 overflow-hidden">
                <div className="bg-primary/5 p-6 border-b border-border/40">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black italic tracking-tight flex items-center gap-3">
                            <Edit2 className="w-6 h-6 text-primary" /> {t("edit user")} – {user.name}
                        </DialogTitle>
                    </DialogHeader>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2 flex flex-col">
                            <Label className="font-bold text-[10px] uppercase text-muted-foreground ml-1">{t("full name")}</Label>
                            <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="bg-secondary/40 h-12 border-none rounded-xl font-bold" />
                        </div>
                        <div className="space-y-2 flex flex-col">
                            <Label className="font-bold text-[10px] uppercase text-muted-foreground ml-1">{t("email")}</Label>
                            <Input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="bg-secondary/40 h-12 border-none rounded-xl font-bold" />
                        </div>
                        <div className="space-y-2 flex flex-col">
                            <Label className="font-bold text-[10px] uppercase text-muted-foreground ml-1">{t("new password")} <span className="text-muted-foreground text-[8px] italic">({t("blank = unchanged")})</span></Label>
                            <Input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="******" className="bg-secondary/40 h-12 border-none rounded-xl font-bold" />
                        </div>
                        <div className="space-y-2 flex flex-col">
                            <Label className="font-bold text-[10px] uppercase text-muted-foreground ml-1">{t("role")}</Label>
                            <Select value={form.role} onValueChange={(v: UserRecord["role"]) => setForm(f => ({ ...f, role: v }))}>
                                <SelectTrigger className="bg-secondary/40 h-12 border-none rounded-xl font-bold"><SelectValue /></SelectTrigger>
                                <SelectContent className="rounded-xl border-none shadow-xl">
                                    <SelectItem value="admin" className="font-bold">{t("admin - full access")}</SelectItem>
                                    <SelectItem value="seller" className="font-bold">{t("seller - sales & inventory")}</SelectItem>
                                    <SelectItem value="viewer" className="font-bold">{t("viewer - read only")}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="bg-secondary/10 rounded-2xl p-1 border border-border/40">
                        <PermissionsPanel
                            selected={permissions} onChange={setPermissions}
                            shops={shops} assignedShops={assignedShops} onShopsChange={setAssignedShops}
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading} className="h-12 px-6 rounded-xl font-bold uppercase tracking-wider">{t("cancel")}</Button>
                        <Button type="submit" disabled={loading} className="h-12 px-8 rounded-xl font-black uppercase tracking-wider shadow-lg shadow-primary/20">
                            {loading ? t("saving...") : t("save changes")}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}

/* ─── UsersPage ─────────────────────────────────────────── */
export default function UsersPage() {
    const { t } = useLanguage();
    const [users, setUsers] = useState<UserRecord[]>([]);
    const [shops, setShops] = useState<Shop[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState<"all" | UserRecord["role"]>("all");
    const [deletingUser, setDeletingUser] = useState<UserRecord | null>(null);

    const load = async () => {
        setLoading(true);
        try {
            const [u, s] = await Promise.all([usersApi.getAll(), shopsApi.getAll()]);
            setUsers(u); setShops(s);
        } catch { toast.error(t("failed to load data")); }
        finally { setLoading(false); }
    };

    useEffect(() => { load(); }, []);

    const handleDelete = async () => {
        if (!deletingUser) return;
        try {
            await usersApi.remove(deletingUser.id);

            // Log action
            const actor = useStore.getState().user;
            useStore.getState().addAuditLog({
                userId: actor?.id || "0",
                userName: actor?.name || "System",
                action: "DELETE_USER",
                module: "Users",
                details: `Deleted user ${deletingUser.name} (${deletingUser.email})`
            });

            toast.success(t("user deleted"));
            setDeletingUser(null);
            load();
        }
        catch { toast.error(t("failed to delete user")); }
    };

    const filtered = users.filter(u => {
        const q = search.toLowerCase();
        return (roleFilter === "all" || u.role === roleFilter) &&
            (u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
    });

    const counts = {
        all: users.length,
        admin: users.filter(u => u.role === "admin").length,
        seller: users.filter(u => u.role === "seller").length,
        viewer: users.filter(u => u.role === "viewer").length,
    };

    return (
        <AppLayout title={t("user management")} subtitle={t("manage users, permissions & shop access")}>
            <div className="space-y-8">
                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                    {[
                        { label: t("total users"), count: counts.all, color: "text-foreground", bg: "bg-card", icon: Users },
                        { label: t("admins"), count: counts.admin, color: "text-rose-600", bg: "bg-card", icon: ShieldCheck },
                        { label: t("sellers"), count: counts.seller, color: "text-blue-600", bg: "bg-card", icon: ShieldAlert },
                        { label: t("viewers"), count: counts.viewer, color: "text-slate-600", bg: "bg-card", icon: Eye },
                    ].map(s => (
                        <Card key={s.label} className={cn("border-none shadow-xl relative overflow-hidden group", s.bg)}>
                             <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-12 -mt-12 blur-xl group-hover:bg-primary/10 transition-colors" />
                             <CardContent className="p-6 relative z-10">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className={cn("text-3xl font-black tracking-tighter", s.color)}>{s.count}</p>
                                        <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-widest font-black">{s.label}</p>
                                    </div>
                                    <div className="p-3 bg-secondary/50 rounded-xl">
                                        <s.icon className={cn("w-5 h-5", s.color)} />
                                    </div>
                                </div>
                             </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Toolbar */}
                <div className="flex flex-col sm:flex-row items-center gap-6 justify-between border-b border-border/40 pb-6">
                    <div className="flex gap-2 p-1.5 bg-secondary/50 rounded-2xl">
                        {(["all", "admin", "seller", "viewer"] as const).map(r => (
                            <button key={r} onClick={() => setRoleFilter(r)}
                                className={cn("px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all",
                                    roleFilter === r ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "text-muted-foreground hover:bg-background")}>
                                {r === "all" ? t("all") : t(r)} <span className="ml-1 opacity-50">{counts[r]}</span>
                            </button>
                        ))}
                    </div>
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <div className="relative flex-1 sm:flex-none">
                            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                            <Input placeholder={t("search users...")} value={search} onChange={e => setSearch(e.target.value)} className="pl-11 h-12 bg-card border-none shadow-sm rounded-xl font-bold w-full sm:w-64" />
                        </div>
                        <Button variant="ghost" size="icon" onClick={load} className="w-12 h-12 rounded-xl bg-card shadow-sm hover:text-primary"><RefreshCw className="w-4 h-4" /></Button>
                        <AddUserDialog shops={shops} onSuccess={load} />
                    </div>
                </div>

                {/* Table */}
                <div className="bg-card border border-border/40 rounded-3xl overflow-hidden shadow-2xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-border/40 bg-secondary/20">
                                    <th className="text-left p-6 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground pl-8">{t("user")}</th>
                                    <th className="text-left p-6 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">{t("role")}</th>
                                    <th className="text-left p-6 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">{t("permissions")}</th>
                                    <th className="text-left p-6 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">{t("assigned shops")}</th>
                                    <th className="text-right p-6 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground pr-8">{t("actions")}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/40">
                                {loading ? (
                                    <tr><td colSpan={5} className="py-24 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <RefreshCw className="w-10 h-10 animate-spin text-primary/30" />
                                            <span className="text-sm font-black italic text-muted-foreground">{t("loading users...")}</span>
                                        </div>
                                    </td></tr>
                                ) : filtered.length === 0 ? (
                                    <tr><td colSpan={5} className="py-24 text-center">
                                        <div className="flex flex-col items-center gap-6 opacity-30">
                                            <Users className="w-20 h-20" />
                                            <span className="text-xl font-black italic">{search ? t("no users match your search.") : t("no users yet.")}</span>
                                        </div>
                                    </td></tr>
                                ) : filtered.map(user => {
                                    const userShops = shops.filter(s => (user.assigned_shops || []).includes(Number(s.id)));
                                    return (
                                        <tr key={user.id} className="hover:bg-primary/5 transition-colors group">
                                            <td className="p-6 pl-8">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-lg font-black text-primary shrink-0 group-hover:scale-110 transition-transform">
                                                        {user.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div className="overflow-hidden">
                                                        <p className="font-black text-base text-foreground tracking-tight truncate">{user.name}</p>
                                                        <div className="flex items-center gap-2 mt-0.5 text-muted-foreground">
                                                            <Mail className="w-3 h-3" />
                                                            <p className="text-[10px] font-bold truncate">{user.email}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-6">
                                                <Badge variant="outline" className={cn("text-[10px] uppercase font-black tracking-widest px-3 py-1 flex w-fit items-center border-none shadow-sm", roleColors[user.role])}>
                                                    <RoleIcon role={user.role} />{t(user.role)}
                                                </Badge>
                                            </td>
                                            <td className="p-6">
                                                {(user.permissions || []).length === 0 ? (
                                                    <span className="text-[11px] font-black uppercase text-muted-foreground/30 italic">{t("none")}</span>
                                                ) : (
                                                    <div className="flex flex-wrap gap-1.5 max-w-[200px]">
                                                        {(user.permissions || []).slice(0, 3).map(p => (
                                                            <Badge key={p} variant="secondary" className="text-[9px] font-black uppercase tracking-wider py-0.5 px-2 bg-secondary text-secondary-foreground/70">{p.replace(/_/g, " ")}</Badge>
                                                        ))}
                                                        {(user.permissions || []).length > 3 && (
                                                            <Badge variant="secondary" className="text-[9px] font-black uppercase px-2 py-0.5">+{(user.permissions || []).length - 3}</Badge>
                                                        )}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="p-6">
                                                {userShops.length === 0 ? (
                                                    <span className="text-[11px] font-black uppercase text-rose-500/50 bg-rose-50 px-2 py-1 rounded-lg">{t("all shops")}</span>
                                                ) : (
                                                    <div className="flex flex-wrap gap-1.5 max-w-[240px]">
                                                        {userShops.map(s => (
                                                            <Badge key={s.id} variant="outline" className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 border-border/60 text-muted-foreground">{s.name}</Badge>
                                                        ))}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="p-6 pr-8">
                                                <div className="flex items-center justify-end gap-2 opactiy-0 group-hover:opacity-100 transition-opacity">
                                                    <EditUserDialog user={user} shops={shops} onSuccess={load} />
                                                    <Button variant="ghost" size="sm" className="h-9 px-4 text-destructive hover:text-destructive hover:bg-destructive/10 rounded-xl font-bold" onClick={() => setDeletingUser(user)}>
                                                        <Trash2 className="w-4 h-4 mr-2" />{t("delete")}
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={!!deletingUser} onOpenChange={(open) => !open && setDeletingUser(null)}>
                <AlertDialogContent className="rounded-2xl border-none shadow-2xl">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-xl font-black italic">{t("delete user?")}</AlertDialogTitle>
                        <AlertDialogDescription className="text-base font-medium">
                            {t("this action cannot be undone.")} {t("user will lose all access to the system.")}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="gap-2 pt-4">
                        <AlertDialogCancel className="h-11 rounded-xl font-bold uppercase tracking-wider">{t("cancel")}</AlertDialogCancel>
                        <AlertDialogAction
                            className="h-11 rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90 font-black uppercase tracking-wider shadow-lg shadow-destructive/20"
                            onClick={handleDelete}
                        >
                            {t("delete")}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}
