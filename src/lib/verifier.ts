import { SHA256 as createHash, enc } from 'crypto-js';

import { base64 as utilsbase64 } from './base64';
import { Exception } from './exception';
import { Hmac } from './hmac';
import { MessageBuilder } from './messageBuilder';

/**
 * Message verifier is similar to the encryption. However, the actual payload
 * is not encrypted and just base64 encoded. This is helpful when you are
 * not concerned about the confidentiality of the data, but just want to
 * make sure that is not tampered after encoding.
 */
export class MessageVerifier {
  constructor(private readonly secret: string) {}
  /**
   * The key for signing and encrypting values. It is derived
   * from the user provided secret.
   */
  private readonly cryptoKey = Buffer.from(createHash(this.secret).toString(enc.Base64), 'base64');

  /**
   * Use `dot` as a separator for joining encrypted value, iv and the
   * hmac hash. The idea is borrowed from JWT's in which each part
   * of the payload is concatenated with a dot.
   */
  private readonly separator = '.';


  /**
   * Signs a value with the secret key. The signed value is not encrypted, but just
   * signed for avoiding tampering to the original message.
   *
   * Any `JSON.stringify` valid value is accepted by this method.
   */
  public sign(value: any, expiresAt?: string | number, purpose?: string) {
    if (value === null || value === undefined) {
      throw new Exception('"MessageVerifier.sign" cannot sign null or undefined values');
    }

    const encoded = utilsbase64.urlEncode(new MessageBuilder().build(value, expiresAt, purpose));
    return `${encoded}${this.separator}${new Hmac(this.cryptoKey).generate(encoded)}`;
  }

  /**
   * Unsign a previously signed value with an optional purpose
   */
  public unsign<T = any>(value: string, purpose?: string): null | T {
    if (typeof value !== 'string') {
      throw new Exception('"MessageVerifier.unsign" expects a string value');
    }

    /**
     * Ensure value is in correct format
     */
    const [encoded, hash] = value.split(this.separator);
    if (!encoded || !hash) {
      return null;
    }

    /**
     * Ensure value can be decoded
     */
    const decoded = utilsbase64.urlDecode(encoded);
    if (!decoded) {
      return null;
    }

    const isValid = new Hmac(this.cryptoKey).compare(encoded, hash);
    return isValid ? new MessageBuilder().verify(decoded, purpose) : null;
  }
}