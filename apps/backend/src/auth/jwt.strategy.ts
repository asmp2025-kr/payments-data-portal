import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly cfg: ConfigService,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {
    super({
      // Simple symmetric JWT secret — works without Keycloak
      secretOrKey: cfg.get<string>('JWT_SECRET', 'payments_portal_secret'),
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      algorithms: ['HS256'],
    });
  }

  async validate(payload: any) {
    const tenantId = payload.tenant_id;
    if (!tenantId) throw new UnauthorizedException('No tenant_id in token');
    if (!payload.sub) throw new UnauthorizedException('Invalid token payload');

    return {
      sub: payload.sub,
      tenantId: payload.tenant_id,
      email: payload.email,
      role: payload.role,
      firstName: payload.first_name,
      lastName: payload.last_name,
    };
  }
}
