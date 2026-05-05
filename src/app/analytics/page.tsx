
"use client";

import { useMemo, useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  PieChart as RePieChart, Pie, Cell, ResponsiveContainer, 
  BarChart as ReBarChart, Bar, XAxis, YAxis, CartesianGrid,
  LineChart as ReLineChart, Line, Tooltip, Legend
} from "recharts";
import { useStore } from "@/lib/store";
import { useCollection, useMemoFirebase, useFirestore } from "@/firebase";
import { collection, collectionGroup, query, where } from "firebase/firestore";
import { format, subMonths, startOfMonth, endOfMonth, isWithinInterval, startOfDay, endOfDay, parseISO } from "date-fns";
import { PieChart, Layers, User, Users, Calendar as CalendarIcon, X, BarChart3, Download, Mail, FileSpreadsheet, Loader2, ChevronDown, Zap } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getCurrencySymbol, cn, formatCompactNumber } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { generateMonthlySpreadsheet, downloadWorkbook } from "@/lib/export-utils";
import { sendMonthlyReportAction } from "@/app/actions/send-report";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

const COLORS = ['#10B981', '#3380FF', '#facc15', '#8B5CF6', '#EC4899', '#A89E92'];

const renderCustomizedLabel = (props: any, symbol: string) => {
  const { cx, cy, midAngle, outerRadius, index, name, value } = props;
  const RADIAN = Math.PI / 180;
  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);
  
  const sx = cx + (outerRadius + 2) * cos;
  const sy = cy + (outerRadius + 2) * sin;
  const mx = cx + (outerRadius + 15) * cos;
  const my = cy + (outerRadius + 15) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 12;
  const ey = my;
  const textAnchor = cos >= 0 ? 'start' : 'end';

  return (
    <g>
      <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={COLORS[index % COLORS.length]} fill="none" strokeWidth={1.5} />
      <circle cx={ex} cy={ey} r={2.5} fill={COLORS[index % COLORS.length]} stroke="none" />
      <text 
        x={ex + (cos >= 0 ? 1 : -1) * 8} 
        y={ey} 
        textAnchor={textAnchor} 
        fill="hsl(var(--foreground))" 
        style={{ fontSize: '10px', fontWeight: '800', fontFamily: 'var(--font-headline)' }}
      >
        {name}
      </text>
      <text 
        x={ex + (cos >= 0 ? 1 : -1) * 8} 
        y={ey} 
        dy={14} 
        textAnchor={textAnchor} 
        fill="#facc15" 
        style={{ fontSize: '9px', fontWeight: '900', fontFamily: 'var(--font-headline)' }}
      >
        {`${symbol}${formatCompactNumber(value)}`}
      </text>
    </g>
  );
};

