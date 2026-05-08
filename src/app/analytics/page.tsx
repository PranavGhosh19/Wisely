"use client";

import { useMemo, useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  PieChart as RePieChart, Pie, Cell, ResponsiveContainer, 
  LineChart as ReLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip
} from "recharts";
import { useStore } from "@/lib/store";
import { useCollection, useMemoFirebase, useFirestore } from "@/firebase";
import { collection, collectionGroup, query, where } from "firebase/firestore";
import { format, subMonths, startOfMonth, endOfMonth, isWithinInterval, isToday, isThisMonth } from "date-fns";
import { FileSpreadsheet, Loader2, Filter, Zap, LayoutGrid, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getCurrencySymbol, formatCompactNumber, cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { generateMonthlySpreadsheet, downloadWorkbook } from "@/lib/export-utils";

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

type TimeFilter = 'ALL' | 'MONTH' | 'TODAY';
type Scope = 'ALL' | 'PERSONAL' | 'GROUP';

export default function AnalyticsPage() {
  const { user } = useStore();
  const db = useFirestore();
  const [mounted, setMounted] = useState(false);
  const [scope, setScope] = useState<Scope>("ALL");
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('MONTH');
  const [selectedGroupId, setSelectedGroupId] = useState<string>("ALL_GROUPS");
  const [isExporting, setIsExporting] = useState(false);

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

    if (scope === "ALL") base = [...personal, ...group];
    else if (scope === "PERSONAL") base = personal;
    else if (scope === "GROUP") {
      base = selectedGroupId === "ALL_GROUPS" 
        ? group 
        : group.filter(e => e.groupId === selectedGroupId);
    }

    return base.filter(exp => {
      const date = new Date(exp.date);
      if (timeFilter === 'TODAY') return isToday(date);
      if (timeFilter === 'MONTH') return isThisMonth(date);
      return true;
    });
  }, [personalExpenses, groupExpenses, scope, timeFilter, selectedGroupId]);

  const pieData = useMemo(() => {
    const categories: Record<string, number> = {};
    filteredExpenses.forEach(exp => {
      const amount = exp.type === 'GROUP' ? (exp.splitBetween?.find((s: any) => s.userId === user?.uid)?.amount || 0) : exp.amount;
      categories[exp.category] = (categories[exp.category] || 0) + amount;
    });
    return Object.entries(categories)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [filteredExpenses, user?.uid]);

  const trendData = useMemo(() => {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const date = subMonths(new Date(), i);
      months.push({
        name: format(date, "MMM"),
        start: startOfMonth(date),
        end: endOfMonth(date),
        amount: 0
      });
    }

    filteredExpenses.forEach(exp => {
      const expDate = new Date(exp.date);
      const amount = exp.type === 'GROUP' ? (exp.splitBetween?.find((s: any) => s.userId === user?.uid)?.amount || 0) : exp.amount;
      months.forEach(month => {
        if (isWithinInterval(expDate, { start: month.start, end: month.end })) {
          month.amount += amount;
        }
      });
    });

    return months.map(m => ({ name: m.name, amount: parseFloat(m.amount.toFixed(2)) }));
  }, [filteredExpenses, user?.uid]);

  const handleExport = async () => {
    if (filteredExpenses.length === 0) return;
    setIsExporting(true);
    try {
      const filename = `Wisely_Metrics_${format(new Date(), 'yyyy-MM-dd')}.xlsx`;
      const exportData = filteredExpenses.map(exp => ({
        ...exp,
        amount: exp.type === 'GROUP' ? (exp.splitBetween?.find((s: any) => s.userId === user?.uid)?.amount || 0) : exp.amount,
        paidByLabel: exp.type === 'GROUP' ? 'Shared Vault' : 'Private Vault'
      }));
      const workbook = generateMonthlySpreadsheet(exportData, user?.email || '', symbol);
      downloadWorkbook(workbook, filename);
    } catch (error) {
      console.error("Export failed", error);
    } finally {
      setIsExporting(false);
    }
  };

  if (!mounted) return null;

  const isLoading = loadingPersonal || loadingGroups;

  return (
    <div className="flex min-h-screen flex-col md:flex-row bg-background no-scrollbar">
      <Navbar />
      
      <main className="flex-1 p-4 md:p-8 pb-32 md:pb-8 max-w-7xl mx-auto w-full">
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex flex-col gap-6"
        >
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h2 className="text-3xl md:text-5xl font-black text-glow uppercase tracking-tighter">DEEP METRICS</h2>
                <Button 
                  onClick={handleExport}
                  disabled={isExporting || filteredExpenses.length === 0}
                  variant="outline" 
                  size="sm" 
                  className="h-10 px-4 rounded-xl font-black uppercase tracking-widest text-[10px] border-primary/20 hover:bg-primary/5 glow-primary gap-2"
                >
                  {isExporting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FileSpreadsheet className="h-3.5 w-3.5" />}
                  Export Ledger
                </Button>
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground">Neural Pathing / {timeFilter} Analysis</p>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10">
                {(['ALL', 'PERSONAL', 'GROUP'] as const).map((s) => (
                  <Button 
                    key={s}
                    variant={scope === s ? "secondary" : "ghost"} 
                    size="sm" 
                    className={cn(
                      "rounded-lg h-8 text-[9px] uppercase font-black tracking-widest px-3",
                      scope === s && "bg-primary text-primary-foreground glow-primary"
                    )}
                    onClick={() => {
                      setScope(s);
                      if (s !== 'GROUP') setSelectedGroupId('ALL_GROUPS');
                    }}
                  >
                    {s === 'ALL' ? 'Total' : s === 'PERSONAL' ? 'Private' : 'Shared'}
                  </Button>
                ))}
              </div>

              <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10">
                {(['ALL', 'MONTH', 'TODAY'] as TimeFilter[]).map((f) => (
                  <Button 
                    key={f}
                    variant={timeFilter === f ? "secondary" : "ghost"} 
                    size="sm" 
                    className={cn(
                      "rounded-lg h-8 text-[9px] uppercase font-black tracking-widest px-3",
                      timeFilter === f && "bg-accent text-accent-foreground glow-accent"
                    )}
                    onClick={() => setTimeFilter(f)}
                  >
                    {f === 'ALL' ? 'History' : f === 'MONTH' ? 'Cycle' : 'Today'}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          <AnimatePresence>
            {scope === 'GROUP' && userGroups && userGroups.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="flex flex-wrap gap-2 p-1 bg-white/5 rounded-2xl border border-white/5">
                  <Button 
                    variant={selectedGroupId === "ALL_GROUPS" ? "secondary" : "ghost"} 
                    size="sm"
                    className={cn(
                      "h-8 rounded-xl text-[9px] font-black uppercase tracking-widest gap-2",
                      selectedGroupId === "ALL_GROUPS" && "bg-white/10 text-white"
                    )}
                    onClick={() => setSelectedGroupId("ALL_GROUPS")}
                  >
                    <LayoutGrid className="h-3 w-3" />
                    All Sectors
                  </Button>
                  {userGroups.map((g) => (
                    <Button 
                      key={g.id}
                      variant={selectedGroupId === g.id ? "secondary" : "ghost"} 
                      size="sm"
                      className={cn(
                        "h-8 rounded-xl text-[9px] font-black uppercase tracking-widest gap-2",
                        selectedGroupId === g.id && "bg-accent text-accent-foreground glow-accent"
                      )}
                      onClick={() => setSelectedGroupId(g.id)}
                    >
                      <Users className="h-3 w-3" />
                      {g.name}
                    </Button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.header>

        {isLoading ? (
          <div className="h-[400px] flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <div className="h-12 w-12 animate-spin rounded-[1rem] border-4 border-primary border-t-transparent glow-primary" />
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Decrypting Signal Patterns...</p>
            </div>
          </div>
        ) : filteredExpenses.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-24 text-center glass-card rounded-[3rem] border-dashed border-white/10">
            <div className="h-20 w-20 glass rounded-[2rem] flex items-center justify-center text-primary mb-6 glow-primary">
              <Filter className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-black uppercase tracking-tight text-glow">Zero Data Node</h3>
            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mt-2">Initialize a financial cycle to generate metrics.</p>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid gap-6 md:grid-cols-2"
          >
            <Card className="glass-card rounded-[2.5rem] overflow-hidden border-white/5 h-full">
              <CardHeader className="pb-0 pt-8 px-8">
                <CardTitle className="text-xs font-black uppercase tracking-[0.3em] flex items-center gap-3">
                   <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                   Entropy Distribution
                </CardTitle>
                <CardDescription className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mt-1">Categorical split / Active scope</CardDescription>
              </CardHeader>
              <CardContent className="h-[450px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RePieChart margin={{ top: 40, right: 80, left: 80, bottom: 40 }}>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={85}
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

            <Card className="glass-card rounded-[2.5rem] overflow-hidden border-white/5 h-full">
              <CardHeader className="pb-0 pt-8 px-8">
                <CardTitle className="text-xs font-black uppercase tracking-[0.3em] flex items-center gap-3">
                   <div className="h-2 w-2 rounded-full bg-accent animate-pulse" />
                   Spending Velocity
                </CardTitle>
                <CardDescription className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mt-1">Trajectory / Contextual Stream</CardDescription>
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
          </motion.div>
        )}
      </main>
    </div>
  );
}
