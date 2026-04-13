import { Buffer } from 'buffer';


/**
 * Helper class to base64 encode/decode values with option.
 * This is a modified version of the original class from @poppinss/utils.
 * for url encoding and decoding
 */
class Base64 {
  /**
   * Base64 encode Buffer or string
   */
  encode(arrayBuffer: ArrayBuffer | SharedArrayBuffer): string;
  encode(data: Uint8Array): string;
  encode(data: string, encoding?: BufferEncoding): string;
  encode(data: ArrayBuffer | SharedArrayBuffer | Uint8Array | string, encoding?: BufferEncoding): string {
    if (typeof data === 'string') {
      return Buffer.from(data, encoding).toString('base64');
    }
    if (data instanceof Uint8Array) {
      return Buffer.from(data).toString('base64');
    }
    return Buffer.from(new Uint8Array(data)).toString('base64');
  }

  /**
   * Base64 decode a previously encoded string or Buffer.
   */
  decode(encode: string, encoding: BufferEncoding, strict: true): string;
  decode(encode: string, encoding: undefined, strict: true): string;
  decode(encode: string, encoding?: BufferEncoding, strict?: false): string | null;
  decode(encode: Buffer, encoding?: BufferEncoding): string;
  decode(encoded: string | Buffer, encoding: BufferEncoding = 'utf8', strict: boolean = false): string | null {
    if (Buffer.isBuffer(encoded)) {
      return encoded.toString(encoding);
    }

    const decoded = Buffer.from(encoded, 'base64').toString(encoding);
    const isInvalid = this.encode(decoded, encoding) !== encoded;

    if (strict && isInvalid) {
      throw new Error('Cannot decode malformed value');
    }

    return isInvalid ? null : decoded;
  }

  /**
   * Base64 encode Buffer or string to be URL safe. (RFC 4648)
   */
  urlEncode(arrayBuffer: ArrayBuffer | SharedArrayBuffer): string;
  urlEncode(data: Uint8Array): string;
  urlEncode(data: string, encoding?: BufferEncoding): string;
  urlEncode(data: ArrayBuffer | SharedArrayBuffer | Uint8Array | string, encoding?: BufferEncoding): string {
    const encoded =
      typeof data === 'string'
        ? this.encode(data, encoding)
        : data instanceof Uint8Array
          ? this.encode(data)
          : this.encode(new Uint8Array(data));
    return encoded.replace(/\+/g, '-').replace(/\//g, '_').replace(/\=/g, '');
  }

  /**
   * Base64 URL decode a previously encoded string or Buffer. (RFC 4648)
   */
  urlDecode(encode: string, encoding: BufferEncoding, strict: true): string;
  urlDecode(encode: string, encoding: undefined, strict: true): string;
  urlDecode(encode: string, encoding?: BufferEncoding, strict?: false): string | null;
  urlDecode(encode: Buffer, encoding?: BufferEncoding): string;
  urlDecode(encoded: string | Buffer, encoding: BufferEncoding = 'utf8', strict: boolean = false): string | null {
    if (Buffer.isBuffer(encoded)) {
      return encoded.toString(encoding);
    }

    const normalizedValue = encoded.replace(/-/g, '+').replace(/_/g, '/');
    const missingPadding = normalizedValue.length % 4;
    const normalizedWithPadding =
      missingPadding === 0 ? normalizedValue : `${normalizedValue}${'='.repeat(4 - missingPadding)}`;

    const decoded = Buffer.from(normalizedWithPadding, 'base64').toString(encoding);
    const isInvalid = this.urlEncode(decoded, encoding) !== encoded;

    if (strict && isInvalid) {
      throw new Error('Cannot urlDecode malformed value');
    }

    return isInvalid ? null : decoded;
  }
}

export const base64 = new Base64();
