
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
 * Converts an array of image results to a CSV string with one line per page
 */
export const generateCsv = (results: ImageResult[]): string => {
  // CSV header
  const header = ['Page ID', 'Page URL', 'Image Source', 'Alt Text', 'Status'];
  
  // Group results by pageId
  const groupedResults = results.reduce((acc, image) => {
    const pageId = image.pageId || image.pageUrl.split('//')[1].split('/')[0];
    
    if (!acc[pageId]) {
      acc[pageId] = {
        pageId,
        pageUrl: image.pageUrl,
        images: []
      };
    }
    
    acc[pageId].images.push(image);
    return acc;
  }, {} as Record<string, { pageId: string, pageUrl: string, images: ImageResult[] }>);
  
  // Map grouped results to CSV rows
  const rows: string[][] = [];
  
  Object.values(groupedResults).forEach(group => {
    // For each page, create one row
    group.images.forEach((image, index) => {
      // Only include page ID and URL on the first image row for this page
      const pageIdCell = index === 0 ? escapeCSV(group.pageId) : '';
      const pageUrlCell = index === 0 ? escapeCSV(group.pageUrl) : '';
      
      rows.push([
        pageIdCell,
        pageUrlCell,
        escapeCSV(image.imageSrc),
        escapeCSV(image.altText),
        escapeCSV(image.status)
      ]);
    });
    
    // Add an empty row for better readability between pages
    rows.push(['', '', '', '', '']);
  });
  
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
