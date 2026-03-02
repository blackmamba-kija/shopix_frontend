import { AppLayout } from "@/components/layout/AppLayout";
import { useStore } from "@/store/useStore";
import { usePermissions } from "@/hooks/useAuth";
import {
  FileText,
  Download,
  Calendar,
  Store as StoreIcon,
  PieChart,
  BarChart3,
  Package,
  TrendingUp,
  AlertCircle
} from "lucide-react";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";

const ReportsPage = () => {
  const { user, isAdmin, canAccessShop, filterShops } = usePermissions();
  const allShops = useStore((s) => s.shops);
  const allSales = useStore((s) => s.sales);
  const allServiceSales = useStore((s) => s.serviceSales);
  const allProducts = useStore((s) => s.products);
  const shops = filterShops(allShops);

  const [dateFrom, setDateFrom] = useState(new Date().toISOString().split('T')[0]);
  const [dateTo, setDateTo] = useState(new Date().toISOString().split('T')[0]);
  const [selectedShop, setSelectedShop] = useState("all");
  const [isGenerating, setIsGenerating] = useState<string | null>(null);

  const dateFromRef = useRef<HTMLInputElement>(null);
  const dateToRef = useRef<HTMLInputElement>(null);

  const formatTsh = (v: number) => `Tsh ${v.toLocaleString()}`;

  const reportTypes = [
    {
      id: "sales",
      name: "Daily Sales Report",
      desc: "Detailed breakdown of product sales by date and shop.",
      icon: TrendingUp,
      color: "text-blue-500",
      bg: "bg-blue-500/10"
    },
    {
      id: "services",
      name: "Services Report",
      desc: "Summary of all services (printing, photocopying, etc).",
      icon: FileText,
      color: "text-purple-500",
      bg: "bg-purple-500/10"
    },
    {
      id: "inventory",
      name: "Stock Health Report",
      desc: "Inventory levels, low stock alerts, and expiring items.",
      icon: Package,
      color: "text-orange-500",
      bg: "bg-orange-500/10"
    },
    {
      id: "financial",
      name: "Profit & Loss",
      desc: "Analysis of revenue, costs, and net margins.",
      icon: BarChart3,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10"
    }
  ];

  const getData = (type: string) => {
    const shopFilter = (item: any) => selectedShop === "all" || String(item.shopId) === String(selectedShop);
    const dateFilter = (item: any) => (!dateFrom || item.date >= dateFrom) && (!dateTo || item.date <= dateTo);

    switch (type) {
      case "sales":
        return allSales.filter(s => shopFilter(s) && dateFilter(s));
      case "services":
        return allServiceSales.filter(s => shopFilter(s) && dateFilter(s));
      case "inventory":
        return allProducts.filter(p => shopFilter(p));
      case "financial":
        const filteredSales = allSales.filter(s => shopFilter(s) && dateFilter(s));
        const filteredServices = allServiceSales.filter(s => shopFilter(s) && dateFilter(s));
        return { sales: filteredSales, services: filteredServices };
      default:
        return [];
    }
  };

  const exportToExcel = async (type: string) => {
    setIsGenerating(type + "_excel");
    try {
      // Log action
      const shopName = selectedShop === "all" ? "All Shops" : allShops.find(s => String(s.id) === String(selectedShop))?.name || "Shop";
      useStore.getState().addAuditLog({
        userId: user?.id || "0",
        userName: user?.name || "System",
        action: "EXPORT_EXCEL",
        module: "Reports",
        details: `Exported ${type} report to Excel. Range: ${dateFrom} to ${dateTo}. Shop: ${shopName}`
      });

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Report");
      const reportName = reportTypes.find(r => r.id === type)?.name || "Report";
      const activeShopName = selectedShop === "all" ? "All Shops" : shops.find(s => String(s.id) === String(selectedShop))?.name || "Unknown Shop";

      // --- Header Style ---
      worksheet.mergeCells("A1:G1");
      const titleCell = worksheet.getCell("A1");
      titleCell.value = "YUSTER SHOP";
      titleCell.font = { name: "Arial Black", size: 24, color: { argb: "FF2563EB" }, bold: true };
      titleCell.alignment = { vertical: "middle", horizontal: "center" };

      worksheet.mergeCells("A2:G2");
      const subTitleCell = worksheet.getCell("A2");
      subTitleCell.value = reportName;
      subTitleCell.font = { name: "Arial", size: 16, bold: true, color: { argb: "FF475569" } };
      subTitleCell.alignment = { vertical: "middle", horizontal: "center" };

      worksheet.mergeCells("A3:G3");
      const infoCell = worksheet.getCell("A3");
      infoCell.value = `Shop: ${activeShopName} | Date Range: ${dateFrom || "N/A"} to ${dateTo || "N/A"}`;
      infoCell.font = { italic: true, size: 11, color: { argb: "FF64748B" } };
      infoCell.alignment = { vertical: "middle", horizontal: "center" };

      worksheet.addRow([]); // Gap

      const data = getData(type);

      // --- Columns Configuration ---
      if (type === "sales") {
        const columns = [
          { header: "Date", key: "date", width: 12 },
          { header: "Store", key: "shopName", width: 20 },
          { header: "Product Item", key: "productName", width: 35 },
          { header: "Qty", key: "quantity", width: 8 },
          { header: "Price", key: "sellingPrice", width: 15 },
          { header: "Subtotal", key: "totalCost", width: 15 },
          { header: "Profit", key: "profit", width: 15 },
        ];
        worksheet.columns = columns;
        worksheet.getRow(5).values = columns.map(c => c.header);

        let totalQty = 0;
        let totalRev = 0;
        let totalProf = 0;

        (data as any[]).forEach(s => {
          totalQty += Number(s.quantity || 0);
          totalRev += Number(s.totalCost || 0);
          totalProf += Number(s.profit || 0);
          worksheet.addRow({
            ...s,
            shopName: shops.find(sh => String(sh.id) === String(s.shopId))?.name || "Unknown"
          });
        });

        // Add TOTAL Row
        const totalRow = worksheet.addRow({
          date: "TOTAL",
          quantity: totalQty,
          totalCost: totalRev,
          profit: totalProf
        });
        totalRow.font = { bold: true, size: 12 };
        totalRow.getCell("date").alignment = { horizontal: "center" };
        totalRow.eachCell((cell) => {
          cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF1F5F9" } };
          cell.border = { top: { style: "double" }, bottom: { style: "thick" } };
        });

      } else if (type === "services") {
        const columns = [
          { header: "Date", key: "date", width: 12 },
          { header: "Store", key: "shopName", width: 20 },
          { header: "Service Description", key: "serviceName", width: 35 },
          { header: "Qty", key: "quantity", width: 8 },
          { header: "Unit Price", key: "pricePerUnit", width: 15 },
          { header: "Total Amount", key: "total", width: 15 },
        ];
        worksheet.columns = columns;
        worksheet.getRow(5).values = columns.map(c => c.header);

        let totalQty = 0;
        let totalAmt = 0;

        (data as any[]).forEach(s => {
          totalQty += Number(s.quantity || 0);
          totalAmt += Number(s.total || 0);
          worksheet.addRow({
            ...s,
            shopName: shops.find(sh => String(sh.id) === String(s.shopId))?.name || "Unknown"
          });
        });

        const totalRow = worksheet.addRow({
          date: "TOTAL",
          quantity: totalQty,
          total: totalAmt
        });
        totalRow.font = { bold: true, size: 12 };
        totalRow.eachCell((cell) => {
          cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF1F5F9" } };
          cell.border = { top: { style: "double" }, bottom: { style: "thick" } };
        });

      } else if (type === "inventory") {
        const columns = [
          { header: "Product Name", key: "name", width: 35 },
          { header: "Batch Code", key: "batchNumber", width: 15 },
          { header: "In Stock", key: "quantity", width: 10 },
          { header: "Unit Cost", key: "buyingCost", width: 15 },
          { header: "Sell Price", key: "price", width: 15 },
          { header: "Stock Value", key: "stockValue", width: 15 },
          { header: "Expiry", key: "expiryDate", width: 12 },
        ];
        worksheet.columns = columns;
        worksheet.getRow(5).values = columns.map(c => c.header);

        let totalStock = 0;
        let totalValue = 0;

        (data as any[]).forEach(p => {
          const val = Number(p.quantity || 0) * Number(p.buyingCost || 0);
          totalStock += Number(p.quantity || 0);
          totalValue += val;
          worksheet.addRow({ ...p, price: p.sellingPrice, stockValue: val });
        });

        const totalRow = worksheet.addRow({
          name: "TOTAL INVENTORY SUMMARY",
          quantity: totalStock,
          stockValue: totalValue
        });
        totalRow.font = { bold: true };
        totalRow.eachCell((cell) => { cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF1F5F9" } }; });
      }

      // --- Table Styling ---
      const headerRow = worksheet.getRow(5);
      headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
      headerRow.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF2563EB" } };
      headerRow.alignment = { horizontal: "center" };

      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber > 5) {
          row.alignment = { vertical: "middle" };
          row.eachCell((cell) => {
            cell.border = {
              top: { style: "thin" },
              left: { style: "thin" },
              bottom: { style: "thin" },
              right: { style: "thin" }
            };
            if (typeof cell.value === "number") {
              cell.numFmt = '#,##0';
            }
          });
        }
      });

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      saveAs(blob, `Yusco_${type}_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
      toast.success("Excel report downloaded successfully");
    } catch (e) {
      console.error(e);
      toast.error("Failed to generate Excel report");
    } finally {
      setIsGenerating(null);
    }
  };

  const exportToPDF = async (type: string) => {
    setIsGenerating(type + "_pdf");
    try {
      const doc = new jsPDF() as any;
      const reportName = reportTypes.find(r => r.id === type)?.name || "Report";
      const activeShopName = selectedShop === "all" ? "All Shops" : shops.find(s => String(s.id) === String(selectedShop))?.name || "Unknown Shop";

      // Title
      doc.setFontSize(22);
      doc.setTextColor(37, 99, 235);
      doc.text("YUSCO SHOP", 105, 20, { align: "center" });

      doc.setFontSize(14);
      doc.setTextColor(71, 85, 105);
      doc.text(reportName, 105, 30, { align: "center" });

      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139);
      doc.text(`Shop: ${activeShopName} | Date: ${dateFrom || "N/A"} to ${dateTo || "N/A"}`, 105, 38, { align: "center" });

      const data = getData(type);
      let columns = [];
      let body = [];

      const safeFormat = (val: any) => (Number(val || 0)).toLocaleString();

      if (type === "sales") {
        columns = ["Date", "Item", "Shop", "Qty", "Price", "Total", "Profit"];
        const salesData = data as any[];
        body = salesData.map(s => [
          s.date,
          s.productName,
          shops.find(sh => String(sh.id) === String(s.shopId))?.name || "Unknown",
          s.quantity,
          safeFormat(s.sellingPrice),
          safeFormat(s.totalCost),
          safeFormat(s.profit)
        ]);
        // Add Total Row
        const totalQty = salesData.reduce((sum, s) => sum + Number(s.quantity || 0), 0);
        const totalRev = salesData.reduce((sum, s) => sum + Number(s.totalCost || 0), 0);
        const totalProf = salesData.reduce((sum, s) => sum + Number(s.profit || 0), 0);
        body.push(["TOTAL", "", "", totalQty, "", safeFormat(totalRev), safeFormat(totalProf)]);

      } else if (type === "services") {
        columns = ["Date", "Service", "Shop", "Qty", "Price", "Total"];
        const serviceData = data as any[];
        body = serviceData.map(s => [
          s.date,
          s.serviceName,
          shops.find(sh => String(sh.id) === String(s.shopId))?.name || "Unknown",
          s.quantity,
          safeFormat(s.pricePerUnit),
          safeFormat(s.total)
        ]);
        const totalQty = serviceData.reduce((sum, s) => sum + Number(s.quantity || 0), 0);
        const totalAmt = serviceData.reduce((sum, s) => sum + Number(s.total || 0), 0);
        body.push(["TOTAL", "", "", totalQty, "", safeFormat(totalAmt)]);

      } else if (type === "inventory") {
        columns = ["Name", "Batch", "Stock", "Cost", "Price", "Status"];
        const invData = data as any[];
        body = invData.map(p => [
          p.name,
          p.batchNumber || "-",
          p.quantity,
          safeFormat(p.buyingCost),
          safeFormat(p.sellingPrice),
          p.status
        ]);
      } else if (type === "financial") {
        const finData = data as { sales: any[], services: any[] };
        columns = ["Category", "Items Count", "Revenue", "Profit Contribution"];
        const sRev = finData.sales.reduce((sum, s) => sum + Number(s.totalCost || 0), 0);
        const sProf = finData.sales.reduce((sum, s) => sum + Number(s.profit || 0), 0);
        const vRev = finData.services.reduce((sum, s) => sum + Number(s.total || 0), 0);

        body = [
          ["Product Sales", finData.sales.length, safeFormat(sRev), safeFormat(sProf)],
          ["Services", finData.services.length, safeFormat(vRev), "N/A"],
          ["NET TOTAL", finData.sales.length + finData.services.length, safeFormat(sRev + vRev), safeFormat(sProf)]
        ];
      }

      autoTable(doc, {
        startY: 45,
        head: [columns],
        body: body,
        theme: "grid",
        headStyles: { fillColor: [37, 99, 235], halign: 'center' },
        styles: { fontSize: 8 },
        footStyles: { fillColor: [241, 245, 249], textColor: [0, 0, 0], fontStyle: 'bold' },
        didParseCell: function (cellData: any) {
          if (cellData.row.index === body.length - 1) {
            cellData.cell.styles.fontStyle = 'bold';
            cellData.cell.styles.fillColor = [241, 245, 249];
          }
        },
        columnStyles: {
          3: { halign: 'center' },
          4: { halign: 'right' },
          5: { halign: 'right' },
          6: { halign: 'right' }
        }
      });

      doc.save(`Yusco_${type}_Report_${new Date().toISOString().split('T')[0]}.pdf`);
      toast.success("PDF report downloaded successfully");
    } catch (e) {
      console.error(e);
      toast.error("Failed to generate PDF report");
    } finally {
      setIsGenerating(null);
    }
  };

  return (
    <AppLayout title="Reports & Analytics" subtitle="Comprehensive business insights and formatted exports">
      <div className="flex flex-col gap-6">

        {/* Filter Toolbar */}
        <div className="bg-card border border-border rounded-xl p-4 flex flex-wrap items-center gap-4 shadow-sm">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 p-1.5 rounded-lg">
              <Calendar className="w-4 h-4" />
            </Badge>
            <div className="flex items-center gap-2 group cursor-pointer" onClick={() => (dateFromRef.current as any)?.showPicker?.()}>
              <Input
                ref={dateFromRef}
                type="date"
                className="w-36 h-9 text-xs cursor-pointer focus:bg-background transition-all"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>
            <span className="text-muted-foreground text-xs font-bold uppercase">to</span>
            <div className="flex items-center gap-2 group cursor-pointer" onClick={() => (dateToRef.current as any)?.showPicker?.()}>
              <Input
                ref={dateToRef}
                type="date"
                className="w-36 h-9 text-xs cursor-pointer focus:bg-background transition-all"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 p-1.5 rounded-lg">
              <StoreIcon className="w-4 h-4" />
            </Badge>
            <Select value={selectedShop} onValueChange={setSelectedShop}>
              <SelectTrigger className="w-48 h-9 text-xs font-bold">
                <SelectValue placeholder="Select Shop" />
              </SelectTrigger>
              <SelectContent>
                {isAdmin && <SelectItem value="all">All Available Shops</SelectItem>}
                {shops.map(s => <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Report Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reportTypes.map((report) => (
            <div key={report.id} className="bg-card border border-border rounded-2xl p-6 hover:border-primary/50 transition-all shadow-sm group">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-2xl ${report.bg} transition-transform group-hover:scale-110 duration-300`}>
                    <report.icon className={`w-6 h-6 ${report.color}`} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-foreground">{report.name}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5 max-w-[200px] leading-relaxed">{report.desc}</p>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 gap-2 text-[10px] font-bold uppercase tracking-wider"
                    onClick={() => exportToExcel(report.id)}
                    disabled={isGenerating !== null}
                  >
                    <Download className="w-3.5 h-3.5" />
                    {isGenerating === report.id + "_excel" ? "Generating..." : "Excel AI"}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 gap-2 text-[10px] font-bold uppercase tracking-wider"
                    onClick={() => exportToPDF(report.id)}
                    disabled={isGenerating !== null}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    {isGenerating === report.id + "_pdf" ? "Creating..." : "PDF Print"}
                  </Button>
                </div>
              </div>

              {/* Mini Preview Stats */}
              <div className="mt-6 pt-6 border-t border-border grid grid-cols-2 gap-4">
                {report.id === "sales" && (
                  <>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-muted-foreground font-bold uppercase">Period Revenue</span>
                      <span className="text-sm font-black text-foreground">
                        {formatTsh((getData("sales") as any[]).reduce((sum, s) => sum + Number(s.totalCost || 0), 0))}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-muted-foreground font-bold uppercase">Total Profit</span>
                      <span className="text-sm font-black text-emerald-600">
                        {formatTsh((getData("sales") as any[]).reduce((sum, s) => sum + Number(s.profit || 0), 0))}
                      </span>
                    </div>
                  </>
                )}
                {report.id === "services" && (
                  <>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-muted-foreground font-bold uppercase">Services Cash</span>
                      <span className="text-sm font-black text-foreground">
                        {formatTsh((getData("services") as any[]).reduce((sum, s) => sum + Number(s.total || 0), 0))}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-muted-foreground font-bold uppercase">Transactions</span>
                      <span className="text-sm font-black text-primary">
                        {(getData("services") as any[]).length} Completed
                      </span>
                    </div>
                  </>
                )}
                {report.id === "inventory" && (
                  <>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-muted-foreground font-bold uppercase">Asset Value</span>
                      <span className="text-sm font-black text-foreground">
                        {formatTsh((getData("inventory") as any[]).reduce((sum, p) => sum + (p.quantity * p.buyingCost), 0))}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-muted-foreground font-bold uppercase">Health Alert</span>
                      <div className="flex items-center gap-1">
                        <AlertCircle className="w-3 h-3 text-orange-500" />
                        <span className="text-sm font-black text-orange-600">
                          {(getData("inventory") as any[]).filter(p => p.quantity <= 10).length} Critical
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
};

export default ReportsPage;
