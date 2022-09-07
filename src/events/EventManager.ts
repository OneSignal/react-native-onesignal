import {
  EmitterSubscription,
  NativeEventEmitter,
  NativeModule,
} from 'react-native';
import NotificationReceivedEvent from './NotificationReceivedEvent';
import { isMultipleInstancesPossible } from '../helpers';
import {
  PERMISSION_CHANGED,
  SUBSCRIPTION_CHANGED,
  NOTIFICATION_WILL_SHOW,
  NOTIFICATION_OPENED,
  IN_APP_MESSAGE_CLICKED,
  EMAIL_SUBSCRIPTION_CHANGED,
  SMS_SUBSCRIPTION_CHANGED,
  IN_APP_MESSAGE_WILL_DISPLAY,
  IN_APP_MESSAGE_WILL_DISMISS,
  IN_APP_MESSAGE_DID_DISMISS,
  IN_APP_MESSAGE_DID_DISPLAY,
} from './events';
import { ChangeEvent } from '../models/Subscription';
import OSNotification from '../OSNotification';

const eventList = [
  PERMISSION_CHANGED,
  SUBSCRIPTION_CHANGED,
  NOTIFICATION_WILL_SHOW,
  NOTIFICATION_OPENED,
  IN_APP_MESSAGE_CLICKED,
  EMAIL_SUBSCRIPTION_CHANGED,
  SMS_SUBSCRIPTION_CHANGED,
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
    this.eventHandlerMap = new Map(); // used for setters (single replacable callback)
    this.eventHandlerArrayMap = new Map(); // used for adders (multiple callbacks possible)
    this.listeners = {};
    this.setupListeners();
  }

  setupListeners(): void {
    // set up the event emitter and listeners
    if (this.RNOneSignal != null) {
      for (let i = 0; i < eventList.length; i++) {
        let eventName = eventList[i];
        this.listeners[eventName] = this.generateEventListener(eventName);
      }
    }
  }

  // clear handlers
  clearHandlers(): void {
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
  setEventHandler<T>(eventName: string, handler: (event: T) => void): void {
    this.eventHandlerMap.set(eventName, handler);
  }

  /**
   * Adds the event handler to the corresponding handler array on the JS side of the bridge
   * @param  {string} eventName
   * @param  {function} handler
   * @returns void
   */
  addEventHandler<T>(
    eventName: string,
    handler: (event: ChangeEvent<T>) => void,
  ): void {
    let handlerArray = this.eventHandlerArrayMap.get(eventName);
    handlerArray && handlerArray.length > 0
      ? handlerArray.push(handler)
      : this.eventHandlerArrayMap.set(eventName, [handler]);
  }

  /**
   * clears the event handler(s) for the event name
   * @param  {string} eventName
   * @returns void
   */
  clearEventHandler(eventName: string): void {
    this.eventHandlerArrayMap.delete(eventName);
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
      case NOTIFICATION_WILL_SHOW:
        return new NotificationReceivedEvent(payload as OSNotification);
      default:
        return payload;
    }
  }
}
