export type ExpenseType = 'PERSONAL' | 'GROUP';
export type SplitType = 'EQUAL' | 'UNEQUAL' | 'PERCENTAGE';

export interface User {
  uid: string;
  name: string;
  email: string;
  photoURL?: string;
  groupIds: string[];
}

export interface Group {
  id: string;
  name: string;
  members: string[]; // User UIDs
  createdBy: string;
  createdAt: number;
}

export interface SplitMember {
  userId: string;
  amount: number;
}

export interface Expense {
  id: string;
  amount: number;
  category: string;
  type: ExpenseType;
  date: number; // Timestamp
  createdBy: string;
  notes?: string;
  groupId?: string;
  paidBy: string; // User UID
  splitBetween: SplitMember[];
  splitType: SplitType;
}

export interface Balance {
  userId: string;
  netBalance: number;
  details: {
    to: string; // User UID
    amount: number;
  }[];
}
