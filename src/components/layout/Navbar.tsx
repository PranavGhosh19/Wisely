
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Users, PieChart, LogOut, Plus, User as UserIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";

const navItems = [
  { name: "Dash", href: "/dashboard", icon: LayoutDashboard },
  { name: "Groups", href: "/groups", icon: Users },
];

const rightNavItems = [
  { name: "Stats", href: "/analytics", icon: PieChart },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, setInstallPrompt } = useStore();

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [setInstallPrompt]);

  const isPublicPage = pathname === "/" || pathname === "/auth";
  if (isPublicPage || !user) return null;

  const handleSignOut = () => {
    logout();
    router.push("/");
  };

  const groupMatch = pathname.match(/^\/groups\/([^/]+)$/);
  const contextGroupId = groupMatch ? groupMatch[1] : undefined;
  
  const addExpenseUrl = contextGroupId 
    ? `/expenses/add?type=GROUP&groupId=${contextGroupId}` 
    : `/expenses/add`;

  return (
    <>
      {/* Desktop Sidebar */}
      <nav className="hidden md:flex fixed top-0 left-0 z-50 h-screen w-64 flex-col justify-between border-r bg-card p-4">
        <div className="flex flex-col gap-6">
          <Link href="/" className="mb-4 px-2 block transition-transform hover:scale-95">
            <h1 className="text-2xl font-bold font-headline text-primary tracking-tight">Wisely</h1>
          </Link>
          
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
            <Link
              href="/profile"
              className={cn(
                "flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-all",
                pathname === "/profile" 
                  ? "text-primary bg-primary/10" 
                  : "text-muted-foreground hover:text-primary hover:bg-primary/5"
              )}
            >
              <UserIcon className={cn("h-5 w-5", pathname === "/profile" && "text-primary")} />
              <span>Profile</span>
            </Link>
          </div>
        </div>

        <div className="flex flex-col gap-4 border-t pt-4">
          <Link href="/profile" className="flex items-center gap-3 px-2 hover:bg-muted/50 p-2 rounded-xl transition-colors">
            <div className="h-9 w-9 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold shadow-sm">
              {user.name?.[0] || "?"}
            </div>
            <div className="flex flex-col truncate">
              <span className="text-sm font-bold truncate">{user.name}</span>
              <span className="text-[11px] text-muted-foreground truncate">{user.email}</span>
            </div>
          </Link>
          <Button 
            variant="ghost" 
            size="sm" 
            className="justify-start gap-3 text-destructive font-bold hover:text-destructive hover:bg-destructive/5 rounded-xl transition-all"
            onClick={handleSignOut}
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </nav>

      {/* Mobile Bottom Bar */}
      <nav className="fixed bottom-0 left-0 z-50 w-full border-t bg-background/95 backdrop-blur-md safe-area-bottom md:hidden h-20">
        <div className="relative flex h-full items-center justify-around px-4">
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

          <div className="relative -top-6">
            <Button
              asChild
              className="h-14 w-14 rounded-full bg-primary shadow-lg shadow-primary/40 hover:scale-105 transition-transform active:scale-90"
              size="icon"
            >
              <Link href={addExpenseUrl}>
                <Plus className="h-8 w-8 text-white" />
              </Link>
            </Button>
          </div>

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

          <Link
            href="/profile"
            className={cn(
              "flex flex-col items-center gap-1 transition-all",
              pathname === "/profile" ? "text-primary" : "text-muted-foreground"
            )}
          >
            <div className={cn(
              "h-6 w-6 rounded-full flex items-center justify-center border-2 transition-all",
              pathname === "/profile" ? "border-primary bg-primary/10" : "border-transparent bg-muted"
            )}>
              <UserIcon className="h-4 w-4" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest">Me</span>
          </Link>
        </div>
      </nav>
    </>
  );
}
