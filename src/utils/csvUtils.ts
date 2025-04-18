
import { ImageResult, AltStatus } from '@/types';

const escapeCSV = (value: string | null): string => {
  if (value === null) return '';
  if (value.includes('"') || value.includes(',') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
};

export const generateCsv = (results: ImageResult[], status: AltStatus | 'all' = 'all'): string => {
  const header = ['Page ID', 'Page URL', 'Image Source', 'Alt Text', 'Status'];
  
  // Filter results based on status
  const filteredResults = status === 'all' 
    ? results 
    : results.filter(image => image.status === status);

  // Map results to CSV rows
  const rows = filteredResults.map(image => [
    image.pageId.toString(),
    escapeCSV(image.pageUrl),
    escapeCSV(image.imageSrc),
    escapeCSV(image.altText),
    escapeCSV(image.status)
  ]);

  return [header.join(','), ...rows.map(row => row.join(','))].join('\n');
};

export const exportToCsv = (results: ImageResult[], status: AltStatus | 'all' = 'all'): void => {
  const csv = generateCsv(results, status);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const date = new Date().toISOString().split('T')[0];
  const statusStr = status === 'all' ? 'all' : status;
  link.setAttribute('href', url);
  link.setAttribute('download', `alt-audit-${statusStr}-${date}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
