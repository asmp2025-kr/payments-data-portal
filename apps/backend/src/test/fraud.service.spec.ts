import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { FraudService } from '../fraud/fraud.service';

const mockQuery = jest.fn();
const mockDataSource = { query: mockQuery };

describe('FraudService', () => {
  let service: FraudService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FraudService,
        { provide: DataSource, useValue: mockDataSource },
      ],
    }).compile();
    service = module.get<FraudService>(FraudService);
    mockQuery.mockClear();
  });

  describe('getSummary', () => {
    it('returns fraud summary metrics', async () => {
      mockQuery.mockResolvedValue([{
        total_cases: '150',
        open_cases: '45',
        total_fraud_amount: '75000.00',
        recovery_rate: '68.50',
        fraud_rate: '0.30',
      }]);

      const result = await service.getSummary('tenant-id', { dateFrom: '2024-01-01', dateTo: '2024-01-31' });
      expect(result).toBeDefined();
      expect(result.total_cases).toBe('150');
    });
  });

  describe('getMerchantRisk', () => {
    it('returns merchant risk rankings', async () => {
      mockQuery.mockResolvedValue([
        { merchant_id: 'M001', merchant_name: 'Test Merchant', fraud_count: 10, risk_score: 85 },
      ]);
      const result = await service.getMerchantRisk('tenant-id', { dateFrom: '2024-01-01', dateTo: '2024-01-31' });
      expect(Array.isArray(result)).toBe(true);
      expect(result[0].risk_score).toBe(85);
    });
  });
});
