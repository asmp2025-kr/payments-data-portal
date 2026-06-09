import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class NotificationsService {
  constructor(@InjectDataSource() private readonly db: DataSource) {}

  async getForUser(tenantId: string, userId: string, dto: any) {
    const offset = ((dto.page || 1) - 1) * (dto.limit || 20);
    return this.db.query(`
      SELECT * FROM app.notifications
      WHERE tenant_id = $1 AND (user_id = $2 OR user_id IS NULL)
      ORDER BY sent_at DESC LIMIT $3 OFFSET $4
    `, [tenantId, userId, dto.limit || 20, offset]);
  }

  async getUnreadCount(tenantId: string, userId: string) {
    const [r] = await this.db.query(`
      SELECT COUNT(*)::bigint AS count FROM app.notifications
      WHERE tenant_id = $1 AND (user_id = $2 OR user_id IS NULL) AND is_read = false
    `, [tenantId, userId]);
    return r;
  }

  async markRead(tenantId: string, userId: string, id: string) {
    await this.db.query(`
      UPDATE app.notifications SET is_read = true, read_at = NOW()
      WHERE id = $1 AND tenant_id = $2
    `, [id, tenantId]);
    return { success: true };
  }

  async markAllRead(tenantId: string, userId: string) {
    await this.db.query(`
      UPDATE app.notifications SET is_read = true, read_at = NOW()
      WHERE tenant_id = $1 AND (user_id = $2 OR user_id IS NULL) AND is_read = false
    `, [tenantId, userId]);
    return { success: true };
  }

  async create(tenantId: string, data: any) {
    const [n] = await this.db.query(`
      INSERT INTO app.notifications (tenant_id, user_id, type, title, message, link, channel, metadata)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *
    `, [tenantId, data.userId || null, data.type, data.title, data.message, data.link, data.channel || 'in_app', JSON.stringify(data.metadata || {})]);
    return n;
  }
}
