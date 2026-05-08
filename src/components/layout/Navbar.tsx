"use client";

import React, { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { 
  LayoutDashboard, 
  Users, 
  PieChart, 
  LogOut, 
  Plus, 
  ReceiptText,
  WifiOff,
  User as LucideUser
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/firebase";
import { signOut } from "firebase/auth";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  TooltipProvider,
} from "@/components/ui/tooltip";

function NavbarContent() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const auth = useAuth();
  const { user, logout, isSidebarCollapsed } = useStore();
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsOnline(navigator.onLine);
      const hO = () => setIsOnline(true);
      const hF = () => setIsOnline(false);
      window.addEventListener('online', hO);
      window.addEventListener('offline', hF);
      return () => {
        window.removeEventListener('online', hO);
        window.removeEventListener('offline', hF);
      };
    }
  }, []);

  const isClubPage = pathname === "/wisely-club";
  const isHiddenPage = pathname === "/" || pathname === "/auth" || isClubPage;
  if (isHiddenPage || !user) return null;

  const handleSignOut = async () => {
    if (auth) await signOut(auth);
    logout();
    router.push("/");
  };

  const contextGroupId = searchParams.get('groupId');
  const addExpenseUrl = contextGroupId 
    ? `/expenses/add?type=GROUP&groupId=${contextGroupId}` 
    : `/expenses/add`;

  return (
    <TooltipProvider delayDuration={0}>
      <motion.nav 
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className={cn(
          "hidden md:flex sticky top-6 ml-6 h-[calc(100vh-3rem)] flex-col justify-between glass-card rounded-[2.5rem] p-4 transition-all duration-500 ease-in-out z-50",
          isSidebarCollapsed ? "w-20" : "w-64"
        )}
      >
        <div className="flex flex-col gap-8">
          <div className="flex items-center justify-center pt-2">
            <Link href="/dashboard" className="relative group">
              <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full scale-150 group-hover:scale-175 transition-transform" />
              <div className="h-12 w-12 bg-primary rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-2xl relative z-10">W</div>
            </Link>
          </div>
          
          <div className="flex flex-col gap-2">
            {[
              { name: "Dash", href: "/dashboard", icon: LayoutDashboard },
              { name: "History", href: "/transactions", icon: ReceiptText },
              { name: "Groups", href: "/groups", icon: Users },
              { name: "Insights", href: "/analytics", icon: PieChart },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-2xl transition-all group py-3 px-3 relative overflow-hidden",
                    isActive 
                      ? "text-primary bg-primary/10" 
                      : "text-muted-foreground hover:bg-white/5"
                  )}
                >
                  <Icon className={cn("h-5 w-5 z-10 transition-transform group-hover:scale-110", isActive && "text-primary")} />
                  <AnimatePresence>
                    {!isSidebarCollapsed && (
                      <motion.span 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className="text-sm font-bold z-10 truncate"
                      >
                        {item.name}
                      </motion.span>
                    )}
                  </AnimatePresence>
                  {isActive && <motion.div layoutId="nav-pill" className="absolute left-0 w-1 h-6 bg-primary rounded-full" />}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <Link 
            href="/profile" 
            className={cn(
              "flex items-center gap-3 rounded-2xl p-2 bg-white/5 hover:bg-white/10 transition-all border border-white/5",
              isSidebarCollapsed && "justify-center"
            )}
          >
            <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold shadow-inner relative shrink-0 overflow-hidden">
              {user.photoURL ? <Image src={user.photoURL} alt={user.name} fill className="object-cover" /> : user.name?.[0]}
            </div>
            {!isSidebarCollapsed && (
              <div className="flex flex-col truncate flex-1">
                <span className="text-xs font-black truncate">{user.name}</span>
                <span className="text-[10px] uppercase font-bold opacity-50">Profile</span>
              </div>
            )}
          </Link>

          <Button 
            variant="ghost" 
            className={cn(
              "w-full text-destructive/80 hover:text-destructive hover:bg-destructive/10 rounded-2xl h-12 gap-3",
              isSidebarCollapsed ? "justify-center" : "justify-start px-4"
            )}
            onClick={handleSignOut}
          >
            <LogOut className="h-5 w-5" />
            {!isSidebarCollapsed && <span className="font-bold">Exit</span>}
          </Button>
        </div>
      </motion.nav>

      {/* MOBILE NAV: Static geometry that doesn't scale with font-size */}
      <nav 
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-[448px] h-[80px] glass-card rounded-[40px] md:hidden px-2 safe-area-bottom shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
      >
        <div className="relative flex h-full items-center justify-between">
          {[
            { name: "Dash", href: "/dashboard", icon: LayoutDashboard },
            { name: "History", href: "/transactions", icon: ReceiptText },
            { name: "Groups", href: "/groups", icon: Users },
          ].map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex flex-col items-center gap-1 flex-1 transition-all py-2 relative",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  <Icon className={cn("h-5 w-5 transition-transform", isActive && "scale-110")} />
                  <span className="text-[9px] font-black uppercase tracking-widest">{item.name}</span>
                  {isActive && <motion.div layoutId="mob-nav" className="absolute -bottom-1 h-1 w-4 bg-primary rounded-full" />}
                </Link>
              );
            })}

          <div className="flex-1 flex justify-center items-center">
            <Link
              href={addExpenseUrl}
              className="h-[56px] w-[56px] rounded-[16px] bg-primary flex items-center justify-center text-primary-foreground shadow-[0_0_20px_rgba(var(--primary),0.3)] glow-primary transition-all active:scale-90"
            >
              <Plus size={28} />
            </Link>
          </div>

          <Link
            href="/profile"
            className={cn(
              "flex flex-col items-center gap-1 flex-1 transition-all py-2",
              pathname === "/profile" ? "text-primary" : "text-muted-foreground"
            )}
          >
            <div className={cn(
              "h-7 w-7 rounded-lg flex items-center justify-center border-2 transition-all overflow-hidden relative",
              pathname === "/profile" ? "border-primary shadow-[0_0_10px_hsl(var(--primary)/0.3)]" : "border-transparent bg-white/10"
            )}>
              {user.photoURL ? <Image src={user.photoURL} alt={user.name} fill className="object-cover" /> : <LucideUser size={16} />}
            </div>
            <span className="text-[9px] font-black uppercase tracking-widest">Me</span>
          </Link>
        </div>
        {!isOnline && (
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-orange-500 text-white px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest shadow-lg flex items-center gap-1.5 border border-white/20">
            <WifiOff size={8} /> OFFLINE
          </div>
        )}
      </nav>
    </TooltipProvider>
  );
}

export function Navbar() {
  return (
    <Suspense fallback={null}>
      <NavbarContent />
    </Suspense>
  );
}
