#!/home/deploy/prtd/analytics-env/bin/python
"""
Analytics Validation Script for PRTD
Validates GA4 tracking implementation via direct API calls
"""

import os
import json
import datetime
from pathlib import Path
from google.analytics.data_v1beta import BetaAnalyticsDataClient
from google.analytics.data_v1beta.types import (
    RunReportRequest,
    RunRealtimeReportRequest,
    Dimension,
    Metric,
    DateRange,
    MinuteRange
)
from google.oauth2 import service_account

class PRTDAnalyticsValidator:
    def __init__(self, property_id: str, credentials_path: str):
        """Initialize the analytics validator."""
        self.property_id = property_id
        self.property_name = f"properties/{property_id}"
        
        # Set up credentials
        credentials = service_account.Credentials.from_service_account_file(
            credentials_path,
            scopes=['https://www.googleapis.com/auth/analytics.readonly']
        )
        
        # Initialize the client
        self.client = BetaAnalyticsDataClient(credentials=credentials)
    
    def validate_core_events(self, days_back: int = 7) -> dict:
        """Validate core tracking events are firing."""
        print(f"🔍 Validating core events for last {days_back} days...")
        
        # Define the events we expect to see
        expected_events = [
            'page_view',
            'view_item',
            'select_content', 
            'click_external_deal',
            'conversion',
            'share',
            'scroll',
            'generate_lead'
        ]
        
        request = RunReportRequest(
            property=self.property_name,
            dimensions=[
                Dimension(name="eventName")
            ],
            metrics=[
                Metric(name="eventCount"),
                Metric(name="eventCountPerUser")
            ],
            date_ranges=[DateRange(
                start_date=f"{days_back}daysAgo",
                end_date="today"
            )],
            dimension_filter=self._create_event_filter(expected_events)
        )
        
        try:
            response = self.client.run_report(request=request)
            return self._process_event_validation(response, expected_events)
        except Exception as e:
            return {"error": f"Failed to validate events: {str(e)}"}
    
    def validate_deal_tracking(self, days_back: int = 7) -> dict:
        """Validate deal-specific tracking metrics."""
        print(f"📊 Validating deal tracking for last {days_back} days...")
        
        request = RunReportRequest(
            property=self.property_name,
            dimensions=[
                Dimension(name="eventName")
            ],
            metrics=[
                Metric(name="eventCount"),
                Metric(name="totalUsers"),
                Metric(name="eventValue")
            ],
            date_ranges=[DateRange(
                start_date=f"{days_back}daysAgo",
                end_date="today"
            )],
            dimension_filter=self._create_deal_filter()
        )
        
        try:
            response = self.client.run_report(request=request)
            return self._process_deal_validation(response)
        except Exception as e:
            return {"error": f"Failed to validate deal tracking: {str(e)}"}
    
    def check_realtime_activity(self) -> dict:
        """Check real-time analytics activity."""
        print("⚡ Checking real-time activity...")
        
        try:
            # First call: Get global metrics without dimensions
            global_request = RunRealtimeReportRequest(
                property=self.property_name,
                dimensions=[],
                metrics=[
                    Metric(name="activeUsers"),
                    Metric(name="eventCount")
                ],
                minute_ranges=[MinuteRange(start_minutes_ago=29, end_minutes_ago=0)]
            )
            global_response = self.client.run_realtime_report(request=global_request)
            
            # Second call: Get breakdown by country/device
            breakdown_request = RunRealtimeReportRequest(
                property=self.property_name,
                dimensions=[
                    Dimension(name="country"),
                    Dimension(name="deviceCategory")
                ],
                metrics=[
                    Metric(name="activeUsers")
                ],
                minute_ranges=[MinuteRange(start_minutes_ago=29, end_minutes_ago=0)]
            )
            breakdown_response = self.client.run_realtime_report(request=breakdown_request)
            
            return self._process_realtime_data(global_response, breakdown_response)
        except Exception as e:
            return {"error": f"Failed to get realtime data: {str(e)}"}
    
    def validate_conversion_funnel(self, days_back: int = 7) -> dict:
        """Validate the conversion funnel: View → Click → External Click."""
        print(f"🔄 Validating conversion funnel for last {days_back} days...")
        
        funnel_events = ['view_item', 'select_content', 'click_external_deal']
        
        request = RunReportRequest(
            property=self.property_name,
            dimensions=[
                Dimension(name="eventName")
            ],
            metrics=[
                Metric(name="eventCount"),
                Metric(name="totalUsers")
            ],
            date_ranges=[DateRange(
                start_date=f"{days_back}daysAgo",
                end_date="today"
            )],
            dimension_filter=self._create_event_filter(funnel_events)
        )
        
        try:
            response = self.client.run_report(request=request)
            return self._process_funnel_validation(response)
        except Exception as e:
            return {"error": f"Failed to validate conversion funnel: {str(e)}"}
    
    def validate_partner_attribution(self, days_back: int = 7) -> dict:
        """Validate partner attribution tracking."""
        print(f"🤝 Validating partner attribution for last {days_back} days...")
        
        request = RunReportRequest(
            property=self.property_name,
            dimensions=[
                Dimension(name="eventName"),
                Dimension(name="sourceMedium")
            ],
            metrics=[
                Metric(name="eventCount")
            ],
            date_ranges=[DateRange(
                start_date=f"{days_back}daysAgo",
                end_date="today"
            )],
            dimension_filter=self._create_partner_filter()
        )
        
        try:
            response = self.client.run_report(request=request)
            return self._process_partner_validation(response)
        except Exception as e:
            return {"error": f"Failed to validate partner attribution: {str(e)}"}
    
    def _create_event_filter(self, events: list):
        """Create filter for specific events."""
        from google.analytics.data_v1beta.types import FilterExpression, Filter, FilterExpressionList
        
        if len(events) == 1:
            return FilterExpression(
                filter=Filter(
                    field_name="eventName",
                    string_filter=Filter.StringFilter(value=events[0])
                )
            )
        
        # Multiple events - use OR filter
        expressions = []
        for event in events:
            expressions.append(
                FilterExpression(
                    filter=Filter(
                        field_name="eventName",
                        string_filter=Filter.StringFilter(value=event)
                    )
                )
            )
        
        return FilterExpression(
            or_group=FilterExpressionList(
                expressions=expressions
            )
        )
    
    def _create_deal_filter(self):
        """Create filter for deal-related events."""
        deal_events = ['view_item', 'select_content', 'click_external_deal']
        return self._create_event_filter(deal_events)
    
    def _create_partner_filter(self):
        """Create filter for partner attribution events."""
        return self._create_event_filter(['click_external_deal', 'conversion'])
    
    def _process_event_validation(self, response, expected_events: list) -> dict:
        """Process event validation response."""
        found_events = set()
        event_counts = {}
        
        for row in response.rows:
            event_name = row.dimension_values[0].value
            event_count = int(row.metric_values[0].value)
            
            found_events.add(event_name)
            event_counts[event_name] = event_counts.get(event_name, 0) + event_count
        
        missing_events = set(expected_events) - found_events
        
        return {
            "total_events_tracked": len(found_events),
            "expected_events": len(expected_events),
            "found_events": list(found_events),
            "missing_events": list(missing_events),
            "event_counts": event_counts,
            "validation_status": "✅ PASS" if len(missing_events) == 0 else "⚠️  WARNING",
            "summary": f"Found {len(found_events)}/{len(expected_events)} expected events"
        }
    
    def _process_deal_validation(self, response) -> dict:
        """Process deal tracking validation."""
        deal_events = {}
        total_events = 0
        
        for row in response.rows:
            event_name = row.dimension_values[0].value
            event_count = int(row.metric_values[0].value)
            
            total_events += event_count
            deal_events[event_name] = event_count
        
        # Check for deal-specific events
        deal_specific_events = ['view_item', 'select_content', 'click_external_deal', 'conversion']
        deal_event_count = sum(deal_events.get(event, 0) for event in deal_specific_events)
        
        return {
            "total_deal_events": deal_event_count,
            "events_by_type": deal_events,
            "validation_status": "✅ PASS" if deal_event_count > 0 else "❌ FAIL",
            "summary": f"Tracked {deal_event_count} deal-related events"
        }
    
    def _process_realtime_data(self, global_response, breakdown_response) -> dict:
        """Process real-time analytics data."""
        # Extract global metrics
        global_users = 0
        global_events = 0
        
        if global_response.rows:
            row = global_response.rows[0]
            global_users = int(row.metric_values[0].value)
            global_events = int(row.metric_values[1].value)
        
        # Extract breakdown by country/device
        countries = {}
        devices = {}
        
        for row in breakdown_response.rows:
            country = row.dimension_values[0].value
            device = row.dimension_values[1].value
            users = int(row.metric_values[0].value)
            
            countries[country] = countries.get(country, 0) + users
            devices[device] = devices.get(device, 0) + users
        
        return {
            "active_users": global_users,
            "total_events": global_events,
            "countries": countries,
            "devices": devices,
            "status": "🟢 ACTIVE" if global_users > 0 else "🔴 INACTIVE"
        }
    
    def _process_funnel_validation(self, response) -> dict:
        """Process conversion funnel validation."""
        funnel_events = {}
        
        for row in response.rows:
            event_name = row.dimension_values[0].value
            event_count = int(row.metric_values[0].value)
            users = int(row.metric_values[1].value)
            
            funnel_events[event_name] = {
                "events": event_count,
                "users": users
            }
        
        # Calculate funnel conversion rates
        view_item = funnel_events.get('view_item', {}).get('events', 0)
        select_content = funnel_events.get('select_content', {}).get('events', 0)
        external_click = funnel_events.get('click_external_deal', {}).get('events', 0)
        
        click_rate = (select_content / view_item * 100) if view_item > 0 else 0
        conversion_rate = (external_click / view_item * 100) if view_item > 0 else 0
        
        return {
            "funnel_data": funnel_events,
            "click_rate": f"{click_rate:.1f}%",
            "conversion_rate": f"{conversion_rate:.1f}%",
            "validation_status": "✅ PASS" if view_item > 0 else "❌ FAIL"
        }
    
    def _process_partner_validation(self, response) -> dict:
        """Process partner attribution validation."""
        source_data = {}
        total_attributed_events = 0
        
        for row in response.rows:
            event_name = row.dimension_values[0].value
            source_medium = row.dimension_values[1].value
            events = int(row.metric_values[0].value)
            
            total_attributed_events += events
            
            if source_medium not in source_data:
                source_data[source_medium] = {
                    "total_events": 0,
                    "events": {}
                }
            
            source_data[source_medium]["total_events"] += events
            source_data[source_medium]["events"][event_name] = events
        
        # Look for PRTD/partner specific tracking
        partner_sources = {k: v for k, v in source_data.items() if 'prtd' in k.lower() or 'partner' in k.lower()}
        
        return {
            "source_attribution": source_data,
            "partner_sources": partner_sources,
            "total_attributed_events": total_attributed_events,
            "validation_status": "✅ PASS" if total_attributed_events > 0 else "⚠️  WARNING"
        }

    def run_full_validation(self) -> dict:
        """Run complete validation suite."""
        print("🚀 Starting PRTD Analytics Validation Suite...\n")
        
        results = {
            "timestamp": datetime.datetime.now().isoformat(),
            "property_id": self.property_id,
            "validations": {}
        }
        
        # Run all validations
        validations = [
            ("core_events", self.validate_core_events),
            ("deal_tracking", self.validate_deal_tracking),
            ("realtime_activity", self.check_realtime_activity),
            ("conversion_funnel", self.validate_conversion_funnel),
            ("partner_attribution", self.validate_partner_attribution)
        ]
        
        for name, validation_func in validations:
            try:
                print(f"\n--- {name.replace('_', ' ').title()} ---")
                result = validation_func()
                results["validations"][name] = result
                
                # Print summary
                if "summary" in result:
                    print(f"✓ {result['summary']}")
                if "validation_status" in result:
                    print(f"Status: {result['validation_status']}")
                    
            except Exception as e:
                results["validations"][name] = {"error": str(e)}
                print(f"❌ Failed: {str(e)}")
        
        # Overall health score
        passed = sum(1 for v in results["validations"].values() 
                    if v.get("validation_status", "").startswith("✅"))
        total = len(validations)
        health_score = (passed / total) * 100
        
        results["health_score"] = health_score
        results["overall_status"] = "🟢 HEALTHY" if health_score >= 80 else "🟡 NEEDS_ATTENTION" if health_score >= 50 else "🔴 CRITICAL"
        
        print(f"\n{'='*60}")
        print(f"🎯 PRTD Analytics Validation Report")
        print(f"{'='*60}")
        print(f"Overall Score: {health_score:.0f}% | Status: {results['overall_status']}")
        print(f"Property: {self.property_id} | Time: {results['timestamp'][:19]}")
        
        # Key metrics summary
        core_events = results['validations'].get('core_events', {})
        deal_tracking = results['validations'].get('deal_tracking', {})
        funnel = results['validations'].get('conversion_funnel', {})
        
        if core_events.get('event_counts'):
            total_events = sum(core_events['event_counts'].values())
            print(f"\n📊 Key Metrics (7 days):")
            print(f"  Total Events: {total_events:,}")
            print(f"  Page Views: {core_events['event_counts'].get('page_view', 0):,}")
            print(f"  Deal Clicks: {core_events['event_counts'].get('click_external_deal', 0):,}")
            print(f"  Conversions: {core_events['event_counts'].get('conversion', 0):,}")
        
        if funnel and 'conversion_rate' in funnel:
            print(f"  Conversion Rate: {funnel['conversion_rate']}")
        
        # Action items
        missing_events = core_events.get('missing_events', [])
        if missing_events:
            print(f"\n⚠️  Missing Events: {', '.join(missing_events)}")
        
        # PASS/FAIL flag
        overall_pass = health_score >= 70
        print(f"\n🚨 OVERALL: {'PASS' if overall_pass else 'FAIL'}")
        print(f"{'='*60}")
        
        return results

def main():
    """Main validation function."""
    # Load configuration
    credentials_path = os.getenv('GOOGLE_APPLICATION_CREDENTIALS', '/home/deploy/prtd-ga4-credentials.json')
    property_id = os.getenv('GA4_PROPERTY_ID')
    
    if not property_id:
        print("❌ GA4_PROPERTY_ID environment variable not set!")
        print("Set it with: export GA4_PROPERTY_ID=your_property_id")
        return
    
    if not os.path.exists(credentials_path):
        print(f"❌ Credentials file not found: {credentials_path}")
        print("Download your service account key and set GOOGLE_APPLICATION_CREDENTIALS")
        return
    
    # Initialize validator
    validator = PRTDAnalyticsValidator(property_id, credentials_path)
    
    # Run validation
    results = validator.run_full_validation()
    
    # Save results
    output_file = f"/home/deploy/prtd/analytics-validation-{datetime.datetime.now().strftime('%Y%m%d-%H%M%S')}.json"
    with open(output_file, 'w') as f:
        json.dump(results, f, indent=2)
    
    print(f"\n📁 Detailed results saved to: {output_file}")

if __name__ == "__main__":
    main()