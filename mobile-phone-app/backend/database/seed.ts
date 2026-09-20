import path from 'node:path';
import { loadConfig } from '../config';
import { CSVSeeder } from './seeders/csvSeeder';
import { log } from '../logger';
import { loadEnvironment } from '../env';

loadEnvironment();

async function main(): Promise<void> {
  const config = loadConfig();
  const csvFilePath = path.resolve(process.argv[2] || config.seedFile);
  const rawLimit = process.argv[3];
  const limit = rawLimit === undefined ? undefined : Number(rawLimit);

  if (limit !== undefined && (!Number.isInteger(limit) || limit < 1)) {
    throw new Error('Seed limit must be a positive integer');
  }

  const seeder = new CSVSeeder(config);
  try {
    await seeder.seedFromCSV(csvFilePath, limit);
  } finally {
    await seeder.close();
  }
}

if (require.main === module) {
  main().catch((error) => {
    log('error', 'Database seed failed', {
      error: error instanceof Error ? error.message : String(error),
    });
    process.exitCode = 1;
  });
}
