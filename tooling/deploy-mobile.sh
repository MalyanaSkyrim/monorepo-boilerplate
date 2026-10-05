#!/usr/bin/env bash

# Exit immediately if a command exits with a non-zero status
set -e

# Clear visual formatting codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Determine deployment environment (defaults to staging)
ENVIRONMENT="${1:-${ENVIRONMENT:-staging}}"

if [[ "$ENVIRONMENT" != "staging" && "$ENVIRONMENT" != "production" ]]; then
  echo -e "${RED}❌ Error: Invalid environment '${ENVIRONMENT}'. Allowed values: staging, production.${NC}"
  echo -e "${YELLOW}Usage: $0 [staging|production]${NC}"
  exit 1
fi

echo -e "${BLUE}===================================================${NC}"
echo -e "${BLUE}  App Boilerplate iOS TestFlight Deployment ($ENVIRONMENT) ${NC}"
echo -e "${BLUE}===================================================${NC}"

# 1. Check OS (Must be macOS to compile iOS apps)
if [[ "$OSTYPE" != "darwin"* ]]; then
  echo -e "${RED}❌ Error: iOS builds can only be performed on macOS (darwin).${NC}"
  exit 1
fi

# Define paths
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WORKSPACE_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
MOBILE_APP_DIR="$WORKSPACE_ROOT/apps/mobile"

