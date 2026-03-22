'use server';
/**
 * @fileOverview A Genkit flow for generating a natural language summary of monthly spending patterns.
 *
 * - generateMonthlySpendingSummary - A function that handles the generation of monthly spending insights.
 * - MonthlySpendingInsightsInput - The input type for the generateMonthlySpendingSummary function.
 * - MonthlySpendingInsightsOutput - The return type for the generateMonthlySpendingSummary function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MonthlySpendingInsightsInputSchema = z.object({
  month: z.string().describe('The month and year for which to generate insights (e.g., "January 2024").'),
  totalSpent: z.number().describe('The total amount spent for the specified month.'),
  personalSpent: z.number().describe('The total amount spent on personal expenses for the specified month.'),
  groupSpent: z.number().describe('The total amount spent on group expenses for the specified month.'),
  categorySpending: z.array(z.object({
    category: z.string().describe('The name of the expense category.'),
    amount: z.number().describe('The total amount spent in this category.'),
  })).describe('An array of objects detailing spending per category.'),
  topExpenses: z.array(z.object({
    description: z.string().describe('A brief description of the expense.'),
    amount: z.number().describe('The amount of the expense.'),
    category: z.string().describe('The category of the expense.'),
  })).describe('A list of the top individual expenses for the month.'),
  previousMonthTotalSpent: z.number().optional().describe('The total amount spent in the previous month, for comparison.'),
});
export type MonthlySpendingInsightsInput = z.infer<typeof MonthlySpendingInsightsInputSchema>;

const MonthlySpendingInsightsOutputSchema = z.object({
  summary: z.string().describe('A concise, natural language summary of the user\'s monthly spending patterns and key insights.'),
});
export type MonthlySpendingInsightsOutput = z.infer<typeof MonthlySpendingInsightsOutputSchema>;

export async function generateMonthlySpendingSummary(input: MonthlySpendingInsightsInput): Promise<MonthlySpendingInsightsOutput> {
  return monthlySpendingInsightsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'monthlySpendingInsightsPrompt',
  input: { schema: MonthlySpendingInsightsInputSchema },
  output: { schema: MonthlySpendingInsightsOutputSchema },
  prompt: `You are a financial advisor. Your goal is to provide a concise, natural language summary of a user's monthly spending patterns and key insights. Analyze the provided data and offer actionable advice or observations.

Here is the user's spending data for {{{month}}}:

Total Spent: {{{totalSpent}}}
Personal Expenses: {{{personalSpent}}}
Group Expenses: {{{groupSpent}}}

Spending by Category:
{{#each categorySpending}}
- {{{category}}}: {{{amount}}}
{{/each}}

Top Individual Expenses:
{{#each topExpenses}}
- {{{description}}} ({{{category}}}): {{{amount}}}
{{/each}}

{{#if previousMonthTotalSpent}}
Last month's total spending was: {{{previousMonthTotalSpent}}}.
{{/if}}

Based on this data, provide a summary focusing on:
- Overall spending trends (e.g., significant increases or decreases compared to previous month if available).
- Major spending categories.
- Any notable individual expenses.
- Concise insights or tips based on the patterns.

The summary should be easy to understand and engaging. Output only the summary field.`,
});

const monthlySpendingInsightsFlow = ai.defineFlow(
  {
    name: 'monthlySpendingInsightsFlow',
    inputSchema: MonthlySpendingInsightsInputSchema,
    outputSchema: MonthlySpendingInsightsOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
