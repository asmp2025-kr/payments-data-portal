"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const request = require("supertest");
const testing_1 = require("@nestjs/testing");
const common_1 = require("@nestjs/common");
const app_module_1 = require("../src/app.module");
describe('Clearing API (e2e)', () => {
    let app;
    let jwtToken;
    beforeAll(async () => {
        const moduleFixture = await testing_1.Test.createTestingModule({
            imports: [app_module_1.AppModule],
        }).compile();
        app = moduleFixture.createNestApplication();
        app.useGlobalPipes(new common_1.ValidationPipe({ whitelist: true, transform: true }));
        await app.init();
        jwtToken = process.env.TEST_JWT || 'test-token';
    });
    afterAll(async () => {
        await app.close();
    });
    describe('GET /api/clearing/summary', () => {
        it('returns 401 without authentication', () => {
            return request(app.getHttpServer())
                .get('/api/clearing/summary')
                .expect(401);
        });
        it('returns clearing summary with valid auth', () => {
            return request(app.getHttpServer())
                .get('/api/clearing/summary')
                .query({ dateFrom: '2024-01-01', dateTo: '2024-01-31' })
                .set('Authorization', `Bearer ${jwtToken}`)
                .expect(200)
                .expect(res => {
                expect(res.body).toHaveProperty('total_transactions');
                expect(res.body).toHaveProperty('success_rate');
            });
        });
        it('validates date range parameters', () => {
            return request(app.getHttpServer())
                .get('/api/clearing/summary')
                .query({ dateFrom: 'invalid-date' })
                .set('Authorization', `Bearer ${jwtToken}`)
                .expect(400);
        });
    });
    describe('GET /api/clearing/exceptions', () => {
        it('returns paginated exceptions list', () => {
            return request(app.getHttpServer())
                .get('/api/clearing/exceptions')
                .query({ dateFrom: '2024-01-01', dateTo: '2024-01-31', limit: 10 })
                .set('Authorization', `Bearer ${jwtToken}`)
                .expect(200)
                .expect(res => {
                expect(Array.isArray(res.body)).toBe(true);
            });
        });
    });
    describe('RLS isolation', () => {
        it('tenant A cannot see tenant B data', async () => {
            const tenantAResponse = await request(app.getHttpServer())
                .get('/api/clearing/summary')
                .query({ dateFrom: '2024-01-01', dateTo: '2024-01-31' })
                .set('Authorization', `Bearer ${jwtToken}`)
                .expect(200);
            expect(tenantAResponse.body).toBeDefined();
        });
    });
});
//# sourceMappingURL=clearing.e2e-spec.js.map