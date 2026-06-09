"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const event_emitter_1 = require("@nestjs/event-emitter");
const schedule_1 = require("@nestjs/schedule");
const throttler_1 = require("@nestjs/throttler");
const auth_module_1 = require("./auth/auth.module");
const tenants_module_1 = require("./tenants/tenants.module");
const users_module_1 = require("./users/users.module");
const clearing_module_1 = require("./clearing/clearing.module");
const settlement_module_1 = require("./settlement/settlement.module");
const accounts_module_1 = require("./accounts/accounts.module");
const cards_module_1 = require("./cards/cards.module");
const fraud_module_1 = require("./fraud/fraud.module");
const aml_module_1 = require("./aml/aml.module");
const compliance_module_1 = require("./compliance/compliance.module");
const scheme_module_1 = require("./scheme/scheme.module");
const reconciliation_module_1 = require("./reconciliation/reconciliation.module");
const finance_module_1 = require("./finance/finance.module");
const data_products_module_1 = require("./data-products/data-products.module");
const dashboards_module_1 = require("./dashboards/dashboards.module");
const reports_module_1 = require("./reports/reports.module");
const subscriptions_module_1 = require("./subscriptions/subscriptions.module");
const notifications_module_1 = require("./notifications/notifications.module");
const audit_module_1 = require("./audit/audit.module");
const search_module_1 = require("./search/search.module");
const health_module_1 = require("./health/health.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
            typeorm_1.TypeOrmModule.forRootAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: (cfg) => {
                    const rawUrl = cfg.get('DATABASE_URL') || '';
                    const isSupabase = rawUrl.includes('supabase.co');
                    const dbUrl = rawUrl.replace(/[?&]sslmode=[^&]*/g, '').replace(/\?$/, '');
                    if (isSupabase)
                        process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
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
                            connectionTimeoutMillis: 5000,
                            ssl: isSupabase ? { rejectUnauthorized: false } : false,
                        },
                    };
                },
            }),
            event_emitter_1.EventEmitterModule.forRoot(),
            schedule_1.ScheduleModule.forRoot(),
            throttler_1.ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
            auth_module_1.AuthModule,
            tenants_module_1.TenantsModule,
            users_module_1.UsersModule,
            clearing_module_1.ClearingModule,
            settlement_module_1.SettlementModule,
            accounts_module_1.AccountsModule,
            cards_module_1.CardsModule,
            fraud_module_1.FraudModule,
            aml_module_1.AmlModule,
            compliance_module_1.ComplianceModule,
            scheme_module_1.SchemeModule,
            reconciliation_module_1.ReconciliationModule,
            finance_module_1.FinanceModule,
            data_products_module_1.DataProductsModule,
            dashboards_module_1.DashboardsModule,
            reports_module_1.ReportsModule,
            subscriptions_module_1.SubscriptionsModule,
            notifications_module_1.NotificationsModule,
            audit_module_1.AuditModule,
            search_module_1.SearchModule,
            health_module_1.HealthModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map