#!/home/deploy/prtd/analytics-env/bin/python
"""
Sample Engagement Data Viewer for PRTD
Shows what engagement tracking data looks like in GA4
"""

import os
import sys
from datetime import datetime, timedelta
from google.analytics.data_v1beta import BetaAnalyticsDataClient
from google.analytics.data_v1beta.types import (
    RunReportRequest,
    Dimension,
    Metric,
    DateRange,
    FilterExpression,
    Filter
)
from google.oauth2 import service_account

# Configuration
PROPERTY_ID = "502239171"
CREDENTIALS_PATH = "/home/deploy/prtd-ga4-credentials.json"

def initialize_client():
    """Initialize the Analytics Data API client."""
    try:
        credentials = service_account.Credentials.from_service_account_file(
            CREDENTIALS_PATH,
            scopes=['https://www.googleapis.com/auth/analytics.readonly']
        )
        client = BetaAnalyticsDataClient(credentials=credentials)
        print(f"✅ Connected to GA4 property {PROPERTY_ID}")
        return client
    except Exception as e:
        print(f"❌ Failed to initialize client: {e}")
        sys.exit(1)

def get_content_engagement_data(client):
    """Get content engagement tracking data."""
    print("\n📊 CONTENT ENGAGEMENT TRACKING DATA")
    print("=" * 60)
    
    try:
        request = RunReportRequest(
            property=f"properties/{PROPERTY_ID}",
            dimensions=[
                Dimension(name="eventName"),
                Dimension(name="customEvent:slug"),
                Dimension(name="customEvent:category"),
                Dimension(name="customEvent:interaction_type"),
                Dimension(name="customEvent:content_piece")
            ],
            metrics=[
                Metric(name="eventCount"),
                Metric(name="averageSessionDuration"),
                Metric(name="engagementRate")
            ],
            date_ranges=[DateRange(start_date="7daysAgo", end_date="today")],
            dimension_filter=FilterExpression(
                filter=Filter(
                    field_name="eventName",
                    string_filter=Filter.StringFilter(
                        match_type=Filter.StringFilter.MatchType.EXACT,
                        value="content_engagement"
                    )
                )
            ),
            limit=20
        )
        
        response = client.run_report(request=request)
        
        if not response.rows:
            print("ℹ️  No content engagement events found yet")
            print("💡 Visit a deal page and interact with images/text to generate data")
            return
        
        print(f"Found {len(response.rows)} content engagement events:")
        print()
        
        for row in response.rows:
            event_name = row.dimension_values[0].value
            slug = row.dimension_values[1].value or "unknown"
            category = row.dimension_values[2].value or "unknown"
            interaction = row.dimension_values[3].value or "unknown"
            content_piece = row.dimension_values[4].value or "unknown"
            event_count = row.metric_values[0].value
            
            print(f"🎯 {interaction.title()} on {content_piece}")
            print(f"   Deal: {slug} ({category})")
            print(f"   Events: {event_count}")
            print()
            
    except Exception as e:
        print(f"❌ Error fetching content engagement data: {e}")

def get_image_engagement_data(client):
    """Get image engagement tracking data."""
    print("\n🖼️  IMAGE ENGAGEMENT TRACKING DATA")
    print("=" * 60)
    
    try:
        request = RunReportRequest(
            property=f"properties/{PROPERTY_ID}",
            dimensions=[
                Dimension(name="eventName"),
                Dimension(name="customEvent:slug"),
                Dimension(name="customEvent:image_index"),
                Dimension(name="customEvent:view_duration")
            ],
            metrics=[
                Metric(name="eventCount")
            ],
            date_ranges=[DateRange(start_date="7daysAgo", end_date="today")],
            dimension_filter=FilterExpression(
                filter=Filter(
                    field_name="eventName",
                    string_filter=Filter.StringFilter(
                        match_type=Filter.StringFilter.MatchType.CONTAINS,
                        value="image"
                    )
                )
            ),
            limit=15
        )
        
        response = client.run_report(request=request)
        
        if not response.rows:
            print("ℹ️  No image engagement events found yet")
            print("💡 Hover over or click deal images to generate data")
            return
        
        print(f"Found {len(response.rows)} image engagement events:")
        print()
        
        for row in response.rows:
            event_name = row.dimension_values[0].value
            slug = row.dimension_values[1].value or "unknown"
            image_index = row.dimension_values[2].value or "0"
            view_duration = row.dimension_values[3].value or "0"
            event_count = row.metric_values[0].value
            
            print(f"🖼️  {event_name} - Image #{image_index}")
            print(f"   Deal: {slug}")
            print(f"   View time: {view_duration}s")
            print(f"   Events: {event_count}")
            print()
            
    except Exception as e:
        print(f"❌ Error fetching image engagement data: {e}")

