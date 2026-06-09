/**
 * Seed data generator for the Payments Data Portal.
 * Generates: 3 tenants, 100 users, 5M transactions, all related records covering 3 years.
 *
 * Run: npx ts-node --project tsconfig.seed.json scripts/seed.ts
 */

import { Pool } from 'pg';
import { v4 as uuidv4 } from 'uuid';
import * as bcrypt from 'bcrypt';

const pool = new Pool({
  host: process.env.POSTGRES_HOST || 'localhost',
  port: Number(process.env.POSTGRES_PORT) || 5432,
  database: process.env.POSTGRES_DB || 'payments',
  user: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || 'postgres',
});

// ─── Helpers ─────────────────────────────────────────────────────────────────

const rnd = (min: number, max: number) => Math.random() * (max - min) + min;
const rndInt = (min: number, max: number) => Math.floor(rnd(min, max));
const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const chance = (pct: number) => Math.random() < pct;

const DATE_FROM = new Date('2022-01-01');
const DATE_TO = new Date('2024-12-31');

function randomDate(from = DATE_FROM, to = DATE_TO): Date {
  return new Date(from.getTime() + Math.random() * (to.getTime() - from.getTime()));
}

async function batchInsert(client: any, table: string, rows: Record<string, any>[], batchSize = 500) {
  if (rows.length === 0) return;
  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize);
    const keys = Object.keys(batch[0]);
    const values: any[] = [];
    const placeholders = batch.map((row, ri) => {
      const rowPlaceholders = keys.map((_, ki) => {
        values.push(row[keys[ki]]);
        return `$${ri * keys.length + ki + 1}`;
      });
      return `(${rowPlaceholders.join(', ')})`;
    });
    await client.query(
      `INSERT INTO app.${table} (${keys.join(', ')}) VALUES ${placeholders.join(', ')} ON CONFLICT DO NOTHING`,
      values
    );
    process.stdout.write(`\r  ${table}: ${Math.min(i + batchSize, rows.length)}/${rows.length}`);
  }
  console.log();
}

// ─── Tenants ─────────────────────────────────────────────────────────────────

const TENANTS = [
  {
    id: uuidv4(), name: 'Alpha Bank', slug: 'bank-alpha',
    subscription_plan: 'enterprise', country: 'US',
    contact_email: 'admin@bank-alpha.com',
    theme_config: JSON.stringify({ primary: '#2563EB', logo: null }),
  },
  {
    id: uuidv4(), name: 'Beta Financial', slug: 'bank-beta',
    subscription_plan: 'professional', country: 'GB',
    contact_email: 'admin@bank-beta.com',
    theme_config: JSON.stringify({ primary: '#10B981', logo: null }),
  },
  {
    id: uuidv4(), name: 'Gamma Payments', slug: 'bank-gamma',
    subscription_plan: 'basic', country: 'SG',
    contact_email: 'admin@bank-gamma.com',
    theme_config: JSON.stringify({ primary: '#F59E0B', logo: null }),
  },
];

const ROLES = ['bank_admin', 'operations', 'compliance', 'executive', 'auditor'];
const ROLE_DIST = [0.1, 0.3, 0.2, 0.2, 0.2]; // cumulative

function pickRole(): string {
  const r = Math.random();
  let cum = 0;
  for (let i = 0; i < ROLES.length; i++) {
    cum += ROLE_DIST[i];
    if (r < cum) return ROLES[i];
  }
  return ROLES[ROLES.length - 1];
}

// ─── Constants ───────────────────────────────────────────────────────────────

