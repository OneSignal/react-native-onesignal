export interface PushSubscriptionState {
  id?: string;
  token?: string;
  optedIn: boolean;
}

export interface PushSubscriptionChangedState {
  previous: PushSubscriptionState;
  current: PushSubscriptionState;
}
