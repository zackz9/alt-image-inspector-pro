
import React from 'react';
import { ExternalLink } from 'lucide-react';
import { TableCell, TableRow } from '@/components/ui/table';
import StatusBadge from '../StatusBadge';
import { ImageResult } from '@/types';

interface ResultRowProps {
  image: ImageResult;
}

const ResultRow: React.FC<ResultRowProps> = ({ image }) => {
  return (
    <TableRow>
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
  );
};

export default ResultRow;
