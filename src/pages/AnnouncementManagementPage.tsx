import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { announcementsApi, AnnouncementRecord } from "@/api/announcements.api";
import { getVideoEmbedUrl } from "@/components/modals/AnnouncementModal";
import { Megaphone, Plus, Trash2, Power, Video, Sparkles, RefreshCw, Eye, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/hooks/useLanguage";
import { cn } from "@/lib/utils";

export default function AnnouncementManagementPage() {
    const [announcements, setAnnouncements] = useState<AnnouncementRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [formLoading, setFormLoading] = useState(false);
    const { t } = useLanguage();

    const [form, setForm] = useState({
        title: "",
        description: "",
        videoUrl: "",
        isActive: true,
    });

    const loadAnnouncements = async () => {
        setLoading(true);
        try {
            const list = await announcementsApi.getAll();
            setAnnouncements(list);
        } catch {
            toast.error("Failed to load announcements");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadAnnouncements();
    }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.title.trim()) {
            toast.error("Please provide an announcement title");
            return;
        }

        setFormLoading(true);
        try {
            await announcementsApi.create({
                title: form.title.trim(),
                description: form.description.trim() || undefined,
                video_url: form.videoUrl.trim() || undefined,
                is_active: form.isActive,
            });

            toast.success("Announcement published successfully!");
            setForm({ title: "", description: "", videoUrl: "", isActive: true });
            loadAnnouncements();
        } catch (err: any) {
            toast.error(err.message || "Failed to publish announcement");
        } finally {
            setFormLoading(false);
        }
    };

    const handleToggle = async (id: number) => {
        try {
            const res = await announcementsApi.toggle(id);
            toast.success(res.message);
            loadAnnouncements();
        } catch {
            toast.error("Failed to update status");
        }
    };

    const handleDelete = async (id: number) => {
        try {
            await announcementsApi.remove(id);
            toast.success("Announcement deleted");
            loadAnnouncements();
        } catch {
            toast.error("Failed to delete announcement");
        }
    };

    const previewMedia = getVideoEmbedUrl(form.videoUrl);

    return (
        <AppLayout title="Announcements & Video Promos" subtitle="Publish system updates, video tutorials, and popups for all users">
            <div className="space-y-8 max-w-6xl mx-auto">
                {/* Create Form Section */}
                <div className="bg-card border border-border/40 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
                    <div className="flex items-center justify-between border-b border-border/40 pb-4">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-primary/10 rounded-2xl">
                                <Megaphone className="w-6 h-6 text-primary animate-pulse" />
                            </div>
                            <div>
                                <h3 className="text-xl font-black italic tracking-tight text-foreground">Publish New Announcement / Video Promo</h3>
                                <p className="text-xs text-muted-foreground font-bold">Pop up for all users when active</p>
                            </div>
                        </div>
                        <Button variant="ghost" size="sm" onClick={loadAnnouncements} className="h-9 gap-1 font-bold">
                            <RefreshCw className="w-4 h-4" /> Refresh
                        </Button>
                    </div>

                    <form onSubmit={handleCreate} className="space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2 flex flex-col sm:col-span-2">
                                <Label className="font-bold text-xs uppercase text-muted-foreground ml-1">Announcement Title *</Label>
                                <Input
                                    value={form.title}
                                    onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                                    placeholder="e.g. Important System Update: New Inventory & User Features Released!"
                                    className="bg-secondary/40 h-12 border-none font-bold rounded-xl"
                                />
                            </div>

                            <div className="space-y-2 flex flex-col sm:col-span-2">
                                <Label className="font-bold text-xs uppercase text-muted-foreground ml-1">Video Link (YouTube, Vimeo, or MP4 URL)</Label>
                                <Input
                                    value={form.videoUrl}
                                    onChange={(e) => setForm((f) => ({ ...f, videoUrl: e.target.value }))}
                                    placeholder="e.g. https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                                    className="bg-secondary/40 h-12 border-none font-bold rounded-xl"
                                />
                            </div>

                            <div className="space-y-2 flex flex-col sm:col-span-2">
                                <Label className="font-bold text-xs uppercase text-muted-foreground ml-1">Update Description / Release Notes</Label>
                                <textarea
                                    value={form.description}
                                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                                    placeholder="Write details, tutorial notes, or instructions for users..."
                                    rows={4}
                                    className="bg-secondary/40 p-4 border-none font-bold rounded-xl w-full text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            </div>

                            <div className="flex items-center justify-between sm:col-span-2 bg-secondary/20 p-5 rounded-2xl border border-border/40">
                                <div>
                                    <p className="font-black text-sm text-foreground">Activate Announcement (ON)</p>
                                    <p className="text-[10px] text-muted-foreground font-bold">Pops up automatically for all shop users when they enter the system</p>
                                </div>
                                <Switch
                                    checked={form.isActive}
                                    onCheckedChange={(v) => setForm((f) => ({ ...f, isActive: v }))}
                                />
                            </div>
                        </div>

                        {/* Live Video Preview */}
                        {previewMedia.type !== "none" && (
                            <div className="space-y-2 pt-2">
                                <Label className="font-bold text-[10px] uppercase text-muted-foreground flex items-center gap-1.5 ml-1">
                                    <Video className="w-3 h-3 text-primary" /> Live Video Preview
                                </Label>
                                <div className="rounded-2xl overflow-hidden border border-border aspect-video max-h-64 bg-black shadow-xl">
                                    <iframe src={previewMedia.embedUrl} className="w-full h-full border-none" allowFullScreen />
                                </div>
                            </div>
                        )}

                        <div className="flex justify-end pt-2">
                            <Button
                                type="submit"
                                disabled={formLoading}
                                className="h-12 px-8 rounded-xl font-black uppercase tracking-wider shadow-xl shadow-primary/20 hover:scale-[1.02] transition-transform"
                            >
                                <Plus className="w-5 h-5 mr-2" /> {formLoading ? "Publishing..." : "Publish Announcement"}
                            </Button>
                        </div>
                    </form>
                </div>

                {/* Published Announcements Management Table */}
                <div className="space-y-4">
                    <h3 className="text-xl font-black italic text-foreground tracking-tight flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-primary" /> All System Announcements ({announcements.length})
                    </h3>

                    {loading ? (
                        <Card className="border-none shadow-xl">
                            <CardContent className="p-12 text-center">
                                <RefreshCw className="w-8 h-8 animate-spin mx-auto text-primary/40 mb-3" />
                                <p className="text-sm font-bold text-muted-foreground">Loading announcements...</p>
                            </CardContent>
                        </Card>
                    ) : announcements.length === 0 ? (
                        <Card className="border-none shadow-xl">
                            <CardContent className="p-12 text-center opacity-40">
                                <Megaphone className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                                <p className="text-lg font-black italic">No announcements published yet.</p>
                                <p className="text-xs font-bold mt-1">Use the form above to publish your first announcement or promo video.</p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 gap-4">
                            {announcements.map((a) => (
                                <Card key={a.id} className={cn("border-none shadow-xl relative overflow-hidden transition-all", a.is_active ? "ring-2 ring-emerald-500/40 bg-emerald-500/5" : "bg-card")}>
                                    <CardContent className="p-6">
                                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                                            <div className="space-y-2 flex-1">
                                                <div className="flex items-center gap-3">
                                                    <Badge variant={a.is_active ? "default" : "secondary"} className={cn("text-[10px] font-black uppercase px-3 py-1 rounded-full shadow-sm", a.is_active ? "bg-emerald-600 text-white animate-pulse" : "text-muted-foreground")}>
                                                        {a.is_active ? "ACTIVE (ON)" : "INACTIVE (OFF)"}
                                                    </Badge>
                                                    <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
                                                        {a.created_at ? new Date(a.created_at).toLocaleDateString() : "Just now"}
                                                    </span>
                                                </div>

                                                <h4 className="text-xl font-black tracking-tight text-foreground">{a.title}</h4>

                                                {a.description && (
                                                    <p className="text-sm text-muted-foreground font-medium line-clamp-2">{a.description}</p>
                                                )}

                                                {a.video_url && (
                                                    <p className="text-xs font-bold text-primary flex items-center gap-1.5 truncate">
                                                        <Video className="w-4 h-4 shrink-0" /> {a.video_url}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="flex items-center gap-3 shrink-0">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleToggle(a.id)}
                                                    className={cn("h-10 font-bold gap-2 rounded-xl text-xs px-4", a.is_active ? "border-amber-500/40 text-amber-600 hover:bg-amber-50" : "border-emerald-500/40 text-emerald-600 hover:bg-emerald-50")}
                                                >
                                                    <Power className="w-4 h-4" />
                                                    {a.is_active ? "Turn OFF" : "Turn ON"}
                                                </Button>

                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDelete(a.id)}
                                                    className="h-10 text-destructive hover:bg-destructive/10 rounded-xl px-4 font-bold"
                                                >
                                                    <Trash2 className="w-4 h-4 mr-2" /> Delete
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
