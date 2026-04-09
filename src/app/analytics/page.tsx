
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
import { PieChart, Layers, User, Users, Calendar as CalendarIcon, X, BarChart3 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getCurrencySymbol, cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const COLORS = ['#facc15', '#3D737F', '#5A9BA8', '#8FBABF', '#CEC7BF', '#A89E92'];

/**
 * Custom label renderer for the Pie chart to show labels outside with connecting lines.
 * Optimized to keep text within surface bounds.
 */
const renderCustomizedLabel = (props: any, symbol: string) => {
  const { cx, cy, midAngle, outerRadius, index, name, value } = props;
  const RADIAN = Math.PI / 180;
  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);
  
  // Adjusted offsets to keep labels closer to the pie
  const sx = cx + (outerRadius + 2) * cos;
  const sy = cy + (outerRadius + 2) * sin;
  const mx = cx + (outerRadius + 8) * cos;
  const my = cy + (outerRadius + 8) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 8;
  const ey = my;
  const textAnchor = cos >= 0 ? 'start' : 'end';

  return (
    <g>
      <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={COLORS[index % COLORS.length]} fill="none" strokeWidth={1} />
      <circle cx={ex} cy={ey} r={2} fill={COLORS[index % COLORS.length]} stroke="none" />
      <text 
        x={ex + (cos >= 0 ? 1 : -1) * 6} 
        y={ey} 
        textAnchor={textAnchor} 
        fill="hsl(var(--foreground))" 
        style={{ fontSize: '9px', fontWeight: 'bold' }}
      >
        {name}
      </text>
      <text 
        x={ex + (cos >= 0 ? 1 : -1) * 6} 
        y={ey} 
        dy={10} 
        textAnchor={textAnchor} 
        fill="#facc15" 
        style={{ fontSize: '8px', fontWeight: 'bold' }}
      >
        {`${symbol}${value.toFixed(0)}`}
      </text>
    </g>
  );
};

