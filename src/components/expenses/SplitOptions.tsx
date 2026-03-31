"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { X, Check, Users, Percent, Calculator, Scale, Hash, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
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
  const [activeType, setActiveType] = useState<SplitType>(initialSplitType || 'EQUAL');
  
  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(() => {
    if (initialSplitBetween && initialSplitBetween.length > 0) {
      const active = initialSplitBetween.filter(s => s.amount > 0).map(s => s.userId);
      return active.length > 0 ? new Set(active) : new Set(members.map(m => m.uid));
    }
    return new Set(members.map(m => m.uid));
  });

  const [values, setValues] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    members.forEach(m => {
      const existing = initialSplitBetween?.find(s => s.userId === m.uid);
      if (initialSplitType === 'UNEQUAL') initial[m.uid] = existing?.amount?.toString() || "0";
      else if (initialSplitType === 'PERCENTAGE') initial[m.uid] = existing?.percentage?.toString() || "0";
      else if (initialSplitType === 'WEIGHT') initial[m.uid] = existing?.weight?.toString() || "1";
      else initial[m.uid] = "0";
    });
    return initial;
  });

  const splitTypes = [
    { id: 'EQUAL' as SplitType, label: 'Equal split', icon: Users, color: 'bg-blue-500/10 text-blue-500', description: 'Select which people owe an equal share.' },
    { id: 'UNEQUAL' as SplitType, label: 'Exact amount', icon: Hash, color: 'bg-green-500/10 text-green-500', description: 'Specify exactly how much each person owes.' },
    { id: 'PERCENTAGE' as SplitType, label: 'Percentage', icon: Percent, color: 'bg-orange-500/10 text-orange-500', description: 'Split by percentage of the total.' },
    { id: 'WEIGHT' as SplitType, label: 'Shares', icon: Scale, color: 'bg-purple-500/10 text-purple-500', description: 'Split by number of shares/weights.' },
  ];

  const handleValueChange = (userId: string, val: string) => {
    if (val !== "" && isNaN(Number(val))) return;
    setValues(prev => ({ ...prev, [userId]: val }));
  };

  const toggleUser = (userId: string) => {
    const next = new Set(selectedUserIds);
    if (next.has(userId)) {
      next.delete(userId);
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

  const totals = useMemo(() => {
    let sum = 0;
    Object.values(values).forEach(v => sum += Number(v || 0));
    
    const remaining = activeType === 'PERCENTAGE' ? 100 - sum : totalAmount - sum;
    
    let isValid = false;
    if (activeType === 'EQUAL') {
      isValid = selectedUserIds.size > 0;
    } else if (activeType === 'PERCENTAGE') {
      isValid = Math.abs(sum - 100) < 0.01;
    } else if (activeType === 'UNEQUAL') {
      isValid = Math.abs(sum - totalAmount) < 0.01;
    } else if (activeType === 'WEIGHT') {
      isValid = sum > 0;
    }
    
    return { sum, remaining, isValid };
  }, [values, activeType, totalAmount, selectedUserIds]);

  const perPersonAmount = useMemo(() => {
    if (selectedUserIds.size === 0) return 0;
    return totalAmount / selectedUserIds.size;
  }, [totalAmount, selectedUserIds.size]);

  const handleDone = () => {
    const splitBetween: SplitMember[] = members.map(m => {
      const val = Number(values[m.uid] || 0);
      let amount = 0;

      if (activeType === 'EQUAL') {
        amount = selectedUserIds.has(m.uid) ? perPersonAmount : 0;
      } else if (activeType === 'UNEQUAL') {
        amount = val;
      } else if (activeType === 'PERCENTAGE') {
        amount = (val / 100) * totalAmount;
      } else if (activeType === 'WEIGHT') {
        const totalWeight = totals.sum;
        amount = totalWeight > 0 ? (val / totalWeight) * totalAmount : 0;
      }

      const member: SplitMember = {
        userId: m.uid,
        amount: parseFloat(amount.toFixed(2))
      };

      if (activeType === 'PERCENTAGE') {
        member.percentage = val;
      } else if (activeType === 'WEIGHT') {
        member.weight = val;
      }

      return member;
    });

    onDone(activeType, splitBetween);
  };

  if (!isOpen) return null;

  const currentTypeInfo = splitTypes.find(t => t.id === activeType);

  return (
    <div className="fixed inset-0 z-[100] bg-background flex flex-col animate-in slide-in-from-bottom duration-300">
      <header className="flex items-center justify-between px-4 h-16 border-b shrink-0 bg-card">
        <button onClick={onClose} className="text-sm font-medium text-muted-foreground hover:text-foreground">
          Cancel
        </button>
        <h1 className="text-lg font-bold font-headline">Split options</h1>
        <button 
          onClick={handleDone} 
          className={cn(
            "text-sm font-bold transition-opacity", 
            totals.isValid ? "text-primary" : "text-muted-foreground opacity-50"
          )}
          disabled={!totals.isValid}
        >
          Done
        </button>
      </header>

      <ScrollArea className="flex-1">
        <div className="p-6 space-y-8">
          <div className="flex justify-between gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {splitTypes.map((type) => {
              const Icon = type.icon;
              const isActive = activeType === type.id;
              return (
                <button
                  key={type.id}
                  onClick={() => setActiveType(type.id)}
                  className={cn(
                    "flex flex-col items-center gap-2 p-3 min-w-[85px] rounded-2xl transition-all border-2",
                    isActive 
                      ? "border-primary bg-primary/5 shadow-sm" 
                      : "border-transparent hover:bg-muted/50"
                  )}
                >
                  <div className={cn("h-11 w-11 rounded-xl flex items-center justify-center transition-transform", type.color, isActive && "scale-110")}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <span className={cn("text-[10px] font-bold uppercase tracking-tight text-center leading-none", isActive ? "text-primary" : "text-muted-foreground")}>
                    {type.label}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="text-center space-y-1">
            <h2 className="text-2xl font-bold font-headline text-foreground">{currentTypeInfo?.label}</h2>
            <p className="text-sm text-muted-foreground">{currentTypeInfo?.description}</p>
          </div>

          <div className="space-y-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-2">Group Members</p>
            <div className="space-y-2 pb-10">
              {members.map((member) => {
                const isSelected = selectedUserIds.has(member.uid);
                return (
                  <div
                    key={member.uid}
                    className={cn(
                      "flex items-center justify-between p-4 rounded-2xl transition-all border",
                      activeType === 'EQUAL' 
                        ? (isSelected ? "bg-primary/5 border-primary/20" : "bg-card border-border")
                        : "bg-card border-border"
                    )}
                    onClick={() => activeType === 'EQUAL' && toggleUser(member.uid)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                        {member.name?.[0] || "?"}
                      </div>
                      <span className="font-bold text-sm text-foreground">
                        {member.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {activeType === 'EQUAL' && (
                        <div className={cn(
                          "h-7 w-7 rounded-full flex items-center justify-center transition-all border-2",
                          isSelected ? "bg-green-500 border-green-500 text-white" : "border-muted text-transparent"
                        )}>
                          <Check className="h-4 w-4" />
                        </div>
                      )}

                      {activeType === 'UNEQUAL' && (
                        <div className="flex items-center gap-1 border-b-2 border-muted focus-within:border-primary transition-colors">
                          <span className="text-xs text-muted-foreground font-bold">$</span>
                          <Input
                            type="number"
                            inputMode="decimal"
                            value={values[member.uid]}
                            onChange={(e) => handleValueChange(member.uid, e.target.value)}
                            className="w-24 h-8 bg-transparent border-0 focus-visible:ring-0 rounded-none px-1 text-right font-bold text-sm"
                            placeholder="0.00"
                          />
                        </div>
                      )}

                      {activeType === 'PERCENTAGE' && (
                        <div className="flex items-center gap-1 border-b-2 border-muted focus-within:border-primary transition-colors">
                          <Input
                            type="number"
                            inputMode="decimal"
                            value={values[member.uid]}
                            onChange={(e) => handleValueChange(member.uid, e.target.value)}
                            className="w-16 h-8 bg-transparent border-0 focus-visible:ring-0 rounded-none px-1 text-right font-bold text-sm"
                            placeholder="0"
                          />
                          <span className="text-xs text-muted-foreground font-bold">%</span>
                        </div>
                      )}

                      {activeType === 'WEIGHT' && (
                        <div className="flex items-center gap-3 bg-muted/30 p-1 rounded-xl border border-border/50">
                          <button 
                            className="h-8 w-8 rounded-lg bg-background flex items-center justify-center hover:bg-muted active:scale-95 transition-all shadow-sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              const current = Number(values[member.uid] || 0);
                              handleValueChange(member.uid, Math.max(0, current - 1).toString());
                            }}
                          >
                            <span className="text-lg font-bold">-</span>
                          </button>
                          <span className="w-6 text-center font-bold text-sm">{values[member.uid] || "0"}</span>
                          <button 
                            className="h-8 w-8 rounded-lg bg-background flex items-center justify-center hover:bg-muted active:scale-95 transition-all shadow-sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              const current = Number(values[member.uid] || 0);
                              handleValueChange(member.uid, (current + 1).toString());
                            }}
                          >
                            <span className="text-lg font-bold">+</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </ScrollArea>

      <footer className="shrink-0 border-t bg-card/95 backdrop-blur-md p-6 pb-10 shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">
        <div className="flex flex-col gap-4 max-w-lg mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              {activeType === 'EQUAL' && (
                <>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-foreground">${perPersonAmount.toFixed(2)}</span>
                    <span className="text-xs text-muted-foreground font-medium">/person</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
                    ({selectedUserIds.size} people)
                  </span>
                </>
              )}

              {activeType === 'UNEQUAL' && (
                <>
                  <div className="flex items-baseline gap-1">
                    <span className={cn("text-2xl font-bold", totals.remaining === 0 ? "text-green-500" : "text-foreground")}>
                      ${totals.sum.toFixed(2)}
                    </span>
                    <span className="text-xs text-muted-foreground font-medium">of ${totalAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    {Math.abs(totals.remaining) > 0.01 && <AlertCircle className="h-3 w-3 text-orange-500" />}
                    <span className={cn("text-[10px] font-bold uppercase tracking-wider", Math.abs(totals.remaining) <= 0.01 ? "text-green-500" : "text-orange-500")}>
                      {Math.abs(totals.remaining) <= 0.01 ? "Perfectly split" : `$${Math.abs(totals.remaining).toFixed(2)} ${totals.remaining > 0 ? "left" : "over"}`}
                    </span>
                  </div>
                </>
              )}

              {activeType === 'PERCENTAGE' && (
                <>
                  <div className="flex items-baseline gap-1">
                    <span className={cn("text-2xl font-bold", totals.remaining === 0 ? "text-green-500" : "text-foreground")}>
                      {totals.sum.toFixed(1)}%
                    </span>
                    <span className="text-xs text-muted-foreground font-medium">of 100%</span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    {Math.abs(totals.remaining) > 0.01 && <AlertCircle className="h-3 w-3 text-orange-500" />}
                    <span className={cn("text-[10px] font-bold uppercase tracking-wider", Math.abs(totals.remaining) <= 0.01 ? "text-green-500" : "text-orange-500")}>
                      {Math.abs(totals.remaining) <= 0.01 ? "Total reached" : `${Math.abs(totals.remaining).toFixed(1)}% ${totals.remaining > 0 ? "left" : "over"}`}
                    </span>
                  </div>
                </>
              )}

              {activeType === 'WEIGHT' && (
                <>
                  <div className="flex flex-col">
                    <span className="text-2xl font-bold text-foreground">Total Shares: {totals.sum}</span>
                    <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mt-0.5">
                      Proportional distribution
                    </span>
                  </div>
                </>
              )}
            </div>
            
            {activeType === 'EQUAL' && (
              <button 
                onClick={toggleAll}
                className="flex items-center gap-2 px-5 py-2.5 rounded-2xl border-2 border-primary/20 hover:bg-primary/5 transition-all active:scale-95"
              >
                <span className="text-sm font-bold text-primary">All</span>
                <div className={cn(
                  "h-5 w-5 rounded-full flex items-center justify-center transition-all",
                  selectedUserIds.size === members.length ? "bg-primary text-white" : "bg-muted text-transparent"
                )}>
                  <Check className="h-3 w-3" />
                </div>
              </button>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}
