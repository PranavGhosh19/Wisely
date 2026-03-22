"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Users, PieChart, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";

const navItems = [
  { name: "Dash", href: "/", icon: LayoutDashboard },
  { name: "Groups", href: "/groups", icon: Users },
  { name: "Stats", href: "/analytics", icon: PieChart },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useStore();

  if (!user) return null;

  const handleSignOut = () => {
    logout();
    router.push("/auth");
  };

  return (
    <nav className="fixed bottom-0 left-0 z-50 w-full border-t bg-white/95 backdrop-blur-md safe-area-bottom md:relative md:top-0 md:h-screen md:w-64 md:border-r md:border-t-0 p-3 md:p-4">
      <div className="flex h-full flex-col justify-between">
        <div className="flex flex-col gap-6">
          <div className="hidden md:block mb-4 px-2">
            <h1 className="text-2xl font-bold font-headline text-primary tracking-tight">SpenseFlow</h1>
          </div>
          
          <div className="flex flex-row justify-around md:flex-col md:gap-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex flex-col items-center gap-1 rounded-xl px-4 py-2 text-[10px] font-bold uppercase tracking-widest transition-all md:flex-row md:gap-3 md:text-sm md:normal-case md:tracking-normal",
                    isActive 
                      ? "text-primary bg-primary/10 md:bg-primary/5" 
                      : "text-muted-foreground hover:text-primary hover:bg-primary/5"
                  )}
                >
                  <Icon className={cn("h-6 w-6 md:h-5 md:w-5", isActive && "text-primary")} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="hidden md:flex flex-col gap-4 border-t pt-4">
          <div className="flex items-center gap-3 px-2">
            <div className="h-9 w-9 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold shadow-sm">
              {user.name?.[0] || "?"}
            </div>
            <div className="flex flex-col truncate">
              <span className="text-sm font-bold truncate">{user.name}</span>
              <span className="text-[11px] text-muted-foreground truncate">{user.email}</span>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="justify-start gap-3 text-destructive font-bold hover:text-destructive hover:bg-destructive/5 rounded-xl"
            onClick={handleSignOut}
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </div>
    </nav>
  );
}