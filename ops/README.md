# Ops runbook

## DB auth recovery (`28P01` / `payloadInitError`)

Objaw: `/admin` zwraca `500 payloadInitError`, w logach jest `password authentication failed` dla usera aplikacji.

### 1) Sprawdź env i połączenie

```bash
set -a
source ops/.env
set +a

echo "$DATABASE_URI"
psql "$DATABASE_URI" -v ON_ERROR_STOP=1 -c "select 1;"
```

Jeśli `psql` zwraca błąd auth, hasło usera w Postgres nie zgadza się z `DATABASE_URI`/`POSTGRES_PASSWORD`.

### 2) Zresetuj hasło usera aplikacyjnego

Zaloguj się jako superuser Postgresa (np. `postgres`) i ustaw hasło na wartość z `ops/.env`:

```bash
set -a
source ops/.env
set +a

sudo -u postgres psql -d postgres -v ON_ERROR_STOP=1 \
  -c "ALTER USER \"$POSTGRES_USER\" WITH PASSWORD '$POSTGRES_PASSWORD';"
```

> Jeśli masz niestandardowy host/port, użyj połączenia administracyjnego zgodnie z infrastrukturą.

### 3) Zweryfikuj połączenie userem aplikacji

```bash
set -a
source ops/.env
set +a

psql "$DATABASE_URI" -v ON_ERROR_STOP=1 -c "select current_user, current_database();"
psql "$DATABASE_URI" -v ON_ERROR_STOP=1 -c "select 1;"
```

### 4) Restart procesu aplikacji

```bash
bash ops/scripts/deploy.sh
# lub awaryjnie
pm2 restart forestcatering --update-env
```

Po poprawnym haśle smoke testy z deploy powinny przejść, a `/` i `/admin` zwracać 200.
