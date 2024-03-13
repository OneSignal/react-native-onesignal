import invariant from 'invariant';
import { NativeModule } from 'react-native';

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
