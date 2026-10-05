SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MONOREPO_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"

echo Running smp-"$1":latest

docker run \
  --rm -it \
  --platform linux/amd64 \
  --env-file="$MONOREPO_ROOT/.env" \
  -p4000:4000 \
  --name smp-"$1"-container \
  --entrypoint sh \
  -e SKIP_ENV_VALIDATION=true \
  -e REDIS_URL=redis://app-boilerplate-redis-dev:6379 \
  --network app-boilerplate_default \
  smp-"$1":latest
