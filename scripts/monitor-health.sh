#!/bin/bash
# PRTD Health Monitoring Script
# Checks service health and sends alerts if unhealthy

set -euo pipefail

HEALTH_URL="https://puertoricotraveldeals.com/api/health"
LOG_FILE="/var/log/prtd/health-monitor.log"
ALERT_EMAIL="${ALERT_EMAIL:-admin@puertoricotraveldeals.com}"
MAX_FAILURES="${MAX_FAILURES:-3}"
FAILURE_COUNT_FILE="/tmp/prtd-health-failures"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" | tee -a "$LOG_FILE"
}

send_alert() {
    local status="$1"
    local message="$2"
    
    # Simple email alert (requires mail command)
    if command -v mail >/dev/null 2>&1; then
        {
            echo "PRTD Health Alert - Status: $status"
            echo "Time: $(date)"
            echo "Server: $(hostname)"
            echo ""
            echo "Message: $message"
            echo ""
            echo "Check details at: $HEALTH_URL"
        } | mail -s "PRTD Health Alert: $status" "$ALERT_EMAIL"
    fi
    
    # Log alert
    log "ALERT: $status - $message"
}

check_health() {
    local response
    local http_code
    local health_status
    
    # Make health check request with timeout
    response=$(curl -s -w "%{http_code}" --max-time 10 "$HEALTH_URL" 2>/dev/null || echo "000")
    http_code="${response: -3}"
    
    if [[ "$http_code" != "200" ]]; then
        return 1
    fi
    
    # Parse JSON response to get status
    health_status=$(echo "${response%???}" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    print(data.get('status', 'unknown'))
except:
    print('unknown')
" 2>/dev/null || echo "unknown")
    
    if [[ "$health_status" == "healthy" ]]; then
        return 0
    elif [[ "$health_status" == "degraded" ]]; then
        return 2
    else
        return 1
    fi
}

main() {
    local current_failures=0
    
    # Read current failure count
    if [[ -f "$FAILURE_COUNT_FILE" ]]; then
        current_failures=$(cat "$FAILURE_COUNT_FILE" 2>/dev/null || echo "0")
    fi
    
    # Perform health check
    if check_health; then
        # Service is healthy
        if [[ "$current_failures" -gt 0 ]]; then
            log "Service recovered - was failing $current_failures times"
            send_alert "RECOVERY" "Service is now healthy after $current_failures failures"
            echo "0" > "$FAILURE_COUNT_FILE"
        else
            log "Service healthy"
        fi
    elif [[ $? -eq 2 ]]; then
        # Service is degraded
        log "Service degraded - continuing to monitor"
        if [[ "$current_failures" -eq 0 ]]; then
            send_alert "DEGRADED" "Service is in degraded state"
        fi
    else
        # Service is unhealthy
        ((current_failures++))
        echo "$current_failures" > "$FAILURE_COUNT_FILE"
        
        log "Service unhealthy - failure count: $current_failures/$MAX_FAILURES"
        
        if [[ "$current_failures" -ge "$MAX_FAILURES" ]]; then
            send_alert "CRITICAL" "Service has failed $current_failures consecutive health checks"
        fi
    fi
}

# Create log directory if it doesn't exist
mkdir -p "$(dirname "$LOG_FILE")"

# Run health check
main "$@"