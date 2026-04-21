"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  Search, 
  ArrowRight,
  Sparkles,
  Layers,
  Calendar
} from "lucide-react";
import { 
  LineChart, 
  Line, 
  ResponsiveContainer, 
  Tooltip, 
  PieChart as RePieChart, 
  Pie, 
  Cell 
} from "recharts";

const DUMMY_VELOCITY = [
  { name: 'Mon', amount: 40 },
  { name: 'Tue', amount: 30 },
  { name: 'Wed', amount: 60 },
  { name: 'Thu', amount: 45 },
  { name: 'Fri', amount: 90 },
  { name: 'Sat', amount: 120 },
  { name: 'Sun', amount: 80 },
];

const DUMMY_CATEGORIES = [
  { name: 'Dining', value: 400 },
  { name: 'Travel', value: 300 },
  { name: 'Groceries', value: 200 },
  { name: 'Housing', value: 500 },
];

const COLORS = ['#3D737F', '#3380FF', '#facc15', '#CEC7BF'];

export default function AnalyticsShowcasePage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <nav className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold">W</div>
            <span className="font-headline text-lg font-bold text-primary">Analytics</span>
          </Link>
          <div className="flex gap-4">
             <Link href="/features" className="text-sm font-bold text-muted-foreground hover:text-primary pt-2">Features</Link>
             <Button asChild size="sm" className="rounded-xl font-bold">
               <Link href="/auth">Dashboard</Link>
             </Button>
          </div>
        </div>
      </nav>

      <main className="flex-1 py-20">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center max-w-3xl mx-auto mb-24 space-y-6">
            <h1 className="text-4xl md:text-7xl font-black font-headline text-primary leading-tight">Insight, not just info.</h1>
            <p className="text-xl text-muted-foreground">
              Numbers are useless without context. Wisely's automated analyst does the heavy lifting, surfacing trends you might miss.
            </p>
          </div>

          <div className="grid gap-24">
            {/* The Visuals */}
            <div className="grid md:grid-cols-2 gap-16 items-center">
              <div className="space-y-8">
                <div className="space-y-4">
                  <h2 className="text-3xl font-bold font-headline text-primary flex items-center gap-3">
                    <PieChart className="h-8 w-8 text-accent" />
                    Category Distribution
                  </h2>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    Identify your biggest leaks instantly. Our donut-style visualization breaks down spending across your custom categories, highlighting where the most money flows.
                  </p>
                </div>
                <div className="space-y-4">
                  <h2 className="text-3xl font-bold font-headline text-primary flex items-center gap-3">
                    <TrendingUp className="h-8 w-8 text-accent" />
                    Spending Trends
                  </h2>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    View your monthly movement. Are you spending more than last month? Our line charts show your trajectory so you can course-correct before the month ends.
                  </p>
                </div>
              </div>
              <div className="relative">
                <div className="bg-card rounded-[3rem] p-8 shadow-2xl border border-border overflow-hidden min-h-[450px] flex flex-col justify-center gap-8">
                  <div className="space-y-2">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-2">Real-time Velocity</h4>
                    <div className="h-[140px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={DUMMY_VELOCITY}>
                          <Line 
                            type="monotone" 
                            dataKey="amount" 
                            stroke="hsl(var(--primary))" 
                            strokeWidth={4} 
                            dot={{ r: 4, fill: 'hsl(var(--primary))', strokeWidth: 0 }} 
                            activeDot={{ r: 6, strokeWidth: 0 }}
                          />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: '#07161B', 
                              borderRadius: '12px', 
                              border: 'none', 
                              boxShadow: '0 10px 30px rgba(0,0,0,0.3)' 
                            }}
                            itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                            labelStyle={{ display: 'none' }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-2">Impact Heatmap</h4>
                    <div className="h-[140px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <RePieChart>
                          <Pie
                            data={DUMMY_CATEGORIES}
                            innerRadius={45}
                            outerRadius={60}
                            paddingAngle={8}
                            dataKey="value"
                          >
                            {DUMMY_CATEGORIES.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                            ))}
                          </Pie>
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: '#07161B', 
                              borderRadius: '12px', 
                              border: 'none', 
                              boxShadow: '0 10px 30px rgba(0,0,0,0.3)' 
                            }}
                            itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                            labelStyle={{ color: '#fff', fontWeight: 'bold' }}
                          />
                        </RePieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
                <div className="absolute -bottom-6 -right-6 bg-accent text-primary p-6 rounded-3xl shadow-xl font-black text-xl">
                  +12% Savings
                </div>
              </div>
            </div>

            {/* The Analyst */}
            <section className="bg-muted/50 rounded-[3rem] p-12 md:p-20 border border-border">
              <div className="flex flex-col md:flex-row gap-16 items-center">
                <div className="flex-1 space-y-6">
                  <div className="inline-flex items-center gap-2 bg-primary text-white px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest">
                    AI Insights
                  </div>
                  <h2 className="text-3xl md:text-5xl font-bold font-headline text-primary">The "Analyst" Widget.</h2>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    On your dashboard sits a small but powerful widget. It uses heuristic analysis to tell you exactly how your week is going.
                  </p>
                  <div className="grid gap-4">
                    {[
                      { icon: Calendar, text: "Compares current spend to historical monthly averages." },
                      { icon: Layers, text: "Flags categories that are nearing their budget limits." },
                      { icon: Search, text: "Identifies anomalies in group activity." }
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-4 p-4 bg-white/50 rounded-2xl border border-border">
                        <item.icon className="h-5 w-5 text-primary shrink-0" />
                        <span className="font-medium text-sm">{item.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex-1">
                   <div className="bg-primary rounded-3xl p-8 text-primary-foreground shadow-2xl transform md:rotate-2">
                     <p className="text-sm font-medium opacity-70 mb-2">Automated Report</p>
                     <p className="text-xl font-bold font-headline mb-4">"You've spent 80% of your Dining budget, but you're only 15 days into the month. Consider eating in this week."</p>
                     <div className="h-2 w-full bg-white/20 rounded-full overflow-hidden">
                       <div className="h-full bg-accent w-[80%]" />
                     </div>
                   </div>
                </div>
              </div>
            </section>

            <div className="text-center">
               <h3 className="text-3xl font-black font-headline text-primary mb-8">Data is power. Use it Wisely.</h3>
               <Button asChild size="lg" className="h-16 px-12 rounded-3xl font-bold text-xl shadow-xl shadow-primary/20">
                 <Link href="/auth">Start your analysis</Link>
               </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}