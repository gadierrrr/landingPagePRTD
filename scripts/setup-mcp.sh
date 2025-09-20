#!/bin/bash

# MCP Setup Script for PRTD Analytics Validation
# This script sets up the Model Context Protocol server for GA4 validation

set -e

echo "🚀 Setting up MCP for PRTD Analytics Validation..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if required environment variables are set
check_env_vars() {
    echo -e "${BLUE}📋 Checking environment variables...${NC}"
    
    if [ -z "$GA4_PROPERTY_ID" ]; then
        echo -e "${RED}❌ GA4_PROPERTY_ID not set${NC}"
        echo "Please set it with: export GA4_PROPERTY_ID=your_property_id"
        exit 1
    fi
    
    if [ -z "$GOOGLE_APPLICATION_CREDENTIALS" ]; then
        echo -e "${YELLOW}⚠️  GOOGLE_APPLICATION_CREDENTIALS not set, using default path${NC}"
        export GOOGLE_APPLICATION_CREDENTIALS="/home/deploy/prtd-ga4-credentials.json"
    fi
    
    if [ ! -f "$GOOGLE_APPLICATION_CREDENTIALS" ]; then
        echo -e "${RED}❌ Credentials file not found: $GOOGLE_APPLICATION_CREDENTIALS${NC}"
        echo "Please download your service account key and place it there"
        exit 1
    fi
    
    echo -e "${GREEN}✅ Environment variables OK${NC}"
}

# Install Python dependencies
install_dependencies() {
    echo -e "${BLUE}📦 Installing Python dependencies...${NC}"
    
    # Check if pip is available
    if ! command -v pip3 &> /dev/null; then
        echo -e "${YELLOW}Installing pip...${NC}"
        sudo apt-get update
        sudo apt-get install -y python3-pip
    fi
    
    # Install pipx for isolated package management
    if ! command -v pipx &> /dev/null; then
        echo -e "${YELLOW}Installing pipx...${NC}"
        python3 -m pip install --user pipx
        python3 -m pipx ensurepath
        source ~/.bashrc
    fi
    
    # Install the official Google Analytics MCP server
    echo -e "${YELLOW}Installing analytics-mcp...${NC}"
    pipx install analytics-mcp
    
    # Install validation script dependencies
    echo -e "${YELLOW}Installing validation dependencies...${NC}"
    pip3 install -r /home/deploy/prtd/scripts/requirements.txt
    
    echo -e "${GREEN}✅ Dependencies installed${NC}"
}

# Create MCP configuration
create_mcp_config() {
    echo -e "${BLUE}⚙️  Creating MCP configuration...${NC}"
    
    # Create Claude desktop config directory
    mkdir -p ~/.claude
    
    # Create MCP configuration
    cat > ~/.claude/claude_desktop_config.json << EOF
{
  "mcpServers": {
    "prtd-analytics": {
      "command": "pipx",
      "args": [
        "run",
        "analytics-mcp"
      ],
      "env": {
        "GOOGLE_APPLICATION_CREDENTIALS": "$GOOGLE_APPLICATION_CREDENTIALS",
        "GA4_PROPERTY_ID": "$GA4_PROPERTY_ID"
      }
    }
  }
}
EOF
    
    echo -e "${GREEN}✅ MCP configuration created${NC}"
}

# Test the setup
test_setup() {
    echo -e "${BLUE}🧪 Testing MCP setup...${NC}"
    
    # Test Google Analytics API connection
    echo -e "${YELLOW}Testing API connection...${NC}"
    python3 -c "
import os
from google.analytics.data_v1beta import BetaAnalyticsDataClient
from google.oauth2 import service_account

try:
    credentials = service_account.Credentials.from_service_account_file(
        os.environ['GOOGLE_APPLICATION_CREDENTIALS'],
        scopes=['https://www.googleapis.com/auth/analytics.readonly']
    )
    client = BetaAnalyticsDataClient(credentials=credentials)
    print('✅ API connection successful')
except Exception as e:
    print(f'❌ API connection failed: {e}')
    exit(1)
"
    
    # Test MCP server
    echo -e "${YELLOW}Testing MCP server...${NC}"
    if pipx list | grep -q analytics-mcp; then
        echo -e "${GREEN}✅ MCP server installed${NC}"
    else
        echo -e "${RED}❌ MCP server not found${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ Setup test passed${NC}"
}

# Run validation
run_validation() {
    echo -e "${BLUE}🔍 Running initial analytics validation...${NC}"
    
    cd /home/deploy/prtd
    python3 scripts/validate-analytics.py
    
    echo -e "${GREEN}✅ Validation complete${NC}"
}

# Create helpful aliases
create_aliases() {
    echo -e "${BLUE}🔗 Creating helpful aliases...${NC}"
    
    # Add aliases to bashrc if they don't exist
    if ! grep -q "# PRTD Analytics Aliases" ~/.bashrc; then
        cat >> ~/.bashrc << 'EOF'

# PRTD Analytics Aliases
alias prtd-validate="cd /home/deploy/prtd && python3 scripts/validate-analytics.py"
alias prtd-mcp-status="pipx list | grep analytics-mcp"
alias prtd-ga4-test="python3 -c 'from google.analytics.data_v1beta import BetaAnalyticsDataClient; print(\"GA4 API available\")'"
EOF
        echo -e "${GREEN}✅ Aliases added to ~/.bashrc${NC}"
    fi
}

# Main setup function
main() {
    echo -e "${GREEN}🎯 PRTD MCP Analytics Validation Setup${NC}"
    echo "========================================"
    
    check_env_vars
    install_dependencies
    create_mcp_config
    test_setup
    run_validation
    create_aliases
    
    echo ""
    echo -e "${GREEN}🎉 MCP Setup Complete!${NC}"
    echo ""
    echo -e "${BLUE}Next steps:${NC}"
    echo "1. Restart Claude Desktop to load MCP configuration"
    echo "2. In Claude Desktop, you can now ask questions like:"
    echo "   - 'Show me GA4 events from the last 7 days'"
    echo "   - 'What are the top external deal clicks?'"
    echo "   - 'Show me real-time analytics data'"
    echo ""
    echo -e "${BLUE}Manual validation:${NC}"
    echo "Run: ${YELLOW}prtd-validate${NC} (after source ~/.bashrc)"
    echo ""
    echo -e "${BLUE}Logs and results:${NC}"
    echo "Check: /home/deploy/prtd/analytics-validation-*.json"
}

# Run the setup
main "$@"