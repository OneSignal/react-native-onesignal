import OSNotification from '../OSNotification';
import NotificationWillDisplayEvent from '../events/NotificationWillDisplayEvent';

export type NotificationEventName =
  | 'click'
  | 'foregroundWillDisplay'
  | 'permissionChange';

export type NotificationEventTypeMap = {
  click: NotificationClickEvent;
  foregroundWillDisplay: NotificationWillDisplayEvent;
  permissionChange: boolean;
};

export interface NotificationClickEvent {
  result: NotificationClickResult;
  notification: OSNotification;
}

export interface NotificationClickResult {
  actionId?: string;
  url?: string;
}
