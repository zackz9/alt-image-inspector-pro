
import React, { useState, useEffect, useMemo } from 'react';
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
  const [statusFilter, setStatusFilter] = useState<AltStatus | 'all'>('missing');
  const itemsPerPage = 10;
  const [selectedStatus, setSelectedStatus] = useState<AltStatus | 'all'>('missing');

  // Réinitialiser la pagination quand les filtres changent
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  // Calculer les résultats une seule fois avec useMemo pour optimiser les performances
  const processedResults = useMemo(() => {
    if (results.length === 0) return { filteredResults: [], paginatedResults: [] };

    // Récupérer uniquement les résultats des pages complétées
    const completedResults = results.filter(result => result.status === 'completed');
    
    // Aplatir tous les résultats d'images pour l'affichage
    const allImageResults = completedResults.flatMap(result => 
      result.images.map(img => ({ ...img }))
    );

    // Éliminer les doublons basés sur URL de page et URL d'image (optimisé)
    const seenItems = new Set<string>();
    const uniqueResults = allImageResults.filter(img => {
      const key = `${img.pageUrl}|${img.imageSrc}`;
      if (seenItems.has(key)) return false;
      seenItems.add(key);
      return true;
    });

    // Filtrer pour ne montrer que les images avec problèmes d'alt par défaut
    const relevantResults = uniqueResults.filter(img => 
      statusFilter === 'all' || img.status === statusFilter
    );

    // Appliquer la recherche
    const filteredResults = relevantResults.filter(img => {
      if (!searchTerm) return true;
      
      const searchLower = searchTerm.toLowerCase();
      return (
        img.pageUrl.toLowerCase().includes(searchLower) || 
        img.imageSrc.toLowerCase().includes(searchLower) || 
        (img.altText && img.altText.toLowerCase().includes(searchLower))
      );
    });

    // Pagination
    const totalPages = Math.ceil(filteredResults.length / itemsPerPage);
    const safePage = Math.min(currentPage, Math.max(1, totalPages));
    
    // Si la page actuelle est invalide, on ajuste
    if (safePage !== currentPage && filteredResults.length > 0) {
      setCurrentPage(safePage);
    }
    
    const paginatedResults = filteredResults.slice(
      (safePage - 1) * itemsPerPage,
      safePage * itemsPerPage
    );

    return { 
      filteredResults, 
      paginatedResults,
      totalResults: filteredResults.length,
      totalPages
    };
  }, [results, searchTerm, statusFilter, currentPage, itemsPerPage]);

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

  const totalItems = processedResults.totalResults || 0;
  const totalPages = processedResults.totalPages || 0;
  const paginatedResults = processedResults.paginatedResults || [];

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

      {totalItems > 0 && (
        <div className="flex justify-between items-center text-sm text-muted-foreground">
          <div>
            Total: {totalItems} résultat{totalItems > 1 ? 's' : ''}
          </div>
          <TablePagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </div>
  );
};

export default ResultsTable;
