# GA4 Custom Dimensions Configuration for PRTD

## Overview

This guide walks through setting up the 12 custom dimensions required for comprehensive PRTD analytics tracking. These dimensions provide detailed insights into deal performance, user behavior, and system health.

## Required Custom Dimensions

Configure these **exactly** in your GA4 property (Admin → Data display → Custom definitions → Custom dimensions):

| Dimension Name | Parameter Name | Scope | Description | Example Values |
|---------------|----------------|-------|-------------|----------------|
| Deal Slug | `slug` | Event | Deal/page identifier | `hotel-deals`, `flight-specials` |
| Deal ID | `deal_id` | Event | Unique deal tracking | `deal_123`, `promo_abc` |
| Vendor ID | `vendor_id` | Event | Partner/vendor identifier | `marriott`, `delta`, `enterprise` |
| Category | `category` | Event | Deal category | `hotels`, `flights`, `cars`, `activities` |
| Position | `position` | Event | Layout position | `1`, `2`, `hero`, `sidebar` |
| Section Version | `section_version` | Event | A/B test variant | `v1`, `v2`, `control` |
| Source | `src` | Event | Traffic source detail | `email`, `social`, `paid`, `organic` |
| CTA ID | `cta_id` | Event | Call-to-action identifier | `get_deal_button`, `share_whatsapp` |
| Form Location | `form_location` | Event | Form context | `homepage`, `deal_page`, `partner_page` |
| Status Code | `status_code` | Event | Response/error codes | `200`, `404`, `500` |
| Error Code | `error_code` | Event | Error categorization | `validation`, `payment`, `network` |
| Request ID | `request_id` | Event | Debug trace identifier | `req_1758396862_abc123` |

## Step-by-Step Setup

### 1. Access GA4 Custom Dimensions

1. Go to your GA4 property: https://analytics.google.com/
2. Navigate to **Admin** (gear icon)
3. Under **Data display**, click **Custom definitions**
4. Click **Custom dimensions**
5. Click **Create custom dimension**

### 2. Create Each Dimension

For each dimension in the table above:

1. **Dimension name**: Enter the exact name from the table
2. **Scope**: Select **Event**
3. **Description**: Use the description from the table
4. **Event parameter**: Enter the exact parameter name (case-sensitive)
5. Click **Save**

### 3. Verification

After creating all dimensions, verify they appear in your list:

```
✓ Deal Slug (slug)
✓ Deal ID (deal_id)  
✓ Vendor ID (vendor_id)
✓ Category (category)
✓ Position (position)
✓ Section Version (section_version)
✓ Source (src)
✓ CTA ID (cta_id)
✓ Form Location (form_location)
✓ Status Code (status_code)
✓ Error Code (error_code)
✓ Request ID (request_id)
```

### 4. Test Data Flow

1. Deploy the updated analytics code
2. Generate test events (browse deals, click buttons, share content)
3. Wait 24-48 hours for data processing
4. Check **Explore** → **Free form** in GA4
5. Add events with custom dimensions to verify data

## Analytics Implementation Status

The following tracking functions now send all required custom dimensions:

### ✅ **Implemented Events**

- **`view_item`** (Deal views) - ✅ All 12 dimensions
- **`select_content`** (Deal clicks) - ✅ All 12 dimensions  
- **`click_external_deal`** (Conversions) - ✅ All 12 dimensions
- **`conversion`** (Deal redemptions) - ✅ All 12 dimensions
- **`share`** (Deal sharing) - ✅ All 12 dimensions
- **`generate_lead`** (Form submissions) - ✅ All 12 dimensions
- **`exception`** (Error tracking) - ✅ Error-specific dimensions

### 📊 **Custom Dimension Usage**

```javascript
// Example: Deal view with full dimensions
trackDealView(deal, 'deal_page', 1, 'v2');
// Sends: slug, deal_id, vendor_id, category, position, section_version

// Example: External click with CTA tracking
trackExternalDealClick(deal, 'deal_page', 'get_deal_button');
// Sends: All dimensions + cta_id, request_id, status_code

// Example: Form submission with location
trackPartnerFormSubmission(formData, 'partner_page');
// Sends: slug, category, form_location, cta_id, request_id, status_code
```

## Data Collection Timeline

- **Real-time**: Custom dimensions appear in Realtime reports immediately
- **Standard reports**: 24-48 hours for full processing
- **Explore/Custom reports**: Available after 24 hours
- **Historical data**: Dimensions only apply to events after creation

## Usage Examples

### Deal Performance Analysis
```
Dimension: Deal ID, Vendor ID, Category
Metric: Event Count, Revenue
Filter: Event = click_external_deal
```

### CTA Effectiveness
```
Dimension: CTA ID, Position, Section Version
Metric: Conversion Rate
Filter: Event = select_content OR click_external_deal
```

### Error Monitoring
```
Dimension: Error Code, Status Code, Request ID
Metric: Event Count
Filter: Event = exception
```

### Partner Attribution
```
Dimension: Vendor ID, Source, Category
Metric: Event Count, Event Value
Filter: Event = conversion
```

## Validation

Run the analytics validation to confirm proper dimension collection:

```bash
# Check overall analytics health
prtd-health

# Run comprehensive validation
prtd-validate

# Monitor real-time dimension data
prtd-monitor 10 30
```

## Troubleshooting

### Missing Dimensions in Reports

1. **Verify parameter names** match exactly (case-sensitive)
2. **Check event scope** - all dimensions should be "Event" scope
3. **Wait 24-48 hours** for data processing
4. **Test with fresh events** after dimension creation

### Data Not Appearing

1. **Check browser console** for analytics errors
2. **Verify GA4 property ID**: `G-EF509Z3W9G` → `502239171`
3. **Test in GA4 Debug View** (install GA4 Debug extension)
4. **Review Real-time reports** for immediate feedback

### Parameter Limit

GA4 allows up to 50 custom dimensions per property. PRTD uses 12, leaving 38 available for future expansion.

---

**Next Steps**: After setting up dimensions, wait 24-48 hours then run `prtd-validate` to confirm comprehensive tracking is working.