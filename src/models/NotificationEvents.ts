import OSNotification from '../OSNotification';
import NotificationWillDisplayEvent from '../events/NotificationWillDisplayEvent';

export type NotificationEventName = "click" | "foregroundWillDisplay";

export type NotificationEventTypeMap = {
  click: NotificationClickedEvent;
  foregroundWillDisplay: NotificationWillDisplayEvent;
};

// 0 = NotificationClicked, 1 = ButtonClicked
export type ClickedEventActionType = 0 | 1;

export interface NotificationClickedEvent {
  action: ClickedEventAction;
  notification: OSNotification;
}

export interface ClickedEventAction {
  actionId ?: string;
  type: ClickedEventActionType;
}
