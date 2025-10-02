#!/home/deploy/prtd/analytics-env/bin/python
"""
Automated Analytics Health Check for PRTD
Continuous monitoring and alerting for analytics tracking health
"""

import os
import json
import time
import smtplib
import datetime
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Dict, List, Optional
from dataclasses import dataclass
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

@dataclass
class HealthThreshold:
    """Health check threshold configuration."""
    metric_name: str
    min_value: Optional[int] = None
    max_value: Optional[int] = None
    critical_min: Optional[int] = None
    warning_message: str = ""
    critical_message: str = ""

class PRTDHealthChecker:
    def __init__(self, property_id: str, credentials_path: str):
        """Initialize the health checker."""
        self.property_id = property_id
        self.property_name = f"properties/{property_id}"
        
        # Set up credentials
        credentials = service_account.Credentials.from_service_account_file(
            credentials_path,
            scopes=['https://www.googleapis.com/auth/analytics.readonly']
        )
        
        # Initialize the client
        self.client = BetaAnalyticsDataClient(credentials=credentials)
        
        # Health thresholds
        self.thresholds = {
            'daily_page_views': HealthThreshold(
                metric_name='page_views',
                min_value=50,
                critical_min=10,
                warning_message="Daily page views below expected range",
                critical_message="Critical: Very low daily page views"
            ),
            'daily_deal_clicks': HealthThreshold(
                metric_name='click_external_deal',
                min_value=5,
                critical_min=1,
                warning_message="Deal clicks below expected range",
                critical_message="Critical: No deal clicks detected"
            ),
            'conversion_rate': HealthThreshold(
                metric_name='conversion_rate',
                min_value=2.0,  # 2% minimum
                critical_min=0.5,
                warning_message="Conversion rate below target",
                critical_message="Critical: Very low conversion rate"
            ),
            'tracking_errors': HealthThreshold(
                metric_name='tracking_errors',
                max_value=5,
                warning_message="Elevated tracking errors detected",
                critical_message="Critical: High tracking error rate"
            )
        }
        
        # Alert history
        self.alert_history = []
        self.last_health_score = 100
    
    def check_core_tracking_health(self) -> Dict:
        """Check if core tracking events are functioning."""
        print("🔍 Checking core tracking health...")
        
        # Check events from last 24 hours
        request = RunReportRequest(
            property=self.property_name,
            dimensions=[Dimension(name="eventName")],
            metrics=[Metric(name="eventCount")],
            date_ranges=[DateRange(start_date="yesterday", end_date="today")]
        )
        
        try:
            response = self.client.run_report(request=request)
            
            # Required events
            required_events = [
                'page_view', 'view_item', 'select_item', 
                'click_external_deal', 'conversion'
            ]
            
            found_events = {}
            for row in response.rows:
                event_name = row.dimension_values[0].value
                event_count = int(row.metric_values[0].value)
                found_events[event_name] = event_count
            
            # Evaluate health
            missing_events = [e for e in required_events if e not in found_events]
            total_events = sum(found_events.values())
            
            health_score = max(0, 100 - (len(missing_events) * 20))
            
            return {
                "status": "healthy" if health_score >= 80 else "warning" if health_score >= 50 else "critical",
                "health_score": health_score,
                "total_events": total_events,
                "found_events": found_events,
                "missing_events": missing_events,
                "required_events": required_events
            }
            
        except Exception as e:
            return {
                "status": "critical",
                "health_score": 0,
                "error": f"Failed to check core tracking: {str(e)}"
            }
    
    def check_conversion_funnel_health(self) -> Dict:
        """Check conversion funnel health."""
        print("📊 Checking conversion funnel health...")
        
        # Get funnel events from last 7 days
        request = RunReportRequest(
            property=self.property_name,
            dimensions=[Dimension(name="eventName")],
            metrics=[
                Metric(name="eventCount"),
                Metric(name="totalUsers")
            ],
            date_ranges=[DateRange(start_date="7daysAgo", end_date="today")]
        )
        
        try:
            response = self.client.run_report(request=request)
            
            funnel_data = {}
            for row in response.rows:
                event_name = row.dimension_values[0].value
                event_count = int(row.metric_values[0].value)
                users = int(row.metric_values[1].value)
                
                if event_name in ['view_item', 'select_item', 'click_external_deal']:
                    funnel_data[event_name] = {
                        "events": event_count,
                        "users": users
                    }
            
            # Calculate conversion rates
            view_item = funnel_data.get('view_item', {}).get('events', 0)
            select_item_events = funnel_data.get('select_item', {}).get('events', 0)
            external_click = funnel_data.get('click_external_deal', {}).get('events', 0)
            
            click_rate = (select_item_events / view_item * 100) if view_item > 0 else 0
            conversion_rate = (external_click / view_item * 100) if view_item > 0 else 0
            
            # Health evaluation
            health_score = 100
            issues = []
            
            if view_item < 100:  # Low traffic
                health_score -= 20
                issues.append("Low deal page views")
            
            if click_rate < 10:  # Poor engagement
                health_score -= 30
                issues.append(f"Low click rate: {click_rate:.1f}%")
            
            if conversion_rate < 2:  # Poor conversion
                health_score -= 40
                issues.append(f"Low conversion rate: {conversion_rate:.1f}%")
            
            status = "healthy" if health_score >= 80 else "warning" if health_score >= 50 else "critical"
            
            return {
                "status": status,
                "health_score": max(0, health_score),
                "funnel_data": funnel_data,
                "click_rate": round(click_rate, 2),
                "conversion_rate": round(conversion_rate, 2),
                "issues": issues
            }
            
        except Exception as e:
            return {
                "status": "critical",
                "health_score": 0,
                "error": f"Failed to check funnel health: {str(e)}"
            }
    
    def check_realtime_health(self) -> Dict:
        """Check real-time tracking health."""
        print("⚡ Checking real-time tracking health...")
        
        try:
            # Get global realtime metrics
            request = RunRealtimeReportRequest(
                property=self.property_name,
                dimensions=[],
                metrics=[
                    Metric(name="activeUsers"),
                    Metric(name="eventCount")
                ],
                minute_ranges=[MinuteRange(start_minutes_ago=29, end_minutes_ago=0)]
            )
            
            response = self.client.run_realtime_report(request=request)
            
            active_users = 0
            total_events = 0
            
            if response.rows:
                row = response.rows[0]
                active_users = int(row.metric_values[0].value)
                total_events = int(row.metric_values[1].value)
            
            # Health evaluation
            health_score = 100
            issues = []
            
            if active_users == 0:
                health_score = 50
                issues.append("No active users in last 29 minutes")
            elif active_users < 2:
                health_score -= 20
                issues.append("Low user activity")
            
            if total_events == 0 and active_users > 0:
                health_score -= 30
                issues.append("Users present but no events tracked")
            
            status = "healthy" if health_score >= 80 else "warning" if health_score >= 50 else "critical"
            
            return {
                "status": status,
                "health_score": health_score,
                "active_users": active_users,
                "total_events": total_events,
                "issues": issues
            }
            
        except Exception as e:
            return {
                "status": "critical",
                "health_score": 0,
                "error": f"Failed to check real-time health: {str(e)}"
            }
    
    def check_partner_attribution_health(self) -> Dict:
        """Check partner attribution tracking health."""
        print("🤝 Checking partner attribution health...")
        
        request = RunReportRequest(
            property=self.property_name,
            dimensions=[
                Dimension(name="customEvent:partner"),
                Dimension(name="sourceMedium")
            ],
            metrics=[Metric(name="eventCount")],
            date_ranges=[DateRange(start_date="7daysAgo", end_date="today")]
        )
        
        try:
            response = self.client.run_report(request=request)
            
            partners = {}
            utm_tracking = {}
            
            for row in response.rows:
                partner = row.dimension_values[0].value
                source_medium = row.dimension_values[1].value
                events = int(row.metric_values[0].value)
                
                if partner and partner != "(not set)":
                    partners[partner] = partners.get(partner, 0) + events
                
                if "PRTD" in source_medium:
                    utm_tracking[source_medium] = utm_tracking.get(source_medium, 0) + events
            
            # Health evaluation
            health_score = 100
            issues = []
            
            if len(partners) == 0:
                health_score -= 40
                issues.append("No partner attribution data")
            
            if len(utm_tracking) == 0:
                health_score -= 30
                issues.append("UTM tracking not working")
            
            total_attributed_events = sum(partners.values())
            if total_attributed_events < 10:
                health_score -= 20
                issues.append("Low partner attribution volume")
            
            status = "healthy" if health_score >= 80 else "warning" if health_score >= 50 else "critical"
            
            return {
                "status": status,
                "health_score": max(0, health_score),
                "partners": partners,
                "utm_tracking": utm_tracking,
                "total_attributed_events": total_attributed_events,
                "issues": issues
            }
            
        except Exception as e:
            return {
                "status": "critical",
                "health_score": 0,
                "error": f"Failed to check attribution health: {str(e)}"
            }
    
    def run_comprehensive_health_check(self) -> Dict:
        """Run all health checks and generate overall score."""
        print("🏥 Running comprehensive analytics health check...\n")
        
        timestamp = datetime.datetime.now().isoformat()
        
        # Run all health checks
        checks = {
            "core_tracking": self.check_core_tracking_health(),
            "conversion_funnel": self.check_conversion_funnel_health(),
            "realtime_tracking": self.check_realtime_health(),
            "partner_attribution": self.check_partner_attribution_health()
        }
        
        # Calculate overall health score
        total_score = 0
        check_count = 0
        critical_issues = []
        warning_issues = []
        
        for check_name, result in checks.items():
            if "health_score" in result:
                total_score += result["health_score"]
                check_count += 1
                
                if result["status"] == "critical":
                    critical_issues.append(f"{check_name}: {result.get('error', 'Critical issue')}")
                elif result["status"] == "warning":
                    warning_issues.extend(result.get("issues", []))
        
        overall_score = total_score / check_count if check_count > 0 else 0
        
        # Determine overall status
        if overall_score >= 80:
            overall_status = "healthy"
            status_emoji = "🟢"
        elif overall_score >= 50:
            overall_status = "warning"
            status_emoji = "🟡"
        else:
            overall_status = "critical"
            status_emoji = "🔴"
        
        # Compile results
        health_report = {
            "timestamp": timestamp,
            "overall_status": overall_status,
            "overall_score": round(overall_score, 1),
            "status_emoji": status_emoji,
            "checks": checks,
            "critical_issues": critical_issues,
            "warning_issues": warning_issues,
            "recommendations": self._generate_recommendations(checks)
        }
        
        # Display summary
        print(f"\n{'='*60}")
        print(f"🏥 PRTD Analytics Health Check")
        print(f"{'='*60}")
        print(f"Status: {status_emoji} {overall_status.upper()} | Score: {overall_score:.0f}%")
        print(f"Time: {timestamp[:19]}")
        
        # Real-time summary
        realtime = checks.get('realtime_tracking', {})
        if realtime and 'active_users' in realtime:
            print(f"\n⚡ Current Activity:")
            print(f"  Active Users: {realtime['active_users']}")
            print(f"  Events (29min): {realtime.get('total_events', 0)}")
        
        # Core tracking summary
        core = checks.get('core_tracking', {})
        if core and 'total_events' in core:
            print(f"\n📊 Tracking Health:")
            print(f"  Events (24h): {core['total_events']:,}")
            print(f"  Events Found: {core.get('total_events_tracked', 0)}/8 expected")
        
        # Action items
        if critical_issues:
            print(f"\n🚨 CRITICAL - Check These:")
            for issue in critical_issues:
                print(f"  • {issue}")
        
        if warning_issues:
            print(f"\n⚠️  WARNINGS:")
            for issue in warning_issues[:3]:  # Show top 3
                print(f"  • {issue}")
        
        # What to check when inactive
        if overall_status == "critical":
            print(f"\n🔍 Troubleshooting:")
            print(f"  • Check website traffic (site down?)")
            print(f"  • Verify GA4 tracking code deployment")
            print(f"  • Review recent code changes")
        
        print(f"{'='*60}")
        
        # Store for alerting
        self.last_health_score = overall_score
        
        return health_report
    
    def _generate_recommendations(self, checks: Dict) -> List[str]:
        """Generate actionable recommendations based on health check results."""
        recommendations = []
        
        # Core tracking recommendations
        core = checks.get("core_tracking", {})
        if core.get("status") == "critical":
            recommendations.append("❗ Fix core event tracking - check GA4 implementation")
        
        missing_events = core.get("missing_events", [])
        if missing_events:
            recommendations.append(f"🔧 Implement missing events: {', '.join(missing_events)}")
        
        # Funnel recommendations
        funnel = checks.get("conversion_funnel", {})
        if funnel.get("conversion_rate", 0) < 2:
            recommendations.append("📈 Optimize deal pages to improve conversion rate")
        if funnel.get("click_rate", 0) < 10:
            recommendations.append("🎯 Improve deal card design to increase click rate")
        
        # Real-time recommendations
        realtime = checks.get("realtime_tracking", {})
        if realtime.get("active_users", 0) == 0:
            recommendations.append("📢 Drive traffic to the site for testing")
        
        # Attribution recommendations
        attribution = checks.get("partner_attribution", {})
        if attribution.get("total_attributed_events", 0) < 10:
            recommendations.append("🔗 Verify UTM parameter implementation")
        
        return recommendations
    
    def send_alert_email(self, health_report: Dict, email_config: Dict):
        """Send email alert for health issues."""
        if not email_config.get("enabled", False):
            return
        
        overall_score = health_report["overall_score"]
        status = health_report["overall_status"]
        
        # Determine if alert should be sent
        send_alert = False
        subject_prefix = ""
        
        if status == "critical":
            send_alert = True
            subject_prefix = "🚨 CRITICAL"
        elif status == "warning" and overall_score < self.last_health_score - 20:
            send_alert = True
            subject_prefix = "⚠️ WARNING"
        
        if not send_alert:
            return
        
        # Compose email
        subject = f"{subject_prefix}: PRTD Analytics Health Alert"
        
        body = f"""
PRTD Analytics Health Alert

Overall Status: {health_report['status_emoji']} {status.upper()}
Health Score: {overall_score:.1f}/100
Timestamp: {health_report['timestamp']}

Critical Issues:
{chr(10).join(['• ' + issue for issue in health_report['critical_issues']]) if health_report['critical_issues'] else 'None'}

Warning Issues:
{chr(10).join(['• ' + issue for issue in health_report['warning_issues'][:5]]) if health_report['warning_issues'] else 'None'}

Recommendations:
{chr(10).join(['• ' + rec for rec in health_report['recommendations'][:5]])}

Full report available in the monitoring dashboard.
        """
        
        try:
            msg = MIMEMultipart()
            msg['From'] = email_config['from_email']
            msg['To'] = ', '.join(email_config['to_emails'])
            msg['Subject'] = subject
            
            msg.attach(MIMEText(body, 'plain'))
            
            server = smtplib.SMTP(email_config['smtp_server'], email_config['smtp_port'])
            server.starttls()
            server.login(email_config['username'], email_config['password'])
            server.send_message(msg)
            server.quit()
            
            print(f"📧 Alert email sent to {', '.join(email_config['to_emails'])}")
            
        except Exception as e:
            print(f"❌ Failed to send alert email: {str(e)}")
    
    def continuous_monitoring(self, check_interval_minutes: int = 60):
        """Run continuous health monitoring."""
        print(f"🔄 Starting continuous monitoring (checking every {check_interval_minutes} minutes)")
        print("Press Ctrl+C to stop\n")
        
        while True:
            try:
                # Run health check
                health_report = self.run_comprehensive_health_check()
                
                # Save report
                timestamp = datetime.datetime.now().strftime('%Y%m%d-%H%M%S')
                report_file = f"/home/deploy/prtd/health-check-{timestamp}.json"
                
                with open(report_file, 'w') as f:
                    json.dump(health_report, f, indent=2)
                
                print(f"📁 Health report saved: {report_file}")
                
                # Wait for next check
                print(f"⏱️  Next check in {check_interval_minutes} minutes...\n")
                time.sleep(check_interval_minutes * 60)
                
            except KeyboardInterrupt:
                print("\n⏹️  Monitoring stopped by user")
                break
            except Exception as e:
                print(f"❌ Health check failed: {str(e)}")
                time.sleep(60)  # Wait 1 minute before retry

