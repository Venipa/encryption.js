import { safeEqual } from '@/lib/safeEqual';
import { createHash } from 'node:crypto';

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
    return createHash('sha256').update(value).digest('base64');
  }

  /**
   * Compare raw value against an existing hmac
   */
  public compare(value: string, existingHmac: string) {
    return safeEqual(this.generate(value), existingHmac);
  }
}