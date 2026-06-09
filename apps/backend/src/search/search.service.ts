import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class SearchService {
  private readonly opensearchUrl: string;

  constructor(
    private readonly cfg: ConfigService,
    @InjectDataSource() private readonly db: DataSource,
  ) {
    this.opensearchUrl = cfg.get('OPENSEARCH_URL', 'http://localhost:9200');
  }

  async search(tenantId: string, query: string, type?: string) {
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
      const { data } = await axios.post(`${this.opensearchUrl}/_search`, body);
      return data.hits.hits.map((h: any) => ({ ...h._source, _score: h._score, _type: h._index }));
    } catch (_e) {
      // Fall back to Postgres full-text search
      return this.postgresSearch(tenantId, query);
    }
  }

  private async postgresSearch(tenantId: string, query: string) {
    const q = `%${query}%`;
    const [txns, products, dashboards] = await Promise.all([
      this.db.query(`SELECT id, transaction_ref AS ref, type, amount, status, 'transaction' AS entity_type FROM app.transactions WHERE transaction_ref ILIKE $1 LIMIT 5`, [q]),
      this.db.query(`SELECT id, name AS ref, domain AS type, description, 'data_product' AS entity_type FROM app.data_products WHERE name ILIKE $1 LIMIT 5`, [q]),
      this.db.query(`SELECT id, name AS ref, module AS type, description, 'dashboard' AS entity_type FROM app.dashboards WHERE name ILIKE $1 LIMIT 5`, [q]),
    ]);
    return [...txns, ...products, ...dashboards];
  }
}
