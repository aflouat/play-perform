#!/bin/sh
# Applique les migrations de supabase/migrations/ non encore jouées, puis le seed au premier lancement.
# Lancé par le service `db-init` après le démarrage d'Auth (le seed dépend des tables auth.*).
set -eu
export PGHOST=db PGUSER=postgres PGDATABASE=postgres PGPASSWORD="$POSTGRES_PASSWORD"
PSQL="psql -v ON_ERROR_STOP=1 --no-psqlrc -q"

$PSQL -c "create table if not exists public._local_migrations (name text primary key, applied_at timestamptz default now());
          revoke all on public._local_migrations from anon, authenticated;"

first_run=$($PSQL -tAc "select count(*) = 0 from public._local_migrations")

for f in /migrations/*.sql; do
  name=$(basename "$f")
  if [ "$($PSQL -tAc "select 1 from public._local_migrations where name = '$name'")" != "1" ]; then
    echo "→ migration $name"
    $PSQL -1 -f "$f"
    $PSQL -c "insert into public._local_migrations (name) values ('$name')"
  fi
done

if [ "$first_run" = "t" ] && [ -f /seed.sql ]; then
  echo "→ seed"
  $PSQL -1 -f /seed.sql
fi

# PostgREST recharge son cache de schéma (nouvelles tables visibles sans redémarrage)
$PSQL -c "notify pgrst, 'reload schema'"
echo "✓ base à jour"
