import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthModule } from './auth/auth.module';
import { TenantsModule } from './tenants/tenants.module';
import { UsersModule } from './users/users.module';
import { ClearingModule } from './clearing/clearing.module';
import { SettlementModule } from './settlement/settlement.module';
import { AccountsModule } from './accounts/accounts.module';
import { CardsModule } from './cards/cards.module';
import { FraudModule } from './fraud/fraud.module';
import { AmlModule } from './aml/aml.module';
import { ComplianceModule } from './compliance/compliance.module';
import { SchemeModule } from './scheme/scheme.module';
import { ReconciliationModule } from './reconciliation/reconciliation.module';
import { FinanceModule } from './finance/finance.module';
import { DataProductsModule } from './data-products/data-products.module';
import { DashboardsModule } from './dashboards/dashboards.module';
import { ReportsModule } from './reports/reports.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { NotificationsModule } from './notifications/notifications.module';
import { AuditModule } from './audit/audit.module';
import { SearchModule } from './search/search.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => {
        const rawUrl = cfg.get<string>('DATABASE_URL') || '';
        const isSupabase = rawUrl.includes('supabase.co');
        // Strip sslmode from URL — we control SSL via the ssl option below
        const dbUrl = rawUrl.replace(/[?&]sslmode=[^&]*/g, '').replace(/\?$/, '');
        // For Supabase, disable Node.js certificate verification globally
        if (isSupabase) process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
        return {
          type: 'postgres',
          url: dbUrl,
          schema: 'app',
          synchronize: false,
          migrationsRun: true,
          migrations: [__dirname + '/migrations/*.{ts,js}'],
          entities: [__dirname + '/**/*.entity.{ts,js}'],
          logging: cfg.get('NODE_ENV') === 'development' ? ['query', 'error'] : ['error'],
          ssl: isSupabase ? { rejectUnauthorized: false } : false,
          extra: {
            max: 10,
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 10000,
            ssl: isSupabase ? { rejectUnauthorized: false } : false,
            // Force IPv4 to avoid ENETUNREACH on Railway (Supabase resolves to IPv6)
            family: 4,
          },
        };
      },
    }),

    EventEmitterModule.forRoot(),
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),

    AuthModule,
    TenantsModule,
    UsersModule,
    ClearingModule,
    SettlementModule,
    AccountsModule,
    CardsModule,
    FraudModule,
    AmlModule,
    ComplianceModule,
    SchemeModule,
    ReconciliationModule,
    FinanceModule,
    DataProductsModule,
    DashboardsModule,
    ReportsModule,
    SubscriptionsModule,
    NotificationsModule,
    AuditModule,
    SearchModule,
    HealthModule,
  ],
})
export class AppModule {}
