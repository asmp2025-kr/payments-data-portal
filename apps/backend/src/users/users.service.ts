import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(@InjectDataSource() private readonly db: DataSource) {}

  async findAll(tenantId: string, dto: any) {
    const offset = ((dto.page || 1) - 1) * (dto.limit || 20);
    return this.db.query(`
      SELECT id, tenant_id, email, first_name, last_name, role, is_active, last_login_at, created_at
      FROM app.users WHERE tenant_id = $1
      ORDER BY created_at DESC LIMIT $2 OFFSET $3
    `, [tenantId, dto.limit || 20, offset]);
  }

  async findById(tenantId: string, id: string) {
    const [u] = await this.db.query(
      `SELECT * FROM app.users WHERE id = $1 AND tenant_id = $2`, [id, tenantId]
    );
    if (!u) throw new NotFoundException('User not found');
    return u;
  }

  async create(tenantId: string, data: any) {
    const [u] = await this.db.query(`
      INSERT INTO app.users (tenant_id, keycloak_id, email, first_name, last_name, role)
      VALUES ($1, $2, $3, $4, $5, $6) RETURNING *
    `, [tenantId, data.keycloakId, data.email, data.firstName, data.lastName, data.role || 'operations']);
    return u;
  }

  async update(tenantId: string, id: string, data: any) {
    const [u] = await this.db.query(`
      UPDATE app.users SET
        first_name = COALESCE($3, first_name),
        last_name  = COALESCE($4, last_name),
        role       = COALESCE($5, role),
        is_active  = COALESCE($6, is_active),
        updated_at = NOW()
      WHERE id = $1 AND tenant_id = $2 RETURNING *
    `, [id, tenantId, data.firstName, data.lastName, data.role, data.isActive]);
    return u;
  }

  async deactivate(tenantId: string, id: string) {
    await this.db.query(`UPDATE app.users SET is_active = false WHERE id = $1 AND tenant_id = $2`, [id, tenantId]);
    return { success: true };
  }
}
