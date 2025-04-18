
import { PageResult, ImageResult, AltStatus, ProcessingStatus } from '@/types';
import { v4 as uuidv4 } from 'uuid';

// Fonction pour extraire les véritables attributs alt des images d'une page web
const fetchRealAltTexts = async (url: string): Promise<ImageResult[]> => {
  try {
    // Utiliser fetch pour récupérer le contenu HTML de la page
    const response = await fetch(url);
    const html = await response.text();
    
    // Créer un parser HTML temporaire
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    // Sélectionner toutes les images de la page
    const imgElements = doc.querySelectorAll('img');
    const results: ImageResult[] = [];
    
    // Traiter chaque image pour extraire son attribut alt
    imgElements.forEach((img, index) => {
      const src = img.getAttribute('src') || '';
      let altText = img.getAttribute('alt');
      let status: AltStatus;
      
      // Déterminer le statut de l'attribut alt
      if (altText === null) {
        status = 'missing';
      } else if (altText === '') {
        status = 'empty';
      } else {
        status = 'present';
      }
      
      // Construire l'URL complète de l'image si elle est relative
      let fullSrc = src;
      if (src && !src.startsWith('http')) {
        const baseUrl = new URL(url);
        fullSrc = src.startsWith('/') 
          ? `${baseUrl.protocol}//${baseUrl.host}${src}`
          : `${url}${url.endsWith('/') ? '' : '/'}${src}`;
      }
      
      // Ajouter l'image au résultat
      results.push({
        id: uuidv4(),
        pageUrl: url,
        pageId: url.split('//')[1].split('/')[0], // Extraire le domaine comme ID de page
        imageSrc: fullSrc,
        altText,
        status
      });
    });
    
    return results;
  } catch (error) {
    console.error(`Erreur lors de l'extraction des attributs alt de ${url}:`, error);
    return []; // Retourner un tableau vide en cas d'erreur
  }
};

// Fonction de scraping principale
export const scrapeUrls = async (
  urls: string[], 
  onProgress?: (result: PageResult) => void
): Promise<PageResult[]> => {
  const results: PageResult[] = [];
  
  for (const url of urls) {
    const pageUuid = uuidv4(); // ID unique pour la page
    
    // Créer un résultat initial avec statut en attente
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
      // Marquer comme en cours de traitement
      initialResult.status = 'processing';
      onProgress?.(initialResult);
      
      // Récupérer les véritables attributs alt des images
      const images = await fetchRealAltTexts(url);
      
      // Calculer les statistiques
      const missingAltCount = images.filter(img => img.status === 'missing').length;
      const emptyAltCount = images.filter(img => img.status === 'empty').length;
      
      // Mettre à jour avec les données complètes
      initialResult.status = 'completed';
      initialResult.imagesCount = images.length;
      initialResult.missingAltCount = missingAltCount;
      initialResult.emptyAltCount = emptyAltCount;
      initialResult.images = images;
      
      onProgress?.(initialResult);
    } catch (error) {
      // Gérer les erreurs
      initialResult.status = 'failed';
      initialResult.error = error instanceof Error ? error.message : 'Erreur inconnue';
      onProgress?.(initialResult);
    }
  }
  
  return results;
};

// Fonction pour simuler le scraping (conservée pour la démonstration)
export const mockScrapeUrls = async (
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
      
      // Simuler une requête réseau
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Générer des données mock aléatoires pour la page
      const images = generateMockImageResults(url, pageUuid);
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

// Fonction pour générer des données mock plus réalistes pour la démonstration
const generateMockImageResults = (url: string, pageId: string): ImageResult[] => {
  // Générateur de nombres aléatoires déterministe basé sur l'URL
  const getRandomInt = (max: number): number => {
    let hash = 0;
    for (let i = 0; i < url.length; i++) {
      hash = ((hash << 5) - hash) + url.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash % max);
  };
  
  // Générer entre 1 et 20 images
  const count = getRandomInt(19) + 1;
  const results: ImageResult[] = [];
  
  // Catégories de types d'images pour des textes alt plus réalistes
  const imageTypes = [
    'Product photo', 'Banner', 'Hero image', 'Icon', 'Logo', 
    'Infographic', 'Gallery photo', 'Profile picture', 'Background image'
  ];
  
  // Catégories de produits ou de contenu
  const categories = [
    'skincare', 'cosmetics', 'treatment', 'moisturizer', 
    'serum', 'sunscreen', 'cleanser', 'toner'
  ];
  
  for (let i = 0; i < count; i++) {
    const statusRand = getRandomInt(10);
    let status: AltStatus;
    let altText: string | null;
    
    // Sélectionner aléatoirement un type d'image et une catégorie
    const imageType = imageTypes[getRandomInt(imageTypes.length)];
    const category = categories[getRandomInt(categories.length)];
    
    // Distribuer les statuts: 60% présent, 30% manquant, 10% vide
    if (statusRand < 6) {
      status = 'present';
      // Texte alt plus réaliste avec variation
      altText = `${imageType} of ${category} ${getRandomInt(100) + 1} for ${url.split('//')[1].split('/')[0]}`;
    } else if (statusRand < 9) {
      status = 'missing';
      altText = null;
    } else {
      status = 'empty';
      altText = '';
    }
    
    // Créer des parties de chemin d'accès pour des sources d'images plus réalistes
    const pathParts = [
      'images', 'assets', 'media', 'uploads', 'content',
      category, 'products', 'banners', 'gallery'
    ];
    const randomPath = pathParts[getRandomInt(pathParts.length)];
    
    // Créer un nom de fichier d'image plus réaliste
    const filename = `${category}-${getRandomInt(999)}-${i + 1}.jpg`;
    
    results.push({
      id: uuidv4(),
      pageUrl: url,
      pageId, // Utiliser l'UUID de la page comme pageId
      imageSrc: `${url}${url.endsWith('/') ? '' : '/'}${randomPath}/${filename}`,
      altText,
      status
    });
  }
  
  return results;
};

// Ajouter un délai fictif entre les requêtes
export const addDelay = async (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};
