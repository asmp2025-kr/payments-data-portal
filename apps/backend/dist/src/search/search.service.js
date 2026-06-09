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
exports.SearchService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const axios_1 = require("axios");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
let SearchService = class SearchService {
    constructor(cfg, db) {
        this.cfg = cfg;
        this.db = db;
        this.opensearchUrl = cfg.get('OPENSEARCH_URL', 'http://localhost:9200');
    }
    async search(tenantId, query, type) {
        const body = {
            query: {
                bool: {
                    must: [
                        { multi_match: { query, fields: ['name^3', 'description', 'ref', 'type'], fuzziness: 'AUTO' } },
                        { term: { tenant_id: tenantId } },
                    ],
                    filter: type ? [{ term: { _index: `payments-${type}` } }] : [],
                },
            },
            size: 20,
        };
        try {
            const { data } = await axios_1.default.post(`${this.opensearchUrl}/_search`, body);
            return data.hits.hits.map((h) => ({ ...h._source, _score: h._score, _type: h._index }));
        }
        catch (_e) {
            return this.postgresSearch(tenantId, query);
        }
    }
    async postgresSearch(tenantId, query) {
        const q = `%${query}%`;
        const [txns, products, dashboards] = await Promise.all([
            this.db.query(`SELECT id, transaction_ref AS ref, type, amount, status, 'transaction' AS entity_type FROM app.transactions WHERE transaction_ref ILIKE $1 LIMIT 5`, [q]),
            this.db.query(`SELECT id, name AS ref, domain AS type, description, 'data_product' AS entity_type FROM app.data_products WHERE name ILIKE $1 LIMIT 5`, [q]),
            this.db.query(`SELECT id, name AS ref, module AS type, description, 'dashboard' AS entity_type FROM app.dashboards WHERE name ILIKE $1 LIMIT 5`, [q]),
        ]);
        return [...txns, ...products, ...dashboards];
    }
};
exports.SearchService = SearchService;
exports.SearchService = SearchService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, typeorm_1.InjectDataSource)()),
    __metadata("design:paramtypes", [config_1.ConfigService,
        typeorm_2.DataSource])
], SearchService);
//# sourceMappingURL=search.service.js.map