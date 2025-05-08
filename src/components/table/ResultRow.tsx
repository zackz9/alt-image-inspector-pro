
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
  let urlObject;
  try {
    urlObject = new URL(image.pageUrl);
  } catch (e) {
    console.warn(`URL invalide: ${image.pageUrl}`, e);
    urlObject = { hostname: 'url-invalide', pathname: '' };
  }
  
  const domain = urlObject.hostname;
  const path = urlObject.pathname || '';
  
  // Fonction pour tronquer proprement les URLs longues
  const truncateText = (text: string, maxLength: number) => {
    if (!text) return '';
    return text.length > maxLength 
      ? `${text.substring(0, maxLength)}...` 
      : text;
  };
  
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
            {domain}{truncateText(path, 30)}
            <ExternalLink className="ml-1 h-3 w-3" />
          </a>
        </div>
        <div className="mt-1 text-muted-foreground break-all">
          {truncateText(image.imageSrc, 50)}
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
