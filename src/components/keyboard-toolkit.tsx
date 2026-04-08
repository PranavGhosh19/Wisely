'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * KeyboardToolkit provides a helpful accessory bar that sits directly above the mobile keyboard.
 * It appears automatically when inputs are focused and handles viewport adjustments.
 */
export function KeyboardToolkit() {
  const [isVisible, setIsVisible] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const handleFocus = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        setIsVisible(true);
      }
    };

    const handleBlur = () => {
      // Small timeout to see if focus moved to another input
      setTimeout(() => {
        const active = document.activeElement;
        if (!active || (active.tagName !== 'INPUT' && active.tagName !== 'TEXTAREA' && !(active as HTMLElement).isContentEditable)) {
          setIsVisible(false);
        }
      }, 100);
    };

    const handleViewportChange = () => {
      if (!window.visualViewport) return;
      
      // Calculate height difference between layout viewport and visual viewport (keyboard height)
      const offset = window.innerHeight - window.visualViewport.height;
      
      // Update state
      setKeyboardHeight(offset > 50 ? offset : 0);
      
      // If keyboard is significantly up, ensure we show the bar if an input is active
      if (offset > 150) {
        const active = document.activeElement;
        if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA')) {
          setIsVisible(true);
        }
      } else if (offset < 50) {
        // Close if keyboard is closed
        setIsVisible(false);
      }
    };

    window.addEventListener('focusin', handleFocus);
    window.addEventListener('focusout', handleBlur);
    
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleViewportChange);
      window.visualViewport.addEventListener('scroll', handleViewportChange);
    }

    return () => {
      window.removeEventListener('focusin', handleFocus);
      window.removeEventListener('focusout', handleBlur);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleViewportChange);
        window.visualViewport.removeEventListener('scroll', handleViewportChange);
      }
    };
  }, []);

  // Only show on mobile and when keyboard/focus is active
  if (!isVisible || keyboardHeight < 50) return null;

  return (
    <div 
      className={cn(
        "fixed left-0 z-[10000] w-full h-12 bg-card/90 backdrop-blur-2xl border-t border-primary/30 flex items-center justify-between px-4 transition-all duration-100 ease-out md:hidden shadow-[0_-8px_30px_rgba(0,0,0,0.3)]",
      )}
      style={{ 
        bottom: `${keyboardHeight}px`,
      }}
    >
      <div className="flex items-center gap-1">
        <button className="p-2 text-muted-foreground hover:text-primary active:scale-90 transition-all">
          <ChevronUp className="h-5 w-5" />
        </button>
        <button className="p-2 text-muted-foreground hover:text-primary active:scale-90 transition-all">
          <ChevronDown className="h-5 w-5" />
        </button>
      </div>

      <div className="flex-1 flex justify-center">
        <span className="text-[9px] font-black uppercase tracking-[0.3em] text-primary/40 animate-pulse">
          Wisely Editor
        </span>
      </div>

      <Button 
        variant="ghost" 
        size="sm" 
        className="h-9 px-4 rounded-xl font-black text-[10px] uppercase tracking-widest text-primary hover:bg-primary/10 transition-all active:scale-95"
        onClick={() => {
          if (document.activeElement instanceof HTMLElement) {
            document.activeElement.blur();
          }
        }}
      >
        Done
      </Button>
    </div>
  );
}
