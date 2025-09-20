#!/home/deploy/prtd/analytics-env/bin/python
"""
Verify GA4 Exploration Setup for PRTD
Check if all components are ready for content engagement analytics
"""

import os
import sys
from pathlib import Path

def check_file_exists(filepath, description):
    """Check if a file exists and report status."""
    if os.path.exists(filepath):
        print(f"✅ {description}")
        return True
    else:
        print(f"❌ {description}")
        return False

def check_exploration_templates():
    """Check if exploration templates exist."""
    print("\n📋 EXPLORATION TEMPLATES")
    print("=" * 40)
    
    templates_dir = "/home/deploy/prtd/ga4-exploration-templates"
    
    templates = [
        ("prtd_content_engagement_overview.json", "Content Engagement Overview template"),
        ("prtd_image_engagement_analysis.json", "Image Engagement Analysis template"),
        ("prtd_engagement_quality_dashboard.json", "Engagement Quality Dashboard template"),
        ("prtd_section_performance_analysis.json", "Section Performance Analysis template"),
        ("looker_studio_dashboard.json", "Looker Studio dashboard template"),
        ("MANUAL_SETUP_GUIDE.md", "Manual setup guide")
    ]
    
    all_exist = True
    for filename, description in templates:
        filepath = os.path.join(templates_dir, filename)
        exists = check_file_exists(filepath, description)
        if not exists:
            all_exist = False
    
    return all_exist

def check_executables():
    """Check if executable scripts are available."""
    print("\n🔧 EXECUTABLE SCRIPTS")
    print("=" * 40)
    
    executables = [
        ("/usr/local/bin/prtd-engagement", "Analytics data viewer"),
        ("/usr/local/bin/prtd-setup-explorations", "Guided exploration setup"),
        ("/usr/local/bin/prtd-validate", "Analytics validation script"),
        ("/usr/local/bin/prtd-monitor", "Real-time monitoring"),
        ("/usr/local/bin/prtd-health", "Health check script")
    ]
    
    all_exist = True
    for filepath, description in executables:
        exists = check_file_exists(filepath, description)
        if not exists:
            all_exist = False
    
    return all_exist

def check_analytics_implementation():
    """Check if analytics implementation is complete."""
    print("\n📊 ANALYTICS IMPLEMENTATION")
    print("=" * 40)
    
    files = [
        ("/home/deploy/prtd/src/lib/analytics.ts", "Analytics library with engagement tracking"),
        ("/home/deploy/prtd/pages/deal/[slug].tsx", "Deal page with engagement handlers"),
        ("/home/deploy/prtd-ga4-credentials.json", "GA4 API credentials"),
        ("/etc/prtd-analytics.env", "Analytics environment variables")
    ]
    
    all_exist = True
    for filepath, description in files:
        exists = check_file_exists(filepath, description)
        if not exists:
            all_exist = False
    
    return all_exist

def show_quick_start_guide():
    """Show quick start instructions."""
    print("\n🚀 QUICK START GUIDE")
    print("=" * 40)
    print()
    print("1. 📊 **Check current data:**")
    print("   prtd-engagement")
    print()
    print("2. 🎯 **Set up GA4 explorations:**")
    print("   prtd-setup-explorations")
    print("   (Interactive 10-15 minute guided setup)")
    print()
    print("3. 🌐 **Direct GA4 links:**")
    print("   Explore: https://analytics.google.com/analytics/web/#/p502239171/explore")
    print("   Reports: https://analytics.google.com/analytics/web/#/p502239171/reports")
    print()
    print("4. 📚 **Manual setup guide:**")
    print("   /home/deploy/prtd/ga4-exploration-templates/MANUAL_SETUP_GUIDE.md")
    print()
    print("5. 🔄 **Monitor progress:**")
    print("   prtd-health    # Overall system health")
    print("   prtd-validate  # Detailed analytics validation")

def show_next_steps():
    """Show what to do next."""
    print("\n💡 NEXT STEPS")
    print("=" * 40)
    print()
    print("📈 **Generate Test Data:**")
    print("   • Visit deal pages on your site")
    print("   • Hover over images")
    print("   • Select/highlight text")
    print("   • Click share buttons")
    print("   • Scroll through content sections")
    print()
    print("⏰ **Wait for Data:**")
    print("   • GA4 data appears in 24-48 hours")
    print("   • Real-time data available immediately")
    print("   • Run 'prtd-engagement' to check status")
    print()
    print("📊 **Create Explorations:**")
    print("   • Run 'prtd-setup-explorations' for guided setup")
    print("   • Or follow manual guide for detailed instructions")
    print("   • Each exploration takes 2-3 minutes to create")

def main():
    """Main verification function."""
    print("🔍 PRTD GA4 EXPLORATION SETUP VERIFICATION")
    print("=" * 60)
    
    # Check all components
    templates_ok = check_exploration_templates()
    executables_ok = check_executables()
    analytics_ok = check_analytics_implementation()
    
    # Overall status
    print("\n📋 OVERALL STATUS")
    print("=" * 40)
    
    if templates_ok and executables_ok and analytics_ok:
        print("🎉 ✅ ALL SYSTEMS READY!")
        print("Your content engagement analytics setup is complete.")
        show_quick_start_guide()
        show_next_steps()
    else:
        print("⚠️  Some components are missing:")
        if not templates_ok:
            print("   - Exploration templates need regeneration")
        if not executables_ok:
            print("   - Some executable scripts are missing")
        if not analytics_ok:
            print("   - Analytics implementation incomplete")
        print()
        print("💡 Run the setup scripts again to fix missing components")

if __name__ == "__main__":
    main()