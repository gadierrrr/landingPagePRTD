#!/home/deploy/prtd/analytics-env/bin/python
"""
Guided GA4 Exploration Setup for PRTD
Interactive step-by-step guide for creating explorations
"""

import os
import sys
import json
import time
import webbrowser
from datetime import datetime

PROPERTY_ID = "502239171"
GA4_EXPLORE_URL = f"https://analytics.google.com/analytics/web/#/p{PROPERTY_ID}/explore"

def print_header(title):
    """Print formatted header."""
    print("\n" + "=" * 60)
    print(f"🎯 {title}")
    print("=" * 60)

def wait_for_user():
    """Wait for user to complete a step."""
    input("\n✅ Press Enter when you've completed this step...")

def create_exploration_1():
    """Guide for Content Engagement Overview."""
    print_header("EXPLORATION 1: Content Engagement Overview")
    
    print("🌐 Opening GA4 Explore in your browser...")
    webbrowser.open(GA4_EXPLORE_URL)
    time.sleep(2)
    
    print("\n📋 Follow these steps in GA4:")
    print("1. Click 'Blank' to create a new exploration")
    print("2. Name it: 'PRTD Content Engagement Overview'")
    
    wait_for_user()
    
    print("\n📊 Add Dimensions (drag from left panel to 'Dimensions' section):")
    dimensions = [
        "Event name",
        "Custom parameter → slug",
        "Custom parameter → interaction_type", 
        "Custom parameter → content_piece",
        "Custom parameter → category"
    ]
    
    for i, dim in enumerate(dimensions, 1):
        print(f"   {i}. {dim}")
    
    wait_for_user()
    
    print("\n📈 Add Metrics (drag from left panel to 'Metrics' section):")
    metrics = [
        "Event count",
        "Total users", 
        "Average session duration"
    ]
    
    for i, metric in enumerate(metrics, 1):
        print(f"   {i}. {metric}")
    
    wait_for_user()
    
    print("\n🎯 Configure the Table:")
    print("1. Drag 'Event name' to ROWS")
    print("2. Drag 'Custom parameter: interaction_type' to ROWS (below Event name)")
    print("3. Drag 'Custom parameter: content_piece' to COLUMNS")
    print("4. Drag 'Event count' to VALUES")
    
    wait_for_user()
    
    print("\n🔍 Add Filter:")
    print("1. Click 'Add filter' at the bottom")
    print("2. Select 'Event name'")
    print("3. Select 'Exactly matches'")
    print("4. Type: content_engagement")
    print("5. Click Apply")
    
    wait_for_user()
    
    print("✅ Exploration 1 complete! Save it and let's move to the next one.")

def create_exploration_2():
    """Guide for Image Engagement Analysis."""
    print_header("EXPLORATION 2: Image Engagement Analysis")
    
    print("1. Click 'Blank' to create a new exploration")
    print("2. Name it: 'PRTD Image Engagement Analysis'")
    
    wait_for_user()
    
    print("\n📊 Add Dimensions:")
    dimensions = [
        "Event name",
        "Custom parameter → slug",
        "Custom parameter → vendor_id",
        "Custom parameter → category"
    ]
    
    for i, dim in enumerate(dimensions, 1):
        print(f"   {i}. {dim}")
    
    wait_for_user()
    
    print("\n📈 Add Metrics:")
    metrics = [
        "Event count",
        "Total users",
        "Engagement rate"
    ]
    
    for i, metric in enumerate(metrics, 1):
        print(f"   {i}. {metric}")
    
    wait_for_user()
    
    print("\n🎯 Configure the Table:")
    print("1. Drag 'Custom parameter: slug' to ROWS")
    print("2. Drag 'Event name' to COLUMNS")
    print("3. Drag 'Event count' and 'Total users' to VALUES")
    
    wait_for_user()
    
    print("\n🔍 Add Filter:")
    print("1. Click 'Add filter'")
    print("2. Select 'Event name'")
    print("3. Select 'Contains'")
    print("4. Type: image")
    print("5. Click Apply")
    
    wait_for_user()
    
    print("✅ Exploration 2 complete!")

def create_exploration_3():
    """Guide for Engagement Quality Dashboard."""
    print_header("EXPLORATION 3: Engagement Quality Dashboard")
    
    print("1. Click 'Blank' to create a new exploration")
    print("2. Name it: 'PRTD Engagement Quality Dashboard'")
    
    wait_for_user()
    
    print("\n📊 Add Dimensions:")
    dimensions = [
        "Custom parameter → slug",
        "Custom parameter → category", 
        "Custom parameter → vendor_id"
    ]
    
    for i, dim in enumerate(dimensions, 1):
        print(f"   {i}. {dim}")
    
    wait_for_user()
    
    print("\n📈 Add Metrics:")
    metrics = [
        "Event count",
        "Total users",
        "Engagement rate"
    ]
    
    for i, metric in enumerate(metrics, 1):
        print(f"   {i}. {metric}")
    
    wait_for_user()
    
    print("\n🎯 Configure the Table:")
    print("1. Drag 'Custom parameter: slug' to ROWS")
    print("2. Drag 'Custom parameter: category' to COLUMNS")
    print("3. Drag 'Event count' and 'Total users' to VALUES")
    
    wait_for_user()
    
    print("\n🔍 Add Filter:")
    print("1. Click 'Add filter'")
    print("2. Select 'Event name'")
    print("3. Select 'Exactly matches'")
    print("4. Type: engagement_quality_score")
    print("5. Click Apply")
    
    wait_for_user()
    
    print("✅ Exploration 3 complete!")

