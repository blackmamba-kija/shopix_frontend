import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Upload, Download, FileSpreadsheet, Loader2, AlertCircle } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { useStore } from "@/store/useStore";
import { toast } from "sonner";
import { importsApi } from "@/api/imports.api";

interface ImportDialogProps {
  type: "inventory" | "sales" | "services";
  trigger: React.ReactNode;
}

export const ImportDialog = ({ type, trigger }: ImportDialogProps) => {
  const { t } = useLanguage();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const selectedShopId = useStore((s) => s.selectedShopId);
  const fetchProducts = useStore((s) => s.fetchProducts);
  const fetchSales = useStore((s) => s.fetchSales);
  const fetchServiceSales = useStore((s) => s.fetchServiceSales);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      await importsApi.downloadTemplate(type);
      toast.success(t("template downloaded"));
    } catch (error: any) {
      toast.error(error.message || t("failed to download template"));
    }
  };

  const handleImport = async () => {
    if (!file) {
      toast.error(t("please select a file"));
      return;
    }

    if (!selectedShopId || selectedShopId === "all") {
      toast.error(t("please select a specific shop first"));
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", type);
    formData.append("shop_id", String(selectedShopId));

    try {
      const response = await importsApi.importData(formData);

      if (response.success) {
        toast.success(t(response.message || "imported successfully"));
        setOpen(false);
        setFile(null);
        
        // Refresh data
        if (type === "inventory") fetchProducts();
        else if (type === "sales") fetchSales();
        else if (type === "services") fetchServiceSales();
      } else {
        toast.error(response.message || t("import failed"));
      }
    } catch (error: any) {
      toast.error(error.message || t("error importing file"));
    } finally {
      setLoading(false);
    }
  };

  const handleClear = async () => {
    if (!selectedShopId || selectedShopId === "all") return;
    
    if (!confirm(t("are you sure you want to clear all products? this cannot be undone."))) {
      return;
    }

    setLoading(true);
    try {
      const response = await importsApi.clearInventory(Number(selectedShopId));
      if (response.success) {
        toast.success(t("inventory cleared"));
        fetchProducts();
      } else {
        toast.error(response.message || t("failed to clear inventory"));
      }
    } catch (error: any) {
      toast.error(error.message || t("error clearing inventory"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px] rounded-2xl border-primary/20 bg-card overflow-hidden">
        <div className="bg-primary/10 px-6 py-6 border-b border-border">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-2xl font-black text-foreground">
              <div className="p-2 bg-primary/20 rounded-xl">
                <FileSpreadsheet className="w-6 h-6 text-primary" />
              </div>
              {t(`import ${type}`)}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground font-medium pt-1">
              {t(`upload an excel or csv file to bulk import ${type} items`)}
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="flex flex-col gap-6 p-6">
          {selectedShopId === "all" && (
            <div className="flex items-start gap-3 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-600 dark:text-amber-400">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <p className="text-sm font-bold">
                {t("please select a specific shop from the filter to enable import.")}
              </p>
            </div>
          )}

          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-muted-foreground uppercase tracking-wider">{t("step 1: download template")}</label>
              {type === "inventory" && selectedShopId !== "all" && (
                <button 
                  onClick={handleClear}
                  disabled={loading}
                  className="text-xs font-black text-destructive uppercase hover:underline disabled:opacity-50"
                >
                  {t("clear current inventory")}
                </button>
              )}
            </div>
            <Button 
              variant="outline" 
              className="gap-2 h-12 rounded-xl border-border bg-secondary/50 font-bold hover:bg-secondary transition-colors" 
              onClick={handleDownloadTemplate}
            >
              <Download className="w-4 h-4" /> {t("download template")}
            </Button>
          </div>

          <div className="flex flex-col gap-3">
            <label className="text-xs font-black text-muted-foreground uppercase tracking-wider">{t("step 2: upload your file")}</label>
            <div className="relative border-2 border-dashed border-border rounded-xl p-8 flex flex-col items-center gap-2 hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer bg-secondary/20 group">
              <input 
                type="file" 
                className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed" 
                accept=".xlsx,.xls,.csv"
                onChange={handleFileChange}
                disabled={selectedShopId === "all"}
              />
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
                <Upload className="w-6 h-6 text-primary" />
              </div>
              <p className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                {file ? file.name : t("click or drag and drop file")}
              </p>
              <p className="text-[10px] text-muted-foreground uppercase font-black tracking-tighter opacity-60">
                {t("xlsx, xls, csv (max 5mb)")}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-secondary/30 border-t border-border">
          <Button variant="ghost" onClick={() => setOpen(false)} disabled={loading} className="font-bold rounded-xl">
            {t("cancel")}
          </Button>
          <Button 
            onClick={handleImport} 
            disabled={loading || !file || selectedShopId === "all"} 
            className="gap-2 h-11 px-6 rounded-xl shadow-md font-bold transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            {t("import now")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
