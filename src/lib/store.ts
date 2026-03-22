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
  logout: () => void;
}

// Initial mock data for a better "first look"
const MOCK_EXPENSES: Expense[] = [
  {
    id: '1',
    amount: 45.50,
    category: 'Food & Dining',
    type: 'PERSONAL',
    date: Date.now() - 86400000,
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
    type: 'PERSONAL',
    date: Date.now() - 172800000,
    createdBy: 'default-user',
    paidBy: 'default-user',
    splitBetween: [],
    splitType: 'EQUAL',
    notes: 'Electricity bill'
  }
];

export const useStore = create<SpenseFlowState>((set) => ({
  user: null,
  expenses: MOCK_EXPENSES,
  groups: [],
  isLoading: true,
  setUser: (user) => set({ user, isLoading: false }),
  setExpenses: (expenses) => set({ expenses }),
  setGroups: (groups) => set({ groups }),
  setLoading: (isLoading) => set({ isLoading }),
  addExpense: (expense) => set((state) => ({ expenses: [expense, ...state.expenses] })),
  addGroup: (group) => set((state) => ({ groups: [group, ...state.groups] })),
  logout: () => set({ user: null, expenses: MOCK_EXPENSES, groups: [] }),
}));
