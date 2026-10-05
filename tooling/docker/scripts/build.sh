#!/bin/bash

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MONOREPO_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"

# Load environment variables from root .env if not skipped
if [ "$SKIP_ENV_LOADING" != "true" ] && [ -f "$MONOREPO_ROOT/.env" ]; then
  set -a
  # shellcheck source=/dev/null
  source "$MONOREPO_ROOT/.env"
  set +a
else
  echo "Skipping .env loading"
fi

echo "Building $1..."
echo "Current directory: $(pwd)"

# Add --no-cache when NO_CACHE=true to force a full rebuild
CACHE_FLAG=""
if [ "$NO_CACHE" = "true" ]; then
  echo "Building without cache..."
  CACHE_FLAG="--no-cache"
fi

# Build Docker image
docker buildx build \
  --platform=linux/amd64 \
  $CACHE_FLAG \
  --build-arg TURBO_TOKEN="$TURBO_TOKEN" \
  --build-arg TURBO_TEAM="$TURBO_TEAM" \
  --tag smp-"$1":latest \
  --progress plain \
  --file "$MONOREPO_ROOT/apps/$1/Dockerfile" \
  "$MONOREPO_ROOT"

