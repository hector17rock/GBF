#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

mkdir -p backups

STAMP="$(date +"%Y%m%d_%H%M%S")"
OUT="backups/gbf_${STAMP}.sql"

# Dumps from inside the db container (no host-side pg tools needed).
# Note: this assumes the stack is running (docker compose up -d).
docker compose exec -T db sh -c 'pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB"' > "$OUT"

echo "Wrote $OUT"
