import { config } from 'dotenv';
config();

import '@/ai/flows/generate-monthly-spending-summary.ts';
import '@/ai/flows/categorize-expense-from-notes.ts';