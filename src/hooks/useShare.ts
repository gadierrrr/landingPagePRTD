import { useState, useCallback } from 'react';
import { Beach } from '../lib/forms';
import { 
  isWebShareSupported, 
  generateWebShareData, 
  generateBeachShareMessage,
  copyToClipboard,
  appendUTMParams,
  generateBeachUTMParams
} from '../lib/share';

export interface UseShareOptions {
  onShareOpen?: (beach: Beach, support: 'webshare' | 'modal') => void;
  onShareSuccess?: (beach: Beach, platform?: string) => void;
  onShareError?: (beach: Beach, error: string) => void;
  onPlatformClick?: (beach: Beach, platform: string) => void;
  onCopyLink?: (beach: Beach) => void;
}

export interface UseShareReturn {
  isModalOpen: boolean;
  isSharing: boolean;
  shareBeach: (beach: Beach, beachUrl: string) => Promise<void>;
  openModal: (beach: Beach, beachUrl: string) => void;
  closeModal: () => void;
  handlePlatformClick: (platform: string) => void;
  handleCopyClick: () => Promise<void>;
  currentBeach: Beach | null;
  currentBeachUrl: string;
}

export function useShare(options: UseShareOptions = {}): UseShareReturn {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [currentBeach, setCurrentBeach] = useState<Beach | null>(null);
  const [currentBeachUrl, setCurrentBeachUrl] = useState('');

  const {
    onShareOpen,
    onShareSuccess,
    onShareError,
    onPlatformClick,
    onCopyLink
  } = options;

  // Main share function - tries Web Share API first, falls back to modal
  const shareBeach = useCallback(async (beach: Beach, beachUrl: string) => {
    if (!beach.slug) {
      onShareError?.(beach, 'Beach slug is missing');
      return;
    }

    setIsSharing(true);

    try {
      const message = generateBeachShareMessage(beach);
      
      if (isWebShareSupported()) {
        // Try Web Share API
        onShareOpen?.(beach, 'webshare');
        
        try {
          const webShareData = generateWebShareData(beach, beachUrl, message);
          await navigator.share(webShareData);
          onShareSuccess?.(beach, 'webshare');
        } catch (webShareError: unknown) {
          // User cancelled or Web Share failed, fall back to modal
          const errorMessage = webShareError instanceof Error ? webShareError.message : 'Web Share cancelled';
          
          if (errorMessage.includes('AbortError') || errorMessage.includes('cancelled')) {
            // User cancelled - this is normal, don't show as error
            return;
          }
          
          // Web Share failed for other reasons, fall back to modal
          console.warn('Web Share failed, falling back to modal:', errorMessage);
          openModal(beach, beachUrl);
        }
      } else {
        // No Web Share support, use modal
        openModal(beach, beachUrl);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown share error';
      onShareError?.(beach, errorMessage);
    } finally {
      setIsSharing(false);
    }
  }, [onShareOpen, onShareSuccess, onShareError]); // eslint-disable-line react-hooks/exhaustive-deps

  // Open share modal
  const openModal = useCallback((beach: Beach, beachUrl: string) => {
    setCurrentBeach(beach);
    setCurrentBeachUrl(beachUrl);
    setIsModalOpen(true);
    onShareOpen?.(beach, 'modal');
  }, [onShareOpen]);

  // Close share modal
  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setCurrentBeach(null);
    setCurrentBeachUrl('');
  }, []);

  // Handle platform-specific sharing
  const handlePlatformClick = useCallback((platform: string) => {
    if (currentBeach) {
      onPlatformClick?.(currentBeach, platform);
    }
  }, [currentBeach, onPlatformClick]);

  // Handle copy link functionality
  const handleCopyClick = useCallback(async () => {
    if (!currentBeach || !currentBeachUrl) return;

    try {
      // Add UTM parameters for copy link
      const urlWithUTM = appendUTMParams(
        currentBeachUrl, 
        generateBeachUTMParams('copy', currentBeach.slug!)
      );
      
      const success = await copyToClipboard(urlWithUTM);
      
      if (success) {
        onCopyLink?.(currentBeach);
      } else {
        onShareError?.(currentBeach, 'Failed to copy link to clipboard');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Clipboard error';
      onShareError?.(currentBeach, errorMessage);
    }
  }, [currentBeach, currentBeachUrl, onCopyLink, onShareError]);

  return {
    isModalOpen,
    isSharing,
    shareBeach,
    openModal,
    closeModal,
    handlePlatformClick,
    handleCopyClick,
    currentBeach,
    currentBeachUrl
  };
}