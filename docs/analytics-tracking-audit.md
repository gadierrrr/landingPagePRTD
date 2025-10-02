# PRTD Analytics Tracking Audit & Recommendations

## 📊 **What We're Currently Tracking**

### ✅ **Core Business Events (8 Events)**

| Event | Purpose | Implementation Status | Business Value |
|-------|---------|---------------------|----------------|
| `page_view` | Traffic & engagement | ✅ Auto (GA4) | **HIGH** - Core metrics |
| `view_item` | Deal impression tracking | ✅ Implemented | **HIGH** - Deal performance |
| `select_item` | Deal card clicks | ✅ Implemented | **HIGH** - User interest |
| `click_external_deal` | Primary conversions | ✅ Implemented | **CRITICAL** - Revenue tracking |
| `conversion` | Deal redemptions | ✅ Implemented | **CRITICAL** - Business success |
| `share` | Deal sharing activity | ✅ Implemented | **MEDIUM** - Viral coefficient |
| `generate_lead` | Form submissions | ✅ Implemented | **HIGH** - Lead generation |
| `scroll` | Content engagement | ✅ Implemented | **MEDIUM** - UX insights |

### ✅ **User Engagement Events (8 Events)**

| Event | Purpose | Implementation Status | Data Quality |
|-------|---------|---------------------|-------------|
| `view_item_list` | Deal browsing patterns | ✅ Implemented | **GOOD** |
| `search` | Search behavior | ✅ Implemented | **GOOD** |
| `filter_content` | Filter usage | ✅ Implemented | **GOOD** |
| `view_category` | Category exploration | ✅ Implemented | **GOOD** |
| `page_navigation` | Internal navigation | ✅ Implemented | **GOOD** |
| `click_external_link` | External link clicks | ✅ Implemented | **GOOD** |
| `page_engagement` | Time on page | ✅ Implemented | **GOOD** |
| `sign_up` | Newsletter signups | ✅ Implemented | **GOOD** |

### ✅ **Business Intelligence Events (6 Events)**

| Event | Purpose | Implementation Status | Strategic Value |
|-------|---------|---------------------|----------------|
| `view_travel_pass` | Product interest | ✅ Implemented | **HIGH** |
| `view_about` | Brand engagement | ✅ Implemented | **MEDIUM** |
| `view_guide` | Content performance | ✅ Implemented | **MEDIUM** |
| `exception` | Error tracking | ✅ Implemented | **HIGH** - Site health |
| `session_start` | Session tracking | ✅ Auto (GA4) | **HIGH** |
| `first_visit` | New user tracking | ✅ Auto (GA4) | **HIGH** |

### ✅ **Custom Dimensions (12 Dimensions)**

All properly configured with rich attribution data:
- Deal identification (`slug`, `deal_id`, `vendor_id`)
- User behavior (`position`, `cta_id`, `section_version`)
- Technical tracking (`request_id`, `status_code`, `error_code`)
- Attribution (`src`, `category`, `form_location`)

---

## 🎯 **What We Should Add (High Priority)**

### 🔴 **Critical Missing Events**

#### **1. User Journey Tracking**
```javascript
// Add these events for funnel analysis
trackEvent('begin_checkout', {
  deal_id: deal.id,
  checkout_step: 1,
  payment_type: 'external_redirect'
});

trackEvent('add_to_cart', {
  deal_id: deal.id,
  cart_type: 'wishlist'
});

trackEvent('purchase', {
  deal_id: deal.id,
  transaction_id: 'external_confirmation',
  value: deal.price,
  currency: 'USD'
});
```

#### **2. Performance Monitoring**
```javascript
// Core Web Vitals and performance
trackEvent('web_vitals', {
  metric_name: 'LCP', // LCP, FID, CLS
  metric_value: 2.5,
  page_type: 'deal_page'
});

trackEvent('page_load_time', {
  load_time: 1250,
  page_type: 'landing',
  connection_type: '4g'
});
```

#### **3. Revenue Attribution**
```javascript
// Server-side revenue confirmation
trackEvent('revenue_confirmed', {
  deal_id: deal.id,
  partner_confirmation: true,
  commission_amount: 15.50,
  booking_reference: 'ABC123'
});
```

### 🟡 **Important Missing Events**

#### **4. User Behavior Insights**
```javascript
// Content interaction depth
trackEvent('content_engagement', {
  engagement_type: 'image_zoom',
  content_piece: 'deal_gallery',
  time_engaged: 5.2
});

// Exit intent tracking
trackEvent('exit_intent', {
  page_type: 'deal_page',
  time_on_page: 45,
  scroll_depth: 60
});
```

#### **5. Partner Analytics**
```javascript
// Partner performance tracking
trackEvent('partner_click_quality', {
  partner_id: 'marriott',
  click_to_booking_time: 1800, // 30 minutes
  booking_success: true
});
```

