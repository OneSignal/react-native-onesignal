export interface OneSignalUserProfile {
  email?: string;
  sms?: string;
  tags?: Record<string, string>;
  aliases?: Record<string, string>;
}

export type OneSignalErrorCode =
  | 'BACKEND_ERROR'
  | 'INVALID_ARGUMENT'
  | 'NOT_INITIALIZED'
  | 'STORAGE_LOCKED'
  | 'UNKNOWN';

export interface OneSignalErrorDetail {
  code: OneSignalErrorCode;
  source: 'CLIENT' | 'BACKEND';
  backendCode: string | null;
  httpStatus: number | null;
  message: string;
  meta: Record<string, unknown> | null;
}

export interface LoginData {
  onesignalId: string;
  externalId: string;
  emailSubscriptionId?: string;
  smsSubscriptionId?: string;
}

export interface OneSignalResult<T> {
  success: boolean;
  data: T | null;
  error: OneSignalErrorDetail[] | null;
}