def main():
    """Main health check function."""
    # Configuration
    credentials_path = os.getenv('GOOGLE_APPLICATION_CREDENTIALS', '/home/deploy/prtd-ga4-credentials.json')
    property_id = os.getenv('GA4_PROPERTY_ID')
    
    if not property_id:
        print("❌ GA4_PROPERTY_ID environment variable not set!")
        return
    
    if not os.path.exists(credentials_path):
        print(f"❌ Credentials file not found: {credentials_path}")
        return
    
    # Initialize health checker
    health_checker = PRTDHealthChecker(property_id, credentials_path)
    
    # Parse command line arguments
    import sys
    
    if len(sys.argv) > 1 and sys.argv[1] == "continuous":
        # Continuous monitoring mode
        interval = int(sys.argv[2]) if len(sys.argv) > 2 else 60
        health_checker.continuous_monitoring(interval)
    else:
        # Single health check
        health_report = health_checker.run_comprehensive_health_check()
        
        # Save report
        timestamp = datetime.datetime.now().strftime('%Y%m%d-%H%M%S')
        report_file = f"/home/deploy/prtd/health-check-{timestamp}.json"
        
        with open(report_file, 'w') as f:
            json.dump(health_report, f, indent=2)
        
        print(f"\n📁 Health report saved: {report_file}")

if __name__ == "__main__":
    main()
