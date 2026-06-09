import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { passportJwtSecret } from 'jwks-rsa';
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
      secretOrKeyProvider: passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: `${cfg.get('KEYCLOAK_URL')}/realms/${cfg.get('KEYCLOAK_REALM')}/protocol/openid-connect/certs`,
      }),
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      audience: cfg.get('KEYCLOAK_CLIENT_ID'),
      issuer: `${cfg.get('KEYCLOAK_URL')}/realms/${cfg.get('KEYCLOAK_REALM')}`,
      algorithms: ['RS256'],
    });
  }

  async validate(payload: any) {
    const tenantId = payload.tenant_id;
    if (!tenantId) throw new UnauthorizedException('No tenant_id in token');

    // Resolve user from DB
    const [user] = await this.dataSource.query(
      `SELECT u.id, u.tenant_id, u.email, u.role, u.is_active
       FROM app.users u
       WHERE u.keycloak_id = $1 AND u.is_active = true`,
      [payload.sub],
    );

    if (!user) throw new UnauthorizedException('User not found or inactive');

    return {
      sub: user.id,
      keycloakId: payload.sub,
      tenantId: user.tenant_id,
      email: user.email,
      role: user.role,
      firstName: payload.given_name,
      lastName: payload.family_name,
    };
  }
}
