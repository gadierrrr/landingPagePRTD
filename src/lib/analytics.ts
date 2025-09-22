/**
 * Google Analytics 4 tracking utilities for Puerto Rico Travel Deals
 * Provides comprehensive event tracking for deal interactions, conversions, and user engagement
 */

import { Deal, Beach } from './forms';

// Global gtag function declaration
declare global {
  interface Window {
    gtag: (...args: unknown[]) => void;
  }
}

/**
 * Base function to send events to Google Analytics
 */
export const trackEvent = (eventName: string, parameters?: Record<string, unknown>) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, {
      ...parameters,
      // Add timestamp for debugging
      timestamp: Date.now()
    });
    
    // Debug logging in development
    if (process.env.NODE_ENV === 'development') {
      console.log('GA4 Event:', eventName, parameters);
    }
  }
};

/**
 * Deal-specific tracking functions
 */

// Track when a deal is viewed (for impression tracking)
export const trackDealView = (deal: Deal, context?: string, position?: number, sectionVersion?: string) => {
  trackEvent('view_item', {
    item_id: deal.id || deal.slug,
    item_name: deal.title,
    item_category: deal.category,
    item_brand: deal.sourceName || 'Unknown',
    price: deal.price || 0,
    currency: 'USD',
    context: context || 'deal_page',
    deal_location: deal.location,
    deal_expired: deal.expiresAt ? new Date(deal.expiresAt) < new Date() : false,
    // Custom dimensions
    slug: deal.slug,
    deal_id: deal.id || deal.slug,
    vendor_id: deal.sourceName ? deal.sourceName.toLowerCase().replace(/\s+/g, '_') : 'unknown',
    category: deal.category || 'general',
    position: position?.toString() || 'unknown',
    section_version: sectionVersion || 'v1'
  });
};

// Track when a deal card is clicked (internal navigation)
export const trackDealClick = (deal: Deal, position?: number, listName?: string, ctaId?: string) => {
  trackEvent('select_content', {
    content_type: 'deal',
    item_id: deal.id || deal.slug,
    item_name: deal.title,
    item_category: deal.category,
    item_brand: deal.sourceName || 'Unknown',
    deal_location: deal.location,
    list_name: listName || 'deals_grid',
    value: deal.price || 0,
    // Custom dimensions
    slug: deal.slug,
    deal_id: deal.id || deal.slug,
    vendor_id: deal.sourceName ? deal.sourceName.toLowerCase().replace(/\s+/g, '_') : 'unknown',
    category: deal.category || 'general',
    position: position?.toString() || 'unknown',
    cta_id: ctaId || 'deal_card_click'
  });
};

// Track when external deal link is clicked (primary conversion)
export const trackExternalDealClick = (deal: Deal, context?: string, ctaId?: string) => {
  const clickId = `click_${Date.now()}_${deal.id || deal.slug}`;
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  trackEvent('click_external_deal', {
    deal_title: deal.title,
    partner: deal.sourceName || 'Unknown',
    deal_location: deal.location,
    value: deal.price || 0,
    currency: 'USD',
    context: context || 'deal_page',
    click_id: clickId,
    external_url: deal.externalUrl,
    // Custom conversion event
    event_category: 'conversion',
    event_label: 'deal_redemption',
    // Custom dimensions
    slug: deal.slug,
    deal_id: deal.id || deal.slug,
    vendor_id: deal.sourceName ? deal.sourceName.toLowerCase().replace(/\s+/g, '_') : 'unknown',
    category: deal.category || 'general',
    cta_id: ctaId || 'get_deal_button',
    request_id: requestId,
    status_code: '200' // Assume success unless error tracking provides otherwise
  });
  
  // Also track as a conversion event
  trackEvent('conversion', {
    conversion_type: 'deal_click',
    deal_id: deal.id || deal.slug,
    partner: deal.sourceName || 'Unknown',
    value: deal.price || 0,
    click_id: clickId,
    // Custom dimensions
    slug: deal.slug,
    vendor_id: deal.sourceName ? deal.sourceName.toLowerCase().replace(/\s+/g, '_') : 'unknown',
    category: deal.category || 'general',
    request_id: requestId
  });

  return clickId;
};

/**
 * Enhanced E-commerce tracking
 */

