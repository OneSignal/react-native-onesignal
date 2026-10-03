import type { NativeModule } from 'react-native';
import { beforeEach, describe, expect, test, vi, type MockInstance } from 'vite-plus/test';

import { IOS_NULL_SENTINEL } from './constants/internal';
import {
  encodeNullsForIOS,
  hasMissingEntries,
  hasMissingItems,
  isBoolean,
  isInteger,
  isNativeModuleLoaded,
  isMissing,
  isObjectSerializable,
  isValidCallback,
} from './helpers';

describe('helpers', () => {
  let errorSpy: MockInstance;

  beforeEach(() => {
    errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  describe('isValidCallback', () => {
    test('should not throw when handler is a function', () => {
      const handler = () => {};
      expect(() => isValidCallback(handler)).not.toThrow();
    });

    test.each([
      { description: 'null', value: null },
      { description: 'undefined', value: undefined },
      { description: 'a string', value: 'not a function' },
      { description: 'a number', value: 123 },
      { description: 'an object', value: {} },
      { description: 'an array', value: [] },
      { description: 'a boolean', value: true },
    ])(
      'should throw invariant error when handler is $description',
      ({ value }: { description: string; value: unknown }) => {
        expect(() => isValidCallback(value as unknown as Function)).toThrow(
          'Must provide a valid callback',
        );
      },
    );
  });

  describe('isNativeModuleLoaded', () => {
    test.each([
      { description: 'null', value: null as unknown as NativeModule },
      {
        description: 'undefined',
        value: undefined as unknown as NativeModule,
      },
    ])(
      'should return false and log error when module is $description',
      ({ value }: { description: string; value: NativeModule }) => {
        const result = isNativeModuleLoaded(value);

        expect(result).toBe(false);
        expect(errorSpy).toHaveBeenCalledTimes(1);
        expect(errorSpy).toHaveBeenCalledWith(
          'Could not load RNOneSignal native module. Make sure native dependencies are properly linked.',
        );
      },
    );

    test('should return true when module is loaded', () => {
      const result = isNativeModuleLoaded({} as NativeModule);
      expect(result).toBe(true);
    });
  });

  describe('isBoolean', () => {
    test.each([true, false])('should accept %s', (value) => {
      expect(isBoolean(value, 'api: flag')).toBe(true);
      expect(errorSpy).not.toHaveBeenCalled();
    });

    test.each([undefined, null, 'true', 0, {}])('should reject %s', (value) => {
      expect(isBoolean(value, 'api: flag')).toBe(false);
      expect(errorSpy).toHaveBeenCalledWith('OneSignal: api: flag must be a boolean');
    });
  });

  describe('isInteger', () => {
    test.each([0, 5, -3])('should accept %s', (value) => {
      expect(isInteger(value, 'api: id')).toBe(true);
      expect(errorSpy).not.toHaveBeenCalled();
    });

    test.each([undefined, null, '1', 1.5, NaN, Infinity])('should reject %s', (value) => {
      expect(isInteger(value, 'api: id')).toBe(false);
      expect(errorSpy).toHaveBeenCalledWith('OneSignal: api: id must be an integer');
    });
  });

  describe('isMissing', () => {
    test.each([
      { description: 'a non-empty string', value: 'id', expected: false },
      { description: 'a whitespace string', value: ' ', expected: false },
      { description: 'an empty string', value: '', expected: true },
      { description: 'null', value: null, expected: true },
      { description: 'undefined', value: undefined, expected: true },
      { description: 'a number', value: 1, expected: true },
      { description: 'a boolean', value: true, expected: true },
    ])(
      'should return $expected for $description',
      ({ value, expected }: { description: string; value: unknown; expected: boolean }) => {
        expect(isMissing(value, 'login: externalId')).toBe(expected);
      },
    );
  });

  describe('hasMissingEntries', () => {
    test.each([
      { description: 'null', values: null, allowEmptyValue: false, expected: true },
      { description: 'an array', values: ['x'], allowEmptyValue: false, expected: true },
      { description: 'an empty key', values: { '': 'id' }, allowEmptyValue: false, expected: true },
      { description: 'an empty value', values: { a: '' }, allowEmptyValue: false, expected: true },
      { description: 'a numeric value', values: { a: 5 }, allowEmptyValue: false, expected: true },
      {
        description: 'an allowed empty value',
        values: { a: '' },
        allowEmptyValue: true,
        expected: false,
      },
      {
        description: 'an allowed numeric value',
        values: { a: 5 },
        allowEmptyValue: true,
        expected: false,
      },
      { description: 'a null value', values: { a: null }, allowEmptyValue: true, expected: true },
      {
        description: 'valid entries',
        values: { a: 'id' },
        allowEmptyValue: false,
        expected: false,
      },
    ])('should return $expected for $description', ({ values, allowEmptyValue, expected }) => {
      expect(
        hasMissingEntries(values as Record<string, unknown> | null, 'addAliases', allowEmptyValue),
      ).toBe(expected);
    });
  });

  describe('hasMissingItems', () => {
    test.each([
      { description: 'null', values: null, expected: true },
      { description: 'a string', values: 'key', expected: true },
      { description: 'an empty item', values: ['a', ''], expected: true },
      { description: 'a non-string item', values: ['a', 1], expected: true },
      { description: 'valid items', values: ['a', 'b'], expected: false },
      { description: 'an empty array', values: [], expected: false },
    ])('should return $expected for $description', ({ values, expected }) => {
      expect(hasMissingItems(values, 'removeTags', 'key')).toBe(expected);
    });
  });

  describe('isObjectSerializable', () => {
    test.each([
      { description: 'an empty object', value: {} },
      { description: 'an object with string values', value: { key: 'value' } },
      { description: 'an object with number values', value: { count: 42 } },
      { description: 'an object with boolean values', value: { active: true } },
      { description: 'an object with null values', value: { data: null } },
      {
        description: 'a nested object',
        value: { outer: { inner: 'value' } },
      },
      {
        description: 'an object with array values',
        value: { items: [1, 2, 3] },
      },
    ])(
      'should return true for $description',
      ({ value }: { description: string; value: unknown }) => {
        expect(isObjectSerializable(value)).toBe(true);
      },
    );

    test.each([
      { description: 'null', value: null },
      { description: 'undefined', value: undefined },
      { description: 'a string', value: 'string' },
      { description: 'a number', value: 123 },
      { description: 'a boolean', value: true },
      { description: 'an array', value: [1, 2, 3] },
      { description: 'a function', value: () => {} },
    ])(
      'should return false for $description',
      ({ value }: { description: string; value: unknown }) => {
        expect(isObjectSerializable(value)).toBe(false);
      },
    );

    test('should return false for objects with circular references', () => {
      const circular: Record<string, unknown> = {};
      circular.self = circular;
      expect(isObjectSerializable(circular)).toBe(false);
    });
  });

  describe('encodeNullsForIOS', () => {
    test('replaces top-level null with the sentinel', () => {
      expect(encodeNullsForIOS(null)).toBe(IOS_NULL_SENTINEL);
    });

    test('replaces null values inside an object', () => {
      expect(encodeNullsForIOS({ a: 1, b: null })).toEqual({
        a: 1,
        b: IOS_NULL_SENTINEL,
      });
    });

    test('preserves an own __proto__ property', () => {
      const input = JSON.parse('{"__proto__":null}');
      const encoded = encodeNullsForIOS(input) as Record<string, unknown>;

      expect(Object.prototype.hasOwnProperty.call(encoded, '__proto__')).toBe(true);
      expect(encoded['__proto__']).toBe(IOS_NULL_SENTINEL);
    });

    test('replaces null values inside nested objects', () => {
      expect(encodeNullsForIOS({ outer: { inner: null, ok: 'x' } })).toEqual({
        outer: { inner: IOS_NULL_SENTINEL, ok: 'x' },
      });
    });

    test('replaces null values inside arrays', () => {
      expect(encodeNullsForIOS([1, null, 'x'])).toEqual([1, IOS_NULL_SENTINEL, 'x']);
    });

    test('replaces null values inside mixed arrays of objects', () => {
      expect(encodeNullsForIOS([1, '2', { a: '3' }, null])).toEqual([
        1,
        '2',
        { a: '3' },
        IOS_NULL_SENTINEL,
      ]);
    });

    test.each([
      { description: 'a number', value: 42 },
      { description: 'a float', value: 3.14 },
      { description: 'a string', value: 'abc' },
      { description: 'a boolean true', value: true },
      { description: 'a boolean false', value: false },
    ])('leaves $description untouched', ({ value }: { description: string; value: unknown }) => {
      expect(encodeNullsForIOS(value)).toBe(value);
    });

    test('does not mutate the input object', () => {
      const input = { a: 1, b: null, nested: { c: null }, arr: [null] };
      const snapshot = JSON.parse(JSON.stringify(input));
      encodeNullsForIOS(input);
      expect(input).toEqual(snapshot);
    });
  });
});
