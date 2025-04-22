
import React from 'react';
import { ExternalLink } from 'lucide-react';
import { TableCell, TableRow } from '@/components/ui/table';
import StatusBadge from '../StatusBadge';
import { ImageResult } from '@/types';

interface ResultRowProps {
  image: ImageResult;
}

const ResultRow: React.FC<ResultRowProps> = ({ image }) => {
  // Extraire le domaine et le chemin pour un affichage plus propre
  const urlObject = new URL(image.pageUrl);
  const domain = urlObject.hostname;
  const path = urlObject.pathname;
  
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
            {domain}{path.substring(0, 30)}{path.length > 30 ? '...' : ''}
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
            {image.status === 'missing' ? 'Pas d\'attribut alt' : 'Attribut alt vide'}
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
