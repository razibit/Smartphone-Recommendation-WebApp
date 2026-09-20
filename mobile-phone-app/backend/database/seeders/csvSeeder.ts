import fs from 'node:fs';
import csv from 'csv-parser';
import mysql, { PoolConnection, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { AppConfig, loadConfig } from '../../config';
import { DatabaseConnection, QueryValue } from '../connection';
import { log } from '../../logger';

type CSVRow = Record<string, string>;

interface SeedSummary {
  read: number;
  processed: number;
  failed: number;
}

function clean(value: string | undefined): string | null {
  const result = value?.trim();
  return result ? result : null;
}

function numberValue(value: string | undefined, integer = false): number | null {
  const normalized = clean(value)?.replace(/,/g, '');
  if (!normalized) return null;
  const match = normalized.match(/-?\d+(?:\.\d+)?/);
  if (!match) return null;
  const parsed = Number(match[0]);
  if (!Number.isFinite(parsed)) return null;
  return integer ? Math.trunc(parsed) : parsed;
}

function booleanValue(value: string | undefined): boolean {
  return ['yes', 'true', '1', 'available'].includes((value || '').trim().toLowerCase());
}

function dateValue(value: string | undefined): string | null {
  const normalized = clean(value);
  if (!normalized) return null;
  const parsed = new Date(normalized);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString().slice(0, 10);
}

function timestampValue(value: string | undefined): string | null {
  const normalized = clean(value);
  if (!normalized) return null;
  const parsed = new Date(normalized);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString().slice(0, 19).replace('T', ' ');
}

function statusValue(value: string | undefined): 'Available' | 'Upcoming' | 'Rumored' | 'Discontinued' {
  const normalized = (value || '').toLowerCase();
  if (normalized.includes('upcoming') || normalized.includes('exp.')) return 'Upcoming';
  if (normalized.includes('rumored')) return 'Rumored';
  if (normalized.includes('discontinued')) return 'Discontinued';
  return 'Available';
}

function keyFor(value: string | undefined): string {
  return (value || '').trim().toLowerCase();
}

async function rows<T extends RowDataPacket>(connection: PoolConnection, sql: string, params: QueryValue[] = []): Promise<T[]> {
  const [result] = await connection.execute<T[]>(sql, params);
  return result;
}

async function insertId(connection: PoolConnection, sql: string, params: QueryValue[]): Promise<number> {
  const [result] = await connection.execute<ResultSetHeader>(sql, params);
  return result.insertId;
}

export class CSVSeeder {
  private readonly db: DatabaseConnection;
  private readonly brandCache = new Map<string, number>();
  private readonly chipsetCache = new Map<string, number>();
  private readonly osCache = new Map<string, number>();
  private readonly displayCache = new Map<string, number>();
  private readonly storageCache = new Map<string, number>();
  private readonly ramCache = new Map<string, number>();

  constructor(private readonly config: AppConfig = loadConfig()) {
    this.db = new DatabaseConnection(config.db);
  }

  private async readRows(filePath: string, limit?: number): Promise<CSVRow[]> {
    if (!fs.existsSync(filePath)) throw new Error('Seed file does not exist: ' + filePath);

    return new Promise((resolve, reject) => {
      const values: CSVRow[] = [];
      const stream = fs.createReadStream(filePath).pipe(csv());
      let settled = false;
      const finish = (callback: () => void) => {
        if (settled) return;
        settled = true;
        callback();
      };
      stream.on('data', (row: CSVRow) => {
        if (limit === undefined || values.length < limit) values.push(row);
        if (limit !== undefined && values.length >= limit) stream.destroy();
      });
      stream.on('end', () => finish(() => resolve(values)));
      stream.on('close', () => {
        if (limit !== undefined && values.length >= limit) finish(() => resolve(values));
      });
      stream.on('error', (error) => finish(() => reject(error)));
    });
  }

  async seedFromCSV(csvFilePath: string, limit?: number): Promise<SeedSummary> {
    if (limit !== undefined && (!Number.isInteger(limit) || limit < 1)) {
      throw new Error('Seed limit must be a positive integer');
    }
    await this.db.connect();
    const input = await this.readRows(csvFilePath, limit);
    const uniqueRows = new Map<string, CSVRow>();

    for (const row of input) {
      const brand = clean(row.brand);
      const model = clean(row.model);
      if (!brand || !model) continue;
      uniqueRows.set(keyFor(brand) + '|' + keyFor(model), row);
    }

    const summary: SeedSummary = { read: input.length, processed: 0, failed: 0 };
    const failures: string[] = [];

    for (const row of uniqueRows.values()) {
      try {
        await this.db.transaction((connection) => this.processRow(connection, row));
        summary.processed += 1;
      } catch (error) {
        summary.failed += 1;
        this.clearCaches();
        failures.push(
          (row.brand || 'Unknown') + ' ' + (row.model || 'Unknown') + ': ' +
          (error instanceof Error ? error.message : String(error)),
        );
      }
    }

    if (failures.length > 0) {
      throw new Error('Seed completed with ' + failures.length + ' failed rows. First failure: ' + failures[0]);
    }

    log('info', 'CSV seed completed', { ...summary });
    return summary;
  }

  private clearCaches(): void {
    this.brandCache.clear();
    this.chipsetCache.clear();
    this.osCache.clear();
    this.displayCache.clear();
    this.storageCache.clear();
    this.ramCache.clear();
  }

  private async lookup(
    connection: PoolConnection,
    cache: Map<string, number>,
    cacheKey: string,
    selectSql: string,
    insertSql: string,
    values: QueryValue[],
    selectValues: QueryValue[] = values.slice(0, 1),
  ): Promise<number> {
    const normalized = keyFor(cacheKey);
    const cached = cache.get(normalized);
    if (cached) return cached;

    const existing = await rows<RowDataPacket>(connection, selectSql, selectValues);
    const id = existing.length > 0
      ? Number(existing[0][Object.keys(existing[0])[0]])
      : await insertId(connection, insertSql, values);
    cache.set(normalized, id);
    return id;
  }

  private async processRow(connection: PoolConnection, row: CSVRow): Promise<void> {
    const brandName = clean(row.brand);
    const model = clean(row.model);
    if (!brandName || !model) throw new Error('brand and model are required');

    const brandId = await this.lookup(
      connection,
      this.brandCache,
      brandName,
      'SELECT brand_id FROM brands WHERE brand_name = ?',
      'INSERT INTO brands (brand_name) VALUES (?)',
      [brandName],
    );
    const chipsetId = clean(row.chipset)
      ? await this.lookup(connection, this.chipsetCache, row.chipset, 'SELECT chipset_id FROM chipsets WHERE chipset_name = ?', 'INSERT INTO chipsets (chipset_name, architecture, fabrication) VALUES (?, ?, ?)', [clean(row.chipset), clean(row.architecture), clean(row.fabrication)])
      : null;
    const osId = clean(row.operating_system)
      ? await this.lookup(connection, this.osCache, keyFor(row.operating_system) + '|' + keyFor(row.os_version), 'SELECT os_id FROM operating_systems WHERE os_name = ? AND ((os_version = ?) OR (os_version IS NULL AND ? IS NULL))', 'INSERT INTO operating_systems (os_name, os_version, user_interface) VALUES (?, ?, ?)', [clean(row.operating_system), clean(row.os_version), clean(row.user_interface)], [clean(row.operating_system), clean(row.os_version), clean(row.os_version)])
      : null;
    const displayId = clean(row.display_type)
      ? await this.lookup(connection, this.displayCache, row.display_type, 'SELECT display_type_id FROM display_types WHERE display_type_name = ?', 'INSERT INTO display_types (display_type_name) VALUES (?)', [clean(row.display_type)])
      : null;
    const storageId = clean(row.storage_type)
      ? await this.lookup(connection, this.storageCache, row.storage_type, 'SELECT storage_type_id FROM storage_types WHERE storage_type_name = ?', 'INSERT INTO storage_types (storage_type_name) VALUES (?)', [clean(row.storage_type)])
      : null;
    const ramTypeId = clean(row.ram_type)
      ? await this.lookup(connection, this.ramCache, row.ram_type, 'SELECT ram_type_id FROM ram_types WHERE ram_type_name = ?', 'INSERT INTO ram_types (ram_type_name) VALUES (?)', [clean(row.ram_type)])
      : null;

    const phoneId = await this.upsertPhone(connection, row, brandId, model);
    await this.upsertPhoneSpecifications(connection, row, phoneId, chipsetId, osId, displayId, storageId, ramTypeId);
    await this.upsertDisplaySpecifications(connection, row, phoneId);
    await this.upsertPhysicalSpecifications(connection, row, phoneId);
    await this.upsertCameraSpecifications(connection, row, phoneId);
    await this.upsertAudio(connection, row, phoneId);
    await this.upsertAdditional(connection, row, phoneId);
    await this.replaceColors(connection, row.colors, phoneId);
    await this.replacePricing(connection, row, phoneId);
  }

  private async upsertPhone(connection: PoolConnection, row: CSVRow, brandId: number, model: string): Promise<number> {
    const existing = await rows<RowDataPacket>(connection, 'SELECT phone_id FROM phones WHERE brand_id = ? AND model = ?', [brandId, model]);
    if (existing.length > 0) {
      const id = Number(existing[0].phone_id);
      await connection.execute(
        'UPDATE phones SET device_type = ?, release_date = ?, status = ?, detail_url = ?, image_url = ?, scraped_at = ? WHERE phone_id = ?',
        [clean(row.device_type) || 'Smartphone', dateValue(row.release_date), statusValue(row.status), clean(row.detail_url), clean(row.image_url), timestampValue(row.scraped_at), id],
      );
      return id;
    }

    return insertId(
      connection,
      'INSERT INTO phones (brand_id, model, device_type, release_date, status, detail_url, image_url, scraped_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [brandId, model, clean(row.device_type) || 'Smartphone', dateValue(row.release_date), statusValue(row.status), clean(row.detail_url), clean(row.image_url), timestampValue(row.scraped_at)],
    );
  }

  private async upsertPhoneSpecifications(connection: PoolConnection, row: CSVRow, phoneId: number, chipsetId: number | null, osId: number | null, displayId: number | null, storageId: number | null, ramTypeId: number | null): Promise<void> {
    await connection.execute(
      `
        INSERT INTO phone_specifications (
          phone_id, chipset_id, os_id, display_type_id, storage_type_id, ram_type_id,
          cpu, cpu_cores, gpu, ram_gb, internal_storage_gb, expandable_memory,
          battery_capacity, quick_charging, bluetooth_version, network, wlan, usb, usb_otg, usb_type_c
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          chipset_id = VALUES(chipset_id), os_id = VALUES(os_id), display_type_id = VALUES(display_type_id),
          storage_type_id = VALUES(storage_type_id), ram_type_id = VALUES(ram_type_id), cpu = VALUES(cpu),
          cpu_cores = VALUES(cpu_cores), gpu = VALUES(gpu), ram_gb = VALUES(ram_gb),
          internal_storage_gb = VALUES(internal_storage_gb), expandable_memory = VALUES(expandable_memory),
          battery_capacity = VALUES(battery_capacity), quick_charging = VALUES(quick_charging),
          bluetooth_version = VALUES(bluetooth_version), network = VALUES(network),
          wlan = VALUES(wlan), usb = VALUES(usb), usb_otg = VALUES(usb_otg), usb_type_c = VALUES(usb_type_c)
      `,
      [phoneId, chipsetId, osId, displayId, storageId, ramTypeId, clean(row.cpu), clean(row.cpu_cores), clean(row.gpu), numberValue(row.ram, true), numberValue(row.internal_storage, true), booleanValue(row.expandable_memory), clean(row.battery_capacity), clean(row.quick_charging), clean(row.bluetooth), clean(row.network), clean(row.wlan), clean(row.usb), booleanValue(row.usb_otg), booleanValue(row.usb_type_c)],
    );
  }

  private async upsertDisplaySpecifications(connection: PoolConnection, row: CSVRow, phoneId: number): Promise<void> {
    await connection.execute(
      `
        INSERT INTO display_specifications (
          phone_id, screen_size, resolution, pixel_density, refresh_rate, brightness,
          aspect_ratio, screen_protection, screen_to_body_ratio, touch_screen, notch, edge
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          screen_size = VALUES(screen_size), resolution = VALUES(resolution), pixel_density = VALUES(pixel_density),
          refresh_rate = VALUES(refresh_rate), brightness = VALUES(brightness), aspect_ratio = VALUES(aspect_ratio),
          screen_protection = VALUES(screen_protection), screen_to_body_ratio = VALUES(screen_to_body_ratio),
          touch_screen = VALUES(touch_screen), notch = VALUES(notch), edge = VALUES(edge)
      `,
      [phoneId, clean(row.screen_size), clean(row.resolution), numberValue(row.pixel_density, true), numberValue(row.refresh_rate, true), numberValue(row.brightness, true), clean(row.aspect_ratio), clean(row.screen_protection), numberValue(row.screen_to_body_ratio), clean(row.touch_screen), clean(row.notch), booleanValue(row.edge)],
    );
  }

  private async upsertPhysicalSpecifications(connection: PoolConnection, row: CSVRow, phoneId: number): Promise<void> {
    await connection.execute(
      'INSERT INTO physical_specifications (phone_id, height, width, thickness, weight, ip_rating, waterproof, ruggedness) VALUES (?, ?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE height = VALUES(height), width = VALUES(width), thickness = VALUES(thickness), weight = VALUES(weight), ip_rating = VALUES(ip_rating), waterproof = VALUES(waterproof), ruggedness = VALUES(ruggedness)',
      [phoneId, numberValue(row.height), numberValue(row.width), numberValue(row.thickness), clean(row.weight), clean(row.ip_rating), clean(row.waterproof), clean(row.ruggedness)],
    );
  }

  private async upsertCameraSpecifications(connection: PoolConnection, row: CSVRow, phoneId: number): Promise<void> {
    await connection.execute(
      'INSERT INTO camera_specifications (phone_id, primary_camera_resolution, primary_camera_features, primary_camera_autofocus, primary_camera_flash, primary_camera_image_resolution, video) VALUES (?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE primary_camera_resolution = VALUES(primary_camera_resolution), primary_camera_features = VALUES(primary_camera_features), primary_camera_autofocus = VALUES(primary_camera_autofocus), primary_camera_flash = VALUES(primary_camera_flash), primary_camera_image_resolution = VALUES(primary_camera_image_resolution), video = VALUES(video)',
      [phoneId, clean(row.primary_camera_resolution), clean(row.primary_camera_features), booleanValue(row.primary_camera_autofocus), booleanValue(row.primary_camera_flash), clean(row.primary_camera_image_resolution), clean(row.video)],
    );
  }

  private async upsertAudio(connection: PoolConnection, row: CSVRow, phoneId: number): Promise<void> {
    await connection.execute(
      'INSERT INTO audio_features (phone_id, audio_jack, loudspeaker) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE audio_jack = VALUES(audio_jack), loudspeaker = VALUES(loudspeaker)',
      [phoneId, clean(row.audio_jack), booleanValue(row.loudspeaker)],
    );
  }

  private async upsertAdditional(connection: PoolConnection, row: CSVRow, phoneId: number): Promise<void> {
    await connection.execute(
      'INSERT INTO additional_features (phone_id, features, face_unlock, gps, gprs, volte, sim_size, sim_slot, speed) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE features = VALUES(features), face_unlock = VALUES(face_unlock), gps = VALUES(gps), gprs = VALUES(gprs), volte = VALUES(volte), sim_size = VALUES(sim_size), sim_slot = VALUES(sim_slot), speed = VALUES(speed)',
      [phoneId, clean(row.features), booleanValue(row.face_unlock), clean(row.gps), booleanValue(row.gprs), booleanValue(row.volte), clean(row.sim_size), clean(row.sim_slot), clean(row.speed)],
    );
  }

  private async replaceColors(connection: PoolConnection, colorsValue: string | undefined, phoneId: number): Promise<void> {
    await connection.execute('DELETE FROM phone_colors WHERE phone_id = ?', [phoneId]);
    const colors = [...new Set((colorsValue || '').split(',').map((value) => value.trim()).filter(Boolean))];
    for (const color of colors) {
      await connection.execute('INSERT INTO phone_colors (phone_id, color_name) VALUES (?, ?)', [phoneId, color]);
    }
  }

  private parseVariants(value: string | undefined): Array<{ variant?: string; price?: string }> {
    if (!value || value.trim() === '[]') return [];
    try {
      const parsed = JSON.parse(value.replace(/'/g, '\"')) as unknown;
      return Array.isArray(parsed) ? parsed.filter((item): item is { variant?: string; price?: string } => typeof item === 'object' && item !== null) : [];
    } catch {
      return [];
    }
  }

  private async replacePricing(connection: PoolConnection, row: CSVRow, phoneId: number): Promise<void> {
    await connection.execute('DELETE FROM phone_pricing WHERE phone_id = ?', [phoneId]);
    const base = [numberValue(row.price_official), numberValue(row.price_unofficial), numberValue(row.price_old), numberValue(row.price_savings), dateValue(row.price_updated), 'base'];
    if (base.slice(0, 4).some((value) => value !== null)) {
      await connection.execute(
        'INSERT INTO phone_pricing (phone_id, price_official, price_unofficial, price_old, price_savings, price_updated, variant_description) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [phoneId, ...base],
      );
    }

    for (const variant of this.parseVariants(row.price_variants)) {
      const description = clean(variant.variant) || 'base';
      const price = numberValue(variant.price);
      if (price === null) continue;
      if (description === 'base' && base.slice(0, 4).some((value) => value !== null)) continue;
      await connection.execute(
        'INSERT INTO phone_pricing (phone_id, price_official, variant_description) VALUES (?, ?, ?)',
        [phoneId, price, description],
      );
    }
  }

  async close(): Promise<void> {
    await this.db.close();
  }
}
