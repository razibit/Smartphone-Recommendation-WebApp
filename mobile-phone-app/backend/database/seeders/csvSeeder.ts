import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';
import { DatabaseConnection } from '../connection';

interface CSVRow {
  brand: string;
  model: string;
  device_type: string;
  release_date: string;
  status: string;
  architecture: string;
  aspect_ratio: string;
  audio_jack: string;
  battery_capacity: string;
  bluetooth: string;
  brightness: string;
  chipset: string;
  colors: string;
  cpu: string;
  cpu_cores: string;
  detail_url: string;
  display_type: string;
  edge: string;
  expandable_memory: string;
  fabrication: string;
  face_unlock: string;
  features: string;
  gprs: string;
  gps: string;
  gpu: string;
  height: string;
  image_url: string;
  internal_storage: string;
  ip_rating: string;
  loudspeaker: string;
  network: string;
  notch: string;
  operating_system: string;
  os_version: string;
  pixel_density: string;
  price_official: string;
  price_old: string;
  price_savings: string;
  price_unofficial: string;
  price_updated: string;
  price_variants: string;
  primary_camera_autofocus: string;
  primary_camera_features: string;
  primary_camera_flash: string;
  primary_camera_image_resolution: string;
  primary_camera_resolution: string;
  quick_charging: string;
  ram: string;
  ram_type: string;
  refresh_rate: string;
  resolution: string;
  ruggedness: string;
  scraped_at: string;
  screen_protection: string;
  screen_size: string;
  screen_to_body_ratio: string;
  sim_size: string;
  sim_slot: string;
  speed: string;
  storage_type: string;
  thickness: string;
  touch_screen: string;
  usb: string;
  usb_otg: string;
  usb_type_c: string;
  user_interface: string;
  video: string;
  volte: string;
  waterproof: string;
  weight: string;
  width: string;
  wlan: string;
}

export class CSVSeeder {
  private db: DatabaseConnection;
  private brandCache = new Map<string, number>();
  private chipsetCache = new Map<string, number>();
  private osCache = new Map<string, number>();
  private displayTypeCache = new Map<string, number>();
  private storageTypeCache = new Map<string, number>();
  private ramTypeCache = new Map<string, number>();

  constructor() {
    this.db = new DatabaseConnection();
  }

  async seedFromCSV(csvFilePath: string, limit?: number): Promise<void> {
    console.log('Starting CSV seeding process...');
    
    const csvData: CSVRow[] = [];
    let recordCount = 0;
    
    // Read CSV file
    return new Promise((resolve, reject) => {
      fs.createReadStream(csvFilePath)
        .pipe(csv())
        .on('data', (row: CSVRow) => {
          if (!limit || recordCount < limit) {
            csvData.push(row);
            recordCount++;
          }
        })
        .on('end', async () => {
          try {
            console.log(`Loaded ${csvData.length} rows from CSV`);
            await this.processCSVData(csvData);
            console.log('CSV seeding completed successfully');
            resolve();
          } catch (error) {
            console.error('Error processing CSV data:', error);
            reject(error);
          }
        })
        .on('error', reject);
    });
  }

  private async processCSVData(csvData: CSVRow[]): Promise<void> {
    console.log('Processing CSV data...');
    
    // Remove duplicates based on brand and model combination
    const uniquePhones = new Map<string, CSVRow>();
    csvData.forEach(row => {
      const key = `${row.brand.toLowerCase().trim()}-${row.model.toLowerCase().trim()}`;
      if (!uniquePhones.has(key)) {
        uniquePhones.set(key, row);
      } else {
        console.log(`Skipping duplicate phone: ${row.brand} ${row.model}`);
      }
    });
    
    const uniquePhonesList = Array.from(uniquePhones.values());
    console.log(`Removed ${csvData.length - uniquePhonesList.length} duplicate phones from CSV data`);
    console.log(`Processing ${uniquePhonesList.length} unique phones`);
    
    // Process in batches to avoid overwhelming the database
    const batchSize = 50;
    for (let i = 0; i < uniquePhonesList.length; i += batchSize) {
      const batch = uniquePhonesList.slice(i, i + batchSize);
      console.log(`Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(uniquePhonesList.length / batchSize)}`);
      
      for (const row of batch) {
        try {
          await this.processPhoneRecord(row);
        } catch (error) {
          console.error(`Error processing phone ${row.brand} ${row.model}:`, error);
          // Continue with next record instead of failing completely
        }
      }
    }
  }

