
import React, { useState, useEffect } from 'react';
import { PageResult, ImageResult, AltStatus } from '@/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import SearchFilter from './table/SearchFilter';
import ResultRow from './table/ResultRow';
import TablePagination from './table/TablePagination';

interface ResultsTableProps {
  results: PageResult[];
  onExport: (status: AltStatus | 'all') => void;
}

const ResultsTable: React.FC<ResultsTableProps> = ({ results, onExport }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<AltStatus | 'all'>('all');
  const itemsPerPage = 10;
  const [selectedStatus, setSelectedStatus] = useState<AltStatus | 'all'>('all');

  // Initialiser le filtre pour n'afficher que les images sans alt ou avec alt vide
  useEffect(() => {
    setStatusFilter('missing');
    setSelectedStatus('missing');
  }, []);

  // Aplatir tous les résultats d'images pour l'affichage
  const allImageResults = results.flatMap(result => 
    result.images.map(img => ({ ...img, pageStatus: result.status }))
  );

  // Éliminer les doublons basés sur URL de page et URL d'image
  const uniqueResults = allImageResults.filter((img, index, self) => 
    index === self.findIndex(t => (
      t.pageUrl === img.pageUrl && t.imageSrc === img.imageSrc
    ))
  );

  // Appliquer la recherche et les filtres
  const filteredResults = uniqueResults.filter(img => {
    const matchesSearch = 
      img.pageUrl.toLowerCase().includes(searchTerm.toLowerCase()) || 
      img.imageSrc.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (img.altText && img.altText.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatusFilter = statusFilter === 'all' || img.status === statusFilter;
    
    // Filtrer pour ne montrer que les images sans alt ou alt vide
    const isRelevant = img.status === 'missing' || img.status === 'empty';
    
    return matchesSearch && matchesStatusFilter && (statusFilter !== 'all' || isRelevant);
  });

  // Pagination
  const totalPages = Math.ceil(filteredResults.length / itemsPerPage);
  const paginatedResults = filteredResults.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (results.length === 0) {
    return null;
  }

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleStatusChange = (value: AltStatus | 'all') => {
    setSelectedStatus(value);
    setStatusFilter(value);
    setCurrentPage(1);
    onExport(value);
  };

  return (
    <div className="space-y-4">
      <SearchFilter
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        selectedStatus={selectedStatus}
        onStatusChange={handleStatusChange}
      />

      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40%]">URL de page / Image</TableHead>
              <TableHead className="w-[40%]">Texte Alt</TableHead>
              <TableHead className="w-[20%]">Statut</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedResults.length > 0 ? (
              paginatedResults.map((image) => (
                <ResultRow key={image.id} image={image} />
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-6 text-muted-foreground">
                  Aucun résultat ne correspond à votre recherche
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <TablePagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
};

export default ResultsTable;
