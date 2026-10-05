#!/bin/bash
# Switch .env between localhost (for web dev) and your LAN IP (for mobile/Expo).
#
# Usage:
#   ./scripts/set-env.sh mobile   # localhost → current LAN IP; stale LAN IP → current LAN IP
#   ./scripts/set-env.sh local    # any LAN IP → localhost

set -euo pipefail

ENV_FILE="$(dirname "$0")/../.env"

if [ ! -f "$ENV_FILE" ]; then
  echo "❌ .env file not found at $ENV_FILE"
  exit 1
fi

get_local_ip() {
  # macOS: grab the first active en0/en1 IPv4 address
  ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null || {
    echo "❌ Could not detect local IP address" >&2
    exit 1
  }
}

# Host part of http(s)://HOST:... from EXPO_PUBLIC_API_AUTH_URL or API_AUTH_URL (after other edits).
extract_auth_url_host() {
  local line host
  # grep exits 1 when no match — avoid failing the script under pipefail
  line=$( { grep -E '^EXPO_PUBLIC_API_AUTH_URL=' "$ENV_FILE" || true; } | head -1 )
  if [ -z "$line" ]; then
    line=$( { grep -E '^API_AUTH_URL=' "$ENV_FILE" || true; } | head -1 )
  fi
  [ -z "$line" ] && return 0
  host="${line#*=}"
  host="${host#http://}"
  host="${host#https://}"
  host="${host%%:*}"
  printf '%s' "$host"
}

is_ipv4() {
  [[ "$1" =~ ^[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}$ ]]
}

# IP pattern to match any IPv4 address (used for the reverse swap)
IP_REGEX='[0-9]\{1,3\}\.[0-9]\{1,3\}\.[0-9]\{1,3\}\.[0-9]\{1,3\}'

case "${1:-}" in
  mobile)
    IP=$(get_local_ip)
    # Replace localhost (but not in comments or external URLs)
    sed -i '' "s|@localhost:|@${IP}:|g;s|//localhost:|//${IP}:|g" "$ENV_FILE"

    # Replace stale LAN IP (e.g. after changing Wi‑Fi) — host taken from Expo auth URL
    PREV="$(extract_auth_url_host)"
    if [ -n "$PREV" ] && [ "$PREV" != "localhost" ] && is_ipv4 "$PREV" && [ "$PREV" != "$IP" ]; then
      PREV_ESC=$(printf '%s\n' "$PREV" | sed 's/\./\\./g')
      sed -i '' "s|${PREV_ESC}|${IP}|g" "$ENV_FILE"
      echo "✅ Replaced previous LAN host $PREV → $IP (all occurrences in .env)"
    fi

    echo "✅ Switched .env to mobile mode → $IP"
    ;;
  local)
    # Replace any LAN IP back to localhost
    sed -i '' "s|@${IP_REGEX}:|@localhost:|g;s|//${IP_REGEX}:|//localhost:|g" "$ENV_FILE"
    echo "✅ Switched .env to local mode → localhost"
    ;;
  *)
    echo "Usage: $0 {mobile|local}"
    exit 1
    ;;
esac
