import type { EventSubscription } from 'react-native';
import type { Spec } from '../NativeOneSignal';
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

export default class EventManager {
  private RNOneSignal: Spec;
  private eventListenerArrayMap: Map<string, Array<(event: unknown) => void>>;
  private nativeSubscriptions: EventSubscription[];

  constructor(RNOneSignal: Spec) {
    this.RNOneSignal = RNOneSignal;
    this.eventListenerArrayMap = new Map();
    this.nativeSubscriptions = [];
    this.setupListeners();
  }

  setupListeners() {
    if (this.RNOneSignal == null) return;

    this.nativeSubscriptions.push(
      this.RNOneSignal.onPermissionChanged((payload) => {
        const typed = payload as { permission: boolean };
        this.dispatchHandlers(PERMISSION_CHANGED, typed.permission);
      }),
      this.RNOneSignal.onSubscriptionChanged((payload) => {
        this.dispatchHandlers(SUBSCRIPTION_CHANGED, payload);
      }),
      this.RNOneSignal.onUserStateChanged((payload) => {
        this.dispatchHandlers(USER_STATE_CHANGED, payload);
      }),
      this.RNOneSignal.onNotificationWillDisplay((payload) => {
        this.dispatchHandlers(
          NOTIFICATION_WILL_DISPLAY,
          new NotificationWillDisplayEvent(payload as OSNotification),
        );
      }),
      this.RNOneSignal.onNotificationClicked((payload) => {
        this.dispatchHandlers(NOTIFICATION_CLICKED, payload);
      }),
      this.RNOneSignal.onInAppMessageClicked((payload) => {
        this.dispatchHandlers(IN_APP_MESSAGE_CLICKED, payload);
      }),
      this.RNOneSignal.onInAppMessageWillDisplay((payload) => {
        this.dispatchHandlers(IN_APP_MESSAGE_WILL_DISPLAY, payload);
      }),
      this.RNOneSignal.onInAppMessageDidDisplay((payload) => {
        this.dispatchHandlers(IN_APP_MESSAGE_DID_DISPLAY, payload);
      }),
      this.RNOneSignal.onInAppMessageWillDismiss((payload) => {
        this.dispatchHandlers(IN_APP_MESSAGE_WILL_DISMISS, payload);
      }),
      this.RNOneSignal.onInAppMessageDidDismiss((payload) => {
        this.dispatchHandlers(IN_APP_MESSAGE_DID_DISMISS, payload);
      }),
    );
  }

  addEventListener<K extends keyof EventListenerMap>(
    eventName: K,
    handler: EventListenerMap[K],
  ) {
    const handlerArray = this.eventListenerArrayMap.get(eventName);
    if (handlerArray && handlerArray.length > 0) {
      handlerArray.push(handler as (event: unknown) => void);
    } else {
      this.eventListenerArrayMap.set(eventName, [
        handler as (event: unknown) => void,
      ]);
    }
  }

  removeEventListener<K extends keyof EventListenerMap>(
    eventName: K,
    handler: EventListenerMap[K],
  ) {
    const handlerArray = this.eventListenerArrayMap.get(eventName);
    if (!handlerArray) {
      return;
    }
    const index = handlerArray.indexOf(handler as (event: unknown) => void);
    if (index !== -1) {
      handlerArray.splice(index, 1);
    }
    if (handlerArray.length === 0) {
      this.eventListenerArrayMap.delete(eventName);
    }
  }

  private dispatchHandlers(eventName: string, payload: unknown) {
    const handlerArray = this.eventListenerArrayMap.get(eventName);
    if (handlerArray) {
      handlerArray.forEach((handler) => {
        handler(payload);
      });
    }
  }
}
