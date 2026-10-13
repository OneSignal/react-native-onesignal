import type {
  LoginData,
  OneSignalErrorCode,
  OneSignalErrorDetail,
  OneSignalResult,
} from './types/login';

const ERROR_CODES: readonly OneSignalErrorCode[] = [
  'BACKEND_ERROR',
  'INVALID_ARGUMENT',
  'NOT_INITIALIZED',
  'STORAGE_LOCKED',
  'UNKNOWN',
];

export const IOS_UNSUPPORTED_MESSAGE = 'loginWithProfile is only supported on Android';

function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function asString(value: unknown): string | null {
  return typeof value === 'string' ? value : null;
}

const CLIENT_ERROR: OneSignalErrorDetail = {
  code: 'UNKNOWN',
  source: 'CLIENT',
  backendCode: null,
  httpStatus: null,
  message: '',
  meta: null,
};

export function loginFailure(
  message: string,
  code: OneSignalErrorCode = 'UNKNOWN',
): OneSignalResult<LoginData> {
  return { success: false, data: null, error: [{ ...CLIENT_ERROR, code, message }] };
}

function parseErrorDetail(value: unknown): OneSignalErrorDetail {
  const raw = asRecord(value);
  if (!raw) return { ...CLIENT_ERROR, message: 'Malformed error entry' };

  const code = asString(raw.code);
  return {
    code:
      code && ERROR_CODES.includes(code as OneSignalErrorCode)
        ? (code as OneSignalErrorCode)
        : 'UNKNOWN',
    source: raw.source === 'BACKEND' ? 'BACKEND' : 'CLIENT',
    backendCode: asString(raw.backendCode),
    httpStatus: Number.isInteger(raw.httpStatus) ? (raw.httpStatus as number) : null,
    message: asString(raw.message) ?? '',
    meta: asRecord(raw.meta),
  };
}

function parseLoginData(value: unknown): LoginData | null {
  const raw = asRecord(value);
  const onesignalId = asString(raw?.onesignalId);
  const externalId = asString(raw?.externalId);
  if (!raw || !onesignalId || !externalId) return null;

  const data: LoginData = { onesignalId, externalId };
  const emailSubscriptionId = asString(raw.emailSubscriptionId);
  const smsSubscriptionId = asString(raw.smsSubscriptionId);
  if (emailSubscriptionId) data.emailSubscriptionId = emailSubscriptionId;
  if (smsSubscriptionId) data.smsSubscriptionId = smsSubscriptionId;
  return data;
}

// The iOS bridge drops null dictionary values, so absent keys are read as null.
export function parseLoginResult(value: unknown): OneSignalResult<LoginData> {
  const raw = asRecord(value);
  if (!raw || typeof raw.success !== 'boolean') {
    return loginFailure('Malformed loginWithProfile result');
  }

  if (raw.success) {
    const data = parseLoginData(raw.data);
    if (!data) return loginFailure('Malformed loginWithProfile data');
    return { success: true, data, error: null };
  }

  if (!Array.isArray(raw.error) || raw.error.length === 0) {
    return loginFailure('loginWithProfile failed without error details');
  }
  return { success: false, data: null, error: raw.error.map(parseErrorDetail) };
}