  private async processPhoneRecord(row: CSVRow): Promise<void> {
    // Get or create lookup table IDs
    const brandId = await this.getOrCreateBrand(row.brand);
    const chipsetId = row.chipset ? await this.getOrCreateChipset(row.chipset, row.architecture, row.fabrication) : null;
    const osId = row.operating_system ? await this.getOrCreateOS(row.operating_system, row.os_version, row.user_interface) : null;
    const displayTypeId = row.display_type ? await this.getOrCreateDisplayType(row.display_type) : null;
    const storageTypeId = row.storage_type ? await this.getOrCreateStorageType(row.storage_type) : null;
    const ramTypeId = row.ram_type ? await this.getOrCreateRAMType(row.ram_type) : null;

    // Insert phone record
    const phoneId = await this.insertPhone(row, brandId);

    // Insert related specifications
    await this.insertPhoneSpecifications(phoneId, row, chipsetId, osId, displayTypeId, storageTypeId, ramTypeId);
    await this.insertDisplaySpecifications(phoneId, row);
    await this.insertPhysicalSpecifications(phoneId, row);
    await this.insertCameraSpecifications(phoneId, row);
    await this.insertAudioFeatures(phoneId, row);
    await this.insertAdditionalFeatures(phoneId, row);
    await this.insertPhoneColors(phoneId, row.colors);
    await this.insertPhonePricing(phoneId, row);
  }

  private async getOrCreateBrand(brandName: string): Promise<number> {
    if (this.brandCache.has(brandName)) {
      return this.brandCache.get(brandName)!;
    }

    // Check if brand exists
    const existingBrand = await this.db.query(
      'SELECT brand_id FROM brands WHERE brand_name = ?',
      [brandName]
    );

    if (existingBrand.results.length > 0) {
      const brandId = existingBrand.results[0].brand_id;
      this.brandCache.set(brandName, brandId);
      return brandId;
    }

    // Create new brand
    const result = await this.db.query(
      'INSERT INTO brands (brand_name) VALUES (?)',
      [brandName]
    );
    
    const brandId = result.results.insertId;
    this.brandCache.set(brandName, brandId);
    return brandId;
  }

  private async getOrCreateChipset(chipsetName: string, architecture?: string, fabrication?: string): Promise<number> {
    if (this.chipsetCache.has(chipsetName)) {
      return this.chipsetCache.get(chipsetName)!;
    }

    const existingChipset = await this.db.query(
      'SELECT chipset_id FROM chipsets WHERE chipset_name = ?',
      [chipsetName]
    );

    if (existingChipset.results.length > 0) {
      const chipsetId = existingChipset.results[0].chipset_id;
      this.chipsetCache.set(chipsetName, chipsetId);
      return chipsetId;
    }

    const result = await this.db.query(
      'INSERT INTO chipsets (chipset_name, architecture, fabrication) VALUES (?, ?, ?)',
      [chipsetName, architecture || null, fabrication || null]
    );
    
    const chipsetId = result.results.insertId;
    this.chipsetCache.set(chipsetName, chipsetId);
    return chipsetId;
  }

  private async getOrCreateOS(osName: string, osVersion?: string, userInterface?: string): Promise<number> {
    const cacheKey = `${osName}-${osVersion || ''}`;
    if (this.osCache.has(cacheKey)) {
      return this.osCache.get(cacheKey)!;
    }

    const existingOS = await this.db.query(
      'SELECT os_id FROM operating_systems WHERE os_name = ? AND os_version = ?',
      [osName, osVersion || null]
    );

    if (existingOS.results.length > 0) {
      const osId = existingOS.results[0].os_id;
      this.osCache.set(cacheKey, osId);
      return osId;
    }

    const result = await this.db.query(
      'INSERT INTO operating_systems (os_name, os_version, user_interface) VALUES (?, ?, ?)',
      [osName, osVersion || null, userInterface || null]
    );
    
    const osId = result.results.insertId;
    this.osCache.set(cacheKey, osId);
    return osId;
  }

  private async getOrCreateDisplayType(displayTypeName: string): Promise<number> {
    if (this.displayTypeCache.has(displayTypeName)) {
      return this.displayTypeCache.get(displayTypeName)!;
    }

    const existing = await this.db.query(
      'SELECT display_type_id FROM display_types WHERE display_type_name = ?',
      [displayTypeName]
    );

    if (existing.results.length > 0) {
      const id = existing.results[0].display_type_id;
      this.displayTypeCache.set(displayTypeName, id);
      return id;
    }

    const result = await this.db.query(
      'INSERT INTO display_types (display_type_name) VALUES (?)',
      [displayTypeName]
    );
    
    const id = result.results.insertId;
    this.displayTypeCache.set(displayTypeName, id);
    return id;
  }

