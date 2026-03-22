import { create } from 'zustand';
import { User, Expense, Group } from '@/types';

interface SpenseFlowState {
  user: User | null;
  expenses: Expense[];
  groups: Group[];
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setExpenses: (expenses: Expense[]) => void;
  setGroups: (groups: Group[]) => void;
  setLoading: (loading: boolean) => void;
  addExpense: (expense: Expense) => void;
  addGroup: (group: Group) => void;
}

export const useStore = create<SpenseFlowState>((set) => ({
  user: null,
  expenses: [],
  groups: [],
  isLoading: true,
  setUser: (user) => set({ user }),
  setExpenses: (expenses) => set({ expenses }),
  setGroups: (groups) => set({ groups }),
  setLoading: (isLoading) => set({ isLoading }),
  addExpense: (expense) => set((state) => ({ expenses: [expense, ...state.expenses] })),
  addGroup: (group) => set((state) => ({ groups: [group, ...state.groups] })),
}));