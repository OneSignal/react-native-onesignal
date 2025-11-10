import OSNotification from '../OSNotification';
import type { EventListenerMap } from '../events/EventManager';

export type NotificationEventName =
  | 'click'
  | 'foregroundWillDisplay'
  | 'permissionChange';

export type NotificationListeners =
  | ['click', EventListenerMap['OneSignal-notificationClicked']]
  | [
      'foregroundWillDisplay',
      EventListenerMap['OneSignal-notificationWillDisplayInForeground'],
    ]
  | ['permissionChange', EventListenerMap['OneSignal-permissionChanged']];

export interface NotificationClickEvent {
  result: NotificationClickResult;
  notification: OSNotification;
}

export interface NotificationClickResult {
  actionId?: string;
  url?: string;
}
