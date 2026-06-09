"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const config_1 = require("@nestjs/config");
const pdf_engine_1 = require("./engines/pdf.engine");
const excel_engine_1 = require("./engines/excel.engine");
const csv_engine_1 = require("./engines/csv.engine");
const report_catalog_1 = require("./catalog/report-catalog");
let ReportsService = class ReportsService {
    constructor(db, cfg, pdfEngine, excelEngine, csvEngine) {
        this.db = db;
        this.cfg = cfg;
        this.pdfEngine = pdfEngine;
        this.excelEngine = excelEngine;
        this.csvEngine = csvEngine;
        this.minio = null;
    }
    getCatalog(module, search) {
        let catalog = report_catalog_1.REPORT_CATALOG;
        if (module)
            catalog = catalog.filter(r => r.module === module);
        if (search)
            catalog = catalog.filter(r => r.name.toLowerCase().includes(search.toLowerCase()));
        return catalog;
    }
    async getReports(tenantId, dto) {
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
    async getRuns(tenantId, reportId) {
        const params = [tenantId];
        let where = '';
        if (reportId) {
            params.push(reportId);
            where = `AND rr.report_id = $${params.length}`;
        }
        return this.db.query(`
      SELECT rr.*, r.name AS report_name, u.email AS generated_by_email
      FROM app.report_runs rr
      JOIN app.reports r ON r.id = rr.report_id
      LEFT JOIN app.users u ON u.id = rr.generated_by
      WHERE rr.tenant_id = $1 ${where}
      ORDER BY rr.created_at DESC LIMIT 50
    `, params);
    }
    async generate(tenantId, userId, body) {
        const { reportType, format = 'pdf', parameters = {} } = body;
        let reportId = body.reportId;
        if (!reportId) {
            const catalogEntry = report_catalog_1.REPORT_CATALOG.find(r => r.type === reportType);
            if (!catalogEntry)
                throw new common_1.NotFoundException(`Report type '${reportType}' not found`);
            const [r] = await this.db.query(`
        INSERT INTO app.reports (tenant_id, name, module, report_type, config, created_by, is_template)
        VALUES ($1,$2,$3,$4,$5,$6,false) RETURNING id
      `, [tenantId, catalogEntry.name, catalogEntry.module, reportType, JSON.stringify(parameters), userId]);
            reportId = r.id;
        }
        const [run] = await this.db.query(`
      INSERT INTO app.report_runs (tenant_id, report_id, format, status, parameters, generated_by)
      VALUES ($1,$2,$3,'generating',$4,$5) RETURNING id
    `, [tenantId, reportId, format, JSON.stringify(parameters), userId]);
        this.doGenerate(tenantId, run.id, reportId, reportType, format, parameters, userId).catch(err => {
            this.db.query(`UPDATE app.report_runs SET status='failed', error_message=$1 WHERE id=$2`, [err.message, run.id]);
        });
        return { runId: run.id, status: 'generating', message: 'Report generation started' };
    }
    async doGenerate(tenantId, runId, reportId, reportType, format, parameters, userId) {
        const frontendUrl = this.cfg.get('FRONTEND_URL', 'http://frontend:4000');
        let buffer;
        let contentType;
        let ext;
        if (format === 'pdf') {
            const url = `${frontendUrl}/report-render/${runId}?type=${reportType}&tenantId=${tenantId}&` +
                new URLSearchParams(parameters).toString();
            buffer = await this.pdfEngine.generate(url);
            contentType = 'application/pdf';
            ext = 'pdf';
        }
        else if (format === 'excel') {
            const data = await this.fetchReportData(tenantId, reportType, parameters);
            buffer = await this.excelEngine.generate(reportType, data.sheets);
            contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
            ext = 'xlsx';
        }
        else {
            const data = await this.fetchReportData(tenantId, reportType, parameters);
            const csv = this.csvEngine.generate(data.columns, data.rows);
            buffer = Buffer.from(csv, 'utf-8');
            contentType = 'text/csv';
            ext = 'csv';
        }
        const bucket = this.cfg.get('MINIO_REPORTS_BUCKET', 'reports');
        const objectName = `${tenantId}/${runId}.${ext}`;
        await this.minio.putObject(bucket, objectName, buffer, buffer.length, { 'Content-Type': contentType });
        const expiry = 3600;
        const downloadUrl = await this.minio.presignedGetObject(bucket, objectName, expiry);
        await this.db.query(`
      UPDATE app.report_runs SET
        status = 'completed', file_path = $1, file_size = $2,
        generated_at = NOW(), expires_at = NOW() + INTERVAL '1 hour'
      WHERE id = $3
    `, [objectName, buffer.length, runId]);
        return { runId, downloadUrl };
    }
    async fetchReportData(tenantId, reportType, params) {
        const dateFrom = params.dateFrom || new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0];
        const dateTo = params.dateTo || new Date().toISOString().split('T')[0];
        const rows = await this.db.query(`
      SELECT transaction_ref, type, amount, currency, status, channel, created_at
      FROM app.transactions
      WHERE created_at::date BETWEEN $1 AND $2
      LIMIT 10000
    `, [dateFrom, dateTo]);
        return {
            columns: ['transaction_ref', 'type', 'amount', 'currency', 'status', 'channel', 'created_at'],
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
    async getDownloadUrl(runId) {
        const [run] = await this.db.query(`SELECT * FROM app.report_runs WHERE id = $1`, [runId]);
        if (!run || run.status !== 'completed')
            throw new common_1.NotFoundException('Report not ready');
        const bucket = this.cfg.get('MINIO_REPORTS_BUCKET', 'reports');
        return this.minio.presignedGetObject(bucket, run.file_path, 3600);
    }
};
exports.ReportsService = ReportsService;
exports.ReportsService = ReportsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectDataSource)()),
    __metadata("design:paramtypes", [typeorm_2.DataSource,
        config_1.ConfigService,
        pdf_engine_1.PdfEngine,
        excel_engine_1.ExcelEngine,
        csv_engine_1.CsvEngine])
], ReportsService);
//# sourceMappingURL=reports.service.js.map