import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

export const PLAN_FEATURES = {
  basic: { max_users: 5, custom_dashboards: false, excel_export: false, api_access: false, white_label: false, sso: false },
  professional: { max_users: 50, custom_dashboards: true, excel_export: true, api_access: true, white_label: false, sso: false },
  enterprise: { max_users: -1, custom_dashboards: true, excel_export: true, api_access: true, white_label: true, sso: true },
};

@Injectable()
export class SubscriptionsService {
  constructor(@InjectDataSource() private readonly db: DataSource) {}

  async getForTenant(tenantId: string) {
    const [s] = await this.db.query(`
      SELECT s.*, (SELECT COUNT(*) FROM app.users WHERE tenant_id = $1 AND is_active = true) AS current_users
      FROM app.subscriptions s WHERE s.tenant_id = $1 AND s.status = 'active'
      ORDER BY s.created_at DESC LIMIT 1
    `, [tenantId]);
    return s;
  }

  async checkFeature(tenantId: string, feature: string): Promise<boolean> {
    const sub = await this.getForTenant(tenantId);
    if (!sub) return false;
    const features = PLAN_FEATURES[sub.plan] || PLAN_FEATURES.basic;
    return !!(features as any)[feature];
  }

  getPlans() {
    return Object.entries(PLAN_FEATURES).map(([plan, features]) => ({
      plan, ...features,
      pricing: { basic: 299, professional: 999, enterprise: 0 }[plan],
    }));
  }

  async create(tenantId: string, plan: string) {
    const features = PLAN_FEATURES[plan] || PLAN_FEATURES.basic;
    const [s] = await this.db.query(`
      INSERT INTO app.subscriptions (tenant_id, plan, max_users, features_json)
      VALUES ($1,$2,$3,$4) RETURNING *
    `, [tenantId, plan, features.max_users, JSON.stringify(features)]);
    await this.db.query(`UPDATE app.tenants SET subscription_plan = $1 WHERE id = $2`, [plan, tenantId]);
    return s;
  }
}