export default function AnalyticsPage() {
  const { user, categories: storeCategories } = useStore();
  const db = useFirestore();
  const [mounted, setMounted] = useState(false);
  const [scope, setScope] = useState<"ALL" | "PERSONAL" | "GROUP">("ALL");
  const [selectedGroupId, setSelectedGroupId] = useState<string>("all");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  useEffect(() => {
    setMounted(true);
  }, []);

  const symbol = getCurrencySymbol(user?.currency);

  // Fetch Personal Expenses
  const personalQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(
      collection(db, "users", user.uid, "personalExpenses"),
      where("isDeleted", "==", false)
    );
  }, [db, user]);
  const { data: personalExpenses, isLoading: loadingPersonal } = useCollection(personalQuery);

  // Fetch Group Expenses
  const groupExpensesQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(
      collectionGroup(db, "expenses"),
      where("groupMemberIds", "array-contains", user.uid),
      where("isDeleted", "==", false)
    );
  }, [db, user]);
  const { data: groupExpenses, isLoading: loadingGroups } = useCollection(groupExpensesQuery);

  // Fetch User's Groups for the sub-filter
  const groupsQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(collection(db, "groups"), where("members", "array-contains", user.uid));
  }, [db, user]);
  const { data: userGroups } = useCollection(groupsQuery);

  // Combined and Filtered data for visual reports
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
    }

    return base;
  }, [personalExpenses, groupExpenses, scope, selectedGroupId, selectedDate]);

  // Visual 1: Category Distribution
  const pieData = useMemo(() => {
    const categories: Record<string, number> = {};
    filteredExpenses.forEach(exp => {
      categories[exp.category] = (categories[exp.category] || 0) + exp.amount;
    });
    return Object.entries(categories)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [filteredExpenses]);

  // Visual 2: Spending Trend
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

  // Visual 3: Personal vs Group
  const splitData = useMemo(() => {
    const dateStart = selectedDate ? startOfDay(selectedDate) : null;
    const dateEnd = selectedDate ? endOfDay(selectedDate) : null;

    const filterByDate = (exp: any) => {
      if (!dateStart || !dateEnd) return true;
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

  // Visual 4: Budget Distribution (Current Month Comparison)
  const budgetChartData = useMemo(() => {
    if (!user || !user.categoryBudgets || !storeCategories) return [];
    
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
    }).filter(item => item.originalBudget > 0 || item.originalSpent > 0);
  }, [user, storeCategories, personalExpenses, groupExpenses]);

  const isLoading = loadingPersonal || loadingGroups;

  if (!mounted) return null;

  return (
    <div className="flex min-h-screen flex-col md:flex-row bg-background">
      <Navbar />
      
      <main className="flex-1 p-4 md:p-8 pb-32 md:pb-8 max-w-7xl mx-auto w-full">
        <header className="mb-8 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-3xl font-bold font-headline text-primary">Overall Analytics</h2>
            <p className="text-muted-foreground">Detailed insights into your spending patterns.</p>
          </div>

          <div className="grid grid-cols-2 sm:flex sm:flex-row gap-3 sm:gap-4 items-end">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2 px-1">
                <CalendarIcon className="h-3 w-3" />
                Select Date
              </label>
              <div className="relative group/date">
                <Input
                  type="date"
                  value={selectedDate ? format(selectedDate, "yyyy-MM-dd") : ""}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSelectedDate(val ? parseISO(val) : undefined);
                  }}
                  className="w-full sm:w-[140px] h-10 px-3 pr-8 rounded-xl bg-card border-none shadow-sm text-sm font-normal focus:ring-2 focus:ring-primary outline-none"
                />
                {selectedDate && (
                  <button 
                    onClick={() => setSelectedDate(undefined)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-5 w-5 rounded-full bg-muted/50 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2 px-1">
                <Layers className="h-3 w-3" />
                View Scope
              </label>
              <Select value={scope} onValueChange={(val: any) => setScope(val)}>
                <SelectTrigger className="w-full sm:w-[180px] h-10 rounded-xl bg-card border-none shadow-sm">
                  <SelectValue placeholder="Select Scope" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">
                    <div className="flex items-center gap-2">
                      <Layers className="h-4 w-4" />
                      All Activity
                    </div>
                  </SelectItem>
                  <SelectItem value="PERSONAL">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Personal Only
                    </div>
                  </SelectItem>
                  <SelectItem value="GROUP">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Group Shared
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {scope === "GROUP" && (
              <div className="col-span-2 sm:col-auto space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2 px-1">
                  <Users className="h-3 w-3" />
                  Select Group
                </label>
                <Select value={selectedGroupId} onValueChange={setSelectedGroupId}>
                  <SelectTrigger className="w-full sm:w-[180px] h-10 rounded-xl bg-card border-none shadow-sm">
                    <SelectValue placeholder="Which Group?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Groups</SelectItem>
                    {userGroups?.map(g => (
                      <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </header>

        {isLoading ? (
          <div className="h-[400px] flex items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              <p className="text-sm text-muted-foreground font-medium">Crunching your numbers...</p>
            </div>
          </div>
        ) : filteredExpenses.length === 0 ? (
          <Card className="border-none shadow-sm bg-card p-12 text-center rounded-2xl">
            <div className="max-w-xs mx-auto space-y-4">
              <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center text-primary mx-auto">
                <PieChart className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold font-headline">No data to visualize yet</h3>
              <p className="text-sm text-muted-foreground">Try adjusting your filters or date selection to see distribution and trends.</p>
              {selectedDate && (
                <Button variant="outline" onClick={() => setSelectedDate(undefined)} className="rounded-xl mt-4">
                  Clear Date Filter
                </Button>
              )}
            </div>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {/* Category Pie Chart */}
            <Card className="border-none shadow-sm bg-card rounded-2xl overflow-hidden">
              <CardHeader>
                <CardTitle className="font-headline text-lg">Category Distribution</CardTitle>
                <CardDescription>
                  {scope === "ALL" ? "Combined" : scope === "PERSONAL" ? "Personal" : "Group"} spending by category
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[350px] sm:h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RePieChart margin={{ top: 20, right: 80, left: 80, bottom: 20 }}>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={5}
                      dataKey="value"
                      label={(props) => renderCustomizedLabel(props, symbol)}
                      labelLine={false}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                  </RePieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Spending Line Chart */}
            <Card className="border-none shadow-sm bg-card rounded-2xl overflow-hidden">
              <CardHeader>
                <CardTitle className="font-headline text-lg">Spending Trend</CardTitle>
                <CardDescription>Monthly movement across selected scope</CardDescription>
              </CardHeader>
              <CardContent className="h-[350px] sm:h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ReLineChart data={trendData} margin={{ top: 30, right: 20, left: 20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                      tickFormatter={(value) => `${symbol}${value}`}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="amount" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={3} 
                      dot={{ r: 4, fill: 'hsl(var(--primary))', strokeWidth: 2 }} 
                      activeDot={{ r: 6, strokeWidth: 0 }}
                      label={{ 
                        position: 'top', 
                        fill: '#facc15', 
                        fontSize: 10, 
                        fontWeight: 600,
                        offset: 12,
                        formatter: (val: number) => `${symbol}${val.toFixed(0)}`
                      }}
                    />
                  </ReLineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Monthly Budget Distribution Stacked Bar Chart */}
            {budgetChartData.length > 0 && (
              <Card className="border-none shadow-sm bg-card rounded-2xl overflow-hidden md:col-span-2">
                <CardHeader>
                  <CardTitle className="font-headline text-lg flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    Monthly Budget Distribution
                  </CardTitle>
                  <CardDescription>Current Month Spend vs. Planned Category Targets</CardDescription>
                </CardHeader>
                <CardContent className="h-[400px] sm:h-[500px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <ReBarChart 
                      data={budgetChartData} 
                      margin={{ top: 20, right: 20, left: 20, bottom: 60 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                      <XAxis 
                        dataKey="name" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fontSize: 10, fontWeight: 700, fill: 'hsl(var(--foreground))' }}
                        interval={0}
                        angle={-45}
                        textAnchor="end"
                      />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                        tickFormatter={(value) => `${symbol}${value}`}
                      />
                      <Tooltip 
                        cursor={{ fill: 'hsl(var(--muted))', opacity: 0.1 }}
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="bg-card border border-border p-3 rounded-xl shadow-xl space-y-1">
                                <p className="font-bold text-xs uppercase tracking-widest text-muted-foreground mb-2">{data.name}</p>
                                <div className="flex justify-between gap-8 items-center">
                                  <span className="text-[10px] font-bold text-muted-foreground uppercase">Budget:</span>
                                  <span className="text-xs font-bold">{symbol}{data.originalBudget.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between gap-8 items-center">
                                  <span className="text-[10px] font-bold text-muted-foreground uppercase">Spent:</span>
                                  <span className="text-xs font-bold text-primary">{symbol}{data.originalSpent.toFixed(2)}</span>
                                </div>
                                {data.originalSpent > data.originalBudget && (
                                  <div className="pt-1 mt-1 border-t border-border flex justify-between gap-8 items-center">
                                    <span className="text-[10px] font-black text-destructive uppercase">Overlimit:</span>
                                    <span className="text-xs font-black text-destructive">{symbol}{(data.originalSpent - data.originalBudget).toFixed(2)}</span>
                                  </div>
                                )}
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Legend 
                        verticalAlign="top" 
                        align="right" 
                        iconType="circle"
                        wrapperStyle={{ paddingBottom: '20px', fontSize: '9px', fontWeight: 'bold', textTransform: 'uppercase' }}
                      />
                      <Bar 
                        dataKey="Current Spend" 
                        stackId="a" 
                        fill="hsl(var(--primary))" 
                        label={{ 
                          position: 'top', 
                          fill: '#facc15', 
                          fontSize: 9, 
                          fontWeight: 800,
                          offset: 8,
                          formatter: (val: number) => val > 0 ? `${symbol}${val.toFixed(0)}` : ''
                        }}
                      />
                      <Bar 
                        dataKey="Remaining" 
                        stackId="a" 
                        fill="hsl(var(--primary))" 
                        opacity={0.15}
                      />
                      <Bar 
                        dataKey="Over Budget" 
                        stackId="a" 
                        fill="hsl(var(--destructive))" 
                        label={{ 
                          position: 'top', 
                          fill: '#facc15', 
                          fontSize: 9, 
                          fontWeight: 800,
                          offset: 8,
                          formatter: (val: number) => val > 0 ? `${symbol}${val.toFixed(0)}` : ''
                        }}
                      />
                    </ReBarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            {/* Personal vs Group Summary Bar Chart */}
            <Card className="border-none shadow-sm bg-card rounded-2xl overflow-hidden md:col-span-2">
              <CardHeader>
                <CardTitle className="font-headline text-lg">Personal vs Group Expenses</CardTitle>
                <CardDescription>Comparison of your private spending and shared group costs</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ReBarChart data={splitData} layout="vertical" margin={{ left: 20, right: 80 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                    <XAxis 
                      type="number" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                      tickFormatter={(value) => `${symbol}${value}`}
                    />
                    <YAxis 
                      dataKey="name" 
                      type="category" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 12, fontWeight: 600, fill: 'hsl(var(--foreground))' }}
                    />
                    <Bar 
                      dataKey="amount" 
                      fill="hsl(var(--primary))" 
                      radius={[0, 8, 8, 0]} 
                      barSize={40} 
                      label={{ 
                        position: 'right', 
                        fill: '#facc15', 
                        fontSize: 10, 
                        fontWeight: 600,
                        offset: 8,
                        formatter: (val: number) => `${symbol}${val.toFixed(0)}`
                      }}
                    />
                  </ReBarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
