import { REST_API_KEY as ENV_REST_API_KEY } from '@env';

export const APP_ID = '77e32082-ea27-42e3-a898-c72e141824ef';

// WARNING: Storing API keys in client code is NOT SAFE for production.
// In production apps, make API calls from your backend server.
// This is for demo purposes only.
export const REST_API_KEY = ENV_REST_API_KEY || '';
export const ONESIGNAL_API_URL = 'https://onesignal.com/api/v1/notifications';
