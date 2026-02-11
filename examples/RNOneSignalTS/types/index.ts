export interface KeyValuePair {
  key: string;
  value: string;
}

export interface AppState {
  aliases: KeyValuePair[];
  tags: KeyValuePair[];
  triggers: KeyValuePair[];
  emails: string[];
  smsNumbers: string[];
  pushSubscriptionId: string;
  pushEnabled: boolean;
  iamPaused: boolean;
  locationShared: boolean;
  consentGiven: boolean;
  externalUserId: string | null;
  isLoading: boolean;
  permissionGranted: boolean;
}

/**
 * User data returned from OneSignal REST API
 * GET /apps/{app_id}/users/by/onesignal_id/{onesignal_id}
 */
export interface UserData {
  aliases: KeyValuePair[];
  tags: KeyValuePair[];
  emails: string[];
  smsNumbers: string[];
  externalId: string | null;
}

export type AppAction =
  | { type: 'ADD_ALIAS'; payload: KeyValuePair }
  | { type: 'REMOVE_ALIAS'; payload: string }
  | { type: 'CLEAR_ALL_ALIASES' }
  | { type: 'SET_ALL_ALIASES'; payload: KeyValuePair[] }
  | { type: 'ADD_TAG'; payload: KeyValuePair }
  | { type: 'REMOVE_TAG'; payload: string }
  | { type: 'SET_ALL_TAGS'; payload: KeyValuePair[] }
  | { type: 'ADD_TRIGGER'; payload: KeyValuePair }
  | { type: 'REMOVE_TRIGGER'; payload: string }
  | { type: 'CLEAR_ALL_TRIGGERS' }
  | { type: 'ADD_EMAIL'; payload: string }
  | { type: 'REMOVE_EMAIL'; payload: string }
  | { type: 'SET_ALL_EMAILS'; payload: string[] }
  | { type: 'ADD_SMS'; payload: string }
  | { type: 'REMOVE_SMS'; payload: string }
  | { type: 'SET_ALL_SMS'; payload: string[] }
  | { type: 'SET_PUSH_SUBSCRIPTION_ID'; payload: string }
  | { type: 'SET_PUSH_ENABLED'; payload: boolean }
  | { type: 'SET_IAM_PAUSED'; payload: boolean }
  | { type: 'SET_LOCATION_SHARED'; payload: boolean }
  | { type: 'SET_CONSENT_GIVEN'; payload: boolean }
  | { type: 'SET_EXTERNAL_USER_ID'; payload: string | null }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_PERMISSION_GRANTED'; payload: boolean };
