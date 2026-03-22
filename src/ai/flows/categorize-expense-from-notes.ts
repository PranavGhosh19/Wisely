'use server';
/**
 * @fileOverview An AI agent for categorizing expenses based on provided notes.
 *
 * - categorizeExpense - A function that handles the expense categorization process.
 * - CategorizeExpenseInput - The input type for the categorizeExpense function.
 * - CategorizeExpenseOutput - The return type for the categorizeExpense function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CategorizeExpenseInputSchema = z.object({
  notes: z.string().describe('The notes or description for the expense.'),
});
export type CategorizeExpenseInput = z.infer<typeof CategorizeExpenseInputSchema>;

const CategorizeExpenseOutputSchema = z.object({
  category: z.string().describe('The suggested category for the expense.'),
});
export type CategorizeExpenseOutput = z.infer<typeof CategorizeExpenseOutputSchema>;

export async function categorizeExpense(input: CategorizeExpenseInput): Promise<CategorizeExpenseOutput> {
  return categorizeExpenseFlow(input);
}

const categorizeExpensePrompt = ai.definePrompt({
  name: 'categorizeExpensePrompt',
  input: {schema: CategorizeExpenseInputSchema},
  output: {schema: CategorizeExpenseOutputSchema},
  prompt: `You are an AI assistant specialized in categorizing financial expenses.

Based on the provided notes, suggest a single, most appropriate expense category from the following list:
- Food & Dining
- Transportation
- Utilities
- Rent/Mortgage
- Shopping
- Entertainment
- Groceries
- Healthcare
- Education
- Travel
- Personal Care
- Gifts & Donations
- Salary/Income (if applicable, otherwise pick an expense category)
- Investments (if applicable, otherwise pick an relevant expense category)
- Other

Ensure the output is a single, concise category name from the list provided.

Expense Notes: {{{notes}}}`,
});

const categorizeExpenseFlow = ai.defineFlow(
  {
    name: 'categorizeExpenseFlow',
    inputSchema: CategorizeExpenseInputSchema,
    outputSchema: CategorizeExpenseOutputSchema,
  },
  async input => {
    const {output} = await categorizeExpensePrompt(input);
    return output!;
  }
);
