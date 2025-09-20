# GA4 Custom Explorations Setup Guide for PRTD Content Engagement

## 🎯 Overview

This guide walks you through creating custom GA4 explorations to view your new content engagement tracking data. You'll create 4 key reports to analyze user interaction patterns, content performance, and engagement quality.

---

## 📊 **Exploration 1: Content Engagement Overview**

**Purpose:** See all content interactions across your site

### Setup Steps:

1. **Go to GA4 → Explore → Blank**
2. **Name:** "PRTD Content Engagement Overview"
3. **Add Dimensions:**
   - Event name
   - Custom parameter: `slug` 
   - Custom parameter: `interaction_type`
   - Custom parameter: `content_piece`
   - Custom parameter: `category`

4. **Add Metrics:**
   - Event count
   - Total users
   - Average session duration

5. **Configuration:**
   - **Rows:** Event name, Custom parameter: interaction_type
   - **Columns:** Custom parameter: content_piece
   - **Values:** Event count
   - **Filters:** Event name = `content_engagement`

6. **Date Range:** Last 30 days

### What You'll See:
- Which content sections get the most interaction
- Types of engagement (hover, click, selection) by section
- Deal performance by category

---

## 🖼️ **Exploration 2: Image Engagement Analysis**

**Purpose:** Track image interaction patterns and view times

### Setup Steps:

1. **Go to GA4 → Explore → Blank**
2. **Name:** "PRTD Image Engagement"
3. **Add Dimensions:**
   - Event name
   - Custom parameter: `slug`
   - Custom parameter: `image_index`
   - Custom parameter: `view_duration`

4. **Add Metrics:**
   - Event count
   - Total users

5. **Configuration:**
   - **Rows:** Custom parameter: slug
   - **Columns:** Event name
   - **Values:** Event count, Total users
   - **Filters:** Event name contains `image`

### What You'll See:
- Which deals have the most engaging images
- Average image view times
- Image interaction patterns (hover vs click)

---

## 🏆 **Exploration 3: Engagement Quality Dashboard**

**Purpose:** View engagement scores and quality metrics

### Setup Steps:

1. **Go to GA4 → Explore → Blank**
2. **Name:** "PRTD Engagement Quality"
3. **Add Dimensions:**
   - Custom parameter: `slug`
   - Custom parameter: `engagement_quality`
   - Custom parameter: `engagement_score`
   - Custom parameter: `category`

4. **Add Metrics:**
   - Event count
   - Total users

5. **Configuration:**
   - **Rows:** Custom parameter: slug, Custom parameter: engagement_quality
   - **Values:** Event count, Total users
   - **Filters:** Event name = `engagement_quality_score`

6. **Add Contingency Table:**
   - **Rows:** Custom parameter: engagement_quality
   - **Columns:** Custom parameter: category
   - **Values:** Event count

### What You'll See:
- Which deals generate high-quality engagement
- Engagement distribution by category
- Overall engagement scores (0-100)

---

## 📄 **Exploration 4: Section Performance Analysis**

**Purpose:** Analyze how users engage with different content sections

### Setup Steps:

1. **Go to GA4 → Explore → Blank**
2. **Name:** "PRTD Section Performance"
3. **Add Dimensions:**
   - Custom parameter: `slug`
   - Custom parameter: `time_in_section`
   - Custom parameter: `interaction_count`
   - Custom parameter: `section_height`

4. **Add Metrics:**
   - Event count
   - Total users
   - Average session duration

5. **Configuration:**
   - **Rows:** Custom parameter: slug
   - **Values:** Event count, Total users
   - **Filters:** Event name = `section_engagement`

6. **Add Scatter Plot:**
   - **X-axis:** Custom parameter: time_in_section
   - **Y-axis:** Custom parameter: interaction_count
   - **Size:** Event count

### What You'll See:
- Time spent in each content section
- Interaction density per section
- Which deals keep users engaged longest

---

## 🔧 **Advanced Custom Report Setup**

### Create a Custom Dashboard

1. **Go to GA4 → Reports → Library**
2. **Click "Create custom report"**
3. **Add these report cards:**

#### Card 1: Engagement Summary
- **Metric:** Event count
- **Dimension:** Custom parameter: engagement_quality
- **Filter:** Event name = `engagement_quality_score`

#### Card 2: Top Engaging Content
- **Metric:** Event count  
- **Dimension:** Custom parameter: slug
- **Filter:** Event name = `content_engagement`
- **Sort:** Event count (descending)
- **Limit:** 10

#### Card 3: Image Performance
- **Metric:** Event count
- **Dimension:** Custom parameter: slug
- **Filter:** Event name contains `image`

#### Card 4: Reading Patterns
- **Metric:** Event count
- **Dimension:** Custom parameter: interaction_type
- **Filter:** Event name = `content_engagement`

---

## 📈 **Quick Setup Checklist**

- [ ] **Exploration 1:** Content Engagement Overview
- [ ] **Exploration 2:** Image Engagement Analysis  
- [ ] **Exploration 3:** Engagement Quality Dashboard
- [ ] **Exploration 4:** Section Performance Analysis
- [ ] **Custom Dashboard:** Summary report cards
- [ ] **Bookmark reports** for easy access
- [ ] **Set up automated email reports** (optional)

---

## 🎓 **Pro Tips**

### Filter Optimization:
```
Event name exactly matches: content_engagement
Custom parameter: engagement_quality not equal to: (not set)
Custom parameter: slug not equal to: unknown
```

### Calculated Fields:
- **Engagement Rate:** `Event count / Total users`
- **Avg Time per Section:** `Sum(time_in_section) / Event count`
- **Interaction Density:** `Sum(interaction_count) / Sum(time_in_section)`

### Useful Segments:
- **High Engagers:** Users with engagement_quality = "high"
- **Deal Converters:** Users who triggered `click_external_deal`
- **Content Explorers:** Users with 5+ content_engagement events

---

## ⚡ **Quick Access URLs**

After setup, bookmark these direct links:

- **Content Overview:** `https://analytics.google.com/analytics/web/#/analysis/pXXXXXXXXX/edit/REPORT_ID`
- **Image Analysis:** `https://analytics.google.com/analytics/web/#/analysis/pXXXXXXXXX/edit/REPORT_ID`
- **Quality Dashboard:** `https://analytics.google.com/analytics/web/#/analysis/pXXXXXXXXX/edit/REPORT_ID`

Replace `pXXXXXXXXX` with your property ID: `p502239171`

---

## 🚀 **What's Next?**

1. **Generate Test Data:** Visit deal pages and interact with content
2. **Wait 24-48 hours** for data to populate in GA4
3. **Run the data viewer script:** `python3 /home/deploy/prtd/scripts/show-engagement-data.py`
4. **Refine your explorations** based on actual data patterns
5. **Set up automated insights** and alerting

**Need help?** Run the sample data script to see what tracking data looks like before creating explorations.