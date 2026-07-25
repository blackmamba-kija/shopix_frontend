import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { announcementsApi, AnnouncementRecord } from "@/api/announcements.api";
import { Sparkles, Megaphone, EyeOff, Maximize2, Minimize2 } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { cn } from "@/lib/utils";

export function getVideoEmbedUrl(url?: string): { type: "iframe" | "video" | "none"; embedUrl: string } {
    if (!url || !url.trim()) return { type: "none", embedUrl: "" };
    const clean = url.trim();

    // YouTube - NO AUTOPLAY (autoplay=0)
    const ytMatch = clean.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    if (ytMatch && ytMatch[1]) {
        return { type: "iframe", embedUrl: `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=0&rel=0` };
    }

    // Vimeo - NO AUTOPLAY (autoplay=0)
    const vimeoMatch = clean.match(/vimeo\.com\/(?:.*\/)?([0-9]+)/);
    if (vimeoMatch && vimeoMatch[1]) {
        return { type: "iframe", embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=0` };
    }

    // Direct MP4 / WebM / Video file
    if (clean.match(/\.(mp4|webm|ogg)$/i) || clean.startsWith("blob:") || clean.startsWith("data:")) {
        return { type: "video", embedUrl: clean };
    }

    return { type: "iframe", embedUrl: clean };
}

export function AnnouncementModal() {
    const [announcement, setAnnouncement] = useState<AnnouncementRecord | null>(null);
    const [open, setOpen] = useState(false);
    const [minimized, setMinimized] = useState(true);
    const { t } = useLanguage();

    useEffect(() => {
        let isMounted = true;
        const checkAnnouncement = async () => {
            const active = await announcementsApi.getActive();
            if (!isMounted || !active) return;

            const isActive = active.is_active == true || String(active.is_active) === "1" || String(active.is_active) === "true";
            if (!isActive) return;

            const version = active.updated_at || active.created_at || "v1";
            const permanentHideKey = `permanently_hidden_announcement_${active.id}_${version}`;
            const isPermanentlyHidden = localStorage.getItem(permanentHideKey);
            if (!isPermanentlyHidden) {
                setAnnouncement(active);
                setOpen(true);
            }
        };

        checkAnnouncement();
        return () => { isMounted = false; };
    }, []);

    if (!announcement || !open) return null;

    const handlePermanentHide = () => {
        if (announcement) {
            const version = announcement.updated_at || announcement.created_at || "v1";
            localStorage.setItem(`permanently_hidden_announcement_${announcement.id}_${version}`, "true");
        }
        setOpen(false);
    };

    const media = getVideoEmbedUrl(announcement.video_url);

    return (
        <div className={cn(
            "fixed top-20 right-4 lg:right-6 z-50 shadow-2xl rounded-3xl border border-primary/30 bg-slate-950 text-white backdrop-blur-2xl transition-all duration-300 overflow-hidden",
            minimized ? "w-auto max-w-[340px] sm:max-w-[400px]" : "w-[92vw] sm:w-[440px]"
        )}>
            {/* Minimized Pill Bar Header */}
            <div className="bg-gradient-to-r from-primary/30 via-indigo-600/30 to-purple-600/30 p-3 sm:p-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 overflow-hidden cursor-pointer" onClick={() => setMinimized(!minimized)}>
                    <Badge className="bg-primary text-primary-foreground font-black uppercase text-[9px] px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0 animate-pulse">
                        <Megaphone className="w-3 h-3" /> Update
                    </Badge>
                    <h3 className="text-xs font-black text-white italic truncate pr-1">
                        {announcement.title}
                    </h3>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setMinimized(!minimized)}
                        className="h-7 px-2.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[10px] font-bold gap-1"
                        title={minimized ? "Expand Announcement" : "Minimize"}
                    >
                        {minimized ? (
                            <>
                                <Maximize2 className="w-3 h-3 text-primary" /> Expand
                            </>
                        ) : (
                            <>
                                <Minimize2 className="w-3 h-3" /> Minimize
                            </>
                        )}
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handlePermanentHide}
                        className="w-7 h-7 rounded-lg bg-rose-500/20 hover:bg-rose-500/40 text-rose-300 border border-rose-500/30"
                        title="Permanently Hide Announcement"
                    >
                        <EyeOff className="w-3.5 h-3.5" />
                    </Button>
                </div>
            </div>

            {/* Expanded Body */}
            {!minimized && (
                <div className="p-4 sm:p-5 space-y-4 max-h-[75vh] overflow-y-auto custom-scrollbar animate-in fade-in slide-in-from-top-2 duration-300">
                    {/* Video Player — NO AUTOPLAY */}
                    {media.type !== "none" && (
                        <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-xl bg-black aspect-video">
                            {media.type === "iframe" && (
                                <iframe
                                    src={media.embedUrl}
                                    title={announcement.title}
                                    className="w-full h-full border-none rounded-2xl"
                                    allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                />
                            )}
                            {media.type === "video" && (
                                <video
                                    src={media.embedUrl}
                                    controls
                                    autoPlay={false}
                                    preload="metadata"
                                    className="w-full h-full object-cover rounded-2xl"
                                />
                            )}
                        </div>
                    )}

                    {/* Text Description */}
                    {announcement.description && (
                        <div className="bg-white/5 border border-white/10 p-3.5 rounded-2xl">
                            <p className="text-xs font-medium text-slate-300 leading-relaxed whitespace-pre-line">
                                {announcement.description}
                            </p>
                        </div>
                    )}

                    {/* Action Bar */}
                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/10">
                        <Button
                            onClick={() => setMinimized(true)}
                            variant="outline"
                            size="sm"
                            className="h-8 px-3 rounded-xl border-white/20 hover:bg-white/10 text-white font-bold text-xs"
                        >
                            <Minimize2 className="w-3.5 h-3.5 mr-1" /> Minimize
                        </Button>
                        <Button
                            onClick={handlePermanentHide}
                            size="sm"
                            variant="destructive"
                            className="h-8 px-3 rounded-xl font-bold text-xs gap-1"
                        >
                            <EyeOff className="w-3.5 h-3.5" /> Permanently Hide
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
