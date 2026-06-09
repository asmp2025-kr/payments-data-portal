import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Client as MinioClient } from 'minio';
import { PdfEngine } from './engines/pdf.engine';
import { ExcelEngine } from './engines/excel.engine';
import { CsvEngine } from './engines/csv.engine';
import { REPORT_CATALOG } from './catalog/report-catalog';

@Injectable()
export class ReportsService {
  private minio: MinioClient;

  constructor(
    @InjectDataSource() private readonly db: DataSource,
    private readonly cfg: ConfigService,
    private readonly pdfEngine: PdfEngine,
    private readonly excelEngine: ExcelEngine,
    private readonly csvEngine: CsvEngine,
  ) {
    this.minio = new MinioClient({
      endPoint: cfg.get('MINIO_ENDPOINT', 'localhost'),
      port: parseInt(cfg.get('MINIO_PORT', '9000')),
      useSSL: cfg.get('MINIO_USE_SSL') === 'true',
      accessKey: cfg.get('MINIO_ACCESS_KEY', 'minio_admin'),
      secretKey: cfg.get('MINIO_SECRET_KEY', 'minio_secret'),
    });
  }

  getCatalog(module?: string, search?: string) {
    let catalog = REPORT_CATALOG;
    if (module) catalog = catalog.filter(r => r.module === module);
    if (search) catalog = catalog.filter(r => r.name.toLowerCase().includes(search.toLowerCase()));
    return catalog;
  }

  async getReports(tenantId: string, dto: any) {
    const offset = ((dto.page || 1) - 1) * (dto.limit || 20);
    return this.db.query(`
      SELECT r.*, u.email AS creator_email
      FROM app.reports r
      LEFT JOIN app.users u ON u.id = r.created_by
      WHERE r.tenant_id = $1 OR r.is_template = true
      ORDER BY r.is_template DESC, r.name
      LIMIT $2 OFFSET $3
    `, [tenantId, dto.limit || 20, offset]);
  }

  async getRuns(tenantId: string, reportId?: string) {
    const params: any[] = [tenantId];
    let where = '';
    if (reportId) { params.push(reportId); where = `AND rr.report_id = $${params.length}`; }
    return this.db.query(`
      SELECT rr.*, r.name AS report_name, u.email AS generated_by_email
      FROM app.report_runs rr
      JOIN app.reports r ON r.id = rr.report_id
      LEFT JOIN app.users u ON u.id = rr.generated_by
      WHERE rr.tenant_id = $1 ${where}
      ORDER BY rr.created_at DESC LIMIT 50
    `, params);
  }

  async generate(tenantId: string, userId: string, body: any): Promise<any> {
    const { reportType, format = 'pdf', parameters = {} } = body;

    // Find the report definition (template or user-saved)
    let reportId = body.reportId;
    if (!reportId) {
      // Auto-create from catalog entry
      const catalogEntry = REPORT_CATALOG.find(r => r.type === reportType);
      if (!catalogEntry) throw new NotFoundException(`Report type '${reportType}' not found`);
      const [r] = await this.db.query(`
        INSERT INTO app.reports (tenant_id, name, module, report_type, config, created_by, is_template)
        VALUES ($1,$2,$3,$4,$5,$6,false) RETURNING id
      `, [tenantId, catalogEntry.name, catalogEntry.module, reportType, JSON.stringify(parameters), userId]);
      reportId = r.id;
    }

    // Create a run record
    const [run] = await this.db.query(`
      INSERT INTO app.report_runs (tenant_id, report_id, format, status, parameters, generated_by)
      VALUES ($1,$2,$3,'generating',$4,$5) RETURNING id
    `, [tenantId, reportId, format, JSON.stringify(parameters), userId]);

    // Generate asynchronously
    this.doGenerate(tenantId, run.id, reportId, reportType, format, parameters, userId).catch(err => {
      this.db.query(`UPDATE app.report_runs SET status='failed', error_message=$1 WHERE id=$2`,
        [err.message, run.id]);
    });

    return { runId: run.id, status: 'generating', message: 'Report generation started' };
  }

  private async doGenerate(
    tenantId: string,
    runId: string,
    reportId: string,
    reportType: string,
    format: string,
    parameters: any,
    userId: string,
  ) {
    const frontendUrl = this.cfg.get('FRONTEND_URL', 'http://frontend:4000');
    let buffer: Buffer;
    let contentType: string;
    let ext: string;

    if (format === 'pdf') {
      const url = `${frontendUrl}/report-render/${runId}?type=${reportType}&tenantId=${tenantId}&` +
        new URLSearchParams(parameters).toString();
      buffer = await this.pdfEngine.generate(url);
      contentType = 'application/pdf';
      ext = 'pdf';
    } else if (format === 'excel') {
      const data = await this.fetchReportData(tenantId, reportType, parameters);
      buffer = await this.excelEngine.generate(reportType, data.sheets);
      contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      ext = 'xlsx';
    } else {
      const data = await this.fetchReportData(tenantId, reportType, parameters);
      const csv = this.csvEngine.generate(data.columns, data.rows);
      buffer = Buffer.from(csv, 'utf-8');
      contentType = 'text/csv';
      ext = 'csv';
    }

    const bucket = this.cfg.get('MINIO_REPORTS_BUCKET', 'reports');
    const objectName = `${tenantId}/${runId}.${ext}`;

    await this.minio.putObject(bucket, objectName, buffer, buffer.length, { 'Content-Type': contentType });

    const expiry = 3600; // 1 hour
    const downloadUrl = await this.minio.presignedGetObject(bucket, objectName, expiry);

    await this.db.query(`
      UPDATE app.report_runs SET
        status = 'completed', file_path = $1, file_size = $2,
        generated_at = NOW(), expires_at = NOW() + INTERVAL '1 hour'
      WHERE id = $3
    `, [objectName, buffer.length, runId]);

    return { runId, downloadUrl };
  }

  private async fetchReportData(tenantId: string, reportType: string, params: any) {
    // Generic data fetcher — returns shaped data for Excel/CSV
    // Specific report builders can override this
    const dateFrom = params.dateFrom || new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0];
    const dateTo = params.dateTo || new Date().toISOString().split('T')[0];

    const rows = await this.db.query(`
      SELECT transaction_ref, type, amount, currency, status, channel, created_at
      FROM app.transactions
      WHERE created_at::date BETWEEN $1 AND $2
      LIMIT 10000
    `, [dateFrom, dateTo]);

    return {
      columns: ['transaction_ref','type','amount','currency','status','channel','created_at'],
      rows,
      sheets: [{
        name: 'Transactions',
        columns: [
          { header: 'Reference', key: 'transaction_ref', width: 20 },
          { header: 'Type', key: 'type', width: 12 },
          { header: 'Amount', key: 'amount', width: 15 },
          { header: 'Currency', key: 'currency', width: 10 },
          { header: 'Status', key: 'status', width: 12 },
          { header: 'Channel', key: 'channel', width: 14 },
          { header: 'Date', key: 'created_at', width: 22 },
        ],
        rows,
      }],
    };
  }

  async getDownloadUrl(runId: string): Promise<string> {
    const [run] = await this.db.query(`SELECT * FROM app.report_runs WHERE id = $1`, [runId]);
    if (!run || run.status !== 'completed') throw new NotFoundException('Report not ready');
    const bucket = this.cfg.get('MINIO_REPORTS_BUCKET', 'reports');
    return this.minio.presignedGetObject(bucket, run.file_path, 3600);
  }
}
