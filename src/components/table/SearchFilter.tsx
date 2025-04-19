
import React from 'react';
import { AltStatus } from '@/types';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from 'lucide-react';

interface SearchFilterProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedStatus: AltStatus | 'all';
  onStatusChange: (value: AltStatus | 'all') => void;
}

const SearchFilter: React.FC<SearchFilterProps> = ({
  searchTerm,
  onSearchChange,
  selectedStatus,
  onStatusChange
}) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <h2 className="text-lg font-semibold">Scan Results</h2>
      
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search results..."
            className="pl-8 w-full sm:w-[250px]"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        
        <Select value={selectedStatus} onValueChange={onStatusChange}>
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
  );
};

export default SearchFilter;
