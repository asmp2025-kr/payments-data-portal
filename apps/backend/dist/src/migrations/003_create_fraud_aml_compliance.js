"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateFraudAmlCompliance1000000000003 = void 0;
class CreateFraudAmlCompliance1000000000003 {
    constructor() {
        this.name = 'CreateFraudAmlCompliance1000000000003';
    }
    async up(qr) {
        await qr.query(`SET search_path TO app, public`);
        await qr.query(`
      CREATE TABLE IF NOT EXISTS app.fraud_cases (
        id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id       UUID NOT NULL REFERENCES app.tenants(id) ON DELETE CASCADE,
        case_ref        VARCHAR(50) NOT NULL,
        transaction_id  UUID REFERENCES app.transactions(id),
        fraud_type      VARCHAR(50) NOT NULL
                        CHECK (fraud_type IN ('card_not_present','card_present','identity_theft',
                                              'account_takeover','synthetic_identity','first_party',
                                              'merchant_fraud','money_mule','phishing','other')),
        amount          NUMERIC(20,4) NOT NULL,
        currency        VARCHAR(3) DEFAULT 'USD',
        status          VARCHAR(20) NOT NULL DEFAULT 'open'
                        CHECK (status IN ('open','investigating','confirmed','false_positive',
                                          'resolved','escalated')),
        risk_score      NUMERIC(5,2),
        detected_by     VARCHAR(30) DEFAULT 'system',
        assigned_to     UUID REFERENCES app.users(id),
        notes           TEXT,
        recovery_amount NUMERIC(20,4) DEFAULT 0,
        detected_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        resolved_at     TIMESTAMPTZ,
        created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE (tenant_id, case_ref)
      )
    `);
        await qr.query(`
      CREATE TABLE IF NOT EXISTS app.aml_alerts (
        id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id     UUID NOT NULL REFERENCES app.tenants(id) ON DELETE CASCADE,
        alert_ref     VARCHAR(50) NOT NULL,
        customer_id   UUID,
        account_id    UUID REFERENCES app.accounts(id),
        alert_type    VARCHAR(50) NOT NULL
                      CHECK (alert_type IN ('unusual_activity','structuring','rapid_movement',
                                            'high_risk_country','pep_transaction','sanctions_hit',
                                            'threshold_breach','velocity','layering','other')),
        risk_score    NUMERIC(5,2) NOT NULL DEFAULT 0,
        risk_level    VARCHAR(10) NOT NULL DEFAULT 'medium'
                      CHECK (risk_level IN ('low','medium','high','critical')),
        status        VARCHAR(20) NOT NULL DEFAULT 'open'
                      CHECK (status IN ('open','investigating','escalated','closed_sar',
                                        'closed_no_action','false_positive')),
        assigned_to   UUID REFERENCES app.users(id),
        description   TEXT,
        created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        closed_at     TIMESTAMPTZ,
        sla_due_at    TIMESTAMPTZ,
        UNIQUE (tenant_id, alert_ref)
      )
    `);
        await qr.query(`
      CREATE TABLE IF NOT EXISTS app.sar_filings (
        id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id       UUID NOT NULL REFERENCES app.tenants(id) ON DELETE CASCADE,
        aml_alert_id    UUID REFERENCES app.aml_alerts(id),
        sar_ref         VARCHAR(50) NOT NULL,
        filed_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        reference_number VARCHAR(100),
        regulator       VARCHAR(100),
        status          VARCHAR(20) DEFAULT 'filed',
        notes           TEXT,
        created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
        await qr.query(`
      CREATE TABLE IF NOT EXISTS app.sanctions_screening (
        id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id    UUID NOT NULL REFERENCES app.tenants(id) ON DELETE CASCADE,
        entity_type  VARCHAR(30) DEFAULT 'individual',
        entity_name  VARCHAR(500) NOT NULL,
        entity_id    UUID,
        list_type    VARCHAR(50),
        result       VARCHAR(20) NOT NULL DEFAULT 'no_match'
                     CHECK (result IN ('no_match','potential_match','confirmed_match','whitelisted')),
        match_score  NUMERIC(5,2),
        screened_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        reviewed_by  UUID REFERENCES app.users(id),
        created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
        await qr.query(`
      CREATE TABLE IF NOT EXISTS app.compliance_findings (
        id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id     UUID NOT NULL REFERENCES app.tenants(id) ON DELETE CASCADE,
        finding_ref   VARCHAR(50) NOT NULL,
        finding_type  VARCHAR(50) NOT NULL,
        category      VARCHAR(50),
        severity      VARCHAR(20) NOT NULL DEFAULT 'medium'
                      CHECK (severity IN ('low','medium','high','critical')),
        status        VARCHAR(20) NOT NULL DEFAULT 'open'
                      CHECK (status IN ('open','in_progress','resolved','accepted','escalated')),
        description   TEXT,
        remediation   TEXT,
        assigned_to   UUID REFERENCES app.users(id),
        due_date      DATE,
        resolved_at   TIMESTAMPTZ,
        created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE (tenant_id, finding_ref)
      )
    `);
        await qr.query(`
      CREATE TABLE IF NOT EXISTS app.audit_logs (
        id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id    UUID REFERENCES app.tenants(id) ON DELETE CASCADE,
        user_id      UUID REFERENCES app.users(id),
        action       VARCHAR(100) NOT NULL,
        entity_type  VARCHAR(100),
        entity_id    UUID,
        ip_address   VARCHAR(45),
        user_agent   TEXT,
        payload      JSONB,
        result       VARCHAR(20) DEFAULT 'success',
        created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
        const tables = ['fraud_cases', 'aml_alerts', 'sar_filings', 'sanctions_screening', 'compliance_findings'];
        for (const t of tables) {
            await qr.query(`CREATE INDEX idx_${t}_tenant ON app.${t}(tenant_id)`);
        }
        await qr.query(`CREATE INDEX idx_fraud_status ON app.fraud_cases(tenant_id, status)`);
        await qr.query(`CREATE INDEX idx_fraud_detected ON app.fraud_cases(tenant_id, detected_at DESC)`);
        await qr.query(`CREATE INDEX idx_aml_status ON app.aml_alerts(tenant_id, status)`);
        await qr.query(`CREATE INDEX idx_aml_risk ON app.aml_alerts(tenant_id, risk_level)`);
        await qr.query(`CREATE INDEX idx_audit_created ON app.audit_logs(tenant_id, created_at DESC)`);
        await qr.query(`CREATE INDEX idx_audit_user ON app.audit_logs(tenant_id, user_id)`);
        for (const t of tables) {
            await qr.query(`ALTER TABLE app.${t} ENABLE ROW LEVEL SECURITY`);
            await qr.query(`
        CREATE POLICY tenant_isolation_${t} ON app.${t}
          USING (tenant_id = current_setting('app.tenant_id', true)::uuid OR
                 current_setting('app.bypass_rls', true) = 'true')
      `);
        }
        await qr.query(`ALTER TABLE app.audit_logs ENABLE ROW LEVEL SECURITY`);
        await qr.query(`
      CREATE POLICY tenant_isolation_audit_logs ON app.audit_logs
        USING (tenant_id = current_setting('app.tenant_id', true)::uuid OR
               current_setting('app.bypass_rls', true) = 'true')
    `);
    }
    async down(qr) {
        const tables = ['compliance_findings', 'sanctions_screening', 'sar_filings', 'aml_alerts', 'fraud_cases'];
        for (const t of tables) {
            await qr.query(`DROP TABLE IF EXISTS app.${t} CASCADE`);
        }
        await qr.query(`DROP TABLE IF EXISTS app.audit_logs CASCADE`);
    }
}
exports.CreateFraudAmlCompliance1000000000003 = CreateFraudAmlCompliance1000000000003;
//# sourceMappingURL=003_create_fraud_aml_compliance.js.map