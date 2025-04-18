import React, { useState, useEffect } from 'react';
import { PageResult, ImageResult, AltStatus } from '@/types';
import StatusBadge from './StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download, Search, ExternalLink } from 'lucide-react';
import { exportToCsv } from '@/utils/csvUtils';

interface ResultsTableProps {
  results: PageResult[];
  onExport: (status: AltStatus | 'all') => void;
}

const ResultsTable: React.FC<ResultsTableProps> = ({ results, onExport }) => {
  const [expandedUrls, setExpandedUrls] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<AltStatus | 'all'>('all');
  const itemsPerPage = 10;
  const [selectedStatus, setSelectedStatus] = useState<AltStatus | 'all'>('all');

  // Flatten all image results for display
  const allImageResults = results.flatMap(result => 
    result.images.map(img => ({ ...img, pageStatus: result.status }))
  );

  // Apply search and filters
  const filteredResults = allImageResults.filter(img => {
    const matchesSearch = 
      img.pageUrl.toLowerCase().includes(searchTerm.toLowerCase()) || 
      img.imageSrc.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (img.altText && img.altText.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesSearch && (statusFilter === 'all' || img.status === statusFilter);
  });

  // Pagination
  const totalPages = Math.ceil(filteredResults.length / itemsPerPage);
  const paginatedResults = filteredResults.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Toggle expansion of URL details
  const toggleExpand = (url: string) => {
    const newExpanded = new Set(expandedUrls);
    if (newExpanded.has(url)) {
      newExpanded.delete(url);
    } else {
      newExpanded.add(url);
    }
    setExpandedUrls(newExpanded);
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (results.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-lg font-semibold">Scan Results</h2>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search results..."
              className="pl-8 w-full sm:w-[250px]"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
          
          <Select value={selectedStatus} onValueChange={(value: AltStatus | 'all') => {
            setSelectedStatus(value);
            onExport(value);
          }}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="missing">Missing</SelectItem>
              <SelectItem value="present">Present</SelectItem>
              <SelectItem value="empty">Empty</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40%]">Page URL / Image</TableHead>
              <TableHead className="w-[40%]">Alt Text</TableHead>
              <TableHead className="w-[20%]">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedResults.length > 0 ? (
              paginatedResults.map((image) => (
                <TableRow key={image.id}>
                  <TableCell className="font-mono text-xs break-all">
                    <div>
                      <a 
                        href={image.pageUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline flex items-center"
                      >
                        {image.pageUrl.substring(0, 50)}{image.pageUrl.length > 50 ? '...' : ''}
                        <ExternalLink className="ml-1 h-3 w-3" />
                      </a>
                    </div>
                    <div className="mt-1 text-muted-foreground break-all">
                      {image.imageSrc.substring(0, 50)}{image.imageSrc.length > 50 ? '...' : ''}
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {image.altText || 
                      <span className="text-muted-foreground italic">
                        {image.status === 'missing' ? 'No alt attribute' : 'Empty alt attribute'}
                      </span>
                    }
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={image.status} />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-6 text-muted-foreground">
                  No results match your search
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-4">
          <div className="flex space-x-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(page => {
                // Show current page, first page, last page, and pages within ±2 of current
                return page === 1 || 
                       page === totalPages || 
                       Math.abs(page - currentPage) <= 2;
              })
              .map((page, index, array) => {
                // Add ellipsis when pages are skipped
                const showEllipsisBefore = index > 0 && array[index - 1] !== page - 1;
                
                return (
                  <React.Fragment key={page}>
                    {showEllipsisBefore && (
                      <Button
                        variant="outline"
                        size="sm"
                        disabled
                        className="cursor-default"
                      >
                        ...
                      </Button>
                    )}
                    <Button
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(page)}
                    >
                      {page}
                    </Button>
                  </React.Fragment>
                );
              })}
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResultsTable;
