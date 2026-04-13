import { describe, expect, it } from 'bun:test';
import crypto from 'node:crypto';
import Encryption from './';
import type { Algorithm } from './lib/encryption';

const randomSecret = crypto.randomBytes(32).toString('hex');
const enc = new Encryption({ secret: randomSecret });

describe('encrypt', () => {
  it('returns null when decryption fails', () => {
    const obj = { test: 1 };
    const first = enc.encrypt(obj);
    console.log("first", first);
    // Intentionally corrupt the encrypted string (e.g. remove last character)
    const corrupted = first.slice(0, -1);
    const result: typeof obj | null = enc.decrypt(corrupted);
    console.log("result", result);
    expect(result).toBeNull();
  });
  it('returns object when decryption succeeds', () => {
    const obj = { test: 1 };
    const first = enc.encrypt(obj);
    console.log("first", first);
    const result: typeof obj | null = enc.decrypt(first);
    console.log("result", result);
    expect(result).toEqual(obj);
  });
  
  it('returns object when decryption succeeds with custom algorithms', () => {
    const algos: Algorithm[] = ["aes-256-cbc", "aes-256-cbc"];
    const map = new Map<string, boolean>(algos.map(algo => [algo, false]));
    for (const algo of algos) {
      const alg_enc = new Encryption({ secret: randomSecret, algorithm: algo });
      const obj = { algo };
      const first = alg_enc.encrypt(obj);
      const result: typeof obj | null = alg_enc.decrypt(first);
      map.set(algo, result?.algo === algo);
    }
    console.log("map", map);
    expect(map.size).toBe(algos.length);
    expect(map.values().every(value => value)).toBe(true);
  });
});
