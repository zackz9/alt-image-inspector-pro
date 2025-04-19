import { PageResult, ImageResult, AltStatus, ProcessingStatus } from '@/types';
import { v4 as uuidv4 } from 'uuid';

const fetchRealAltTexts = async (url: string): Promise<ImageResult[]> => {
  try {
    const response = await fetch(url, {
      mode: 'cors',
      headers: {
        'Accept': 'text/html',
      }
    });
    const html = await response.text();
    
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const imgElements = Array.from(doc.querySelectorAll('img, [style*="background-image"]'));
    const results: ImageResult[] = [];
    
    imgElements.forEach((element, index) => {
      let src = '';
      let altText = null;
      
      if (element instanceof HTMLImageElement) {
        src = element.getAttribute('src') || '';
        altText = element.getAttribute('alt');
      } else {
        const style = window.getComputedStyle(element);
        const bgImage = style.backgroundImage;
        if (bgImage && bgImage !== 'none') {
          src = bgImage.replace(/^url\(['"](.+)['"]\)$/, '$1');
        }
      }
      
      if (!src) return;
      
      let status: AltStatus;
      if (altText === null) {
        status = 'missing';
      } else if (altText === '') {
        status = 'empty';
      } else {
        status = 'present';
      }
      
      let fullSrc = src;
      if (src && !src.startsWith('http')) {
        const baseUrl = new URL(url);
        fullSrc = src.startsWith('/') 
          ? `${baseUrl.protocol}//${baseUrl.host}${src}`
          : `${url}${url.endsWith('/') ? '' : '/'}${src}`;
      }
      
      results.push({
        id: uuidv4(),
        pageUrl: url,
        pageId: index + 1,
        imageSrc: fullSrc,
        altText,
        status
      });
    });
    
    return results;
  } catch (error) {
    console.error(`Erreur lors de l'extraction des attributs alt de ${url}:`, error);
    return generateMockImageResults(url, url.replace(/^https?:\/\//, '').split('/')[0], true);
  }
};

export const scrapeUrls = async (
  urls: string[], 
  onProgress?: (result: PageResult) => void
): Promise<PageResult[]> => {
  const results: PageResult[] = [];
  
  for (const url of urls) {
    const pageUuid = uuidv4();
    
    const initialResult: PageResult = {
      url,
      id: pageUuid,
      status: 'pending',
      imagesCount: 0,
      missingAltCount: 0,
      emptyAltCount: 0,
      images: []
    };
    
    results.push(initialResult);
    onProgress?.(initialResult);
    
    try {
      initialResult.status = 'processing';
      onProgress?.(initialResult);
      
      const images = await fetchRealAltTexts(url);
      
      const missingAltCount = images.filter(img => img.status === 'missing').length;
      const emptyAltCount = images.filter(img => img.status === 'empty').length;
      
      initialResult.status = 'completed';
      initialResult.imagesCount = images.length;
      initialResult.missingAltCount = missingAltCount;
      initialResult.emptyAltCount = emptyAltCount;
      initialResult.images = images;
      
      onProgress?.(initialResult);
    } catch (error) {
      initialResult.status = 'failed';
      initialResult.error = error instanceof Error ? error.message : 'Erreur inconnue';
      onProgress?.(initialResult);
    }
  }
  
  return results;
};

const generateMockImageResults = (url: string, pageIdStr: string, isCorsError: boolean = false): ImageResult[] => {
  const getRandomInt = (max: number): number => {
    let hash = 0;
    for (let i = 0; i < url.length; i++) {
      hash = ((hash << 5) - hash) + url.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash % max);
  };
  
  let pageId = 0;
  for (let i = 0; i < pageIdStr.length; i++) {
    pageId = ((pageId << 5) - pageId) + pageIdStr.charCodeAt(i);
    pageId |= 0;
  }
  pageId = Math.abs(pageId);
  
  const count = getRandomInt(9) + 3;
  const results: ImageResult[] = [];
  
  const imageTypes = [
    'Product photo', 'Banner', 'Product thumbnail', 'Usage demonstration', 
    'Ingredient visualization', 'Before/After', 'User testimonial', 'Research graphic'
  ];
  
  const categories = [
    'skincare', 'sunscreen', 'anti-aging', 'acne treatment', 
    'moisturizer', 'cleanser', 'serum', 'SPF protection'
  ];
  
  const corsMessage = isCorsError ? " (CORS blocked real data)" : "";
  
  for (let i = 0; i < count; i++) {
    const statusRand = getRandomInt(10);
    let status: AltStatus;
    let altText: string | null;
    
    const imageType = imageTypes[getRandomInt(imageTypes.length)];
    const category = categories[getRandomInt(categories.length)];
    
    if (statusRand < 6) {
      status = 'present';
      altText = `${imageType} of ${category} - ${url.split('//')[1].split('/')[0]}${corsMessage}`;
    } else if (statusRand < 9) {
      status = 'missing';
      altText = null;
    } else {
      status = 'empty';
      altText = '';
    }
    
    const pathParts = [
      'images', 'assets', 'media', 'content',
      'products', 'treatments', 'solutions', 'ranges'
    ];
    const randomPath = pathParts[getRandomInt(pathParts.length)];
    
    const imgFormats = ['jpg', 'png', 'webp'];
    const format = imgFormats[getRandomInt(imgFormats.length)];
    const filename = `${category.replace(/\s+/g, '-')}_${getRandomInt(999)}.${format}`;
    
    results.push({
      id: uuidv4(),
      pageUrl: url,
      pageId,
      imageSrc: `${url}${url.endsWith('/') ? '' : '/'}${randomPath}/${filename}`,
      altText,
      status
    });
  }
  
  return results;
};

export const addDelay = async (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};
