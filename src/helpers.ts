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

export function isMissing(value: unknown, api: string): boolean {
  if (typeof value === 'string' && value.length > 0) return false;
  console.error(`OneSignal: ${api} is required`);
  return true;
}

export function isObject(value: unknown, api: string): value is Record<string, unknown> {
  if (typeof value === 'object' && value !== null && !Array.isArray(value)) return true;
  console.error(`OneSignal: ${api} must be an object`);
  return false;
}

export function isFunction(value: unknown, api: string): value is Function {
  if (typeof value === 'function') return true;
  console.error(`OneSignal: ${api} must be a function`);
  return false;
}

export function hasMissingEntries(
  values: Record<string, unknown> | null | undefined,
  api: string,
  allowEmptyValue = false,
): boolean {
  if (typeof values !== 'object' || values === null || Array.isArray(values)) {
    console.error(`OneSignal: ${api}: argument must be an object`);
    return true;
  }
  return Object.entries(values).some(([key, item]) => {
    if (isMissing(key, `${api}: key`)) return true;
    if (!allowEmptyValue) return isMissing(item, `${api}: value`);
    return item == null && isMissing(item, `${api}: value`);
  });
}

export function hasMissingItems(values: unknown, api: string, item: string): boolean {
  if (!Array.isArray(values)) {
    console.error(`OneSignal: ${api}: ${item}s must be an array of strings`);
    return true;
  }
  return values.some((value) => isMissing(value, `${api}: ${item}`));
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
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, encodeNullsForIOS(item)]),
    );
  }
  return value;
}
