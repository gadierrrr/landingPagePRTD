#!/home/deploy/prtd/analytics-env/bin/python
"""
GA4 Custom Dimensions Setup Script for PRTD
Automatically creates all required custom dimensions via GA4 Admin API
"""

import os
import sys
from google.analytics.admin_v1beta import AnalyticsAdminServiceClient
from google.analytics.admin_v1beta.types import CustomDimension, CreateCustomDimensionRequest
from google.oauth2 import service_account

# Configuration
PROPERTY_ID = "502239171"
CREDENTIALS_PATH = "/home/deploy/prtd-ga4-credentials.json"

# Required custom dimensions for PRTD analytics
CUSTOM_DIMENSIONS = [
    {
        "parameter_name": "slug",
        "display_name": "Deal Slug",
        "description": "Deal/page identifier for tracking specific content",
        "scope": CustomDimension.DimensionScope.EVENT
    },
    {
        "parameter_name": "deal_id", 
        "display_name": "Deal ID",
        "description": "Unique deal tracking identifier",
        "scope": CustomDimension.DimensionScope.EVENT
    },
    {
        "parameter_name": "vendor_id",
        "display_name": "Vendor ID", 
        "description": "Partner/vendor identifier for attribution",
        "scope": CustomDimension.DimensionScope.EVENT
    },
    {
        "parameter_name": "category",
        "display_name": "Category",
        "description": "Deal category for performance analysis",
        "scope": CustomDimension.DimensionScope.EVENT
    },
    {
        "parameter_name": "position",
        "display_name": "Position",
        "description": "Layout position for UX optimization",
        "scope": CustomDimension.DimensionScope.EVENT
    },
    {
        "parameter_name": "section_version", 
        "display_name": "Section Version",
        "description": "A/B test variant identifier",
        "scope": CustomDimension.DimensionScope.EVENT
    },
    {
        "parameter_name": "src",
        "display_name": "Source",
        "description": "Traffic source detail for attribution",
        "scope": CustomDimension.DimensionScope.EVENT
    },
    {
        "parameter_name": "cta_id",
        "display_name": "CTA ID", 
        "description": "Call-to-action identifier for conversion tracking",
        "scope": CustomDimension.DimensionScope.EVENT
    },
    {
        "parameter_name": "form_location",
        "display_name": "Form Location",
        "description": "Form context for lead generation analysis", 
        "scope": CustomDimension.DimensionScope.EVENT
    },
    {
        "parameter_name": "status_code",
        "display_name": "Status Code",
        "description": "HTTP/response status codes for error tracking",
        "scope": CustomDimension.DimensionScope.EVENT
    },
    {
        "parameter_name": "error_code", 
        "display_name": "Error Code",
        "description": "Error categorization for debugging",
        "scope": CustomDimension.DimensionScope.EVENT
    },
    {
        "parameter_name": "request_id",
        "display_name": "Request ID",
        "description": "Debug trace identifier for request correlation",
        "scope": CustomDimension.DimensionScope.EVENT
    }
]

def initialize_client():
    """Initialize the Analytics Admin API client."""
    try:
        credentials = service_account.Credentials.from_service_account_file(
            CREDENTIALS_PATH,
            scopes=['https://www.googleapis.com/auth/analytics.edit']
        )
        client = AnalyticsAdminServiceClient(credentials=credentials)
        print(f"✅ Successfully authenticated with service account: {credentials.service_account_email}")
        return client
    except Exception as e:
        print(f"❌ Failed to initialize API client: {e}")
        sys.exit(1)

def list_existing_dimensions(client):
    """List existing custom dimensions to avoid duplicates."""
    try:
        property_name = f"properties/{PROPERTY_ID}"
        existing_dimensions = client.list_custom_dimensions(parent=property_name)
        
        existing_params = {}
        for dimension in existing_dimensions:
            existing_params[dimension.parameter_name] = {
                'name': dimension.name,
                'display_name': dimension.display_name,
                'description': dimension.description
            }
        
        print(f"📋 Found {len(existing_params)} existing custom dimensions")
        return existing_params
        
    except Exception as e:
        print(f"❌ Failed to list existing dimensions: {e}")
        return {}

