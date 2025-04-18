
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Upload, FilePlus, Play } from 'lucide-react';
import { toast } from '@/components/ui/sonner';

interface UrlInputProps {
  onStartScan: (urls: string[]) => void;
  isProcessing: boolean;
}

const UrlInput: React.FC<UrlInputProps> = ({ onStartScan, isProcessing }) => {
  const [urls, setUrls] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setUrls(e.target.value);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.name.endsWith('.csv') && !file.name.endsWith('.txt')) {
      toast.error('Please upload a CSV or TXT file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === 'string') {
        setUrls(event.target.result);
        toast.success(`File "${file.name}" loaded successfully`);
      }
    };
    reader.onerror = () => {
      toast.error('Error reading file');
    };
    reader.readAsText(file);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleStartScan = () => {
    // Split by newline, comma, or semicolon and filter empty lines
    const urlList = urls
      .split(/[\n,;]/)
      .map(url => url.trim())
      .filter(url => {
        if (!url) return false;
        
        try {
          // Basic URL validation
          new URL(url.startsWith('http') ? url : `https://${url}`);
          return true;
        } catch {
          return false;
        }
      })
      .map(url => url.startsWith('http') ? url : `https://${url}`);

    if (urlList.length === 0) {
      toast.error('Please enter at least one valid URL');
      return;
    }

    onStartScan(urlList);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">URLs to Scan</h2>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleUploadClick}
            disabled={isProcessing}
          >
            <Upload className="mr-2 h-4 w-4" />
            Import URLs
          </Button>
          <input
            type="file"
            accept=".csv,.txt"
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileUpload}
          />
        </div>
      </div>
      
      <Textarea
        placeholder="Enter URLs to scan (one per line, or comma/semicolon separated)"
        className="min-h-[150px] font-mono text-sm"
        value={urls}
        onChange={handleTextareaChange}
        disabled={isProcessing}
      />
      
      <div className="flex justify-end">
        <Button 
          onClick={handleStartScan} 
          disabled={isProcessing || !urls.trim()}
        >
          {isProcessing ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </>
          ) : (
            <>
              <Play className="mr-2 h-4 w-4" />
              Start Scan
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default UrlInput;
