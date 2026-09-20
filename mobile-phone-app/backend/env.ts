import fs from 'node:fs';
import path from 'node:path';
import dotenv from 'dotenv';

function loadFile(filePath: string): void {
  if (!fs.existsSync(filePath)) return;
  const buffer = fs.readFileSync(filePath);
  const content = buffer[0] === 0xff && buffer[1] === 0xfe
    ? buffer.toString('utf16le')
    : buffer.toString('utf8').replace(/^\uFEFF/, '');

  for (const [key, value] of Object.entries(dotenv.parse(content))) {
    if (process.env[key] === undefined) process.env[key] = value;
  }
}

export function loadEnvironment(): void {
  loadFile(path.resolve(process.cwd(), '.env.local'));
  loadFile(path.resolve(process.cwd(), '.env'));
}
