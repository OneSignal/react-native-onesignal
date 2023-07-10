import {
  EmitterSubscription,
  NativeEventEmitter,
  NativeModule,
} from 'react-native';
import NotificationWillDisplayEvent from './NotificationWillDisplayEvent';
import { isMultipleInstancesPossible } from '../helpers';
import {
  PERMISSION_CHANGED,
  SUBSCRIPTION_CHANGED,
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
  private eventHandlerMap: Map<string, (event: any) => void>;
  private eventHandlerArrayMap: Map<string, Array<(event: any) => void>>;
  private listeners: { [key: string]: EmitterSubscription };

  constructor(RNOneSignal: NativeModule) {
    this.RNOneSignal = RNOneSignal;
    this.oneSignalEventEmitter = new NativeEventEmitter(RNOneSignal);
    this.eventHandlerMap = new Map(); // used for setters (single replaceable callback)
    this.eventHandlerArrayMap = new Map(); // used for adders (multiple callbacks possible)
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

  // clear handlers
  clearHandlers() {
    this.eventHandlerMap = new Map();
    this.eventHandlerArrayMap = new Map();
  }

  /**
   * Sets the event handler on the JS side of the bridge
   * Supports only one handler at a time
   * @param  {string} eventName
   * @param  {function} handler
   * @returns void
   */
  setEventHandler<T>(eventName: string, handler: (event: T) => void) {
    this.eventHandlerMap.set(eventName, handler);
  }

  /**
   * Adds the event handler to the corresponding handler array on the JS side of the bridge
   * @param  {string} eventName
   * @param  {function} handler
   * @returns void
   */
  addEventHandler<T>(eventName: string, handler: (event: T) => void) {
    let handlerArray = this.eventHandlerArrayMap.get(eventName);
    handlerArray && handlerArray.length > 0
      ? handlerArray.push(handler)
      : this.eventHandlerArrayMap.set(eventName, [handler]);
  }

  /**
   * clears the event handler(s) for the event name
   * @param  {string} eventName
   * @param  {function} handler
   * @returns void
   */
  clearEventHandler(eventName: string, handler: any) {
    const handlerArray = this.eventHandlerArrayMap.get(eventName);
    if (!handlerArray) {
      return;
    }
    const index = handlerArray.indexOf(handler);
    if (index !== -1) {
      handlerArray.splice(index, 1);
    }
    if (handlerArray.length === 0) {
      this.eventHandlerArrayMap.delete(eventName);
    }
  }

  // returns an event listener with the js to native mapping
  generateEventListener(eventName: string): EmitterSubscription {
    const addListenerCallback = (payload: Object) => {
      if (isMultipleInstancesPossible(eventName)) {
        // used for adders
        let handlerArray = this.eventHandlerArrayMap.get(eventName);
        if (handlerArray) {
          handlerArray.forEach((handler) => {
            handler(payload);
          });
        }
      } else {
        // used for setters
        let handler = this.eventHandlerMap.get(eventName);
        payload = this.getFinalPayload(eventName, payload);

        // Check if we have added listener for this type yet
        if (handler) {
          handler(payload);
        }
      }
    };

    return this.oneSignalEventEmitter.addListener(
      eventName,
      addListenerCallback,
    );
  }

  getFinalPayload(eventName: string, payload: Object): Object {
    switch (eventName) {
      case NOTIFICATION_WILL_DISPLAY:
        return new NotificationWillDisplayEvent(payload as OSNotification);
      default:
        return payload;
    }
  }
}
