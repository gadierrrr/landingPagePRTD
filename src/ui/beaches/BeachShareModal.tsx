import React, { useEffect, useState } from 'react';
import { Beach } from '../../lib/forms';
import { generatePlatformShareUrls, generateBeachShareMessage, isMobileDevice } from '../../lib/share';

interface BeachShareModalProps {
  beach: Beach | null;
  isOpen: boolean;
  onClose: () => void;
  beachUrl: string;
  onPlatformClick: (platform: string) => void;
  onCopyClick: () => void;
}

export const BeachShareModal: React.FC<BeachShareModalProps> = ({
  beach,
  isOpen,
  onClose,
  beachUrl,
  onPlatformClick,
  onCopyClick
}) => {
  const [copied, setCopied] = useState(false);

  // Handle escape key and focus management
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden'; // Prevent background scroll
      
      // Focus the modal
      const modal = document.getElementById('beach-share-modal');
      if (modal) {
        modal.focus();
      }
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !beach) {
    return null;
  }

  const message = generateBeachShareMessage(beach);
  const platformUrls = generatePlatformShareUrls(beach, beachUrl, message);
  const isMobile = isMobileDevice();

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handlePlatformClick = (platform: string, url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
    onPlatformClick(platform);
  };

  const handleCopyClick = async () => {
    setCopied(true);
    onCopyClick();
    
    // Reset copied state after 2 seconds
    setTimeout(() => setCopied(false), 2000);
  };

  // Platform configurations
  const platforms = [
    {
      id: 'whatsapp',
      name: 'WhatsApp',
      icon: '💬',
      color: 'bg-green-500 hover:bg-green-600',
      url: platformUrls.whatsapp,
      show: true // WhatsApp works on both desktop and mobile
    },
    {
      id: 'facebook',
      name: 'Facebook',
      icon: '📘',
      color: 'bg-blue-600 hover:bg-blue-700',
      url: platformUrls.facebook,
      show: true
    },
    {
      id: 'twitter',
      name: 'X (Twitter)',
      icon: '🐦',
      color: 'bg-black hover:bg-gray-800',
      url: platformUrls.twitter,
      show: true
    },
    {
      id: 'email',
      name: 'Email',
      icon: '📧',
      color: 'bg-gray-600 hover:bg-gray-700',
      url: platformUrls.email,
      show: true
    },
    {
      id: 'sms',
      name: 'SMS',
      icon: '📱',
      color: 'bg-purple-500 hover:bg-purple-600',
      url: platformUrls.sms,
      show: isMobile // Only show SMS on mobile devices
    }
  ].filter(platform => platform.show);

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="share-modal-title"
    >
      <div 
        id="beach-share-modal"
        className="w-full max-w-md rounded-xl bg-white shadow-xl"
        tabIndex={-1}
      >
        {/* Header */}
        <div className="border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <h2 id="share-modal-title" className="text-lg font-semibold text-brand-navy">
              Share {beach.name}
            </h2>
            <button
              onClick={onClose}
              className="text-brand-navy/60 flex size-8 items-center justify-center rounded-full transition-colors hover:bg-brand-sand"
              aria-label="Close share modal"
            >
              ×
            </button>
          </div>
          <p className="text-brand-navy/60 mt-1 text-sm">
            {beach.municipality}, Puerto Rico
          </p>
        </div>

        {/* Share message preview */}
        <div className="border-b border-gray-200 p-4">
          <div className="bg-brand-sand/30 rounded-lg p-3">
            <p className="text-brand-navy/80 text-sm">
              "{message}"
            </p>
          </div>
        </div>

        {/* Platform buttons */}
        <div className="p-4">
          <div className="grid grid-cols-2 gap-3">
            {platforms.map(platform => (
              <button
                key={platform.id}
                onClick={() => handlePlatformClick(platform.id, platform.url)}
                className={`flex items-center gap-3 rounded-lg px-4 py-3 font-semibold text-white transition-colors ${platform.color}`}
                aria-label={`Share on ${platform.name}`}
              >
                <span className="text-lg" role="img" aria-hidden="true">
                  {platform.icon}
                </span>
                <span className="text-sm">{platform.name}</span>
              </button>
            ))}

            {/* Copy Link button */}
            <button
              onClick={handleCopyClick}
              className={`col-span-2 flex items-center justify-center gap-2 rounded-lg px-4 py-3 font-semibold transition-colors ${
                copied 
                  ? 'bg-green-500 text-white' 
                  : 'hover:bg-brand-sand/80 bg-brand-sand text-brand-navy'
              }`}
              aria-label="Copy link to clipboard"
            >
              <span className="text-lg" role="img" aria-hidden="true">
                {copied ? '✅' : '🔗'}
              </span>
              <span className="text-sm">
                {copied ? 'Link Copied!' : 'Copy Link'}
              </span>
            </button>
          </div>
        </div>

        {/* Footer with URL preview */}
        <div className="border-t border-gray-200 p-4">
          <div className="rounded bg-gray-50 p-2">
            <p className="break-all text-xs text-gray-600">
              {beachUrl}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};