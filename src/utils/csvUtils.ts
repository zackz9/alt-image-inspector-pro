
import { ImageResult } from '@/types';

/**
 * Escapes a value for CSV format
 */
const escapeCSV = (value: string | null): string => {
  if (value === null) return '';
  // If the value contains quotes, commas, or newlines, wrap it in quotes and escape any quotes
  if (value.includes('"') || value.includes(',') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
};

/**
 * Converts an array of image results to a CSV string
 */
export const generateCsv = (results: ImageResult[]): string => {
  // CSV header
  const header = ['Page URL', 'Image Source', 'Alt Text', 'Status'];
  
  // Map results to CSV rows
  const rows = results.map(result => [
    escapeCSV(result.pageUrl),
    escapeCSV(result.imageSrc),
    escapeCSV(result.altText),
    escapeCSV(result.status)
  ]);
  
  // Combine header and rows
  return [
    header.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');
};

/**
 * Exports results to a downloadable CSV file
 */
export const exportToCsv = (results: ImageResult[]): void => {
  const csv = generateCsv(results);
  
  // Create a blob with the CSV data
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  
  // Create a download link
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  
  // Set up the download
  const date = new Date().toISOString().split('T')[0];
  link.setAttribute('href', url);
  link.setAttribute('download', `alt-audit-${date}.csv`);
  
  // Append to the document, trigger the download, and clean up
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
