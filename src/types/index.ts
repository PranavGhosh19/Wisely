export type ExpenseType = 'PERSONAL' | 'GROUP';
export type SplitType = 'EQUAL' | 'UNEQUAL' | 'PERCENTAGE' | 'WEIGHT';

export interface User {
  uid: string;
  name: string;
  email: string;
  phoneNumber?: string;
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
  percentage?: number;
  weight?: number;
}

export interface Expense {
  id: string;
  amount: number;
  category: string;
  type: ExpenseType;
  date: number; // Timestamp
  createdBy: string;
  createdById: string; // Used for security rules
  updatedBy?: string;
  updatedById?: string;
  deletedBy?: string;
  deletedById?: string;
  notes?: string;
  groupId?: string;
  groupMemberIds?: string[]; // Used for security rules in group subcollections
  paidBy: string; // User UID
  splitBetween: SplitMember[];
  splitType: SplitType;
  isDeleted?: boolean;
  receiptUrl?: string;
  receiptName?: string;
}

export interface Balance {
  userId: string;
  netBalance: number;
  details: {
    to: string; // User UID
    amount: number;
  }[];
}
