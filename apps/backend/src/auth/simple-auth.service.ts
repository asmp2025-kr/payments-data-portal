import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SimpleAuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly dataSource: DataSource,
  ) {}

  async login(email: string, password: string) {
    const result = await this.dataSource.query(
      `SELECT u.id, u.email, u.first_name, u.last_name, u.role, u.tenant_id,
              u.is_active, u.password_hash
       FROM app.users u
       WHERE u.email = $1 AND u.is_active = true
       LIMIT 1`,
      [email],
    );

    if (!result.length) throw new UnauthorizedException('Invalid credentials');
    const user = result[0];

    // For demo: if no password_hash set, accept any password (first login)
    if (user.password_hash) {
      const valid = await bcrypt.compare(password, user.password_hash);
      if (!valid) throw new UnauthorizedException('Invalid credentials');
    }

    // Update last login
    await this.dataSource.query(
      `UPDATE app.users SET last_login_at = NOW() WHERE id = $1`,
      [user.id],
    );

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      tenant_id: user.tenant_id,
      first_name: user.first_name,
      last_name: user.last_name,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
        tenant_id: user.tenant_id,
      },
    };
  }

  async me(userId: string) {
    const result = await this.dataSource.query(
      `SELECT u.id, u.email, u.first_name, u.last_name, u.role, u.tenant_id,
              t.name as tenant_name, t.slug as tenant_slug, t.theme_config,
              t.subscription_plan
       FROM app.users u
       JOIN app.tenants t ON t.id = u.tenant_id
       WHERE u.id = $1`,
      [userId],
    );
    return result[0];
  }

  async changePassword(userId: string, newPassword: string) {
    const hash = await bcrypt.hash(newPassword, 10);
    await this.dataSource.query(
      `UPDATE app.users SET password_hash = $1 WHERE id = $2`,
      [hash, userId],
    );
    return { message: 'Password updated' };
  }
}
