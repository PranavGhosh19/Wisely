"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Users, PieChart, LogOut, Plus, User as UserIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { AddExpenseDialog } from "@/components/expenses/AddExpenseDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navItems = [
  { name: "Dash", href: "/", icon: LayoutDashboard },
  { name: "Groups", href: "/groups", icon: Users },
];

const rightNavItems = [
  { name: "Stats", href: "/analytics", icon: PieChart },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useStore();
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);

  if (!user) return null;

  const handleSignOut = () => {
    logout();
    router.push("/auth");
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <nav className="hidden md:flex fixed top-0 left-0 z-50 h-screen w-64 flex-col justify-between border-r bg-white p-4">
        <div className="flex flex-col gap-6">
          <div className="mb-4 px-2">
            <h1 className="text-2xl font-bold font-headline text-primary tracking-tight">Wisely</h1>
          </div>
          
          <div className="flex flex-col gap-1.5">
            {[...navItems, ...rightNavItems].map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-all",
                    isActive 
                      ? "text-primary bg-primary/10" 
                      : "text-muted-foreground hover:text-primary hover:bg-primary/5"
                  )}
                >
                  <Icon className={cn("h-5 w-5", isActive && "text-primary")} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col gap-4 border-t pt-4">
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
      </nav>

      {/* Mobile Bottom Bar */}
      <nav className="fixed bottom-0 left-0 z-50 w-full border-t bg-white/95 backdrop-blur-md safe-area-bottom md:hidden h-20">
        <div className="relative flex h-full items-center justify-around px-4">
          {/* Left Nav Items */}
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-1 transition-all",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              >
                <Icon className="h-6 w-6" />
                <span className="text-[10px] font-bold uppercase tracking-widest">{item.name}</span>
              </Link>
            );
          })}

          {/* Central Add Button */}
          <div className="relative -top-6">
            <Button
              onClick={() => setIsAddExpenseOpen(true)}
              className="h-14 w-14 rounded-full bg-primary shadow-lg shadow-primary/40 hover:scale-105 transition-transform"
              size="icon"
            >
              <Plus className="h-8 w-8 text-white" />
            </Button>
          </div>

          {/* Right Nav Item */}
          {rightNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-1 transition-all",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              >
                <Icon className="h-6 w-6" />
                <span className="text-[10px] font-bold uppercase tracking-widest">{item.name}</span>
              </Link>
            );
          })}

          {/* Profile Section */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex flex-col items-center gap-1 text-muted-foreground focus:outline-none">
                <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center overflow-hidden border-2 border-transparent">
                  <UserIcon className="h-4 w-4" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest">Me</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 rounded-xl mb-4 mr-2">
              <DropdownMenuLabel>
                <div className="flex flex-col">
                  <span className="font-bold">{user.name}</span>
                  <span className="text-xs text-muted-foreground font-normal">{user.email}</span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} className="text-destructive font-bold focus:text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </nav>

      <AddExpenseDialog open={isAddExpenseOpen} onOpenChange={setIsAddExpenseOpen} />
    </>
  );
}
