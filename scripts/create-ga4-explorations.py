#!/home/deploy/prtd/analytics-env/bin/python
"""
GA4 Custom Explorations Creator for PRTD
Automatically creates custom explorations for content engagement analytics
"""

import os
import sys
import json
from google.analytics.admin_v1beta import AnalyticsAdminServiceClient
from google.analytics.admin_v1beta.types import (
    CreateDataStreamRequest,
    CreateCustomDimensionRequest,
    CustomDimension
)
from google.oauth2 import service_account
import requests

# Configuration
PROPERTY_ID = "502239171"
CREDENTIALS_PATH = "/home/deploy/prtd-ga4-credentials.json"

def initialize_client():
    """Initialize the Analytics Admin API client."""
    try:
        credentials = service_account.Credentials.from_service_account_file(
            CREDENTIALS_PATH,
            scopes=[
                'https://www.googleapis.com/auth/analytics.edit',
                'https://www.googleapis.com/auth/analytics.readonly'
            ]
        )
        client = AnalyticsAdminServiceClient(credentials=credentials)
        print(f"✅ Connected to GA4 property {PROPERTY_ID}")
        return client, credentials
    except Exception as e:
        print(f"❌ Failed to initialize client: {e}")
        sys.exit(1)

def create_exploration_via_api(credentials, exploration_config):
    """Create a GA4 exploration using the REST API."""
    try:
        # Get access token
        credentials.refresh(requests.Request())
        access_token = credentials.token
        
        # GA4 API endpoint for creating explorations
        url = f"https://analyticsdata.googleapis.com/v1beta/properties/{PROPERTY_ID}:runReport"
        
        headers = {
            'Authorization': f'Bearer {access_token}',
            'Content-Type': 'application/json'
        }
        
        # Note: GA4 doesn't have a direct API for creating saved explorations
        # We'll create a template that users can import or we'll use a workaround
        print(f"⚠️  Note: GA4 Admin API doesn't support creating saved explorations directly")
        print(f"💡 Creating exploration configuration that can be imported...")
        
        return exploration_config
        
    except Exception as e:
        print(f"❌ Error creating exploration: {e}")
        return None

def generate_exploration_configs():
    """Generate configuration for all 4 explorations."""
    
    explorations = []
    
    # 1. Content Engagement Overview
    content_engagement = {
        "name": "PRTD Content Engagement Overview",
        "description": "Comprehensive view of all content interactions across the site",
        "type": "EXPLORATION",
        "config": {
            "dimensions": [
                {"name": "eventName"},
                {"name": "customEvent:slug"},
                {"name": "customEvent:interaction_type"},
                {"name": "customEvent:content_piece"},
                {"name": "customEvent:category"}
            ],
            "metrics": [
                {"name": "eventCount"},
                {"name": "totalUsers"},
                {"name": "averageSessionDuration"}
            ],
            "filters": [
                {
                    "fieldName": "eventName",
                    "operation": "EXACT",
                    "value": "content_engagement"
                }
            ],
            "dateRange": {
                "startDate": "30daysAgo",
                "endDate": "today"
            },
            "layout": {
                "rows": ["eventName", "customEvent:interaction_type"],
                "columns": ["customEvent:content_piece"],
                "values": ["eventCount"]
            }
        }
    }
    
    # 2. Image Engagement Analysis
    image_engagement = {
        "name": "PRTD Image Engagement Analysis",
        "description": "Track image interaction patterns and view times",
        "type": "EXPLORATION",
        "config": {
            "dimensions": [
                {"name": "eventName"},
                {"name": "customEvent:slug"},
                {"name": "customEvent:vendor_id"},
                {"name": "customEvent:category"}
            ],
            "metrics": [
                {"name": "eventCount"},
                {"name": "totalUsers"},
                {"name": "engagementRate"}
            ],
            "filters": [
                {
                    "fieldName": "eventName",
                    "operation": "CONTAINS",
                    "value": "image"
                }
            ],
            "dateRange": {
                "startDate": "30daysAgo",
                "endDate": "today"
            },
            "layout": {
                "rows": ["customEvent:slug"],
                "columns": ["eventName"],
                "values": ["eventCount", "totalUsers"]
            }
        }
    }
    
    # 3. Engagement Quality Dashboard
    quality_dashboard = {
        "name": "PRTD Engagement Quality Dashboard",
        "description": "View engagement scores and quality metrics",
        "type": "EXPLORATION",
        "config": {
            "dimensions": [
                {"name": "customEvent:slug"},
                {"name": "customEvent:category"},
                {"name": "customEvent:vendor_id"}
            ],
            "metrics": [
                {"name": "eventCount"},
                {"name": "totalUsers"},
                {"name": "engagementRate"}
            ],
            "filters": [
                {
                    "fieldName": "eventName",
                    "operation": "EXACT",
                    "value": "engagement_quality_score"
                }
            ],
            "dateRange": {
                "startDate": "30daysAgo",
                "endDate": "today"
            },
            "layout": {
                "rows": ["customEvent:slug"],
                "columns": ["customEvent:category"],
                "values": ["eventCount", "totalUsers"]
            }
        }
    }
    
    # 4. Section Performance Analysis
    section_performance = {
        "name": "PRTD Section Performance Analysis",
        "description": "Analyze how users engage with different content sections",
        "type": "EXPLORATION",
        "config": {
            "dimensions": [
                {"name": "customEvent:slug"},
                {"name": "customEvent:category"},
                {"name": "customEvent:cta_id"}
            ],
            "metrics": [
                {"name": "eventCount"},
                {"name": "totalUsers"},
                {"name": "averageSessionDuration"}
            ],
            "filters": [
                {
                    "fieldName": "eventName",
                    "operation": "EXACT",
                    "value": "section_engagement"
                }
            ],
            "dateRange": {
                "startDate": "30daysAgo",
                "endDate": "today"
            },
            "layout": {
                "rows": ["customEvent:slug"],
                "values": ["eventCount", "totalUsers"]
            }
        }
    }
    
    return [content_engagement, image_engagement, quality_dashboard, section_performance]

