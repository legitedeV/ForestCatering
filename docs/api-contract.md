# API Contract (PrestaShop headless backend)

## Endpointy API

| Zasób | Endpoint | Opis |
|-------|----------|------|
| Produkty | `GET /api/products?filter[active]=1&display=full` | Lista produktów |
| Produkt | `GET /api/products/{id}?display=full` | Szczegóły z features |
| Kategorie | `GET /api/categories?display=full` | Drzewo kategorii |
| Koszyk | `POST /api/carts` | Tworzenie koszyka |
| Zamówienie | `POST /api/orders` | Składanie zamówienia |
| Customizations | `POST /api/customizations` | Dane personalizacji (event) |

## Format

- Request: `Io-Format: JSON`, `Output-Format: JSON`
- Auth: `Authorization: Basic base64(PS_WEBSERVICE_KEY:)`