// Track multiple deal impressions (list views)
export const trackDealImpression = (deals: Deal[], listName: string, context?: string) => {
  if (deals.length === 0) return;
  
  trackEvent('view_item_list', {
    item_list_name: listName,
    item_list_id: listName.toLowerCase().replace(/\s+/g, '_'),
    context: context || 'deals_browse',
    items: deals.slice(0, 10).map((deal, index) => ({
      item_id: deal.id || deal.slug,
      item_name: deal.title,
      item_category: deal.category,
      item_brand: deal.sourceName || 'Unknown',
      index: index,
      price: deal.price || 0,
      currency: 'USD',
      item_location_id: deal.location
    }))
  });
};

// Track deal sharing
export const trackDealShare = (deal: Deal, method: string, src?: string) => {
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  trackEvent('share', {
    method: method,
    content_type: 'deal',
    item_id: deal.id || deal.slug,
    content_id: deal.slug,
    deal_title: deal.title,
    deal_category: deal.category,
    // Custom dimensions
    slug: deal.slug,
    deal_id: deal.id || deal.slug,
    vendor_id: deal.sourceName ? deal.sourceName.toLowerCase().replace(/\s+/g, '_') : 'unknown',
    category: deal.category || 'general',
    src: src || 'organic',
    cta_id: `share_${method}`,
    request_id: requestId,
    status_code: '200'
  });
};

/**
 * Form and lead tracking
 */

// Track partner form submission
export const trackPartnerFormSubmission = (formData?: Record<string, unknown>, formLocation?: string) => {
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  trackEvent('generate_lead', {
    lead_type: 'partner_application',
    value: 1,
    currency: 'USD',
    method: 'partner_form',
    form_type: 'partner_signup',
    // Custom dimensions
    slug: 'partner-application',
    category: 'partner',
    form_location: formLocation || 'partner_page',
    cta_id: 'partner_form_submit',
    request_id: requestId,
    status_code: '200',
    ...formData
  });
};

// Track newsletter signup
export const trackNewsletterSignup = (context?: string) => {
  trackEvent('sign_up', {
    method: 'newsletter',
    context: context || 'general'
  });
};

// Track travel pass inquiry
export const trackTravelPassInquiry = () => {
  trackEvent('generate_lead', {
    lead_type: 'travel_pass',
    value: 1,
    currency: 'USD',
    method: 'travel_pass_page'
  });
};

/**
 * User engagement tracking
 */

// Track scroll depth (call at 25%, 50%, 75%, 100%)
export const trackScrollDepth = (depth: number, page?: string) => {
  trackEvent('scroll', {
    percent_scrolled: depth,
    page_type: page || 'unknown'
  });
};

// Track search usage
export const trackSearch = (searchTerm: string, category?: string, resultsCount?: number) => {
  trackEvent('search', {
    search_term: searchTerm.toLowerCase(),
    category: category,
    results_count: resultsCount,
    search_type: category ? 'filtered' : 'general'
  });
};

// Track filter usage
export const trackFilter = (filterType: string, filterValue: string, resultsCount?: number) => {
  trackEvent('filter_content', {
    filter_type: filterType,
    filter_value: filterValue,
    results_count: resultsCount
  });
};

// Track category browsing
export const trackCategoryView = (category: string, dealsCount?: number) => {
  trackEvent('view_category', {
    category: category,
    deals_count: dealsCount,
    content_type: 'deals_category'
  });
};

/**
 * Navigation and page tracking
 */

// Track internal navigation
export const trackNavigation = (destination: string, source?: string) => {
  trackEvent('page_navigation', {
    destination: destination,
    source: source || 'unknown',
    navigation_type: 'internal'
  });
};

// Track external link clicks (non-deal)
export const trackExternalLink = (url: string, context?: string, linkText?: string) => {
  try {
    const domain = new URL(url).hostname;
    trackEvent('click_external_link', {
      external_domain: domain,
      external_url: url,
      context: context || 'general',
      link_text: linkText,
      link_type: 'external'
    });
  } catch (error) {
    // Invalid URL, track anyway
    trackEvent('click_external_link', {
      external_url: url,
      context: context || 'general',
      link_text: linkText,
      link_type: 'external'
    });
  }
};

/**
 * Content Engagement Depth Tracking
 */

