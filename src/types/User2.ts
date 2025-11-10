export interface UserState {
  externalId?: string;
  onesignalId?: string;
}

export interface UserChangedState {
  current: UserState;
}
