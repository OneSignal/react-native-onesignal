import invariant from 'invariant';
import type { NativeModule } from 'react-native';

export function isValidCallback(handler: Function) {
  invariant(typeof handler === 'function', 'Must provide a valid callback');
}

export function isNativeModuleLoaded(module: NativeModule): boolean {
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
