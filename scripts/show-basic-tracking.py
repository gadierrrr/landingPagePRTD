#!/home/deploy/prtd/analytics-env/bin/python
"""
Basic Tracking Data Viewer for PRTD
Shows current analytics data and demonstrates what will be tracked
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

def get_current_events(client):
    """Get current events being tracked."""
    print("\n📊 CURRENT TRACKING EVENTS (Last 7 days)")
    print("=" * 60)
    
    try:
        request = RunReportRequest(
            property=f"properties/{PROPERTY_ID}",
            dimensions=[
                Dimension(name="eventName"),
                Dimension(name="customEvent:slug"),
                Dimension(name="customEvent:deal_id"),
                Dimension(name="customEvent:category")
            ],
            metrics=[
                Metric(name="eventCount"),
                Metric(name="totalUsers")
            ],
            date_ranges=[DateRange(start_date="7daysAgo", end_date="today")],
            limit=50
        )
        
        response = client.run_report(request=request)
        
        if not response.rows:
            print("ℹ️  No events found in the last 7 days")
            print("💡 Visit your site to generate tracking data")
            return
        
        print(f"Found {len(response.rows)} different event types:")
        print()
        
        # Group events by type
        event_summary = {}
        for row in response.rows:
            event_name = row.dimension_values[0].value
            event_count = int(row.metric_values[0].value)
            users = int(row.metric_values[1].value)
            
            if event_name not in event_summary:
                event_summary[event_name] = {'count': 0, 'users': 0}
            event_summary[event_name]['count'] += event_count
            event_summary[event_name]['users'] += users
        
        # Sort by event count
        sorted_events = sorted(event_summary.items(), key=lambda x: x[1]['count'], reverse=True)
        
        for event_name, data in sorted_events:
            emoji = get_event_emoji(event_name)
            print(f"{emoji} {event_name}")
            print(f"   Events: {data['count']:,} | Users: {data['users']:,}")
            print()
            
    except Exception as e:
        print(f"❌ Error fetching current events: {e}")

def get_deal_performance(client):
    """Get deal-specific performance data."""
    print("\n🎯 DEAL PERFORMANCE (Last 7 days)")
    print("=" * 60)
    
    try:
        request = RunReportRequest(
            property=f"properties/{PROPERTY_ID}",
            dimensions=[
                Dimension(name="customEvent:slug"),
                Dimension(name="customEvent:category"),
                Dimension(name="eventName")
            ],
            metrics=[
                Metric(name="eventCount"),
                Metric(name="totalUsers")
            ],
            date_ranges=[DateRange(start_date="7daysAgo", end_date="today")],
            dimension_filter=FilterExpression(
                filter=Filter(
                    field_name="customEvent:slug",
                    string_filter=Filter.StringFilter(
                        match_type=Filter.StringFilter.MatchType.PARTIAL_REGEXP,
                        value="."  # Any non-empty slug
                    )
                )
            ),
            limit=20
        )
        
        response = client.run_report(request=request)
        
        if not response.rows:
            print("ℹ️  No deal-specific data found yet")
            print("💡 Visit deal pages to generate tracking data")
            return
        
        # Group by deal
        deal_summary = {}
        for row in response.rows:
            slug = row.dimension_values[0].value or "unknown"
            category = row.dimension_values[1].value or "unknown"
            event_name = row.dimension_values[2].value
            event_count = int(row.metric_values[0].value)
            users = int(row.metric_values[1].value)
            
            if slug not in deal_summary:
                deal_summary[slug] = {
                    'category': category,
                    'events': {},
                    'total_events': 0,
                    'total_users': 0
                }
            
            if event_name not in deal_summary[slug]['events']:
                deal_summary[slug]['events'][event_name] = 0
            
            deal_summary[slug]['events'][event_name] += event_count
            deal_summary[slug]['total_events'] += event_count
            deal_summary[slug]['total_users'] += users
        
        # Sort by total events
        sorted_deals = sorted(deal_summary.items(), key=lambda x: x[1]['total_events'], reverse=True)
        
        print(f"Top {min(10, len(sorted_deals))} performing deals:")
        print()
        
        for slug, data in sorted_deals[:10]:
            print(f"🏨 {slug} ({data['category']})")
            print(f"   Total Events: {data['total_events']:,} | Users: {data['total_users']:,}")
            
            # Show top events for this deal
            top_events = sorted(data['events'].items(), key=lambda x: x[1], reverse=True)[:3]
            for event_name, count in top_events:
                emoji = get_event_emoji(event_name)
                print(f"   {emoji} {event_name}: {count:,}")
            print()
            
    except Exception as e:
        print(f"❌ Error fetching deal performance: {e}")

def get_conversion_data(client):
    """Get conversion and engagement data."""
    print("\n💰 CONVERSION TRACKING (Last 7 days)")
    print("=" * 60)
    
    try:
        request = RunReportRequest(
            property=f"properties/{PROPERTY_ID}",
            dimensions=[
                Dimension(name="eventName"),
                Dimension(name="customEvent:vendor_id"),
                Dimension(name="customEvent:cta_id")
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
                        match_type=Filter.StringFilter.MatchType.IN_LIST,
                        value="click_external_deal,conversion,generate_lead,share"
                    )
                )
            ),
            limit=30
        )
        
        response = client.run_report(request=request)
        
        if not response.rows:
            print("ℹ️  No conversion events found yet")
            print("💡 Click 'Get This Deal' buttons to generate conversion data")
            return
        
        conversion_summary = {}
        for row in response.rows:
            event_name = row.dimension_values[0].value
            vendor_id = row.dimension_values[1].value or "unknown"
            cta_id = row.dimension_values[2].value or "unknown"
            event_count = int(row.metric_values[0].value)
            users = int(row.metric_values[1].value)
            
            if event_name not in conversion_summary:
                conversion_summary[event_name] = {'count': 0, 'users': 0, 'vendors': {}}
            
            conversion_summary[event_name]['count'] += event_count
            conversion_summary[event_name]['users'] += users
            
            if vendor_id not in conversion_summary[event_name]['vendors']:
                conversion_summary[event_name]['vendors'][vendor_id] = 0
            conversion_summary[event_name]['vendors'][vendor_id] += event_count
        
        for event_name, data in conversion_summary.items():
            emoji = get_event_emoji(event_name)
            print(f"{emoji} {event_name}")
            print(f"   Events: {data['count']:,} | Users: {data['users']:,}")
            
            # Show top vendors
            top_vendors = sorted(data['vendors'].items(), key=lambda x: x[1], reverse=True)[:3]
            for vendor, count in top_vendors:
                print(f"   📊 {vendor}: {count:,} events")
            print()
            
    except Exception as e:
        print(f"❌ Error fetching conversion data: {e}")

def get_event_emoji(event_name):
    """Get emoji for event type."""
    emoji_map = {
        'page_view': '👁️',
        'view_item': '🏨',
        'click_external_deal': '💰',
        'conversion': '✅',
        'share': '📤',
        'scroll': '📜',
        'session_start': '🚀',
        'first_visit': '👋',
        'user_engagement': '👤',
        'content_engagement': '🎯',
        'image_engagement': '🖼️',
        'text_engagement': '📝',
        'section_engagement': '📄',
        'engagement_quality_score': '🏆',
        'generate_lead': '📋',
        'select_item': '👆'
    }
    return emoji_map.get(event_name, '📊')

def show_tracking_examples():
    """Show examples of what will be tracked."""
    print("\n🎯 CONTENT ENGAGEMENT TRACKING EXAMPLES")
    print("=" * 60)
    
    examples = [
        {
            'event': 'content_engagement',
            'trigger': 'User hovers over deal image',
            'data': {
                'interaction_type': 'image_hover',
                'content_piece': 'deal_gallery',
                'slug': 'marriott-deal-50-off',
                'category': 'hotels',
                'engagement_depth': '10'
            }
        },
        {
            'event': 'content_engagement',
            'trigger': 'User selects text in highlights section',
            'data': {
                'interaction_type': 'text_selection',
                'content_piece': 'highlights',
                'selection_length': '45',
                'reading_time': '12.5'
            }
        },
        {
            'event': 'engagement_quality_score',
            'trigger': 'User completes page interaction',
            'data': {
                'engagement_score': '75',
                'engagement_quality': 'high',
                'time_score': '20',
                'interaction_score': '25'
            }
        }
    ]
    
    for i, example in enumerate(examples, 1):
        print(f"Example {i}: {example['trigger']}")
        print(f"📊 Event: {example['event']}")
        for key, value in example['data'].items():
            print(f"   {key}: {value}")
        print()

def main():
    """Main execution function."""
    print("🔍 PRTD ANALYTICS TRACKING OVERVIEW")
    print(f"Property: {PROPERTY_ID}")
    print(f"Date Range: Last 7 days")
    print("=" * 60)
    
    client = initialize_client()
    
    # Show current tracking data
    get_current_events(client)
    get_deal_performance(client)
    get_conversion_data(client)
    
    # Show what the new tracking will capture
    show_tracking_examples()
    
    print("\n💡 NEXT STEPS:")
    print("1. 📖 Read the GA4 explorations setup guide: ga4-explorations-setup.md")
    print("2. 🌐 Visit deal pages and interact with content (hover, click, select text)")
    print("3. ⏰ Wait 24-48 hours for data to populate in GA4")
    print("4. 📊 Create custom explorations using the guide")
    print("5. 🔄 Run this script again to see new engagement data")
    
    print(f"\n🔗 GA4 Property URL:")
    print(f"https://analytics.google.com/analytics/web/#/p{PROPERTY_ID}/reports/intelligenthome")

if __name__ == "__main__":
    main()