const CURRENCIES = ['USD', 'EUR', 'GBP', 'SGD', 'AUD', 'JPY', 'CAD', 'CHF'];
const TXN_TYPES = ['purchase', 'refund', 'transfer', 'withdrawal', 'deposit', 'payment'];
const TXN_STATUSES = ['cleared', 'failed', 'pending'];
const TXN_STATUS_WEIGHTS = [0.97, 0.02, 0.01];
const CHANNELS = ['online', 'pos', 'mobile', 'atm', 'api'];
const FRAUD_TYPES = ['card_not_present', 'account_takeover', 'identity_theft', 'merchant_fraud', 'phishing'];
const AML_TYPES = ['structuring', 'layering', 'integration', 'smurfing', 'trade_based', 'high_risk_geography'];
const MERCHANT_CATEGORIES = ['retail', 'travel', 'food_beverage', 'healthcare', 'entertainment', 'utilities', 'financial'];
const COUNTRIES = ['US', 'GB', 'DE', 'FR', 'SG', 'JP', 'AU', 'CA', 'HK', 'AE'];
const PARTICIPANT_TYPES = ['direct', 'indirect', 'associate'];
const CLEARING_STATUSES_W = { cleared: 0.97, failed: 0.02, exception: 0.01 };
const SETTLEMENT_STATUSES_W = { settled: 0.96, failed: 0.02, pending: 0.02 };
const COMPLIANCE_SEVERITY = ['critical', 'high', 'medium', 'low'];
const COMPLIANCE_FINDING_TYPES = ['data_retention', 'kyc_gap', 'reporting_delay', 'policy_violation', 'control_failure', 'audit_finding'];

