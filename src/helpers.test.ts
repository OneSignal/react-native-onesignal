import type { NativeModule } from 'react-native';
import type { MockInstance } from 'vitest';
import {
  isNativeModuleLoaded,
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
      ({ value }) => {
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
      ({ value }) => {
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
    ])('should return true for $description', ({ value }) => {
      expect(isObjectSerializable(value)).toBe(true);
    });

    test.each([
      { description: 'null', value: null },
      { description: 'undefined', value: undefined },
      { description: 'a string', value: 'string' },
      { description: 'a number', value: 123 },
      { description: 'a boolean', value: true },
      { description: 'an array', value: [1, 2, 3] },
      { description: 'a function', value: () => {} },
    ])('should return false for $description', ({ value }) => {
      expect(isObjectSerializable(value)).toBe(false);
    });

    test('should return false for objects with circular references', () => {
      const circular: Record<string, unknown> = {};
      circular.self = circular;
      expect(isObjectSerializable(circular)).toBe(false);
    });
  });
});
