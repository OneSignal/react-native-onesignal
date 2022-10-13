import OSNotification from '../OSNotification';

// 0 = NotificationClicked, 1 = ButtonClicked
export type OpenedEventActionType = 0 | 1;

export interface OpenedEvent {
  action: OpenedEventAction;
  notification: OSNotification;
}

export interface OpenedEventAction {
  type: OpenedEventActionType;
}
