# TransferMundo — Smartvel API Pilot Specification

**SCOPE_MODE:** `PILOT_10`
**Document status:** Discovery — not approved for implementation
**Prepared:** 2026-08-06
**For review by:** Guus (commercial/scope decisions), Pranay (technical review), Smartvel (requirements clarification)

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Confirmed Scope](#2-confirmed-scope)
3. [Current Data Architecture](#3-current-data-architecture)
4. [Field-Level Data Inventory](#4-field-level-data-inventory)
5. [Data Quality Assessment](#5-data-quality-assessment)
6. [Proposed Smartvel Pilot Scope](#6-proposed-smartvel-pilot-scope)
7. [Proposed API Contract](#7-proposed-api-contract)
8. [Example Payloads](#8-example-payloads)
9. [Data Adapter and Publishing Design](#9-data-adapter-and-publishing-design)
10. [Security and Operational Requirements](#10-security-and-operational-requirements)
11. [Commercial Decision List](#11-commercial-decision-list)
12. [Smartvel Discovery Questions](#12-smartvel-discovery-questions)
13. [Implementation Phases and Dependencies](#13-implementation-phases-and-dependencies)
14. [Acceptance Criteria](#14-acceptance-criteria)
15. [Repository Files Likely to Change After Approval](#15-repository-files-likely-to-change-after-approval)
16. [What Guus Must Decide](#16-what-guus-must-decide)
17. [What Pranay Should Review](#17-what-pranay-should-review)
18. [What Must Wait for Smartvel's Response](#18-what-must-wait-for-smartvels-response)
19. [Final Status Summary](#19-final-status-summary)

---

## 1. Executive Summary

TransferMundo currently operates as a static Next.js website. All airport, destination, and transport data is maintained in a single hand-curated CSV file (`data/airports.csv`). There is no public API, no database, and no programmatic external data interface.

Smartvel has asked whether it can integrate TransferMundo data into its Travel Tips product.

This document defines:
- what data exists and in what condition
- what a credible read-only API contract would look like for the 10 current airports
- what must be built, decided, and verified before any API can be called ready
- what Smartvel must clarify before the scope is final

**What this document is not:**
- An implemented API
- A committed delivery timeline
- A claim that any API currently exists

No code has been written or changed as part of producing this document.

---

## 2. Confirmed Scope

### PILOT_10 airports

Verified from `data/airports.csv` and confirmed by the test assertion `expect(airports.length).toBe(10)` in `__tests__/airports.test.ts`:

| # | IATA | ICAO | Airport Name                   | Country        | Destinations | Last Update |
|---|------|------|--------------------------------|----------------|--------------|-------------|
| 1 | AMS  | EHAM | Amsterdam Airport Schiphol     | Netherlands    | 1            | May 2024    |
| 2 | BER  | EDDB | Berlin Brandenburg Airport     | Germany        | 1            | Mar 2026    |
| 3 | BSL  | LFSB | Basel Mulhouse Freiburg Airport| Switzerland    | 3            | Feb 2024    |
| 4 | BUD  | LHBP | Budapest Airport               | Hungary        | 1            | Jan 2024    |
| 5 | CDG  | LFPG | Paris Charles de Gaulle Airport| France         | 1            | Mar 2025    |
| 6 | DUB  | EIDW | Dublin Airport                 | Ireland        | 1            | Nov 2025    |
| 7 | FCO  | LIRF | Rome Fiumicino Airport         | Italy          | 1            | Apr 2024    |
| 8 | HEL  | EFHK | Helsinki Airport               | Finland        | 1            | Feb 2024    |
| 9 | MAD  | LEMD | Madrid Barajas Airport         | Spain          | 1            | Feb 2024    |
|10 | STN  | EGSS | London Stansted Airport        | United Kingdom | 2            | Apr 2024    |

All 10 airports are in Europe. The dataset covers 9 countries and 10 currencies (EUR, GBP, CHF, HUF — see data quality section).

### Representative example airports for this document

Three airports were selected to maximise representative diversity in the example payloads:

- **AMS** — single destination, Distribusion ticketing integration, EUR, clear data
- **STN** — two destinations (London + Cambridge), GBP pricing, multiple transport modes
- **BSL** — three destinations (Basel, Mulhouse, Freiburg), multi-currency (CHF + EUR), unique tri-city serving geography

---

## 3. Current Data Architecture

### Data flow (verified)

```
Google Sheets (editorial source — Verified as primary, based on column names)
      ↓ manual export (Inferred — no automated export script exists in repo)
data/airports.csv  ← single flat file, all 10 airports
      ↓
lib/airports.ts → getAirports()
  - reads file synchronously at cold-start (readFileSync)
  - parses with csv-parse/sync (columns: true)
  - maps each row to Airport object
  - caches result in module-level variable (_cache)
      ↓
app/[slug]/page.tsx → generateStaticParams()
  - iterates all airports, generates one static page per slug
      ↓
airport page (HTML, statically generated at build time)
  - displays destinations and transport options
  - constructs affiliate links via lib/attribution.ts at page render
```

### Step-by-step analysis

| Step | Source/File | Reader | Writer | Validation | Fallback |
|------|-------------|--------|--------|------------|----------|
| Source data | Google Sheets (Inferred) | Guus (manual) | Guus (manual) | None (Inferred) | None |
| Export | Manual CSV export (Inferred) | — | Guus (manual) | None | None |
| Repository file | `data/airports.csv` | `lib/airports.ts` | Human | None enforced | — |
| Parsing | `csv-parse/sync` | `getAirports()` | — | `columns: true`, `skip_empty_lines: true` | Empty string via `col()` helper |
| Numeric fields | `parseFloat()` / `parseInt()` | `getAirports()` | — | Falls back to `0` on parse failure | `0` |
| Transport options | Positional columns 11–33 | `parseTransportOption()` | — | Returns `null` if type empty or "not available" | Omitted from array |
| Affiliate links | `lib/attribution.ts` | Page render | — | Regex `/^[A-Z]{4}$/` for Distribusion codes | Falls back to timetable link |
| Page output | Next.js static build | Browser | — | None at runtime | `notFound()` for unknown slug |

### Verified facts
- The CSV is the single source of truth for the Next.js application.
- There is no database.
- There is no API route of any kind.
- Affiliate link construction happens at render time in `lib/attribution.ts` and is not stored in the CSV.
- `getAirports()` is called once at build/module-load time and cached — it is not request-time.
- The "Last updated: [month]" label on airport pages is generated dynamically as `new Date() - 1 month` — it does **not** reflect the CSV `Last update` field.

### Inferred facts (not confirmed)
- The CSV is exported from a Google Sheet maintained by Guus.
- No automated sync or CI validation runs on the CSV.
- No row-level validation or quarantine exists for invalid records.

### Unknown
- How frequently the sheet is updated.
- Whether the sheet has more rows/airports than the current CSV export.
- Whether there is a staging export process.

---

## 4. Field-Level Data Inventory

### Airport-level fields

| Field | CSV Column | Type in Model | Required | Reliability | Externally Exposable | Notes |
|-------|-----------|---------------|----------|-------------|----------------------|-------|
| `name` | `Airport name` | `string` | Yes | Rock-solid | Yes | Used as page title |
| `iata` | `IATA airport code` | `string` | Yes | Rock-solid | Yes | 3-char uppercase, tested |
| `icao` | `ICAO airport code` | `string` | Yes | Rock-solid | Yes | 4-char uppercase |
| `slug` | Derived from `name` | `string` | Yes | Rock-solid | Yes | Derived, not stored |
| `country` | `Country` | `string` | Yes | Rock-solid | Yes | Free-form, not ISO 3166 |
| `continent` | `Continent` | `string` | Yes | Solid | Yes | Free-form ("Europe") |
| `address` | `Address` | `string` | Optional | Solid | Yes | Human-readable string |
| `location` | `Location` | `string` | Optional | Solid | Yes | e.g. "southwest of Amsterdam" |
| `alsoKnownAs` | `Also known as` | `string` | Optional | Solid | Yes | Multiple aliases, comma-separated |
| `terminals` | `Number of terminals` | `string` | Optional | Solid | Yes | Free-form ("2 (T1 and T2)") |
| `passengers2023` | `Number of passengers 2023` | `string` | Optional | Solid | Yes | Formatted string with commas |
| `operator` | `Airport operator` | `string` | Optional | Partial | Yes | Empty for BSL, BER |
| `goodToKnow` | `Good to know` | `string` | Optional | Partial | Yes | Filled for AMS, BER, MAD only |
| `moneySavingTip` | `Money-saving tip` | `string` | Optional | Partial | Yes | Filled for CDG, AMS only |
| `appPublicTransport` | `App public transport tickets` | `string` | Optional | Sparse | Yes | Filled for BER and HEL only |
| `googleScore` | `Google airport score` | `number` | Optional | Solid | Yes | Parsed float, 0 fallback |
| `googleReviews` | `Number of reviews` | `string` | Optional | Solid | Yes | Value + "K" appended in code |
| `lastUpdate` | `Last update` | `string` | Optional | Partial | Yes, with caveat | Editorial string ("May 2024"), not ISO date |
| `carRental.location` | `Car rental - Location car rental companies` | `string` | Optional | Solid | No (affiliate context) | Internal affiliate detail |
| `carRental.eur/gbp/usd` | `Car rental EUR/GBP/USD` | `number` | Optional | Partial | No (affiliate pricing) | Indicative only, not live |
| `carRental.popular` | `Car rental populair` | `boolean` | Optional | Solid | No | Internal display flag |
| **Geographic coordinates** | — | — | — | **Not present** | N/A | No lat/lng in any record |

### Destination-level fields

| Field | CSV Column Pattern | Type | Reliability | Externally Exposable | Notes |
|-------|-------------------|------|-------------|----------------------|-------|
| `name` | `Destination {n}` | `string` | Rock-solid | Yes | |
| `cityCenter` | `City centre {n}` | `string` | Solid | Yes | Landmark name |
| `distanceKm` | `Distance to city centre km {n}` | `number` | Solid | Yes | Parsed float |
| `distanceMiles` | `Distance to city centre miles {n}` | `number` | Solid | Yes | Parsed float |
| `transportOptionsCount` | `Transport options including taxi {n}` | `number` | Solid | Yes | Includes taxi in count |
| `fastest.mode` | `Fastest {n}1` | `string` | Solid | Yes | Free-form text |
| `fastest.time` | `Fastest {n}2` | `string` | Solid | Yes | Free-form ("47 minutes") |
| `fastest.price` | `Fastest {n}3` | `string` | Solid | Yes, with caveat | Indicative only |
| `cheapest.mode` | `Cheapest {n}1` | `string` | Solid | Yes | Free-form text |
| `cheapest.time` | `Cheapest {n}2` | `string` | Solid | Yes | Free-form |
| `cheapest.price` | `Cheapest {n}3` | `string` | Solid | Yes, with caveat | Indicative only |
| `taxi.time` | `Taxi - Travel time to city centre {n}` | `string` | Solid | Yes | Free-form |
| `taxi.fare` | `Taxi fare {n}` | `string` | Solid | Yes, with caveat | Indicative only |
| `gygQuery` | Derived/overridden in code | `string \| undefined` | Solid | **No** | Internal GetYourGuide widget query — do not expose |

### Transport option fields

| Field | CSV Column Pattern | Type | Reliability | Externally Exposable | Notes |
|-------|-------------------|------|-------------|----------------------|-------|
| `type` | `Transportation option {n}{m}` | `string` | Solid | Yes | e.g. "Public transport Train" |
| `boardingLocation` | `Location station/stop at airport {n}{m}` | `string` | Solid | Yes | |
| `serviceName` | `Service name {n}{m}` | `string` | Solid | Yes | e.g. "Stansted Express" |
| `operator` | `Operator {n}{m}` | `string` | Solid | Yes | e.g. "Greater Anglia" |
| `mainStations` | `Main stations {n}{m}` | `string` | Solid | Yes | Comma-list of stops |
| `timetableLink` | `Timetable link {n}{m}` | `string` (URL) | Solid | Yes | External URL |
| `buyTicketsLink` | `Buy tickets {n}{m}` | `string` | Solid | **Conditional** | May be Distribusion carrier code (NTRA, TSCO, etc.) or HTTP URL — do not expose raw codes |
| `travelTime` | `Travel time {n}{m}` | `string` | Solid | Yes | Free-form |
| `frequency` | `Frequency {n}{m}` | `string` | Solid | Yes | Free-form |
| `priceAdult` | `One-way adults {n}{m}` | `string` | Solid | Yes, with caveat | Includes currency, indicative only |
| `priceChild` | `One-way children {n}{m}` | `string` | Solid | Yes, with caveat | Includes currency, indicative only |

### Fields absent from the dataset

| Field | Status | Impact |
|-------|--------|--------|
| Geographic coordinates (lat, lng) | Not present | Cannot support map-based queries |
| ISO 4217 currency codes | Not present — embedded in price strings | API must parse or label prices as strings |
| ISO 8601 last-checked dates | Not present — editorial strings only | Cannot support freshness filtering |
| Availability status | Not present | Cannot flag routes as active/discontinued |
| Language variants | Not present — English only | Cannot support multilingual response without translation pipeline |
| Source URL at transport level | Not present | Cannot link to original data source per route |
| Unique destination identifiers | Not present — name only | Destinations have no stable ID |

---

## 5. Data Quality Assessment

### Overall rating by airport

| IATA | Transport Data | Prices | Dates | Narrative Fields | Rating |
|------|---------------|--------|-------|-----------------|--------|
| AMS  | Complete | EUR, solid | May 2024 | goodToKnow ✓ | Strong |
| BER  | Complete | EUR, solid | Mar 2026 | goodToKnow ✓, appPublicTransport ✓ | Strong |
| MAD  | Complete | EUR, solid | Feb 2024 | goodToKnow ✓ | Strong |
| CDG  | Complete | EUR, solid | Mar 2025 | moneySavingTip ✓ | Strong |
| FCO  | Complete | EUR, solid | Apr 2024 | none | Solid |
| DUB  | Complete | EUR, solid | Nov 2025 | none | Solid |
| STN  | Complete | GBP, solid | Apr 2024 | none | Solid |
| HEL  | Complete | EUR, solid | Feb 2024 | appPublicTransport ✓ | Solid |
| BUD  | Complete | HUF, formatted strings | Jan 2024 | none | Usable — HUF prices need care |
| BSL  | Complete | CHF + EUR mixed | Feb 2024 | none | Usable — multi-currency per destination |

### Critical data quality findings

**1. Prices are indicative, not live.**
All prices in the CSV are manually maintained. They are not pulled from any live ticketing or pricing API. They must not be presented as current or guaranteed fares. Example: `priceAdult = "5.00 EUR"` for AMS train.

**2. No ISO date format for `lastUpdate`.**
The field contains editorial strings like `"Mar 2026"` or `"May 2024"`. These cannot be parsed as ISO 8601 without transformation. Some records are over 18 months old (BUD: Jan 2024, BSL: Feb 2024).

**3. The website "Last updated" label is misleading.**
`lastUpdatedLabel()` in `app/[slug]/page.tsx` returns the previous calendar month dynamically — it does not reflect the CSV `Last update` field. The API must use the actual CSV field and must not mimic the page's dynamic label.

**4. `buyTicketsLink` contains internal codes.**
For Distribusion-integrated routes, the CSV value is a 4-letter carrier code (e.g., `NTRA`, `TSCO`, `STEX`, `DEXE`, `ACOA`, `DBAH`, `AAER`, `URAI`, `NEXP`, `TERR`). These are affiliate-routing identifiers. They must never be exposed raw in an external API. The resolved URL (constructed in `lib/attribution.ts` with retailer partner number `455363`) may be exposable subject to commercial decision.

**5. No geographic coordinates.**
No lat/lng data exists for any airport or destination. Map-based queries are not possible without a separate enrichment step.

**6. Prices embed currency symbols in text strings.**
Examples: `"5.50 EUR"`, `"10,800 HUF"`, `"50 CHF"`. There is no separate numeric amount and ISO currency code. Parsing these requires a transformation step before structured JSON delivery.

**7. `operator` field missing for two airports.**
BSL and BER have empty `operator` fields in the CSV.

**8. Narrative fields sparsely populated.**
`goodToKnow`, `moneySavingTip`, `appPublicTransport` are filled for only a subset of airports. See table above.

**9. Destinations have no stable identifier.**
Destination identity is name-only. If Smartvel caches data by destination and the name changes in the CSV (e.g., "Paris" vs. "Paris (CDG)"), cache invalidation breaks silently.

**10. Maximum structural limits.**
The schema supports a maximum of 3 destinations per airport and 3 transport options per destination per direction. This is a hard limit imposed by the flat CSV column naming (`Destination 1-3`, `Transportation option 11-33`).

---

## 6. Proposed Smartvel Pilot Scope

### Airports included
All 10 PILOT_10 airports: AMS, BER, BSL, BUD, CDG, DUB, FCO, HEL, MAD, STN.

### Destinations included
All destinations within those airports (12 total: 9 airports × 1 destination, STN × 2, BSL × 3).

### Languages included
English only. No other language data exists in the current dataset.

### Content included
- Airport name, IATA, ICAO, country, continent
- Airport location, address, also-known-as, terminal count, passenger count (2023)
- Airport operator (where populated)
- Editorial narrative fields: `goodToKnow`, `moneySavingTip`, `appPublicTransport` (nullable)
- Destination name and city centre landmark
- Distance airport → city centre (km and miles)
- Fastest transport mode summary (mode, time, indicative price)
- Cheapest transport mode summary (mode, time, indicative price) — where different from fastest
- Taxi summary (time, indicative fare)
- Per transport option: type, boarding location, service name, operator, main stations, timetable link, travel time, frequency, indicative adult price, indicative child price

### Provider booking links
Exposing booking links requires a commercial decision (see Section 11). Two possible stances:

**Option A — Timetable links only:** Expose `timetableLink` for each transport option. These are stable external URLs (e.g., `https://www.ns.nl/en`). No affiliate revenue implication.

**Option B — Resolved booking links:** Expose the resolved `buyTicketsLink` URL (after transforming Distribusion codes to full URLs). This passes affiliate tracking through Distribusion. Requires Smartvel to agree not to rewrite or strip tracking parameters.

**Recommendation for pilot:** Start with timetable links only (Option A). Resolve booking link policy in commercial negotiations.

### Fields excluded
- `carRental.*` — internal affiliate pricing configuration
- `buyTicketsLink` raw values — contain internal carrier codes
- `gygQuery` — internal GetYourGuide widget configuration
- `carRental.popular` — internal display flag
- Distribusion retailer partner number — internal affiliate identifier
- Taxi affiliate URL parameters — internal

### Reference data classification
**All data in this pilot is reference information, not live information.**

Indicative prices, timetable frequencies, and journey times reflect the state of the data at the editorial `lastUpdate` date in the CSV. They are not polled from live sources. Smartvel must display these with appropriate caveats and must not present them as guaranteed or real-time fares.

---

## 7. Proposed API Contract

### Base URL (proposed)
```
https://api.transfermundo.com/v1
```

This URL does not exist. It is a proposal. The actual hostname is subject to infrastructure decisions.

### Versioning strategy
- URL-path versioning: `/v1/`, `/v2/`
- The major version increments on breaking schema changes (field removal, type change, structural change).
- Additive changes (new optional fields) do not increment the major version.
- Response bodies include `api_version` and `schema_version` fields for client-side detection.
- Deprecated endpoints remain available for a minimum of 6 months after deprecation notice.

### Authentication
- API-key authentication via `Authorization: Bearer <key>` header.
- One key per Smartvel environment (pilot key, production key).
- Keys are created and revoked out-of-band (no key self-service in pilot).
- Requests without a valid key return `401 Unauthorized`.

### Rate limiting (pilot)
- 60 requests per minute per API key.
- Response includes headers: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`.
- Exceeding the limit returns `429 Too Many Requests`.

### Request format
- All requests: `GET` only (read-only API).
- No request body.
- Query parameters for filtering and language (see per-endpoint definitions).

### Response format
All responses:
- `Content-Type: application/json`
- UTF-8 encoding
- Top-level envelope with `meta` and `data` keys

### Cache behaviour
- Responses may be cached by clients for up to 24 hours (`Cache-Control: public, max-age=86400`).
- Smartvel must honour the dataset version in the response and invalidate its local cache on version change.
- The API does not implement server-side push or webhooks in the pilot.

---

### Endpoint: GET /v1/meta

**Purpose:** Returns API health, version, and current dataset version. Smartvel should poll this before deciding whether to refresh its local cache.

**Authentication:** Required.

**Parameters:** None.

**Response schema:**

```json
{
  "meta": {
    "api_version": "string",
    "schema_version": "string",
    "generated_at": "string (ISO 8601)",
    "status": "string (ok | degraded)"
  },
  "data": {
    "dataset_version": "string",
    "dataset_published_at": "string (ISO 8601)",
    "airport_count": "integer",
    "language": "string (BCP 47)"
  }
}
```

**Error responses:**
- `500 Internal Server Error` — dataset unavailable

---

### Endpoint: GET /v1/airports

**Purpose:** Returns the list of all airports in the pilot dataset, with summary fields only. No destination or transport detail.

**Authentication:** Required.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `lang` | string | No | BCP 47 language code. Only `en` supported in pilot. Defaults to `en`. Unknown values return `400`. |

**Validation:**
- `lang` must be `en` or absent.

**Response schema:**

```json
{
  "meta": {
    "api_version": "string",
    "schema_version": "string",
    "generated_at": "string (ISO 8601)",
    "dataset_version": "string",
    "language": "string"
  },
  "data": {
    "airports": [
      {
        "iata": "string",
        "icao": "string",
        "name": "string",
        "slug": "string",
        "country": "string",
        "continent": "string",
        "destination_count": "integer",
        "last_update": "string"
      }
    ],
    "total": "integer"
  }
}
```

**Pagination:** Not required in pilot (10 airports). Pagination headers may be added in a future version without breaking the schema.

**Missing-data behaviour:** `last_update` is returned as-is from the CSV editorial string. If empty, returns `null`.

**Not-found:** This endpoint always returns the full list — no 404 path.

---

### Endpoint: GET /v1/airports/{iata}

**Purpose:** Returns full airport record including narrative fields and destination summaries. Does not include transport option detail.

**Authentication:** Required.

**Path parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `iata` | string | Yes | 3-character IATA code, uppercase. |

**Validation:**
- `iata` must match `/^[A-Z]{3}$/`. Invalid format → `400 Bad Request`.
- `iata` not in dataset → `404 Not Found`.

**Response schema:**

```json
{
  "meta": {
    "api_version": "string",
    "schema_version": "string",
    "generated_at": "string (ISO 8601)",
    "dataset_version": "string",
    "language": "string"
  },
  "data": {
    "iata": "string",
    "icao": "string",
    "name": "string",
    "slug": "string",
    "country": "string",
    "continent": "string",
    "address": "string | null",
    "location": "string | null",
    "also_known_as": "string | null",
    "terminals": "string | null",
    "passengers_2023": "string | null",
    "operator": "string | null",
    "google_score": "number | null",
    "google_reviews": "string | null",
    "good_to_know": "string | null",
    "money_saving_tip": "string | null",
    "app_public_transport": "string | null",
    "last_update": "string | null",
    "destinations": [
      {
        "name": "string",
        "city_center": "string",
        "distance_km": "number",
        "distance_miles": "number",
        "transport_options_count": "integer",
        "fastest": {
          "mode": "string",
          "time": "string",
          "indicative_price": "string | null"
        },
        "cheapest": {
          "mode": "string | null",
          "time": "string | null",
          "indicative_price": "string | null"
        },
        "taxi": {
          "time": "string | null",
          "indicative_fare": "string | null"
        }
      }
    ],
    "attribution": {
      "source": "TransferMundo",
      "source_url": "string",
      "data_type": "reference"
    }
  }
}
```

**Missing-data behaviour:**
- Nullable string fields return `null` when the CSV column is empty.
- `cheapest` object returns `null` mode/time/price if the cheapest mode is the same as fastest, or missing.
- `google_score` returns `null` (not `0`) when the CSV value is empty or unparseable.

**Not-found response:**
```json
{
  "meta": { "api_version": "1", "schema_version": "1.0", "generated_at": "..." },
  "error": {
    "code": "AIRPORT_NOT_FOUND",
    "message": "No airport found with IATA code 'XYZ'.",
    "iata": "XYZ"
  }
}
```
HTTP status: `404`

**Validation-error response:**
```json
{
  "meta": { "api_version": "1", "schema_version": "1.0", "generated_at": "..." },
  "error": {
    "code": "INVALID_IATA",
    "message": "IATA code must be exactly 3 uppercase letters.",
    "received": "am5"
  }
}
```
HTTP status: `400`

---

### Endpoint: GET /v1/airports/{iata}/destinations

**Purpose:** Returns the list of destinations served from the airport, with transport option summaries.

**Authentication:** Required.

**Path parameters:** Same as `/v1/airports/{iata}`.

**Response schema:**

```json
{
  "meta": { ... },
  "data": {
    "iata": "string",
    "airport_name": "string",
    "destinations": [
      {
        "name": "string",
        "city_center": "string",
        "distance_km": "number",
        "distance_miles": "number",
        "transport_options_count": "integer",
        "taxi": {
          "time": "string | null",
          "indicative_fare": "string | null"
        },
        "fastest": {
          "mode": "string",
          "time": "string",
          "indicative_price": "string | null"
        },
        "cheapest": {
          "mode": "string | null",
          "time": "string | null",
          "indicative_price": "string | null"
        }
      }
    ]
  }
}
```

---

### Endpoint: GET /v1/airports/{iata}/destinations/{destination}/transport

**Purpose:** Returns full transport option detail for a specific destination.

**Authentication:** Required.

**Path parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `iata` | string | 3-character IATA code, uppercase |
| `destination` | string | URL-encoded destination name (e.g., `London`, `Basel`) |

**Design note:** Destinations do not have stable IDs in the current dataset. The destination name is the only identifier. This is a known fragility — if Smartvel caches transport data by destination name and the name is corrected in the CSV (e.g., capitalisation change), the client's cache key will miss. A stable destination ID should be introduced before production.

**Validation:**
- `iata` must match `/^[A-Z]{3}$/`
- `destination` must URL-decode to a non-empty string
- If the destination is not found under that airport → `404 Not Found`

**Response schema:**

```json
{
  "meta": { ... },
  "data": {
    "iata": "string",
    "airport_name": "string",
    "destination": "string",
    "city_center": "string",
    "distance_km": "number",
    "distance_miles": "number",
    "data_type": "reference",
    "price_disclaimer": "Prices are indicative and may not reflect current fares. Verify before travel.",
    "transport_options": [
      {
        "type": "string",
        "boarding_location": "string | null",
        "service_name": "string | null",
        "operator": "string | null",
        "main_stations": "string | null",
        "travel_time": "string | null",
        "frequency": "string | null",
        "indicative_price_adult": "string | null",
        "indicative_price_child": "string | null",
        "timetable_url": "string | null",
        "booking_url": "string | null"
      }
    ],
    "taxi": {
      "time": "string | null",
      "indicative_fare": "string | null",
      "booking_url": "string | null"
    }
  }
}
```

**`booking_url` field:** Included or excluded depending on commercial decision (see Section 11). In pilot, set to `null` unless agreed.

**Not-found response (destination):**
```json
{
  "error": {
    "code": "DESTINATION_NOT_FOUND",
    "message": "No destination 'München' found for airport AMS.",
    "iata": "AMS",
    "destination": "München"
  }
}
```
HTTP status: `404`

---

### Endpoint: GET /v1/airports/{iata}/destinations/{destination}/transport — stale data variant

When the `last_update` for the airport is older than a configurable staleness threshold (e.g., 12 months), the response includes a `data_quality` warning:

```json
{
  "meta": { ... },
  "data": {
    ...
    "data_quality": {
      "status": "stale",
      "last_update": "Jan 2024",
      "warning": "This data has not been reviewed in over 12 months. Prices and timetables may have changed."
    }
  }
}
```

When data is current (within threshold):
```json
"data_quality": {
  "status": "current",
  "last_update": "Mar 2026"
}
```

---

### Error response reference

| HTTP Status | Error Code | Condition |
|-------------|-----------|-----------|
| `400` | `INVALID_IATA` | IATA does not match `[A-Z]{3}` |
| `400` | `INVALID_LANG` | `lang` parameter is not `en` |
| `400` | `INVALID_PARAMETER` | Any other invalid query parameter |
| `401` | `UNAUTHORIZED` | Missing or invalid API key |
| `404` | `AIRPORT_NOT_FOUND` | IATA not in dataset |
| `404` | `DESTINATION_NOT_FOUND` | Destination name not found under airport |
| `429` | `RATE_LIMIT_EXCEEDED` | Too many requests |
| `500` | `INTERNAL_ERROR` | Unexpected server error |
| `503` | `DATASET_UNAVAILABLE` | Dataset not loaded or failed to parse |

---

## 8. Example Payloads

All example values are drawn directly from `data/airports.csv`. Fields labelled **[existing]** are present in the CSV. Fields labelled **[derived]** are computed from CSV values. Fields labelled **[proposed]** do not exist yet and must be added. Fields labelled **[unavailable]** have no current data source.

---

### 8.1 GET /v1/airports — airport list response

```json
{
  "meta": {
    "api_version": "1",
    "schema_version": "1.0",
    "generated_at": "2026-08-06T09:00:00Z",
    "dataset_version": "2026-08-01-001",
    "language": "en"
  },
  "data": {
    "total": 10,
    "airports": [
      {
        "iata": "AMS",
        "icao": "EHAM",
        "name": "Amsterdam Airport Schiphol",
        "slug": "amsterdam-airport-schiphol",
        "country": "Netherlands",
        "continent": "Europe",
        "destination_count": 1,
        "last_update": "May 2024"
      },
      {
        "iata": "BER",
        "icao": "EDDB",
        "name": "Berlin Brandenburg Airport",
        "slug": "berlin-brandenburg-airport",
        "country": "Germany",
        "continent": "Europe",
        "destination_count": 1,
        "last_update": "Mar 2026"
      },
      {
        "iata": "BSL",
        "icao": "LFSB",
        "name": "Basel Mulhouse Freiburg Airport",
        "slug": "basel-mulhouse-freiburg-airport",
        "country": "Switzerland",
        "continent": "Europe",
        "destination_count": 3,
        "last_update": "Feb 2024"
      },
      {
        "iata": "BUD",
        "icao": "LHBP",
        "name": "Budapest Airport",
        "slug": "budapest-airport",
        "country": "Hungary",
        "continent": "Europe",
        "destination_count": 1,
        "last_update": "Jan 2024"
      },
      {
        "iata": "CDG",
        "icao": "LFPG",
        "name": "Paris Charles de Gaulle Airport",
        "slug": "paris-charles-de-gaulle-airport",
        "country": "France",
        "continent": "Europe",
        "destination_count": 1,
        "last_update": "Mar 2025"
      },
      {
        "iata": "DUB",
        "icao": "EIDW",
        "name": "Dublin Airport",
        "slug": "dublin-airport",
        "country": "Ireland",
        "continent": "Europe",
        "destination_count": 1,
        "last_update": "Nov 2025"
      },
      {
        "iata": "FCO",
        "icao": "LIRF",
        "name": "Rome Fiumicino Airport",
        "slug": "rome-fiumicino-airport",
        "country": "Italy",
        "continent": "Europe",
        "destination_count": 1,
        "last_update": "Apr 2024"
      },
      {
        "iata": "HEL",
        "icao": "EFHK",
        "name": "Helsinki Airport",
        "slug": "helsinki-airport",
        "country": "Finland",
        "continent": "Europe",
        "destination_count": 1,
        "last_update": "Feb 2024"
      },
      {
        "iata": "MAD",
        "icao": "LEMD",
        "name": "Madrid Barajas Airport",
        "slug": "madrid-barajas-airport",
        "country": "Spain",
        "continent": "Europe",
        "destination_count": 1,
        "last_update": "Feb 2024"
      },
      {
        "iata": "STN",
        "icao": "EGSS",
        "name": "London Stansted Airport",
        "slug": "london-stansted-airport",
        "country": "United Kingdom",
        "continent": "Europe",
        "destination_count": 2,
        "last_update": "Apr 2024"
      }
    ]
  }
}
```

Field status:
- `iata`, `icao`, `name`, `slug`, `country`, `continent`, `destination_count`, `last_update` — **[existing]**
- `slug` — **[derived]** (computed from airport name in `lib/airports.ts`)
- `dataset_version` — **[proposed]** (does not exist; must be generated at publish time)
- `generated_at` — **[proposed]**

---

### 8.2 GET /v1/airports/AMS — airport detail response

```json
{
  "meta": {
    "api_version": "1",
    "schema_version": "1.0",
    "generated_at": "2026-08-06T09:00:00Z",
    "dataset_version": "2026-08-01-001",
    "language": "en"
  },
  "data": {
    "iata": "AMS",
    "icao": "EHAM",
    "name": "Amsterdam Airport Schiphol",
    "slug": "amsterdam-airport-schiphol",
    "country": "Netherlands",
    "continent": "Europe",
    "address": "Evert van de Beekstraat 202, 1118 CP Schiphol, Netherlands",
    "location": "southwest of Amsterdam",
    "also_known_as": "Amsterdam Airport and Schiphol Airport",
    "terminals": "1",
    "passengers_2023": "61,887,628",
    "operator": "Schiphol Group",
    "google_score": 3.9,
    "google_reviews": "81.9K",
    "good_to_know": "In the Netherlands travelling with an OV-chipkaart is cheaper than buying single tickets. Check in and out with your debit card, credit card or mobile is another option (called OVpay).",
    "money_saving_tip": null,
    "app_public_transport": null,
    "last_update": "May 2024",
    "destinations": [
      {
        "name": "Amsterdam",
        "city_center": "Dam Square",
        "distance_km": 17,
        "distance_miles": 10.6,
        "transport_options_count": 3,
        "fastest": {
          "mode": "Public transport Train",
          "time": "16 minutes",
          "indicative_price": "5.50 EUR per person"
        },
        "cheapest": {
          "mode": "Public transport Train",
          "time": "16 minutes",
          "indicative_price": "5.50 EUR per person"
        },
        "taxi": {
          "time": "25 minutes",
          "indicative_fare": "71 EUR"
        }
      }
    ],
    "attribution": {
      "source": "TransferMundo",
      "source_url": "https://www.transfermundo.com/amsterdam-airport-schiphol",
      "data_type": "reference"
    }
  }
}
```

Field status: All fields **[existing]** except `dataset_version`, `generated_at`, `attribution.source_url` which are **[proposed]**.

Note: `money_saving_tip` and `app_public_transport` are `null` because these columns are empty in the AMS CSV row. **[existing — empty]**

---

### 8.3 GET /v1/airports/STN — multi-destination airport response

```json
{
  "meta": {
    "api_version": "1",
    "schema_version": "1.0",
    "generated_at": "2026-08-06T09:00:00Z",
    "dataset_version": "2026-08-01-001",
    "language": "en"
  },
  "data": {
    "iata": "STN",
    "icao": "EGSS",
    "name": "London Stansted Airport",
    "slug": "london-stansted-airport",
    "country": "United Kingdom",
    "continent": "Europe",
    "address": "Bassingbourn Road, Essex CM24 1QW, United Kingdom",
    "location": "northeast of London",
    "also_known_as": "Stansted Airport",
    "terminals": "1",
    "passengers_2023": "27,951,116",
    "operator": "MAG",
    "google_score": 3.3,
    "google_reviews": "35.1K",
    "good_to_know": null,
    "money_saving_tip": null,
    "app_public_transport": null,
    "last_update": "Apr 2024",
    "destinations": [
      {
        "name": "London",
        "city_center": "Charing Cross",
        "distance_km": 63,
        "distance_miles": 39.1,
        "transport_options_count": 3,
        "fastest": {
          "mode": "Public transport Train - Stansted Express",
          "time": "47 minutes",
          "indicative_price": "23 GBP per person"
        },
        "cheapest": {
          "mode": "Bus service - National Express (services A5, A6, A7, A8)",
          "time": "1 hour and 10 minutes",
          "indicative_price": "18 GBP per person"
        },
        "taxi": {
          "time": "1 hour and 10 minutes",
          "indicative_fare": "105 GBP"
        }
      },
      {
        "name": "Cambridge",
        "city_center": "Cambridge Market Square",
        "distance_km": 50,
        "distance_miles": 31.1,
        "transport_options_count": 3,
        "fastest": {
          "mode": "Public transport Train",
          "time": "35 minutes",
          "indicative_price": "14 GBP per person"
        },
        "cheapest": {
          "mode": "Public transport Train",
          "time": "35 minutes",
          "indicative_price": "14 GBP per person"
        },
        "taxi": {
          "time": "45 minutes",
          "indicative_fare": "80 GBP"
        }
      }
    ],
    "attribution": {
      "source": "TransferMundo",
      "source_url": "https://www.transfermundo.com/london-stansted-airport",
      "data_type": "reference"
    }
  }
}
```

---

### 8.4 GET /v1/airports/AMS/destinations/Amsterdam/transport — full transport detail

```json
{
  "meta": {
    "api_version": "1",
    "schema_version": "1.0",
    "generated_at": "2026-08-06T09:00:00Z",
    "dataset_version": "2026-08-01-001",
    "language": "en"
  },
  "data": {
    "iata": "AMS",
    "airport_name": "Amsterdam Airport Schiphol",
    "destination": "Amsterdam",
    "city_center": "Dam Square",
    "distance_km": 17,
    "distance_miles": 10.6,
    "data_type": "reference",
    "price_disclaimer": "Prices are indicative and may not reflect current fares. Verify before travel.",
    "data_quality": {
      "status": "stale",
      "last_update": "May 2024",
      "warning": "This data has not been reviewed in over 12 months. Prices and timetables may have changed."
    },
    "transport_options": [
      {
        "type": "Public transport Train",
        "boarding_location": "Schiphol Airport train station, below Schiphol Plaza",
        "service_name": "Airport Sprinter",
        "operator": "NS Nederlandse Spoorwegen",
        "main_stations": "Amsterdam Lelylaan, Amsterdam Sloterdijk and Amsterdam Centraal",
        "travel_time": "16 minutes to Amsterdam Centraal railway station",
        "frequency": "8 times per hour",
        "indicative_price_adult": "5.50 EUR",
        "indicative_price_child": "2.50 EUR (up to 11 years)",
        "timetable_url": "https://www.ns.nl/en",
        "booking_url": null
      },
      {
        "type": "Public transport Bus",
        "boarding_location": "Bus stop B17-B19 in front of the airport",
        "service_name": "Bus 397 (Amsterdam Airport Express)",
        "operator": "Connexxion",
        "main_stations": "Olympic Stadium, Concertgebouw, Museumplein and Leidseplein",
        "travel_time": "35 minutes to Leidseplein (city centre)",
        "frequency": "every 7.5 to 15 minutes",
        "indicative_price_adult": "6.50 EUR",
        "indicative_price_child": "6.50 EUR (from 5 years)",
        "timetable_url": "https://www.connexxion.nl/en/our-routes/special-routes/amsterdam-airport-express",
        "booking_url": null
      }
    ],
    "taxi": {
      "time": "25 minutes",
      "indicative_fare": "71 EUR",
      "booking_url": null
    }
  }
}
```

Field status:
- All transport option fields — **[existing]**
- `booking_url` — **[proposed]**, set to `null` pending commercial decision
- `data_quality.status` — **[proposed]**
- `price_disclaimer` — **[proposed]**

Note: The AMS row in the CSV has only 2 transport options (Train and Bus). The CSV structure supports up to 3 (slots 11, 12, 13), but `Transportation option 13` is empty for AMS — correctly omitted here.

---

### 8.5 GET /v1/airports/BSL/destinations/Freiburg/transport — multi-currency example

```json
{
  "meta": {
    "api_version": "1",
    "schema_version": "1.0",
    "generated_at": "2026-08-06T09:00:00Z",
    "dataset_version": "2026-08-01-001",
    "language": "en"
  },
  "data": {
    "iata": "BSL",
    "airport_name": "Basel Mulhouse Freiburg Airport",
    "destination": "Freiburg",
    "city_center": "Altstadt",
    "distance_km": 75,
    "distance_miles": 46.6,
    "data_type": "reference",
    "price_disclaimer": "Prices are indicative and may not reflect current fares. Verify before travel.",
    "data_quality": {
      "status": "stale",
      "last_update": "Feb 2024",
      "warning": "This data has not been reviewed in over 12 months. Prices and timetables may have changed."
    },
    "transport_options": [
      {
        "type": "Bus service",
        "boarding_location": "FlixBus bus stop, in front of terminal (French sector)",
        "service_name": "FlixBus",
        "operator": "FlixBus",
        "main_stations": "Busbahnhof ZOB am Freiburg Hauptbahnhof",
        "travel_time": "55 minutes to Busbahnhof ZOB am Freiburg Hauptbahnhof",
        "frequency": "1 time per hour",
        "indicative_price_adult": "33 EUR",
        "indicative_price_child": "33 EUR",
        "timetable_url": "https://www.flixbus.com/bus/basel-euroairport",
        "booking_url": null
      }
    ],
    "taxi": {
      "time": "50 minutes",
      "indicative_fare": "125 EUR",
      "booking_url": null
    }
  }
}
```

---

### 8.6 Airport not found — 404 response

```json
{
  "meta": {
    "api_version": "1",
    "schema_version": "1.0",
    "generated_at": "2026-08-06T09:00:00Z"
  },
  "error": {
    "code": "AIRPORT_NOT_FOUND",
    "message": "No airport found with IATA code 'LHR'.",
    "iata": "LHR"
  }
}
```

HTTP status: `404`. (LHR is not in the PILOT_10 dataset — this is an example of a real IATA code that is simply not covered.)

---

### 8.7 Destination not found — 404 response

```json
{
  "meta": {
    "api_version": "1",
    "schema_version": "1.0",
    "generated_at": "2026-08-06T09:00:00Z"
  },
  "error": {
    "code": "DESTINATION_NOT_FOUND",
    "message": "No destination 'Oxford' found for airport STN.",
    "iata": "STN",
    "destination": "Oxford"
  }
}
```

HTTP status: `404`

---

### 8.8 Stale or incomplete data indicator

Already embedded in the transport detail response (Section 8.4 and 8.5). The `data_quality` object is present in every `/transport` response. Status is `stale` when `last_update` is older than the configured staleness threshold. Status is `current` otherwise.

```json
"data_quality": {
  "status": "current",
  "last_update": "Mar 2026"
}
```

---

## 9. Data Adapter and Publishing Design

### Design principle
The API must never read the Google Sheet directly on a live request. The sheet is an operational editorial tool, not a data service. A controlled publishing flow is required.

### Proposed flow

```
Google Sheet (editorial source, maintained by Guus)
      ↓ manual or triggered export
CSV export (airports.csv)
      ↓
Import script (new — not yet built)
  ├─ Row validation
  │    - IATA must match /^[A-Z]{3}$/
  │    - ICAO must match /^[A-Z]{4}$/
  │    - Airport name must be non-empty
  │    - Country must be non-empty
  │    - At least 1 destination must be present
  │    - All URL fields must be valid HTTP/HTTPS or empty
  │    - Distribusion codes must be /^[A-Z]{4}$/ or empty
  │    - Numeric fields (distanceKm, distanceMiles, googleScore) must parse without NaN
  │    - Price strings must be non-empty for transport options with a type
  ├─ Schema validation
  │    - All required columns present
  │    - No unexpected column headers
  ├─ Duplicate detection
  │    - No duplicate IATA codes in the import
  ├─ Required-field checks
  │    - Any row missing IATA, name, or country is quarantined
  ├─ URL validation
  │    - HEAD or format check on timetable URLs
  ├─ Invalid-record quarantine
  │    - Quarantined rows do not block a valid import; they are logged for review
      ↓
Validated import report (human review step)
  - Guus reviews quarantined rows before publication approval
      ↓ approval
Versioned dataset snapshot
  - JSON file or database record
  - Version string: YYYY-MM-DD-{sequence} (e.g., "2026-08-01-001")
  - Published timestamp: ISO 8601
  - Includes dataset hash for integrity
      ↓
API response (served from snapshot)
```

### Rollback
The previous published dataset is retained. If an import produces a bad snapshot or fails validation, the API continues to serve the last valid snapshot. Failed imports must be logged with full error detail.

### Dataset versioning
Each published snapshot has a unique version string. The API returns this version in every response. Clients that detect a version change should refresh their local cache.

### Staleness threshold
Configurable at deployment time. Proposed default: 12 months. Records with `last_update` older than this threshold receive `data_quality.status = "stale"` in API responses. This is a warning, not an omission — stale records are still served.

### Audit history
Each import is logged:
- source file hash
- import timestamp
- validator results (pass/quarantine counts)
- publishing decision (approved/rejected)
- version string if approved
- operator (who approved)

### Delivery path comparison

#### A. Manually generated versioned JSON snapshot

**What it proves:** The data can be serialised into a stable, versioned format that Smartvel can consume.

**What it does not prove:** That the pipeline is automated, sustainable, or will stay in sync with the sheet.

**Dependencies:** Guus manually exports and runs the snapshot script each time data changes.

**Operational burden:** High (fully manual). Error-prone.

**Data risks:** Snapshot can drift from sheet immediately after export. No validation enforced.

**Suitability for pilot:** Adequate for a proof-of-concept that Smartvel can parse and render the data.

**Suitability for production:** Not suitable.

**Migration path to B/C/D:** Low — snapshot format becomes the canonical API response model.

---

#### B. Automated validated export from Google Sheets

**What it proves:** That the sheet can be the authoritative source and that validation is enforced before publication.

**What it does not prove:** Real-time availability. No live transport data.

**Dependencies:** Sheets API access (OAuth), import script, validation layer, approval step.

**Operational burden:** Medium. Requires maintaining a Sheets API integration and approval workflow.

**Data risks:** Sheet must be structured consistently. Column-name changes break the importer.

**Suitability for pilot:** Strong. Validates the editorial-to-API pipeline without a database.

**Suitability for production:** Adequate for low-update-frequency reference data.

**Migration path to C:** Snapshot output from B becomes the snapshot served by C.

---

#### C. Read-only API backed by a validated snapshot (Recommended for pilot)

**What it proves:** That Smartvel can make real HTTP API calls against a stable, versioned contract. This is the minimum viable Smartvel integration test.

**What it does not prove:** Live data, database-backed scaling, or high traffic capacity.

**Dependencies:** B (validated export), a minimal HTTP server (e.g., Vercel Edge function or Next.js API route serving a pre-built JSON snapshot), domain and TLS.

**Operational burden:** Low once B is in place. API is stateless and serves a static snapshot.

**Data risks:** Same as B. Dataset version lag between sheet and API is acceptable for reference data.

**Suitability for pilot:** Best fit. Gives Smartvel a genuine integration test without a throwaway contract.

**Suitability for production:** Acceptable for reference data with low update frequency (weekly/monthly). Not suitable if live pricing or availability is later required.

**Migration path to D:** The API contract defined here survives migration to Postgres. Only the data layer changes.

---

#### D. API backed by Supabase / Postgres

**What it proves:** That the system can support programmatic updates, row-level validation, and higher traffic.

**What it does not prove:** That the data quality is better than the sheet. Schema must still be enforced at import time.

**Dependencies:** All of A, B, C plus: database provisioning, migration scripts, connection management, backup policy.

**Operational burden:** High. Requires database operations, migration management, connection pooling.

**Data risks:** Schema drift between Postgres and API contract if not managed carefully.

**Suitability for pilot:** Overkill. Adds significant setup cost for no benefit in the pilot window.

**Suitability for production:** Required if update frequency increases (daily), if traffic scales significantly, or if live data is later introduced.

**Migration path:** The API contract defined in Option C is forward-compatible with Option D. No client changes required on migration.

### Recommendation

**Option C** — read-only API backed by a validated snapshot — is the recommended path for the Smartvel pilot.

It is the smallest option that gives Smartvel a genuine integration test, establishes a stable API contract, and does not create a throwaway demo or a parallel source of truth.

Option B (automated export) should be implemented alongside C to reduce the manual burden. Option A (fully manual snapshot) may be used for the initial proof-of-concept before B is ready, but must not be called a production pipeline.

Option D should be planned but not built until pilot data shows a clear need.

---

## 10. Security and Operational Requirements

### Pilot requirements

**Authentication:**
- One API key per Smartvel environment.
- Keys issued manually by Guus or Pranay.
- Keys stored as environment variables, not in code.
- Key revocation is manual (update environment variable, redeploy).

**Rate limiting:**
- 60 requests/minute per key (configurable).
- Exceeding limit returns `429` with `Retry-After` header.

**Request logging:**
- Every request logged: timestamp, endpoint, IATA param, HTTP status, response time, API key hash (not raw key).
- Logs stored for 30 days minimum.

**Error logging:**
- All `4xx` and `5xx` responses logged with full request context.
- Import failures logged with full error detail.

**Usage reporting:**
- Weekly request count report by endpoint available on demand.

**Dataset version visibility:**
- `/v1/meta` endpoint exposes current dataset version and published timestamp at all times.

**Protection of affiliate configuration:**
- `lib/attribution.ts` (Distribusion retailer partner number, taxi affiliate base URL, lounge partner URL) is never exposed via the API.
- Raw Distribusion carrier codes from the CSV are never returned in API responses.

**Prevention of sheet/database exposure:**
- The API serves only from the validated snapshot. There is no passthrough to the sheet or any internal storage.

### Production requirements (future — not pilot scope)

- Automated key rotation
- mTLS or IP allowlisting for high-value keys
- Structured log shipping to an observability platform
- SLA definition and monitoring
- Automated alerting on error-rate spikes
- CDN caching layer
- Dataset rollback automation
- Security review of the hosting environment

---

## 11. Commercial Decision List

The following decisions are required before implementation. None have been made. All are flagged for business and legal review.

| # | Decision | Options | Impact if deferred |
|---|----------|---------|-------------------|
| 1 | **TransferMundo attribution in Smartvel UI** | Required / optional / logo required | Cannot finalise attribution field in API response |
| 2 | **Booking link exposure** | Timetable URLs only / resolved booking URLs / no links | Changes transport option schema |
| 3 | **Affiliate link ownership** | TM affiliate IDs on all links / Smartvel tags / no affiliate / shared | Changes booking_url construction |
| 4 | **Click tracking** | TransferMundo tracks / Smartvel tracks / joint / none | Determines whether booking_url carries tracking parameters |
| 5 | **Conversion attribution** | Not applicable / agreed split / Smartvel owns | Determines commercial model after pilot |
| 6 | **Content licensing** | Data licensed to Smartvel / API access only / embargo on redistribution | Must be in pilot agreement |
| 7 | **Data redistribution** | Smartvel may cache / must call API on every request / caching permitted with version check | Determines cache-control policy |
| 8 | **Caching rights** | Smartvel may cache for X hours / no downstream caching | Changes `Cache-Control` header |
| 9 | **Update responsibility** | TransferMundo updates data / Smartvel notified of updates / joint | Determines operational SLA |
| 10 | **Support responsibility** | Guus / Pranay / shared | Must be documented before go-live |
| 11 | **Pilot duration** | 30 days / 60 days / 90 days | Determines key expiry policy |
| 12 | **Commercial model after pilot** | Revenue share / flat fee / in-kind / TBD | Must be agreed before pilot data is used in production |
| 13 | **Partner-specific affiliate identifiers** | Distribusion: TM partner number on all clicks / Smartvel's partner number / split | Determines whether Distribusion booking links can be shared |
| 14 | **Smartvel attribution in TransferMundo context** | Not applicable currently — Smartvel embeds TM data, not vice versa | Clarify direction of integration |
| 15 | **Data refresh SLA** | Monthly / weekly / as-needed / on request | Determines publish pipeline frequency |

---

## 12. Smartvel Discovery Questions

The following questions must be answered by Smartvel before the implementation scope is final. For each question, the impact on implementation is stated.

**1. What is the intended Smartvel user experience?**
Does Smartvel embed airport transfer data as a tip card inside its travel guide? As a structured widget? As raw data that Smartvel renders? The answer determines how much structure and depth the API must provide.
*Implementation impact: shallow summary vs. full transport option detail vs. both.*

**2. Which specific content fields does Smartvel need?**
Which of the following does Smartvel actually need: airport name and IATA? transport mode + time + price summaries? individual operator names and routes? timetable links? booking links? narrative fields (goodToKnow, moneySavingTip)?
*Implementation impact: determines which fields can be omitted from the pilot, reducing scope.*

**3. Which pilot airports does Smartvel want to verify first?**
Smartvel may have a subset of the 10 airports that are most relevant to its immediate users. Knowing this allows TransferMundo to prioritise data quality checks on those airports first.
*Implementation impact: if Smartvel selects airports with older data (BUD, BSL), a data refresh round is needed before pilot.*

**4. What languages does Smartvel need?**
TransferMundo currently has English content only. If Smartvel needs Dutch, German, French, or other languages, a translation pipeline must be designed before or during the pilot.
*Implementation impact: English-only pilot is feasible immediately. Multi-language adds significant scope.*

**5. Is this reference data or does Smartvel need live data?**
Reference data (manually maintained, updated weekly or monthly) is what TransferMundo can offer today. Live pricing or availability requires a live data source that does not currently exist.
*Implementation impact: if Smartvel requires live data, the pilot cannot start without a new data source. If reference data is acceptable, the pilot can proceed.*

**6. What are Smartvel's expectations for booking links?**
Does Smartvel want clickable booking links? If so, does it want to carry affiliate parameters through to the booking provider? Will Smartvel rewrite or strip those parameters?
*Implementation impact: determines whether booking_url is included and how it is constructed.*

**7. What caching behaviour does Smartvel plan?**
Will Smartvel cache API responses? For how long? Does it have its own CDN? How will it detect dataset version changes?
*Implementation impact: determines `Cache-Control` policy and whether a version-check webhook is needed.*

**8. What update frequency does Smartvel expect?**
How often does Smartvel expect the data to change? Daily? Weekly? Monthly? This determines the publishing pipeline cadence and whether an automated sheet export is necessary.
*Implementation impact: higher frequency requires more automation; lower frequency allows a manual pilot.*

**9. What is Smartvel's expected API traffic volume?**
How many requests per day should TransferMundo plan for? 100? 10,000? 1,000,000? The answer determines hosting infrastructure and rate-limit thresholds.
*Implementation impact: low traffic (<1,000/day) is manageable on the current Next.js hosting; high traffic requires a dedicated API service.*

**10. Does Smartvel have existing API conventions we should follow?**
Does Smartvel have a preferred response envelope format? Preferred error codes? Preferred authentication method? Matching Smartvel's existing conventions reduces integration effort on their side.
*Implementation impact: may require small schema adjustments at no cost.*

**11. What is Smartvel's proposed pilot timeline?**
When does Smartvel want to start integration testing? When is the go/no-go decision?
*Implementation impact: a 4-week timeline requires starting now. An 8-week timeline allows validation work first.*

**12. What are Smartvel's pilot success criteria?**
What does Smartvel need to see during the pilot to decide to proceed to production? Correct data for N airports? Integration in their product? User testing?
*Implementation impact: determines the minimum viable pilot deliverable.*

**13. What is the commercial expectation after the pilot?**
Revenue share? Flat-fee data licence? In-kind partnership? Understanding this shapes how much TransferMundo should invest in the API infrastructure.
*Implementation impact: if the commercial model is unclear, the investment in a database-backed API is hard to justify.*

**14. Does Smartvel have attribution requirements for third-party data?**
Does Smartvel's product require source attribution for data it embeds? If so, what form?
*Implementation impact: determines attribution field format and whether a logo/link must be included.*

**15. What is the data redistribution policy Smartvel requires?**
Will Smartvel redistribute TransferMundo data to its own partners or sub-licensees? Or is the integration limited to Smartvel's own product?
*Implementation impact: redistribution rights must be explicitly agreed in a data licence agreement.*

---

## 13. Implementation Phases and Dependencies

### Phase 0 — Foundations (no code, no API)
Status: This document.

Deliverables:
- This specification reviewed and approved by Guus and Pranay.
- Smartvel discovery questions answered.
- Commercial decision list resolved (at minimum: decisions 1–8).
- Data freshness assessment completed: identify which airports need a data update before pilot.

Dependencies: None. All work is documentation and conversation.

---

### Phase 1 — Data preparation
Prerequisite for: Phase 2.

Deliverables:
- Update stale records (BUD Jan 2024, BSL Feb 2024, AMS May 2024 minimum) if Smartvel selects those airports.
- Define canonical column schema and freeze it (prevents import script breakage).
- Confirm `lastUpdate` editorial format or migrate to ISO 8601 (`YYYY-MM-DD`).

Files affected: `data/airports.csv`

Dependencies: Guus availability to update data, Smartvel airport selection.

---

### Phase 2 — Import script and validated snapshot
Prerequisite for: Phase 3.

Deliverables:
- Import script that reads `airports.csv`, validates all rows, quarantines invalid rows, and produces a versioned JSON snapshot.
- Validation rules as defined in Section 9.
- Snapshot format matches the API response schemas in Section 7.
- Test suite for the import script.

Files to create: `scripts/import-airports.ts` (or equivalent), `data/snapshots/` directory.

Dependencies: Phase 1 complete.

---

### Phase 3 — API endpoint implementation
Prerequisite for: Phase 4.

Deliverables:
- Next.js API routes (or a separate edge function) implementing the 5 endpoints defined in Section 7.
- API key middleware.
- Rate limiting middleware.
- Request logging.
- Responses served from the Phase 2 snapshot (not from the CSV directly at request time).
- All error responses as defined in Section 7.

Files to create: `app/api/v1/meta/route.ts`, `app/api/v1/airports/route.ts`, `app/api/v1/airports/[iata]/route.ts`, `app/api/v1/airports/[iata]/destinations/route.ts`, `app/api/v1/airports/[iata]/destinations/[destination]/transport/route.ts`.

Files to create: `middleware` additions for API key and rate limit.

Dependencies: Phase 2 complete, authentication strategy confirmed, commercial decisions 1–8 resolved.

---

### Phase 4 — Pilot verification and acceptance testing
Prerequisite for: handing over to Smartvel.

Deliverables:
- All acceptance criteria in Section 14 met and documented.
- Pilot API key issued to Smartvel.
- API documentation shared with Smartvel integration team.
- Monitoring in place.

Dependencies: Phase 3 complete, Smartvel integration contact confirmed.

---

### Phase 5 — Production (future, not pilot scope)
- Database migration (Option D from Section 9).
- Automated sheet export pipeline (Option B).
- Extended airport coverage.
- Multi-language support (if required).
- Production SLA and monitoring.

Dependencies: Pilot success, commercial agreement signed.

---

## 14. Acceptance Criteria

The pilot must not be called ready merely because an endpoint returns JSON. The following criteria must all be met and evidence provided before Guus can truthfully say a test API is available.

| # | Criterion | Evidence required |
|---|-----------|------------------|
| 1 | Schema validation | Import script rejects a row with a missing IATA code. Quarantine log produced. |
| 2 | Valid airport lookup | `GET /v1/airports/AMS` returns correct name, destinations, transport options as per CSV. |
| 3 | Unknown airport | `GET /v1/airports/LHR` returns `404` with `AIRPORT_NOT_FOUND` code. |
| 4 | Destination lookup | `GET /v1/airports/STN/destinations` returns both London and Cambridge. |
| 5 | Transport detail | `GET /v1/airports/AMS/destinations/Amsterdam/transport` returns both train and bus options, not the third (empty) slot. |
| 6 | Missing transport data | Airport with genuinely missing transport returns empty `transport_options` array, not error. |
| 7 | Stale data | BUD response includes `data_quality.status = "stale"` given Jan 2024 last_update. |
| 8 | Duplicate record detection | Import script produces an error if the same IATA appears twice in the CSV. |
| 9 | Invalid import handling | Import with a completely invalid file (wrong columns) does not overwrite the current snapshot. |
| 10 | Rollback | After a failed import, `GET /v1/airports/AMS` still returns the last valid data. |
| 11 | Broken booking links | If a timetable URL is malformed, the field is `null` in the response, not the malformed string. |
| 12 | Authentication failure | Request without API key returns `401`. Request with wrong key returns `401`. |
| 13 | Rate limiting | Sending 61 requests/minute with a valid key triggers `429` on the 61st request. |
| 14 | Logging | Every test request above appears in the request log with correct status code and timestamp. |
| 15 | Traceability | Dataset version returned in response matches the version visible in `/v1/meta`. |
| 16 | Dataset rollback verification | Confirmed by deploying a snapshot, then re-deploying the previous snapshot, and verifying `/v1/meta` shows the old version. |
| 17 | Documentation | Smartvel integration team can identify the correct endpoint, parameters, and auth method from the API documentation without asking TransferMundo. |
| 18 | Representative airport coverage | All 10 PILOT_10 airports return valid responses. Confirmed by automated test. |
| 19 | Backward-compatible contract change | Adding a new optional field to the response does not break the Smartvel integration. Confirmed by schema test. |
| 20 | Price disclaimer present | Every `/transport` response includes the `price_disclaimer` field. |
| 21 | Affiliate codes not exposed | Raw Distribusion carrier codes (e.g., `NTRA`, `TSCO`) are not present in any API response. Confirmed by response inspection. |

---

## 15. Repository Files Likely to Change After Approval

| File | Change type | Phase |
|------|-------------|-------|
| `data/airports.csv` | Data updates (stale records) | 1 |
| `lib/airports.ts` | May require export of additional parsed fields; lastUpdate parsing | 2 |
| `lib/attribution.ts` | No changes expected (affiliate logic stays internal) | — |
| `scripts/import-airports.ts` | New file — import and validation script | 2 |
| `data/snapshots/` | New directory — versioned JSON snapshots | 2 |
| `app/api/v1/meta/route.ts` | New file — meta endpoint | 3 |
| `app/api/v1/airports/route.ts` | New file — airport list endpoint | 3 |
| `app/api/v1/airports/[iata]/route.ts` | New file — airport detail endpoint | 3 |
| `app/api/v1/airports/[iata]/destinations/route.ts` | New file — destinations endpoint | 3 |
| `app/api/v1/airports/[iata]/destinations/[destination]/transport/route.ts` | New file — transport endpoint | 3 |
| `middleware.ts` | Add API key and rate-limit middleware for `/api/v1/*` | 3 |
| `docs/SMARTVEL_API_PILOT_SPEC.md` | This document — updates as decisions are made | Ongoing |

Files that must not change as part of this work:
- `app/[slug]/page.tsx` — the website page; keep API concerns separate
- `app/page.tsx` — homepage; not affected
- `__tests__/airports.test.ts` — existing tests must continue to pass

---

## 16. What Guus Must Decide

1. **Which airports to prioritise for data refresh** before the pilot (BUD Jan 2024, BSL Feb 2024, AMS May 2024 are the oldest).
2. **Whether to expose booking links** in the API or timetable links only (commercial decision).
3. **Affiliate link policy with Smartvel** — do TransferMundo's Distribusion and taxi affiliate identifiers survive the API integration?
4. **Commercial model** — what does TransferMundo get in return for the Smartvel integration?
5. **Pilot duration and timeline** — when does Guus want to have a working test API?
6. **Attribution requirements** — what attribution must Smartvel display when using TransferMundo data?
7. **Data redistribution** — can Smartvel pass the data to its own partners?
8. **Which open questions to resolve with Smartvel first** — prioritise the discovery questions in Section 12 for the next conversation with Smartvel.

---

## 17. What Pranay Should Review

1. **AGENTS.md caution** — this codebase uses a version of Next.js with breaking changes from standard. Before implementing any API route, read the relevant guide in `node_modules/next/dist/docs/`. The middleware and API route patterns may differ.
2. **Middleware approach** — `middleware.ts` already exists. Review how API key and rate-limit middleware can be integrated without breaking existing middleware behaviour.
3. **Snapshot serving** — the recommended approach (Option C) serves a static JSON snapshot rather than calling `getAirports()` on every API request. Confirm the best mechanism: filesystem read, `import()` of a JSON file, or an in-memory module singleton similar to the existing `_cache`.
4. **`buyTicketsLink` handling** — the raw carrier codes (NTRA, TSCO, etc.) must never reach an API response. The transformation in `lib/attribution.ts:distribusionUrl()` is the correct gate. Verify that the API layer uses `buildOutboundUrl()` (already exported) rather than passing raw values through.
5. **Destination identity fragility** — destinations have no stable ID. A URL path of `/airports/STN/destinations/Cambridge/transport` breaks if the destination name changes in the CSV. Decide whether to introduce a stable destination slug before pilot.
6. **`lastUpdatedLabel()` vs. CSV `lastUpdate`** — the page's dynamic "last updated" label is unrelated to the CSV field. The API must use the CSV field, not mimic the page. Confirm there is no confusion between these in any future implementation.
7. **HUF prices** — Budapest uses Hungarian Forints with comma-formatted numbers ("10,800 HUF"). Confirm whether the price string transformer handles comma-delimited numbers correctly and that these are not misinterpreted as thousands-separator floats.
8. **Test coverage** — Phase 3 must include API-level integration tests that call the endpoints and verify schema, status codes, and correct data values. These should run in CI alongside the existing test suite.

---

## 18. What Must Wait for Smartvel's Response

The following cannot be finalised until Smartvel answers the discovery questions in Section 12:

- Final field selection (which fields are actually needed)
- Language requirements (English-only or multilingual)
- Booking link policy (timetable vs. resolved booking URLs)
- Rate limit thresholds (depends on expected traffic)
- Cache-control policy (depends on Smartvel's caching plans)
- Attribution format (depends on Smartvel's UI requirements)
- Pilot airport selection (determines which records to refresh first)
- Pilot timeline (determines implementation sequencing)
- Commercial model (determines how much infrastructure investment is justified)
- Whether a live data source is eventually required (determines the long-term architecture decision between Option C and Option D)

---

## 19. Final Status Summary

### What can safely be communicated now

- TransferMundo has transport data for 10 European airports, covering 12 city destinations, with up to 3 public transport options per destination plus taxi.
- The data is reference quality — manually maintained, last updated between Jan 2024 and Mar 2026.
- A read-only API contract can be designed and built covering airport lookup, destination listing, and transport option detail.
- The API contract defined in this document is stable: it will survive a future migration from CSV to database without breaking Smartvel's integration.
- A pilot can be ready within approximately 4–8 weeks of approval, depending on data refresh requirements and Smartvel's timeline.

### What is verified

- 10 airports exist in `data/airports.csv`, confirmed by the test suite.
- IATA codes: AMS, BER, BSL, BUD, CDG, DUB, FCO, HEL, MAD, STN.
- Transport option data is present and complete for all 10 airports.
- Prices are indicative text strings — not live, not structured numeric values.
- `lastUpdate` is an editorial string, not an ISO date.
- No geographic coordinates exist in any record.
- Affiliate configuration is in `lib/attribution.ts` and is not in the CSV.
- Raw Distribusion carrier codes are in the CSV and must not be exposed externally.
- The website's "Last updated" display is a dynamic cosmetic label, not derived from the CSV.

### What remains unknown

- Whether the Google Sheet has additional airports beyond the 10 in the CSV.
- The frequency with which Guus updates the data.
- Smartvel's specific content requirements, traffic expectations, and integration timeline.
- The commercial model for the partnership.
- Whether live pricing or availability data will ever be required.

### What must be approved before implementation begins

1. This specification reviewed and approved by Guus and Pranay.
2. Smartvel discovery questions answered (Section 12).
3. Commercial decisions made (Section 11, minimum decisions 1–8).
4. Data refresh completed for stale airports selected for the pilot.
5. Next.js API route approach reviewed and confirmed by Pranay (see AGENTS.md caution).

**No implementation should begin until these five conditions are met.**
