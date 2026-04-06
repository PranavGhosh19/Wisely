
"use client";

import { Loader2 } from "lucide-react";

/**
 * A reusable branded loading screen used across the app for consistent UX.
 */
export function LoadingScreen() {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-background p-6">
      <div className="flex flex-col items-center gap-6 text-center animate-in fade-in duration-1000">
        {/* Animated Logo Icon */}
        <div className="h-16 w-16 bg-primary rounded-[2rem] flex items-center justify-center text-white font-bold text-3xl shadow-2xl shadow-primary/30 animate-pulse">
          W
        </div>
        
        {/* Branding & Slogan */}
        <div className="space-y-2">
          <h1 className="text-5xl font-black font-headline text-primary tracking-tighter">
            Wisely
          </h1>
          <p className="text-[10px] md:text-xs font-bold uppercase tracking-[0.4em] text-muted-foreground/80">
            Track • Split • Settle
          </p>
        </div>

        {/* Subtle Spinner */}
        <div className="mt-4 flex items-center gap-2 text-muted-foreground/40">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-[9px] font-bold uppercase tracking-widest">Securing your vault</span>
        </div>
      </div>
    </div>
  );
}