// Track detailed content interaction patterns
export const trackContentEngagement = (interactionType: string, contentPiece: string, deal?: Deal, additionalData?: Record<string, unknown>) => {
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  trackEvent('content_engagement', {
    interaction_type: interactionType,
    content_piece: contentPiece,
    engagement_depth: calculateEngagementDepth(interactionType),
    engagement_quality: calculateEngagementQuality(interactionType, additionalData),
    // Deal context if available
    ...(deal && {
      deal_id: deal.id || deal.slug,
      deal_title: deal.title,
      deal_category: deal.category,
      vendor_id: deal.sourceName ? deal.sourceName.toLowerCase().replace(/\s+/g, '_') : 'unknown'
    }),
    // Custom dimensions
    slug: deal?.slug || 'unknown',
    category: deal?.category || 'general',
    request_id: requestId,
    status_code: '200',
    ...additionalData
  });
};

// Calculate engagement depth score (1-100)
const calculateEngagementDepth = (interactionType: string): number => {
  const depthScores: Record<string, number> = {
    'hover': 10,
    'click': 20,
    'image_view': 25,
    'image_zoom': 40,
    'gallery_navigation': 50,
    'text_selection': 60,
    'link_click': 70,
    'share_action': 80,
    'save_bookmark': 90,
    'external_conversion': 100
  };
  return depthScores[interactionType] || 0;
};

// Calculate engagement quality (low, medium, high)
const calculateEngagementQuality = (interactionType: string, data?: Record<string, unknown>): string => {
  const timeEngaged = data?.time_engaged as number || 0;
  const interactionCount = data?.interaction_count as number || 1;
  
  if (interactionType === 'external_conversion' || timeEngaged > 30) return 'high';
  if (interactionType === 'share_action' || timeEngaged > 10 || interactionCount > 3) return 'medium';
  return 'low';
};

// Track image and gallery interactions
export const trackImageEngagement = (action: string, imageInfo: {
  imageUrl?: string;
  imageIndex?: number;
  totalImages?: number;
  viewDuration?: number;
}, deal?: Deal) => {
  trackContentEngagement('image_' + action, 'deal_gallery', deal, {
    image_url: imageInfo.imageUrl,
    image_index: imageInfo.imageIndex,
    total_images: imageInfo.totalImages,
    view_duration: imageInfo.viewDuration,
    gallery_completion: imageInfo.imageIndex && imageInfo.totalImages ? 
      (imageInfo.imageIndex / imageInfo.totalImages) * 100 : 0
  });
};

// Track text content engagement
export const trackTextEngagement = (action: string, textInfo: {
  sectionType: string;
  readingTime?: number;
  wordCount?: number;
  selectionLength?: number;
}, deal?: Deal) => {
  trackContentEngagement('text_' + action, textInfo.sectionType, deal, {
    reading_time: textInfo.readingTime,
    word_count: textInfo.wordCount,
    selection_length: textInfo.selectionLength,
    reading_speed: textInfo.readingTime && textInfo.wordCount ? 
      Math.round(textInfo.wordCount / (textInfo.readingTime / 60)) : 0
  });
};

// Track video/media engagement
export const trackMediaEngagement = (action: string, mediaInfo: {
  mediaType: string;
  duration?: number;
  watchTime?: number;
  quality?: string;
}, deal?: Deal) => {
  trackContentEngagement('media_' + action, mediaInfo.mediaType, deal, {
    media_duration: mediaInfo.duration,
    watch_time: mediaInfo.watchTime,
    completion_rate: mediaInfo.duration && mediaInfo.watchTime ? 
      (mediaInfo.watchTime / mediaInfo.duration) * 100 : 0,
    media_quality: mediaInfo.quality || 'unknown'
  });
};

// Track link and CTA engagement patterns
export const trackLinkEngagement = (linkType: string, linkInfo: {
  linkText?: string;
  linkUrl?: string;
  position?: string;
  hoverTime?: number;
}, deal?: Deal) => {
  trackContentEngagement('link_' + linkType, 'cta_links', deal, {
    link_text: linkInfo.linkText,
    link_url: linkInfo.linkUrl,
    link_position: linkInfo.position,
    hover_time: linkInfo.hoverTime,
    cta_id: `link_${linkType}_${linkInfo.position || 'unknown'}`
  });
};

