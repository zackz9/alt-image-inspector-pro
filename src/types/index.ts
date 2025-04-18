// URL processing status
export type ProcessingStatus = "pending" | "processing" | "completed" | "failed";

// Alt attribute status
export type AltStatus = "present" | "missing" | "empty";

// Image result from scraping
export interface ImageResult {
  id: string;
  pageUrl: string;
  pageId: number; // Changed from string to number
  imageSrc: string;
  altText: string | null;
  status: AltStatus;
}

// Page processing result
export interface PageResult {
  url: string;
  id: string; // Adding unique page ID
  status: ProcessingStatus;
  imagesCount: number;
  missingAltCount: number;
  emptyAltCount: number;
  images: ImageResult[];
  error?: string;
}

// Overall scanning stats
export interface ScanStats {
  totalUrls: number;
  processedUrls: number;
  failedUrls: number;
  totalImages: number;
  missingAltImages: number;
  emptyAltImages: number;
}
