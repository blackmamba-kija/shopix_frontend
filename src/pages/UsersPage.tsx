import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { usersApi, UserRecord, ALL_PERMISSIONS } from "@/api/users.api";
import { shopsApi } from "@/api/shops.api";
import { useStore } from "@/store/useStore";
import { authHelper } from "@/utils/helpers/auth.helper";
import { Shop } from "@/types/models";
import { toast } from "sonner";
import {
    Users, Plus, Trash2, Edit2, ShieldCheck, ShieldAlert,
    Eye, Search, RefreshCw, Store, Lock
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ─── helpers ──────────────────────────────────────────── */
const roleColors: Record<string, string> = {
    admin: "text-red-600  border-red-200  bg-red-50  dark:bg-red-950  dark:border-red-800",
    seller: "text-blue-600 border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800",
    viewer: "text-gray-600 border-gray-200 bg-gray-50 dark:bg-gray-900 dark:border-gray-700",
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
    const toggle = (key: string) =>
        onChange(selected.includes(key) ? selected.filter(k => k !== key) : [...selected, key]);

    const toggleShop = (id: number) =>
        onShopsChange(assignedShops.includes(id) ? assignedShops.filter(s => s !== id) : [...assignedShops, id]);

    return (
        <div className="space-y-4 max-h-72 overflow-y-auto pr-1">
            {/* Permissions */}
            <div>
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1">
                    <Lock className="w-3 h-3" /> Permissions
                </p>
                <div className="space-y-3">
                    {Object.entries(permGroups).map(([group, items]) => (
                        <div key={group}>
                            <p className="text-[10px] font-semibold text-muted-foreground/70 uppercase mb-1">{group}</p>
                            <div className="grid grid-cols-2 gap-1.5">
                                {items.map(p => (
                                    <label key={p.key} className="flex items-center gap-2 cursor-pointer select-none">
                                        <Checkbox
                                            id={p.key}
                                            checked={selected.includes(p.key)}
                                            onCheckedChange={() => toggle(p.key)}
                                        />
                                        <span className="text-xs text-foreground">{p.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Shop assignment */}
            {shops.length > 0 && (
                <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1">
                        <Store className="w-3 h-3" /> Assign Shops
                    </p>
                    <div className="grid grid-cols-2 gap-1.5">
                        {shops.map(s => (
                            <label key={s.id} className="flex items-center gap-2 cursor-pointer select-none">
                                <Checkbox
                                    id={`shop-${s.id}`}
                                    checked={assignedShops.includes(Number(s.id))}
                                    onCheckedChange={() => toggleShop(Number(s.id))}
                                />
                                <span className="text-xs text-foreground truncate">{s.name}</span>
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
        if (!form.name || !form.email || !form.password) { toast.error("Please fill all required fields"); return; }
        setLoading(true);
        try {
            await usersApi.create({ ...form, permissions, assigned_shops: assignedShops });

            // Log action
            const admin = authHelper.getUser();
            useStore.getState().addAuditLog({
                userId: admin?.id || "0",
                userName: admin?.name || "System",
                action: "CREATE_USER",
                module: "Users",
                details: `Created user ${form.name} (${form.email})`
            });

            toast.success(`User "${form.name}" created`);
            reset(); setOpen(false); onSuccess();
        } catch (err: any) {
            toast.error(err.message || "Failed to create user");
        } finally { setLoading(false); }
    };

    return (
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) reset(); }}>
            <DialogTrigger asChild>
                <Button size="sm" className="gap-1.5"><Plus className="w-4 h-4" /> Add User</Button>
            </DialogTrigger>
            <DialogContent aria-describedby={undefined} className="sm:max-w-lg">
                <DialogHeader><DialogTitle>Create New User</DialogTitle></DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 mt-2">
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2 col-span-2 sm:col-span-1">
                            <Label>Full Name *</Label>
                            <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="John Doe" />
                        </div>
                        <div className="space-y-2 col-span-2 sm:col-span-1">
                            <Label>Email *</Label>
                            <Input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="john@example.com" />
                        </div>
                        <div className="space-y-2 col-span-2 sm:col-span-1">
                            <Label>Password *</Label>
                            <Input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="Min 6 chars" />
                        </div>
                        <div className="space-y-2 col-span-2 sm:col-span-1">
                            <Label>Role *</Label>
                            <Select value={form.role} onValueChange={(v: UserRecord["role"]) => setForm(f => ({ ...f, role: v }))}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="admin">Admin – Full access</SelectItem>
                                    <SelectItem value="seller">Seller – Sales & inventory</SelectItem>
                                    <SelectItem value="viewer">Viewer – Read only</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="border border-border rounded-lg p-3 bg-secondary/30">
                        <PermissionsPanel
                            selected={permissions} onChange={setPermissions}
                            shops={shops} assignedShops={assignedShops} onShopsChange={setAssignedShops}
                        />
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                        <Button type="button" variant="outline" onClick={() => { setOpen(false); reset(); }} disabled={loading}>Cancel</Button>
                        <Button type="submit" disabled={loading}>{loading ? "Creating…" : "Create User"}</Button>
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
            const admin = authHelper.getUser();
            useStore.getState().addAuditLog({
                userId: admin?.id || "0",
                userName: admin?.name || "System",
                action: "UPDATE_USER",
                module: "Users",
                details: `Updated user ${form.name} (${form.email})`
            });

            toast.success("User updated successfully");
            setOpen(false); onSuccess();
        } catch { toast.error("Failed to update user"); }
        finally { setLoading(false); }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="text-primary hover:text-primary hover:bg-primary/10">
                    <Edit2 className="w-4 h-4 mr-1.5" />Edit
                </Button>
            </DialogTrigger>
            <DialogContent aria-describedby={undefined} className="sm:max-w-lg">
                <DialogHeader><DialogTitle>Edit User – {user.name}</DialogTitle></DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 mt-2">
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2 col-span-2 sm:col-span-1">
                            <Label>Full Name</Label>
                            <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                        </div>
                        <div className="space-y-2 col-span-2 sm:col-span-1">
                            <Label>Email</Label>
                            <Input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
                        </div>
                        <div className="space-y-2 col-span-2 sm:col-span-1">
                            <Label>New Password <span className="text-muted-foreground text-[10px]">(blank = unchanged)</span></Label>
                            <Input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="Enter new password" />
                        </div>
                        <div className="space-y-2 col-span-2 sm:col-span-1">
                            <Label>Role</Label>
                            <Select value={form.role} onValueChange={(v: UserRecord["role"]) => setForm(f => ({ ...f, role: v }))}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="admin">Admin – Full access</SelectItem>
                                    <SelectItem value="seller">Seller – Sales & inventory</SelectItem>
                                    <SelectItem value="viewer">Viewer – Read only</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="border border-border rounded-lg p-3 bg-secondary/30">
                        <PermissionsPanel
                            selected={permissions} onChange={setPermissions}
                            shops={shops} assignedShops={assignedShops} onShopsChange={setAssignedShops}
                        />
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                        <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>Cancel</Button>
                        <Button type="submit" disabled={loading}>{loading ? "Saving…" : "Save Changes"}</Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}

/* ─── UsersPage ─────────────────────────────────────────── */
export default function UsersPage() {
    const [users, setUsers] = useState<UserRecord[]>([]);
    const [shops, setShops] = useState<Shop[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState<"all" | UserRecord["role"]>("all");

    const load = async () => {
        setLoading(true);
        try {
            const [u, s] = await Promise.all([usersApi.getAll(), shopsApi.getAll()]);
            setUsers(u); setShops(s);
        } catch { toast.error("Failed to load data"); }
        finally { setLoading(false); }
    };

    useEffect(() => { load(); }, []);

    const handleDelete = async (user: UserRecord) => {
        if (!window.confirm(`Delete "${user.name}"? This cannot be undone.`)) return;
        try {
            await usersApi.remove(user.id);

            // Log action
            const admin = authHelper.getUser();
            useStore.getState().addAuditLog({
                userId: admin?.id || "0",
                userName: admin?.name || "System",
                action: "DELETE_USER",
                module: "Users",
                details: `Deleted user ${user.name} (${user.email})`
            });

            toast.success("User deleted");
            load();
        }
        catch { toast.error("Failed to delete user"); }
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
        <AppLayout title="User Management" subtitle="Manage users, permissions & shop access">
            <div className="space-y-5">
                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                        { label: "Total Users", count: counts.all, color: "text-foreground", bg: "bg-secondary/50" },
                        { label: "Admins", count: counts.admin, color: "text-red-600", bg: "bg-red-50  dark:bg-red-950/30" },
                        { label: "Sellers", count: counts.seller, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-950/30" },
                        { label: "Viewers", count: counts.viewer, color: "text-gray-600", bg: "bg-gray-50 dark:bg-gray-900/30" },
                    ].map(s => (
                        <div key={s.label} className={cn("rounded-xl p-4 border border-border", s.bg)}>
                            <p className={cn("text-2xl font-bold", s.color)}>{s.count}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
                        </div>
                    ))}
                </div>

                {/* Toolbar */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 justify-between">
                    <div className="flex gap-2 flex-wrap">
                        {(["all", "admin", "seller", "viewer"] as const).map(r => (
                            <button key={r} onClick={() => setRoleFilter(r)}
                                className={cn("px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors",
                                    roleFilter === r ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-accent")}>
                                {r === "all" ? "All" : r} ({counts[r]})
                            </button>
                        ))}
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <div className="relative flex-1 sm:flex-none">
                            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                            <Input placeholder="Search users…" value={search} onChange={e => setSearch(e.target.value)} className="pl-8 text-sm h-9 w-full sm:w-56" />
                        </div>
                        <Button variant="outline" size="sm" onClick={load} className="shrink-0"><RefreshCw className="w-3.5 h-3.5" /></Button>
                        <AddUserDialog shops={shops} onSuccess={load} />
                    </div>
                </div>

                {/* Table */}
                <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-border bg-secondary/50">
                                    <th className="text-left p-3 text-xs font-semibold text-muted-foreground">User</th>
                                    <th className="text-left p-3 text-xs font-semibold text-muted-foreground">Email</th>
                                    <th className="text-left p-3 text-xs font-semibold text-muted-foreground">Role</th>
                                    <th className="text-left p-3 text-xs font-semibold text-muted-foreground">Permissions</th>
                                    <th className="text-left p-3 text-xs font-semibold text-muted-foreground">Assigned Shops</th>
                                    <th className="text-right p-3 text-xs font-semibold text-muted-foreground">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan={6} className="text-center py-12">
                                        <div className="flex flex-col items-center gap-2">
                                            <RefreshCw className="w-5 h-5 animate-spin text-muted-foreground" />
                                            <span className="text-sm text-muted-foreground">Loading users…</span>
                                        </div>
                                    </td></tr>
                                ) : filtered.length === 0 ? (
                                    <tr><td colSpan={6} className="text-center py-12">
                                        <div className="flex flex-col items-center gap-2">
                                            <Users className="w-8 h-8 text-muted-foreground/30" />
                                            <span className="text-sm text-muted-foreground">{search ? "No users match your search." : "No users yet."}</span>
                                        </div>
                                    </td></tr>
                                ) : filtered.map(user => {
                                    const userShops = shops.filter(s => (user.assigned_shops || []).includes(Number(s.id)));
                                    return (
                                        <tr key={user.id} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                                            <td className="p-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                                                        {user.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-foreground">{user.name}</p>
                                                        <p className="text-[10px] text-muted-foreground">
                                                            {new Date(user.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-3 text-muted-foreground text-xs">{user.email}</td>
                                            <td className="p-3">
                                                <Badge variant="outline" className={cn("text-xs capitalize flex w-fit items-center", roleColors[user.role])}>
                                                    <RoleIcon role={user.role} />{user.role}
                                                </Badge>
                                            </td>
                                            <td className="p-3">
                                                {(user.permissions || []).length === 0 ? (
                                                    <span className="text-xs text-muted-foreground">None</span>
                                                ) : (
                                                    <div className="flex flex-wrap gap-1">
                                                        {(user.permissions || []).slice(0, 3).map(p => (
                                                            <Badge key={p} variant="secondary" className="text-[10px] px-1.5 py-0">{p.replace(/_/g, " ")}</Badge>
                                                        ))}
                                                        {(user.permissions || []).length > 3 && (
                                                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">+{(user.permissions || []).length - 3}</Badge>
                                                        )}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="p-3">
                                                {userShops.length === 0 ? (
                                                    <span className="text-xs text-muted-foreground">All shops</span>
                                                ) : (
                                                    <div className="flex flex-wrap gap-1">
                                                        {userShops.map(s => (
                                                            <Badge key={s.id} variant="outline" className="text-[10px] px-1.5 py-0">{s.name}</Badge>
                                                        ))}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="p-3">
                                                <div className="flex items-center justify-end gap-1">
                                                    <EditUserDialog user={user} shops={shops} onSuccess={load} />
                                                    <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDelete(user)}>
                                                        <Trash2 className="w-4 h-4 mr-1.5" />Delete
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
        </AppLayout>
    );
}
