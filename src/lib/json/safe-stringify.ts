import type { JSONReplacer } from '@/lib/json/type';
import { configure } from 'safe-stable-stringify';

const stringify = configure({
  bigint: false,
  circularValue: undefined,
  deterministic: false,
});

/**
 * Replacer to handle custom data types.
 *
 * - Bigints are converted to string
 */
function jsonStringifyReplacer(replacer?: JSONReplacer): JSONReplacer {
  return function (key, value) {
    const val = replacer ? replacer.call(this, key, value) : value;

    if (typeof val === 'bigint') {
      return val.toString();
    }

    return val;
  };
}

/**
 * String Javascript values to a JSON string. Handles circular
 * references and bigints
 */
export function safeStringify(value: any, replacer?: JSONReplacer, space?: string | number): string | undefined {
  return stringify(value, jsonStringifyReplacer(replacer), space);
}
