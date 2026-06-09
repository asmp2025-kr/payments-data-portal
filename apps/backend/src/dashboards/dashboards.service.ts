import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class DashboardsService {
  constructor(@InjectDataSource() private readonly db: DataSource) {}

  async findAll(tenantId: string, dto: any) {
    const offset = ((dto.page || 1) - 1) * (dto.limit || 20);
    return this.db.query(`
      SELECT d.*, u.email AS creator_email
      FROM app.dashboards d
      LEFT JOIN app.users u ON u.id = d.created_by
      WHERE (d.tenant_id = $1 OR d.is_template = true)
        AND d.is_shared = true OR d.created_by = ANY(
          SELECT id FROM app.users WHERE tenant_id = $1
        )
      ORDER BY d.is_template DESC, d.view_count DESC
      LIMIT $2 OFFSET $3
    `, [tenantId, dto.limit || 20, offset]);
  }

  async getTemplates(tenantId: string) {
    return this.db.query(`SELECT * FROM app.dashboards WHERE is_template = true ORDER BY module, name`);
  }

  async findById(tenantId: string, id: string) {
    const [d] = await this.db.query(`SELECT * FROM app.dashboards WHERE id = $1`, [id]);
    if (!d) throw new NotFoundException('Dashboard not found');
    return d;
  }

  async create(tenantId: string, userId: string, data: any) {
    const [d] = await this.db.query(`
      INSERT INTO app.dashboards (tenant_id, name, description, module, layout_config, widgets_config, is_template, created_by)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *
    `, [tenantId, data.name, data.description, data.module,
        JSON.stringify(data.layoutConfig || {}), JSON.stringify(data.widgetsConfig || []),
        false, userId]);
    return d;
  }

  async update(tenantId: string, id: string, data: any) {
    const [d] = await this.db.query(`
      UPDATE app.dashboards SET
        name = COALESCE($2, name),
        widgets_config = COALESCE($3::jsonb, widgets_config),
        layout_config = COALESCE($4::jsonb, layout_config),
        updated_at = NOW()
      WHERE id = $1 RETURNING *
    `, [id, data.name, data.widgetsConfig ? JSON.stringify(data.widgetsConfig) : null,
        data.layoutConfig ? JSON.stringify(data.layoutConfig) : null]);
    return d;
  }

  async clone(tenantId: string, userId: string, id: string) {
    const [orig] = await this.db.query(`SELECT * FROM app.dashboards WHERE id = $1`, [id]);
    if (!orig) throw new NotFoundException();
    const [d] = await this.db.query(`
      INSERT INTO app.dashboards (tenant_id, name, description, module, layout_config, widgets_config, created_by)
      VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *
    `, [tenantId, `${orig.name} (Copy)`, orig.description, orig.module,
        JSON.stringify(orig.layout_config), JSON.stringify(orig.widgets_config), userId]);
    return d;
  }

  async generateShareToken(id: string) {
    const token = uuidv4();
    await this.db.query(`UPDATE app.dashboards SET share_token = $1, is_shared = true WHERE id = $2`, [token, id]);
    return { token };
  }

  async delete(tenantId: string, id: string) {
    await this.db.query(`DELETE FROM app.dashboards WHERE id = $1 AND tenant_id = $2 AND is_template = false`, [id, tenantId]);
    return { success: true };
  }
}