def create_custom_dimension(client, dimension_config):
    """Create a single custom dimension."""
    try:
        property_name = f"properties/{PROPERTY_ID}"
        
        custom_dimension = CustomDimension(
            parameter_name=dimension_config["parameter_name"],
            display_name=dimension_config["display_name"],
            description=dimension_config["description"],
            scope=dimension_config["scope"]
        )
        
        request = CreateCustomDimensionRequest(
            parent=property_name,
            custom_dimension=custom_dimension
        )
        
        response = client.create_custom_dimension(request=request)
        
        print(f"✅ Created: {dimension_config['display_name']} ({dimension_config['parameter_name']})")
        return response
        
    except Exception as e:
        if "already exists" in str(e).lower() or "duplicate" in str(e).lower():
            print(f"⚠️  Skipped: {dimension_config['display_name']} (already exists)")
            return None
        else:
            print(f"❌ Failed to create {dimension_config['display_name']}: {e}")
            return None

def main():
    """Main execution function."""
    # Check for list option
    if len(sys.argv) > 1 and sys.argv[1] in ['--list', '-l']:
        print("📋 GA4 Custom Dimensions for PRTD")
        print(f"Property ID: {PROPERTY_ID}")
        print("=" * 60)
        
        client = initialize_client()
        property_name = f"properties/{PROPERTY_ID}"
        
        try:
            dimensions = client.list_custom_dimensions(parent=property_name)
            dimensions_list = list(dimensions)
            
            if not dimensions_list:
                print("❌ No custom dimensions found")
                return
            
            for i, dimension in enumerate(dimensions_list, 1):
                print(f"{i:2d}. {dimension.display_name} ({dimension.parameter_name})")
                print(f"    {dimension.description}")
                print()
            
            print(f"✅ Total: {len(dimensions_list)} custom dimensions active")
        except Exception as e:
            print(f"❌ Failed to list dimensions: {e}")
        return
    
    print("🚀 Starting GA4 Custom Dimensions Setup for PRTD")
    print(f"Property ID: {PROPERTY_ID}")
    print(f"Dimensions to create: {len(CUSTOM_DIMENSIONS)}")
    print("=" * 60)
    
    # Initialize API client
    client = initialize_client()
    
    # Check existing dimensions
    existing_dimensions = list_existing_dimensions(client)
    
    # Create new dimensions
    created_count = 0
    skipped_count = 0
    failed_count = 0
    
    for dimension_config in CUSTOM_DIMENSIONS:
        param_name = dimension_config["parameter_name"]
        
        # Check if dimension already exists
        if param_name in existing_dimensions:
            print(f"⚠️  Skipped: {dimension_config['display_name']} (already exists)")
            skipped_count += 1
            continue
        
        # Create the dimension
        result = create_custom_dimension(client, dimension_config)
        
        if result:
            created_count += 1
        elif result is None and param_name in existing_dimensions:
            skipped_count += 1
        else:
            failed_count += 1
    
    # Summary
    print("=" * 60)
    print(f"📊 Setup Summary:")
    print(f"  ✅ Created: {created_count} dimensions")
    print(f"  ⚠️  Skipped: {skipped_count} dimensions (already exist)")
    print(f"  ❌ Failed: {failed_count} dimensions")
    print(f"  📋 Total: {created_count + skipped_count + failed_count}/{len(CUSTOM_DIMENSIONS)} processed")
    
    if failed_count > 0:
        print(f"\n⚠️  Some dimensions failed to create. Check error messages above.")
        sys.exit(1)
    else:
        print(f"\n🎉 GA4 custom dimensions setup complete!")
        print(f"💡 Tip: Run 'prtd-validate' in 24-48 hours to verify data collection")

if __name__ == "__main__":
    main()