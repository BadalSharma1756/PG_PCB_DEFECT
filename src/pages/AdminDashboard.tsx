import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { LogOut, RefreshCw, Download, Circle, Settings, Filter, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import PGLogo from "@/components/PGLogo";
import { useDefects } from "@/hooks/useDefects";
import { useConfig } from "@/hooks/useConfig";
import { getPlants, getLines, ADMIN_PORTAL_PASSWORD, EXCEL_DOWNLOAD_PASSWORD } from "@/lib/constants";
import { toast } from "@/hooks/use-toast";
import * as XLSX from "xlsx";
import { fetchDefectsForExport } from "@/hooks/useDefects";

const SHIFTS = ["Morning", "Evening"];

// Chart colours – light pastels
const CHART_COLORS = [
  "#90CAF9", // light blue
  "#A5D6A7", // light green
  "#CE93D8", // light purple
  "#FFCC80", // light orange
  "#80DEEA", // light cyan
  "#F48FB1", // light pink
  "#9FA8DA", // light indigo
  "#80CBC4", // light teal
];

// KPI cards: white background + light coloured border (screenshot style)
const CARD_BORDER_COLORS = [
  "border-l-4 border-l-[#64B5F6]",   // light blue
  "border-l-4 border-l-[#EF9A9A]",   // light red
  "border-l-4 border-l-[#81C784]",   // light green
  "border-l-4 border-l-[#CE93D8]",   // light purple
  "border-l-4 border-l-[#FFB74D]",   // light orange
  "border-l-4 border-l-[#A5D6A7]",   // light green 2
  "border-l-4 border-l-[#B39DDB]",   // light purple 2
  "border-l-4 border-l-[#B0BEC5]",   // light gray (QR card)
];

const AdminDashboard = () => {
  const navigate = useNavigate();
  const adminLocation = localStorage.getItem("pg_admin_location") || "Pune";
  const { config } = useConfig();
  const plants = config?.plants ?? getPlants();
  const lines = config?.lines ?? getLines();
  const { defects, useFirebase } = useDefects(adminLocation);

  const [filterPlant, setFilterPlant] = useState("all");
  const [filterLine, setFilterLine] = useState("all");
  const [filterShift, setFilterShift] = useState("all");
  const [portalDialogOpen, setPortalDialogOpen] = useState(false);
  const [portalPassword, setPortalPassword] = useState("");
  const [portalPasswordError, setPortalPasswordError] = useState("");
  const [excelDialogOpen, setExcelDialogOpen] = useState(false);
  const [excelPassword, setExcelPassword] = useState("");
  const [excelPasswordError, setExcelPasswordError] = useState("");
  const [pendingExcelType, setPendingExcelType] = useState<"overall" | "monthly" | "today" | null>(null);

  const filteredDefects = useMemo(() => {
    return defects.filter((d) => {
      if (filterPlant !== "all" && d.plant !== filterPlant) return false;
      if (filterLine !== "all" && d.line !== filterLine) return false;
      if (filterShift !== "all" && d.shift !== filterShift) return false;
      return true;
    });
  }, [defects, filterPlant, filterLine, filterShift]);

  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();

  const stats = useMemo(() => {
    const todayCount = filteredDefects.filter((d) => new Date(d.timestamp).toDateString() === today).reduce((s, d) => s + d.quantity, 0);
    const yesterdayCount = filteredDefects.filter((d) => new Date(d.timestamp).toDateString() === yesterday).reduce((s, d) => s + d.quantity, 0);
    const total = filteredDefects.reduce((s, d) => s + d.quantity, 0);
    const thisMonth = filteredDefects.filter((d) => new Date(d.timestamp).getMonth() === new Date().getMonth()).reduce((s, d) => s + d.quantity, 0);
    const days = new Set(filteredDefects.map((d) => new Date(d.timestamp).toDateString())).size || 1;
    return { todayCount, yesterdayCount, total, thisMonth, avgDaily: (total / days).toFixed(1), records: filteredDefects.length };
  }, [filteredDefects, today, yesterday]);

  const plantData = useMemo(() => {
    const map: Record<string, number> = {};
    filteredDefects.forEach((d) => {
      map[d.plant] = (map[d.plant] || 0) + d.quantity;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [filteredDefects]);

  const shiftData = useMemo(() => {
    const map: Record<string, number> = {};
    filteredDefects.forEach((d) => {
      map[d.shift] = (map[d.shift] || 0) + d.quantity;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [filteredDefects]);

  const actionData = useMemo(() => {
    const map: Record<string, number> = {};
    filteredDefects.forEach((d) => {
      map[d.action] = (map[d.action] || 0) + d.quantity;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [filteredDefects]);

  const defectTypeData = useMemo(() => {
    const map: Record<string, number> = {};
    filteredDefects.forEach((d) => {
      map[d.defect] = (map[d.defect] || 0) + d.quantity;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [filteredDefects]);

  const locationData = useMemo(() => {
    const map: Record<string, number> = {};
    filteredDefects.forEach((d) => {
      map[d.location] = (map[d.location] || 0) + d.quantity;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [filteredDefects]);

  const weeklyData = useMemo(() => {
    const now = new Date();
    const start = new Date(now);
    start.setDate(now.getDate() - 6);
    start.setHours(0, 0, 0, 0);
    const days: { name: string; count: number; fullDate: Date }[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      const dayStr = d.toLocaleDateString("en-IN", { weekday: "short" });
      const count = filteredDefects
        .filter((x) => {
          const t = new Date(x.timestamp);
          return t.toDateString() === d.toDateString();
        })
        .reduce((s, x) => s + x.quantity, 0);
      days.push({ name: dayStr, count, fullDate: d });
    }
    return days;
  }, [filteredDefects]);

  const iduOduParetoData = useMemo(() => {
    const idu = filteredDefects.filter((d) => d.unitType === "IDU").reduce((s, d) => s + d.quantity, 0);
    const odu = filteredDefects.filter((d) => d.unitType === "ODU").reduce((s, d) => s + d.quantity, 0);
    return [
      { name: "IDU", value: idu, fill: CHART_COLORS[0] as string },
      { name: "ODU", value: odu, fill: CHART_COLORS[1] as string },
    ].filter((x) => x.value > 0);
  }, [filteredDefects]);

  const openExcelDialog = (type: "overall" | "monthly" | "today") => {
    setPendingExcelType(type);
    setExcelPassword("");
    setExcelPasswordError("");
    setExcelDialogOpen(true);
  };

  const handleExcelDownloadWithPassword = async () => {
    if (excelPassword !== EXCEL_DOWNLOAD_PASSWORD) {
      setExcelPasswordError("Invalid password. Download not allowed.");
      return;
    }
    if (!pendingExcelType) return;
    setExcelPasswordError("");
    const type = pendingExcelType;
    setExcelDialogOpen(false);
    setPendingExcelType(null);
    setExcelPassword("");
    const all = await fetchDefectsForExport(adminLocation);
    const currentMonth = new Date().getMonth();
    const todayStr = new Date().toDateString();
    let data = all;
    let sheetName = "Defects";
    if (type === "monthly") {
      data = all.filter((d) => new Date(d.timestamp).getMonth() === currentMonth);
      sheetName = "Monthly";
    } else if (type === "today") {
      data = all.filter((d) => new Date(d.timestamp).toDateString() === todayStr);
      sheetName = "Today";
    } else {
      sheetName = "Overall";
    }
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
    const label = type === "overall" ? "Overall" : type === "monthly" ? "Monthly" : "Today";
    XLSX.writeFile(wb, `PG_Defect_${label}_${adminLocation}.xlsx`);
    toast({ title: "Downloaded", description: `${label} defect report exported` });
  };

  const handleLogout = () => {
    localStorage.removeItem("pg_admin_auth");
    localStorage.removeItem("pg_admin_location");
    localStorage.removeItem("pg_admin_email");
    navigate("/");
  };

  const clearFilters = () => {
    setFilterPlant("all");
    setFilterLine("all");
    setFilterShift("all");
  };

  const handleAdminPortalClick = () => {
    setPortalPassword("");
    setPortalPasswordError("");
    setPortalDialogOpen(true);
  };

  const handlePortalUnlock = () => {
    if (portalPassword === ADMIN_PORTAL_PASSWORD) {
      setPortalDialogOpen(false);
      navigate("/admin/portal");
    } else {
      setPortalPasswordError("Invalid portal password");
    }
  };

  const hasActiveFilters = filterPlant !== "all" || filterLine !== "all" || filterShift !== "all";
  const qrUrl = `${window.location.origin}/employee`;

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-30 border-b shadow-sm">
        <header className="bg-red-600 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <PGLogo size="sm" />
            <div>
              <span className="font-semibold text-white text-sm md:text-base">PCB Defect Monitoring Dashboard</span>
              <span className="ml-2 text-xs text-red-100">({adminLocation})</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {useFirebase && (
              <div className="flex items-center gap-1 text-green-300">
                <Circle className="h-2.5 w-2.5 fill-current" />
                <span className="text-xs font-medium">LIVE</span>
              </div>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="secondary" className="bg-white text-red-800 border border-white/80 hover:bg-red-50">
                  <Download className="h-4 w-4 mr-1" /> Download Excel <ChevronDown className="h-4 w-4 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => openExcelDialog("overall")}>Overall defect</DropdownMenuItem>
                <DropdownMenuItem onClick={() => openExcelDialog("monthly")}>Monthly wise</DropdownMenuItem>
                <DropdownMenuItem onClick={() => openExcelDialog("today")}>Today defect</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button size="sm" variant="secondary" className="bg-white/90 text-red-800 hover:bg-white" onClick={() => window.location.reload()}>
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="secondary" className="bg-white/90 text-red-800 hover:bg-white" onClick={handleAdminPortalClick}>
              <Settings className="h-4 w-4 mr-1" /> Admin Panel
            </Button>
            <Button size="sm" variant="secondary" className="bg-white/90 text-red-800 hover:bg-white" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-1" /> Logout
            </Button>
          </div>
        </header>

        <div className="px-4 py-2 bg-white flex flex-wrap items-center gap-2 border-t border-gray-200">
          <Filter className="h-4 w-4 text-gray-500" />
          <Select value={filterPlant} onValueChange={setFilterPlant}>
            <SelectTrigger className="w-[130px] h-8 text-xs"><SelectValue placeholder="Plant" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Plants</SelectItem>
              {plants.map((p: string) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filterLine} onValueChange={setFilterLine}>
            <SelectTrigger className="w-[130px] h-8 text-xs"><SelectValue placeholder="Line" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Lines</SelectItem>
              {lines.map((l: string) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filterShift} onValueChange={setFilterShift}>
            <SelectTrigger className="w-[130px] h-8 text-xs"><SelectValue placeholder="Shift" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Shifts</SelectItem>
              {SHIFTS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
          {hasActiveFilters && (
            <Button size="sm" variant="ghost" onClick={clearFilters} className="h-8 text-xs text-red-600 hover:text-red-700">
              Clear All
            </Button>
          )}
        </div>

        <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {[
              { label: "TODAY'S", value: stats.todayCount },
              { label: "YESTERDAY", value: stats.yesterdayCount },
              { label: "AVG DAILY", value: stats.avgDaily },
              { label: "THIS MONTH", value: stats.thisMonth },
              { label: "TOTAL", value: stats.total },
              { label: "RECORDS", value: stats.records },
            ].map((s, i) => (
              <Card key={s.label} className={`shadow-sm bg-white border border-gray-200 ${CARD_BORDER_COLORS[i % CARD_BORDER_COLORS.length]}`}>
                <CardContent className="pt-3 pb-3 text-center">
                  <p className="text-[10px] font-semibold text-gray-500 tracking-widest">{s.label}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-0.5">{s.value}</p>
                </CardContent>
              </Card>
            ))}
            <Card className={`shadow-sm bg-white border border-gray-200 cursor-pointer hover:shadow-md transition-shadow ${CARD_BORDER_COLORS[7]}`} onClick={() => window.open(qrUrl, "_blank")}>
              <CardContent className="pt-2 pb-2 flex flex-col items-center justify-center">
                <QRCodeSVG value={qrUrl} size={48} />
            
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4 bg-gray-50/50">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardHeader className="pb-2"><CardTitle className="text-sm">Plant Distribution</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={plantData} cx="50%" cy="50%" outerRadius={70} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}>
                    {plantData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardHeader className="pb-2"><CardTitle className="text-sm">Defect Type Distribution</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={defectTypeData} cx="50%" cy="50%" outerRadius={70} dataKey="value" label={({ percent }) => `${(percent * 100).toFixed(1)}%`}>
                    {defectTypeData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: "10px" }} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardHeader className="pb-2"><CardTitle className="text-sm">Shift-wise Defects</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={shiftData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(0,0%,90%)" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="value" fill={CHART_COLORS[2]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardHeader className="pb-2"><CardTitle className="text-sm">Weekly Defects</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(0,0%,90%)" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill={CHART_COLORS[4]} name="Defects" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardHeader className="pb-2"><CardTitle className="text-sm">IDU vs ODU (Pareto)</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={iduOduParetoData} cx="50%" cy="50%" outerRadius={70} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}>
                    {iduOduParetoData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardHeader className="pb-2"><CardTitle className="text-sm">Location Distribution</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={locationData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(0,0%,90%)" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="value" fill={CHART_COLORS[5]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardHeader className="pb-2"><CardTitle className="text-sm">Action Distribution</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={actionData} cx="50%" cy="50%" outerRadius={70} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}>
                    {actionData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardHeader className="pb-2"><CardTitle className="text-sm">Severity Distribution</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={[
                      { name: "Major", value: filteredDefects.filter((d) => d.severity === "Major").reduce((s, d) => s + d.quantity, 0) },
                      { name: "Minor", value: filteredDefects.filter((d) => d.severity === "Minor").reduce((s, d) => s + d.quantity, 0) },
                    ]}
                    cx="50%"
                    cy="50%"
                    outerRadius={70}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
                  >
                    <Cell fill={CHART_COLORS[6]} />
                    <Cell fill={CHART_COLORS[7]} />
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Defect Reports ({filteredDefects.length})</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Time</TableHead>
                  <TableHead>Plant</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Line</TableHead>
                  <TableHead>Shift</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead>Defect</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Model</TableHead>
                  <TableHead>Qty</TableHead>
                  <TableHead>Employee</TableHead>
                  <TableHead>Remark</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDefects.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={13} className="text-center text-muted-foreground py-8">
                      No defects found for the selected filters
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredDefects.map((d) => (
                    <TableRow key={d.id}>
                      <TableCell className="text-xs whitespace-nowrap">{new Date(d.timestamp).toLocaleString()}</TableCell>
                      <TableCell>{d.plant}</TableCell>
                      <TableCell>{d.location}</TableCell>
                      <TableCell>{d.line}</TableCell>
                      <TableCell>{d.shift}</TableCell>
                      <TableCell>{d.unitType}</TableCell>
                      <TableCell>{d.defect}</TableCell>
                      <TableCell>
                        <Badge variant={d.severity === "Major" ? "destructive" : "secondary"}>{d.severity}</Badge>
                      </TableCell>
                      <TableCell>{d.action}</TableCell>
                      <TableCell>{d.model}</TableCell>
                      <TableCell>{d.quantity}</TableCell>
                      <TableCell className="text-xs">{d.employeeName}</TableCell>
                      <TableCell className="text-xs max-w-[150px] truncate">{d.remark || "—"}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Dialog open={portalDialogOpen} onOpenChange={setPortalDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Settings className="h-5 w-5" /> Admin Portal Access</DialogTitle>
            <DialogDescription>Enter portal password to access admin management</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label>Portal Password</Label>
              <Input
                type="password"
                value={portalPassword}
                onChange={(e) => {
                  setPortalPassword(e.target.value);
                  setPortalPasswordError("");
                }}
                onKeyDown={(e) => e.key === "Enter" && handlePortalUnlock()}
                placeholder="Enter portal password"
              />
            </div>
            {portalPasswordError && <p className="text-sm text-destructive">{portalPasswordError}</p>}
            <Button onClick={handlePortalUnlock} className="w-full bg-primary text-primary-foreground">
              Access Portal
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={excelDialogOpen} onOpenChange={(open) => { setExcelDialogOpen(open); if (!open) setPendingExcelType(null); setExcelPassword(""); setExcelPasswordError(""); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Download className="h-5 w-5" /> Excel Download</DialogTitle>
            <DialogDescription>
              Enter password to download {pendingExcelType === "overall" ? "Overall" : pendingExcelType === "monthly" ? "Monthly" : "Today"} defect report. Without correct password, download is not allowed.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label>Password</Label>
              <Input
                type="password"
                value={excelPassword}
                onChange={(e) => { setExcelPassword(e.target.value); setExcelPasswordError(""); }}
                onKeyDown={(e) => e.key === "Enter" && handleExcelDownloadWithPassword()}
                placeholder="Enter download password"
              />
            </div>
            {excelPasswordError && <p className="text-sm text-destructive">{excelPasswordError}</p>}
            <Button onClick={handleExcelDownloadWithPassword} className="w-full bg-red-600 hover:bg-red-700 text-white">
              Download
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;