def get_section_engagement_data(client):
    """Get section engagement tracking data."""
    print("\n📄 SECTION ENGAGEMENT TRACKING DATA")
    print("=" * 60)
    
    try:
        request = RunReportRequest(
            property=f"properties/{PROPERTY_ID}",
            dimensions=[
                Dimension(name="eventName"),
                Dimension(name="customEvent:slug"),
                Dimension(name="customEvent:time_in_section"),
                Dimension(name="customEvent:interaction_count")
            ],
            metrics=[
                Metric(name="eventCount"),
                Metric(name="totalUsers")
            ],
            date_ranges=[DateRange(start_date="7daysAgo", end_date="today")],
            dimension_filter=FilterExpression(
                filter=Filter(
                    field_name="eventName",
                    string_filter=Filter.StringFilter(
                        match_type=Filter.StringFilter.MatchType.EXACT,
                        value="section_engagement"
                    )
                )
            ),
            limit=15
        )
        
        response = client.run_report(request=request)
        
        if not response.rows:
            print("ℹ️  No section engagement events found yet")
            print("💡 Scroll through deal page sections to generate data")
            return
        
        print(f"Found {len(response.rows)} section engagement events:")
        print()
        
        for row in response.rows:
            slug = row.dimension_values[1].value or "unknown"
            time_in_section = row.dimension_values[2].value or "0"
            interaction_count = row.dimension_values[3].value or "0"
            event_count = row.metric_values[0].value
            users = row.metric_values[1].value
            
            print(f"📄 Section engagement")
            print(f"   Deal: {slug}")
            print(f"   Time in section: {time_in_section}s")
            print(f"   Interactions: {interaction_count}")
            print(f"   Events: {event_count} | Users: {users}")
            print()
            
    except Exception as e:
        print(f"❌ Error fetching section engagement data: {e}")

def get_engagement_scores(client):
    """Get engagement quality scores."""
    print("\n🏆 ENGAGEMENT QUALITY SCORES")
    print("=" * 60)
    
    try:
        request = RunReportRequest(
            property=f"properties/{PROPERTY_ID}",
            dimensions=[
                Dimension(name="eventName"),
                Dimension(name="customEvent:slug"),
                Dimension(name="customEvent:engagement_score"),
                Dimension(name="customEvent:engagement_quality")
            ],
            metrics=[
                Metric(name="eventCount")
            ],
            date_ranges=[DateRange(start_date="7daysAgo", end_date="today")],
            dimension_filter=FilterExpression(
                filter=Filter(
                    field_name="eventName",
                    string_filter=Filter.StringFilter(
                        match_type=Filter.StringFilter.MatchType.EXACT,
                        value="engagement_quality_score"
                    )
                )
            ),
            limit=10
        )
        
        response = client.run_report(request=request)
        
        if not response.rows:
            print("ℹ️  No engagement scores found yet")
            print("💡 Spend time on deal pages to generate engagement scores")
            return
        
        print(f"Found {len(response.rows)} engagement scores:")
        print()
        
        for row in response.rows:
            slug = row.dimension_values[1].value or "unknown"
            score = row.dimension_values[2].value or "0"
            quality = row.dimension_values[3].value or "unknown"
            event_count = row.metric_values[0].value
            
            # Quality emoji
            quality_emoji = "🏆" if quality == "high" else "🥈" if quality == "medium" else "🥉"
            
            print(f"{quality_emoji} {quality.title()} Quality - Score: {score}/100")
            print(f"   Deal: {slug}")
            print(f"   Recorded: {event_count} times")
            print()
            
    except Exception as e:
        print(f"❌ Error fetching engagement scores: {e}")

def show_sample_custom_dimensions(client):
    """Show sample of available custom dimensions data."""
    print("\n🏷️  CUSTOM DIMENSIONS SAMPLE")
    print("=" * 60)
    
    print("Available custom dimensions for analysis:")
    dimensions = [
        ("slug", "Deal/page identifier"),
        ("deal_id", "Unique deal ID"),
        ("vendor_id", "Partner/vendor ID"),
        ("category", "Deal category"),
        ("position", "Element position"),
        ("cta_id", "Call-to-action ID"),
        ("interaction_type", "Type of interaction"),
        ("content_piece", "Content section"),
        ("engagement_quality", "Low/medium/high"),
        ("section_version", "A/B test variant"),
        ("request_id", "Debug trace ID"),
        ("status_code", "Response status")
    ]
    
    for dim, desc in dimensions:
        print(f"📊 customEvent:{dim}")
        print(f"   {desc}")
        print()

def main():
    """Main execution function."""
    print("🔍 PRTD ENGAGEMENT TRACKING DATA VIEWER")
    print(f"Property: {PROPERTY_ID}")
    print(f"Date Range: Last 7 days")
    print("=" * 60)
    
    client = initialize_client()
    
    # Show sample data for each tracking type
    get_content_engagement_data(client)
    get_image_engagement_data(client)
    get_section_engagement_data(client)
    get_engagement_scores(client)
    show_sample_custom_dimensions(client)
    
    print("\n💡 NEXT STEPS:")
    print("1. Visit deal pages and interact with content to generate more data")
    print("2. Use the GA4 exploration setup guide to create custom reports")
    print("3. Run this script again in 24-48 hours to see accumulated data")
    print("\n🔗 Run custom GA4 explorations with the guide in ga4-explorations-setup.md")

if __name__ == "__main__":
    main()