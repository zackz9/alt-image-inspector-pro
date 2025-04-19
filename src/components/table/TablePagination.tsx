
import React from 'react';
import { Button } from '@/components/ui/button';

interface TablePaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const TablePagination: React.FC<TablePaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-center mt-4">
      <div className="flex space-x-1">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Previous
        </Button>
        
        {Array.from({ length: totalPages }, (_, i) => i + 1)
          .filter(page => {
            return page === 1 || 
                   page === totalPages || 
                   Math.abs(page - currentPage) <= 2;
          })
          .map((page, index, array) => {
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
                  onClick={() => onPageChange(page)}
                >
                  {page}
                </Button>
              </React.Fragment>
            );
          })}
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export default TablePagination;
