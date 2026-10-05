#!/usr/bin/env bash

# Creates the `<name>-<environment>` Cloud Run service for the first time.
#
# Usage: create-service.sh <name> [staging|production]
#   <name> is an app under apps/ that has a Dockerfile and a cloudbuild.yaml
#   (e.g. web, api-auth).
#
# The deploy workflows (deploy-staging.yml / deploy-production.yml) only
# update an existing service: their env validation step reads the service's
# config before deploying. Run this once per app and environment to bootstrap it.

# Exit immediately if a command exits with a non-zero status
set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WORKSPACE_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

APP="$1"
# Determine deployment environment (defaults to staging)
ENVIRONMENT="${2:-staging}"

usage() {
  echo -e "${YELLOW}Usage: $0 <name> [staging|production]${NC}"
}

if [ -z "$APP" ]; then
  echo -e "${RED}❌ Error: Missing service name.${NC}"
  usage
  exit 1
fi

APP_DIR="$WORKSPACE_ROOT/apps/$APP"
CLOUDBUILD_CONFIG="$APP_DIR/cloudbuild.yaml"

if [ ! -f "$APP_DIR/Dockerfile" ] || [ ! -f "$CLOUDBUILD_CONFIG" ]; then
  echo -e "${RED}❌ Error: 'apps/$APP' needs both a Dockerfile and a cloudbuild.yaml.${NC}"
  usage
  exit 1
fi

if [[ "$ENVIRONMENT" != "staging" && "$ENVIRONMENT" != "production" ]]; then
  echo -e "${RED}❌ Error: Invalid environment '${ENVIRONMENT}'. Allowed values: staging, production.${NC}"
  usage
  exit 1
fi

PROJECT_ID="your-gcp-project-id"
REGION="europe-west1"
ARTIFACTS_REPO="app-boilerplate-docker"
SERVICE="$APP-$ENVIRONMENT"

if [ "$ENVIRONMENT" == "staging" ]; then
  DATABASE_URL_SECRET="DATABASE_URL_STAGING"
else
  DATABASE_URL_SECRET="DATABASE_URL_PROD"
fi

# Reuse the app's Cloud Run sizing from its cloudbuild.yaml so both stay in sync
read_deploy_flag() {
  grep -oE -- "--$1=[^[:space:]]+" "$CLOUDBUILD_CONFIG" | head -n 1 | cut -d= -f2
}
MEMORY="$(read_deploy_flag memory)"
CPU="$(read_deploy_flag cpu)"
PORT="$(read_deploy_flag port)"
MEMORY="${MEMORY:-1Gi}"
CPU="${CPU:-1}"
PORT="${PORT:-3000}"

TAG="$(git -C "$WORKSPACE_ROOT" rev-parse --short HEAD)"
IMAGE="$REGION-docker.pkg.dev/$PROJECT_ID/$ARTIFACTS_REPO/$APP:$TAG"

echo -e "${BLUE}===================================================${NC}"
echo -e "${BLUE}  Create Cloud Run service: $SERVICE ${NC}"
echo -e "${BLUE}===================================================${NC}"

# 1. Check gcloud is installed and authenticated
if ! command -v gcloud &> /dev/null; then
  echo -e "${RED}❌ Error: gcloud CLI not found.${NC}"
  exit 1
fi

ACTIVE_ACCOUNT=$(gcloud auth list --filter=status:ACTIVE --format="value(account)" 2>/dev/null || echo "")
if [ -z "$ACTIVE_ACCOUNT" ]; then
  echo -e "${YELLOW}⚠️ No active Google Cloud account found. Launching authentication...${NC}"
  gcloud auth login
else
  echo -e "${GREEN}✅ Authenticated as: $ACTIVE_ACCOUNT${NC}"
fi

# 2. Refuse to touch an existing service — the deploy workflows own updates
if gcloud run services describe "$SERVICE" --project="$PROJECT_ID" --region="$REGION" &> /dev/null; then
  echo -e "${YELLOW}⚠️ Service '$SERVICE' already exists. Deploy updates through the GitHub workflow instead.${NC}"
  exit 1
fi

# 3. Build the image with Cloud Build and push it to Artifact Registry.
# apps/<name>/cloudbuild.yaml is not used here because it also deploys, which
# would create the service without DATABASE_URL and fail on startup.
echo -e "\n${BLUE}🐳 Building $IMAGE with Cloud Build...${NC}"
BUILD_CONFIG="$(mktemp)"
trap 'rm -f "$BUILD_CONFIG"' EXIT

cat <<EOF > "$BUILD_CONFIG"
steps:
  - name: 'gcr.io/cloud-builders/docker'
    args: ['build', '-t', '$IMAGE', '-f', 'apps/$APP/Dockerfile', '.']
images: ['$IMAGE']
options:
  logging: CLOUD_LOGGING_ONLY
EOF

gcloud builds submit \
  --project="$PROJECT_ID" \
  --config="$BUILD_CONFIG" \
  "$WORKSPACE_ROOT"

# 4. Create the Cloud Run service from that image
echo -e "\n${BLUE}🚀 Creating Cloud Run service $SERVICE (memory=$MEMORY, cpu=$CPU, port=$PORT)...${NC}"
if ! gcloud run deploy "$SERVICE" \
  --project="$PROJECT_ID" \
  --image="$IMAGE" \
  --region="$REGION" \
  --platform=managed \
  --port="$PORT" \
  --memory="$MEMORY" \
  --cpu="$CPU" \
  --allow-unauthenticated \
  --set-secrets="DATABASE_URL=$DATABASE_URL_SECRET:latest"; then
  echo -e "${YELLOW}💡 If the error mentions secret access, grant roles/secretmanager.secretAccessor on '$DATABASE_URL_SECRET' to the Cloud Run runtime service account.${NC}"
  exit 1
fi

echo -e "\n${GREEN}🎉 Service '$SERVICE' created. Future deploys run through the GitHub workflow.${NC}"
