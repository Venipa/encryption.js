import json from './json';
import milliseconds from './milliseconds';

export class MessageBuilder {
  #getExpiryDate(expiresIn?: string | number): undefined | Date {
    if (!expiresIn) {
      return undefined;
    }

    const expiryMs = milliseconds.parse(expiresIn);
    return new Date(Date.now() + expiryMs);
  }

  /**
   * Returns a boolean telling, if message has been expired or not
   */
  #isExpired(message: any) {
    if (!message.expiryDate) {
      return false;
    }

    const expiryDate = new Date(message.expiryDate);
    return Number.isNaN(expiryDate.getTime()) || expiryDate < new Date();
  }

  /**
   * Builds a message by encoding expiry date and purpose inside it.
   */
  build(message: any, expiresIn?: string | number, purpose?: string): string {
    const expiryDate = this.#getExpiryDate(expiresIn);
    return json.safeStringify({ message, purpose, expiryDate })!;
  }

  /**
   * Verifies the message for expiry and purpose.
   */
  verify<T extends any>(message: any, purpose?: string): null | T {
    const parsed = json.safeParse(message);

    /**
     * After JSON.parse we do not receive a valid object
     */
    if (typeof parsed !== 'object' || !parsed) {
      return null;
    }

    /**
     * Missing ".message" property
     */
    if (!parsed.message) {
      return null;
    }

    /**
     * Ensure purposes are same.
     */
    if (parsed.purpose !== purpose) {
      return null;
    }

    /**
     * Ensure isn't expired
     */
    if (this.#isExpired(parsed)) {
      return null;
    }

    return parsed.message;
  }
}
