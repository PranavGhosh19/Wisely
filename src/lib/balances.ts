
import { Expense, SimplifiedDebt } from "@/types";

/**
 * Calculates net balances for each group member based on historical expenses.
 * 
 * Logic:
 * Net Balance = (Amount Paid) - (Total Consumed Share)
 * A positive balance means they are owed money.
 * A negative balance means they owe money.
 */
export function calculateGroupBalances(members: string[], expenses: Expense[]): Record<string, number> {
  const balances: Record<string, number> = {};
  members.forEach(uid => balances[uid] = 0);

  expenses.filter(e => !e.isDeleted).forEach(exp => {
    // Add amount paid to payer's balance
    if (balances[exp.paidBy] !== undefined) {
      balances[exp.paidBy] += exp.amount;
    }

    // Subtract each person's share from their balance
    exp.splitBetween?.forEach(split => {
      if (balances[split.userId] !== undefined) {
        balances[split.userId] -= split.amount;
      }
    });
  });

  // Round to 2 decimal places to avoid floating point issues
  Object.keys(balances).forEach(uid => {
    balances[uid] = Math.round(balances[uid] * 100) / 100;
  });

  return balances;
}

/**
 * Greedy Algorithm to simplify debts (minimizes number of transfers).
 * Converts raw net balances into a list of specific transfers.
 */
export function simplifyDebts(balances: Record<string, number>): SimplifiedDebt[] {
  const debtors = Object.entries(balances)
    .filter(([_, bal]) => bal < -0.01)
    .map(([uid, bal]) => ({ uid, amount: Math.abs(bal) }))
    .sort((a, b) => b.amount - a.amount);

  const creditors = Object.entries(balances)
    .filter(([_, bal]) => bal > 0.01)
    .map(([uid, bal]) => ({ uid, amount: bal }))
    .sort((a, b) => b.amount - a.amount);

  const settlements: SimplifiedDebt[] = [];
  let i = 0, j = 0;

  while (i < debtors.length && j < creditors.length) {
    const amount = Math.min(debtors[i].amount, creditors[j].amount);
    
    if (amount > 0.01) {
      settlements.push({
        from: debtors[i].uid,
        to: creditors[j].uid,
        amount: Math.round(amount * 100) / 100
      });
    }

    debtors[i].amount -= amount;
    creditors[j].amount -= amount;

    if (debtors[i].amount < 0.01) i++;
    if (creditors[j].amount < 0.01) j++;
  }

  return settlements;
}
