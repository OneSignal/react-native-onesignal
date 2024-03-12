export enum OSNotificationPermission {
  NotDetermined = 0,
  Denied,
  Authorized,
  Provisional, // only available in iOS 12
  Ephemeral, // only available in iOS 14
}

export interface PushSubscriptionState {
  id?: string;
  token?: string;
  optedIn: boolean;
}

export interface PushSubscriptionChangedState {
  previous: PushSubscriptionState;
  current: PushSubscriptionState;
}
