import assert from 'node:assert/strict';
import test from 'node:test';
import { DatabaseConnection } from '../backend/database/connection';
import { isSupportedSortColumn, QueryBuilder } from '../backend/database/queryBuilder';

const builder = new QueryBuilder({} as unknown as DatabaseConnection);

test('builds bounded price ranges consistently for list and count queries', () => {
  const filters = { priceRange: { min: 100, max: 500 }, ramGb: 8 };
  const list = builder.buildFilterQuery(filters, { sortBy: 'p.model', sortOrder: 'desc' }, { page: 2, limit: 20 });
  const count = builder.buildCountQuery(filters);

  assert.match(list.query, /BETWEEN \? AND \?/);
  assert.match(list.query, /ORDER BY b\.brand_name|ORDER BY p\.model DESC/);
  assert.match(count.query, /COUNT\(DISTINCT p\.phone_id\)/);
  assert.deepEqual(list.params, [8, 100, 500, 100, 500]);
  assert.deepEqual(count.params, [8, 100, 500, 100, 500]);
});

test('uses deterministic phone ordering and an allowlisted sort field', () => {
  const query = builder.buildFilterQuery({}, { sortBy: 'p.phone_id', sortOrder: 'asc' }, { page: 1, limit: 20 });

  assert.match(query.query, /ORDER BY p\.phone_id ASC, p\.phone_id ASC/);
  assert.equal(isSupportedSortColumn('p.phone_id'), true);
  assert.equal(isSupportedSortColumn('p.phone_id; DROP TABLE phones'), false);
});

test('aggregates pricing before joining browse results', () => {
  const query = builder.buildFilterQuery({}, {}, {});

  assert.match(query.query, /GROUP BY phone_id/);
  assert.match(query.query, /variant_description = 'base'/);
});
