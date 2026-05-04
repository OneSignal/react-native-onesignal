import invariant from 'invariant';

import { IOS_NULL_SENTINEL } from './constants/internal';

export function isValidCallback(handler: Function) {
  invariant(typeof handler === 'function', 'Must provide a valid callback');
}

export function isNativeModuleLoaded(module: object | null | undefined): boolean {
  if (module == null) {
    console.error(
      'Could not load RNOneSignal native module. Make sure native dependencies are properly linked.',
    );

    return false;
  }

  return true;
}

/**
 * Returns true if the value is a JSON-serializable object.
 */
export function isObjectSerializable(value: unknown): boolean {
  if (!(typeof value === 'object' && value !== null && !Array.isArray(value))) {
    return false;
  }
  try {
    JSON.stringify(value);
    return true;
  } catch {
    return false;
  }
}

/**
 * Returns a structurally-identical clone of `value` with every `null` replaced
 * by `IOS_NULL_SENTINEL`. Used to round-trip `null` values across the React
 * Native iOS TurboModule bridge, which otherwise drops `null` dictionary
 * values. See SDK-4386.
 */
export function encodeNullsForIOS(value: Record<string, unknown>): Record<string, unknown>;
export function encodeNullsForIOS(value: unknown): unknown;
export function encodeNullsForIOS(value: unknown): unknown {
  if (value === null) {
    return IOS_NULL_SENTINEL;
  }
  if (Array.isArray(value)) {
    return value.map((item) => encodeNullsForIOS(item));
  }
  if (typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) {
      out[k] = encodeNullsForIOS(v);
    }
    return out;
  }
  return value;
}
