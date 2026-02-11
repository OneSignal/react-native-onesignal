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
}

export type AppAction =
  | { type: 'ADD_ALIAS'; payload: KeyValuePair }
  | { type: 'REMOVE_ALIAS'; payload: string }
  | { type: 'ADD_TAG'; payload: KeyValuePair }
  | { type: 'REMOVE_TAG'; payload: string }
  | { type: 'ADD_TRIGGER'; payload: KeyValuePair }
  | { type: 'REMOVE_TRIGGER'; payload: string }
  | { type: 'ADD_EMAIL'; payload: string }
  | { type: 'REMOVE_EMAIL'; payload: string }
  | { type: 'ADD_SMS'; payload: string }
  | { type: 'REMOVE_SMS'; payload: string }
  | { type: 'SET_PUSH_SUBSCRIPTION_ID'; payload: string }
  | { type: 'SET_PUSH_ENABLED'; payload: boolean }
  | { type: 'SET_IAM_PAUSED'; payload: boolean }
  | { type: 'SET_LOCATION_SHARED'; payload: boolean }
  | { type: 'SET_CONSENT_GIVEN'; payload: boolean };
