
"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  PieChart as RePieChart, Pie, Cell, ResponsiveContainer, Tooltip as ReTooltip, 
  BarChart as ReBarChart, Bar, XAxis, YAxis, CartesianGrid, Legend as ReLegend,
  LineChart as ReLineChart, Line
} from "recharts";
import { useStore } from "@/lib/store";

const COLORS = ['#432E8C', '#3380FF', '#6366F1', '#A5B4FC', '#C7D2FE'];

export default function AnalyticsPage() {
  const { expenses } = useStore();

  // Prepare Pie Chart data (Category Distribution)
  const categoryDataMap = expenses.reduce((acc: any, exp) => {
    acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
    return acc;
  }, {});

  const pieData = Object.entries(categoryDataMap).map(([name, value]) => ({ name, value }));

  // Prepare Bar Chart data (Group vs Personal)
  const groupVsPersonal = [
    { name: 'Personal', amount: expenses.filter(e => e.type === 'PERSONAL').reduce((a, b) => a + b.amount, 0) },
    { name: 'Group', amount: expenses.filter(e => e.type === 'GROUP').reduce((a, b) => a + b.amount, 0) },
  ];

  // Mock Trend data
  const trendData = [
    { name: 'Jan', amount: 450 },
    { name: 'Feb', amount: 520 },
    { name: 'Mar', amount: 380 },
    { name: 'Apr', amount: 610 },
    { name: 'May', amount: 490 },
  ];

  return (
    <div className="flex min-h-screen flex-col md:flex-row bg-background">
      <Navbar />
      
      <main className="flex-1 p-4 md:p-8 pb-24 md:pb-8 max-w-7xl mx-auto w-full">
        <header className="mb-8">
          <h2 className="text-3xl font-bold font-headline text-primary">Analytics</h2>
          <p className="text-muted-foreground">Gain insights into your spending habits.</p>
        </header>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="border-none shadow-sm bg-white">
            <CardHeader>
              <CardTitle className="font-headline text-lg">Category Distribution</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <RePieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <ReTooltip />
                  <ReLegend verticalAlign="bottom" height={36}/>
                </RePieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-white">
            <CardHeader>
              <CardTitle className="font-headline text-lg">Spending Trend (Last 5 Months)</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <ReLineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F2F1F7" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <ReTooltip />
                  <Line type="monotone" dataKey="amount" stroke="#432E8C" strokeWidth={3} dot={{ r: 4, fill: '#432E8C' }} activeDot={{ r: 6 }} />
                </ReLineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-white md:col-span-2">
            <CardHeader>
              <CardTitle className="font-headline text-lg">Personal vs Group Expenses</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <ReBarChart data={groupVsPersonal} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F2F1F7" />
                  <XAxis type="number" axisLine={false} tickLine={false} />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} />
                  <ReTooltip />
                  <Bar dataKey="amount" fill="#3380FF" radius={[0, 4, 4, 0]} barSize={40} />
                </ReBarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
