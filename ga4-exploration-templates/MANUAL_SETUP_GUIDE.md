# GA4 Explorations Manual Setup Guide

## Quick Setup Instructions

Since GA4 Admin API doesn't support creating saved explorations directly, follow these steps to create each exploration manually:

### 🎯 Exploration 1: Content Engagement Overview

1. **Go to GA4 → Explore → Blank**
2. **Name:** "PRTD Content Engagement Overview"
3. **Date Range:** Last 30 days
4. **Add Dimensions:**
   - Event name
   - Custom parameter: slug
   - Custom parameter: interaction_type
   - Custom parameter: content_piece
   - Custom parameter: category

5. **Add Metrics:**
   - Event count
   - Total users
   - Average session duration

6. **Configuration:**
   - **Rows:** Event name, Custom parameter: interaction_type
   - **Columns:** Custom parameter: content_piece
   - **Values:** Event count
   - **Filter:** Event name exactly matches "content_engagement"

### 🖼️ Exploration 2: Image Engagement Analysis

1. **Go to GA4 → Explore → Blank**
2. **Name:** "PRTD Image Engagement Analysis"
3. **Date Range:** Last 30 days
4. **Add Dimensions:**
   - Event name
   - Custom parameter: slug
   - Custom parameter: vendor_id
   - Custom parameter: category

5. **Add Metrics:**
   - Event count
   - Total users
   - Engagement rate

6. **Configuration:**
   - **Rows:** Custom parameter: slug
   - **Columns:** Event name
   - **Values:** Event count, Total users
   - **Filter:** Event name contains "image"

### 🏆 Exploration 3: Engagement Quality Dashboard

1. **Go to GA4 → Explore → Blank**
2. **Name:** "PRTD Engagement Quality Dashboard"
3. **Date Range:** Last 30 days
4. **Add Dimensions:**
   - Custom parameter: slug
   - Custom parameter: category
   - Custom parameter: vendor_id

5. **Add Metrics:**
   - Event count
   - Total users
   - Engagement rate

6. **Configuration:**
   - **Rows:** Custom parameter: slug
   - **Columns:** Custom parameter: category
   - **Values:** Event count, Total users
   - **Filter:** Event name exactly matches "engagement_quality_score"

### 📄 Exploration 4: Section Performance Analysis

1. **Go to GA4 → Explore → Blank**
2. **Name:** "PRTD Section Performance Analysis"
3. **Date Range:** Last 30 days
4. **Add Dimensions:**
   - Custom parameter: slug
   - Custom parameter: category
   - Custom parameter: cta_id

5. **Add Metrics:**
   - Event count
   - Total users
   - Average session duration

6. **Configuration:**
   - **Rows:** Custom parameter: slug
   - **Values:** Event count, Total users
   - **Filter:** Event name exactly matches "section_engagement"

## 🔗 Direct GA4 Links

- **GA4 Property:** https://analytics.google.com/analytics/web/#/p502239171/reports/intelligenthome
- **Explore Hub:** https://analytics.google.com/analytics/web/#/p502239171/explore

## 📊 Alternative: Use Looker Studio

For more advanced dashboards, import the Looker Studio template:
1. Go to https://lookerstudio.google.com/
2. Create new report
3. Connect to GA4 data source (Property ID: 502239171)
4. Import the template configuration from looker_studio_dashboard.json

