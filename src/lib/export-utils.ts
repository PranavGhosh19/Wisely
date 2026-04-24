
import * as XLSX from 'xlsx';
import { format } from 'date-fns';

/**
 * Utility to generate an Excel workbook from expense data.
 */
export function generateMonthlySpreadsheet(expenses: any[], userEmail: string, currencySymbol: string) {
  const monthName = format(new Date(), "MMMM yyyy");
  
  // 1. Format Detailed Transactions
  const detailedData = expenses.map(exp => ({
    'Date': format(exp.date, 'yyyy-MM-dd'),
    'Category': exp.category,
    'Amount': `${currencySymbol}${exp.amount.toFixed(2)}`,
    'Type': exp.type === 'PERSONAL' ? 'Private' : 'Shared',
    'Paid By': exp.paidByLabel || 'Unknown',
    'Notes': exp.notes || ''
  }));

  // 2. Format Category Totals
  const categoryTotals: Record<string, number> = {};
  expenses.forEach(exp => {
    categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + exp.amount;
  });
  
  const summaryData = Object.entries(categoryTotals).map(([cat, total]) => ({
    'Category': cat,
    'Total Spent': `${currencySymbol}${total.toFixed(2)}`
  }));

  // Create Workbook and Sheets
  const wb = XLSX.utils.book_new();
  
  const wsDetailed = XLSX.utils.json_to_sheet(detailedData);
  const wsSummary = XLSX.utils.json_to_sheet(summaryData);

  // Set column widths for better readability
  wsDetailed['!cols'] = [{ wch: 15 }, { wch: 20 }, { wch: 12 }, { wch: 10 }, { wch: 15 }, { wch: 30 }];
  wsSummary['!cols'] = [{ wch: 20 }, { wch: 15 }];

  XLSX.utils.book_append_sheet(wb, wsDetailed, "Detailed Records");
  XLSX.utils.book_append_sheet(wb, wsSummary, "Category Summary");

  return wb;
}

/**
 * Downloads the workbook directly in the browser
 */
export function downloadWorkbook(wb: XLSX.WorkBook, filename: string) {
  XLSX.writeFile(wb, filename);
}
