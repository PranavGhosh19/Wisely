
"use client";

import { use, useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  PieChart as RePieChart, Pie, Cell, ResponsiveContainer, Tooltip as ReTooltip, 
  BarChart as ReBarChart, Bar, XAxis, YAxis, CartesianGrid, Legend as ReLegend
} from "recharts";
import { useStore } from "@/lib/store";
import { useCollection, useMemoFirebase, useFirestore, useDoc } from "@/firebase";
import { collection, query, where, doc } from "firebase/firestore";
import { format, isToday, isThisMonth } from "date-fns";
import { ArrowLeft, Filter, Loader2, Users, User } from "lucide-react";
import { getCurrencySymbol } from "@/lib/utils";

const COLORS = ['#facc15', '#3D737F', '#5A9BA8', '#8FBABF', '#CEC7BF', '#A89E92'];

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

type TimeFilter = 'ALL' | 'MONTH' | 'TODAY';
type ScopeFilter = 'GROUP' | 'MYSELF';

export default function GroupAnalyticsPage({ params }: { params: Promise<{ groupId: string }> }) {
  const { groupId } = use(params);
  const router = useRouter();
  const { user } = useStore();
  const db = useFirestore();
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('ALL');
  const [scopeFilter, setScopeFilter] = useState<ScopeFilter>('GROUP');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch Group Metadata
  const groupRef = useMemoFirebase(() => {
    if (!db || !groupId) return null;
    return doc(db, "groups", groupId);
  }, [db, groupId]);
  const { data: group, isLoading: groupLoading } = useDoc(groupRef);

  // Fetch Group Expenses
  const groupExpensesQuery = useMemoFirebase(() => {
    if (!db || !groupId || !user) return null;
    return query(
      collection(db, "groups", groupId, "expenses"),
      where("groupMemberIds", "array-contains", user.uid),
      where("isDeleted", "==", false)
    );
  }, [db, groupId, user]);
  const { data: rawExpenses, isLoading: expensesLoading } = useCollection(groupExpensesQuery);

  const symbol = getCurrencySymbol(user?.currency);

  // Apply Filtering and Processing Logic (Excluding Settlements)
  const filteredExpenses = useMemo(() => {
    if (!rawExpenses || !user) return [];
    
    return rawExpenses
      .filter(exp => exp.category !== 'Settlement') // Strict filter for spending analytics
      .map(exp => {
        // Calculate the user's individual share for this expense
        const userShare = exp.splitBetween?.find((s: any) => s.userId === user.uid)?.amount || 0;
        return {
          ...exp,
          displayAmount: scopeFilter === 'GROUP' ? exp.amount : userShare
        };
      })
      .filter(exp => {
        const date = new Date(exp.date);
        
        // Time filter check
        let timeMatch = true;
        if (timeFilter === 'TODAY') timeMatch = isToday(date);
        else if (timeFilter === 'MONTH') timeMatch = isThisMonth(date);

        // In "Only Me" mode, we only care about expenses where the user has a non-zero share
        if (scopeFilter === 'MYSELF' && exp.displayAmount <= 0) return false;

        return timeMatch;
      });
  }, [rawExpenses, timeFilter, scopeFilter, user]);

  // Visual 1: Category Distribution (Pie)
  const pieData = useMemo(() => {
    const categories: Record<string, number> = {};
    filteredExpenses.forEach(exp => {
      categories[exp.category] = (categories[exp.category] || 0) + exp.displayAmount;
    });
    return Object.entries(categories)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [filteredExpenses]);

  // Visual 2: Daily Spending (Bar)
  const barData = useMemo(() => {
    const daily: Record<string, number> = {};
    filteredExpenses.forEach(exp => {
      const day = format(new Date(exp.date), "MMM dd");
      daily[day] = (daily[day] || 0) + exp.displayAmount;
    });
    return Object.entries(daily)
      .map(([name, amount]) => ({ name, amount: parseFloat(amount.toFixed(2)) }))
      .sort((a, b) => new Date(a.name).getTime() - new Date(b.name).getTime())
      .slice(-7); 
  }, [filteredExpenses]);

  if (!mounted) return null;

  const isLoading = groupLoading || expensesLoading;

  return (
    <div className="flex min-h-screen flex-col md:flex-row bg-background">
      <Navbar />
      
      <main className="flex-1 p-4 md:p-8 pb-32 md:pb-8 max-w-7xl mx-auto w-full">
        <header className="mb-8">
          <Button 
            variant="ghost" 
            className="mb-2 -ml-2 text-muted-foreground hover:text-primary gap-2"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Group
          </Button>
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-3xl font-bold font-headline text-primary">
                {group?.name || "Group"} Insights
              </h2>
              <p className="text-muted-foreground">Analysing {filteredExpenses.length} transactions (excludes settlements).</p>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-1 bg-muted p-1 rounded-xl w-fit self-end">
                <Button 
                  variant={scopeFilter === 'GROUP' ? "secondary" : "ghost"} 
                  size="sm" 
                  className="rounded-lg h-8 text-[10px] uppercase font-bold tracking-widest gap-1.5"
                  onClick={() => setScopeFilter('GROUP')}
                >
                  <Users className="h-3 w-3" />
                  Entire Group
                </Button>
                <Button 
                  variant={scopeFilter === 'MYSELF' ? "secondary" : "ghost"} 
                  size="sm" 
                  className="rounded-lg h-8 text-[10px] uppercase font-bold tracking-widest gap-1.5"
                  onClick={() => setScopeFilter('MYSELF')}
                >
                  <User className="h-3 w-3" />
                  Only Me
                </Button>
              </div>

              <div className="flex items-center gap-1 bg-muted p-1 rounded-xl w-fit self-end">
                <Button 
                  variant={timeFilter === 'ALL' ? "secondary" : "ghost"} 
                  size="sm" 
                  className="rounded-lg h-8 text-[10px] uppercase font-bold tracking-widest"
                  onClick={() => setTimeFilter('ALL')}
                >
                  All Time
                </Button>
                <Button 
                  variant={timeFilter === 'MONTH' ? "secondary" : "ghost"} 
                  size="sm" 
                  className="rounded-lg h-8 text-[10px] uppercase font-bold tracking-widest"
                  onClick={() => setTimeFilter('MONTH')}
                >
                  This Month
                </Button>
                <Button 
                  variant={timeFilter === 'TODAY' ? "secondary" : "ghost"} 
                  size="sm" 
                  className="rounded-lg h-8 text-[10px] uppercase font-bold tracking-widest"
                  onClick={() => setTimeFilter('TODAY')}
                >
                  Today
                </Button>
              </div>
            </div>
          </div>
        </header>

        {isLoading ? (
          <div className="h-[400px] flex items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground font-medium">Processing analytics...</p>
            </div>
          </div>
        ) : filteredExpenses.length === 0 ? (
          <Card className="border-none shadow-sm bg-card p-12 text-center rounded-2xl">
            <div className="max-w-xs mx-auto space-y-4">
              <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center text-primary mx-auto">
                <Filter className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold font-headline">No matching data</h3>
              <p className="text-sm text-muted-foreground">Try adjusting your filters or adding some shared expenses to this group.</p>
            </div>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="border-none shadow-sm bg-card rounded-2xl overflow-hidden">
              <CardHeader>
                <CardTitle className="font-headline text-lg">Category Distribution</CardTitle>
                <CardDescription>
                  {scopeFilter === 'GROUP' ? 'Total spent' : 'Your share'} by category
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
                      formatter={(value: number) => [`${symbol}${value.toFixed(2)}`, 'Amount']}
                    />
                  </RePieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm bg-card rounded-2xl overflow-hidden">
              <CardHeader>
                <CardTitle className="font-headline text-lg">Spending Activity</CardTitle>
                <CardDescription>
                  {scopeFilter === 'GROUP' ? 'Group activity' : 'Your individual share'} over time
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[350px] sm:h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ReBarChart data={barData} margin={{ top: 20, right: 10, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                      tickFormatter={(value) => `${symbol}${value}`}
                    />
                    <ReTooltip 
                      cursor={{ fill: 'transparent' }}
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '12px', border: '1px solid hsl(var(--border))' }}
                      formatter={(value: number) => [`${symbol}${value.toFixed(2)}`, 'Amount']}
                    />
                    <Bar 
                      dataKey="amount" 
                      fill="hsl(var(--primary))" 
                      radius={[4, 4, 0, 0]} 
                      barSize={30} 
                      label={{ 
                        position: 'top', 
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

            <Card className="border-none shadow-sm bg-primary text-primary-foreground rounded-2xl md:col-span-2">
              <CardHeader>
                <CardTitle className="font-headline text-lg flex items-center gap-2">
                  Summary Report {scopeFilter === 'MYSELF' && "(Your Individual Share)"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                  <div className="p-4 rounded-xl bg-white/10 backdrop-blur-sm">
                    <p className="text-[10px] uppercase font-bold opacity-70 tracking-widest mb-1">Total</p>
                    <p className="text-xl font-bold">{symbol}{filteredExpenses.reduce((a, b) => a + b.displayAmount, 0).toFixed(2)}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-white/10 backdrop-blur-sm">
                    <p className="text-[10px] uppercase font-bold opacity-70 tracking-widest mb-1">Avg/Exp</p>
                    <p className="text-xl font-bold">{symbol}{(filteredExpenses.reduce((a, b) => a + b.displayAmount, 0) / (filteredExpenses.length || 1)).toFixed(2)}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-white/10 backdrop-blur-sm">
                    <p className="text-[10px] uppercase font-bold opacity-70 tracking-widest mb-1">Top Cat</p>
                    <p className="text-xl font-bold truncate">{pieData[0]?.name || "N/A"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
