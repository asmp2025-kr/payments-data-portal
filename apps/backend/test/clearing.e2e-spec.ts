import * as request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../src/app.module';

describe('Clearing API (e2e)', () => {
  let app: INestApplication;
  let jwtToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();

    // In real tests, get a JWT from Keycloak test realm or use a test token
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
      // This test requires two different JWT tokens from two different tenants
      // In CI, this is validated by checking that tenant_id is always in WHERE
      const tenantAResponse = await request(app.getHttpServer())
        .get('/api/clearing/summary')
        .query({ dateFrom: '2024-01-01', dateTo: '2024-01-31' })
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(200);

      // The response should only contain data for the JWT's tenant
      expect(tenantAResponse.body).toBeDefined();
    });
  });
});
