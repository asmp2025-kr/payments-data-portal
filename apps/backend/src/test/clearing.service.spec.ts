import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { ClearingService } from '../clearing/clearing.service';

const mockQuery = jest.fn();
const mockDataSource = { query: mockQuery };

describe('ClearingService', () => {
  let service: ClearingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClearingService,
        { provide: DataSource, useValue: mockDataSource },
      ],
    }).compile();
    service = module.get<ClearingService>(ClearingService);
    mockQuery.mockClear();
  });

  describe('getSummary', () => {
    it('returns clearing summary with correct structure', async () => {
      const mockResult = [{
        total_transactions: '10000',
        cleared_transactions: '9700',
        failed_transactions: '200',
        pending_transactions: '100',
        total_amount: '5000000.00',
        success_rate: '97.00',
        avg_processing_time_ms: '125',
        total_interchange_fees: '50000.00',
      }];
      mockQuery.mockResolvedValue(mockResult);

      const result = await service.getSummary('tenant-id', {
        dateFrom: '2024-01-01',
        dateTo: '2024-01-31',
      });

      expect(result).toEqual(mockResult[0]);
      expect(mockQuery).toHaveBeenCalledTimes(1);
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('SELECT'),
        expect.arrayContaining(['tenant-id'])
      );
    });

    it('passes date range parameters correctly', async () => {
      mockQuery.mockResolvedValue([{}]);
      await service.getSummary('tenant-id', { dateFrom: '2024-01-01', dateTo: '2024-01-31' });

      const [, params] = mockQuery.mock.calls[0];
      expect(params).toContain('2024-01-01');
      expect(params).toContain('2024-01-31');
    });

    it('returns null when no results', async () => {
      mockQuery.mockResolvedValue([]);
      const result = await service.getSummary('tenant-id', { dateFrom: '2024-01-01', dateTo: '2024-01-31' });
      expect(result).toBeNull();
    });
  });

  describe('getDailyTrend', () => {
    it('returns time-series array', async () => {
      const mockTrend = [
        { date: '2024-01-01', volume: '1000', cleared: '970', failed: '20' },
        { date: '2024-01-02', volume: '1200', cleared: '1160', failed: '30' },
      ];
      mockQuery.mockResolvedValue(mockTrend);

      const result = await service.getDailyTrend('tenant-id', { dateFrom: '2024-01-01', dateTo: '2024-01-02' });
      expect(result).toHaveLength(2);
      expect(result[0]).toHaveProperty('date');
      expect(result[0]).toHaveProperty('volume');
    });
  });

  describe('getExceptions', () => {
    it('returns exception records', async () => {
      mockQuery.mockResolvedValue([
        { id: '1', transaction_ref: 'TXN001', status: 'failed', exception_code: 'E001' },
      ]);
      const result = await service.getExceptions('tenant-id', { dateFrom: '2024-01-01', dateTo: '2024-01-31', limit: 20 });
      expect(Array.isArray(result)).toBe(true);
    });
  });
});
