
import { create } from 'zustand';
import { User, Expense, Group } from '@/types';

interface SpenseFlowState {
  user: User | null;
  expenses: Expense[];
  groups: Group[];
  categories: string[];
  isLoading: boolean;
  installPrompt: any | null;
  setUser: (user: User | null) => void;
  setExpenses: (expenses: Expense[]) => void;
  setGroups: (groups: Group[]) => void;
  setCategories: (categories: string[]) => void;
  addCategory: (category: string) => void;
  removeCategory: (category: string) => void;
  setLoading: (loading: boolean) => void;
  addExpense: (expense: Expense) => void;
  deleteExpense: (id: string) => void;
  addGroup: (group: Group) => void;
  setInstallPrompt: (prompt: any) => void;
  logout: () => void;
}

const DEFAULT_CATEGORIES = [
  "Food & Dinning", 
  "Travel", 
  "Utilities", 
  "Rent / Mortgage", 
  "Shopping", 
  "Groceries", 
  "Others"
];

export const useStore = create<SpenseFlowState>((set) => ({
  user: null,
  expenses: [],
  groups: [],
  categories: DEFAULT_CATEGORIES,
  isLoading: true,
  installPrompt: null,
  setUser: (user) => set({ user, isLoading: false }),
  setExpenses: (expenses) => set({ expenses }),
  setGroups: (groups) => set({ groups }),
  setCategories: (categories) => set({ categories }),
  addCategory: (category) => set((state) => ({ 
    categories: state.categories.includes(category) ? state.categories : [...state.categories, category] 
  })),
  removeCategory: (category) => set((state) => ({
    categories: state.categories.filter(c => c !== category)
  })),
  setLoading: (isLoading) => set({ isLoading }),
  addExpense: (expense) => set((state) => ({ expenses: [expense, ...state.expenses] })),
  deleteExpense: (id) => set((state) => ({
    expenses: state.expenses.map(e => e.id === id ? { ...e, isDeleted: true } : e)
  })),
  addGroup: (group) => set((state) => ({ groups: [group, ...state.groups] })),
  setInstallPrompt: (installPrompt) => set({ installPrompt }),
  logout: () => set({ user: null, expenses: [], groups: [], categories: DEFAULT_CATEGORIES, installPrompt: null }),
}));
