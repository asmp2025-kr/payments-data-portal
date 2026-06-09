"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateTenantsUsers1000000000001 = void 0;
class CreateTenantsUsers1000000000001 {
    constructor() {
        this.name = 'CreateTenantsUsers1000000000001';
    }
    async up(qr) {
        await qr.query(`SET search_path TO app, public`);
        await qr.query(`
      CREATE TABLE IF NOT EXISTS app.tenants (
        id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name          VARCHAR(255) NOT NULL,
        slug          VARCHAR(100) NOT NULL UNIQUE,
        logo_url      TEXT,
        theme_config  JSONB NOT NULL DEFAULT '{
          "primaryColor": "#2563EB",
          "backgroundColor": "#020617",
          "cardColor": "#0F172A",
          "fontFamily": "Inter"
        }',
        subscription_plan  VARCHAR(50) NOT NULL DEFAULT 'basic'
                           CHECK (subscription_plan IN ('basic','professional','enterprise')),
        is_active     BOOLEAN NOT NULL DEFAULT true,
        contact_email VARCHAR(255),
        country       VARCHAR(3),
        created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
        await qr.query(`
      CREATE TABLE IF NOT EXISTS app.users (
        id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id     UUID NOT NULL REFERENCES app.tenants(id) ON DELETE CASCADE,
        keycloak_id   VARCHAR(255) UNIQUE,
        email         VARCHAR(255) NOT NULL,
        first_name    VARCHAR(100),
        last_name     VARCHAR(100),
        role          VARCHAR(50) NOT NULL DEFAULT 'operations'
                      CHECK (role IN ('super_admin','bank_admin','operations','compliance','executive','auditor')),
        is_active     BOOLEAN NOT NULL DEFAULT true,
        last_login_at TIMESTAMPTZ,
        created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE (tenant_id, email)
      )
    `);
        await qr.query(`CREATE INDEX idx_users_tenant ON app.users(tenant_id)`);
        await qr.query(`CREATE INDEX idx_users_keycloak ON app.users(keycloak_id)`);
        await qr.query(`CREATE INDEX idx_users_email ON app.users(email)`);
        await qr.query(`
      CREATE TABLE IF NOT EXISTS app.subscriptions (
        id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id     UUID NOT NULL REFERENCES app.tenants(id) ON DELETE CASCADE,
        plan          VARCHAR(50) NOT NULL,
        max_users     INTEGER NOT NULL DEFAULT 5,
        features_json JSONB NOT NULL DEFAULT '{}',
        valid_from    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        valid_until   TIMESTAMPTZ,
        status        VARCHAR(20) NOT NULL DEFAULT 'active'
                      CHECK (status IN ('active','expired','cancelled','trial')),
        created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
        await qr.query(`CREATE INDEX idx_subscriptions_tenant ON app.subscriptions(tenant_id)`);
        await qr.query(`ALTER TABLE app.users ENABLE ROW LEVEL SECURITY`);
        await qr.query(`ALTER TABLE app.subscriptions ENABLE ROW LEVEL SECURITY`);
        await qr.query(`
      CREATE POLICY tenant_isolation_users ON app.users
        USING (tenant_id = current_setting('app.tenant_id', true)::uuid OR
               current_setting('app.bypass_rls', true) = 'true')
    `);
        await qr.query(`
      CREATE POLICY tenant_isolation_subscriptions ON app.subscriptions
        USING (tenant_id = current_setting('app.tenant_id', true)::uuid OR
               current_setting('app.bypass_rls', true) = 'true')
    `);
    }
    async down(qr) {
        await qr.query(`DROP TABLE IF EXISTS app.subscriptions CASCADE`);
        await qr.query(`DROP TABLE IF EXISTS app.users CASCADE`);
        await qr.query(`DROP TABLE IF EXISTS app.tenants CASCADE`);
    }
}
exports.CreateTenantsUsers1000000000001 = CreateTenantsUsers1000000000001;
//# sourceMappingURL=001_create_tenants_users.js.map