// Track section-based engagement
export const trackSectionEngagement = (sectionName: string, engagementData: {
  timeInSection?: number;
  interactionCount?: number;
  sectionHeight?: number;
  scrollDepth?: number;
}, deal?: Deal) => {
  trackContentEngagement('section_engagement', sectionName, deal, {
    time_in_section: engagementData.timeInSection,
    interaction_count: engagementData.interactionCount,
    section_height: engagementData.sectionHeight,
    scroll_depth: engagementData.scrollDepth,
    engagement_intensity: engagementData.timeInSection && engagementData.interactionCount ?
      (engagementData.interactionCount / engagementData.timeInSection) * 60 : 0
  });
};

/**
 * Time-based engagement tracking
 */

// Track time spent on page (call when user leaves)
export const trackTimeOnPage = (timeSeconds: number, pageType?: string) => {
  trackEvent('page_engagement', {
    engagement_time_msec: timeSeconds * 1000,
    page_type: pageType || 'unknown',
    engagement_level: timeSeconds > 60 ? 'high' : timeSeconds > 30 ? 'medium' : 'low'
  });
};

/**
 * Error and performance tracking
 */

// Track errors (404s, broken links, etc.)
export const trackError = (errorType: string, errorMessage?: string, context?: string, statusCode?: string, requestId?: string) => {
  const errorRequestId = requestId || `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  trackEvent('exception', {
    description: errorMessage || errorType,
    fatal: false,
    error_type: errorType,
    context: context || 'unknown',
    // Custom dimensions
    error_code: errorType,
    status_code: statusCode || '500',
    request_id: errorRequestId
  });
};

/**
 * Custom business events
 */

// Track when user views travel pass page
export const trackTravelPassView = () => {
  trackEvent('view_travel_pass', {
    content_type: 'travel_pass',
    page_type: 'product'
  });
};

// Track when user views about page
export const trackAboutPageView = () => {
  trackEvent('view_about', {
    content_type: 'about',
    page_type: 'informational'
  });
};

// Track guide views
export const trackGuideView = (guideSlug: string, guideTitle?: string) => {
  trackEvent('view_guide', {
    guide_id: guideSlug,
    guide_title: guideTitle,
    content_type: 'guide',
    page_type: 'content'
  });
};

/**
 * Advanced click tracking with server-side backup
 */

// Enhanced external click tracking with multiple methods
export const trackExternalClickAdvanced = async (deal: Deal, context?: string) => {
  const clickId = trackExternalDealClick(deal, context);
  
  // Server-side tracking backup (ensures tracking even if client blocks GA)
  try {
    await fetch('/api/track-click', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        dealId: deal.id || deal.slug,
        dealSlug: deal.slug,
        externalUrl: deal.externalUrl,
        clickId: clickId,
        context: context || 'deal_page',
        timestamp: new Date().toISOString(),
        referrer: window.location.href
      }),
    });
  } catch (error) {
    console.warn('Server-side click tracking failed:', error);
  }
  
  return clickId;
};

// Generate enhanced UTM parameters with unique tracking
export const generateEnhancedUtm = (deal: Deal, clickId?: string) => {
  const params = new URLSearchParams({
    utm_source: 'PRTD',
    utm_medium: 'referral',
    utm_campaign: 'deal_page',
    utm_content: deal.category || 'unknown',
    utm_term: deal.location || 'puerto_rico',
    // Custom tracking parameters
    prtd_deal_id: deal.id || deal.slug || 'unknown',
    prtd_click_id: clickId || `click_${Date.now()}`,
    prtd_partner: (deal.sourceName || 'unknown').toLowerCase().replace(/\s+/g, '_')
  });
  
  return params.toString();
};

/**
 * Utility functions
 */

// Helper to add consistent custom dimensions to any event
export const addCustomDimensions = (baseParams: Record<string, unknown>, customDims?: {
  slug?: string;
  deal_id?: string;
  vendor_id?: string;
  category?: string;
  position?: string;
  section_version?: string;
  src?: string;
  cta_id?: string;
  form_location?: string;
  status_code?: string;
  error_code?: string;
  request_id?: string;
}) => {
  return {
    ...baseParams,
    ...customDims
  };
};

// Initialize enhanced tracking (call once on app start)
export const initializeAnalytics = () => {
  if (typeof window !== 'undefined' && window.gtag) {
    // Set up enhanced measurement
    window.gtag('config', 'G-EF509Z3W9G', {
      // Enhanced measurement settings
      send_page_view: true,
      allow_enhanced_conversions: true,
      // Custom parameters mapping
      custom_map: {
        custom_parameter_1: 'slug',
        custom_parameter_2: 'deal_id',
        custom_parameter_3: 'vendor_id',
        custom_parameter_4: 'category',
        custom_parameter_5: 'position',
        custom_parameter_6: 'section_version',
        custom_parameter_7: 'src',
        custom_parameter_8: 'cta_id',
        custom_parameter_9: 'form_location',
        custom_parameter_10: 'status_code',
        custom_parameter_11: 'error_code',
        custom_parameter_12: 'request_id'
      }
    });
    
    if (process.env.NODE_ENV === 'development') {
      console.log('Analytics initialized with enhanced tracking and custom dimensions');
    }
  }
};

// Batch track multiple events (useful for performance)
export const trackEventBatch = (events: Array<{name: string, parameters?: Record<string, unknown>}>) => {
  events.forEach(event => trackEvent(event.name, event.parameters));
};

/**
 * Engagement Analytics and Heatmap Utilities
 */

// Track user interaction heatmap data
export const trackHeatmapInteraction = (elementType: string, position: { x: number; y: number }, deal?: Deal) => {
  trackContentEngagement('heatmap_interaction', elementType, deal, {
    click_x: position.x,
    click_y: position.y,
    viewport_width: window.innerWidth,
    viewport_height: window.innerHeight,
    page_scroll: window.pageYOffset,
    element_type: elementType
  });
};

// Track engagement quality score for analytics dashboard
export const trackEngagementScore = (deal: Deal, metrics: {
  timeOnPage: number;
  scrollDepth: number;
  interactionCount: number;
  sectionViews: number;
  imageEngagements: number;
  textSelections: number;
}) => {
  // Calculate overall engagement score (0-100)
  const timeScore = Math.min(metrics.timeOnPage / 60, 1) * 25; // Max 25 points for 1+ minute
  const scrollScore = (metrics.scrollDepth / 100) * 25; // Max 25 points for full scroll
  const interactionScore = Math.min(metrics.interactionCount / 10, 1) * 25; // Max 25 points for 10+ interactions
  const contentScore = Math.min((metrics.sectionViews + metrics.imageEngagements + metrics.textSelections) / 8, 1) * 25; // Max 25 points
  
  const totalScore = Math.round(timeScore + scrollScore + interactionScore + contentScore);
  
  trackEvent('engagement_quality_score', {
    deal_id: deal.id || deal.slug,
    deal_title: deal.title,
    engagement_score: totalScore,
    time_score: Math.round(timeScore),
    scroll_score: Math.round(scrollScore),
    interaction_score: Math.round(interactionScore),
    content_score: Math.round(contentScore),
    total_time: metrics.timeOnPage,
    max_scroll: metrics.scrollDepth,
    total_interactions: metrics.interactionCount,
    content_pieces_viewed: metrics.sectionViews + metrics.imageEngagements + metrics.textSelections,
    engagement_quality: totalScore >= 70 ? 'high' : totalScore >= 40 ? 'medium' : 'low',
    // Custom dimensions
    slug: deal.slug,
    vendor_id: deal.sourceName ? deal.sourceName.toLowerCase().replace(/\s+/g, '_') : 'unknown',
    category: deal.category || 'general'
  });
  
  return totalScore;
};

// Track A/B test variant performance for optimization
export const trackVariantPerformance = (variantId: string, elementName: string, performance: {
  conversionRate: number;
  engagementRate: number;
  clickThroughRate: number;
}) => {
  trackEvent('ab_test_performance', {
    variant_id: variantId,
    element_name: elementName,
    conversion_rate: performance.conversionRate,
    engagement_rate: performance.engagementRate,
    click_through_rate: performance.clickThroughRate,
    performance_score: (performance.conversionRate + performance.engagementRate + performance.clickThroughRate) / 3
  });
};

// Helper function to generate engagement analytics summary
export const generateEngagementSummary = (deal: Deal, sessionData: {
  startTime: number;
  endTime: number;
  interactions: Array<{ type: string; timestamp: number; data?: Record<string, unknown> }>;
  scrollEvents: Array<{ depth: number; timestamp: number }>;
  sectionViews: Array<{ section: string; duration: number }>;
}) => {
  const sessionDuration = (sessionData.endTime - sessionData.startTime) / 1000;
  const maxScrollDepth = Math.max(...sessionData.scrollEvents.map(e => e.depth));
  const uniqueSections = new Set(sessionData.sectionViews.map(s => s.section)).size;
  
  const summary = {
    deal_id: deal.id || deal.slug,
    session_duration: sessionDuration,
    max_scroll_depth: maxScrollDepth,
    total_interactions: sessionData.interactions.length,
    unique_sections_viewed: uniqueSections,
    average_section_time: sessionData.sectionViews.length > 0 
      ? sessionData.sectionViews.reduce((sum, s) => sum + s.duration, 0) / sessionData.sectionViews.length
      : 0,
    interaction_frequency: sessionData.interactions.length / sessionDuration, // interactions per second
    engagement_intensity: (sessionData.interactions.length + maxScrollDepth/10 + uniqueSections) / sessionDuration
  };
  
  // Track the comprehensive session summary
  trackEvent('session_engagement_summary', {
    ...summary,
    // Custom dimensions
    slug: deal.slug,
    deal_id: deal.id || deal.slug,
    vendor_id: deal.sourceName ? deal.sourceName.toLowerCase().replace(/\s+/g, '_') : 'unknown',
    category: deal.category || 'general'
  });
  
  return summary;
};

/**
 * Beach Finder specific tracking functions
 */

// Track Beach Finder section view
export const trackBeachFinderSectionView = (cardsShown: number) => {
  trackEvent('beachfinder_section_view', {
    cards_shown: cardsShown,
    section_type: 'beach_list'
  });
};

// Track use my location button click
export const trackUseMyLocationClick = () => {
  trackEvent('use_my_location_click', {
    feature: 'beachfinder',
    action_type: 'geolocation_request'
  });
};

// Track geolocation denied
export const trackGeolocationDenied = () => {
  trackEvent('geolocation_denied', {
    feature: 'beachfinder',
    fallback_behavior: 'alphabetical_sort'
  });
};

// Track beach filters change
export const trackBeachFiltersChange = (filters: {
  tags?: string[];
  distance?: number;
  sort?: string;
}) => {
  trackEvent('beach_filters_change', {
    selected_tags: filters.tags?.join(',') || '',
    distance_bucket: filters.distance ? Math.round(filters.distance / 10) * 10 : 'all', // Round to nearest 10
    sort_method: filters.sort || 'closest',
    filter_count: (filters.tags?.length || 0)
  });
};

// Track beach card click
export const trackBeachCardClick = (beach: Beach, position: number, tags: string[]) => {
  trackEvent('beach_card_click', {
    beach_slug: beach.slug,
    beach_name: beach.name,
    municipality: beach.municipality,
    position: position,
    tags: tags.join(','),
    has_conditions: !!(beach.sargassum || beach.surf || beach.wind)
  });
};

// Track directions click
export const trackBeachDirectionsClick = (beach: Beach, distance?: number, src: string = 'beachfinder') => {
  const distanceBucket = distance 
    ? distance < 1000 ? 'under_1km' 
      : distance < 5000 ? '1-5km'
      : distance < 15000 ? '5-15km'
      : 'over_15km'
    : 'unknown';

  trackEvent('directions_click', {
    beach_slug: beach.slug,
    beach_name: beach.name,
    municipality: beach.municipality,
    distance_bucket: distanceBucket,
    distance_meters: distance ? Math.round(distance) : undefined,
    src: src,
    external_action: 'maps_navigation'
  });
};

// Track beach details view
export const trackBeachDetailsView = (beach: Beach) => {
  trackEvent('beach_details_view', {
    beach_slug: beach.slug,
    beach_name: beach.name,
    municipality: beach.municipality,
    has_gallery: !!(beach.gallery && beach.gallery.length > 0),
    has_conditions: !!(beach.sargassum || beach.surf || beach.wind),
    tags_count: beach.tags?.length || 0,
    amenities_count: beach.amenities?.length || 0
  });
};