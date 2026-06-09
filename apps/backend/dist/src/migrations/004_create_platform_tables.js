"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreatePlatformTables1000000000004 = void 0;
class CreatePlatformTables1000000000004 {
    constructor() {
        this.name = 'CreatePlatformTables1000000000004';
    }
    async up(qr) {
        await qr.query(`SET search_path TO app, public`);
        await qr.query(`
      CREATE TABLE IF NOT EXISTS app.data_products (
        id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id         UUID NOT NULL REFERENCES app.tenants(id) ON DELETE CASCADE,
        name              VARCHAR(255) NOT NULL,
        slug              VARCHAR(100) NOT NULL,
        domain            VARCHAR(50) NOT NULL
                          CHECK (domain IN ('payments','clearing','settlement','cards','fraud',
                                            'aml','compliance','scheme','reconciliation','finance',
                                            'analytics','operations','customer')),
        description       TEXT,
        owner_id          UUID REFERENCES app.users(id),
        quality_score     NUMERIC(5,2) DEFAULT 0 CHECK (quality_score >= 0 AND quality_score <= 100),
        refresh_frequency VARCHAR(30) DEFAULT 'daily',
        api_endpoint      TEXT,
        schema_definition JSONB,
        lineage           JSONB,
        tags              TEXT[],
        status            VARCHAR(20) NOT NULL DEFAULT 'active'
                          CHECK (status IN ('active','draft','deprecated','archived')),
        access_type       VARCHAR(20) DEFAULT 'request'
                          CHECK (access_type IN ('public','request','restricted')),
        consumer_count    INTEGER DEFAULT 0,
        created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE (tenant_id, slug)
      )
    `);
        await qr.query(`
      CREATE TABLE IF NOT EXISTS app.data_product_access (
        id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id       UUID NOT NULL REFERENCES app.tenants(id) ON DELETE CASCADE,
        product_id      UUID NOT NULL REFERENCES app.data_products(id),
        user_id         UUID NOT NULL REFERENCES app.users(id),
        status          VARCHAR(20) NOT NULL DEFAULT 'pending'
                        CHECK (status IN ('pending','approved','rejected','revoked')),
        reason          TEXT,
        approved_by     UUID REFERENCES app.users(id),
        expires_at      TIMESTAMPTZ,
        created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
        await qr.query(`
      CREATE TABLE IF NOT EXISTS app.dashboards (
        id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id      UUID NOT NULL REFERENCES app.tenants(id) ON DELETE CASCADE,
        name           VARCHAR(255) NOT NULL,
        description    TEXT,
        module         VARCHAR(50),
        layout_config  JSONB NOT NULL DEFAULT '{"cols":12,"rowHeight":60,"compactType":"vertical"}',
        widgets_config JSONB NOT NULL DEFAULT '[]',
        filters_config JSONB DEFAULT '[]',
        is_template    BOOLEAN NOT NULL DEFAULT false,
        is_shared      BOOLEAN NOT NULL DEFAULT false,
        share_token    VARCHAR(100) UNIQUE,
        created_by     UUID REFERENCES app.users(id),
        schedule       JSONB,
        view_count     INTEGER DEFAULT 0,
        created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
        await qr.query(`
      CREATE TABLE IF NOT EXISTS app.reports (
        id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id      UUID NOT NULL REFERENCES app.tenants(id) ON DELETE CASCADE,
        name           VARCHAR(255) NOT NULL,
        description    TEXT,
        module         VARCHAR(50) NOT NULL,
        report_type    VARCHAR(100) NOT NULL,
        config         JSONB NOT NULL DEFAULT '{}',
        schedule       JSONB,
        last_run_at    TIMESTAMPTZ,
        is_template    BOOLEAN NOT NULL DEFAULT false,
        created_by     UUID REFERENCES app.users(id),
        created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
        await qr.query(`
      CREATE TABLE IF NOT EXISTS app.report_runs (
        id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id      UUID NOT NULL REFERENCES app.tenants(id) ON DELETE CASCADE,
        report_id      UUID NOT NULL REFERENCES app.reports(id) ON DELETE CASCADE,
        format         VARCHAR(10) NOT NULL DEFAULT 'pdf'
                       CHECK (format IN ('pdf','excel','csv')),
        status         VARCHAR(20) NOT NULL DEFAULT 'pending'
                       CHECK (status IN ('pending','generating','completed','failed')),
        file_path      TEXT,
        file_size      BIGINT,
        error_message  TEXT,
        parameters     JSONB,
        generated_by   UUID REFERENCES app.users(id),
        generated_at   TIMESTAMPTZ,
        expires_at     TIMESTAMPTZ,
        created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
        await qr.query(`
      CREATE TABLE IF NOT EXISTS app.notifications (
        id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id  UUID NOT NULL REFERENCES app.tenants(id) ON DELETE CASCADE,
        user_id    UUID REFERENCES app.users(id),
        type       VARCHAR(50) NOT NULL
                   CHECK (type IN ('settlement_failure','fraud_spike','aml_alert','report_ready',
                                   'subscription_expiry','system','compliance_breach','info')),
        title      VARCHAR(255) NOT NULL,
        message    TEXT NOT NULL,
        link       TEXT,
        is_read    BOOLEAN NOT NULL DEFAULT false,
        channel    VARCHAR(20) DEFAULT 'in_app'
                   CHECK (channel IN ('in_app','email','both')),
        metadata   JSONB,
        sent_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        read_at    TIMESTAMPTZ
      )
    `);
        const tables = ['data_products', 'data_product_access', 'dashboards', 'reports', 'report_runs', 'notifications'];
        for (const t of tables) {
            await qr.query(`CREATE INDEX idx_${t}_tenant ON app.${t}(tenant_id)`);
        }
        await qr.query(`CREATE INDEX idx_dashboards_template ON app.dashboards(is_template) WHERE is_template = true`);
        await qr.query(`CREATE INDEX idx_reports_template ON app.reports(is_template) WHERE is_template = true`);
        await qr.query(`CREATE INDEX idx_report_runs_status ON app.report_runs(tenant_id, status)`);
        await qr.query(`CREATE INDEX idx_notifications_user ON app.notifications(tenant_id, user_id, is_read)`);
        for (const t of tables) {
            await qr.query(`ALTER TABLE app.${t} ENABLE ROW LEVEL SECURITY`);
            await qr.query(`
        CREATE POLICY tenant_isolation_${t} ON app.${t}
          USING (tenant_id = current_setting('app.tenant_id', true)::uuid OR
                 current_setting('app.bypass_rls', true) = 'true')
      `);
        }
    }
    async down(qr) {
        const tables = ['notifications', 'report_runs', 'reports', 'dashboards', 'data_product_access', 'data_products'];
        for (const t of tables) {
            await qr.query(`DROP TABLE IF EXISTS app.${t} CASCADE`);
        }
    }
}
exports.CreatePlatformTables1000000000004 = CreatePlatformTables1000000000004;
//# sourceMappingURL=004_create_platform_tables.js.map