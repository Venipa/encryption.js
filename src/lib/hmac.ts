import { SHA256 as createHash, enc } from 'crypto-js';
import { safeEqual } from './safeEqual';

/**
 * A generic class for generating SHA-256 Hmac for verifying the value
 * integrity.
 */
export class Hmac {
  constructor(private readonly key: Buffer) {}

  /**
   * Generate the hmac
   */
  public generate(value: string) {
    return createHash(value, { key: this.key }).toString(enc.Base64url);
  }

  /**
   * Compare raw value against an existing hmac
   */
  public compare(value: string, existingHmac: string) {
    return safeEqual(this.generate(value), existingHmac);
  }
}