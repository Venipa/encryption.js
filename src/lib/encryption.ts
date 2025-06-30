import { algo, SHA256 as createHash, enc, lib } from 'crypto-js';
import { base64 as utilsbase64 } from './base64';
import { Exception } from './exception';
import { AppKeyException } from './exceptions';
import { Hmac } from './hmac';
import { MessageBuilder } from './messageBuilder';
import { generateRandom } from './randomString';
import { MessageVerifier } from './verifier';
interface EncryptionOptions {
  secret: string;
  algorithm?: string;
}
export class Encryption {
  private readonly algorithm: string;
  private readonly separator = '.';
  private readonly cryptoKey: lib.WordArray;
  private readonly base64 = utilsbase64;
  /**
   * Reference to the instance of message verifier for signing
   * and verifying values.
   */
  public verifier: MessageVerifier;
  constructor(private readonly options: EncryptionOptions) {
    this.validateSecret();
    this.algorithm = options.algorithm || 'aes-256-cbc';
    this.cryptoKey = createHash(this.options.secret);
    this.verifier = new MessageVerifier(this.options.secret);
  }

  /**
   * Validates the app secret
   */
  private validateSecret() {
    if (typeof this.options.secret !== 'string') {
      throw AppKeyException.missingAppKey();
    }

    if (this.options.secret.length < 16) {
      throw AppKeyException.insecureAppKey();
    }
  }

  /**
   * Encrypt value with optional expiration and purpose
   */
  public encrypt(value: any, expiresAt?: string | number, purpose?: string) {
    /**
     * Using a random string as the iv for generating unpredictable values
     */
    const ivString = generateRandom(16);
    const iv = lib.WordArray.create(Buffer.from(ivString, 'utf8'));

    /**
     * Creating chiper
     */
    const cipher = algo.AES.createEncryptor(this.cryptoKey, { iv });
    /**
     * Encoding value to a string so that we can set it on the cipher
     */
    const encodedValue = new MessageBuilder().build(value, expiresAt, purpose);

    /**
     * Set final to the cipher instance and encrypt it
     */
    const encrypted = Buffer.concat(
      [cipher.process(lib.WordArray.create(Buffer.from(encodedValue, 'utf8'))), cipher.finalize()].map((d) => {
        d.clamp();
        return Buffer.from(d.toString(enc.Hex), 'hex');
      }),
    );

    /**
     * Concatenate `encrypted value` and `iv` by urlEncoding them. The concatenation is required
     * to generate the HMAC, so that HMAC checks for integrity of both the `encrypted value`
     * and the `iv`.
     */
    const result = `${this.base64.urlEncode(encrypted)}${this.separator}${iv.toString(enc.Base64url)}`;

    /**
     * Returns the result + hmac
     */
    return `${result}${this.separator}${new Hmac(Buffer.from(this.cryptoKey.toString(enc.Hex), 'hex')).generate(
      result,
    )}`;
  }

  /**
   * Decrypt value and verify it against a purpose
   */
  public decrypt<T = any>(value: string, purpose?: string): T | null {
    if (typeof value !== 'string') {
      throw new Exception('"Encryption.decrypt" expects a string value');
    }

    /**
     * Make sure the encrypted value is in correct format. ie
     * [encrypted value]--[iv]--[hash]
     */
    const [encryptedEncoded, ivEncoded, hash] = value.split(this.separator);
    if (!encryptedEncoded || !ivEncoded || !hash) {
      return null;
    }

    /**
     * Make sure we are able to urlDecode the encrypted value
     */
    const encrypted = this.base64.urlDecode(encryptedEncoded, 'base64');
    if (!encrypted) {
      return null;
    }

    /**
     * Make sure we are able to urlDecode the iv
     */
    const iv = this.base64.urlDecode(ivEncoded);
    if (!iv) {
      return null;
    }

    /**
     * Make sure the hash is correct, it means the first 2 parts of the
     * string are not tampered.
     */
    const isValidHmac = new Hmac(Buffer.from(this.cryptoKey.toString(enc.Hex), 'hex')).compare(
      `${encryptedEncoded}${this.separator}${ivEncoded}`,
      hash,
    );

    if (!isValidHmac) {
      return null;
    }

    /**
     * The Decipher can raise exceptions with malformed input, so we wrap it
     * to avoid leaking sensitive information
     */
    const ivWord = lib.WordArray.create(Buffer.from(iv, 'utf8'));
    try {
      const decipher = algo.AES.createDecryptor(this.cryptoKey, { iv: ivWord });
      const decrypted =
        decipher.process(lib.WordArray.create(Buffer.from(encrypted, 'base64'))).toString(enc.Utf8) +
        decipher.finalize().toString(enc.Utf8);
      const parsed: T | null = new MessageBuilder().verify(decrypted, purpose);

      return parsed;
    } catch (error) {
      return null;
    }
  }
}