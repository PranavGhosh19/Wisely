"use client";

import { useMemo, useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  PieChart as RePieChart, Pie, Cell, ResponsiveContainer, Tooltip as ReTooltip, 
  BarChart as ReBarChart, Bar, XAxis, YAxis, CartesianGrid, Legend as ReLegend,
  LineChart as ReLineChart, Line
} from "recharts";
import { useStore } from "@/lib/store";
import { useCollection, useMemoFirebase, useFirestore } from "@/firebase";
import { collection, collectionGroup, query, where } from "firebase/firestore";
import { format, subMonths, startOfMonth, endOfMonth, isWithinInterval } from "date-fns";
import { PieChart, Layers, User, Users } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getCurrencySymbol } from "@/lib/utils";

const COLORS = ['#3D737F', '#facc15', '#5A9BA8', '#8FBABF', '#CEC7BF', '#A89E92'];

/**
 * Custom label renderer for the Pie chart to show labels outside with connecting lines.
 */
const renderCustomizedLabel = (props: any, symbol: string) => {
  const { cx, cy, midAngle, outerRadius, index, name, value } = props;
  const RADIAN = Math.PI / 180;
  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);
  const sx = cx + (outerRadius + 5) * cos;
  const sy = cy + (outerRadius + 5) * sin;
  const mx = cx + (outerRadius + 15) * cos;
  const my = cy + (outerRadius + 15) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 12;
  const ey = my;
  const textAnchor = cos >= 0 ? 'start' : 'end';

  return (
    <g>
      <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={COLORS[index % COLORS.length]} fill="none" strokeWidth={1} />
      <circle cx={ex} cy={ey} r={2} fill={COLORS[index % COLORS.length]} stroke="none" />
      <text 
        x={ex + (cos >= 0 ? 1 : -1) * 8} 
        y={ey} 
        textAnchor={textAnchor} 
        fill="hsl(var(--foreground))" 
        style={{ fontSize: '10px', fontWeight: 'bold' }}
      >
        {name}
      </text>
      <text 
        x={ex + (cos >= 0 ? 1 : -1) * 8} 
        y={ey} 
        dy={12} 
        textAnchor={textAnchor} 
        fill="#facc15" 
        style={{ fontSize: '9px', fontWeight: 'bold' }}
      >
        {`${symbol}${value.toFixed(0)}`}
      </text>
    </g>
  );
};

export default function AnalyticsPage() {
  const { user } = useStore();
  const db = useFirestore();
  const [mounted, setMounted] = useState(false);
  const [scope, setScope] = useState<"ALL" | "PERSONAL" | "GROUP">("ALL");
  const [selectedGroupId, setSelectedGroupId] = useState<string>("all");

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

  // Combine and Filter data for global insights (Excluding Settlements)
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
    return base;
  }, [personalExpenses, groupExpenses, scope, selectedGroupId]);

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

  // Visual 2: Spending Trend (Last 6 Months)
  const trendData = useMemo(() => {
    const months = Array.from({ length: 6 }).map((_, i) => {
      const date = subMonths(new Date(), 5 - i);
      return {
        name: format(date, "MMM"),
        start: startOfMonth(date),
        end: endOfMonth(date),
        amount: 0
      };
    });

    filteredExpenses.forEach(exp => {
      const expDate = new Date(exp.date);
      months.forEach(month => {
        if (isWithinInterval(expDate, { start: month.start, end: month.end })) {
          month.amount += exp.amount;
        }
      });
    });

    return months.map(m => ({ name: m.name, amount: parseFloat(m.amount.toFixed(2)) }));
  }, [filteredExpenses]);

  // Visual 3: Personal vs Group
  const splitData = useMemo(() => {
    const personal = (personalExpenses || [])
      .filter(e => e.category !== 'Settlement')
      .reduce((acc, exp) => acc + exp.amount, 0);
    const group = (groupExpenses || [])
      .filter(e => e.category !== 'Settlement')
      .reduce((acc, exp) => acc + exp.amount, 0);
    return [
      { name: 'Personal', amount: parseFloat(personal.toFixed(2)) },
      { name: 'Group Shared', amount: parseFloat(group.toFixed(2)) }
    ];
  }, [personalExpenses, groupExpenses]);

  const isLoading = loadingPersonal || loadingGroups;

  if (!mounted) return null;

  return (
    <div className="flex min-h-screen flex-col md:flex-row bg-background">
      <Navbar />
      
      <main className="flex-1 p-4 md:p-8 pb-32 md:pb-8 max-w-7xl mx-auto w-full">
        <header className="mb-8 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-3xl font-bold font-headline text-primary">Overall Analytics</h2>
            <p className="text-muted-foreground">Detailed insights into your spending patterns (excludes settlements).</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2 px-1">
                <Layers className="h-3 w-3" />
                View Scope
              </label>
              <Select value={scope} onValueChange={(val: any) => setScope(val)}>
                <SelectTrigger className="w-[180px] h-10 rounded-xl bg-card border-none shadow-sm">
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
              <div className="space-y-1.5 animate-in fade-in slide-in-from-right-4 duration-300">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2 px-1">
                  <Users className="h-3 w-3" />
                  Select Group
                </label>
                <Select value={selectedGroupId} onValueChange={setSelectedGroupId}>
                  <SelectTrigger className="w-[180px] h-10 rounded-xl bg-card border-none shadow-sm">
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
              <p className="text-sm text-muted-foreground">Add some expenses to see your spending distribution and trends here.</p>
            </div>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="border-none shadow-sm bg-card rounded-2xl overflow-hidden">
              <CardHeader>
                <CardTitle className="font-headline text-lg">Category Distribution</CardTitle>
                <CardDescription>
                  {scope === "ALL" ? "Combined" : scope === "PERSONAL" ? "Personal" : "Group"} spending by category
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[350px] sm:h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RePieChart margin={{ top: 20, right: 60, left: 60, bottom: 20 }}>
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
                    <ReTooltip 
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '12px', border: '1px solid hsl(var(--border))' }}
                      formatter={(value: number) => [`${symbol}${value.toFixed(2)}`, 'Spent']}
                    />
                  </RePieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

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
                    <ReTooltip 
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '12px', border: '1px solid hsl(var(--border))' }}
                      formatter={(value: number) => [`${symbol}${value.toFixed(2)}`, 'Total']}
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
                        fill: 'hsl(var(--foreground))', 
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

            <Card className="border-none shadow-sm bg-card rounded-2xl overflow-hidden md:col-span-2">
              <CardHeader>
                <CardTitle className="font-headline text-lg">Personal vs Group Expenses</CardTitle>
                <CardDescription>Comparison of your private spending and shared group costs</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ReBarChart data={splitData} layout="vertical" margin={{ left: 20, right: 60 }}>
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
                    <ReTooltip 
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '12px', border: '1px solid hsl(var(--border))' }}
                      formatter={(value: number) => [`${symbol}${value.toFixed(2)}`, 'Amount']}
                    />
                    <Bar 
                      dataKey="amount" 
                      fill="hsl(var(--primary))" 
                      radius={[0, 8, 8, 0]} 
                      barSize={40} 
                      label={{ 
                        position: 'right', 
                        fill: 'hsl(var(--foreground))', 
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