function weightedPick(options: Record<string, number>): string {
  const r = Math.random();
  let cum = 0;
  for (const [k, w] of Object.entries(options)) {
    cum += w;
    if (r < cum) return k;
  }
  return Object.keys(options)[0];
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function seed() {
  console.log('🌱 Starting seed...\n');
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    await client.query(`SET app.bypass_rls = 'true'`);

    // ── Tenants ──────────────────────────────────────────────────────────────
    console.log('Seeding tenants...');
    await batchInsert(client, 'tenants', TENANTS.map(t => ({
      id: t.id, name: t.name, slug: t.slug,
      subscription_plan: t.subscription_plan, country: t.country,
      contact_email: t.contact_email, theme_config: t.theme_config,
      is_active: true,
      created_at: new Date(), updated_at: new Date(),
    })));

    // ── Subscriptions ────────────────────────────────────────────────────────
    console.log('Seeding subscriptions...');
    const subRows = TENANTS.map(t => ({
      id: uuidv4(), tenant_id: t.id, plan: t.subscription_plan,
      max_users: t.subscription_plan === 'enterprise' ? -1 : t.subscription_plan === 'professional' ? 50 : 5,
      features_json: JSON.stringify({
        reports: true, excel: t.subscription_plan !== 'basic', custom_dashboards: t.subscription_plan !== 'basic',
        sso: t.subscription_plan === 'enterprise', white_labeling: t.subscription_plan === 'enterprise',
      }),
      valid_from: new Date('2022-01-01'), valid_until: new Date('2026-12-31'),
      status: 'active',
    }));
    await batchInsert(client, 'subscriptions', subRows);

    // ── Users (100 total spread across 3 tenants) ────────────────────────────
    console.log('Seeding users...');
    const userRows: any[] = [];
    const userIds: Record<string, string[]> = {};
    const USERS_PER_TENANT = [40, 35, 25];
    for (let ti = 0; ti < TENANTS.length; ti++) {
      const t = TENANTS[ti];
      userIds[t.id] = [];
      // Admin user (predictable)
      const adminId = uuidv4();
      userRows.push({
        id: adminId, tenant_id: t.id,
        keycloak_id: `${t.slug}-admin`,
        email: `admin@${t.slug}.com`,
        first_name: 'Admin', last_name: t.name,
        role: 'bank_admin', is_active: true,
        created_at: new Date('2022-01-01'),
      });
      userIds[t.id].push(adminId);
      for (let ui = 1; ui < USERS_PER_TENANT[ti]; ui++) {
        const id = uuidv4();
        userRows.push({
          id, tenant_id: t.id,
          keycloak_id: `${t.slug}-user-${ui}`,
          email: `user${ui}@${t.slug}.com`,
          first_name: `User${ui}`, last_name: t.name.split(' ')[0],
          role: pickRole(), is_active: chance(0.9),
          last_login_at: chance(0.7) ? randomDate(new Date('2024-01-01'), DATE_TO) : null,
          created_at: randomDate(new Date('2022-01-01'), new Date('2023-12-31')),
        });
        userIds[t.id].push(id);
      }
    }
    await batchInsert(client, 'users', userRows);

    // ── Merchants ────────────────────────────────────────────────────────────
    console.log('\nSeeding merchants...');
    const merchantRows: any[] = [];
    const merchantIdsByTenant: Record<string, string[]> = {};
    for (const t of TENANTS) {
      merchantIdsByTenant[t.id] = [];
      for (let i = 0; i < 200; i++) {
        const id = uuidv4();
        merchantRows.push({
          id, tenant_id: t.id,
          merchant_id: `MER-${t.slug.slice(0,3).toUpperCase()}-${String(i).padStart(5, '0')}`,
          name: `Merchant ${i + 1}`,
          category: pick(MERCHANT_CATEGORIES),
          country: pick(COUNTRIES),
          risk_score: rndInt(10, 100),
          created_at: randomDate(new Date('2021-01-01'), new Date('2022-06-01')),
        });
        merchantIdsByTenant[t.id].push(id);
      }
    }
    await batchInsert(client, 'merchants', merchantRows);

    // ── Accounts ─────────────────────────────────────────────────────────────
    console.log('\nSeeding accounts...');
    const accountRows: any[] = [];
    const accountIdsByTenant: Record<string, string[]> = {};
    for (const t of TENANTS) {
      accountIdsByTenant[t.id] = [];
      for (let i = 0; i < 500; i++) {
        const id = uuidv4();
        accountRows.push({
          id, tenant_id: t.id,
          account_number: `ACC${t.slug.slice(0,3).toUpperCase()}${String(i).padStart(8, '0')}`,
          account_type: pick(['current', 'savings', 'loan', 'investment']),
          balance: rnd(1000, 500000),
          currency: pick(CURRENCIES),
          status: chance(0.85) ? 'active' : pick(['dormant', 'closed', 'frozen']),
          last_activity_at: chance(0.8) ? randomDate(new Date('2024-01-01'), DATE_TO) : null,
          created_at: randomDate(new Date('2020-01-01'), new Date('2023-01-01')),
        });
        accountIdsByTenant[t.id].push(id);
      }
    }
    await batchInsert(client, 'accounts', accountRows);

    // ── Cards ─────────────────────────────────────────────────────────────────
    console.log('\nSeeding cards...');
    const cardRows: any[] = [];
    const cardIdsByTenant: Record<string, string[]> = {};
    for (const t of TENANTS) {
      cardIdsByTenant[t.id] = [];
      for (let i = 0; i < 600; i++) {
        const id = uuidv4();
        const acctId = pick(accountIdsByTenant[t.id]);
        cardRows.push({
          id, tenant_id: t.id,
          card_number_masked: `****-****-****-${String(rndInt(1000, 9999))}`,
          card_type: pick(['debit', 'credit', 'prepaid']),
          brand: pick(['Visa', 'Mastercard', 'Amex', 'UnionPay']),
          account_id: acctId,
          status: chance(0.88) ? 'active' : pick(['blocked', 'expired', 'cancelled']),
          expiry_date: new Date(rndInt(2025, 2030), rndInt(0, 11), 1),
          spend_limit: rnd(5000, 50000),
          activated_at: randomDate(new Date('2021-01-01'), new Date('2023-06-01')),
          created_at: randomDate(new Date('2021-01-01'), new Date('2023-01-01')),
        });
        cardIdsByTenant[t.id].push(id);
      }
    }
    await batchInsert(client, 'cards', cardRows);

    // ── Scheme Participants ───────────────────────────────────────────────────
    console.log('\nSeeding scheme participants...');
    const participantRows: any[] = [];
    const participantIdsByTenant: Record<string, string[]> = {};
    for (const t of TENANTS) {
      participantIdsByTenant[t.id] = [];
      for (let i = 0; i < 20; i++) {
        const id = uuidv4();
        participantRows.push({
          id, tenant_id: t.id,
          participant_code: `PAR${String(i + 1).padStart(3, '0')}`,
          name: `Participant Bank ${i + 1}`,
          type: pick(PARTICIPANT_TYPES),
          country: pick(COUNTRIES),
          status: chance(0.95) ? 'active' : 'suspended',
          created_at: randomDate(new Date('2021-01-01'), new Date('2022-01-01')),
        });
        participantIdsByTenant[t.id].push(id);
      }
    }
    await batchInsert(client, 'scheme_participants', participantRows);

    // ── Transactions (5M total batched) ───────────────────────────────────────
    console.log('\nSeeding transactions (5,000,000)...');
    const TXN_PER_TENANT = [2_000_000, 1_800_000, 1_200_000];
    const txnIdsByTenant: Record<string, string[]> = {};

    for (let ti = 0; ti < TENANTS.length; ti++) {
      const t = TENANTS[ti];
      txnIdsByTenant[t.id] = [];
      const total = TXN_PER_TENANT[ti];
      const CHUNK = 5000;

      for (let offset = 0; offset < total; offset += CHUNK) {
        const rows: any[] = [];
        const batchCount = Math.min(CHUNK, total - offset);
        for (let i = 0; i < batchCount; i++) {
          const id = uuidv4();
          const txnDate = randomDate();
          // Seasonal factor: higher volume in Dec and Jun
          const month = txnDate.getMonth();
          const seasonalMultiplier = (month === 11 || month === 5) ? 1.4 : 1.0;
          const statusR = Math.random();
          let status: string;
          let cum = 0;
          for (let j = 0; j < TXN_STATUSES.length; j++) {
            cum += TXN_STATUS_WEIGHTS[j];
            if (statusR < cum) { status = TXN_STATUSES[j]; break; }
          }
          rows.push({
            id, tenant_id: t.id,
            transaction_ref: `TXN-${t.slug.slice(0,3).toUpperCase()}-${Date.now()}-${i}`,
            type: pick(TXN_TYPES),
            amount: rnd(0.5, 50000) * seasonalMultiplier,
            currency: pick(CURRENCIES),
            status: status!,
            merchant_id: pick(merchantIdsByTenant[t.id]),
            card_id: chance(0.7) ? pick(cardIdsByTenant[t.id]) : null,
            account_id: pick(accountIdsByTenant[t.id]),
            channel: pick(CHANNELS),
            created_at: txnDate,
            settled_at: status === 'cleared' ? new Date(txnDate.getTime() + rndInt(60, 86400) * 1000) : null,
          });
          txnIdsByTenant[t.id].push(id);
        }
        await batchInsert(client, 'transactions', rows);
        process.stdout.write(`\r  transactions[${t.slug}]: ${Math.min(offset + CHUNK, total)}/${total}`);
      }
      console.log();
    }

    // ── Clearing Records ─────────────────────────────────────────────────────
    console.log('\nSeeding clearing records...');
    for (const t of TENANTS) {
      const txnIds = txnIdsByTenant[t.id];
      const rows: any[] = [];
      // ~70% of transactions go through clearing
      const clearingTxns = txnIds.filter(() => chance(0.7));
      for (const txnId of clearingTxns.slice(0, 500000)) {
        const clearDate = randomDate();
        rows.push({
          id: uuidv4(), tenant_id: t.id, transaction_id: txnId,
          clearing_batch: `BATCH-${String(rndInt(1, 99999)).padStart(5, '0')}`,
          status: weightedPick(CLEARING_STATUSES_W),
          processing_time_ms: rndInt(5, 800),
          participant_id: pick(participantIdsByTenant[t.id]),
          interchange_fee: rnd(0.01, 50),
          cleared_at: clearDate,
          created_at: clearDate,
        });
      }
      await batchInsert(client, 'clearing_records', rows, 1000);
    }

    // ── Settlement Records ───────────────────────────────────────────────────
    console.log('\nSeeding settlement records...');
    for (const t of TENANTS) {
      const rows: any[] = [];
      // Daily settlements for 3 years × 20 participants
      const days = Math.round((DATE_TO.getTime() - DATE_FROM.getTime()) / 86400000);
      for (let d = 0; d < days; d += 1) {
        const sDate = new Date(DATE_FROM.getTime() + d * 86400000);
        for (const pId of participantIdsByTenant[t.id].slice(0, 10)) {
          const gross = rnd(100000, 10000000);
          const fees = gross * rnd(0.001, 0.005);
          rows.push({
            id: uuidv4(), tenant_id: t.id,
            settlement_date: sDate,
            participant_id: pId,
            gross_amount: gross,
            net_amount: gross - fees,
            status: weightedPick(SETTLEMENT_STATUSES_W),
            funded_at: chance(0.95) ? new Date(sDate.getTime() + rndInt(3600, 86400) * 1000) : null,
            created_at: sDate,
          });
        }
      }
      await batchInsert(client, 'settlement_records', rows, 2000);
    }

    // ── Fraud Cases (0.3% of transactions) ──────────────────────────────────
    console.log('\nSeeding fraud cases...');
    for (const t of TENANTS) {
      const rows: any[] = [];
      const sampleTxns = txnIdsByTenant[t.id].slice(0, Math.floor(txnIdsByTenant[t.id].length * 0.003));
      for (const txnId of sampleTxns) {
        const detectedAt = randomDate();
        const isResolved = chance(0.7);
        const amount = rnd(50, 10000);
        rows.push({
          id: uuidv4(), tenant_id: t.id, transaction_id: txnId,
          fraud_type: pick(FRAUD_TYPES),
          amount, status: isResolved ? pick(['resolved', 'recovered']) : pick(['open', 'investigating']),
          detected_at: detectedAt,
          resolved_at: isResolved ? new Date(detectedAt.getTime() + rndInt(3600, 604800) * 1000) : null,
          recovery_amount: isResolved ? amount * rnd(0.3, 1.0) : 0,
          created_at: detectedAt,
        });
      }
      await batchInsert(client, 'fraud_cases', rows, 500);
    }

    // ── AML Alerts ───────────────────────────────────────────────────────────
    console.log('\nSeeding AML alerts...');
    for (const t of TENANTS) {
      const rows: any[] = [];
      for (let i = 0; i < 500; i++) {
        const createdAt = randomDate();
        const isClosed = chance(0.65);
        rows.push({
          id: uuidv4(), tenant_id: t.id,
          customer_id: `CUST-${String(rndInt(1000, 99999))}`,
          alert_type: pick(AML_TYPES),
          risk_score: rndInt(40, 100),
          status: isClosed ? pick(['closed', 'filed_sar']) : pick(['open', 'investigating']),
          assigned_to: pick(userIds[t.id]),
          created_at: createdAt,
          closed_at: isClosed ? new Date(createdAt.getTime() + rndInt(3600, 2592000) * 1000) : null,
        });
      }
      await batchInsert(client, 'aml_alerts', rows);
    }

    // ── SAR Filings ──────────────────────────────────────────────────────────
    // (created inline when AML status = filed_sar, skip for seed simplicity)

    // ── Compliance Findings ──────────────────────────────────────────────────
    console.log('\nSeeding compliance findings...');
    for (const t of TENANTS) {
      const rows: any[] = [];
      for (let i = 0; i < 100; i++) {
        const createdAt = randomDate(new Date('2023-01-01'), DATE_TO);
        const isResolved = chance(0.6);
        rows.push({
          id: uuidv4(), tenant_id: t.id,
          finding_type: pick(COMPLIANCE_FINDING_TYPES),
          severity: pick(COMPLIANCE_SEVERITY),
          status: isResolved ? 'resolved' : pick(['open', 'in_progress', 'overdue']),
          description: `Compliance finding related to ${pick(COMPLIANCE_FINDING_TYPES)} in the ${pick(['Q1', 'Q2', 'Q3', 'Q4'])} review.`,
          due_date: randomDate(DATE_FROM, new Date('2025-06-01')),
          resolved_at: isResolved ? randomDate(createdAt, DATE_TO) : null,
          created_at: createdAt,
        });
      }
      await batchInsert(client, 'compliance_findings', rows);
    }

    // ── Reconciliation Records ───────────────────────────────────────────────
    console.log('\nSeeding reconciliation records...');
    for (const t of TENANTS) {
      const rows: any[] = [];
      for (let i = 0; i < 2000; i++) {
        const reconDate = randomDate(new Date('2023-01-01'), DATE_TO);
        const hasBreak = chance(0.05);
        const sourceAmt = rnd(1000, 5000000);
        const variance = hasBreak ? rnd(-1000, 1000) : 0;
        rows.push({
          id: uuidv4(), tenant_id: t.id,
          ref: `REC-${String(i).padStart(6, '0')}`,
          source_amount: sourceAmt,
          target_amount: sourceAmt + variance,
          status: hasBreak ? pick(['break', 'investigating']) : 'matched',
          break_reason: hasBreak ? pick(['timing_difference', 'amount_mismatch', 'missing_entry', 'duplicate']) : null,
          aged_days: hasBreak ? rndInt(0, 30) : 0,
          recon_date: reconDate,
          created_at: reconDate,
        });
      }
      await batchInsert(client, 'reconciliation_records', rows);
    }

    // ── Scheme Transactions ──────────────────────────────────────────────────
    console.log('\nSeeding scheme transactions...');
    for (const t of TENANTS) {
      const rows: any[] = [];
      const days = Math.round((DATE_TO.getTime() - DATE_FROM.getTime()) / 86400000);
      for (let d = 0; d < days; d += 1) {
        const pDate = new Date(DATE_FROM.getTime() + d * 86400000);
        for (const pId of participantIdsByTenant[t.id].slice(0, 5)) {
          rows.push({
            id: uuidv4(), tenant_id: t.id,
            participant_id: pId,
            volume: rndInt(100, 10000),
            value: rnd(100000, 5000000),
            sla_met: chance(0.99),
            period_date: pDate,
            created_at: pDate,
          });
        }
      }
      await batchInsert(client, 'scheme_transactions', rows, 2000);
    }

    // ── Data Products ────────────────────────────────────────────────────────
    console.log('\nSeeding data products...');
    const domainNames: Record<string, string[]> = {
      clearing: ['Clearing Transactions', 'Clearing Performance', 'Interchange Data'],
      settlement: ['Net Settlement Positions', 'Settlement Records', 'Liquidity Data'],
      fraud: ['Fraud Cases', 'Fraud Risk Scores', 'Fraud Geography'],
      aml: ['AML Alerts', 'Risk Profiles', 'SAR Data'],
      compliance: ['Compliance Findings', 'Audit Logs', 'Regulatory Data'],
      cards: ['Card Portfolio', 'Card Transactions', 'Card Risk Data'],
      accounts: ['Account Balances', 'Account Activity', 'Account Risk'],
      scheme: ['Scheme Participants', 'SLA Performance', 'Scheme Fees'],
      reconciliation: ['Recon Breaks', 'Matched Records', 'Aging Report'],
      finance: ['Revenue Data', 'P&L Records', 'Fee Income'],
    };
    for (const t of TENANTS) {
      const rows: any[] = [];
      for (const [domain, names] of Object.entries(domainNames)) {
        for (const name of names) {
          rows.push({
            id: uuidv4(), tenant_id: t.id,
            name: `${name} - ${t.name}`,
            domain,
            description: `Certified ${domain} data product providing ${name.toLowerCase()} with full lineage.`,
            owner_id: userIds[t.id][0],
            quality_score: rndInt(75, 100),
            refresh_frequency: pick(['real-time', 'hourly', 'daily', 'weekly']),
            api_endpoint: `/api/data-products/${domain}/${name.toLowerCase().replace(/ /g, '-')}`,
            status: 'active',
            created_at: randomDate(new Date('2022-01-01'), new Date('2023-01-01')),
          });
        }
      }
      await batchInsert(client, 'data_products', rows);
    }

    // ── Notifications (sample) ───────────────────────────────────────────────
    console.log('\nSeeding notifications...');
    for (const t of TENANTS) {
      const rows: any[] = [];
      for (const userId of userIds[t.id].slice(0, 10)) {
        for (let i = 0; i < 10; i++) {
          rows.push({
            id: uuidv4(), tenant_id: t.id, user_id: userId,
            type: pick(['alert', 'info', 'warning', 'success']),
            title: pick(['New AML Alert', 'Settlement Completed', 'Fraud Case Update', 'Report Ready', 'System Notice']),
            message: 'Please review the latest activity in the portal.',
            is_read: chance(0.6),
            channel: pick(['in_app', 'email']),
            sent_at: randomDate(new Date('2024-06-01'), DATE_TO),
          });
        }
      }
      await batchInsert(client, 'notifications', rows);
    }

    await client.query('COMMIT');
    console.log('\n✅ Seed completed successfully!');
    console.log(`  Tenants: ${TENANTS.length}`);
    console.log(`  Users: ${userRows.length}`);
    console.log(`  Merchants: ${merchantRows.length}`);
    console.log(`  Transactions: 5,000,000`);

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('\n❌ Seed failed:', err);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
