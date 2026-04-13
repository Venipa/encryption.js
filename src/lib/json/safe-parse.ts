import type { JSONReviver } from '@/lib/json/type';
import { parse } from 'secure-json-parse';

/**
 * A drop-in replacement for JSON.parse with prototype poisoning protection.
 */
export function safeParse(jsonString: string, reviver?: JSONReviver): any {
  return parse(jsonString, reviver, {
    protoAction: 'remove',
    constructorAction: 'remove',
  });
}
