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

// Using static timestamps to prevent hydration mismatches during module initialization
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
  isLoading: true,
  setUser: (user) => set({ user, isLoading: false }),
  setExpenses: (expenses) => set({ expenses }),
  setGroups: (groups) => set({ groups }),
  setLoading: (isLoading) => set({ isLoading }),
  addExpense: (expense) => set((state) => ({ expenses: [expense, ...state.expenses] })),
  addGroup: (group) => set((state) => ({ groups: [group, ...state.groups] })),
  logout: () => set({ user: null, expenses: MOCK_EXPENSES, groups: MOCK_GROUPS }),
}));
