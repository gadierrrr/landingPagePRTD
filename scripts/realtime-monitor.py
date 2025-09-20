#!/home/deploy/prtd/analytics-env/bin/python
"""
Real-time Analytics Monitor for PRTD
Continuously monitors GA4 real-time data for tracking validation
"""

import os
import time
import json
import datetime
from typing import Dict, List
from google.analytics.data_v1beta import BetaAnalyticsDataClient
from google.analytics.data_v1beta.types import (
    RunRealtimeReportRequest,
    Dimension,
    Metric,
    MinuteRange
)
from google.oauth2 import service_account

class PRTDRealtimeMonitor:
    def __init__(self, property_id: str, credentials_path: str):
        """Initialize the real-time monitor."""
        self.property_id = property_id
        self.property_name = f"properties/{property_id}"
        
        # Set up credentials
        credentials = service_account.Credentials.from_service_account_file(
            credentials_path,
            scopes=['https://www.googleapis.com/auth/analytics.readonly']
        )
        
        # Initialize the client
        self.client = BetaAnalyticsDataClient(credentials=credentials)
        
        # Event tracking state
        self.event_history = []
        self.alert_thresholds = {
            'click_external_deal': 1,  # Alert on any external clicks
            'generate_lead': 1,        # Alert on partner form submissions
            'conversion': 1,           # Alert on conversions
            'page_view': 10,          # Alert if page views spike
        }
    
    def get_realtime_data(self) -> Dict:
        """Get current real-time analytics data."""
        request = RunRealtimeReportRequest(
            property=self.property_name,
            dimensions=[
                Dimension(name="eventName"),
                Dimension(name="country"),
                Dimension(name="deviceCategory"),
                Dimension(name="pagePath"),
                Dimension(name="pageTitle")
            ],
            metrics=[
                Metric(name="activeUsers"),
                Metric(name="eventCount")
            ],
            minute_ranges=[MinuteRange(start_minutes_ago=5, end_minutes_ago=0)]
        )
        
        try:
            response = self.client.run_realtime_report(request=request)
            return self._process_realtime_response(response)
        except Exception as e:
            return {"error": f"Failed to get real-time data: {str(e)}"}
    
    def get_deal_activity(self) -> Dict:
        """Get real-time deal-specific activity."""
        request = RunRealtimeReportRequest(
            property=self.property_name,
            dimensions=[
                Dimension(name="eventName"),
                Dimension(name="customEvent:deal_id"),
                Dimension(name="customEvent:deal_category"),
                Dimension(name="customEvent:partner"),
                Dimension(name="customEvent:click_id")
            ],
            metrics=[
                Metric(name="eventCount"),
                Metric(name="activeUsers")
            ],
            minute_ranges=[MinuteRange(start_minutes_ago=10, end_minutes_ago=0)]
        )
        
        try:
            response = self.client.run_realtime_report(request=request)
            return self._process_deal_activity(response)
        except Exception as e:
            return {"error": f"Failed to get deal activity: {str(e)}"}
    
    def monitor_events(self, duration_minutes: int = 30, check_interval: int = 30):
        """Monitor events for a specified duration."""
        print(f"🔍 Starting real-time monitoring for {duration_minutes} minutes...")
        print(f"⏱️  Checking every {check_interval} seconds\n")
        
        start_time = time.time()
        end_time = start_time + (duration_minutes * 60)
        
        while time.time() < end_time:
            timestamp = datetime.datetime.now().strftime("%H:%M:%S")
            
            # Get real-time data
            realtime_data = self.get_realtime_data()
            deal_activity = self.get_deal_activity()
            
            # Display current status
            self._display_realtime_status(timestamp, realtime_data, deal_activity)
            
            # Check for alerts
            self._check_alerts(realtime_data, deal_activity)
            
            # Store event history
            self.event_history.append({
                "timestamp": timestamp,
                "realtime_data": realtime_data,
                "deal_activity": deal_activity
            })
            
            # Wait for next check
            time.sleep(check_interval)
        
        print(f"\n✅ Monitoring complete. Processed {len(self.event_history)} data points.")
        return self.event_history
    
    def _process_realtime_response(self, response) -> Dict:
        """Process real-time API response."""
        data = {
            "active_users": 0,
            "events": {},
            "countries": {},
            "devices": {},
            "pages": {},
            "total_events": 0
        }
        
        for row in response.rows:
            event_name = row.dimension_values[0].value
            country = row.dimension_values[1].value
            device = row.dimension_values[2].value
            page_path = row.dimension_values[3].value
            page_title = row.dimension_values[4].value
            
            active_users = int(row.metric_values[0].value)
            event_count = int(row.metric_values[1].value)
            
            # Aggregate data
            data["active_users"] += active_users
            data["total_events"] += event_count
            
            # Event breakdown
            data["events"][event_name] = data["events"].get(event_name, 0) + event_count
            data["countries"][country] = data["countries"].get(country, 0) + active_users
            data["devices"][device] = data["devices"].get(device, 0) + active_users
            data["pages"][page_path] = data["pages"].get(page_path, 0) + event_count
        
        return data
    
    def _process_deal_activity(self, response) -> Dict:
        """Process deal-specific activity."""
        deals = {}
        conversions = []
        
        for row in response.rows:
            event_name = row.dimension_values[0].value
            deal_id = row.dimension_values[1].value
            category = row.dimension_values[2].value
            partner = row.dimension_values[3].value
            click_id = row.dimension_values[4].value
            
            event_count = int(row.metric_values[0].value)
            
            if deal_id and deal_id != "(not set)":
                if deal_id not in deals:
                    deals[deal_id] = {
                        "category": category,
                        "partner": partner,
                        "events": {},
                        "total_events": 0
                    }
                
                deals[deal_id]["events"][event_name] = event_count
                deals[deal_id]["total_events"] += event_count
                
                # Track conversions separately
                if event_name in ["click_external_deal", "conversion"]:
                    conversions.append({
                        "deal_id": deal_id,
                        "category": category,
                        "partner": partner,
                        "event": event_name,
                        "click_id": click_id,
                        "count": event_count
                    })
        
        return {
            "deals": deals,
            "conversions": conversions,
            "total_deals": len(deals),
            "total_conversions": len(conversions)
        }
    
    def _display_realtime_status(self, timestamp: str, realtime_data: Dict, deal_activity: Dict):
        """Display current real-time status."""
        print(f"\n🕐 {timestamp} - Real-time Status")
        print("=" * 50)
        
        if "error" in realtime_data:
            print(f"❌ Error: {realtime_data['error']}")
            return
        
        # Basic metrics
        print(f"👥 Active Users: {realtime_data['active_users']}")
        print(f"📊 Total Events: {realtime_data['total_events']}")
        
        # Top events
        if realtime_data['events']:
            print(f"\n📈 Top Events (last 5 minutes):")
            sorted_events = sorted(realtime_data['events'].items(), 
                                 key=lambda x: x[1], reverse=True)[:5]
            for event, count in sorted_events:
                print(f"  • {event}: {count}")
        
        # Deal activity
        if not deal_activity.get("error") and deal_activity.get("deals"):
            print(f"\n🎯 Deal Activity:")
            print(f"  • Active Deals: {deal_activity['total_deals']}")
            print(f"  • Conversions: {deal_activity['total_conversions']}")
            
            if deal_activity["conversions"]:
                print("  🔥 Recent Conversions:")
                for conv in deal_activity["conversions"][-3:]:  # Show last 3
                    print(f"    → {conv['event']}: {conv['deal_id']} ({conv['category']})")
        
        # Countries
        if realtime_data['countries']:
            print(f"\n🌍 Top Countries:")
            sorted_countries = sorted(realtime_data['countries'].items(), 
                                    key=lambda x: x[1], reverse=True)[:3]
            for country, users in sorted_countries:
                print(f"  • {country}: {users} users")
    
    def _check_alerts(self, realtime_data: Dict, deal_activity: Dict):
        """Check for alerts based on thresholds."""
        alerts = []
        
        # Check event thresholds
        for event, threshold in self.alert_thresholds.items():
            count = realtime_data.get('events', {}).get(event, 0)
            if count >= threshold:
                alerts.append(f"🚨 {event}: {count} events (threshold: {threshold})")
        
        # Check for new conversions
        if deal_activity.get('conversions'):
            for conv in deal_activity['conversions']:
                alerts.append(f"💰 CONVERSION: {conv['deal_id']} -> {conv['partner']}")
        
        # Display alerts
        if alerts:
            print(f"\n🔔 ALERTS:")
            for alert in alerts:
                print(f"  {alert}")
    
    def generate_summary_report(self) -> Dict:
        """Generate a summary report from monitoring session."""
        if not self.event_history:
            return {"error": "No monitoring data available"}
        
        # Aggregate data
        total_users = 0
        total_events = 0
        all_events = {}
        all_conversions = []
        
        for entry in self.event_history:
            rt_data = entry.get("realtime_data", {})
            deal_data = entry.get("deal_activity", {})
            
            total_users = max(total_users, rt_data.get("active_users", 0))
            total_events += rt_data.get("total_events", 0)
            
            # Aggregate events
            for event, count in rt_data.get("events", {}).items():
                all_events[event] = all_events.get(event, 0) + count
            
            # Collect conversions
            all_conversions.extend(deal_data.get("conversions", []))
        
        return {
            "monitoring_duration": len(self.event_history),
            "peak_active_users": total_users,
            "total_events_observed": total_events,
            "event_breakdown": all_events,
            "total_conversions": len(all_conversions),
            "conversion_details": all_conversions,
            "health_status": "🟢 HEALTHY" if total_events > 0 else "🟡 LOW_ACTIVITY"
        }