  private async getOrCreateStorageType(storageTypeName: string): Promise<number> {
    if (this.storageTypeCache.has(storageTypeName)) {
      return this.storageTypeCache.get(storageTypeName)!;
    }

    const existing = await this.db.query(
      'SELECT storage_type_id FROM storage_types WHERE storage_type_name = ?',
      [storageTypeName]
    );

    if (existing.results.length > 0) {
      const id = existing.results[0].storage_type_id;
      this.storageTypeCache.set(storageTypeName, id);
      return id;
    }

    const result = await this.db.query(
      'INSERT INTO storage_types (storage_type_name) VALUES (?)',
      [storageTypeName]
    );
    
    const id = result.results.insertId;
    this.storageTypeCache.set(storageTypeName, id);
    return id;
  }

  private async getOrCreateRAMType(ramTypeName: string): Promise<number> {
    if (this.ramTypeCache.has(ramTypeName)) {
      return this.ramTypeCache.get(ramTypeName)!;
    }

    const existing = await this.db.query(
      'SELECT ram_type_id FROM ram_types WHERE ram_type_name = ?',
      [ramTypeName]
    );

    if (existing.results.length > 0) {
      const id = existing.results[0].ram_type_id;
      this.ramTypeCache.set(ramTypeName, id);
      return id;
    }

    const result = await this.db.query(
      'INSERT INTO ram_types (ram_type_name) VALUES (?)',
      [ramTypeName]
    );
    
    const id = result.results.insertId;
    this.ramTypeCache.set(ramTypeName, id);
    return id;
  }