def create_exploration_4():
    """Guide for Section Performance Analysis."""
    print_header("EXPLORATION 4: Section Performance Analysis")
    
    print("1. Click 'Blank' to create a new exploration")
    print("2. Name it: 'PRTD Section Performance Analysis'")
    
    wait_for_user()
    
    print("\n📊 Add Dimensions:")
    dimensions = [
        "Custom parameter → slug",
        "Custom parameter → category",
        "Custom parameter → cta_id"
    ]
    
    for i, dim in enumerate(dimensions, 1):
        print(f"   {i}. {dim}")
    
    wait_for_user()
    
    print("\n📈 Add Metrics:")
    metrics = [
        "Event count",
        "Total users", 
        "Average session duration"
    ]
    
    for i, metric in enumerate(metrics, 1):
        print(f"   {i}. {metric}")
    
    wait_for_user()
    
    print("\n🎯 Configure the Table:")
    print("1. Drag 'Custom parameter: slug' to ROWS")
    print("2. Drag 'Event count' and 'Total users' to VALUES")
    
    wait_for_user()
    
    print("\n🔍 Add Filter:")
    print("1. Click 'Add filter'")
    print("2. Select 'Event name'")
    print("3. Select 'Exactly matches'")
    print("4. Type: section_engagement")
    print("5. Click Apply")
    
    wait_for_user()
    
    print("✅ Exploration 4 complete!")

def create_custom_dashboard():
    """Guide for creating a custom dashboard."""
    print_header("BONUS: Custom Dashboard Setup")
    
    dashboard_url = f"https://analytics.google.com/analytics/web/#/p{PROPERTY_ID}/reports/intelligenthome"
    
    print("🌐 Opening GA4 Reports section...")
    webbrowser.open(dashboard_url)
    time.sleep(2)
    
    print("\n📋 Create a Custom Dashboard:")
    print("1. Go to Reports → Library")
    print("2. Click 'Create custom report'")
    print("3. Name it: 'PRTD Engagement Dashboard'")
    print()
    print("Add these cards:")
    
    cards = [
        {
            "name": "Engagement Quality Distribution",
            "metric": "Event count",
            "dimension": "Custom parameter: engagement_quality",
            "filter": "Event name = engagement_quality_score"
        },
        {
            "name": "Top Engaging Content",
            "metric": "Event count",
            "dimension": "Custom parameter: slug", 
            "filter": "Event name = content_engagement"
        },
        {
            "name": "Image Performance",
            "metric": "Event count",
            "dimension": "Custom parameter: slug",
            "filter": "Event name contains image"
        }
    ]
    
    for i, card in enumerate(cards, 1):
        print(f"\n📊 Card {i}: {card['name']}")
        print(f"   Metric: {card['metric']}")
        print(f"   Dimension: {card['dimension']}")
        print(f"   Filter: {card['filter']}")
        wait_for_user()
    
    print("✅ Custom dashboard complete!")

def main():
    """Main guided setup function."""
    print("🎯 GUIDED GA4 EXPLORATION SETUP")
    print(f"Property ID: {PROPERTY_ID}")
    print("=" * 60)
    print()
    print("This interactive guide will walk you through creating 4 custom")
    print("explorations for your content engagement analytics.")
    print()
    print("⏱️  Total setup time: ~10-15 minutes")
    print("🌐 Browser will open automatically to GA4")
    print()
    
    choice = input("Ready to start? (y/n): ").lower().strip()
    if choice != 'y':
        print("Setup cancelled. Run the script again when ready!")
        return
    
    # Create each exploration
    explorations = [
        ("Content Engagement Overview", create_exploration_1),
        ("Image Engagement Analysis", create_exploration_2), 
        ("Engagement Quality Dashboard", create_exploration_3),
        ("Section Performance Analysis", create_exploration_4)
    ]
    
    for i, (name, func) in enumerate(explorations, 1):
        print(f"\n🚀 Starting Exploration {i}/4: {name}")
        choice = input("Continue? (y/s/q for yes/skip/quit): ").lower().strip()
        
        if choice == 'q':
            print("Setup stopped. You can resume anytime!")
            break
        elif choice == 's':
            print(f"⏭️  Skipped {name}")
            continue
        else:
            func()
    
    # Bonus dashboard
    print("\n🎉 All explorations created!")
    choice = input("Create bonus custom dashboard? (y/n): ").lower().strip()
    if choice == 'y':
        create_custom_dashboard()
    
    print_header("SETUP COMPLETE!")
    print("✅ Your GA4 explorations are ready!")
    print("💡 Visit deal pages and interact with content to generate data")
    print("📊 Check your explorations in 24-48 hours for rich analytics")
    print()
    print("🔗 Quick access links:")
    print(f"   GA4 Explore: {GA4_EXPLORE_URL}")
    print(f"   GA4 Reports: https://analytics.google.com/analytics/web/#/p{PROPERTY_ID}/reports")
    print()
    print("🛠️  Run 'prtd-engagement' anytime to check your tracking data")

if __name__ == "__main__":
    main()