import { base64 as utilsbase64 } from "@/lib/base64";
import { Exception } from "@/lib/exception";
import { AppKeyException } from "@/lib/exceptions";
import { Hmac } from "@/lib/hmac";
import { MessageBuilder } from "@/lib/messageBuilder";
import { generateRandom } from "@/lib/randomString";
import { MessageVerifier } from "@/lib/verifier";
import { createCipheriv, createDecipheriv, createHash } from "node:crypto";

export type Algorithm =
	// AES family modes that require an IV and are commonly supported by Node.js
	| "aes-128-cbc"
	| "aes-192-cbc"
	| "aes-256-cbc"
	| "aes-128-ctr"
	| "aes-192-ctr"
	| "aes-256-ctr"
	| "aes-128-gcm"
	| "aes-192-gcm"
	| "aes-256-gcm"
	// DES & 3DES, as available in Node.js/OpenSSL defaults
	| "des-cbc"
	| "des-ede3-cbc"
	| ({} & string);
export interface EncryptionOptions {
	secret: string;
	algorithm?: Algorithm;
}
/**
 * Encryption class
 * @description Encryption class is used to encrypt and decrypt data, some encryption algorithms may not be available in all environments, so you can use the `algorithm` option to specify the algorithm to use.
 * @example
 * const encryption = new Encryption({ secret: "my-secret" });
 * const encrypted = encryption.encrypt({ data: "my-data" });
 * const decrypted = encryption.decrypt(encrypted);
 */
export class Encryption {
	private readonly algorithm: string;
	private readonly separator = ".";
	private readonly cryptoKey: Buffer;
	private readonly base64 = utilsbase64;
	/**
	 * Reference to the instance of message verifier for signing
	 * and verifying values.
	 */
	public verifier: MessageVerifier;
	constructor(private readonly options: EncryptionOptions) {
		this.validateSecret();
		this.algorithm = options.algorithm || "aes-256-cbc";
		this.cryptoKey = Buffer.from(
			createHash("sha256").update(this.options.secret).digest("base64"),
			"base64",
		);
		this.verifier = new MessageVerifier(this.options.secret);
	}

	/**
	 * Validates the app secret
	 */
	private validateSecret() {
		if (typeof this.options.secret !== "string") {
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
		const iv = Buffer.from(ivString, "utf8");

		/**
		 * Creating chiper
		 */
		const cipher = createCipheriv(this.algorithm, this.cryptoKey, iv);
		const encrypted = Buffer.concat([
			cipher.update(new MessageBuilder().build(value, expiresAt, purpose)),
			cipher.final(),
		]);

		/**
		 * Concatenate `encrypted value` and `iv` by urlEncoding them. The concatenation is required
		 * to generate the HMAC, so that HMAC checks for integrity of both the `encrypted value`
		 * and the `iv`.
		 */
		const result = `${this.base64.urlEncode(encrypted)}${this.separator}${iv.toString("base64")}`;

		/**
		 * Returns the result + hmac
		 */
		return `${result}${this.separator}${new Hmac(
			Buffer.from(this.cryptoKey.toString("hex"), "hex"),
		).generate(result)}`;
	}

	/**
	 * Decrypt value and verify it against a purpose
	 */
	public decrypt<T = unknown>(value: string, purpose?: string): T | null {
		if (typeof value !== "string") {
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
		const encrypted = this.base64.urlDecode(encryptedEncoded, "base64");
		if (!encrypted) {
			return null;
		}

		/**
		 * Make sure we are able to urlDecode the iv
		 */
		let ivWord: Buffer;
		try {
			ivWord = Buffer.from(ivEncoded, "base64");
		} catch (error) {
			return null;
		}

		if (ivWord.length !== 16) {
			return null;
		}

		/**
		 * Make sure the hash is correct, it means the first 2 parts of the
		 * string are not tampered.
		 */
		const isValidHmac = new Hmac(
			Buffer.from(this.cryptoKey.toString("hex"), "hex"),
		).compare(`${encryptedEncoded}${this.separator}${ivEncoded}`, hash);

		if (!isValidHmac) {
			return null;
		}

		/**
		 * The Decipher can raise exceptions with malformed input, so we wrap it
		 * to avoid leaking sensitive information
		 */
		try {
			const decipher = createDecipheriv(this.algorithm, this.cryptoKey, ivWord);
			const decrypted = Buffer.concat([
				decipher.update(Buffer.from(encrypted, "base64")),
				decipher.final(),
			]);
			const parsed: T | null = new MessageBuilder().verify(
				decrypted.toString("utf8"),
				purpose,
			);

			return parsed;
		} catch (error) {
			return null;
		}
	}
}