  private async insertPhone(row: CSVRow, brandId: number): Promise<number> {
    const releaseDate = this.parseDate(row.release_date);
    const scrapedAt = this.parseTimestamp(row.scraped_at);

    // First check if phone already exists
    const existingPhone = await this.db.query(
      'SELECT phone_id FROM phones WHERE brand_id = ? AND model = ?',
      [brandId, row.model]
    );

    if (existingPhone.results.length > 0) {
      console.log(`Phone already exists: ${row.brand} ${row.model}, updating...`);
      const phoneId = existingPhone.results[0].phone_id;
      
      // Update existing phone
      await this.db.query(`
        UPDATE phones SET 
          device_type = ?, 
          release_date = ?, 
          status = ?, 
          detail_url = ?, 
          image_url = ?, 
          scraped_at = ?
        WHERE phone_id = ?
      `, [
        row.device_type || 'Smartphone',
        releaseDate,
        this.mapStatus(row.status),
        row.detail_url || null,
        row.image_url || null,
        scrapedAt,
        phoneId
      ]);
      
      return phoneId;
    }

    // Insert new phone
    const result = await this.db.query(`
      INSERT INTO phones (brand_id, model, device_type, release_date, status, detail_url, image_url, scraped_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      brandId,
      row.model,
      row.device_type || 'Smartphone',
      releaseDate,
      this.mapStatus(row.status),
      row.detail_url || null,
      row.image_url || null,
      scrapedAt
    ]);

    return result.results.insertId;
  }

  private async insertPhoneSpecifications(
    phoneId: number, 
    row: CSVRow, 
    chipsetId: number | null, 
    osId: number | null, 
    displayTypeId: number | null, 
    storageTypeId: number | null, 
    ramTypeId: number | null
  ): Promise<void> {
    await this.db.query(`
      INSERT INTO phone_specifications (
        phone_id, chipset_id, os_id, display_type_id, storage_type_id, ram_type_id,
        cpu, cpu_cores, gpu, ram_gb, internal_storage_gb, expandable_memory,
        battery_capacity, quick_charging, bluetooth_version, network, wlan, usb, usb_otg, usb_type_c
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        chipset_id = VALUES(chipset_id),
        os_id = VALUES(os_id),
        display_type_id = VALUES(display_type_id),
        storage_type_id = VALUES(storage_type_id),
        ram_type_id = VALUES(ram_type_id),
        cpu = VALUES(cpu),
        cpu_cores = VALUES(cpu_cores),
        gpu = VALUES(gpu),
        ram_gb = VALUES(ram_gb),
        internal_storage_gb = VALUES(internal_storage_gb),
        expandable_memory = VALUES(expandable_memory),
        battery_capacity = VALUES(battery_capacity),
        quick_charging = VALUES(quick_charging),
        bluetooth_version = VALUES(bluetooth_version),
        network = VALUES(network),
        wlan = VALUES(wlan),
        usb = VALUES(usb),
        usb_otg = VALUES(usb_otg),
        usb_type_c = VALUES(usb_type_c)
    `, [
      phoneId, chipsetId, osId, displayTypeId, storageTypeId, ramTypeId,
      row.cpu || null,
      this.parseInteger(row.cpu_cores),
      row.gpu || null,
      this.parseInteger(row.ram?.replace('GB', '')),
      this.parseInteger(row.internal_storage?.replace('GB', '')),
      this.parseBoolean(row.expandable_memory),
      this.parseInteger(row.battery_capacity?.replace(/[^\d]/g, '')),
      row.quick_charging || null,
      row.bluetooth || null,
      row.network || null,
      row.wlan || null,
      row.usb || null,
      this.parseBoolean(row.usb_otg),
      this.parseBoolean(row.usb_type_c)
    ]);
  }

  private async insertDisplaySpecifications(phoneId: number, row: CSVRow): Promise<void> {
    await this.db.query(`
      INSERT INTO display_specifications (
        phone_id, screen_size, resolution, pixel_density, refresh_rate, brightness,
        aspect_ratio, screen_protection, screen_to_body_ratio, touch_screen, notch, edge
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        screen_size = VALUES(screen_size),
        resolution = VALUES(resolution),
        pixel_density = VALUES(pixel_density),
        refresh_rate = VALUES(refresh_rate),
        brightness = VALUES(brightness),
        aspect_ratio = VALUES(aspect_ratio),
        screen_protection = VALUES(screen_protection),
        screen_to_body_ratio = VALUES(screen_to_body_ratio),
        touch_screen = VALUES(touch_screen),
        notch = VALUES(notch),
        edge = VALUES(edge)
    `, [
      phoneId,
      this.parseFloat(row.screen_size?.replace(/[^\d.]/g, '')),
      row.resolution || null,
      this.parseInteger(row.pixel_density?.replace(/[^\d]/g, '')),
      this.parseInteger(row.refresh_rate?.replace(/[^\d]/g, '')),
      this.parseInteger(row.brightness?.replace(/[^\d]/g, '')),
      row.aspect_ratio || null,
      row.screen_protection || null,
      this.parseFloat(row.screen_to_body_ratio?.replace(/[^\d.]/g, '')),
      row.touch_screen || null,
      row.notch || null,
      this.parseBoolean(row.edge)
    ]);
  }

  private async insertPhysicalSpecifications(phoneId: number, row: CSVRow): Promise<void> {
    await this.db.query(`
      INSERT INTO physical_specifications (
        phone_id, height, width, thickness, weight, ip_rating, waterproof, ruggedness
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        height = VALUES(height),
        width = VALUES(width),
        thickness = VALUES(thickness),
        weight = VALUES(weight),
        ip_rating = VALUES(ip_rating),
        waterproof = VALUES(waterproof),
        ruggedness = VALUES(ruggedness)
    `, [
      phoneId,
      this.parseFloat(row.height?.replace(/[^\d.]/g, '')),
      this.parseFloat(row.width?.replace(/[^\d.]/g, '')),
      this.parseFloat(row.thickness?.replace(/[^\d.]/g, '')),
      this.parseFloat(row.weight?.replace(/[^\d.]/g, '')),
      row.ip_rating || null,
      row.waterproof || null,
      row.ruggedness || null
    ]);
  }

  private async insertCameraSpecifications(phoneId: number, row: CSVRow): Promise<void> {
    await this.db.query(`
      INSERT INTO camera_specifications (
        phone_id, primary_camera_resolution, primary_camera_features,
        primary_camera_autofocus, primary_camera_flash, primary_camera_image_resolution, video
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        primary_camera_resolution = VALUES(primary_camera_resolution),
        primary_camera_features = VALUES(primary_camera_features),
        primary_camera_autofocus = VALUES(primary_camera_autofocus),
        primary_camera_flash = VALUES(primary_camera_flash),
        primary_camera_image_resolution = VALUES(primary_camera_image_resolution),
        video = VALUES(video)
    `, [
      phoneId,
      row.primary_camera_resolution || null,
      row.primary_camera_features || null,
      this.parseBoolean(row.primary_camera_autofocus),
      this.parseBoolean(row.primary_camera_flash),
      row.primary_camera_image_resolution || null,
      row.video || null
    ]);
  }

  private async insertAudioFeatures(phoneId: number, row: CSVRow): Promise<void> {
    await this.db.query(`
      INSERT INTO audio_features (phone_id, audio_jack, loudspeaker)
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE
        audio_jack = VALUES(audio_jack),
        loudspeaker = VALUES(loudspeaker)
    `, [
      phoneId,
      row.audio_jack || null,
      this.parseBoolean(row.loudspeaker)
    ]);
  }

  private async insertAdditionalFeatures(phoneId: number, row: CSVRow): Promise<void> {
    await this.db.query(`
      INSERT INTO additional_features (
        phone_id, features, face_unlock, gps, gprs, volte, sim_size, sim_slot, speed
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        features = VALUES(features),
        face_unlock = VALUES(face_unlock),
        gps = VALUES(gps),
        gprs = VALUES(gprs),
        volte = VALUES(volte),
        sim_size = VALUES(sim_size),
        sim_slot = VALUES(sim_slot),
        speed = VALUES(speed)
    `, [
      phoneId,
      row.features || null,
      this.parseBoolean(row.face_unlock),
      row.gps || null,
      this.parseBoolean(row.gprs),
      this.parseBoolean(row.volte),
      row.sim_size || null,
      row.sim_slot || null,
      row.speed || null
    ]);
  }

  private async insertPhoneColors(phoneId: number, colorsString: string): Promise<void> {
    if (!colorsString) return;

    const colors = colorsString.split(',').map(color => color.trim());
    
    for (const color of colors) {
      if (color) {
        await this.db.query(`
          INSERT INTO phone_colors (phone_id, color_name)
          VALUES (?, ?)
          ON DUPLICATE KEY UPDATE color_name = VALUES(color_name)
        `, [phoneId, color]);
      }
    }
  }

  private async insertPhonePricing(phoneId: number, row: CSVRow): Promise<void> {
    await this.db.query(`
      INSERT INTO phone_pricing (
        phone_id, price_official, price_unofficial, price_old, price_savings, price_updated, variant_description
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        price_official = VALUES(price_official),
        price_unofficial = VALUES(price_unofficial),
        price_old = VALUES(price_old),
        price_savings = VALUES(price_savings),
        price_updated = VALUES(price_updated),
        variant_description = VALUES(variant_description)
    `, [
      phoneId,
      this.parseFloat(row.price_official?.replace(/[^\d.]/g, '')),
      this.parseFloat(row.price_unofficial?.replace(/[^\d.]/g, '')),
      this.parseFloat(row.price_old?.replace(/[^\d.]/g, '')),
      this.parseFloat(row.price_savings?.replace(/[^\d.]/g, '')),
      this.parseDate(row.price_updated),
      null // We'll handle variants separately if needed
    ]);
  }

  // Utility methods for parsing data
  private parseInteger(value: string | undefined): number | null {
    if (!value) return null;
    const parsed = parseInt(value.replace(/[^\d]/g, ''));
    return isNaN(parsed) ? null : parsed;
  }

  private parseFloat(value: string | undefined): number | null {
    if (!value) return null;
    const parsed = parseFloat(value.replace(/[^\d.]/g, ''));
    return isNaN(parsed) ? null : parsed;
  }

  private parseBoolean(value: string | undefined): boolean {
    if (!value) return false;
    return ['yes', 'true', '1', 'available'].includes(value.toLowerCase());
  }

  private parseDate(dateString: string | undefined): string | null {
    if (!dateString) return null;
    
    try {
      // Handle various date formats
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return null;
      return date.toISOString().split('T')[0];
    } catch {
      return null;
    }
  }

  private parseTimestamp(timestampString: string | undefined): string | null {
    if (!timestampString) return null;
    
    try {
      const date = new Date(timestampString);
      if (isNaN(date.getTime())) return null;
      return date.toISOString().slice(0, 19).replace('T', ' ');
    } catch {
      return null;
    }
  }

  private mapStatus(status: string | undefined): string {
    if (!status) return 'Available';
    
    const statusLower = status.toLowerCase();
    if (statusLower.includes('upcoming') || statusLower.includes('exp.')) return 'Upcoming';
    if (statusLower.includes('rumored')) return 'Rumored';
    if (statusLower.includes('discontinued')) return 'Discontinued';
    return 'Available';
  }

  async close(): Promise<void> {
    await this.db.close();
  }
}