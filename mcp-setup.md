# MCP (Model Context Protocol) Setup for GA4 Analytics Validation

## Overview
This document guides you through setting up MCP functionality to validate your Puerto Rico Travel Deals analytics tracking implementation using Google's official Analytics MCP server.

## Prerequisites

### 1. Google Cloud Platform Setup
- Google Cloud Project with billing enabled
- Google Analytics 4 property (your existing: G-EF509Z3W9G)
- Google Analytics Data API enabled

### 2. Required Tools
- Python 3.10+ 
- Claude Desktop (for MCP integration)
- pipx (Python package installer)

## Step 1: Google Cloud Configuration

### Enable Google Analytics Data API
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select your project or create a new one
3. Navigate to **APIs & Services > Library**
4. Search for "Google Analytics Data API" and enable it
5. Search for "Google Analytics Admin API" and enable it

### Create Service Account
1. Go to **IAM & Admin > Service Accounts**
2. Click **"Create Service Account"**
3. Name: `prtd-analytics-mcp`
4. Description: `Service account for PRTD Analytics MCP validation`
5. Click **"Create and Continue"**
6. Skip role assignment (GA4 permissions will be granted separately)
7. Click **"Done"**

### Generate Service Account Key
1. Click on the created service account
2. Go to **"Keys"** tab
3. Click **"Add Key" > "Create new key"**
4. Select **JSON** format
5. Download and save as `~/prtd-ga4-credentials.json`

## Step 2: Google Analytics 4 Permissions

### Grant Analytics Access
1. Go to [Google Analytics](https://analytics.google.com)
2. Navigate to **Admin > Property Access Management**
3. Click **"+"** to add user
4. Add the service account email: `prtd-analytics-mcp@YOUR-PROJECT.iam.gserviceaccount.com`
5. Assign **"Viewer"** role (minimum required)

## Step 3: Install MCP Server

### Install Official Google Analytics MCP Server
```bash
# Install pipx if not already installed
curl -fsSL https://bootstrap.pypa.io/get-pip.py | python3 -
python3 -m pip install --user pipx
python3 -m pipx ensurepath

# Install the official Google Analytics MCP server
pipx install analytics-mcp
```

### Verify Installation
```bash
pipx list
# Should show analytics-mcp in the list
```

## Step 4: Claude Desktop Configuration

### Create MCP Configuration
Create or edit `~/.claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "prtd-analytics": {
      "command": "pipx",
      "args": [
        "run",
        "analytics-mcp"
      ],
      "env": {
        "GOOGLE_APPLICATION_CREDENTIALS": "/home/deploy/prtd-ga4-credentials.json",
        "GA4_PROPERTY_ID": "YOUR_GA4_PROPERTY_ID"
      }
    }
  }
}
```

### Get Your GA4 Property ID
1. Go to Google Analytics
2. Admin > Property Settings
3. Copy the **Property ID** (starts with numbers, not G-EF509Z3W9G)

## Step 5: Validation Scripts

### Test Connection
```bash
# Test if MCP server can connect
pipx run analytics-mcp --test-connection
```

### Basic Validation Query
Once MCP is set up, you can validate tracking with queries like:

```
Show me the top 10 events from the last 7 days for our website
```

```
What are the conversion events being tracked for deal clicks?
```

```
Show me real-time analytics data for the last 30 minutes
```

## Step 6: Environment Variables Setup

### Create Environment File
```bash
# Create .env file for local development
cat > /home/deploy/prtd/.env.mcp << 'EOF'
GOOGLE_APPLICATION_CREDENTIALS=/home/deploy/prtd-ga4-credentials.json
GA4_PROPERTY_ID=YOUR_PROPERTY_ID_HERE
GOOGLE_PROJECT_ID=YOUR_PROJECT_ID_HERE
EOF
```

### Security Note
- Never commit service account credentials to version control
- Add `prtd-ga4-credentials.json` to `.gitignore`
- Use environment variables for all sensitive data

## Expected MCP Capabilities

### Analytics Validation Queries
With MCP set up, you can ask:

1. **Event Validation**
   - "Show me all click_external_deal events from today"
   - "What's the conversion rate for deal page visits?"

2. **Real-time Monitoring** 
   - "Show me real-time user activity on the site"
   - "Are there any external deal clicks happening now?"

3. **Performance Analysis**
   - "Which deal categories have the highest click rates?"
   - "Show me user engagement metrics by page type"

4. **Partner Attribution**
   - "Break down external clicks by partner/source"
   - "Show me UTM campaign performance"

## Troubleshooting

### Common Issues
1. **Authentication Error**: Verify service account permissions
2. **Property Access**: Ensure service account has GA4 access
3. **API Quota**: Check if API limits are exceeded
4. **MCP Connection**: Restart Claude Desktop after config changes

### Debug Commands
```bash
# Check service account permissions
gcloud auth activate-service-account --key-file=/home/deploy/prtd-ga4-credentials.json

# Test API access
curl -H "Authorization: Bearer $(gcloud auth print-access-token)" \
"https://analyticsdata.googleapis.com/v1beta/properties/YOUR_PROPERTY_ID:runReport"
```

## Next Steps

1. Complete the Google Cloud setup
2. Install and configure the MCP server
3. Test basic connectivity
4. Start validating your tracking implementation
5. Set up automated health checks (optional)

This setup will give you direct API access to validate that all the analytics events we implemented are working correctly!