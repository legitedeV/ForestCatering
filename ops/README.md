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

## DB schema drift recovery (`relation does not exist` / `parserOpenTable`)

Objaw: `/admin` pokazuje błąd przy `Strona nadrzędna`, a logi PM2/Postgres zawierają `relation does not exist`.

### 1) Wykonaj migracje Payload (obowiązkowe)

```bash
cd apps/web
npx payload migrate
```

### 2) Diagnostyka schematu (opcjonalnie)

```bash
cd apps/web
npm run diag:db
```

Skrypt wypisze `current_schema`, `search_path` oraz obecność tabel i kolumn (`pages.path`, `pages.parent_id`, `pages.sort_order`).

### 3) Seed minimalnych danych CMS

```bash
cd apps/web
export ADMIN_EMAIL=admin@example.com
export ADMIN_PASSWORD='ChangeMe!123' # wymagane na production
npm run seed
```

> Dla wymuszenia nadpisania seedowanych rekordów ustaw `SEED_FORCE=true`.

## Frontend unstyled page (`/_next/static` asset diagnostics)

Objaw: strona ładuje się jako "goły HTML" (bez Tailwind/CSS/JS), mimo że `/` odpowiada 200.

### Szybka diagnostyka

```bash
bash ops/scripts/smoke.sh
```

Skrypt sprawdza teraz nie tylko statusy stron, ale także:
- czy w HTML strony głównej są odwołania do `/_next/static/...`,
- czy znalezione assety zwracają `200/304`.

Jeśli assety zwracają `404/5xx`, to najczęściej problem jest w deployu standalone (`.next/static` nie zostało skopiowane) albo w routingu Nginx/proxy.
