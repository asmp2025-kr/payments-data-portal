import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class TenantsService {
  constructor(@InjectDataSource() private readonly db: DataSource) {}

  async findAll() {
    return this.db.query(`SELECT * FROM app.tenants WHERE is_active = true ORDER BY name`);
  }

  async findById(id: string) {
    const [t] = await this.db.query(`SELECT * FROM app.tenants WHERE id = $1`, [id]);
    if (!t) throw new NotFoundException('Tenant not found');
    return t;
  }

  async create(data: any) {
    const [t] = await this.db.query(`
      INSERT INTO app.tenants (name, slug, logo_url, theme_config, subscription_plan, contact_email, country)
      VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *
    `, [data.name, data.slug, data.logoUrl, JSON.stringify(data.themeConfig || {}),
        data.subscriptionPlan || 'basic', data.contactEmail, data.country]);
    return t;
  }

  async update(id: string, data: any) {
    const [t] = await this.db.query(`
      UPDATE app.tenants SET
        name = COALESCE($2, name),
        logo_url = COALESCE($3, logo_url),
        theme_config = COALESCE($4::jsonb, theme_config),
        subscription_plan = COALESCE($5, subscription_plan),
        updated_at = NOW()
      WHERE id = $1 RETURNING *
    `, [id, data.name, data.logoUrl, data.themeConfig ? JSON.stringify(data.themeConfig) : null, data.subscriptionPlan]);
    return t;
  }

  async getThemeConfig(slug: string) {
    const [t] = await this.db.query(
      `SELECT name, slug, logo_url, theme_config FROM app.tenants WHERE slug = $1 AND is_active = true`,
      [slug]
    );
    return t || null;
  }
}
