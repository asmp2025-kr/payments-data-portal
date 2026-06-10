/**
 * Demo seed script — creates 3 tenants and 7 demo users.
 *
 * Usage:
 *   DATABASE_URL="postgresql://..." node scripts/seed-demo.mjs
 *
 * Or set via .env file in apps/backend/.env
 */
import pg from 'pg';
import bcrypt from 'bcryptjs';
const { Client } = pg;

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('❌ DATABASE_URL environment variable is required');
  process.exit(1);
}

// For Supabase: use pooler URL (aws-0-eu-west-1.pooler.supabase.com:6543)
// with username postgres.PROJECT_REF
const c = new Client({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

async function seed() {
  await c.connect();
  await c.query('SET search_path TO app, public');
  console.log('✅ Connected to database');

  const tenants = [
    { name: 'Bank Alpha', slug: 'bank-alpha', plan: 'enterprise',    country: 'US' },
    { name: 'Bank Beta',  slug: 'bank-beta',  plan: 'professional',  country: 'GB' },
    { name: 'Bank Gamma', slug: 'bank-gamma', plan: 'basic',         country: 'DE' }
  ];

  const tenantIds = {};
  for (const t of tenants) {
    const res = await c.query(
      `INSERT INTO app.tenants (name, slug, subscription_plan, country, is_active)
       VALUES ($1, $2, $3, $4, true)
       ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name
       RETURNING id`,
      [t.name, t.slug, t.plan, t.country]
    );
    tenantIds[t.slug] = res.rows[0].id;
    console.log(`✅ Tenant: ${t.name}`);
  }

  const hash = await bcrypt.hash('BankAdmin123!', 10);

  const users = [
    { tenant: 'bank-alpha', email: 'admin@bank-alpha.com',      role: 'bank_admin',  first: 'Alice',  last: 'Admin'      },
    { tenant: 'bank-alpha', email: 'ops@bank-alpha.com',        role: 'operations',  first: 'Bob',    last: 'Operations' },
    { tenant: 'bank-alpha', email: 'compliance@bank-alpha.com', role: 'compliance',  first: 'Carol',  last: 'Compliance' },
    { tenant: 'bank-alpha', email: 'exec@bank-alpha.com',       role: 'executive',   first: 'David',  last: 'Executive'  },
    { tenant: 'bank-alpha', email: 'auditor@bank-alpha.com',    role: 'auditor',     first: 'Eve',    last: 'Auditor'    },
    { tenant: 'bank-beta',  email: 'admin@bank-beta.com',       role: 'bank_admin',  first: 'Frank',  last: 'Beta'       },
    { tenant: 'bank-gamma', email: 'admin@bank-gamma.com',      role: 'bank_admin',  first: 'Grace',  last: 'Gamma'      },
  ];

  for (const u of users) {
    await c.query(
      `INSERT INTO app.users (tenant_id, email, first_name, last_name, role, is_active, password_hash)
       VALUES ($1, $2, $3, $4, $5, true, $6)
       ON CONFLICT (tenant_id, email) DO UPDATE SET password_hash=$6, role=$5`,
      [tenantIds[u.tenant], u.email, u.first, u.last, u.role, hash]
    );
    console.log(`✅ User: ${u.email} (${u.role})`);
  }

  await c.end();
  console.log('\n🎉 Seed complete! All demo accounts use password: BankAdmin123!');
}

seed().catch(e => { console.error('❌', e.message); process.exit(1); });
