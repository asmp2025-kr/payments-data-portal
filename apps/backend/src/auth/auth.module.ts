import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtStrategy } from './jwt.strategy';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { SimpleAuthService } from './simple-auth.service';
import { SimpleAuthController } from './simple-auth.controller';

@Module({
  imports: [
    PassportModule,
    ConfigModule,
    TypeOrmModule.forFeature([]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => ({
        secret: cfg.get<string>('JWT_SECRET', 'payments_portal_secret'),
        signOptions: {
          expiresIn: cfg.get<string>('JWT_EXPIRY', '8h'),
        },
      }),
    }),
  ],
  providers: [JwtStrategy, AuthService, SimpleAuthService],
  controllers: [AuthController, SimpleAuthController],
  exports: [AuthService, SimpleAuthService, JwtModule],
})
export class AuthModule {}