# Load local environment files if present
load_env_file() {
  local env_path=$1
  if [ -f "$env_path" ]; then
    echo -e "${GREEN}ℹ️ Loading environment from $(basename "$env_path")...${NC}"
    local exports
    exports=$(node -e '
      const fs = require("fs");
      const envPath = process.argv[1];
      if (!fs.existsSync(envPath)) process.exit(0);
      const content = fs.readFileSync(envPath, "utf8");
      const lines = content.split(/\r?\n/);
      let i = 0;
      while (i < lines.length) {
        let line = lines[i].trim();
        i++;
        if (!line || line.startsWith("#")) continue;
        const eqIdx = line.indexOf("=");
        if (eqIdx === -1) continue;
        const key = line.substring(0, eqIdx).trim();
        let val = line.substring(eqIdx + 1).trim();
        
        if (val.startsWith("\"")) {
          while (!val.endsWith("\"") || (val.endsWith("\\\"") && !val.endsWith("\\\\\""))) {
            if (i >= lines.length) break;
            val += "\n" + lines[i];
            i++;
          }
          val = val.substring(1, val.length - 1)
                   .replace(/\\n/g, "\n")
                   .replace(/\\"/g, "\"");
        } else if (val.startsWith("\x27")) {
          while (!val.endsWith("\x27") || (val.endsWith("\\\x27") && !val.endsWith("\\\\\x27"))) {
            if (i >= lines.length) break;
            val += "\n" + lines[i];
            i++;
          }
          val = val.substring(1, val.length - 1);
        }
        console.log(`export ${key}=\x27${val.replace(/\x27/g, "\x27\\\\\\\x27\x27")}\x27`);
      }
    ' "$env_path" 2>/dev/null || echo "")

    if [ -n "$exports" ]; then
      eval "$exports"
    fi
  fi
}

load_env_file "$MOBILE_APP_DIR/.env"
load_env_file "$MOBILE_APP_DIR/.env.local"
load_env_file "$SCRIPT_DIR/.env"


fetch_secret() {
  local secret_name=$1
  local is_sensitive=$2
  local value=""

  # Double-check if the gcloud CLI is available
  if command -v gcloud &> /dev/null; then
    value=$(gcloud secrets versions access latest --secret="${secret_name}" 2>/dev/null || echo "")
  fi
  
  if [ -z "$value" ]; then
    # Only show warning for secrets that are expected to be in GCP Secret Manager (others are in GitHub Secrets)
    if [[ "$secret_name" == "GOOGLE_OAUTH_CLIENT_IDS" ]]; then
      echo -e "${YELLOW}⚠️ Warning: Failed to retrieve secret '${secret_name}' from GCP Secret Manager.${NC}" >&2
    fi
    
    # Prompt manually only if stdin is an interactive terminal
    if [ -t 0 ]; then
      if [ "$is_sensitive" = "true" ]; then
        read -s -p "Please enter '${secret_name}' manually: " value
        echo "" >&2
      else
        read -p "Please enter '${secret_name}' manually: " value
      fi
    else
      echo -e "${RED}❌ Error: '${secret_name}' is not set, and the terminal is non-interactive.${NC}" >&2
      echo -e "${YELLOW}💡 Please add '${secret_name}' to your local environment file (e.g., tooling/.env or apps/mobile/.env.local).${NC}" >&2
      exit 1
    fi
    
    if [ -z "$value" ]; then
      echo -e "${RED}❌ Error: '${secret_name}' cannot be empty.${NC}" >&2
      exit 1
    fi
  fi
  echo "$value"
}

# 2. Check and Perform Google Cloud Authentication if we have missing variables
needs_gcp_fetch=false
REQUIRED_VARS=(
  "APPLE_ID"
  "APPLE_TEAM_ID"
  "APP_STORE_CONNECT_KEY_ID"
  "APP_STORE_CONNECT_ISSUER_ID"
  "APP_STORE_CONNECT_PRIVATE_KEY"
  "MATCH_PASSWORD"
)

for var in "${REQUIRED_VARS[@]}"; do
  if [ -z "${!var}" ]; then
    needs_gcp_fetch=true
  fi
done

if [ "$needs_gcp_fetch" = true ]; then
  if command -v gcloud &> /dev/null; then
    echo -e "${BLUE}🔐 Verifying Google Cloud Authentication...${NC}"
    ACTIVE_ACCOUNT=$(gcloud auth list --filter=status:ACTIVE --format="value(account)" 2>/dev/null || echo "")

    if [ -z "$ACTIVE_ACCOUNT" ]; then
      echo -e "${YELLOW}⚠️ No active Google Cloud account found. Launching authentication...${NC}"
      gcloud auth login
      ACTIVE_ACCOUNT=$(gcloud auth list --filter=status:ACTIVE --format="value(account)" 2>/dev/null || echo "")
      if [ -z "$ACTIVE_ACCOUNT" ]; then
        echo -e "${RED}❌ Error: Authentication failed or was cancelled.${NC}"
        exit 1
      fi
    else
      echo -e "${GREEN}✅ Authenticated as: $ACTIVE_ACCOUNT${NC}"
    fi

    # Set GCP Project ID
    PROJECT_ID=$(gcloud config get-value project 2>/dev/null || echo "")
    if [ -z "$PROJECT_ID" ] || [ "$PROJECT_ID" == "(unset)" ]; then
      read -p "Enter your Google Cloud Project ID: " PROJECT_ID
      if [ -z "$PROJECT_ID" ]; then
        echo -e "${RED}❌ Error: Google Cloud Project ID is required.${NC}"
        exit 1
      fi
      gcloud config set project "$PROJECT_ID"
    else
      echo -e "${GREEN}✅ Active GCP Project: $PROJECT_ID${NC}"
    fi
  else
    echo -e "${YELLOW}⚠️ Warning: gcloud CLI not found. You will be prompted to enter missing variables manually.${NC}"
  fi
fi

# 3. Fetch Required Fastlane Deploy Secrets (Only if not already set)
echo -e "\n${BLUE}🔐 Validating Deployment Secrets...${NC}"
if [ -z "$APPLE_ID" ]; then export APPLE_ID=$(fetch_secret "APPLE_ID" "false"); fi
if [ -z "$APPLE_TEAM_ID" ]; then export APPLE_TEAM_ID=$(fetch_secret "APPLE_TEAM_ID" "false"); fi
if [ -z "$APP_STORE_CONNECT_KEY_ID" ]; then export APP_STORE_CONNECT_KEY_ID=$(fetch_secret "APP_STORE_CONNECT_KEY_ID" "false"); fi
if [ -z "$APP_STORE_CONNECT_ISSUER_ID" ]; then export APP_STORE_CONNECT_ISSUER_ID=$(fetch_secret "APP_STORE_CONNECT_ISSUER_ID" "false"); fi
if [ -z "$APP_STORE_CONNECT_PRIVATE_KEY" ]; then export APP_STORE_CONNECT_PRIVATE_KEY=$(fetch_secret "APP_STORE_CONNECT_PRIVATE_KEY" "true"); fi
if [ -z "$MATCH_PASSWORD" ]; then export MATCH_PASSWORD=$(fetch_secret "FASTLANE_MATCH_PASSWORD" "true"); fi

# 4. Fetch App Config Secrets (always regenerate .env for targeted environment)
echo -e "\n${BLUE}🔐 Retrieving App Configuration Secrets from Secret Manager for '$ENVIRONMENT'...${NC}"
if [ -n "$GOOGLE_OAUTH_CLIENT_IDS" ]; then
  GOOGLE_IDS="$GOOGLE_OAUTH_CLIENT_IDS"
else
  GOOGLE_IDS=$(fetch_secret "GOOGLE_OAUTH_CLIENT_IDS" "false")
fi

IFS=',' read -r -a array <<< "$GOOGLE_IDS"
WEB_CLIENT_ID="${array[0]}"
ANDROID_CLIENT_ID="${array[1]}"
IOS_CLIENT_ID="${array[2]}"

# Determine API endpoints based on environment
if [ "$ENVIRONMENT" == "staging" ]; then
  # TODO: replace with your deployed auth API URLs
  API_AUTH_URL="https://api-auth-staging.example.com"
else
  API_AUTH_URL="https://api-auth.example.com"
fi

# Write dynamic .env next to deploy script (tooling/.env)
cat <<EOF > "$SCRIPT_DIR/.env"
APP_ENV=$ENVIRONMENT
ENVIRONMENT=$ENVIRONMENT
EXPO_PUBLIC_API_AUTH_URL=$API_AUTH_URL
EXPO_PUBLIC_API_AUTH_PORT=

EXPO_PUBLIC_GOOGLE_OAUTH_WEB_CLIENT_ID=$WEB_CLIENT_ID
EXPO_PUBLIC_GOOGLE_OAUTH_ANDROID_CLIENT_ID=$ANDROID_CLIENT_ID
EXPO_PUBLIC_GOOGLE_OAUTH_IOS_CLIENT_ID=$IOS_CLIENT_ID

EXPO_PUBLIC_APPLE_SIGN_IN_ANDROID_SERVICE_ID=${APPLE_SIGN_IN_SERVICE_ID:-}
EXPO_PUBLIC_APPLE_SIGN_IN_ANDROID_REDIRECT_URI=$API_AUTH_URL/v1/auth/oauth/apple/android/callback

APPLE_ID='$APPLE_ID'
APPLE_TEAM_ID='$APPLE_TEAM_ID'
APP_STORE_CONNECT_KEY_ID='$APP_STORE_CONNECT_KEY_ID'
APP_STORE_CONNECT_ISSUER_ID='$APP_STORE_CONNECT_ISSUER_ID'
APP_STORE_CONNECT_PRIVATE_KEY='$APP_STORE_CONNECT_PRIVATE_KEY'
MATCH_PASSWORD='$MATCH_PASSWORD'
MATCH_GIT_URL='${MATCH_GIT_URL:-}'
EOF
echo -e "${GREEN}✅ Generated tooling/.env successfully for '$ENVIRONMENT'.${NC}"

# 5. Install Monorepo Dependencies
echo -e "\n${BLUE}📦 Installing monorepo dependencies...${NC}"
cd "$WORKSPACE_ROOT"
pnpm install --frozen-lockfile

# 6. Run Expo Prebuild
echo -e "\n${BLUE}⚙️ Generating iOS Native Project (Expo Prebuild)...${NC}"
cd "$MOBILE_APP_DIR"
EXPO_USE_PNPM=1 MOBILE_DEPLOY=1 pnpm exec expo prebuild --platform ios --no-install

# 7. Apply modular headers fix to generated Podfile
echo -e "\n${BLUE}🔧 Configuring Podfile for modular headers...${NC}"
ruby -e "lines = File.read('ios/Podfile'); File.write('ios/Podfile', \"use_modular_headers!\n\n\" + lines)"

# 8. Setup Ruby Bundler and Install Pods
echo -e "\n${BLUE}💎 Installing Ruby gems and CocoaPods...${NC}"
bundle install
cd ios
bundle exec pod install
cd ..

# 9. Trigger Fastlane Deployment
echo -e "\n${BLUE}🚀 Deploying to App Store Connect / TestFlight via Fastlane ($ENVIRONMENT)...${NC}"
export RCT_NO_LAUNCH_PACKAGER=1
bundle exec fastlane deploy

echo -e "\n${GREEN}🎉 Deployment process completed successfully for '$ENVIRONMENT'!${NC}"
