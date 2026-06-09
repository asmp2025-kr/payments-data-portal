# Payments Data Product Portal

A production-grade, enterprise SaaS Payments Data Product Portal for banks, payment processors, card networks, and domestic schemes. Runs entirely locally using free/open-source tools via Docker Compose.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         NGINX (Reverse Proxy)                    │
│              /api/* → Backend   /*  → Frontend                   │
└────────────────────┬──────────────┬────────────────────────────┘
                     │              │
         ┌───────────┴──┐     ┌─────┴──────────┐
         │  NestJS API  │     │  Next.js 15 UI  │
         │  (port 3000) │     │  (port 4000)    │
         └──────┬───────┘     └────────────────┘
                │
    ┌───────────┼─────────────────────────────────┐
    │           │                                 │
    ▼           ▼                                 ▼
PostgreSQL   Keycloak                          MinIO
(RLS +       (Auth)                           (Storage)
 Tenancy)
    │
OpenSearch   Prometheus + Grafana + Loki    n8n (Workflows)
(Search)     (Monitoring)
```

### Multi-Tenant Data Isolation

Every table has a `tenant_id` column. PostgreSQL Row-Level Security (RLS) enforces that each query only sees data for the authenticated tenant:

```sql
-- Policy on every table
CREATE POLICY tenant_isolation ON app.transactions
  USING (tenant_id = current_setting('app.tenant_id', true)::uuid
         OR current_setting('app.bypass_rls', true) = 'true');
```

The NestJS `TenantContextInterceptor` sets this per request:
```sql
SELECT set_config('app.tenant_id', $1, true)
```

---

## Prerequisites

- Docker Desktop 24+ (with 8GB RAM minimum)
- Docker Compose v2.20+
- Node.js 20+ (for development)
- Git

---

## Quick Start

### 1. Clone and configure environment

```bash
git clone <repo-url> payments-portal
cd payments-portal
cp .env.example .env
# Edit .env if needed (defaults work for local dev)
```

### 2. Start all services

```bash
docker compose -f infra/docker-compose.yml up -d
```

This starts 11 services. Initial startup takes 2-3 minutes (Keycloak and PostgreSQL need initialization time).

### 3. Check service health

```bash
docker compose -f infra/docker-compose.yml ps
# All services should show "healthy"
```

### 4. Import Keycloak realm

```bash
# Wait for Keycloak to be healthy, then import realm
docker exec -it keycloak /opt/keycloak/bin/kc.sh import \
  --file /opt/keycloak/data/import/realm-export.json
```

Or visit http://localhost:8080 and import manually:
- Admin → master realm → Import realm
- Upload `infra/keycloak/realm-export.json`

### 5. Run database migrations

```bash
docker exec backend npm run migration:run
```

### 6. Seed the database (5M transactions, ~10-15 minutes)

```bash
cd scripts
npm install
npm run seed
```

### 7. Access the portal

| Service | URL | Credentials |
|---------|-----|-------------|
| **Portal** | http://localhost | admin@bank-alpha.com / BankAdmin123! |
| **Keycloak Admin** | http://localhost:8080 | admin / admin |
| **Grafana** | http://localhost:3001 | admin / admin |
| **MinIO Console** | http://localhost:9001 | minioadmin / minioadmin |
| **n8n** | http://localhost:5678 | admin / password |
| **OpenSearch Dashboards** | http://localhost:5601 | admin / admin |
| **Prometheus** | http://localhost:9090 | — |
| **API Docs** | http://localhost/api/docs | — |

---

## Project Structure

```
payments-portal/
├── apps/
│   ├── frontend/                    # Next.js 15 application
│   │   ├── app/
│   │   │   ├── (app)/               # Authenticated app pages
│   │   │   │   ├── layout.tsx       # Shell with sidebar + topbar
│   │   │   │   ├── dashboard/       # Executive dashboard
│   │   │   │   ├── clearing/        # Clearing analytics
│   │   │   │   ├── settlement/      # Settlement analytics
│   │   │   │   ├── accounts/        # Accounts analytics
│   │   │   │   ├── cards/           # Cards analytics
│   │   │   │   ├── fraud/           # Fraud monitoring
│   │   │   │   ├── aml/             # AML monitoring
│   │   │   │   ├── compliance/      # Compliance tracking
│   │   │   │   ├── scheme/          # Domestic scheme
│   │   │   │   ├── reconciliation/  # Reconciliation
│   │   │   │   ├── finance/         # Finance / P&L
│   │   │   │   ├── marketplace/     # Data product marketplace
│   │   │   │   ├── reports/         # Report center (202 templates)
│   │   │   │   ├── builder/         # Dashboard builder
│   │   │   │   ├── users/           # User management
│   │   │   │   └── audit/           # Audit trail
│   │   │   ├── (auth)/login/        # Keycloak login page
│   │   │   └── report-render/[id]/  # Puppeteer PDF target
│   │   ├── components/
│   │   │   ├── charts/              # KpiCard, AreaChart, BarChart, DonutChart, GaugeChart
│   │   │   ├── layout/              # Sidebar, Topbar
│   │   │   └── shared/              # DataTable
│   │   └── lib/
│   │       ├── api.ts               # Axios client (auto-injects Bearer + X-Tenant-ID)
│   │       ├── auth.ts              # Keycloak OIDC
│   │       ├── store/               # Zustand state
│   │       └── utils.ts             # formatNumber, formatCurrency, etc.
│   │
│   └── backend/                     # NestJS application
│       └── src/
│           ├── auth/                # JWT strategy (Keycloak JWKS)
│           ├── clearing/            # Clearing module + service
│           ├── settlement/          # Settlement module + service
│           ├── accounts/            # Accounts module + service
│           ├── cards/               # Cards module + service
│           ├── fraud/               # Fraud module + service
│           ├── aml/                 # AML module + service
│           ├── compliance/          # Compliance module + service
│           ├── scheme/              # Scheme module + service
│           ├── reconciliation/      # Reconciliation module + service
│           ├── finance/             # Finance module + service
│           ├── data-products/       # Marketplace module + service
│           ├── dashboards/          # Dashboard CRUD
│           ├── reports/             # Report generation engine
│           │   ├── engines/
│           │   │   ├── pdf.engine.ts    # Puppeteer
│           │   │   ├── excel.engine.ts  # ExcelJS
│           │   │   └── csv.engine.ts
│           │   └── catalog/
│           │       └── report-catalog.ts  # 202 report templates
│           ├── notifications/       # SSE + email
│           ├── audit/               # Audit logging
│           ├── search/              # OpenSearch integration
│           ├── migrations/          # TypeORM SQL migrations
│           └── common/
│               ├── guards/          # JwtGuard, RolesGuard
│               └── interceptors/    # TenantContextInterceptor, AuditInterceptor
│
├── infra/
│   ├── docker-compose.yml           # 11 services
│   ├── nginx/nginx.conf             # Reverse proxy + rate limiting
│   ├── postgres/init.sql            # Schema + extensions init
│   ├── keycloak/realm-export.json   # Pre-configured realm
│   ├── prometheus/prometheus.yml    # Scrape config
│   ├── grafana/
│   │   ├── provisioning/            # Auto-provisioned datasources + dashboards
│   │   └── dashboards/              # Payments overview dashboard
│   └── loki/loki-config.yaml
│
├── scripts/
│   └── seed.ts                      # 3 tenants, 100 users, 5M transactions
│
├── tests/
│   └── load/clearing-load.js        # k6 load test
│
├── k8s/                             # Kubernetes manifests
├── helm/                            # Helm chart
└── .github/workflows/               # CI/CD
```

---

## User Roles & Permissions

| Role | Dashboards | Reports | Users | Audit | Super Admin |
|------|-----------|---------|-------|-------|-------------|
| `super_admin` | All tenants | All | All tenants | All | ✅ |
| `bank_admin` | Own tenant | All own | Own tenant | Own | ❌ |
| `operations` | Own tenant | Standard | View only | View | ❌ |
| `compliance` | Compliance, AML | Compliance | ❌ | Own | ❌ |
| `executive` | All dashboards | Board reports | ❌ | ❌ | ❌ |
| `auditor` | Read only | Read only | ❌ | Full read | ❌ |

---

## Database Schema

### Core Tables

```sql
app.tenants              -- Banks/organizations
app.users                -- Portal users (linked to Keycloak)
app.subscriptions        -- Subscription plans per tenant
```

### Payment Domain

```sql
app.merchants            -- Merchant registry
app.accounts             -- Customer accounts
app.cards                -- Card portfolio
app.transactions         -- 5M+ transaction records (3 years)
app.clearing_records     -- Clearing outcomes per transaction
app.settlement_records   -- Daily settlement per participant
app.scheme_participants  -- Domestic scheme members
app.scheme_transactions  -- Scheme-level aggregates
app.reconciliation_records -- Break tracking (generated variance column)
```

### Risk & Compliance

```sql
app.fraud_cases          -- Fraud case management
app.aml_alerts           -- AML monitoring alerts
app.sar_filings          -- SAR regulatory filings
app.sanctions_screening  -- Sanctions check results
app.compliance_findings  -- Audit/compliance findings
app.audit_logs           -- PARTITIONED BY RANGE (monthly) — all user actions
```

### Platform

```sql
app.data_products        -- Marketplace product catalog
app.data_product_access  -- Access grants
app.dashboards           -- Custom + template dashboard configs
app.reports              -- Report definitions
app.report_runs          -- Generation history + MinIO file refs
app.notifications        -- In-app + email notifications
```

### RLS Policy (applied to all tables)

```sql
USING (
  tenant_id = current_setting('app.tenant_id', true)::uuid
  OR current_setting('app.bypass_rls', true) = 'true'
)
```

---

## API Reference

Full OpenAPI documentation available at: **http://localhost/api/docs**

### Authentication

All endpoints require a Bearer JWT from Keycloak:

```bash
# Get token
curl -X POST http://localhost:8080/realms/payments-portal/protocol/openid-connect/token \
  -d "grant_type=password&client_id=payments-portal&client_secret=payments-portal-secret-change-in-prod" \
  -d "username=admin@bank-alpha.com&password=BankAdmin123!"
```

### Key Endpoints

```
GET  /api/clearing/summary          Clearing KPI summary
GET  /api/clearing/daily-trend      Time-series chart data
GET  /api/clearing/participants     Participant performance
GET  /api/clearing/exceptions       Exception list

GET  /api/settlement/summary        Settlement KPI summary
GET  /api/settlement/positions      Net positions per participant
GET  /api/settlement/trend          Settlement value over time

GET  /api/fraud/summary             Fraud KPI summary
GET  /api/fraud/cases               Fraud case list
GET  /api/fraud/merchant-risk       Merchant risk rankings

GET  /api/aml/summary               AML metrics
GET  /api/aml/alerts                Alert list

GET  /api/compliance/score          Compliance score
GET  /api/compliance/findings       Finding list

GET  /api/reports/catalog           202 report templates
POST /api/reports/generate          Generate PDF/Excel/CSV
GET  /api/reports/runs              Download history

GET  /api/data-products             Marketplace listing
POST /api/data-products/:id/access-request  Request access

GET  /api/dashboards                User dashboards
POST /api/dashboards                Create dashboard
GET  /api/notifications             SSE stream

GET  /api/audit/logs                Audit trail (auditor role)
GET  /api/health                    Health + Prometheus metrics
```

---

## Report Engine

### 202 Pre-built Report Templates

| Module | Count | IDs |
|--------|-------|-----|
| Executive | 10 | EXE001–EXE010 |
| Clearing | 15 | CLR001–CLR015 |
| Settlement | 12 | SET001–SET012 |
| Accounts | 10 | ACC001–ACC010 |
| Cards | 15 | CRD001–CRD015 |
| Fraud | 12 | FRD001–FRD012 |
| AML | 12 | AML001–AML012 |
| Compliance | 10 | CMP001–CMP010 |
| Domestic Scheme | 12 | SCH001–SCH012 |
| Reconciliation | 10 | REC001–REC010 |
| Finance | 12 | FIN001–FIN012 |
| Operations | 10 | OPS001–OPS010 |
| Customer Analytics | 10 | CUS001–CUS010 |
| Data Products | 10 | DAT001–DAT010 |
| Platform | 10 | PLT001–PLT010 |

### PDF Report Structure

Each generated PDF contains:
1. **Cover Page** — logo, title, date range, tenant name, generated by
2. **Executive Summary** — 3-5 auto-generated bullet points
3. **KPI Section** — key metrics in card layout
4. **Charts** — module-specific visualizations
5. **Detailed Tables** — full data with formatting
6. **Exception Analysis** — anomalies highlighted in red
7. **Insights** — rule-based observations
8. **Appendix** — methodology, data sources
9. **Audit Footer** — report ID, user, timestamp, tenant

### Report Storage

Generated files are stored in MinIO:
```
reports/{tenant_id}/{report_run_id}.{pdf|xlsx|csv}
```
Pre-signed download URLs (1 hour expiry) are returned by the API.

---

## Dashboard Builder

The drag-and-drop builder at `/builder` supports:

**Widget Types:**
- KPI Card (animated counter)
- Area Chart
- Bar Chart
- Donut Chart
- Data Table
- Gauge Chart

**Features:**
- 4-column CSS grid canvas
- Click-to-select widget properties panel
- Data source selector (per widget)
- Width/height configuration
- Save to backend (`/api/dashboards`)
- Share functionality

---

## Subscription Plans

| Feature | Basic | Professional | Enterprise |
|---------|-------|-------------|------------|
| Users | 5 | 50 | Unlimited |
| Standard Dashboards | ✅ | ✅ | ✅ |
| Custom Dashboards | ❌ | ✅ | ✅ |
| PDF Reports | ✅ | ✅ | ✅ |
| Excel Reports | ❌ | ✅ | ✅ |
| SSO | ❌ | ❌ | ✅ |
| White Labeling | ❌ | ❌ | ✅ |
| Custom Reports | ❌ | ❌ | ✅ |

---

## Development

### Running locally (without Docker)

**Backend:**
```bash
cd apps/backend
npm install
cp ../../.env.example .env.local
# Set POSTGRES_HOST=localhost, KEYCLOAK_URL, etc.
npm run start:dev
```

**Frontend:**
```bash
cd apps/frontend
npm install
npm run dev
```

### Running tests

```bash
# Backend unit tests
cd apps/backend
npm test

# Backend e2e tests (requires running PostgreSQL)
npm run test:e2e

# Frontend type check
cd apps/frontend
npm run type-check

# Load tests (requires k6)
k6 run tests/load/clearing-load.js \
  -e BASE_URL=http://localhost \
  -e JWT_TOKEN=<token>
```

### Generating a new migration

```bash
cd apps/backend
npm run migration:generate -- --name=AddNewTable
```

---

## Monitoring

### Grafana Dashboards

Access Grafana at http://localhost:3001 (admin/admin):

- **Payments Portal Overview** — API rate, latency p95, error rate, DB pool
- **API Performance** — Per-endpoint latency, error rates

### Prometheus Metrics

The backend exposes metrics at `/api/metrics`:

```
http_requests_total{method,route,status}
http_request_duration_ms{route}    (histogram)
payments_transactions_total{tenant_id,status}
payments_clearing_total{tenant_id}
payments_clearing_success_total{tenant_id}
pg_pool_used_connections
```

### Loki Logs

Structured JSON logs from NestJS are shipped to Loki and viewable in Grafana's Explore panel.

---

## RLS Verification

Validate that cross-tenant isolation works:

```bash
# Connect to PostgreSQL
docker exec -it postgres psql -U postgres -d payments

-- Set tenant context to bank-alpha
SET app.tenant_id = '<bank-alpha-uuid>';
SELECT count(*) FROM app.transactions;
-- Returns only bank-alpha transactions

-- Set to bank-beta
SET app.tenant_id = '<bank-beta-uuid>';
SELECT count(*) FROM app.transactions;
-- Returns only bank-beta transactions (different count)

-- Verify bypass for super_admin
SET app.bypass_rls = 'true';
SELECT count(*) FROM app.transactions;
-- Returns all transactions across all tenants
```

---

## Docker Compose Services

| Service | Image | Port | Purpose |
|---------|-------|------|---------|
| postgres | postgres:16 | 5432 | Primary database |
| keycloak | quay.io/keycloak/keycloak:24 | 8080 | Authentication |
| minio | minio/minio | 9000/9001 | Report file storage |
| opensearch | opensearchproject/opensearch:2.12 | 9200 | Full-text search |
| n8n | n8nio/n8n | 5678 | Workflow automation |
| prometheus | prom/prometheus | 9090 | Metrics collection |
| grafana | grafana/grafana | 3001 | Metrics visualization |
| loki | grafana/loki | 3100 | Log aggregation |
| backend | ./apps/backend | 3000 | NestJS API |
| frontend | ./apps/frontend | 4000 | Next.js UI |
| nginx | nginx:alpine | 80 | Reverse proxy |

---

## Kubernetes Deployment

```bash
# Apply all manifests
kubectl apply -f k8s/

# Or use Helm
helm install payments-portal ./helm/payments-portal \
  --set backend.replicaCount=3 \
  --set frontend.replicaCount=2
```

The backend HPA scales from 2 to 10 pods at 70% CPU utilization.

---

## Security

- All API routes require Keycloak JWT (`Authorization: Bearer <token>`)
- JWT validated using JWKS endpoint (not static secret)
- PostgreSQL RLS enforces tenant isolation at the database level — even if application code has a bug, cross-tenant leakage is impossible
- Every user action is logged to `app.audit_logs` (partitioned for performance)
- NGINX rate limits: 100 req/s for API, 10 req/s for auth endpoints
- Helmet middleware (security headers) on all API responses
- Input validation via NestJS `ValidationPipe` (whitelist + transform)

---

## Seed Data Summary

After running `scripts/seed.ts`:

| Entity | Count |
|--------|-------|
| Tenants | 3 |
| Users | 100 |
| Merchants | 600 (200/tenant) |
| Accounts | 1,500 (500/tenant) |
| Cards | 1,800 (600/tenant) |
| Scheme Participants | 60 (20/tenant) |
| **Transactions** | **5,000,000** |
| Clearing Records | ~3,500,000 |
| Settlement Records | ~32,850 |
| Fraud Cases | ~15,000 |
| AML Alerts | 1,500 |
| Compliance Findings | 300 |
| Reconciliation Records | 6,000 |
| Data Products | ~90 |
| Notifications | 3,000 |

Data spans 3 years (2022–2024) with realistic seasonal patterns (higher volume in December and June).

---

## License

This project uses only free and open-source dependencies. See individual package licenses.