export default function AnalyticsPage() {
  const { user, categories: storeCategories } = useStore();
  const db = useFirestore();
  const { toast } = useToast();
  const [mounted, setMounted] = useState(false);
  const [scope, setScope] = useState<"ALL" | "PERSONAL" | "GROUP">("ALL");
  const [selectedGroupId, setSelectedGroupId] = useState<string>("all");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const symbol = getCurrencySymbol(user?.currency);

  const personalQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(
      collection(db, "users", user.uid, "personalExpenses"),
      where("isDeleted", "==", false)
    );
  }, [db, user]);
  const { data: personalExpenses, isLoading: loadingPersonal } = useCollection(personalQuery);

  const groupExpensesQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(
      collectionGroup(db, "expenses"),
      where("groupMemberIds", "array-contains", user.uid),
      where("isDeleted", "==", false)
    );
  }, [db, user]);
  const { data: groupExpenses, isLoading: loadingGroups } = useCollection(groupExpensesQuery);

  const groupsQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(collection(db, "groups"), where("members", "array-contains", user.uid));
  }, [db, user]);
  const { data: userGroups } = useCollection(groupsQuery);

  const filteredExpenses = useMemo(() => {
    let base: any[] = [];
    const personal = (personalExpenses || []).filter(e => e.category !== 'Settlement');
    const group = (groupExpenses || []).filter(e => e.category !== 'Settlement');

    if (scope === "ALL") {
      base = [...personal, ...group];
    } else if (scope === "PERSONAL") {
      base = personal;
    } else if (scope === "GROUP") {
      base = group;
      if (selectedGroupId !== "all") {
        base = base.filter(exp => exp.groupId === selectedGroupId);
      }
    }

    if (selectedDate) {
      const start = startOfDay(selectedDate);
      const end = endOfDay(selectedDate);
      base = base.filter(exp => {
        const expDate = new Date(exp.date);
        return isWithinInterval(expDate, { start, end });
      });
    } else {
      const now = new Date();
      const monthStart = startOfMonth(now);
      const monthEnd = endOfMonth(now);
      base = base.filter(exp => {
        const expDate = new Date(exp.date);
        return isWithinInterval(expDate, { start: monthStart, end: monthEnd });
      });
    }

    return base;
  }, [personalExpenses, groupExpenses, scope, selectedGroupId, selectedDate]);

  const handleEmailReport = async () => {
    if (!user || filteredExpenses.length === 0) return;
    
    setExporting(true);
    try {
      const result = await sendMonthlyReportAction(user.email, format(new Date(), "MMMM yyyy"));
      if (result.success) {
        toast({
          title: "Report Sent",
          description: `An Excel breakdown for ${format(new Date(), "MMMM")} has been sent to ${user.email}.`
        });
      }
    } catch (e) {
      toast({
        variant: "destructive",
        title: "Export Failed",
        description: "Could not send the email report. Please try again."
      });
    } finally {
      setExporting(false);
    }
  };

  const handleDownloadExcel = () => {
    if (!user || filteredExpenses.length === 0) return;
    
    const wb = generateMonthlySpreadsheet(filteredExpenses, user.email, symbol);
    const fileName = `Wisely_Report_${format(new Date(), "yyyy_MM")}.xlsx`;
    downloadWorkbook(wb, fileName);
    
    toast({
      title: "Download Started",
      description: "Your monthly Excel report is being prepared."
    });
  };

  const pieData = useMemo(() => {
    const categories: Record<string, number> = {};
    filteredExpenses.forEach(exp => {
      categories[exp.category] = (categories[exp.category] || 0) + exp.amount;
    });
    return Object.entries(categories)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [filteredExpenses]);

  const trendData = useMemo(() => {
    let base: any[] = [];
    const personal = (personalExpenses || []).filter(e => e.category !== 'Settlement');
    const group = (groupExpenses || []).filter(e => e.category !== 'Settlement');

    if (scope === "ALL") base = [...personal, ...group];
    else if (scope === "PERSONAL") base = personal;
    else if (scope === "GROUP") {
      base = group;
      if (selectedGroupId !== "all") base = base.filter(exp => exp.groupId === selectedGroupId);
    }

    if (base.length === 0) {
      return Array.from({ length: 6 }).map((_, i) => ({
        name: format(subMonths(new Date(), 5 - i), "MMM"),
        amount: 0
      }));
    }

    const minTimestamp = Math.min(...base.map(e => e.date));
    const startDate = startOfMonth(new Date(minTimestamp));
    const today = new Date();
    
    const months = [];
    let current = new Date(startDate);
    
    while (current <= today || format(current, "yyyy-MM") === format(today, "yyyy-MM")) {
      months.push({
        name: format(current, "MMM"),
        start: startOfMonth(current),
        end: endOfMonth(current),
        amount: 0
      });
      current = new Date(current.getFullYear(), current.getMonth() + 1, 1);
      if (months.length > 24) break; 
    }

    base.forEach(exp => {
      const expDate = new Date(exp.date);
      months.forEach(month => {
        if (isWithinInterval(expDate, { start: month.start, end: month.end })) {
          month.amount += exp.amount;
        }
      });
    });

    return months.map(m => ({ name: m.name, amount: parseFloat(m.amount.toFixed(2)) }));
  }, [personalExpenses, groupExpenses, scope, selectedGroupId]);

  const splitData = useMemo(() => {
    const now = new Date();
    const dateStart = selectedDate ? startOfDay(selectedDate) : startOfMonth(now);
    const dateEnd = selectedDate ? endOfDay(selectedDate) : endOfMonth(now);

    const filterByDate = (exp: any) => {
      const expDate = new Date(exp.date);
      return isWithinInterval(expDate, { start: dateStart, end: dateEnd });
    };

    const personal = (personalExpenses || [])
      .filter(e => e.category !== 'Settlement' && filterByDate(e))
      .reduce((acc, exp) => acc + exp.amount, 0);
    const group = (groupExpenses || [])
      .filter(e => e.category !== 'Settlement' && filterByDate(e))
      .reduce((acc, exp) => acc + exp.amount, 0);
      
    return [
      { name: 'Personal', amount: parseFloat(personal.toFixed(2)) },
      { name: 'Group Shared', amount: parseFloat(group.toFixed(2)) }
    ];
  }, [personalExpenses, groupExpenses, selectedDate]);

  const budgetChartData = useMemo(() => {
    if (!user || !storeCategories) return [];
    
    const now = new Date();
    const start = startOfMonth(now).getTime();
    const end = endOfMonth(now).getTime();

    const spending: Record<string, number> = {};
    storeCategories.forEach(cat => spending[cat] = 0);

    const personal = (personalExpenses || []).filter(e => !e.isDeleted && e.category !== 'Settlement' && e.date >= start && e.date <= end);
    const group = (groupExpenses || []).filter(e => !e.isDeleted && e.category !== 'Settlement' && e.date >= start && e.date <= end);

    personal.forEach(exp => {
      if (spending[exp.category] !== undefined) spending[exp.category] += exp.amount;
    });

    group.forEach(exp => {
      const mySplit = exp.splitBetween?.find((s: any) => s.userId === user.uid);
      if (mySplit && spending[exp.category] !== undefined) {
        spending[exp.category] += mySplit.amount;
      }
    });

    return storeCategories.map(cat => {
      const budget = user.categoryBudgets?.[cat] || 0;
      const spent = spending[cat] || 0;
      return {
        name: cat,
        "Current Spend": Math.min(spent, budget),
        "Remaining": Math.max(0, budget - spent),
        "Over Budget": Math.max(0, spent - budget),
        originalBudget: budget,
        originalSpent: spent
      };
    }).filter(item => item.originalSpent > 0.01);
  }, [user, storeCategories, personalExpenses, groupExpenses]);

  if (!mounted) return null;

  const isLoading = loadingPersonal || loadingGroups;

  return (
    <div className="flex min-h-screen flex-col md:flex-row bg-background">
      <Navbar />
      
      <main className="flex-1 p-4 md:p-8 pb-32 md:pb-8 max-w-7xl mx-auto w-full">
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between"
        >
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-3xl font-black text-glow uppercase tracking-tighter">METRICS</h2>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-10 px-4 rounded-xl font-black uppercase tracking-widest text-[10px] border-primary/20 hover:bg-primary/5 glow-primary gap-2" disabled={exporting}>
                    {exporting ? <Loader2 className="h-3 w-3 animate-spin" /> : <FileSpreadsheet className="h-3.5 w-3.5" />}
                    Export
                    <ChevronDown className="h-3 w-3 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="rounded-xl glass border-white/10 shadow-2xl p-2 w-56">
                  <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground px-2 py-2">Monthly Data</p>
                  <DropdownMenuItem onClick={handleEmailReport} className="rounded-lg py-3 cursor-pointer">
                    <Mail className="h-4 w-4 mr-3 text-primary" />
                    <div className="flex flex-col">
                      <span className="font-bold text-sm">Email Report</span>
                      <span className="text-[10px] text-muted-foreground">Send Excel to inbox</span>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-white/5" />
                  <DropdownMenuItem onClick={handleDownloadExcel} className="rounded-lg py-3 cursor-pointer">
                    <Download className="h-4 w-4 mr-3 text-emerald-500" />
                    <div className="flex flex-col">
                      <span className="font-bold text-sm">Download Excel</span>
                      <span className="text-[10px] text-muted-foreground">Save to device</span>
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground">Analysing Period / {format(new Date(), "MMMM yyyy")}</p>
          </div>

          <div className="grid grid-cols-2 sm:flex sm:flex-row gap-3 sm:gap-4 items-end">
            <div className="space-y-1.5">
              <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2 px-1">
                <CalendarIcon className="h-3 w-3" />
                Date Point
              </label>
              <div className="relative group/date">
                <Input
                  type="date"
                  value={selectedDate ? format(selectedDate, "yyyy-MM-dd") : ""}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSelectedDate(val ? parseISO(val) : undefined);
                  }}
                  className="w-full sm:w-[140px] h-10 px-3 pr-8 rounded-xl glass border-white/10 text-xs font-bold uppercase focus:ring-2 focus:ring-primary outline-none"
                />
                {selectedDate && (
                  <button 
                    onClick={() => setSelectedDate(undefined)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-5 w-5 rounded-full bg-white/10 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-white/20 transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2 px-1">
                <Layers className="h-3 w-3" />
                Stream Scope
              </label>
              <Select value={scope} onValueChange={(val: any) => setScope(val)}>
                <SelectTrigger className="w-full sm:w-[180px] h-10 rounded-xl glass border-white/10 text-xs font-bold uppercase">
                  <SelectValue placeholder="Select Scope" />
                </SelectTrigger>
                <SelectContent className="glass border-white/10">
                  <SelectItem value="ALL">All Streams</SelectItem>
                  <SelectItem value="PERSONAL">Private Only</SelectItem>
                  <SelectItem value="GROUP">Shared Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </motion.header>

        {isLoading ? (
          <div className="h-[400px] flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <div className="h-12 w-12 animate-spin rounded-[1rem] border-4 border-primary border-t-transparent glow-primary" />
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Processing Neural Patterns...</p>
            </div>
          </div>
        ) : filteredExpenses.length === 0 ? (
          <Card className="glass-card p-16 text-center rounded-[2.5rem]">
            <div className="max-w-xs mx-auto space-y-4">
              <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center text-primary mx-auto glow-primary">
                <Zap className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold font-headline uppercase tracking-tight">Zero Activity Detected</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">Adjust your stream filters or record a new transaction to begin high-fidelity analysis.</p>
              {selectedDate && (
                <Button variant="outline" onClick={() => setSelectedDate(undefined)} className="h-10 px-6 rounded-xl text-[10px] font-black uppercase tracking-widest border-primary/20 mt-4">
                  Reset Time Drift
                </Button>
              )}
            </div>
          </Card>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid gap-6 md:grid-cols-2"
          >
            <Card className="glass-card rounded-[2.5rem] overflow-hidden border-white/5">
              <CardHeader className="pb-0 pt-8 px-8">
                <CardTitle className="text-xs font-black uppercase tracking-[0.3em] flex items-center gap-3">
                   <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                   Entropy Distribution
                </CardTitle>
                <CardDescription className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mt-1">
                  Categorical breakdown for {selectedDate ? format(selectedDate, "MMM dd") : "Current Cycle"}
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[450px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RePieChart margin={{ top: 40, right: 80, left: 80, bottom: 40 }}>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={75}
                      paddingAngle={8}
                      dataKey="value"
                      label={(props) => renderCustomizedLabel(props, symbol)}
                      labelLine={false}
                      stroke="none"
                    >
                      {pieData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={COLORS[index % COLORS.length]} 
                          stroke="hsl(var(--background))"
                          strokeWidth={4}
                        />
                      ))}
                    </Pie>
                  </RePieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="glass-card rounded-[2.5rem] overflow-hidden border-white/5">
              <CardHeader className="pb-0 pt-8 px-8">
                <CardTitle className="text-xs font-black uppercase tracking-[0.3em] flex items-center gap-3">
                   <div className="h-2 w-2 rounded-full bg-accent animate-pulse" />
                   Spending Velocity
                </CardTitle>
                <CardDescription className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mt-1">Movement trajectory (6-Month Context)</CardDescription>
              </CardHeader>
              <CardContent className="h-[450px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ReLineChart data={trendData} margin={{ top: 40, right: 40, left: 40, bottom: 40 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 10, fontWeight: '800', fill: 'rgba(255,255,255,0.4)' }}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 10, fontWeight: '800', fill: 'rgba(255,255,255,0.4)' }}
                      tickFormatter={(value) => `${symbol}${formatCompactNumber(value)}`}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1rem' }}
                      itemStyle={{ color: '#fff', fontSize: '10px', fontWeight: '800', textTransform: 'uppercase' }}
                      labelStyle={{ display: 'none' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="amount" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={4} 
                      dot={{ r: 4, fill: 'hsl(var(--primary))', strokeWidth: 0 }} 
                      activeDot={{ r: 6, strokeWidth: 0 }}
                      label={{ 
                        position: 'top', 
                        fill: '#facc15', 
                        fontSize: 9, 
                        fontWeight: 900,
                        offset: 14,
                        formatter: (val: number) => `${symbol}${formatCompactNumber(val)}`
                      }}
                    />
                  </ReLineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {budgetChartData.length > 0 && (
              <Card className="glass-card rounded-[2.5rem] overflow-hidden border-white/5 md:col-span-2">
                <CardHeader className="pb-0 pt-8 px-8">
                  <CardTitle className="text-xs font-black uppercase tracking-[0.3em] flex items-center gap-3">
                    <BarChart3 className="h-4 w-4 text-primary" />
                    Target Deviation HUD
                  </CardTitle>
                  <CardDescription className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mt-1">Spend vs. Protocol Limits (This Month)</CardDescription>
                </CardHeader>
                <CardContent className="h-[400px] sm:h-[500px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <ReBarChart 
                      data={budgetChartData} 
                      margin={{ top: 40, right: 40, left: 40, bottom: 80 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                      <XAxis 
                        dataKey="name" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fontSize: 9, fontWeight: 900, fill: '#fff', textTransform: 'uppercase' }}
                        interval={0}
                        angle={-45}
                        textAnchor="end"
                      />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fontSize: 9, fontWeight: 800, fill: 'rgba(255,255,255,0.4)' }}
                        tickFormatter={(value) => `${symbol}${formatCompactNumber(value)}`}
                      />
                      <Tooltip 
                        cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="glass p-4 rounded-2xl border-white/10 shadow-2xl space-y-1">
                                <p className="font-black text-[10px] uppercase tracking-[0.2em] text-primary mb-2">{data.name}</p>
                                <div className="flex justify-between gap-8 items-center text-[10px] font-bold">
                                  <span className="opacity-60 uppercase">Protocol Limit:</span>
                                  <span className="tabular-nums">{symbol}{data.originalBudget.toFixed(0)}</span>
                                </div>
                                <div className="flex justify-between gap-8 items-center text-[10px] font-bold">
                                  <span className="opacity-60 uppercase">Current Usage:</span>
                                  <span className="text-primary tabular-nums">{symbol}{data.originalSpent.toFixed(0)}</span>
                                </div>
                                {data.originalSpent > data.originalBudget && (
                                  <div className="pt-2 mt-2 border-t border-white/5 flex justify-between gap-8 items-center text-[10px] font-black text-destructive uppercase">
                                    <span>Deviation:</span>
                                    <span>+{symbol}{(data.originalSpent - data.originalBudget).toFixed(0)}</span>
                                  </div>
                                )}
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Bar 
                        dataKey="Current Spend" 
                        stackId="a" 
                        fill="hsl(var(--primary))" 
                        radius={[0, 0, 0, 0]}
                        label={{ 
                          position: 'top', 
                          fill: '#facc15', 
                          fontSize: 9, 
                          fontWeight: 900,
                          offset: 10,
                          formatter: (val: number) => val > 0 ? `${symbol}${formatCompactNumber(val)}` : ''
                        }}
                      />
                      <Bar dataKey="Remaining" stackId="a" fill="rgba(16, 185, 129, 0.15)" />
                      <Bar dataKey="Over Budget" stackId="a" fill="hsl(var(--destructive))" />
                    </ReBarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            <Card className="glass-card rounded-[2.5rem] overflow-hidden border-white/5 md:col-span-2">
              <CardHeader className="pb-0 pt-8 px-8">
                <CardTitle className="text-xs font-black uppercase tracking-[0.3em] flex items-center gap-3">
                  Vault Split Analysis
                </CardTitle>
                <CardDescription className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mt-1">Private vs Shared Ledger Balance</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ReBarChart data={splitData} layout="vertical" margin={{ left: 40, right: 100, top: 40 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.05)" />
                    <XAxis 
                      type="number" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 10, fontWeight: '800', fill: 'rgba(255,255,255,0.4)' }}
                      tickFormatter={(value) => `${symbol}${formatCompactNumber(value)}`}
                    />
                    <YAxis 
                      dataKey="name" 
                      type="category" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 10, fontWeight: '900', fill: '#fff', textTransform: 'uppercase' }}
                    />
                    <Bar 
                      dataKey="amount" 
                      fill="hsl(var(--primary))" 
                      radius={[0, 10, 10, 0]} 
                      barSize={40} 
                      label={{ 
                        position: 'right', 
                        fill: '#facc15', 
                        fontSize: 10, 
                        fontWeight: 900,
                        offset: 12,
                        formatter: (val: number) => `${symbol}${formatCompactNumber(val)}`
                      }}
                    />
                  </ReBarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </main>
    </div>
  );
}
