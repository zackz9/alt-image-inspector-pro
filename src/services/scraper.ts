
import { PageResult, ImageResult, AltStatus, ProcessingStatus } from '@/types';
import { v4 as uuidv4 } from 'uuid';

// Mock function to simulate scraping
export const scrapeUrls = async (
  urls: string[], 
  onProgress?: (result: PageResult) => void
): Promise<PageResult[]> => {
  const results: PageResult[] = [];
  
  for (const url of urls) {
    // Create initial pending status
    const initialResult: PageResult = {
      url,
      status: 'pending',
      imagesCount: 0,
      missingAltCount: 0,
      emptyAltCount: 0,
      images: []
    };
    
    results.push(initialResult);
    onProgress?.(initialResult);
    
    try {
      // Mark as processing
      initialResult.status = 'processing';
      onProgress?.(initialResult);
      
      // Simulating network request
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Generate random mock data for the page
      const images = generateMockImageResults(url);
      const missingAltCount = images.filter(img => img.status === 'missing').length;
      const emptyAltCount = images.filter(img => img.status === 'empty').length;
      
      // Update with completed data
      initialResult.status = 'completed';
      initialResult.imagesCount = images.length;
      initialResult.missingAltCount = missingAltCount;
      initialResult.emptyAltCount = emptyAltCount;
      initialResult.images = images;
      
      onProgress?.(initialResult);
    } catch (error) {
      // Handle errors
      initialResult.status = 'failed';
      initialResult.error = error instanceof Error ? error.message : 'Unknown error';
      onProgress?.(initialResult);
    }
  }
  
  return results;
};

// Helper to generate mock image results for demo purposes
const generateMockImageResults = (url: string): ImageResult[] => {
  // Deterministic random number generator based on URL
  const getRandomInt = (max: number): number => {
    let hash = 0;
    for (let i = 0; i < url.length; i++) {
      hash = ((hash << 5) - hash) + url.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash % max);
  };
  
  // Generate between 1 and 20 images
  const count = getRandomInt(19) + 1;
  const results: ImageResult[] = [];
  
  for (let i = 0; i < count; i++) {
    const statusRand = getRandomInt(10);
    let status: AltStatus;
    let altText: string | null;
    
    // Distribute statuses: 60% present, 30% missing, 10% empty
    if (statusRand < 6) {
      status = 'present';
      altText = `Image description ${i + 1} for ${url.split('//')[1].split('/')[0]}`;
    } else if (statusRand < 9) {
      status = 'missing';
      altText = null;
    } else {
      status = 'empty';
      altText = '';
    }
    
    results.push({
      id: uuidv4(),
      pageUrl: url,
      imageSrc: `${url}${url.endsWith('/') ? '' : '/'}image-${i + 1}.jpg`,
      altText,
      status
    });
  }
  
  return results;
};

// Add fake delay between requests
export const addDelay = async (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};
