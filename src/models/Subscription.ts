// 0 = NotDetermined, 1 = Denied, 2 = Authorized, 3 = Provisional, 4 = Ephemeral
export type IosPermissionStatus = 0 | 1 | 2 | 3 | 4;

export interface PushSubscription {
  id: string;
  token: string;
  optedIn: boolean;
}
