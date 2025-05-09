
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import UrlInput from '@/components/UrlInput';
import ResultsTable from '@/components/ResultsTable';
import { PageResult, ScanStats, AltStatus } from '@/types';
import { scrapeUrls } from '@/services/scraper';
import { exportToCsv } from '@/utils/csvUtils';
import { toast } from '@/components/ui/sonner';
import { Image, ImageOff, AlertCircle as AlertCircleIcon, CheckCircle } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

const Index = () => {
  const [results, setResults] = useState<PageResult[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [stats, setStats] = useState<ScanStats>({
    totalUrls: 0,
    processedUrls: 0,
    failedUrls: 0,
    totalImages: 0,
    missingAltImages: 0,
    emptyAltImages: 0,
  });
  
  // Calculer les statistiques lorsque les résultats changent
  useEffect(() => {
    if (results.length === 0) return;
    
    const processedUrls = results.filter(r => r.status === 'completed' || r.status === 'failed').length;
    const failedUrls = results.filter(r => r.status === 'failed').length;
    const totalImages = results.reduce((sum, page) => sum + page.imagesCount, 0);
    const missingAltImages = results.reduce((sum, page) => sum + page.missingAltCount, 0);
    const emptyAltImages = results.reduce((sum, page) => sum + page.emptyAltCount, 0);
    
    setStats({
      totalUrls: results.length,
      processedUrls,
      failedUrls,
      totalImages,
      missingAltImages,
      emptyAltImages,
    });
  }, [results]);
  
  // Utiliser useCallback pour éviter de recréer la fonction à chaque rendu
  const handleProgress = useCallback((updatedResult: PageResult) => {
    setResults(prevResults => {
      const newResults = [...prevResults];
      const index = newResults.findIndex(r => r.id === updatedResult.id);
      if (index !== -1) {
        newResults[index] = updatedResult;
      }
      return newResults;
    });
  }, []);
  
  const handleStartScan = async (urls: string[]) => {
    if (urls.length === 0) return;
    
    // Limiter à 50 URLs maximum pour éviter de surcharger l'application
    if (urls.length > 100) {
      toast.warning(`Pour des raisons de performance, le scan est limité à 100 URLs. Seules les 100 premières seront analysées.`);
      urls = urls.slice(0, 100);
    }
    
    setIsProcessing(true);
    setResults([]);
    
    try {
      // Initialiser les résultats
      const initialResults = urls.map((url) => ({
        url,
        id: uuidv4(),
        status: 'pending' as const,
        imagesCount: 0,
        missingAltCount: 0,
        emptyAltCount: 0,
        images: [],
      }));
      
      setResults(initialResults);
      
      // Lancer l'analyse
      await scrapeUrls(urls, handleProgress);
      
      // Scan terminé
      toast.success(`Scan terminé: ${urls.length} URLs analysées`);
    } catch (error) {
      console.error('Error during scan:', error);
      toast.error(`Une erreur est survenue pendant l'analyse: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleExport = (status: AltStatus | 'all' = 'all') => {
    const allImages = results
      .filter(r => r.status === 'completed')
      .flatMap(r => r.images);
    
    if (allImages.length === 0) {
      toast.error('Aucun résultat à exporter');
      return;
    }
    
    try {
      exportToCsv(allImages, status);
      toast.success('Export réussi');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Erreur lors de l\'export des résultats');
    }
  };
  
  const progress = stats.totalUrls === 0 ? 0 : (stats.processedUrls / stats.totalUrls) * 100;
  
  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">Alt Image Inspector Pro</h1>
        <p className="text-muted-foreground">
          Audit des attributs alt d'images sur plusieurs pages web
        </p>
      </header>
      
      <div className="grid gap-8">
        <Card>
          <CardHeader>
            <CardTitle>URLs à analyser</CardTitle>
            <CardDescription>
              Entrez les URLs à analyser, une par ligne ou téléchargez un fichier CSV/TXT
            </CardDescription>
          </CardHeader>
          <CardContent>
            <UrlInput onStartScan={handleStartScan} isProcessing={isProcessing} />
          </CardContent>
        </Card>
        
        <Alert variant="destructive" className="bg-yellow-50 border-yellow-200">
          <AlertCircle className="h-4 w-4 text-yellow-600" />
          <AlertTitle className="text-yellow-800">Limitations CORS</AlertTitle>
          <AlertDescription className="text-yellow-700">
            En raison des restrictions CORS des navigateurs, l'extraction directe des attributs alt peut échouer pour certains domaines. Dans ce cas, des données fictives avec la mention "(CORS blocked real data)" seront générées pour démonstration.
          </AlertDescription>
        </Alert>
        
        {results.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Progression de l'analyse</CardTitle>
              <CardDescription>
                {isProcessing
                  ? `Traitement ${stats.processedUrls} sur ${stats.totalUrls} URLs...`
                  : `Analyse terminée: ${stats.processedUrls} URLs traitées`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <Progress 
                  value={progress} 
                  className="h-2" 
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-secondary/50 rounded-lg p-4 flex items-center">
                  <Image className="h-8 w-8 mr-3 text-blue-500" />
                  <div>
                    <div className="text-sm text-muted-foreground">Total Images</div>
                    <div className="text-2xl font-semibold">{stats.totalImages}</div>
                  </div>
                </div>
                
                <div className="bg-secondary/50 rounded-lg p-4 flex items-center">
                  <ImageOff className="h-8 w-8 mr-3 text-red-500" />
                  <div>
                    <div className="text-sm text-muted-foreground">Alt manquant</div>
                    <div className="text-2xl font-semibold">{stats.missingAltImages}</div>
                  </div>
                </div>
                
                <div className="bg-secondary/50 rounded-lg p-4 flex items-center">
                  <AlertCircleIcon className="h-8 w-8 mr-3 text-yellow-500" />
                  <div>
                    <div className="text-sm text-muted-foreground">Alt vide</div>
                    <div className="text-2xl font-semibold">{stats.emptyAltImages}</div>
                  </div>
                </div>
                
                <div className="bg-secondary/50 rounded-lg p-4 flex items-center">
                  <CheckCircle className="h-8 w-8 mr-3 text-green-500" />
                  <div>
                    <div className="text-sm text-muted-foreground">Alt valide</div>
                    <div className="text-2xl font-semibold">
                      {stats.totalImages - stats.missingAltImages - stats.emptyAltImages}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        
        {results.length > 0 && (
          <Card>
            <CardContent className="pt-6">
              <ResultsTable results={results} onExport={handleExport} />
            </CardContent>
          </Card>
        )}
      </div>
      
      <footer className="mt-12 text-center text-sm text-muted-foreground">
        <p>Alt Image Inspector Pro - Un outil d'accessibilité web</p>
      </footer>
    </div>
  );
};

export default Index;