def create_exploration_templates():
    """Create importable exploration templates."""
    print("\n🎯 CREATING GA4 EXPLORATION TEMPLATES")
    print("=" * 60)
    
    explorations = generate_exploration_configs()
    
    # Create templates directory
    templates_dir = "/home/deploy/prtd/ga4-exploration-templates"
    os.makedirs(templates_dir, exist_ok=True)
    
    for i, exploration in enumerate(explorations, 1):
        template_file = f"{templates_dir}/{exploration['name'].lower().replace(' ', '_')}.json"
        
        # Save template configuration
        with open(template_file, 'w') as f:
            json.dump(exploration, f, indent=2)
        
        print(f"✅ Created template {i}: {exploration['name']}")
        print(f"   File: {template_file}")
        print(f"   Description: {exploration['description']}")
        print()
    
    return explorations

def create_looker_studio_template(credentials):
    """Create a Looker Studio dashboard template."""
    print("\n📊 CREATING LOOKER STUDIO DASHBOARD TEMPLATE")
    print("=" * 60)
    
    # Looker Studio dashboard configuration
    dashboard_config = {
        "title": "PRTD Content Engagement Analytics",
        "description": "Comprehensive dashboard for content engagement tracking",
        "data_source": {
            "type": "GOOGLE_ANALYTICS_4",
            "property_id": PROPERTY_ID,
            "credentials": "oauth"
        },
        "charts": [
            {
                "title": "Engagement Quality Distribution",
                "type": "PIE_CHART",
                "dimension": "customEvent:engagement_quality",
                "metric": "eventCount",
                "filter": "eventName == 'engagement_quality_score'"
            },
            {
                "title": "Top Performing Deals",
                "type": "BAR_CHART",
                "dimension": "customEvent:slug",
                "metric": "eventCount",
                "filter": "eventName == 'content_engagement'",
                "limit": 10
            },
            {
                "title": "Content Interaction Types",
                "type": "TABLE",
                "dimensions": ["customEvent:interaction_type", "customEvent:content_piece"],
                "metrics": ["eventCount", "totalUsers"],
                "filter": "eventName == 'content_engagement'"
            },
            {
                "title": "Image Engagement by Deal",
                "type": "LINE_CHART",
                "dimension": "date",
                "metric": "eventCount",
                "secondary_dimension": "customEvent:slug",
                "filter": "eventName CONTAINS 'image'"
            }
        ]
    }
    
    # Save Looker Studio template
    template_file = "/home/deploy/prtd/ga4-exploration-templates/looker_studio_dashboard.json"
    with open(template_file, 'w') as f:
        json.dump(dashboard_config, f, indent=2)
    
    print(f"✅ Created Looker Studio template: {template_file}")
    print("💡 Import this template in Looker Studio for advanced visualizations")
    
    return dashboard_config

def generate_manual_setup_guide():
    """Generate step-by-step manual setup guide with exact configurations."""
    print("\n📋 GENERATING MANUAL SETUP GUIDE")
    print("=" * 60)
    
    guide_content = """# GA4 Explorations Manual Setup Guide

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

"""
    
    guide_file = "/home/deploy/prtd/ga4-exploration-templates/MANUAL_SETUP_GUIDE.md"
    with open(guide_file, 'w') as f:
        f.write(guide_content)
    
    print(f"✅ Created manual setup guide: {guide_file}")
    return guide_file

def main():
    """Main execution function."""
    print("🚀 GA4 CUSTOM EXPLORATIONS CREATOR FOR PRTD")
    print(f"Property ID: {PROPERTY_ID}")
    print("=" * 60)
    
    # Initialize client
    client, credentials = initialize_client()
    
    # Create exploration templates
    explorations = create_exploration_templates()
    
    # Create Looker Studio template
    create_looker_studio_template(credentials)
    
    # Generate manual setup guide
    guide_file = generate_manual_setup_guide()
    
    print("\n🎉 EXPLORATION SETUP COMPLETE!")
    print("=" * 60)
    print("Since GA4 Admin API doesn't support creating saved explorations directly,")
    print("I've created comprehensive templates and guides for manual setup:")
    print()
    print("📁 Templates created in: /home/deploy/prtd/ga4-exploration-templates/")
    print("📋 Manual setup guide: MANUAL_SETUP_GUIDE.md")
    print("📊 Looker Studio template: looker_studio_dashboard.json")
    print()
    print("⚡ QUICK SETUP:")
    print("1. Open GA4 → Explore → Blank")
    print("2. Follow the exact configurations in MANUAL_SETUP_GUIDE.md")
    print("3. Each exploration takes ~2-3 minutes to set up")
    print()
    print("🔗 Direct GA4 link:")
    print(f"https://analytics.google.com/analytics/web/#/p{PROPERTY_ID}/explore")
    print()
    print("💡 Run 'prtd-engagement' to check current data before creating explorations")

if __name__ == "__main__":
    main()