import { Beach } from './forms';

// UTM parameter configuration
export interface UTMParams {
  source: string;
  medium: string;
  campaign: string;
  content?: string;
}

// Generate UTM parameters for beach sharing
export function generateBeachUTMParams(platform: string, beachSlug: string): UTMParams {
  return {
    source: 'share',
    medium: platform,
    campaign: 'beach',
    content: beachSlug
  };
}

// Append UTM parameters to URL
export function appendUTMParams(url: string, utmParams: UTMParams): string {
  const urlObj = new URL(url);
  
  urlObj.searchParams.set('utm_source', utmParams.source);
  urlObj.searchParams.set('utm_medium', utmParams.medium);
  urlObj.searchParams.set('utm_campaign', utmParams.campaign);
  
  if (utmParams.content) {
    urlObj.searchParams.set('utm_content', utmParams.content);
  }
  
  return urlObj.toString();
}

// Generate share message for beach
export function generateBeachShareMessage(beach: Beach): string {
  const tagline = beach.tags && beach.tags.length > 0 
    ? beach.tags.slice(0, 2).map(tag => tag.replace(/_/g, ' ')).join(', ')
    : 'Beautiful';
  
  return `Check out ${beach.name} in ${beach.municipality}, Puerto Rico — ${tagline} beach perfect for your next adventure!`;
}

// Platform-specific share URL builders
export interface SharePlatformUrls {
  whatsapp: string;
  facebook: string;
  twitter: string;
  email: string;
  sms: string;
}

export function generatePlatformShareUrls(
  beach: Beach, 
  beachUrl: string,
  message: string
): SharePlatformUrls {
  // Add UTM parameters for each platform
  const whatsappUrl = appendUTMParams(beachUrl, generateBeachUTMParams('whatsapp', beach.slug!));
  const facebookUrl = appendUTMParams(beachUrl, generateBeachUTMParams('facebook', beach.slug!));
  const twitterUrl = appendUTMParams(beachUrl, generateBeachUTMParams('twitter', beach.slug!));
  const emailUrl = appendUTMParams(beachUrl, generateBeachUTMParams('email', beach.slug!));
  const smsUrl = appendUTMParams(beachUrl, generateBeachUTMParams('sms', beach.slug!));

  // Encode message and URLs for platform compatibility
  const encodedWhatsappText = encodeURIComponent(`${message} ${whatsappUrl}`);
  const encodedTwitterText = encodeURIComponent(`${message} ${twitterUrl}`);
  const encodedEmailBody = encodeURIComponent(`${message}\n\n${emailUrl}`);
  const encodedSMSBody = encodeURIComponent(`${message} ${smsUrl}`);

  return {
    whatsapp: `https://wa.me/?text=${encodedWhatsappText}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(facebookUrl)}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodedTwitterText}`,
    email: `mailto:?subject=${encodeURIComponent(`${beach.name} Beach - Puerto Rico`)}&body=${encodedEmailBody}`,
    sms: getSMSUrl(encodedSMSBody)
  };
}

// Device-specific SMS URL handling
function getSMSUrl(encodedMessage: string): string {
  const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : '';
  
  // iOS uses different SMS URL format than Android
  if (/iPhone|iPad|iPod/i.test(userAgent)) {
    return `sms:&body=${encodedMessage}`;
  } else {
    return `sms:?body=${encodedMessage}`;
  }
}

// Device detection utilities
export function isMobileDevice(): boolean {
  if (typeof navigator === 'undefined') return false;
  
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

export function isWebShareSupported(): boolean {
  return typeof navigator !== 'undefined' && 'share' in navigator;
}

// Copy to clipboard utility with fallback
export async function copyToClipboard(text: string): Promise<boolean> {
  if (typeof navigator === 'undefined') return false;
  
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      try {
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        return successful;
      } catch {
        document.body.removeChild(textArea);
        return false;
      }
    }
  } catch {
    return false;
  }
}

// Web Share API data structure
export interface WebShareData {
  title: string;
  text: string;
  url: string;
}

// Generate Web Share API data for beach
export function generateWebShareData(beach: Beach, beachUrl: string, message: string): WebShareData {
  const urlWithUTM = appendUTMParams(beachUrl, generateBeachUTMParams('webshare', beach.slug!));
  
  return {
    title: `${beach.name} Beach - Puerto Rico`,
    text: message,
    url: urlWithUTM
  };
}