// 0 = NotDetermined, 1 = Denied, 2 = Authorized, 3 = Provisional, 4 = Ephemeral
export type IosPermissionStatus = 0 | 1 | 2 | 3 | 4;

export interface ChangeEvent<ObserverChangeEvent> {
  from: ObserverChangeEvent;
  to: ObserverChangeEvent;
}

export type ObserverChangeEvent = PermissionChange | SubscriptionChange;

export interface PermissionChange {
  status?: IosPermissionStatus; // ios
  hasPrompted?: boolean; // ios
  provisional?: boolean; // ios
  areNotificationsEnabled?: boolean; // android
}

export interface SubscriptionChange {
  userId?: string;
  pushToken?: string;
  isSubscribed: boolean;
  isPushDisabled: boolean;
}
