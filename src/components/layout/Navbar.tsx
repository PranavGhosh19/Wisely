
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard, 
  Users, 
  PieChart, 
  LogOut, 
  Plus, 
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
  ReceiptText
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import { useAuth } from "@/firebase";
import { signOut } from "firebase/auth";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Groups", href: "/groups", icon: Users },
  { name: "Transactions", href: "/transactions", icon: ReceiptText },
  { name: "Analytics", href: "/analytics", icon: PieChart },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const auth = useAuth();
  const { user, logout, setInstallPrompt, isSidebarCollapsed, toggleSidebar } = useStore();

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

  const handleSignOut = async () => {
    if (auth) {
      await signOut(auth);
    }
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
      <nav className={cn(
        "hidden md:flex sticky top-0 h-screen flex-col justify-between border-r bg-card/50 backdrop-blur-xl transition-all duration-300 ease-in-out shrink-0 overflow-hidden",
        isSidebarCollapsed ? "w-20 p-4" : "w-72 p-6"
      )}>
        <div className="flex flex-col gap-8">
          <div className="flex items-center justify-between px-2">
            {!isSidebarCollapsed && (
              <Link href="/dashboard" className="block transition-all hover:opacity-80">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-primary rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-primary/20">W</div>
                  <h1 className="text-2xl font-bold font-headline text-primary tracking-tight">Wisely</h1>
                </div>
              </Link>
            )}
            {isSidebarCollapsed && (
              <div className="h-10 w-10 bg-primary rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-primary/20 mx-auto">W</div>
            )}
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleSidebar} 
              className={cn("h-8 w-8 text-muted-foreground hover:text-primary", isSidebarCollapsed && "mt-4 mx-auto")}
            >
              {isSidebarCollapsed ? <PanelLeftOpen className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
            </Button>
          </div>
          
          <div className="flex flex-col gap-2">
            {!isSidebarCollapsed && <p className="px-4 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-2">Main Menu</p>}
            
            <TooltipProvider delayDuration={0}>
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
                
                const linkContent = (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-2xl transition-all group",
                      isSidebarCollapsed ? "justify-center p-3" : "px-4 py-3",
                      isActive 
                        ? "text-primary bg-primary/10 shadow-sm" 
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    )}
                  >
                    <Icon className={cn("h-5 w-5 transition-transform group-hover:scale-110", isActive && "text-primary")} />
                    {!isSidebarCollapsed && <span className="text-sm font-semibold">{item.name}</span>}
                  </Link>
                );

                if (isSidebarCollapsed) {
                  return (
                    <Tooltip key={item.name}>
                      <TooltipTrigger asChild>
                        {linkContent}
                      </TooltipTrigger>
                      <TooltipContent side="right">
                        {item.name}
                      </TooltipContent>
                    </Tooltip>
                  );
                }
                return linkContent;
              })}
              
              {!isSidebarCollapsed && <p className="px-4 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mt-6 mb-2">Account</p>}
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    href="/profile"
                    className={cn(
                      "flex items-center gap-3 rounded-2xl transition-all group",
                      isSidebarCollapsed ? "justify-center p-3" : "px-4 py-3",
                      pathname === "/profile" 
                        ? "text-primary bg-primary/10 shadow-sm" 
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    )}
                  >
                    <Settings className={cn("h-5 w-5 transition-transform group-hover:rotate-45", pathname === "/profile" && "text-primary")} />
                    {!isSidebarCollapsed && <span className="text-sm font-semibold">Settings</span>}
                  </Link>
                </TooltipTrigger>
                {isSidebarCollapsed && <TooltipContent side="right">Settings</TooltipContent>}
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link href="/profile" className={cn(
                  "flex items-center gap-4 rounded-2xl bg-muted/30 hover:bg-muted/50 transition-all border border-transparent hover:border-border/50",
                  isSidebarCollapsed ? "p-2 justify-center" : "p-4"
                )}>
                  <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold shadow-sm ring-2 ring-background shrink-0">
                    {user.name?.[0] || "?"}
                  </div>
                  {!isSidebarCollapsed && (
                    <div className="flex flex-col truncate flex-1">
                      <span className="text-sm font-bold truncate leading-none mb-1">{user.name}</span>
                      <span className="text-[11px] text-muted-foreground truncate opacity-70">Personal Plan</span>
                    </div>
                  )}
                </Link>
              </TooltipTrigger>
              {isSidebarCollapsed && <TooltipContent side="right">{user.name}</TooltipContent>}
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size={isSidebarCollapsed ? "icon" : "sm"} 
                  className={cn(
                    "w-full text-destructive font-bold hover:text-destructive hover:bg-destructive/5 rounded-2xl transition-all h-12",
                    isSidebarCollapsed ? "justify-center" : "justify-start px-4 gap-3"
                  )}
                  onClick={handleSignOut}
                >
                  <LogOut className="h-5 w-5" />
                  {!isSidebarCollapsed && <span>Sign Out</span>}
                </Button>
              </TooltipTrigger>
              {isSidebarCollapsed && <TooltipContent side="right">Sign Out</TooltipContent>}
            </Tooltip>
          </TooltipProvider>
        </div>
      </nav>

      {/* Mobile Bottom Bar */}
      <nav className="fixed bottom-0 left-0 z-50 w-full border-t bg-background/95 backdrop-blur-md safe-area-bottom md:hidden h-20">
        <div className="relative flex h-full items-center justify-around px-2">
          <Link
            href="/dashboard"
            className={cn(
              "flex flex-col items-center gap-1 flex-1 transition-all",
              pathname === "/dashboard" ? "text-primary" : "text-muted-foreground"
            )}
          >
            <LayoutDashboard className="h-5 w-5" />
            <span className="text-[9px] font-bold uppercase tracking-widest">Dash</span>
          </Link>

          <Link
            href="/groups"
            className={cn(
              "flex flex-col items-center gap-1 flex-1 transition-all",
              pathname.startsWith("/groups") ? "text-primary" : "text-muted-foreground"
            )}
          >
            <Users className="h-5 w-5" />
            <span className="text-[9px] font-bold uppercase tracking-widest">Groups</span>
          </Link>

          <div className="relative -top-6 px-2">
            <Button
              asChild
              className="h-14 w-14 rounded-full bg-primary shadow-xl shadow-primary/40 hover:scale-105 transition-transform active:scale-90 border-4 border-background"
              size="icon"
            >
              <Link href={addExpenseUrl}>
                <Plus className="h-8 w-8 text-white" />
              </Link>
            </Button>
          </div>

          <Link
            href="/transactions"
            className={cn(
              "flex flex-col items-center gap-1 flex-1 transition-all",
              pathname === "/transactions" ? "text-primary" : "text-muted-foreground"
            )}
          >
            <ReceiptText className="h-5 w-5" />
            <span className="text-[9px] font-bold uppercase tracking-widest">History</span>
          </Link>

          <Link
            href="/profile"
            className={cn(
              "flex flex-col items-center gap-1 flex-1 transition-all",
              pathname === "/profile" ? "text-primary" : "text-muted-foreground"
            )}
          >
            <div className={cn(
              "h-7 w-7 rounded-lg flex items-center justify-center border-2 transition-all overflow-hidden",
              pathname === "/profile" ? "border-primary bg-primary/10" : "border-transparent bg-muted"
            )}>
              <span className="text-[10px] font-bold">W</span>
            </div>
            <span className="text-[9px] font-bold uppercase tracking-widest">Me</span>
          </Link>
        </div>
      </nav>
    </>
  );
}
