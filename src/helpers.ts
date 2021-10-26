import invariant from 'invariant';
import {
    PERMISSION_CHANGED,
    SUBSCRIPTION_CHANGED,
    EMAIL_SUBSCRIPTION_CHANGED,
    SMS_SUBSCRIPTION_CHANGED
} from './events';

export function isValidCallback(handler: any) { // type will be checked in this method
    invariant(
        typeof handler === 'function',
        'Must provide a valid callback'
    );
}

export function isObjectNonNull(object: any) {
  return object != null;
}

/**
 * Returns whether the handler associated with the event name can have multiple instances set
 * @param  {String} eventName
 */
export function isMultipleInstancesPossible(eventName: string) {
    switch(eventName){
        case PERMISSION_CHANGED:
        case SUBSCRIPTION_CHANGED:
        case EMAIL_SUBSCRIPTION_CHANGED:
        case SMS_SUBSCRIPTION_CHANGED:
            return true;
        default:
            return false;
    }
}
