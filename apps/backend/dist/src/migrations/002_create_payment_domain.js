"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreatePaymentDomain1000000000002 = void 0;
class CreatePaymentDomain1000000000002 {
    constructor() {
        this.name = 'CreatePaymentDomain1000000000002';
    }
    async up(qr) {
        await qr.query(`SET search_path TO app, public`);
        await qr.query(`
      CREATE TABLE IF NOT EXISTS app.merchants (
        id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id     UUID NOT NULL REFERENCES app.tenants(id) ON DELETE CASCADE,
        merchant_code VARCHAR(50) NOT NULL,
        name          VARCHAR(255) NOT NULL,
        category      VARCHAR(100),
        mcc_code      VARCHAR(4),
        country       VARCHAR(3),
        city          VARCHAR(100),
        risk_score    NUMERIC(5,2) DEFAULT 0 CHECK (risk_score >= 0 AND risk_score <= 100),
        status        VARCHAR(20) NOT NULL DEFAULT 'active',
        created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE (tenant_id, merchant_code)
      )
    `);
        await qr.query(`
      CREATE TABLE IF NOT EXISTS app.accounts (
        id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id        UUID NOT NULL REFERENCES app.tenants(id) ON DELETE CASCADE,
        account_number   VARCHAR(50) NOT NULL,
        account_type     VARCHAR(30) NOT NULL DEFAULT 'current'
                         CHECK (account_type IN ('current','savings','settlement','nostro','vostro')),
        balance          NUMERIC(20,4) NOT NULL DEFAULT 0,
        available_balance NUMERIC(20,4) NOT NULL DEFAULT 0,
        currency         VARCHAR(3) NOT NULL DEFAULT 'USD',
        customer_id      UUID,
        status           VARCHAR(20) NOT NULL DEFAULT 'active'
                         CHECK (status IN ('active','dormant','closed','frozen')),
        opened_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        last_activity_at TIMESTAMPTZ,
        created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE (tenant_id, account_number)
      )
    `);
        await qr.query(`
      CREATE TABLE IF NOT EXISTS app.cards (
        id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id        UUID NOT NULL REFERENCES app.tenants(id) ON DELETE CASCADE,
        card_number_masked VARCHAR(20) NOT NULL,
        card_token       VARCHAR(255),
        card_type        VARCHAR(20) NOT NULL DEFAULT 'debit'
                         CHECK (card_type IN ('debit','credit','prepaid','virtual')),
        brand            VARCHAR(20) NOT NULL DEFAULT 'visa'
                         CHECK (brand IN ('visa','mastercard','amex','unionpay','local')),
        account_id       UUID REFERENCES app.accounts(id),
        customer_id      UUID,
        status           VARCHAR(20) NOT NULL DEFAULT 'active'
                         CHECK (status IN ('active','inactive','blocked','expired','cancelled')),
        spend_limit      NUMERIC(20,4),
        expiry_date      DATE,
        activated_at     TIMESTAMPTZ,
        last_used_at     TIMESTAMPTZ,
        created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
        await qr.query(`
      CREATE TABLE IF NOT EXISTS app.transactions (
        id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id       UUID NOT NULL REFERENCES app.tenants(id) ON DELETE CASCADE,
        transaction_ref VARCHAR(100) NOT NULL,
        type            VARCHAR(30) NOT NULL
                        CHECK (type IN ('purchase','refund','withdrawal','deposit','transfer',
                                        'payment','reversal','fee','interest')),
        amount          NUMERIC(20,4) NOT NULL,
        currency        VARCHAR(3) NOT NULL DEFAULT 'USD',
        status          VARCHAR(20) NOT NULL DEFAULT 'pending'
                        CHECK (status IN ('pending','authorized','cleared','settled',
                                          'failed','reversed','declined')),
        merchant_id     UUID REFERENCES app.merchants(id),
        card_id         UUID REFERENCES app.cards(id),
        account_id      UUID REFERENCES app.accounts(id),
        channel         VARCHAR(30) DEFAULT 'pos'
                        CHECK (channel IN ('pos','atm','online','mobile','contactless',
                                           'batch','api','internal')),
        country         VARCHAR(3),
        mcc_code        VARCHAR(4),
        auth_code       VARCHAR(20),
        response_code   VARCHAR(10),
        processing_time_ms INTEGER,
        created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        authorized_at   TIMESTAMPTZ,
        settled_at      TIMESTAMPTZ,
        UNIQUE (tenant_id, transaction_ref)
      )
    `);
        await qr.query(`
      CREATE TABLE IF NOT EXISTS app.clearing_records (
        id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id         UUID NOT NULL REFERENCES app.tenants(id) ON DELETE CASCADE,
        transaction_id    UUID REFERENCES app.transactions(id),
        clearing_batch    VARCHAR(50),
        participant_id    UUID,
        participant_code  VARCHAR(20),
        status            VARCHAR(20) NOT NULL DEFAULT 'pending'
                          CHECK (status IN ('pending','cleared','failed','exception','reversed')),
        gross_amount      NUMERIC(20,4),
        interchange_fee   NUMERIC(20,4) DEFAULT 0,
        net_amount        NUMERIC(20,4),
        processing_time_ms INTEGER,
        error_code        VARCHAR(20),
        error_message     TEXT,
        cleared_at        TIMESTAMPTZ,
        created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
        await qr.query(`
      CREATE TABLE IF NOT EXISTS app.scheme_participants (
        id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id        UUID NOT NULL REFERENCES app.tenants(id) ON DELETE CASCADE,
        participant_code VARCHAR(20) NOT NULL,
        name             VARCHAR(255) NOT NULL,
        type             VARCHAR(30) DEFAULT 'bank'
                         CHECK (type IN ('bank','processor','gateway','scheme','psp')),
        country          VARCHAR(3),
        tier             VARCHAR(20) DEFAULT 'member',
        status           VARCHAR(20) NOT NULL DEFAULT 'active',
        joined_at        TIMESTAMPTZ,
        created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE (tenant_id, participant_code)
      )
    `);
        await qr.query(`
      CREATE TABLE IF NOT EXISTS app.settlement_records (
        id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id        UUID NOT NULL REFERENCES app.tenants(id) ON DELETE CASCADE,
        settlement_ref   VARCHAR(50),
        settlement_date  DATE NOT NULL,
        participant_id   UUID REFERENCES app.scheme_participants(id),
        currency         VARCHAR(3) NOT NULL DEFAULT 'USD',
        gross_amount     NUMERIC(20,4) NOT NULL,
        fees_amount      NUMERIC(20,4) NOT NULL DEFAULT 0,
        net_amount       NUMERIC(20,4) NOT NULL,
        status           VARCHAR(20) NOT NULL DEFAULT 'pending'
                         CHECK (status IN ('pending','processing','settled','failed',
                                           'exception','partially_settled')),
        funding_source   VARCHAR(50),
        funded_at        TIMESTAMPTZ,
        created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
        await qr.query(`
      CREATE TABLE IF NOT EXISTS app.scheme_transactions (
        id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id      UUID NOT NULL REFERENCES app.tenants(id) ON DELETE CASCADE,
        participant_id UUID REFERENCES app.scheme_participants(id),
        volume         BIGINT NOT NULL DEFAULT 0,
        value          NUMERIC(20,4) NOT NULL DEFAULT 0,
        sla_met        BOOLEAN DEFAULT true,
        sla_breach_count INTEGER DEFAULT 0,
        period_date    DATE NOT NULL,
        period_type    VARCHAR(10) DEFAULT 'daily'
                       CHECK (period_type IN ('hourly','daily','monthly')),
        created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
        await qr.query(`
      CREATE TABLE IF NOT EXISTS app.reconciliation_records (
        id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id      UUID NOT NULL REFERENCES app.tenants(id) ON DELETE CASCADE,
        recon_ref      VARCHAR(100) NOT NULL,
        source_system  VARCHAR(50),
        target_system  VARCHAR(50),
        source_amount  NUMERIC(20,4),
        target_amount  NUMERIC(20,4),
        variance       NUMERIC(20,4) GENERATED ALWAYS AS (source_amount - target_amount) STORED,
        status         VARCHAR(20) NOT NULL DEFAULT 'unmatched'
                       CHECK (status IN ('matched','unmatched','break','investigating','resolved')),
        break_reason   TEXT,
        aged_days      INTEGER DEFAULT 0,
        recon_date     DATE NOT NULL,
        resolved_at    TIMESTAMPTZ,
        created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
        const tables = [
            'merchants', 'accounts', 'cards', 'transactions',
            'clearing_records', 'settlement_records', 'scheme_participants',
            'scheme_transactions', 'reconciliation_records'
        ];
        for (const t of tables) {
            await qr.query(`CREATE INDEX idx_${t}_tenant ON app.${t}(tenant_id)`);
        }
        await qr.query(`CREATE INDEX idx_transactions_created ON app.transactions(tenant_id, created_at DESC)`);
        await qr.query(`CREATE INDEX idx_transactions_status ON app.transactions(tenant_id, status)`);
        await qr.query(`CREATE INDEX idx_transactions_card ON app.transactions(tenant_id, card_id)`);
        await qr.query(`CREATE INDEX idx_transactions_merchant ON app.transactions(tenant_id, merchant_id)`);
        await qr.query(`CREATE INDEX idx_clearing_batch ON app.clearing_records(tenant_id, clearing_batch)`);
        await qr.query(`CREATE INDEX idx_settlement_date ON app.settlement_records(tenant_id, settlement_date DESC)`);
        await qr.query(`CREATE INDEX idx_recon_date ON app.reconciliation_records(tenant_id, recon_date DESC)`);
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
        const tables = [
            'reconciliation_records', 'scheme_transactions', 'settlement_records',
            'scheme_participants', 'clearing_records', 'transactions',
            'cards', 'accounts', 'merchants'
        ];
        for (const t of tables) {
            await qr.query(`DROP TABLE IF EXISTS app.${t} CASCADE`);
        }
    }
}
exports.CreatePaymentDomain1000000000002 = CreatePaymentDomain1000000000002;
//# sourceMappingURL=002_create_payment_domain.js.map