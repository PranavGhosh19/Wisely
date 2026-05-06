
"use client";

import { useMemo, useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  PieChart as RePieChart, Pie, Cell, ResponsiveContainer,
  BarChart as ReBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip
} from "recharts";
import { useStore } from "@/lib/store";
import { useCollection, useMemoFirebase, useFirestore, useDoc } from "@/firebase";
import { collection, query, where, doc } from "firebase/firestore";
import { format, isToday, isThisMonth, startOfMonth, endOfMonth, startOfDay, endOfDay } from "date-fns";
import { ArrowLeft, Filter, Loader2, Users, User, FileSpreadsheet, Download, Zap } from "lucide-react";
import { getCurrencySymbol, formatCompactNumber, cn } from "@/lib/utils";
import { generateMonthlySpreadsheet, downloadWorkbook } from "@/lib/export-utils";
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

type TimeFilter = 'ALL' | 'MONTH' | 'TODAY';
type ScopeFilter = 'GROUP' | 'MYSELF';

function GroupAnalyticsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const groupId = searchParams.get('groupId');
  const { user } = useStore();
  const db = useFirestore();
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('ALL');
  const [scopeFilter, setScopeFilter] = useState<ScopeFilter>('GROUP');
  const [mounted, setMounted] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const groupRef = useMemoFirebase(() => {
    if (!db || !groupId) return null;
    return doc(db, "groups", groupId);
  }, [db, groupId]);
  const { data: group, isLoading: groupLoading } = useDoc(groupRef);

  const groupExpensesQuery = useMemoFirebase(() => {
    if (!db || !groupId || !user) return null;
    return query(
      collection(db, "groups", groupId, "expenses"),
      where("groupMemberIds", "array-contains", user.uid),
      where("isDeleted", "==", false)
    );
  }, [db, groupId, user]);
  const { data: rawExpenses, isLoading: expensesLoading } = useCollection(groupExpensesQuery);

  const memberProfilesQuery = useMemoFirebase(() => {
    if (!db || !group?.members || group.members.length === 0) return null;
    return query(collection(db, "users"), where("uid", "in", group.members.slice(0, 30)));
  }, [db, group?.members]);
  const { data: memberProfiles } = useCollection(memberProfilesQuery);

  const symbol = getCurrencySymbol(user?.currency);

  const filteredExpenses = useMemo(() => {
    if (!rawExpenses || !user) return [];
    
    return rawExpenses
      .filter(exp => exp.category !== 'Settlement')
      .map(exp => {
        const userShare = exp.splitBetween?.find((s: any) => s.userId === user.uid)?.amount || 0;
        const payer = memberProfiles?.find(m => m.uid === exp.paidBy);
        return {
          ...exp,
          displayAmount: scopeFilter === 'GROUP' ? exp.amount : userShare,
          paidByLabel: exp.paidBy === user.uid ? "You" : (payer?.name || "Member")
        };
      })
      .filter(exp => {
        const date = new Date(exp.date);
        let timeMatch = true;
        if (timeFilter === 'TODAY') timeMatch = isToday(date);
        else if (timeFilter === 'MONTH') timeMatch = isThisMonth(date);
        if (scopeFilter === 'MYSELF' && exp.displayAmount <= 0.01) return false;
        return timeMatch;
      });
  }, [rawExpenses, timeFilter, scopeFilter, user, memberProfiles]);

  const pieData = useMemo(() => {
    const categories: Record<string, number> = {};
    filteredExpenses.forEach(exp => {
      categories[exp.category] = (categories[exp.category] || 0) + exp.displayAmount;
    });
    return Object.entries(categories)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [filteredExpenses]);

  const barData = useMemo(() => {
    const daily: Record<string, number> = {};
    filteredExpenses.forEach(exp => {
      const day = format(new Date(exp.date), "MMM dd");
      daily[day] = (daily[day] || 0) + exp.displayAmount;
    });
    return Object.entries(daily)
      .map(([name, amount]) => ({ name, amount: parseFloat(amount.toFixed(2)) }))
      .sort((a, b) => new Date(a.name).getTime() - new Date(b.name).getTime())
      .slice(-14); 
  }, [filteredExpenses]);

  const handleExport = async () => {
    if (filteredExpenses.length === 0) return;
    setIsExporting(true);
    try {
      const filename = `Wisely_${group?.name || 'Group'}_Analytics_${format(new Date(), 'yyyy-MM-dd')}.xlsx`;
      const workbook = generateMonthlySpreadsheet(filteredExpenses, user?.email || '', symbol);
      downloadWorkbook(workbook, filename);
    } catch (error) {
      console.error("Export failed", error);
    } finally {
      setIsExporting(false);
    }
  };

  if (!mounted) return null;
  if (!groupId) return <div className="p-8 text-center glass-card rounded-3xl m-8 font-black text-destructive uppercase tracking-widest">Missing Group Context</div>;

  const isLoading = groupLoading || expensesLoading;

  return (
    <div className="flex min-h-screen flex-col md:flex-row bg-background">
      <Navbar />
      
      <main className="flex-1 p-4 md:p-8 pb-32 md:pb-8 max-w-7xl mx-auto w-full">
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <button 
            className="mb-4 -ml-2 text-muted-foreground hover:text-primary gap-2 flex items-center transition-all px-2 py-1 uppercase font-black text-[10px] tracking-widest"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4" />
            Return to Vault
          </button>
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h2 className="text-3xl md:text-5xl font-black text-glow uppercase tracking-tighter">
                  {group?.name || "SECTOR"} METRICS
                </h2>
                <Button 
                  onClick={handleExport}
                  disabled={isExporting || filteredExpenses.length === 0}
                  variant="outline" 
                  size="sm" 
                  className="h-10 px-4 rounded-xl font-black uppercase tracking-widest text-[10px] border-primary/20 hover:bg-primary/5 glow-primary gap-2"
                >
                  {isExporting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FileSpreadsheet className="h-3.5 w-3.5" />}
                  Export Data
                </Button>
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground">
                Analyzing {filteredExpenses.length} activity cycles / {timeFilter}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10">
                <Button 
                  variant={scopeFilter === 'GROUP' ? "secondary" : "ghost"} 
                  size="sm" 
                  className={cn(
                    "rounded-lg h-8 text-[9px] uppercase font-black tracking-widest gap-1.5 px-3",
                    scopeFilter === 'GROUP' && "bg-primary text-primary-foreground glow-primary"
                  )}
                  onClick={() => setScopeFilter('GROUP')}
                >
                  <Users className="h-3 w-3" />
                  Full Network
                </Button>
                <Button 
                  variant={scopeFilter === 'MYSELF' ? "secondary" : "ghost"} 
                  size="sm" 
                  className={cn(
                    "rounded-lg h-8 text-[9px] uppercase font-black tracking-widest gap-1.5 px-3",
                    scopeFilter === 'MYSELF' && "bg-primary text-primary-foreground glow-primary"
                  )}
                  onClick={() => setScopeFilter('MYSELF')}
                >
                  <User className="h-3 w-3" />
                  Self Node
                </Button>
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
                    {f === 'ALL' ? 'Total' : f === 'MONTH' ? 'Month' : 'Today'}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </motion.header>

        {isLoading ? (
          <div className="h-[400px] flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <div className="h-12 w-12 animate-spin rounded-[1rem] border-4 border-primary border-t-transparent glow-primary" />
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Decrypting Signal Patterns...</p>
            </div>
          </div>
        ) : filteredExpenses.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-24 text-center glass-card rounded-[3rem] border-dashed border-white/10"
          >
            <div className="h-20 w-20 glass rounded-[2rem] flex items-center justify-center text-primary mb-6 glow-primary">
              <Filter className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-black uppercase tracking-tight text-glow">Zero Variance Detected</h3>
            <p className="text-[10px] text-muted-foreground max-w-xs mt-2 uppercase font-bold tracking-widest opacity-60">
              No matching transaction cycles found within active filters.
            </p>
          </motion.div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
              <Card className="glass-card rounded-[2.5rem] overflow-hidden border-white/5 h-full">
                <CardHeader className="pb-0 pt-8 px-8">
                  <CardTitle className="text-xs font-black uppercase tracking-[0.3em] flex items-center gap-3">
                     <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                     Entropy Distribution
                  </CardTitle>
                  <CardDescription className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mt-1">
                    {scopeFilter === 'GROUP' ? 'Network-wide' : 'Self-node'} categorical split
                  </CardDescription>
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
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
              <Card className="glass-card rounded-[2.5rem] overflow-hidden border-white/5 h-full">
                <CardHeader className="pb-0 pt-8 px-8">
                  <CardTitle className="text-xs font-black uppercase tracking-[0.3em] flex items-center gap-3">
                     <div className="h-2 w-2 rounded-full bg-accent animate-pulse" />
                     Activity Velocity
                  </CardTitle>
                  <CardDescription className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mt-1">
                    Movement trajectory / 14-Cycle Context
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-[450px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <ReBarChart data={barData} margin={{ top: 40, right: 40, left: 40, bottom: 40 }}>
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
                        cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                        contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1rem' }}
                        itemStyle={{ color: '#fff', fontSize: '10px', fontWeight: '800', textTransform: 'uppercase' }}
                        labelStyle={{ display: 'none' }}
                      />
                      <Bar 
                        dataKey="amount" 
                        fill="hsl(var(--primary))" 
                        radius={[8, 8, 0, 0]} 
                        barSize={24}
                        label={{ 
                          position: 'top', 
                          fill: '#facc15', 
                          fontSize: 9, 
                          fontWeight: 900,
                          offset: 10,
                          formatter: (val: number) => `${symbol}${formatCompactNumber(val)}`
                        }}
                      />
                    </ReBarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: 0.3 }}
              className="md:col-span-2"
            >
              <Card className="glass-card border-none overflow-hidden relative">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
                <CardHeader className="pb-4 pt-8 px-8">
                  <CardTitle className="text-sm font-black uppercase tracking-[0.3em] flex items-center gap-3 text-glow">
                    <Zap className="h-4 w-4 text-primary fill-primary animate-pulse" />
                    Protocol Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-8 pb-8">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-6 rounded-[1.5rem] bg-white/5 border border-white/5 flex flex-col gap-1">
                      <span className="text-[9px] font-black uppercase tracking-widest opacity-50">Total Output</span>
                      <span className="text-2xl font-black text-primary">
                        {symbol}{formatCompactNumber(filteredExpenses.reduce((a, b) => a + b.displayAmount, 0))}
                      </span>
                    </div>
                    <div className="p-6 rounded-[1.5rem] bg-white/5 border border-white/5 flex flex-col gap-1">
                      <span className="text-[9px] font-black uppercase tracking-widest opacity-50">High Load Cat</span>
                      <span className="text-xl font-black truncate">{pieData[0]?.name || "N/A"}</span>
                    </div>
                    <div className="p-6 rounded-[1.5rem] bg-white/5 border border-white/5 flex flex-col gap-1">
                      <span className="text-[9px] font-black uppercase tracking-widest opacity-50">Cycle Frequency</span>
                      <span className="text-2xl font-black">{filteredExpenses.length} <span className="text-[10px] opacity-40">TX</span></span>
                    </div>
                    <div className="p-6 rounded-[1.5rem] bg-white/5 border border-white/5 flex flex-col gap-1">
                      <span className="text-[9px] font-black uppercase tracking-widest opacity-50">Analyst Status</span>
                      <span className="text-xs font-black text-green-500 flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                        SECURED
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function GroupAnalyticsPage() {
  return (
    <div className="flex min-h-screen flex-col md:flex-row bg-background no-scrollbar">
      <Navbar />
      <Suspense fallback={<div className="flex h-screen items-center justify-center animate-pulse text-primary font-black uppercase tracking-[0.4em]">Optimizing HUD...</div>}>
        <GroupAnalyticsContent />
      </Suspense>
    </div>
  );
}
