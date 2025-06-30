export class Exception extends Error {
  /**
   * Static properties to defined on the exception once
   * and then re-use them
   */
  declare static help?: string;
  declare static code?: string;
  declare static status?: number;
  declare static message?: string;

  /**
   * Name of the class that raised the exception.
   */
  name: string;

  /**
   * Optional help description for the error. You can use it to define additional
   * human readable information for the error.
   */
  declare help?: string;

  /**
   * A machine readable error code. This will allow the error handling logic
   * to narrow down exceptions based upon the error code.
   */
  declare code?: string;

  /**
   * A status code for the error. Usually helpful when converting errors
   * to HTTP responses.
   */
  status: number;

  constructor(message?: string, options?: ErrorOptions & { code?: string; status?: number }) {
    super(message, options);

    const ErrorConstructor = this.constructor as typeof Exception;

    this.name = ErrorConstructor.name;
    this.message = message || ErrorConstructor.message || '';
    this.status = options?.status || ErrorConstructor.status || 500;

    const code = options?.code || ErrorConstructor.code;
    if (code !== undefined) {
      this.code = code;
    }

    const help = ErrorConstructor.help;
    if (help !== undefined) {
      this.help = help;
    }
  }

  get [Symbol.toStringTag]() {
    return this.constructor.name;
  }

  toString() {
    if (this.code) {
      return `${this.name} [${this.code}]: ${this.message}`;
    }
    return `${this.name}: ${this.message}`;
  }
}

/**
 * Helper to create anonymous error classes
 */
export function createError<T extends any[] = never>(
  message: string,
  code: string,
  status?: number,
): typeof Exception & T extends never
  ? { new (args?: any, options?: ErrorOptions): Exception }
  : { new (args: T, options?: ErrorOptions): Exception } {
  return class extends Exception {
    static message = message;
    static code = code;
    static status = status;

    constructor(args: T, options?: ErrorOptions) {
      console.log;
      super([message, ...args].join(' '), options);
      this.name = 'Exception';
    }
  };
}
