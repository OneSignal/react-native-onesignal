import invariant from 'invariant';
import { NativeModule } from 'react-native';
import {
  PERMISSION_CHANGED,
  SUBSCRIPTION_CHANGED,
  EMAIL_SUBSCRIPTION_CHANGED,
  SMS_SUBSCRIPTION_CHANGED,
} from './events/events';

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
 * Returns whether the handler associated with the event name can have multiple instances set
 * @param  {String} eventName
 */
export function isMultipleInstancesPossible(eventName: string) {
  switch (eventName) {
    case PERMISSION_CHANGED:
    case SUBSCRIPTION_CHANGED:
    case EMAIL_SUBSCRIPTION_CHANGED:
    case SMS_SUBSCRIPTION_CHANGED:
      return true;
    default:
      return false;
  }
}