def main():
    """Main monitoring function."""
    # Configuration
    credentials_path = os.getenv('GOOGLE_APPLICATION_CREDENTIALS', '/home/deploy/prtd-ga4-credentials.json')
    property_id = os.getenv('GA4_PROPERTY_ID')
    
    if not property_id:
        print("❌ GA4_PROPERTY_ID environment variable not set!")
        return
    
    if not os.path.exists(credentials_path):
        print(f"❌ Credentials file not found: {credentials_path}")
        return
    
    # Initialize monitor
    monitor = PRTDRealtimeMonitor(property_id, credentials_path)
    
    # Parse command line arguments
    import sys
    duration = int(sys.argv[1]) if len(sys.argv) > 1 else 30
    interval = int(sys.argv[2]) if len(sys.argv) > 2 else 30
    
    try:
        # Start monitoring
        history = monitor.monitor_events(duration, interval)
        
        # Generate summary
        summary = monitor.generate_summary_report()
        
        # Save results
        timestamp = datetime.datetime.now().strftime('%Y%m%d-%H%M%S')
        output_file = f"/home/deploy/prtd/realtime-monitor-{timestamp}.json"
        
        with open(output_file, 'w') as f:
            json.dump({
                "summary": summary,
                "detailed_history": history
            }, f, indent=2)
        
        print(f"\n📁 Monitoring results saved to: {output_file}")
        
        # Display final summary
        print("\n📊 MONITORING SUMMARY")
        print("=" * 50)
        print(f"Peak Users: {summary['peak_active_users']}")
        print(f"Total Events: {summary['total_events_observed']}")
        print(f"Conversions: {summary['total_conversions']}")
        print(f"Status: {summary['health_status']}")
        
    except KeyboardInterrupt:
        print("\n⏹️  Monitoring stopped by user")
    except Exception as e:
        print(f"\n❌ Monitoring failed: {str(e)}")

if __name__ == "__main__":
    main()