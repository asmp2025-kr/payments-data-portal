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
exports.ComplianceService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
let ComplianceService = class ComplianceService {
    constructor(db) {
        this.db = db;
    }
    async getSummary(tenantId) {
        const [s] = await this.db.query(`
      SELECT
        COUNT(*)::bigint                                              AS total_findings,
        COUNT(*) FILTER(WHERE status='open')::bigint                 AS open_findings,
        COUNT(*) FILTER(WHERE status='resolved')::bigint             AS resolved_findings,
        COUNT(*) FILTER(WHERE severity='critical')::bigint           AS critical,
        COUNT(*) FILTER(WHERE severity='high')::bigint               AS high,
        COUNT(*) FILTER(WHERE due_date < NOW() AND status!='resolved')::bigint AS overdue,
        ROUND(COUNT(*) FILTER(WHERE status='resolved')::numeric/NULLIF(COUNT(*),0)*100,2) AS resolution_rate
      FROM app.compliance_findings
    `);
        return s;
    }
    async getFindings(tenantId, dto) {
        const offset = ((dto.page || 1) - 1) * (dto.limit || 20);
        const params = [dto.limit || 20, offset];
        const conds = [];
        if (dto.status) {
            params.push(dto.status);
            conds.push(`status = $${params.length}`);
        }
        if (dto.severity) {
            params.push(dto.severity);
            conds.push(`severity = $${params.length}`);
        }
        const where = conds.length ? `WHERE ${conds.join(' AND ')}` : '';
        return this.db.query(`SELECT * FROM app.compliance_findings ${where} ORDER BY created_at DESC LIMIT $1 OFFSET $2`, params);
    }
    async getBySeverity(tenantId) {
        return this.db.query(`
      SELECT severity, COUNT(*)::bigint AS count, COUNT(*) FILTER(WHERE status='open')::bigint AS open
      FROM app.compliance_findings GROUP BY severity ORDER BY count DESC
    `);
    }
    async getScore(tenantId) {
        const [s] = await this.db.query(`
      SELECT
        100 - ROUND(
          (COUNT(*) FILTER(WHERE status!='resolved' AND severity='critical')*25 +
           COUNT(*) FILTER(WHERE status!='resolved' AND severity='high')*15 +
           COUNT(*) FILTER(WHERE status!='resolved' AND severity='medium')*5 +
           COUNT(*) FILTER(WHERE status!='resolved' AND severity='low')*1)
          ::numeric / NULLIF(COUNT(*),0) ,0) AS score
      FROM app.compliance_findings
    `);
        return { score: Math.max(0, Number(s.score || 100)) };
    }
};
exports.ComplianceService = ComplianceService;
exports.ComplianceService = ComplianceService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectDataSource)()),
    __metadata("design:paramtypes", [typeorm_2.DataSource])
], ComplianceService);
//# sourceMappingURL=compliance.service.js.map