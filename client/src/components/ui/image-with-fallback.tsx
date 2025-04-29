import { useState, useEffect, ReactNode } from 'react';
import { ImageIcon } from 'lucide-react';

interface ImageWithFallbackProps {
  src: string | null | undefined;
  alt: string;
  className?: string;
  fallbackClassName?: string;
  width?: number | string;
  height?: number | string;
  fallbackContent?: ReactNode;
}

/**
 * A component that renders an image with a fallback when the image fails to load
 * or when the src is null or undefined.
 */
export function ImageWithFallback({
  src,
  alt,
  className = "",
  fallbackClassName = "flex items-center justify-center bg-gray-100 rounded-md",
  width,
  height,
  fallbackContent,
}: ImageWithFallbackProps) {
  const [error, setError] = useState<boolean>(false);
  const [imgSrc, setImgSrc] = useState<string | null | undefined>(src);

  // If src changes, reset error state and set new src
  useEffect(() => {
    // Check for empty src or invalid values immediately
    if (!src || src === 'null' || src === 'undefined' || (typeof src === 'string' && !src.trim())) {
      setError(true);
      return;
    }
    
    setError(false);
    setImgSrc(src);
  }, [src]);

  // Handle image load error with retries for network errors
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 2;
  
  const handleError = () => {
    // If we haven't exceeded retry limit and it might be a network error,
    // attempt to reload the image after a short delay
    if (retryCount < MAX_RETRIES) {
      setRetryCount(prev => prev + 1);
      
      // Log the retry attempt
      console.log(`Retrying image load for: ${imgSrc} (attempt ${retryCount + 1}/${MAX_RETRIES})`);
      
      // Force a refresh by temporarily clearing the source
      setImgSrc(null);
      
      // Set a timeout to try loading again
      setTimeout(() => {
        setImgSrc(src);
      }, 1000); // Wait 1 second between retries
      
      return;
    }
    
    // After max retries or for other errors, show fallback
    setError(true);
    
    // Log with source info to help debugging
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`Image load failed after ${retryCount} retries for: ${imgSrc}, using placeholder`);
    }
  };

  // Handle missing src or error loading image
  if (!imgSrc || error) {
    return (
      <div 
        className={`${fallbackClassName} ${className}`}
        style={{ width: width || "100%", height: height || "200px" }}
      >
        {fallbackContent || <ImageIcon className="h-10 w-10 text-gray-400" />}
      </div>
    );
  }

  // Ensure URLs are absolute and properly formatted
  // This handles common edge cases that can cause image loading errors
  const getProperImageUrl = (src: string): string => {
    try {
      // Check for empty string or only whitespace - this can cause console errors
      if (!src || !src.trim()) {
        throw new Error('Empty or whitespace-only image URL');
      }
      
      // Handle null/undefined values that might slip through type checking
      if (src === 'null' || src === 'undefined') {
        throw new Error(`Invalid image URL: "${src}"`);
      }
      
      // Already absolute URL (http/https)
      if (src.startsWith('http://') || src.startsWith('https://')) {
        // Validate it's a proper URL format
        try {
          const url = new URL(src);
          // Additional validation of hostname
          if (!url.hostname || url.hostname.length < 3) {
            throw new Error(`Invalid URL hostname: ${url.hostname}`);
          }
          return src;
        } catch (e) {
          throw new Error(`Invalid URL format: ${src}`);
        }
      }
      
      // Handle protocol-relative URLs (//example.com/image.jpg)
      if (src.startsWith('//')) {
        try {
          // Add a protocol for validation
          const url = new URL(`https:${src}`);
          if (!url.hostname || url.hostname.length < 3) {
            throw new Error(`Invalid protocol-relative URL: ${src}`);
          }
          return `https:${src}`;
        } catch (e) {
          throw new Error(`Invalid protocol-relative URL: ${src}`);
        }
      }
      
      // Already starts with slash (relative to root)
      if (src.startsWith('/')) {
        // Remove any duplicate slashes
        return '/' + src.replace(/^\/+/, '');
      }
      
      // Handle and validate data URLs
      if (src.startsWith('data:')) {
        // Check if it's a valid image data URL
        if (!src.startsWith('data:image/')) {
          throw new Error('Invalid data URL format (must be an image)');
        }
        
        // Fix data URLs if they're missing the proper format
        if (!src.includes(';base64,')) {
          // Attempt to fix common data URL format issues
          if (src.includes(',')) {
            // Has comma but missing base64 declaration
            const parts = src.split(',');
            return `data:image/jpeg;base64,${parts[1]}`;
          }
          return `data:image/jpeg;base64,${src.replace('data:image/', '')}`;
        }
        return src;
      }
      
      // Other cases - assume relative path and normalize
      return src.startsWith('./') ? src.substring(2) : `/${src}`;
      
    } catch (error) {
      // If we catch any errors, log them and trigger the fallback
      if (process.env.NODE_ENV !== 'production') {
        console.warn(`ImageWithFallback - URL processing error for "${src}":`, error);
      }
      setError(true);
      return ''; // Return empty string that will trigger fallback
    }
  };
  
  // Only process the URL if we're not already in an error state
  const fullSrc = !error ? getProperImageUrl(imgSrc) : '';

  // Handler for successful image loading
  const handleLoad = () => {
    // Reset retry count on successful load 
    if (retryCount > 0) {
      setRetryCount(0);
      console.log(`Image loaded successfully after ${retryCount} retries: ${imgSrc}`);
    }
  };

  return (
    <img
      src={fullSrc}
      alt={alt}
      className={className}
      onError={handleError}
      onLoad={handleLoad}
      width={width}
      height={height}
      loading="lazy" // Add lazy loading for performance
    />
  );
}