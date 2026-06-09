import { Test } from '@nestjs/testing';
import { ExecutionContext, CallHandler } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { TenantContextInterceptor } from '../common/interceptors/tenant-context.interceptor';
import { of } from 'rxjs';

describe('TenantContextInterceptor', () => {
  let interceptor: TenantContextInterceptor;
  const mockQuery = jest.fn().mockResolvedValue([]);
  const mockDataSource = { query: mockQuery };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        TenantContextInterceptor,
        { provide: DataSource, useValue: mockDataSource },
      ],
    }).compile();
    interceptor = module.get<TenantContextInterceptor>(TenantContextInterceptor);
    mockQuery.mockClear();
  });

  it('sets tenant_id in RLS context for authenticated requests', async () => {
    const mockRequest = {
      user: { tenantId: 'test-tenant-id', role: 'bank_admin' },
    };
    const mockContext = {
      switchToHttp: () => ({ getRequest: () => mockRequest }),
    } as unknown as ExecutionContext;
    const mockNext: CallHandler = { handle: () => of('response') };

    await interceptor.intercept(mockContext, mockNext).toPromise();

    expect(mockQuery).toHaveBeenCalledWith(
      expect.stringContaining('set_config'),
      expect.arrayContaining(['test-tenant-id'])
    );
  });

  it('sets bypass_rls for super_admin', async () => {
    const mockRequest = {
      user: { tenantId: 'system', role: 'super_admin' },
    };
    const mockContext = {
      switchToHttp: () => ({ getRequest: () => mockRequest }),
    } as unknown as ExecutionContext;
    const mockNext: CallHandler = { handle: () => of('response') };

    await interceptor.intercept(mockContext, mockNext).toPromise();

    expect(mockQuery).toHaveBeenCalledWith(
      expect.stringContaining('bypass_rls'),
      expect.any(Array)
    );
  });
});
