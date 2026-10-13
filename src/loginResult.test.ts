import { describe, expect, test } from 'vite-plus/test';

import { IOS_UNSUPPORTED_MESSAGE, loginFailure, parseLoginResult } from './loginResult';

const unknownFailure = (message: string) => ({
  success: false,
  data: null,
  error: [
    {
      code: 'UNKNOWN',
      source: 'CLIENT',
      backendCode: null,
      httpStatus: null,
      message,
      meta: null,
    },
  ],
});

describe('loginFailure', () => {
  test('defaults to an UNKNOWN client error', () => {
    expect(loginFailure('boom')).toEqual(unknownFailure('boom'));
  });

  test('uses the given code', () => {
    expect(loginFailure('bad', 'INVALID_ARGUMENT').error?.[0].code).toBe('INVALID_ARGUMENT');
  });
});

describe('parseLoginResult', () => {
  test('parses a success envelope', () => {
    const result = parseLoginResult({
      success: true,
      data: {
        onesignalId: 'os-id',
        externalId: 'ext-id',
        emailSubscriptionId: 'email-sub',
        smsSubscriptionId: 'sms-sub',
      },
      error: null,
    });
    expect(result).toEqual({
      success: true,
      data: {
        onesignalId: 'os-id',
        externalId: 'ext-id',
        emailSubscriptionId: 'email-sub',
        smsSubscriptionId: 'sms-sub',
      },
      error: null,
    });
  });

  test('omits optional subscription ids that are null or missing', () => {
    const result = parseLoginResult({
      success: true,
      data: { onesignalId: 'os-id', externalId: 'ext-id', emailSubscriptionId: null },
    });
    expect(result.data).toEqual({ onesignalId: 'os-id', externalId: 'ext-id' });
  });

  test('parses a backend failure envelope', () => {
    const result = parseLoginResult({
      success: false,
      data: null,
      error: [
        {
          code: 'BACKEND_ERROR',
          source: 'BACKEND',
          backendCode: 'user-conflict',
          httpStatus: 409,
          message: 'Conflict',
          meta: { field: 'email' },
        },
      ],
    });
    expect(result).toEqual({
      success: false,
      data: null,
      error: [
        {
          code: 'BACKEND_ERROR',
          source: 'BACKEND',
          backendCode: 'user-conflict',
          httpStatus: 409,
          message: 'Conflict',
          meta: { field: 'email' },
        },
      ],
    });
  });

  test('treats missing keys in an error entry as null', () => {
    const result = parseLoginResult({
      success: false,
      error: [{ code: 'STORAGE_LOCKED', source: 'CLIENT', message: 'locked' }],
    });
    expect(result.error).toEqual([
      {
        code: 'STORAGE_LOCKED',
        source: 'CLIENT',
        backendCode: null,
        httpStatus: null,
        message: 'locked',
        meta: null,
      },
    ]);
  });

  test('parses the iOS envelope with nulls dropped by the bridge', () => {
    const result = parseLoginResult({
      success: false,
      error: [{ code: 'UNKNOWN', source: 'CLIENT', message: IOS_UNSUPPORTED_MESSAGE }],
    });
    expect(result).toEqual(unknownFailure(IOS_UNSUPPORTED_MESSAGE));
  });

  test('normalizes wrongly typed error fields', () => {
    const result = parseLoginResult({
      success: false,
      error: [
        {
          code: 'NOT_A_CODE',
          source: 'ELSEWHERE',
          backendCode: 42,
          httpStatus: 4.5,
          message: 7,
          meta: ['x'],
        },
        'not-an-object',
      ],
    });
    expect(result.error).toEqual([
      {
        code: 'UNKNOWN',
        source: 'CLIENT',
        backendCode: null,
        httpStatus: null,
        message: '',
        meta: null,
      },
      unknownFailure('Malformed error entry').error[0],
    ]);
  });

  test.each([
    ['null', null],
    ['a string', 'success'],
    ['an array', []],
    ['a missing success flag', { data: null }],
    ['a non-boolean success flag', { success: 'true' }],
  ])('returns UNKNOWN failure for %s', (_label, value) => {
    expect(parseLoginResult(value)).toEqual(unknownFailure('Malformed loginWithProfile result'));
  });

  test.each([
    ['missing data', { success: true }],
    ['non-object data', { success: true, data: 'x' }],
    ['missing onesignalId', { success: true, data: { externalId: 'ext' } }],
    ['empty externalId', { success: true, data: { onesignalId: 'os', externalId: '' } }],
  ])('returns UNKNOWN failure for success with %s', (_label, value) => {
    expect(parseLoginResult(value)).toEqual(unknownFailure('Malformed loginWithProfile data'));
  });

  test.each([
    ['missing error', { success: false }],
    ['empty error list', { success: false, error: [] }],
    ['non-array error', { success: false, error: { code: 'UNKNOWN' } }],
  ])('returns UNKNOWN failure for failure with %s', (_label, value) => {
    expect(parseLoginResult(value)).toEqual(
      unknownFailure('loginWithProfile failed without error details'),
    );
  });
});
