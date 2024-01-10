export interface UserState {
  externalId: string;
  onesignalId: string;
}

export interface UserChangedState {
  previous: UserState;
  current: UserState;
}
