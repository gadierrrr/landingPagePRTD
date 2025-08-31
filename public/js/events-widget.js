// Puerto Rico Travel Deals - Events Embed Widget
// Zero-dependency UMD script with inlined styles

(function(window, document) {
  'use strict';
  
  // Brand tokens (inlined from src/styles/tokens.css)
  const BRAND_TOKENS = {
    colors: {
      blue: 'var(--color-brand-blue, #0050A4)',
      red: 'var(--color-brand-red, #ED1C24)', 
      navy: 'var(--color-brand-navy, #0B2B54)',
      sand: 'var(--color-brand-sand, #FFF7EA)'
    },
    radius: {
      md: '8px',
      lg: '16px'
    },
    shadow: {
      sm: '0 1px 2px 0 rgba(0 0 0 / 5%)',
      md: '0 4px 10px -2px rgba(0 0 0 / 8%)'
    }
  };

  // CSS styles (inlined, using brand tokens)
  const CSS = `
    .prtd-events-widget {
      font-family: ui-sans-serif, system-ui, sans-serif;
      color: ${BRAND_TOKENS.colors.navy};
      font-size: 14px;
      line-height: 1.4;
    }
    .prtd-events-card {
      background: white;
      border: 1px solid rgba(11, 43, 84, 0.1);
      border-radius: ${BRAND_TOKENS.radius.lg};
      box-shadow: ${BRAND_TOKENS.shadow.sm};
      transition: all 0.2s;
      overflow: hidden;
      margin-bottom: 12px;
    }
    .prtd-events-card:hover {
      box-shadow: ${BRAND_TOKENS.shadow.md};
      border-color: rgba(0, 80, 164, 0.2);
    }
    .prtd-events-image {
      width: 100%;
      height: 120px;
      object-fit: cover;
      background: ${BRAND_TOKENS.colors.sand};
    }
    .prtd-events-content {
      padding: 12px;
    }
    .prtd-events-title {
      font-weight: 600;
      margin: 0 0 6px 0;
      font-size: 16px;
      line-height: 1.2;
    }
    .prtd-events-meta {
      color: rgba(11, 43, 84, 0.6);
      font-size: 13px;
      margin: 4px 0;
    }
    .prtd-events-genre {
      display: inline-block;
      background: rgba(0, 80, 164, 0.1);
      color: ${BRAND_TOKENS.colors.blue};
      padding: 2px 8px;
      border-radius: ${BRAND_TOKENS.radius.md};
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      margin-top: 6px;
    }
    .prtd-events-sponsored {
      background: ${BRAND_TOKENS.colors.blue};
      color: white;
      padding: 2px 6px;
      border-radius: ${BRAND_TOKENS.radius.md};
      font-size: 10px;
      font-weight: 600;
      position: absolute;
      top: 8px;
      left: 8px;
    }
    .prtd-events-cta {
      background: ${BRAND_TOKENS.colors.blue};
      color: white;
      border: none;
      padding: 8px 12px;
      border-radius: ${BRAND_TOKENS.radius.md};
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      text-decoration: none;
      display: inline-block;
      margin-top: 8px;
      transition: background-color 0.2s;
    }
    .prtd-events-cta:hover {
      background: ${BRAND_TOKENS.colors.navy};
    }
    .prtd-events-loading {
      text-align: center;
      padding: 20px;
      color: rgba(11, 43, 84, 0.6);
    }
    .prtd-events-error {
      text-align: center;
      padding: 20px;
      color: ${BRAND_TOKENS.colors.red};
      font-size: 13px;
    }
  `;

  // Utility functions
  function formatEventDate(startDateTime, endDateTime) {
    const start = new Date(startDateTime);
    const startDate = start.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
    const startTime = start.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      timeZone: 'America/Puerto_Rico'
    });
    
    if (endDateTime) {
      const end = new Date(endDateTime);
      const endTime = end.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        timeZone: 'America/Puerto_Rico'
      });
      
      if (start.toDateString() === end.toDateString()) {
        return startDate + ', ' + startTime + ' - ' + endTime;
      }
    }
    
    return startDate + ', ' + startTime;
  }

  function appendUtm(url, weekStart) {
    try {
      const urlObj = new URL(url);
      urlObj.searchParams.set('utm_source', 'prtd-events');
      urlObj.searchParams.set('utm_campaign', 'weekly-events-' + weekStart);
      urlObj.searchParams.set('utm_medium', 'embed');
      return urlObj.toString();
    } catch {
      return url;
    }
  }

  // Main widget function
  function initEventsWidget() {
    // Find all widget containers
    const containers = document.querySelectorAll('[data-prtd-events]');
    
    containers.forEach(function(container) {
      const city = container.getAttribute('data-city') || '';
      const genre = container.getAttribute('data-genre') || '';
      const limit = container.getAttribute('data-limit') || '5';
      
      // Add base widget class
      container.className = (container.className + ' prtd-events-widget').trim();
      
      // Show loading state
      container.innerHTML = '<div class="prtd-events-loading">Loading events...</div>';
      
      // Build API URL
      const apiUrl = 'https://puertoricotraveldeals.com/api/embed/events?' + 
        new URLSearchParams({
          city: city,
          genre: genre,
          limit: limit
        }).toString();
      
      // Fetch events
      fetch(apiUrl)
        .then(function(response) {
          if (!response.ok) throw new Error('Failed to load events');
          return response.json();
        })
        .then(function(data) {
          renderEvents(container, data.events, data.weekStart);
        })
        .catch(function(error) {
          console.error('PRTD Events Widget Error:', error);
          container.innerHTML = '<div class="prtd-events-error">Failed to load events</div>';
        });
    });
  }

  function renderEvents(container, events, weekStart) {
    if (!events || events.length === 0) {
      container.innerHTML = '<div class="prtd-events-error">No events found</div>';
      return;
    }

    let html = '';

    events.forEach(function(event) {
      const isSponsored = event.sponsorPlacement === 'hero' || event.sponsorPlacement === 'featured';
      const ticketsUrl = event.links?.tickets;
      const detailsUrl = event.links?.details;
      const imageUrl = event.heroImage?.url || '';
      const venue = event.venueName ? event.venueName + ', ' + event.city : event.city;
      const price = event.free ? 'Free' : (event.priceFrom ? 'From $' + event.priceFrom : '');

      html += '<div class="prtd-events-card" style="position: relative;">';
      
      if (isSponsored) {
        html += '<div class="prtd-events-sponsored">Sponsored</div>';
      }
      
      if (imageUrl) {
        html += '<img src="' + imageUrl + '" alt="' + (event.heroImage?.alt || event.title) + '" class="prtd-events-image">';
      }
      
      html += '<div class="prtd-events-content">';
      html += '<h3 class="prtd-events-title">' + event.title + '</h3>';
      html += '<div class="prtd-events-meta">' + formatEventDate(event.startDateTime, event.endDateTime) + '</div>';
      html += '<div class="prtd-events-meta">' + venue + '</div>';
      
      if (price) {
        html += '<div class="prtd-events-meta" style="font-weight: 600;">' + price + '</div>';
      }
      
      html += '<span class="prtd-events-genre">' + event.genre + '</span>';
      
      if (ticketsUrl) {
        const finalUrl = isSponsored ? appendUtm(ticketsUrl, weekStart) : ticketsUrl;
        html += '<a href="' + finalUrl + '" target="_blank" rel="noopener' + (isSponsored ? ' sponsored' : '') + '" class="prtd-events-cta">Get Tickets</a>';
      } else if (detailsUrl) {
        const finalUrl = isSponsored ? appendUtm(detailsUrl, weekStart) : detailsUrl;
        html += '<a href="' + finalUrl + '" target="_blank" rel="noopener' + (isSponsored ? ' sponsored' : '') + '" class="prtd-events-cta">Learn More</a>';
      }
      
      html += '</div></div>';
    });

    container.innerHTML = html;
  }

  // Inject CSS
  if (!document.getElementById('prtd-events-styles')) {
    const style = document.createElement('style');
    style.id = 'prtd-events-styles';
    style.textContent = CSS;
    document.head.appendChild(style);
  }

  // Initialize widgets when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initEventsWidget);
  } else {
    initEventsWidget();
  }

})(window, document);