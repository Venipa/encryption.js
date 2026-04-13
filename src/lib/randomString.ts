import { base64 } from '@/lib/base64';
import { Buffer } from 'node:buffer';
import { createHash } from 'node:crypto';
/**
 * Generates a random string of a given size
 */
export function generateRandom(size: number): string {
  const buffer = Buffer.from(createHash('sha256').update(Math.random().toString()).digest('base64'), 'base64');
  return base64.urlEncode(buffer.toString('base64')).slice(0, size);
}
