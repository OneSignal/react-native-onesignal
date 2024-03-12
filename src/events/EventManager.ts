import {
  EmitterSubscription,
  NativeEventEmitter,
  NativeModule,
} from 'react-native';
import NotificationWillDisplayEvent from './NotificationWillDisplayEvent';
import {
  PERMISSION_CHANGED,
  SUBSCRIPTION_CHANGED,
  USER_STATE_CHANGED,
  NOTIFICATION_WILL_DISPLAY,
  NOTIFICATION_CLICKED,
  IN_APP_MESSAGE_CLICKED,
  IN_APP_MESSAGE_WILL_DISPLAY,
  IN_APP_MESSAGE_WILL_DISMISS,
  IN_APP_MESSAGE_DID_DISMISS,
  IN_APP_MESSAGE_DID_DISPLAY,
} from './events';
import OSNotification from '../OSNotification';

const eventList = [
  PERMISSION_CHANGED,
  SUBSCRIPTION_CHANGED,
  USER_STATE_CHANGED,
  NOTIFICATION_WILL_DISPLAY,
  NOTIFICATION_CLICKED,
  IN_APP_MESSAGE_CLICKED,
  IN_APP_MESSAGE_WILL_DISPLAY,
  IN_APP_MESSAGE_WILL_DISMISS,
  IN_APP_MESSAGE_DID_DISMISS,
  IN_APP_MESSAGE_DID_DISPLAY,
];

export default class EventManager {
  private RNOneSignal: NativeModule;
  private oneSignalEventEmitter: NativeEventEmitter;
  private eventListenerArrayMap: Map<string, Array<(event: any) => void>>;
  private listeners: { [key: string]: EmitterSubscription };

  constructor(RNOneSignal: NativeModule) {
    this.RNOneSignal = RNOneSignal;
    this.oneSignalEventEmitter = new NativeEventEmitter(RNOneSignal);
    this.eventListenerArrayMap = new Map(); // used for adders (multiple callbacks possible)
    this.listeners = {};
    this.setupListeners();
  }

  setupListeners() {
    // set up the event emitter and listeners
    if (this.RNOneSignal != null) {
      for (let i = 0; i < eventList.length; i++) {
        let eventName = eventList[i];
        this.listeners[eventName] = this.generateEventListener(eventName);
      }
    }
  }

  /**
   * Adds the event handler to the corresponding handler array on the JS side of the bridge
   * @param  {string} eventName
   * @param  {function} handler
   * @returns void
   */
  addEventListener<T>(eventName: string, handler: (event: T) => void) {
    let handlerArray = this.eventListenerArrayMap.get(eventName);
    handlerArray && handlerArray.length > 0
      ? handlerArray.push(handler)
      : this.eventListenerArrayMap.set(eventName, [handler]);
  }

  /**
   * clears the event handler(s) for the event name
   * @param  {string} eventName
   * @param  {function} handler
   * @returns void
   */
  removeEventListener(eventName: string, handler: any) {
    const handlerArray = this.eventListenerArrayMap.get(eventName);
    if (!handlerArray) {
      return;
    }
    const index = handlerArray.indexOf(handler);
    if (index !== -1) {
      handlerArray.splice(index, 1);
    }
    if (handlerArray.length === 0) {
      this.eventListenerArrayMap.delete(eventName);
    }
  }

  // returns an event listener with the js to native mapping
  generateEventListener(eventName: string): EmitterSubscription {
    const addListenerCallback = (payload: Object) => {
      let handlerArray = this.eventListenerArrayMap.get(eventName);
      if (handlerArray) {
        if (eventName === NOTIFICATION_WILL_DISPLAY) {
          handlerArray.forEach((handler) => {
            handler(
              new NotificationWillDisplayEvent(payload as OSNotification),
            );
          });
        } else if (eventName === PERMISSION_CHANGED) {
          const typedPayload = payload as { permission: boolean };
          handlerArray.forEach((handler) => {
            handler(typedPayload.permission);
          });
        } else {
          handlerArray.forEach((handler) => {
            handler(payload);
          });
        }
      }
    };

    return this.oneSignalEventEmitter.addListener(
      eventName,
      addListenerCallback,
    );
  }
}
