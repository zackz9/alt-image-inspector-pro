import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import UrlInput from '@/components/UrlInput';
import ResultsTable from '@/components/ResultsTable';
import { PageResult, ScanStats, ImageResult } from '@/types';
import { scrapeUrls, addDelay } from '@/services/scraper';
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
  
  const handleStartScan = async (urls: string[]) => {
    if (urls.length === 0) return;
    
    setIsProcessing(true);
    setResults([]);
    
    try {
      const initialResults = urls.map((url, index) => ({
        url,
        id: uuidv4(),
        status: 'pending' as const,
        imagesCount: 0,
        missingAltCount: 0,
        emptyAltCount: 0,
        images: [],
        pageId: index + 1,
      }));
      
      setResults(initialResults);
      
      const onProgress = (updatedResult: PageResult) => {
        setResults(prevResults => {
          const newResults = [...prevResults];
          const index = newResults.findIndex(r => r.url === updatedResult.url);
          if (index !== -1) {
            newResults[index] = updatedResult;
          }
          return newResults;
        });
      };
      
      for (let i = 0; i < urls.length; i++) {
        const url = urls[i];
        try {
          await scrapeUrls([url], onProgress);
          
          if (i < urls.length - 1) {
            await addDelay(1500);
          }
        } catch (error) {
          console.error(`Error processing ${url}:`, error);
          onProgress({
            url,
            id: uuidv4(),
            status: 'failed',
            imagesCount: 0,
            missingAltCount: 0,
            emptyAltCount: 0,
            images: [],
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      }
      
      // Trigger automatic CSV download for images without alt text
      const allImages = results
        .filter(r => r.status === 'completed')
        .flatMap(r => r.images)
        .filter(img => img.status === 'missing');

      if (allImages.length > 0) {
        exportToCsv(allImages, 'missing');
      }
      
      toast.success(`Scan completed: ${urls.length} URLs processed`);
    } catch (error) {
      console.error('Error during scan:', error);
      toast.error('An error occurred during the scan');
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleExport = (status: AltStatus | 'all' = 'all') => {
    const allImages = results
      .filter(r => r.status === 'completed')
      .flatMap(r => r.images);
    
    if (allImages.length === 0) {
      toast.error('No results to export');
      return;
    }
    
    try {
      exportToCsv(allImages, status);
      toast.success('Export completed successfully');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export results');
    }
  };
  
  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">Alt Image Inspector Pro</h1>
        <p className="text-muted-foreground">
          Audit HTML image alt attributes across multiple web pages
        </p>
      </header>
      
      <div className="grid gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Input URLs</CardTitle>
            <CardDescription>
              Enter URLs to scan, one per line or upload a CSV/TXT file
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
              <CardTitle>Scan Progress</CardTitle>
              <CardDescription>
                {isProcessing
                  ? `Processing ${stats.processedUrls} of ${stats.totalUrls} URLs...`
                  : `Scan complete: ${stats.processedUrls} URLs processed`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <Progress 
                  value={(stats.processedUrls / stats.totalUrls) * 100} 
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
                    <div className="text-sm text-muted-foreground">Missing Alt</div>
                    <div className="text-2xl font-semibold">{stats.missingAltImages}</div>
                  </div>
                </div>
                
                <div className="bg-secondary/50 rounded-lg p-4 flex items-center">
                  <AlertCircleIcon className="h-8 w-8 mr-3 text-yellow-500" />
                  <div>
                    <div className="text-sm text-muted-foreground">Empty Alt</div>
                    <div className="text-2xl font-semibold">{stats.emptyAltImages}</div>
                  </div>
                </div>
                
                <div className="bg-secondary/50 rounded-lg p-4 flex items-center">
                  <CheckCircle className="h-8 w-8 mr-3 text-green-500" />
                  <div>
                    <div className="text-sm text-muted-foreground">Valid Alt</div>
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
        <p>Alt Image Inspector Pro - A web accessibility tool</p>
      </footer>
    </div>
  );
};

export default Index;
