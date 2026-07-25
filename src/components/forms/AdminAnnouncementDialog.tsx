import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { announcementsApi, AnnouncementRecord } from "@/api/announcements.api";
import { getVideoEmbedUrl } from "../modals/AnnouncementModal";
import { Megaphone, Plus, Trash2, Power, Video, Sparkles, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/hooks/useLanguage";
import { cn } from "@/lib/utils";

export function AdminAnnouncementDialog({ trigger }: { trigger?: React.ReactNode }) {
    const [open, setOpen] = useState(false);
    const [announcements, setAnnouncements] = useState<AnnouncementRecord[]>([]);
    const [loading, setLoading] = useState(false);
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
        if (open) {
            loadAnnouncements();
        }
    }, [open]);

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
            toast.error(err.message || "Failed to create announcement");
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
            toast.success("Announcement removed");
            loadAnnouncements();
        } catch {
            toast.error("Failed to delete announcement");
        }
    };

    const previewMedia = getVideoEmbedUrl(form.videoUrl);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button className="h-11 rounded-xl shadow-md gap-2 px-5 font-black bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white">
                        <Megaphone className="w-5 h-5 animate-pulse" /> Announcement & Video Promo
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent aria-describedby={undefined} className="sm:max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl border-none shadow-2xl p-0 overflow-hidden bg-card">
                {/* Header */}
                <div className="bg-primary/5 p-6 border-b border-border/40">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black italic tracking-tight flex items-center gap-3">
                            <Megaphone className="w-7 h-7 text-primary" /> System Announcement & Video Promo Manager
                        </DialogTitle>
                        <p className="text-xs text-muted-foreground font-bold mt-1">
                            Publish system updates, video tutorials, or promotional popups for all shop users.
                        </p>
                    </DialogHeader>
                </div>

                <div className="p-6 space-y-8">
                    {/* Create Form */}
                    <form onSubmit={handleCreate} className="bg-secondary/20 p-6 rounded-2xl border border-border/40 space-y-4">
                        <p className="text-xs font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2">
                            <Sparkles className="w-4 h-4" /> Create New Video / Announcement Popup
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5 flex flex-col sm:col-span-2">
                                <Label className="font-bold text-xs uppercase text-muted-foreground">Announcement Title *</Label>
                                <Input
                                    value={form.title}
                                    onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                                    placeholder="e.g. New Inventory & Reporting Update Available!"
                                    className="bg-background h-12 border-border font-bold rounded-xl"
                                />
                            </div>

                            <div className="space-y-1.5 flex flex-col sm:col-span-2">
                                <Label className="font-bold text-xs uppercase text-muted-foreground">Video Link (YouTube, Vimeo, or MP4 URL)</Label>
                                <Input
                                    value={form.videoUrl}
                                    onChange={(e) => setForm((f) => ({ ...f, videoUrl: e.target.value }))}
                                    placeholder="e.g. https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                                    className="bg-background h-12 border-border font-bold rounded-xl"
                                />
                            </div>

                            <div className="space-y-1.5 flex flex-col sm:col-span-2">
                                <Label className="font-bold text-xs uppercase text-muted-foreground">Update Description / Release Notes</Label>
                                <textarea
                                    value={form.description}
                                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                                    placeholder="Write details or instructions for users..."
                                    rows={3}
                                    className="bg-background p-3 border border-border font-bold rounded-xl w-full text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            </div>

                            <div className="flex items-center justify-between sm:col-span-2 bg-background p-4 rounded-xl border border-border">
                                <div>
                                    <p className="font-black text-sm text-foreground">Activate Immediately (ON)</p>
                                    <p className="text-[10px] text-muted-foreground font-bold">Pop up for all users when they open the app</p>
                                </div>
                                <Switch
                                    checked={form.isActive}
                                    onCheckedChange={(v) => setForm((f) => ({ ...f, isActive: v }))}
                                />
                            </div>
                        </div>

                        {/* Live Video Preview if URL added */}
                        {previewMedia.type !== "none" && (
                            <div className="space-y-2 pt-2">
                                <Label className="font-bold text-[10px] uppercase text-muted-foreground flex items-center gap-1.5">
                                    <Video className="w-3.5 h-3.5 text-primary" /> Live Video Preview
                                </Label>
                                <div className="rounded-xl overflow-hidden border border-border aspect-video max-h-48 bg-black">
                                    <iframe src={previewMedia.embedUrl} className="w-full h-full border-none" allowFullScreen />
                                </div>
                            </div>
                        )}

                        <div className="flex justify-end pt-2">
                            <Button
                                type="submit"
                                disabled={formLoading}
                                className="h-11 px-8 rounded-xl font-black uppercase tracking-wider shadow-lg shadow-primary/20"
                            >
                                {formLoading ? "Publishing..." : "Publish Announcement"}
                            </Button>
                        </div>
                    </form>

                    {/* Announcements List */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <p className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">
                                Existing System Popups ({announcements.length})
                            </p>
                            <Button variant="ghost" size="sm" onClick={loadAnnouncements} className="h-8 gap-1 font-bold">
                                <RefreshCw className="w-3.5 h-3.5" /> Refresh
                            </Button>
                        </div>

                        {loading ? (
                            <p className="text-center py-8 text-sm font-bold text-muted-foreground animate-pulse">Loading announcements...</p>
                        ) : announcements.length === 0 ? (
                            <p className="text-center py-8 text-sm font-bold text-muted-foreground opacity-50">No announcements created yet.</p>
                        ) : (
                            <div className="space-y-3">
                                {announcements.map((a) => (
                                    <div key={a.id} className="bg-card border border-border/60 p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm hover:border-primary/40 transition-colors">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <Badge variant={a.is_active ? "default" : "secondary"} className={cn("text-[10px] font-black uppercase px-2.5 py-0.5", a.is_active ? "bg-emerald-600 text-white" : "text-muted-foreground")}>
                                                    {a.is_active ? "ACTIVE (ON)" : "INACTIVE (OFF)"}
                                                </Badge>
                                                <p className="font-black text-base text-foreground">{a.title}</p>
                                            </div>
                                            {a.video_url && (
                                                <p className="text-[11px] font-bold text-primary truncate max-w-md flex items-center gap-1">
                                                    <Video className="w-3 h-3" /> {a.video_url}
                                                </p>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleToggle(a.id)}
                                                className={cn("h-9 font-bold gap-1.5 rounded-xl text-xs", a.is_active ? "border-amber-500/40 text-amber-600 hover:bg-amber-50" : "border-emerald-500/40 text-emerald-600 hover:bg-emerald-50")}
                                            >
                                                <Power className="w-3.5 h-3.5" />
                                                {a.is_active ? "Turn OFF" : "Turn ON"}
                                            </Button>

                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDelete(a.id)}
                                                className="w-9 h-9 text-destructive hover:bg-destructive/10 rounded-xl"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
