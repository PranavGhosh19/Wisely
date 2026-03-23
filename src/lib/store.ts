
import { create } from 'zustand';
import { User, Expense, Group } from '@/types';

interface SpenseFlowState {
  user: User | null;
  expenses: Expense[];
  groups: Group[];
  categories: string[];
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setExpenses: (expenses: Expense[]) => void;
  setGroups: (groups: Group[]) => void;
  setCategories: (categories: string[]) => void;
  addCategory: (category: string) => void;
  removeCategory: (category: string) => void;
  setLoading: (loading: boolean) => void;
  addExpense: (expense: Expense) => void;
  addGroup: (group: Group) => void;
  logout: () => void;
}

const DEFAULT_CATEGORIES = [
  "Food & Dining", "Transportation", "Utilities", "Rent/Mortgage", 
  "Shopping", "Entertainment", "Groceries", "Healthcare", 
  "Education", "Travel", "Personal Care", "Other"
];

const MOCK_GROUPS: Group[] = [
  {
    id: 'g1',
    name: 'Roommates 202',
    members: ['default-user', 'user-2', 'user-3'],
    createdBy: 'default-user',
    createdAt: 1710979200000,
  },
  {
    id: 'g2',
    name: 'Europe Trip',
    members: ['default-user', 'user-4'],
    createdBy: 'user-4',
    createdAt: 1711065600000,
  }
];

const MOCK_EXPENSES: Expense[] = [
  {
    id: '1',
    amount: 45.50,
    category: 'Food & Dining',
    type: 'PERSONAL',
    date: 1711152000000,
    createdBy: 'default-user',
    paidBy: 'default-user',
    splitBetween: [],
    splitType: 'EQUAL',
    notes: 'Dinner at Mario\'s'
  },
  {
    id: '2',
    amount: 120.00,
    category: 'Utilities',
    type: 'GROUP',
    groupId: 'g1',
    date: 1711238400000,
    createdBy: 'default-user',
    paidBy: 'default-user',
    splitBetween: [{ userId: 'default-user', amount: 40 }, { userId: 'user-2', amount: 40 }, { userId: 'user-3', amount: 40 }],
    splitType: 'EQUAL',
    notes: 'Electricity bill'
  }
];

export const useStore = create<SpenseFlowState>((set) => ({
  user: null,
  expenses: MOCK_EXPENSES,
  groups: MOCK_GROUPS,
  categories: DEFAULT_CATEGORIES,
  isLoading: true,
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
  addGroup: (group) => set((state) => ({ groups: [group, ...state.groups] })),
  logout: () => set({ user: null, expenses: MOCK_EXPENSES, groups: MOCK_GROUPS, categories: DEFAULT_CATEGORIES }),
}));
