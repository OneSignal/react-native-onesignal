import {
  type EmitterSubscription,
  NativeEventEmitter,
  type NativeModule,
} from 'react-native';
import {
  IN_APP_MESSAGE_CLICKED,
  IN_APP_MESSAGE_DID_DISMISS,
  IN_APP_MESSAGE_DID_DISPLAY,
  IN_APP_MESSAGE_WILL_DISMISS,
  IN_APP_MESSAGE_WILL_DISPLAY,
  NOTIFICATION_CLICKED,
  NOTIFICATION_WILL_DISPLAY,
  PERMISSION_CHANGED,
  SUBSCRIPTION_CHANGED,
  USER_STATE_CHANGED,
} from '../constants/events';
import OSNotification from '../OSNotification';
import type {
  InAppMessageClickEvent,
  InAppMessageDidDismissEvent,
  InAppMessageDidDisplayEvent,
  InAppMessageWillDismissEvent,
  InAppMessageWillDisplayEvent,
} from '../types/inAppMessage';
import type { NotificationClickEvent } from '../types/notificationEvents';
import type { PushSubscriptionChangedState } from '../types/subscription';
import type { UserChangedState } from '../types/user';
import NotificationWillDisplayEvent from './NotificationWillDisplayEvent';

export interface EventListenerMap {
  [PERMISSION_CHANGED]: (event: boolean) => void;
  [SUBSCRIPTION_CHANGED]: (event: PushSubscriptionChangedState) => void;
  [USER_STATE_CHANGED]: (event: UserChangedState) => void;
  [NOTIFICATION_WILL_DISPLAY]: (event: NotificationWillDisplayEvent) => void;
  [NOTIFICATION_CLICKED]: (event: NotificationClickEvent) => void;
  [IN_APP_MESSAGE_CLICKED]: (event: InAppMessageClickEvent) => void;
  [IN_APP_MESSAGE_WILL_DISPLAY]: (event: InAppMessageWillDisplayEvent) => void;
  [IN_APP_MESSAGE_WILL_DISMISS]: (event: InAppMessageWillDismissEvent) => void;
  [IN_APP_MESSAGE_DID_DISMISS]: (event: InAppMessageDidDismissEvent) => void;
  [IN_APP_MESSAGE_DID_DISPLAY]: (event: InAppMessageDidDisplayEvent) => void;
}

// Internal event listeners that connect to the native modules then get
// transformed (via generateEventListener) into the EventListenerMap types
type RawNotificationOverrides = {
  [PERMISSION_CHANGED]: (payload: { permission: boolean }) => void;
  [NOTIFICATION_WILL_DISPLAY]: (payload: OSNotification) => void;
};
export type RawEventListenerMap = Omit<
  EventListenerMap,
  keyof RawNotificationOverrides
> &
  RawNotificationOverrides;

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
] as const;

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
  addEventListener<K extends keyof EventListenerMap>(
    eventName: K,
    handler: EventListenerMap[K],
  ) {
    let handlerArray = this.eventListenerArrayMap.get(eventName);
    if (handlerArray && handlerArray.length > 0) {
      handlerArray.push(handler);
    } else {
      this.eventListenerArrayMap.set(eventName, [handler]);
    }
  }

  /**
   * clears the event handler(s) for the event name
   * @param  {string} eventName
   * @param  {function} handler
   * @returns void
   */
  removeEventListener<K extends keyof EventListenerMap>(
    eventName: K,
    handler: EventListenerMap[K],
  ) {
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
  generateEventListener<K extends keyof RawEventListenerMap>(
    eventName: K,
  ): EmitterSubscription {
    const addListenerCallback: RawEventListenerMap[K] = (payload: unknown) => {
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
            handler(payload as EventListenerMap[K]);
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
