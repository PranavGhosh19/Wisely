
"use client";

import React, { useState, useMemo } from 'react';
import { X, Check, Users, Percent, Calculator, Scale, Hash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SplitType, SplitMember, User } from '@/types';
import { cn } from '@/lib/utils';

interface SplitOptionsProps {
  isOpen: boolean;
  onClose: () => void;
  onDone: (splitType: SplitType, splitBetween: SplitMember[]) => void;
  members: User[];
  totalAmount: number;
  initialSplitType: SplitType;
  initialSplitBetween: SplitMember[];
}

export function SplitOptions({
  isOpen,
  onClose,
  onDone,
  members,
  totalAmount,
  initialSplitType,
  initialSplitBetween,
}: SplitOptionsProps) {
  const [activeType, setActiveType] = useState<SplitType>(initialSplitType);
  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(
    new Set(initialSplitBetween.length > 0 
      ? initialSplitBetween.map(s => s.userId) 
      : members.map(m => m.uid)
    )
  );

  const splitTypes = [
    { id: 'EQUAL' as SplitType, label: 'Equal split', icon: Users, color: 'bg-blue-500/10 text-blue-500' },
    { id: 'UNEQUAL' as SplitType, label: 'Exact amount', icon: Hash, color: 'bg-green-500/10 text-green-500' },
    { id: 'PERCENTAGE' as SplitType, label: 'Percentage', icon: Percent, color: 'bg-orange-500/10 text-orange-500' },
    { id: 'WEIGHT' as SplitType, label: 'Shares', icon: Scale, color: 'bg-purple-500/10 text-purple-500' },
  ];

  const inputModes = [
    { id: 'EQUAL', label: '=' },
    { id: 'UNEQUAL', label: '1.23' },
    { id: 'PERCENTAGE', label: '%' },
    { id: 'WEIGHT', label: '| | |' },
    { id: 'ADJUST', label: '+/-' },
  ];

  const toggleUser = (userId: string) => {
    const next = new Set(selectedUserIds);
    if (next.has(userId)) {
      if (next.size > 1) next.delete(userId);
    } else {
      next.add(userId);
    }
    setSelectedUserIds(next);
  };

  const toggleAll = () => {
    if (selectedUserIds.size === members.length) {
      setSelectedUserIds(new Set([members[0].uid]));
    } else {
      setSelectedUserIds(new Set(members.map(m => m.uid)));
    }
  };

  const perPersonAmount = useMemo(() => {
    if (selectedUserIds.size === 0) return 0;
    return totalAmount / selectedUserIds.size;
  }, [totalAmount, selectedUserIds.size]);

  const handleDone = () => {
    const splitBetween: SplitMember[] = Array.from(selectedUserIds).map(uid => {
      const amount = activeType === 'EQUAL' 
        ? parseFloat(perPersonAmount.toFixed(2)) 
        : 0; // In a full implementation, Exact/Percent would have their own input state
      return { userId: uid, amount };
    });
    onDone(activeType, splitBetween);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-background flex flex-col animate-in slide-in-from-bottom duration-300">
      {/* Top Navigation Bar */}
      <header className="flex items-center justify-between px-4 h-16 border-b shrink-0">
        <button onClick={onClose} className="text-sm font-medium text-muted-foreground hover:text-foreground">
          Cancel
        </button>
        <h1 className="text-lg font-bold font-headline">Split options</h1>
        <button onClick={handleDone} className="text-sm font-bold text-primary">
          Done
        </button>
      </header>

      <ScrollArea className="flex-1">
        <div className="p-6 space-y-8">
          {/* Split Type Selector */}
          <div className="flex justify-between gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {splitTypes.map((type) => {
              const Icon = type.icon;
              const isActive = activeType === type.id;
              return (
                <button
                  key={type.id}
                  onClick={() => setActiveType(type.id)}
                  className={cn(
                    "flex flex-col items-center gap-2 p-3 min-w-[80px] rounded-2xl transition-all border-2",
                    isActive 
                      ? "border-primary bg-primary/5 shadow-sm" 
                      : "border-transparent hover:bg-muted/50"
                  )}
                >
                  <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center", type.color)}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className={cn("text-[10px] font-bold uppercase tracking-tight text-center leading-none", isActive ? "text-primary" : "text-muted-foreground")}>
                    {type.label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Section Title */}
          <div className="text-center space-y-1">
            <h2 className="text-2xl font-bold font-headline text-foreground">Split equally</h2>
            <p className="text-sm text-muted-foreground">Select which people owe an equal share.</p>
          </div>

          {/* Input Mode Selector (Segmented Control) */}
          <div className="flex items-center justify-center">
            <div className="inline-flex p-1 bg-muted rounded-xl gap-1">
              {inputModes.map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => {
                    if (['EQUAL', 'UNEQUAL', 'PERCENTAGE', 'WEIGHT'].includes(mode.id)) {
                      setActiveType(mode.id as SplitType);
                    }
                  }}
                  className={cn(
                    "flex items-center justify-center w-12 h-10 rounded-lg text-sm font-bold transition-all",
                    activeType === mode.id || (activeType === 'UNEQUAL' && mode.id === 'UNEQUAL')
                      ? "bg-background text-primary shadow-sm"
                      : "text-muted-foreground hover:bg-background/50 border border-transparent"
                  )}
                >
                  {mode.label}
                </button>
              ))}
            </div>
          </div>

          {/* Member List */}
          <div className="space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-2 mb-2">Group Members</p>
            <div className="divide-y border rounded-2xl overflow-hidden bg-card/50">
              {members.map((member) => {
                const isSelected = selectedUserIds.has(member.uid);
                return (
                  <button
                    key={member.uid}
                    onClick={() => toggleUser(member.uid)}
                    className="w-full flex items-center justify-between p-4 hover:bg-muted/30 transition-colors text-left"
                  >
                    <span className={cn("font-bold text-sm", isSelected ? "text-foreground" : "text-muted-foreground")}>
                      {member.name}
                    </span>
                    <div className={cn(
                      "h-6 w-6 rounded-full flex items-center justify-center transition-all border-2",
                      isSelected ? "bg-green-500 border-green-500 text-white" : "border-muted text-transparent"
                    )}>
                      <Check className="h-3.5 w-3.5" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </ScrollArea>

      {/* Bottom Summary Bar */}
      <footer className="shrink-0 border-t bg-background/80 backdrop-blur-md p-4 pb-8 shadow-[0_-8px_30px_rgb(0,0,0,0.04)]">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <div className="flex flex-col">
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-bold text-foreground">₹{perPersonAmount.toFixed(2)}</span>
              <span className="text-xs text-muted-foreground font-medium">/person</span>
            </div>
            <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
              ({selectedUserIds.size} people)
            </span>
          </div>
          
          <button 
            onClick={toggleAll}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-primary/20 hover:bg-primary/5 transition-all active:scale-95"
          >
            <span className="text-sm font-bold text-primary">All</span>
            <div className={cn(
              "h-5 w-5 rounded-full flex items-center justify-center transition-all",
              selectedUserIds.size === members.length ? "bg-primary text-white" : "bg-muted text-transparent"
            )}>
              <Check className="h-3 w-3" />
            </div>
          </button>
        </div>
      </footer>
    </div>
  );
}
