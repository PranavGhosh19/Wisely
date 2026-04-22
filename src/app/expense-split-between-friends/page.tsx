
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Users, MessageSquare, Smartphone, Zap } from "lucide-react";

export default function ExpenseSplitBetweenFriendsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <nav className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-lg">W</div>
            <span className="font-headline text-lg font-bold text-primary">Wisely</span>
          </Link>
          <Button asChild className="rounded-xl font-bold">
            <Link href="/auth">Join Friends</Link>
          </Button>
        </div>
      </nav>

      <main className="flex-1">
        <section className="py-24 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4 text-center max-w-3xl">
            <h1 className="text-5xl md:text-8xl font-black font-headline mb-8 tracking-tighter leading-none">
              Expense Split Between Friends.
            </h1>
            <p className="text-xl md:text-2xl opacity-80 mb-12 leading-relaxed font-medium">
              Don't let money ruin the friendship. Our specialized "Expense Split Between Friends" logic handles the tab, so you can enjoy the night.
            </p>
            <Button asChild size="lg" variant="secondary" className="h-16 px-12 rounded-3xl font-bold text-xl shadow-2xl">
              <Link href="/auth">Start Splitting for Free</Link>
            </Button>
          </div>
        </section>

        <section className="py-24 container mx-auto px-4 max-w-6xl">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="space-y-10">
               <div className="space-y-4">
                 <h2 className="text-3xl font-bold font-headline text-primary flex items-center gap-3">
                   <Zap className="h-8 w-8 text-accent" />
                   Instant Group Codes
                 </h2>
                 <p className="text-lg text-muted-foreground leading-relaxed">
                   Create a group for your weekend trip and share a simple code or QR code. Friends can join in seconds and start adding costs immediately.
                 </p>
               </div>
               <div className="space-y-4">
                 <h2 className="text-3xl font-bold font-headline text-primary flex items-center gap-3">
                   <MessageSquare className="h-8 w-8 text-accent" />
                   Social Reminders
                 </h2>
                 <p className="text-lg text-muted-foreground leading-relaxed">
                   Send gentle reminders with one tap. No more awkward WhatsApp messages asking for your $20 back. Wisely keeps it professional.
                 </p>
               </div>
            </div>
            <div className="relative">
               <div className="bg-card rounded-[3rem] p-10 border shadow-2xl space-y-8">
                 <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center text-primary mx-auto">
                   <Smartphone className="h-10 w-10" />
                 </div>
                 <div className="text-center space-y-2">
                   <p className="font-bold text-2xl">PWA Native Feel</p>
                   <p className="text-muted-foreground">Add to home screen for the fastest access at the restaurant table.</p>
                 </div>
                 <div className="space-y-3">
                   <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                     <div className="h-full bg-primary w-[65%]" />
                   </div>
                   <p className="text-xs font-bold text-center uppercase tracking-widest text-muted-foreground">65% Settled this week</p>
                 </div>
               </div>
               <div className="absolute -bottom-6 -right-6 bg-accent text-primary p-6 rounded-3xl shadow-xl font-black text-xl">
                 #1 Social App
               </div>
            </div>
          </div>
        </section>

        <section className="py-24 bg-muted/30">
          <div className="container mx-auto px-4 text-center max-w-3xl space-y-8">
             <h2 className="text-3xl font-bold font-headline">Stop the spreadsheets.</h2>
             <p className="text-lg text-muted-foreground leading-relaxed">
               Spreadsheets are for work. Wisely is for friends. Experience the most social "Expense Split Between Friends" platform on the market today.
             </p>
             <Button asChild size="lg" className="h-14 px-10 rounded-2xl font-bold">
               <Link href="/auth">Join the Movement</Link>
             </Button>
          </div>
        </section>
      </main>

      <footer className="py-12 border-t text-center text-sm text-muted-foreground">
        <p>© 2024 Wisely Finance • Better Expense Splits Between Friends.</p>
      </footer>
    </div>
  );
}
