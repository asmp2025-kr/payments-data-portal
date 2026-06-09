import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class DataProductsService {
  constructor(@InjectDataSource() private readonly db: DataSource) {}

  async findAll(tenantId: string, dto: any) {
    const offset = ((dto.page || 1) - 1) * (dto.limit || 20);
    const conds: string[] = [];
    const params: any[] = [dto.limit || 20, offset];
    if (dto.domain) { params.push(dto.domain); conds.push(`domain = $${params.length}`); }
    if (dto.status) { params.push(dto.status); conds.push(`status = $${params.length}`); }
    if (dto.search) { params.push(`%${dto.search}%`); conds.push(`name ILIKE $${params.length}`); }
    const where = conds.length ? `AND ${conds.join(' AND ')}` : '';
    return this.db.query(`
      SELECT dp.*, u.email AS owner_email, u.first_name || ' ' || u.last_name AS owner_name
      FROM app.data_products dp
      LEFT JOIN app.users u ON u.id = dp.owner_id
      WHERE dp.status != 'archived' ${where}
      ORDER BY dp.quality_score DESC, dp.name
      LIMIT $1 OFFSET $2
    `, params);
  }

  async findById(tenantId: string, id: string) {
    const [dp] = await this.db.query(`SELECT * FROM app.data_products WHERE id = $1`, [id]);
    if (!dp) throw new NotFoundException('Data product not found');
    return dp;
  }

  async create(tenantId: string, userId: string, data: any) {
    const [dp] = await this.db.query(`
      INSERT INTO app.data_products (tenant_id, name, slug, domain, description, owner_id, quality_score, refresh_frequency, api_endpoint, schema_definition, lineage, tags, access_type)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING *
    `, [tenantId, data.name, data.slug, data.domain, data.description, userId,
        data.qualityScore || 0, data.refreshFrequency || 'daily', data.apiEndpoint,
        JSON.stringify(data.schemaDefinition || {}), JSON.stringify(data.lineage || {}),
        data.tags || [], data.accessType || 'request']);
    return dp;
  }

  async requestAccess(tenantId: string, productId: string, userId: string, reason: string) {
    const [r] = await this.db.query(`
      INSERT INTO app.data_product_access (tenant_id, product_id, user_id, reason)
      VALUES ($1,$2,$3,$4) RETURNING *
    `, [tenantId, productId, userId, reason]);
    return r;
  }

  async getQualityMetrics(tenantId: string, id: string) {
    const [dp] = await this.db.query(`SELECT quality_score, refresh_frequency, updated_at FROM app.data_products WHERE id = $1`, [id]);
    if (!dp) throw new NotFoundException();
    return {
      qualityScore: dp.quality_score,
      completeness: Math.min(100, Number(dp.quality_score) + 5),
      timeliness: dp.refresh_frequency === 'realtime' ? 100 : dp.refresh_frequency === 'hourly' ? 95 : 90,
      accuracy: 99.2,
      lastRefreshed: dp.updated_at,
    };
  }

  async update(tenantId: string, id: string, data: any) {
    const [dp] = await this.db.query(`
      UPDATE app.data_products SET
        name = COALESCE($2, name), description = COALESCE($3, description),
        quality_score = COALESCE($4, quality_score), status = COALESCE($5, status),
        updated_at = NOW()
      WHERE id = $1 RETURNING *
    `, [id, data.name, data.description, data.qualityScore, data.status]);
    return dp;
  }
}