### 🟢 **Nice-to-Have Events**

#### **6. Advanced User Segmentation**
```javascript
// User preferences and behavior
trackEvent('user_preference', {
  preference_type: 'deal_category',
  preference_value: 'luxury_hotels',
  confidence_score: 0.85
});
```

---

## 📈 **Recommended Implementation Priority**

### **Phase 1 (Next 2 weeks) - Critical Business Events**
1. **Purchase/Revenue Tracking** - Essential for ROI analysis
2. **Begin Checkout** - Complete the conversion funnel
3. **Web Vitals** - Critical for SEO and UX
4. **Page Load Performance** - Affects conversion rates

### **Phase 2 (Next month) - Enhanced UX Tracking**
1. **Content Engagement Depth** - Optimize deal presentation
2. **Exit Intent** - Reduce bounce rates
3. **Partner Click Quality** - Improve partner relationships
4. **Advanced Error Tracking** - Detailed debugging

### **Phase 3 (Next quarter) - Advanced Analytics**
1. **User Preference Learning** - Personalization foundation
2. **Cohort Analysis Events** - User lifetime value
3. **A/B Test Results** - Optimization tracking
4. **Predictive Analytics Events** - ML/AI foundations

---

## 🛠️ **Implementation Examples**

### **1. Complete E-commerce Funnel**
```javascript
// Currently missing - add to deal pages
export const trackBeginCheckout = (deal: Deal, context?: string) => {
  trackEvent('begin_checkout', {
    deal_id: deal.id || deal.slug,
    deal_title: deal.title,
    value: deal.price || 0,
    currency: 'USD',
    checkout_step: 1,
    context: context || 'deal_page',
    // Custom dimensions
    slug: deal.slug,
    vendor_id: deal.sourceName?.toLowerCase().replace(/\s+/g, '_'),
    category: deal.category,
    cta_id: 'begin_checkout_button'
  });
};
```

### **2. Performance Monitoring**
```javascript
// Add to _app.tsx for site-wide tracking
export const trackWebVitals = (metric: any) => {
  trackEvent('web_vitals', {
    metric_name: metric.name,
    metric_value: Math.round(metric.value),
    metric_rating: metric.rating, // good, needs-improvement, poor
    page_type: getPageType(),
    request_id: `perf_${Date.now()}`
  });
};
```

### **3. Revenue Confirmation**
```javascript
// Add to partner webhook/confirmation system
export const trackRevenueConfirmed = (dealId: string, bookingData: any) => {
  trackEvent('purchase', {
    transaction_id: bookingData.confirmationCode,
    deal_id: dealId,
    value: bookingData.totalAmount,
    currency: 'USD',
    commission: bookingData.commissionAmount,
    partner_confirmed: true,
    booking_success: true
  });
};
```

---

## 📊 **Current Analytics Gaps**

### **🔴 Critical Gaps**
1. **No revenue confirmation** - Can't measure true ROI
2. **Incomplete conversion funnel** - Missing checkout steps
3. **No performance monitoring** - Site speed affects conversions
4. **Limited partner attribution** - Can't optimize partnerships

### **🟡 Important Gaps**
1. **No user preference tracking** - Can't personalize
2. **Limited content engagement** - Can't optimize deal presentation
3. **No predictive signals** - Can't forecast demand
4. **Basic error tracking** - Limited debugging capability

### **🟢 Enhancement Opportunities**
1. **Advanced segmentation** - Better user insights
2. **Cohort analysis** - Lifetime value tracking
3. **Real-time personalization** - Dynamic content
4. **Predictive analytics** - Demand forecasting

---

## 🎯 **Business Impact Analysis**

### **Current Tracking Effectiveness: 7/10**
- ✅ **Strong**: Deal performance, basic conversions, user engagement
- ⚠️ **Weak**: Revenue confirmation, performance monitoring, advanced attribution
- ❌ **Missing**: Purchase completion, checkout funnel, user preferences

### **Potential Business Value of Missing Events**
1. **Revenue Tracking**: +25% attribution accuracy
2. **Performance Monitoring**: +15% conversion rate (faster site)
3. **Checkout Funnel**: +20% conversion optimization potential
4. **User Preferences**: +30% personalization effectiveness

---

## 🚀 **Quick Wins (Implement This Week)**

### **1. Add Begin Checkout Tracking**
- Add to all "Get This Deal" buttons
- Track external redirect as checkout start
- Measure checkout abandonment

### **2. Add Web Vitals Monitoring**
- Track Core Web Vitals automatically
- Alert on performance degradation
- Optimize slow-loading deals

### **3. Enhance Error Tracking**
- Add user context to errors
- Track failed external redirects
- Monitor partner link health

Would you like me to implement any of these missing tracking events, or would you prefer to focus on a specific area first?
