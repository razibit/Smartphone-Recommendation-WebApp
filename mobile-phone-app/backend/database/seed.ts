import path from 'path';
import { CSVSeeder } from './seeders/csvSeeder';

async function main() {
  const args = process.argv.slice(2);
  const csvFilePath = args[0] || path.join(__dirname, '../../../phones_data_20250729_181901.csv');
  const limit = args[1] ? parseInt(args[1]) : undefined;

  console.log('Starting database seeding...');
  console.log(`CSV file: ${csvFilePath}`);
  if (limit) console.log(`Limiting to ${limit} records`);

  const seeder = new CSVSeeder();

  try {
    await seeder.seedFromCSV(csvFilePath, limit);
    console.log('✅ Database seeding completed successfully');
  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    process.exit(1);
  } finally {
    await seeder.close();
  }
}

if (require.main === module) {
  main();
}