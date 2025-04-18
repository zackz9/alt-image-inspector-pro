
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { AltStatus, ProcessingStatus } from '@/types';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: AltStatus | ProcessingStatus;
  className?: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className }) => {
  const getVariant = (): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'present':
        return 'default'; // green
      case 'missing':
        return 'destructive'; // red
      case 'empty':
        return 'secondary'; // gray
      case 'pending':
        return 'outline';
      case 'processing':
        return 'secondary';
      case 'completed':
        return 'default';
      case 'failed':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getLabel = (): string => {
    switch (status) {
      case 'present':
        return 'Present';
      case 'missing':
        return 'Missing';
      case 'empty':
        return 'Empty';
      case 'pending':
        return 'Pending';
      case 'processing':
        return 'Processing';
      case 'completed':
        return 'Completed';
      case 'failed':
        return 'Failed';
      default:
        return status;
    }
  };

  return (
    <Badge 
      variant={getVariant()} 
      className={cn("capitalize", className)}
    >
      {getLabel()}
    </Badge>
  );
};

export default StatusBadge;
