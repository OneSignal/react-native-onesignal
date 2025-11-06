import { NativeModules, Platform } from 'react-native';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import * as helpers from './helpers';
import { LogLevel, OneSignal } from './index';

const mockRNOneSignal = NativeModules.OneSignal;
const mockPlatform = Platform;

// vi.mock('./events/EventManager');
// vi.mock('./helpers');

const isNativeLoadedSpy = vi.spyOn(helpers, 'isNativeModuleLoaded');

// const mockEventManager = {
//   addEventListener: vi.fn(),
//   removeEventListener: vi.fn(),
// };

describe('OneSignal', () => {
  beforeEach(() => {
    mockPlatform.OS = 'ios';
    // vi.mocked(EventManager).mockImplementation(
    //   () => mockEventManager as unknown as EventManager,
    // );
    isNativeLoadedSpy.mockReturnValue(true);
    // vi.mocked(helpers.isValidCallback).mockImplementation(() => {});
  });

  afterEach(() => {
    // vi.restoreAllMocks();
  });

  describe('LogLevel enum', () => {
    test.each([
      [LogLevel.None, 0],
      [LogLevel.Fatal, 1],
      [LogLevel.Error, 2],
      [LogLevel.Warn, 3],
      [LogLevel.Info, 4],
      [LogLevel.Debug, 5],
      [LogLevel.Verbose, 6],
    ])('should have correct enum values', (logLevel, expected) => {
      expect(logLevel).toBe(expected);
    });
  });

  describe('initialize', () => {
    test('should initialize OneSignal with appId', () => {
      OneSignal.initialize('test-app-id');
      expect(mockRNOneSignal.initialize).toHaveBeenCalledWith('test-app-id');
    });

    test('should not initialize if native module is not loaded', () => {
      isNativeLoadedSpy.mockReturnValue(false);
      OneSignal.initialize('test-app-id');
      expect(mockRNOneSignal.initialize).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    test('should login with externalId', () => {
      OneSignal.login('external-123');
      expect(mockRNOneSignal.login).toHaveBeenCalledWith('external-123');
    });

    test('should not login if native module is not loaded', () => {
      isNativeLoadedSpy.mockReturnValue(false);
      OneSignal.login('external-123');
      expect(mockRNOneSignal.login).not.toHaveBeenCalled();
    });
  });

  describe('logout', () => {
    test('should logout', () => {
      OneSignal.logout();
      expect(mockRNOneSignal.logout).toHaveBeenCalled();
    });

    test('should not logout if native module is not loaded', () => {
      isNativeLoadedSpy.mockReturnValue(false);
      OneSignal.logout();
      expect(mockRNOneSignal.logout).not.toHaveBeenCalled();
    });
  });

  describe('setConsentRequired', () => {
    test('should set consent required', () => {
      OneSignal.setConsentRequired(true);
      expect(mockRNOneSignal.setPrivacyConsentRequired).toHaveBeenCalledWith(
        true,
      );
    });

    test('should not set consent if native module is not loaded', () => {
      isNativeLoadedSpy.mockReturnValue(false);
      OneSignal.setConsentRequired(true);
      expect(mockRNOneSignal.setPrivacyConsentRequired).not.toHaveBeenCalled();
    });
  });

  describe('setConsentGiven', () => {
    test('should set consent given', () => {
      OneSignal.setConsentGiven(true);
      expect(mockRNOneSignal.setPrivacyConsentGiven).toHaveBeenCalledWith(true);
    });

    test('should not set consent if native module is not loaded', () => {
      vi.mocked(helpers.isNativeModuleLoaded).mockReturnValue(false);
      OneSignal.setConsentGiven(true);
      expect(mockRNOneSignal.setPrivacyConsentGiven).not.toHaveBeenCalled();
    });
  });

  describe('Debug', () => {
    describe('setLogLevel', () => {
      test('should set log level', () => {
        OneSignal.Debug.setLogLevel(LogLevel.Info);
        expect(mockRNOneSignal.setLogLevel).toHaveBeenCalledWith(LogLevel.Info);
      });

      test('should not set log level if native module is not loaded', () => {
        vi.mocked(helpers.isNativeModuleLoaded).mockReturnValue(false);
        OneSignal.Debug.setLogLevel(LogLevel.Info);
        expect(mockRNOneSignal.setLogLevel).not.toHaveBeenCalled();
      });
    });

    describe('setAlertLevel', () => {
      test('should set alert level', () => {
        OneSignal.Debug.setAlertLevel(LogLevel.Warn);
        expect(mockRNOneSignal.setAlertLevel).toHaveBeenCalledWith(
          LogLevel.Warn,
        );
      });

      test('should not set alert level if native module is not loaded', () => {
        vi.mocked(helpers.isNativeModuleLoaded).mockReturnValue(false);
        OneSignal.Debug.setAlertLevel(LogLevel.Warn);
        expect(mockRNOneSignal.setAlertLevel).not.toHaveBeenCalled();
      });
    });
  });

  describe('LiveActivities', () => {
    describe('enter', () => {
      test('should enter live activity on iOS', () => {
        const handler = vi.fn();
        OneSignal.LiveActivities.enter('activity-id', 'token', handler);
        expect(mockRNOneSignal.enterLiveActivity).toHaveBeenCalledWith(
          'activity-id',
          'token',
          handler,
        );
      });

      test('should use default handler if not provided', () => {
        OneSignal.LiveActivities.enter('activity-id', 'token');
        expect(mockRNOneSignal.enterLiveActivity).toHaveBeenCalledWith(
          'activity-id',
          'token',
          expect.any(Function),
        );
      });

      test('should not enter if native module is not loaded', () => {
        vi.mocked(helpers.isNativeModuleLoaded).mockReturnValue(false);
        OneSignal.LiveActivities.enter('activity-id', 'token');
        expect(mockRNOneSignal.enterLiveActivity).not.toHaveBeenCalled();
      });

      test('should not enter on Android', () => {
        mockPlatform.OS = 'android';
        OneSignal.LiveActivities.enter('activity-id', 'token');
        expect(mockRNOneSignal.enterLiveActivity).not.toHaveBeenCalled();
      });
    });

    describe('exit', () => {
      test('should exit live activity on iOS', () => {
        const handler = vi.fn();
        OneSignal.LiveActivities.exit('activity-id', handler);
        expect(mockRNOneSignal.exitLiveActivity).toHaveBeenCalledWith(
          'activity-id',
          handler,
        );
      });

      test('should use default handler if not provided', () => {
        OneSignal.LiveActivities.exit('activity-id');
        expect(mockRNOneSignal.exitLiveActivity).toHaveBeenCalledWith(
          'activity-id',
          expect.any(Function),
        );
      });

      test('should not exit if native module is not loaded', () => {
        vi.mocked(helpers.isNativeModuleLoaded).mockReturnValue(false);
        OneSignal.LiveActivities.exit('activity-id');
        expect(mockRNOneSignal.exitLiveActivity).not.toHaveBeenCalled();
      });

      test('should not exit on Android', () => {
        mockPlatform.OS = 'android';
        OneSignal.LiveActivities.exit('activity-id');
        expect(mockRNOneSignal.exitLiveActivity).not.toHaveBeenCalled();
        mockPlatform.OS = 'ios';
      });
    });

    describe('setPushToStartToken', () => {
      test('should set push to start token on iOS', () => {
        OneSignal.LiveActivities.setPushToStartToken('activity-type', 'token');
        expect(mockRNOneSignal.setPushToStartToken).toHaveBeenCalledWith(
          'activity-type',
          'token',
        );
      });

      test('should not set token if native module is not loaded', () => {
        vi.mocked(helpers.isNativeModuleLoaded).mockReturnValue(false);
        OneSignal.LiveActivities.setPushToStartToken('activity-type', 'token');
        expect(mockRNOneSignal.setPushToStartToken).not.toHaveBeenCalled();
      });

      test('should not set token on Android', () => {
        mockPlatform.OS = 'android';
        OneSignal.LiveActivities.setPushToStartToken('activity-type', 'token');
        expect(mockRNOneSignal.setPushToStartToken).not.toHaveBeenCalled();
        mockPlatform.OS = 'ios';
      });
    });

    describe('removePushToStartToken', () => {
      test('should remove push to start token on iOS', () => {
        OneSignal.LiveActivities.removePushToStartToken('activity-type');
        expect(mockRNOneSignal.removePushToStartToken).toHaveBeenCalledWith(
          'activity-type',
        );
      });

      test('should not remove token if native module is not loaded', () => {
        vi.mocked(helpers.isNativeModuleLoaded).mockReturnValue(false);
        OneSignal.LiveActivities.removePushToStartToken('activity-type');
        expect(mockRNOneSignal.removePushToStartToken).not.toHaveBeenCalled();
      });

      test('should not remove token on Android', () => {
        mockPlatform.OS = 'android';
        OneSignal.LiveActivities.removePushToStartToken('activity-type');
        expect(mockRNOneSignal.removePushToStartToken).not.toHaveBeenCalled();
        mockPlatform.OS = 'ios';
      });
    });

    describe('setupDefault', () => {
      test('should setup default live activity on iOS', () => {
        const options = { enablePushToStart: true, enablePushToUpdate: false };
        OneSignal.LiveActivities.setupDefault(options);
        expect(mockRNOneSignal.setupDefaultLiveActivity).toHaveBeenCalledWith(
          options,
        );
      });

      test('should setup default without options', () => {
        OneSignal.LiveActivities.setupDefault();
        expect(mockRNOneSignal.setupDefaultLiveActivity).toHaveBeenCalledWith(
          undefined,
        );
      });

      test('should not setup if native module is not loaded', () => {
        vi.mocked(helpers.isNativeModuleLoaded).mockReturnValue(false);
        OneSignal.LiveActivities.setupDefault();
        expect(mockRNOneSignal.setupDefaultLiveActivity).not.toHaveBeenCalled();
      });

      test('should not setup on Android', () => {
        mockPlatform.OS = 'android';
        OneSignal.LiveActivities.setupDefault();
        expect(mockRNOneSignal.setupDefaultLiveActivity).not.toHaveBeenCalled();
        mockPlatform.OS = 'ios';
      });
    });

    describe('startDefault', () => {
      test('should start default live activity on iOS', () => {
        const attributes = { key: 'value' };
        const content = { text: 'content' };
        OneSignal.LiveActivities.startDefault(
          'activity-id',
          attributes,
          content,
        );
        expect(mockRNOneSignal.startDefaultLiveActivity).toHaveBeenCalledWith(
          'activity-id',
          attributes,
          content,
        );
      });

      test('should not start if native module is not loaded', () => {
        vi.mocked(helpers.isNativeModuleLoaded).mockReturnValue(false);
        OneSignal.LiveActivities.startDefault('activity-id', {}, {});
        expect(mockRNOneSignal.startDefaultLiveActivity).not.toHaveBeenCalled();
      });

      test('should not start on Android', () => {
        mockPlatform.OS = 'android';
        OneSignal.LiveActivities.startDefault('activity-id', {}, {});
        expect(mockRNOneSignal.startDefaultLiveActivity).not.toHaveBeenCalled();
        mockPlatform.OS = 'ios';
      });
    });
  });

  // describe('User.pushSubscription', () => {
  //   describe('addEventListener', () => {
  //     test('should add push subscription change listener', () => {
  //       const listener = vi.fn();
  //       OneSignal.User.pushSubscription.addEventListener('change', listener);
  //       expect(mockRNOneSignal.addPushSubscriptionObserver).toHaveBeenCalled();
  //       expect(mockEventManager.addEventListener).toHaveBeenCalled();
  //     });

  //     test('should validate callback', () => {
  //       const listener = vi.fn();
  //       OneSignal.User.pushSubscription.addEventListener('change', listener);
  //       expect(helpers.isValidCallback).toHaveBeenCalledWith(listener);
  //     });

  //     test('should not add listener if native module is not loaded', () => {
  //       vi.mocked(helpers.isNativeModuleLoaded).mockReturnValue(false);
  //       const listener = vi.fn();
  //       OneSignal.User.pushSubscription.addEventListener('change', listener);
  //       expect(
  //         mockRNOneSignal.addPushSubscriptionObserver,
  //       ).not.toHaveBeenCalled();
  //     });
  //   });

  //   describe('removeEventListener', () => {
  //     test('should remove push subscription change listener', () => {
  //       const listener = vi.fn();
  //       OneSignal.User.pushSubscription.removeEventListener('change', listener);
  //       expect(mockEventManager.removeEventListener).toHaveBeenCalled();
  //     });

  //     test('should not remove listener if native module is not loaded', () => {
  //       vi.mocked(helpers.isNativeModuleLoaded).mockReturnValue(false);
  //       const listener = vi.fn();
  //       OneSignal.User.pushSubscription.removeEventListener('change', listener);
  //       expect(mockEventManager.removeEventListener).not.toHaveBeenCalled();
  //     });
  //   });

  //   describe('getPushSubscriptionId (deprecated)', () => {
  //     test('should return empty string if native module not loaded', () => {
  //       vi.mocked(helpers.isNativeModuleLoaded).mockReturnValue(false);
  //       const result = OneSignal.User.pushSubscription.getPushSubscriptionId();
  //       expect(result).toBe('');
  //     });

  //     test('should log deprecation warning', () => {
  //       const consoleSpy = vi
  //         .spyOn(console, 'warn')
  //         .mockImplementation(() => {});
  //       OneSignal.User.pushSubscription.getPushSubscriptionId();
  //       expect(consoleSpy).toHaveBeenCalled();
  //       consoleSpy.mockRestore();
  //     });
  //   });

  //   describe('getIdAsync', () => {
  //     test('should get push subscription id', async () => {
  //       const mockId = 'subscription-id';
  //       vi.mocked(mockRNOneSignal.getPushSubscriptionId).mockResolvedValue(
  //         mockId,
  //       );
  //       const result = await OneSignal.User.pushSubscription.getIdAsync();
  //       expect(result).toBe(mockId);
  //       expect(mockRNOneSignal.getPushSubscriptionId).toHaveBeenCalled();
  //     });

  //     test('should reject if native module is not loaded', async () => {
  //       vi.mocked(helpers.isNativeModuleLoaded).mockReturnValue(false);
  //       await expect(
  //         OneSignal.User.pushSubscription.getIdAsync(),
  //       ).rejects.toThrow('OneSignal native module not loaded');
  //     });
  //   });

  //   describe('getPushSubscriptionToken (deprecated)', () => {
  //     test('should return empty string if native module not loaded', () => {
  //       vi.mocked(helpers.isNativeModuleLoaded).mockReturnValue(false);
  //       const result =
  //         OneSignal.User.pushSubscription.getPushSubscriptionToken();
  //       expect(result).toBe('');
  //     });

  //     test('should log deprecation warning', () => {
  //       const consoleSpy = vi
  //         .spyOn(console, 'warn')
  //         .mockImplementation(() => {});
  //       OneSignal.User.pushSubscription.getPushSubscriptionToken();
  //       expect(consoleSpy).toHaveBeenCalled();
  //       consoleSpy.mockRestore();
  //     });
  //   });

  //   describe('getTokenAsync', () => {
  //     test('should get push subscription token', async () => {
  //       const mockToken = 'push-token';
  //       vi.mocked(mockRNOneSignal.getPushSubscriptionToken).mockResolvedValue(
  //         mockToken,
  //       );
  //       const result = await OneSignal.User.pushSubscription.getTokenAsync();
  //       expect(result).toBe(mockToken);
  //       expect(mockRNOneSignal.getPushSubscriptionToken).toHaveBeenCalled();
  //     });

  //     test('should reject if native module is not loaded', async () => {
  //       vi.mocked(helpers.isNativeModuleLoaded).mockReturnValue(false);
  //       await expect(
  //         OneSignal.User.pushSubscription.getTokenAsync(),
  //       ).rejects.toThrow('OneSignal native module not loaded');
  //     });
  //   });

  //   describe('getOptedIn (deprecated)', () => {
  //     test('should return false if native module not loaded', () => {
  //       vi.mocked(helpers.isNativeModuleLoaded).mockReturnValue(false);
  //       const result = OneSignal.User.pushSubscription.getOptedIn();
  //       expect(result).toBe(false);
  //     });

  //     test('should log deprecation warning', () => {
  //       const consoleSpy = vi
  //         .spyOn(console, 'warn')
  //         .mockImplementation(() => {});
  //       OneSignal.User.pushSubscription.getOptedIn();
  //       expect(consoleSpy).toHaveBeenCalled();
  //       consoleSpy.mockRestore();
  //     });
  //   });

  //   describe('getOptedInAsync', () => {
  //     test('should get opted in status', async () => {
  //       vi.mocked(mockRNOneSignal.getOptedIn).mockResolvedValue(true);
  //       const result = await OneSignal.User.pushSubscription.getOptedInAsync();
  //       expect(result).toBe(true);
  //       expect(mockRNOneSignal.getOptedIn).toHaveBeenCalled();
  //     });

  //     test('should reject if native module is not loaded', async () => {
  //       vi.mocked(helpers.isNativeModuleLoaded).mockReturnValue(false);
  //       await expect(
  //         OneSignal.User.pushSubscription.getOptedInAsync(),
  //       ).rejects.toThrow('OneSignal native module not loaded');
  //     });
  //   });

  //   describe('optOut', () => {
  //     test('should opt out', () => {
  //       OneSignal.User.pushSubscription.optOut();
  //       expect(mockRNOneSignal.optOut).toHaveBeenCalled();
  //     });

  //     test('should not opt out if native module is not loaded', () => {
  //       vi.mocked(helpers.isNativeModuleLoaded).mockReturnValue(false);
  //       OneSignal.User.pushSubscription.optOut();
  //       expect(mockRNOneSignal.optOut).not.toHaveBeenCalled();
  //     });
  //   });

  //   describe('optIn', () => {
  //     test('should opt in', () => {
  //       OneSignal.User.pushSubscription.optIn();
  //       expect(mockRNOneSignal.optIn).toHaveBeenCalled();
  //     });

  //     test('should not opt in if native module is not loaded', () => {
  //       vi.mocked(helpers.isNativeModuleLoaded).mockReturnValue(false);
  //       OneSignal.User.pushSubscription.optIn();
  //       expect(mockRNOneSignal.optIn).not.toHaveBeenCalled();
  //     });
  //   });
  // });

  // describe('User', () => {
  //   describe('addEventListener', () => {
  //     test('should add user state change listener', () => {
  //       const listener = vi.fn();
  //       OneSignal.User.addEventListener('change', listener);
  //       expect(mockRNOneSignal.addUserStateObserver).toHaveBeenCalled();
  //       expect(mockEventManager.addEventListener).toHaveBeenCalled();
  //     });

  //     test('should validate callback', () => {
  //       const listener = vi.fn();
  //       OneSignal.User.addEventListener('change', listener);
  //       expect(helpers.isValidCallback).toHaveBeenCalledWith(listener);
  //     });

  //     test('should not add listener if native module is not loaded', () => {
  //       vi.mocked(helpers.isNativeModuleLoaded).mockReturnValue(false);
  //       const listener = vi.fn();
  //       OneSignal.User.addEventListener('change', listener);
  //       expect(mockRNOneSignal.addUserStateObserver).not.toHaveBeenCalled();
  //     });
  //   });

  //   describe('removeEventListener', () => {
  //     test('should remove user state change listener', () => {
  //       const listener = vi.fn();
  //       OneSignal.User.removeEventListener('change', listener);
  //       expect(mockEventManager.removeEventListener).toHaveBeenCalled();
  //     });

  //     test('should not remove listener if native module is not loaded', () => {
  //       vi.mocked(helpers.isNativeModuleLoaded).mockReturnValue(false);
  //       const listener = vi.fn();
  //       OneSignal.User.removeEventListener('change', listener);
  //       expect(mockEventManager.removeEventListener).not.toHaveBeenCalled();
  //     });
  //   });

  //   describe('getOnesignalId', () => {
  //     test('should get onesignal id', async () => {
  //       const mockId = 'onesignal-id';
  //       vi.mocked(mockRNOneSignal.getOnesignalId).mockResolvedValue(mockId);
  //       const result = await OneSignal.User.getOnesignalId();
  //       expect(result).toBe(mockId);
  //       expect(mockRNOneSignal.getOnesignalId).toHaveBeenCalled();
  //     });

  //     test('should reject if native module is not loaded', async () => {
  //       vi.mocked(helpers.isNativeModuleLoaded).mockReturnValue(false);
  //       await expect(OneSignal.User.getOnesignalId()).rejects.toThrow(
  //         'OneSignal native module not loaded',
  //       );
  //     });
  //   });

  //   describe('getExternalId', () => {
  //     test('should get external id', async () => {
  //       const mockId = 'external-id';
  //       vi.mocked(mockRNOneSignal.getExternalId).mockResolvedValue(mockId);
  //       const result = await OneSignal.User.getExternalId();
  //       expect(result).toBe(mockId);
  //       expect(mockRNOneSignal.getExternalId).toHaveBeenCalled();
  //     });

  //     test('should reject if native module is not loaded', async () => {
  //       vi.mocked(helpers.isNativeModuleLoaded).mockReturnValue(false);
  //       await expect(OneSignal.User.getExternalId()).rejects.toThrow(
  //         'OneSignal native module not loaded',
  //       );
  //     });
  //   });

  //   describe('setLanguage', () => {
  //     test('should set language', () => {
  //       OneSignal.User.setLanguage('en');
  //       expect(mockRNOneSignal.setLanguage).toHaveBeenCalledWith('en');
  //     });

  //     test('should not set language if native module is not loaded', () => {
  //       vi.mocked(helpers.isNativeModuleLoaded).mockReturnValue(false);
  //       OneSignal.User.setLanguage('en');
  //       expect(mockRNOneSignal.setLanguage).not.toHaveBeenCalled();
  //     });
  //   });

  //   describe('addAlias', () => {
  //     test('should add alias', () => {
  //       OneSignal.User.addAlias('label', 'id');
  //       expect(mockRNOneSignal.addAlias).toHaveBeenCalledWith('label', 'id');
  //     });

  //     test('should not add alias if native module is not loaded', () => {
  //       vi.mocked(helpers.isNativeModuleLoaded).mockReturnValue(false);
  //       OneSignal.User.addAlias('label', 'id');
  //       expect(mockRNOneSignal.addAlias).not.toHaveBeenCalled();
  //     });
  //   });

  //   describe('addAliases', () => {
  //     test('should add aliases', () => {
  //       const aliases = { label1: 'id1', label2: 'id2' };
  //       OneSignal.User.addAliases(aliases);
  //       expect(mockRNOneSignal.addAliases).toHaveBeenCalledWith(aliases);
  //     });

  //     test('should not add aliases if native module is not loaded', () => {
  //       vi.mocked(helpers.isNativeModuleLoaded).mockReturnValue(false);
  //       OneSignal.User.addAliases({});
  //       expect(mockRNOneSignal.addAliases).not.toHaveBeenCalled();
  //     });
  //   });

  //   describe('removeAlias', () => {
  //     test('should remove alias', () => {
  //       OneSignal.User.removeAlias('label');
  //       expect(mockRNOneSignal.removeAlias).toHaveBeenCalledWith('label');
  //     });

  //     test('should not remove alias if native module is not loaded', () => {
  //       vi.mocked(helpers.isNativeModuleLoaded).mockReturnValue(false);
  //       OneSignal.User.removeAlias('label');
  //       expect(mockRNOneSignal.removeAlias).not.toHaveBeenCalled();
  //     });
  //   });

  //   describe('removeAliases', () => {
  //     test('should remove aliases', () => {
  //       const labels = ['label1', 'label2'];
  //       OneSignal.User.removeAliases(labels);
  //       expect(mockRNOneSignal.removeAliases).toHaveBeenCalledWith(labels);
  //     });

  //     test('should not remove aliases if native module is not loaded', () => {
  //       vi.mocked(helpers.isNativeModuleLoaded).mockReturnValue(false);
  //       OneSignal.User.removeAliases(['label']);
  //       expect(mockRNOneSignal.removeAliases).not.toHaveBeenCalled();
  //     });
  //   });

  //   describe('addEmail', () => {
  //     test('should add email', () => {
  //       OneSignal.User.addEmail('test@example.com');
  //       expect(mockRNOneSignal.addEmail).toHaveBeenCalledWith(
  //         'test@example.com',
  //       );
  //     });

  //     test('should not add email if native module is not loaded', () => {
  //       vi.mocked(helpers.isNativeModuleLoaded).mockReturnValue(false);
  //       OneSignal.User.addEmail('test@example.com');
  //       expect(mockRNOneSignal.addEmail).not.toHaveBeenCalled();
  //     });
  //   });

  //   describe('removeEmail', () => {
  //     test('should remove email', () => {
  //       OneSignal.User.removeEmail('test@example.com');
  //       expect(mockRNOneSignal.removeEmail).toHaveBeenCalledWith(
  //         'test@example.com',
  //       );
  //     });

  //     test('should not remove email if native module is not loaded', () => {
  //       vi.mocked(helpers.isNativeModuleLoaded).mockReturnValue(false);
  //       OneSignal.User.removeEmail('test@example.com');
  //       expect(mockRNOneSignal.removeEmail).not.toHaveBeenCalled();
  //     });
  //   });

  //   describe('addSms', () => {
  //     test('should add SMS', () => {
  //       OneSignal.User.addSms('+1234567890');
  //       expect(mockRNOneSignal.addSms).toHaveBeenCalledWith('+1234567890');
  //     });

  //     test('should not add SMS if native module is not loaded', () => {
  //       vi.mocked(helpers.isNativeModuleLoaded).mockReturnValue(false);
  //       OneSignal.User.addSms('+1234567890');
  //       expect(mockRNOneSignal.addSms).not.toHaveBeenCalled();
  //     });
  //   });

  //   describe('removeSms', () => {
  //     test('should remove SMS', () => {
  //       OneSignal.User.removeSms('+1234567890');
  //       expect(mockRNOneSignal.removeSms).toHaveBeenCalledWith('+1234567890');
  //     });

  //     test('should not remove SMS if native module is not loaded', () => {
  //       vi.mocked(helpers.isNativeModuleLoaded).mockReturnValue(false);
  //       OneSignal.User.removeSms('+1234567890');
  //       expect(mockRNOneSignal.removeSms).not.toHaveBeenCalled();
  //     });
  //   });

  //   describe('addTag', () => {
  //     test('should add tag', () => {
  //       OneSignal.User.addTag('key', 'value');
  //       expect(mockRNOneSignal.addTag).toHaveBeenCalledWith('key', 'value');
  //     });

  //     test('should convert non-string values to string', () => {
  //       const consoleSpy = vi
  //         .spyOn(console, 'warn')
  //         .mockImplementation(() => {});
  //       OneSignal.User.addTag('key', 123 as unknown as string);
  //       expect(consoleSpy).toHaveBeenCalled();
  //       expect(mockRNOneSignal.addTag).toHaveBeenCalledWith('key', '123');
  //       consoleSpy.mockRestore();
  //     });

  //     test('should not add tag if key is missing', () => {
  //       const consoleSpy = vi
  //         .spyOn(console, 'error')
  //         .mockImplementation(() => {});
  //       OneSignal.User.addTag('', 'value');
  //       expect(consoleSpy).toHaveBeenCalled();
  //       expect(mockRNOneSignal.addTag).not.toHaveBeenCalled();
  //       consoleSpy.mockRestore();
  //     });

  //     test('should not add tag if value is null', () => {
  //       const consoleSpy = vi
  //         .spyOn(console, 'error')
  //         .mockImplementation(() => {});
  //       OneSignal.User.addTag('key', null as unknown as string);
  //       expect(consoleSpy).toHaveBeenCalled();
  //       expect(mockRNOneSignal.addTag).not.toHaveBeenCalled();
  //       consoleSpy.mockRestore();
  //     });

  //     test('should not add tag if native module is not loaded', () => {
  //       vi.mocked(helpers.isNativeModuleLoaded).mockReturnValue(false);
  //       OneSignal.User.addTag('key', 'value');
  //       expect(mockRNOneSignal.addTag).not.toHaveBeenCalled();
  //     });
  //   });

  //   describe('addTags', () => {
  //     test('should add tags', () => {
  //       const tags = { key1: 'value1', key2: 'value2' };
  //       OneSignal.User.addTags(tags);
  //       expect(mockRNOneSignal.addTags).toHaveBeenCalledWith(tags);
  //     });

  //     test('should convert non-string values to string', () => {
  //       const consoleSpy = vi
  //         .spyOn(console, 'warn')
  //         .mockImplementation(() => {});
  //       const tags = { key1: 'value1', key2: 123 };
  //       OneSignal.User.addTags(tags);
  //       expect(consoleSpy).toHaveBeenCalled();
  //       expect(mockRNOneSignal.addTags).toHaveBeenCalled();
  //       consoleSpy.mockRestore();
  //     });

  //     test('should not add tags if tags object is empty', () => {
  //       const consoleSpy = vi
  //         .spyOn(console, 'error')
  //         .mockImplementation(() => {});
  //       OneSignal.User.addTags({});
  //       expect(consoleSpy).toHaveBeenCalled();
  //       expect(mockRNOneSignal.addTags).not.toHaveBeenCalled();
  //       consoleSpy.mockRestore();
  //     });

  //     test('should not add tags if native module is not loaded', () => {
  //       vi.mocked(helpers.isNativeModuleLoaded).mockReturnValue(false);
  //       OneSignal.User.addTags({ key: 'value' });
  //       expect(mockRNOneSignal.addTags).not.toHaveBeenCalled();
  //     });
  //   });

  //   describe('removeTag', () => {
  //     test('should remove tag', () => {
  //       OneSignal.User.removeTag('key');
  //       expect(mockRNOneSignal.removeTags).toHaveBeenCalledWith(['key']);
  //     });

  //     test('should not remove tag if key is not a string', () => {
  //       const consoleSpy = vi
  //         .spyOn(console, 'error')
  //         .mockImplementation(() => {});
  //       OneSignal.User.removeTag(123 as unknown as string);
  //       expect(consoleSpy).toHaveBeenCalled();
  //       expect(mockRNOneSignal.removeTags).not.toHaveBeenCalled();
  //       consoleSpy.mockRestore();
  //     });

  //     test('should not remove tag if native module is not loaded', () => {
  //       vi.mocked(helpers.isNativeModuleLoaded).mockReturnValue(false);
  //       OneSignal.User.removeTag('key');
  //       expect(mockRNOneSignal.removeTags).not.toHaveBeenCalled();
  //     });
  //   });

  //   describe('removeTags', () => {
  //     test('should remove tags', () => {
  //       const keys = ['key1', 'key2'];
  //       OneSignal.User.removeTags(keys);
  //       expect(mockRNOneSignal.removeTags).toHaveBeenCalledWith(keys);
  //     });

  //     test('should not remove tags if keys is not an array', () => {
  //       const consoleSpy = vi
  //         .spyOn(console, 'error')
  //         .mockImplementation(() => {});
  //       OneSignal.User.removeTags('key' as unknown as string[]);
  //       expect(consoleSpy).toHaveBeenCalled();
  //       expect(mockRNOneSignal.removeTags).not.toHaveBeenCalled();
  //       consoleSpy.mockRestore();
  //     });

  //     test('should not remove tags if native module is not loaded', () => {
  //       vi.mocked(helpers.isNativeModuleLoaded).mockReturnValue(false);
  //       OneSignal.User.removeTags(['key']);
  //       expect(mockRNOneSignal.removeTags).not.toHaveBeenCalled();
  //     });
  //   });

  //   describe('getTags', () => {
  //     test('should get tags', async () => {
  //       const mockTags = { key1: 'value1', key2: 'value2' };
  //       vi.mocked(mockRNOneSignal.getTags).mockResolvedValue(mockTags);
  //       const result = await OneSignal.User.getTags();
  //       expect(result).toEqual(mockTags);
  //       expect(mockRNOneSignal.getTags).toHaveBeenCalled();
  //     });

  //     test('should reject if native module is not loaded', async () => {
  //       vi.mocked(helpers.isNativeModuleLoaded).mockReturnValue(false);
  //       await expect(OneSignal.User.getTags()).rejects.toThrow(
  //         'OneSignal native module not loaded',
  //       );
  //     });
  //   });
  // });

  // describe('Notifications', () => {
  //   describe('hasPermission (deprecated)', () => {
  //     test('should log deprecation warning', () => {
  //       const consoleSpy = vi
  //         .spyOn(console, 'warn')
  //         .mockImplementation(() => {});
  //       OneSignal.Notifications.hasPermission();
  //       expect(consoleSpy).toHaveBeenCalled();
  //       consoleSpy.mockRestore();
  //     });
  //   });

  //   describe('getPermissionAsync', () => {
  //     test('should get permission status', async () => {
  //       vi.mocked(mockRNOneSignal.hasNotificationPermission).mockResolvedValue(
  //         true,
  //       );
  //       const result = await OneSignal.Notifications.getPermissionAsync();
  //       expect(result).toBe(true);
  //       expect(mockRNOneSignal.hasNotificationPermission).toHaveBeenCalled();
  //     });
  //   });

  //   describe('requestPermission', () => {
  //     test('should request permission', async () => {
  //       vi.mocked(
  //         mockRNOneSignal.requestNotificationPermission,
  //       ).mockResolvedValue(true);
  //       const result = await OneSignal.Notifications.requestPermission(true);
  //       expect(result).toBe(true);
  //       expect(
  //         mockRNOneSignal.requestNotificationPermission,
  //       ).toHaveBeenCalledWith(true);
  //     });

  //     test('should reject if native module is not loaded', async () => {
  //       vi.mocked(helpers.isNativeModuleLoaded).mockReturnValue(false);
  //       await expect(
  //         OneSignal.Notifications.requestPermission(true),
  //       ).rejects.toThrow('OneSignal native module not loaded');
  //     });
  //   });

  //   describe('canRequestPermission', () => {
  //     test('should check if can request permission', async () => {
  //       vi.mocked(
  //         mockRNOneSignal.canRequestNotificationPermission,
  //       ).mockResolvedValue(true);
  //       const result = await OneSignal.Notifications.canRequestPermission();
  //       expect(result).toBe(true);
  //       expect(
  //         mockRNOneSignal.canRequestNotificationPermission,
  //       ).toHaveBeenCalled();
  //     });

  //     test('should reject if native module is not loaded', async () => {
  //       vi.mocked(helpers.isNativeModuleLoaded).mockReturnValue(false);
  //       await expect(
  //         OneSignal.Notifications.canRequestPermission(),
  //       ).rejects.toThrow('OneSignal native module not loaded');
  //     });
  //   });

  //   describe('registerForProvisionalAuthorization', () => {
  //     beforeEach(() => {
  //       mockPlatform.OS = 'ios';
  //     });

  //     test('should register for provisional authorization on iOS', () => {
  //       const handler = vi.fn();
  //       OneSignal.Notifications.registerForProvisionalAuthorization(handler);
  //       expect(
  //         mockRNOneSignal.registerForProvisionalAuthorization,
  //       ).toHaveBeenCalledWith(handler);
  //       expect(helpers.isValidCallback).toHaveBeenCalledWith(handler);
  //     });

  //     test('should not register if native module is not loaded', () => {
  //       vi.mocked(helpers.isNativeModuleLoaded).mockReturnValue(false);
  //       const handler = vi.fn();
  //       OneSignal.Notifications.registerForProvisionalAuthorization(handler);
  //       expect(
  //         mockRNOneSignal.registerForProvisionalAuthorization,
  //       ).not.toHaveBeenCalled();
  //     });

  //     test('should log message on Android', () => {
  //       const consoleSpy = vi
  //         .spyOn(console, 'log')
  //         .mockImplementation(() => {});
  //       mockPlatform.OS = 'android';
  //       OneSignal.Notifications.registerForProvisionalAuthorization(vi.fn());
  //       expect(consoleSpy).toHaveBeenCalled();
  //       expect(
  //         mockRNOneSignal.registerForProvisionalAuthorization,
  //       ).not.toHaveBeenCalled();
  //       mockPlatform.OS = 'ios';
  //       consoleSpy.mockRestore();
  //     });
  //   });

  //   describe('permissionNative', () => {
  //     test('should get native permission', async () => {
  //       vi.mocked(mockRNOneSignal.permissionNative).mockResolvedValue(
  //         OSNotificationPermission.Authorized,
  //       );
  //       const result = await OneSignal.Notifications.permissionNative();
  //       expect(result).toBe(OSNotificationPermission.Authorized);
  //       expect(mockRNOneSignal.permissionNative).toHaveBeenCalled();
  //     });

  //     test('should reject if native module is not loaded', async () => {
  //       vi.mocked(helpers.isNativeModuleLoaded).mockReturnValue(false);
  //       await expect(
  //         OneSignal.Notifications.permissionNative(),
  //       ).rejects.toThrow('OneSignal native module not loaded');
  //     });
  //   });

  //   describe('addEventListener', () => {
  //     test('should add click listener', () => {
  //       const listener = vi.fn();
  //       OneSignal.Notifications.addEventListener('click', listener);
  //       expect(mockRNOneSignal.addNotificationClickListener).toHaveBeenCalled();
  //       expect(mockEventManager.addEventListener).toHaveBeenCalled();
  //       expect(helpers.isValidCallback).toHaveBeenCalledWith(listener);
  //     });

  //     test('should add foregroundWillDisplay listener', () => {
  //       const listener = vi.fn();
  //       OneSignal.Notifications.addEventListener(
  //         'foregroundWillDisplay',
  //         listener,
  //       );
  //       expect(
  //         mockRNOneSignal.addNotificationForegroundLifecycleListener,
  //       ).toHaveBeenCalled();
  //       expect(mockEventManager.addEventListener).toHaveBeenCalled();
  //       expect(helpers.isValidCallback).toHaveBeenCalledWith(listener);
  //     });

  //     test('should add permissionChange listener', () => {
  //       const listener = vi.fn();
  //       OneSignal.Notifications.addEventListener('permissionChange', listener);
  //       expect(mockRNOneSignal.addPermissionObserver).toHaveBeenCalled();
  //       expect(mockEventManager.addEventListener).toHaveBeenCalled();
  //       expect(helpers.isValidCallback).toHaveBeenCalledWith(listener);
  //     });

  //     test('should not add listener if native module is not loaded', () => {
  //       vi.mocked(helpers.isNativeModuleLoaded).mockReturnValue(false);
  //       const listener = vi.fn();
  //       OneSignal.Notifications.addEventListener('click', listener);
  //       expect(
  //         mockRNOneSignal.addNotificationClickListener,
  //       ).not.toHaveBeenCalled();
  //     });
  //   });

  //   describe('removeEventListener', () => {
  //     test('should remove click listener', () => {
  //       const listener = vi.fn();
  //       OneSignal.Notifications.removeEventListener('click', listener);
  //       expect(mockEventManager.removeEventListener).toHaveBeenCalled();
  //     });

  //     test('should remove foregroundWillDisplay listener', () => {
  //       const listener = vi.fn();
  //       OneSignal.Notifications.removeEventListener(
  //         'foregroundWillDisplay',
  //         listener,
  //       );
  //       expect(mockEventManager.removeEventListener).toHaveBeenCalled();
  //     });

  //     test('should remove permissionChange listener', () => {
  //       const listener = vi.fn();
  //       OneSignal.Notifications.removeEventListener(
  //         'permissionChange',
  //         listener,
  //       );
  //       expect(mockEventManager.removeEventListener).toHaveBeenCalled();
  //     });
  //   });

  //   describe('clearAll', () => {
  //     test('should clear all notifications', () => {
  //       OneSignal.Notifications.clearAll();
  //       expect(mockRNOneSignal.clearAllNotifications).toHaveBeenCalled();
  //     });

  //     test('should not clear if native module is not loaded', () => {
  //       vi.mocked(helpers.isNativeModuleLoaded).mockReturnValue(false);
  //       OneSignal.Notifications.clearAll();
  //       expect(mockRNOneSignal.clearAllNotifications).not.toHaveBeenCalled();
  //     });
  //   });

  //   describe('removeNotification', () => {
  //     beforeEach(() => {
  //       mockPlatform.OS = 'android';
  //     });

  //     test('should remove notification on Android', () => {
  //       OneSignal.Notifications.removeNotification(123);
  //       expect(mockRNOneSignal.removeNotification).toHaveBeenCalledWith(123);
  //     });

  //     test('should not remove if native module is not loaded', () => {
  //       vi.mocked(helpers.isNativeModuleLoaded).mockReturnValue(false);
  //       OneSignal.Notifications.removeNotification(123);
  //       expect(mockRNOneSignal.removeNotification).not.toHaveBeenCalled();
  //     });

  //     test('should log message on iOS', () => {
  //       const consoleSpy = vi
  //         .spyOn(console, 'log')
  //         .mockImplementation(() => {});
  //       mockPlatform.OS = 'ios';
  //       OneSignal.Notifications.removeNotification(123);
  //       expect(consoleSpy).toHaveBeenCalled();
  //       expect(mockRNOneSignal.removeNotification).not.toHaveBeenCalled();
  //       mockPlatform.OS = 'android';
  //       consoleSpy.mockRestore();
  //     });
  //   });

  //   describe('removeGroupedNotifications', () => {
  //     beforeEach(() => {
  //       mockPlatform.OS = 'android';
  //     });

  //     test('should remove grouped notifications on Android', () => {
  //       OneSignal.Notifications.removeGroupedNotifications('group-id');
  //       expect(mockRNOneSignal.removeGroupedNotifications).toHaveBeenCalledWith(
  //         'group-id',
  //       );
  //     });

  //     test('should not remove if native module is not loaded', () => {
  //       vi.mocked(helpers.isNativeModuleLoaded).mockReturnValue(false);
  //       OneSignal.Notifications.removeGroupedNotifications('group-id');
  //       expect(
  //         mockRNOneSignal.removeGroupedNotifications,
  //       ).not.toHaveBeenCalled();
  //     });

  //     test('should log message on iOS', () => {
  //       const consoleSpy = vi
  //         .spyOn(console, 'log')
  //         .mockImplementation(() => {});
  //       mockPlatform.OS = 'ios';
  //       OneSignal.Notifications.removeGroupedNotifications('group-id');
  //       expect(consoleSpy).toHaveBeenCalled();
  //       expect(
  //         mockRNOneSignal.removeGroupedNotifications,
  //       ).not.toHaveBeenCalled();
  //       mockPlatform.OS = 'android';
  //       consoleSpy.mockRestore();
  //     });
  //   });
  // });

  // describe('InAppMessages', () => {
  //   describe('addEventListener', () => {
  //     test('should add click listener', () => {
  //       const listener = vi.fn();
  //       OneSignal.InAppMessages.addEventListener('click', listener);
  //       expect(mockRNOneSignal.addInAppMessageClickListener).toHaveBeenCalled();
  //       expect(mockEventManager.addEventListener).toHaveBeenCalled();
  //       expect(helpers.isValidCallback).toHaveBeenCalledWith(listener);
  //     });

  //     test('should add willDisplay listener', () => {
  //       const listener = vi.fn();
  //       OneSignal.InAppMessages.addEventListener('willDisplay', listener);
  //       expect(
  //         mockRNOneSignal.addInAppMessagesLifecycleListener,
  //       ).toHaveBeenCalled();
  //       expect(mockEventManager.addEventListener).toHaveBeenCalled();
  //       expect(helpers.isValidCallback).toHaveBeenCalledWith(listener);
  //     });

  //     test('should add didDisplay listener', () => {
  //       const listener = vi.fn();
  //       OneSignal.InAppMessages.addEventListener('didDisplay', listener);
  //       expect(
  //         mockRNOneSignal.addInAppMessagesLifecycleListener,
  //       ).toHaveBeenCalled();
  //       expect(mockEventManager.addEventListener).toHaveBeenCalled();
  //       expect(helpers.isValidCallback).toHaveBeenCalledWith(listener);
  //     });

  //     test('should add willDismiss listener', () => {
  //       const listener = vi.fn();
  //       OneSignal.InAppMessages.addEventListener('willDismiss', listener);
  //       expect(
  //         mockRNOneSignal.addInAppMessagesLifecycleListener,
  //       ).toHaveBeenCalled();
  //       expect(mockEventManager.addEventListener).toHaveBeenCalled();
  //       expect(helpers.isValidCallback).toHaveBeenCalledWith(listener);
  //     });

  //     test('should add didDismiss listener', () => {
  //       const listener = vi.fn();
  //       OneSignal.InAppMessages.addEventListener('didDismiss', listener);
  //       expect(
  //         mockRNOneSignal.addInAppMessagesLifecycleListener,
  //       ).toHaveBeenCalled();
  //       expect(mockEventManager.addEventListener).toHaveBeenCalled();
  //       expect(helpers.isValidCallback).toHaveBeenCalledWith(listener);
  //     });

  //     test('should not add listener if native module is not loaded', () => {
  //       vi.mocked(helpers.isNativeModuleLoaded).mockReturnValue(false);
  //       const listener = vi.fn();
  //       OneSignal.InAppMessages.addEventListener('click', listener);
  //       expect(
  //         mockRNOneSignal.addInAppMessageClickListener,
  //       ).not.toHaveBeenCalled();
  //     });
  //   });

  //   describe('removeEventListener', () => {
  //     test('should remove click listener', () => {
  //       const listener = vi.fn();
  //       OneSignal.InAppMessages.removeEventListener('click', listener);
  //       expect(mockEventManager.removeEventListener).toHaveBeenCalled();
  //     });

  //     test('should remove willDisplay listener', () => {
  //       const listener = vi.fn();
  //       OneSignal.InAppMessages.removeEventListener('willDisplay', listener);
  //       expect(mockEventManager.removeEventListener).toHaveBeenCalled();
  //     });

  //     test('should remove didDisplay listener', () => {
  //       const listener = vi.fn();
  //       OneSignal.InAppMessages.removeEventListener('didDisplay', listener);
  //       expect(mockEventManager.removeEventListener).toHaveBeenCalled();
  //     });

  //     test('should remove willDismiss listener', () => {
  //       const listener = vi.fn();
  //       OneSignal.InAppMessages.removeEventListener('willDismiss', listener);
  //       expect(mockEventManager.removeEventListener).toHaveBeenCalled();
  //     });

  //     test('should remove didDismiss listener', () => {
  //       const listener = vi.fn();
  //       OneSignal.InAppMessages.removeEventListener('didDismiss', listener);
  //       expect(mockEventManager.removeEventListener).toHaveBeenCalled();
  //     });
  //   });

  //   describe('addTrigger', () => {
  //     test('should add trigger', () => {
  //       OneSignal.InAppMessages.addTrigger('key', 'value');
  //       expect(mockRNOneSignal.addTriggers).toHaveBeenCalledWith({
  //         key: 'value',
  //       });
  //     });

  //     test('should log error but still call native method if key is missing', () => {
  //       const consoleSpy = vi
  //         .spyOn(console, 'error')
  //         .mockImplementation(() => {});
  //       OneSignal.InAppMessages.addTrigger('', 'value');
  //       expect(consoleSpy).toHaveBeenCalled();
  //       expect(mockRNOneSignal.addTriggers).toHaveBeenCalled();
  //       consoleSpy.mockRestore();
  //     });

  //     test('should log error but still call native method if value is null', () => {
  //       const consoleSpy = vi
  //         .spyOn(console, 'error')
  //         .mockImplementation(() => {});
  //       OneSignal.InAppMessages.addTrigger('key', null as unknown as string);
  //       expect(consoleSpy).toHaveBeenCalled();
  //       expect(mockRNOneSignal.addTriggers).toHaveBeenCalled();
  //       consoleSpy.mockRestore();
  //     });

  //     test('should not add trigger if native module is not loaded', () => {
  //       vi.mocked(helpers.isNativeModuleLoaded).mockReturnValue(false);
  //       OneSignal.InAppMessages.addTrigger('key', 'value');
  //       expect(mockRNOneSignal.addTriggers).not.toHaveBeenCalled();
  //     });
  //   });

  //   describe('addTriggers', () => {
  //     test('should add triggers', () => {
  //       const triggers = { key1: 'value1', key2: 'value2' };
  //       OneSignal.InAppMessages.addTriggers(triggers);
  //       expect(mockRNOneSignal.addTriggers).toHaveBeenCalledWith(triggers);
  //     });

  //     test('should log error but still call native method if empty', () => {
  //       const consoleSpy = vi
  //         .spyOn(console, 'error')
  //         .mockImplementation(() => {});
  //       OneSignal.InAppMessages.addTriggers({});
  //       expect(consoleSpy).toHaveBeenCalled();
  //       expect(mockRNOneSignal.addTriggers).toHaveBeenCalled();
  //       consoleSpy.mockRestore();
  //     });

  //     test('should not add triggers if native module is not loaded', () => {
  //       vi.mocked(helpers.isNativeModuleLoaded).mockReturnValue(false);
  //       OneSignal.InAppMessages.addTriggers({ key: 'value' });
  //       expect(mockRNOneSignal.addTriggers).not.toHaveBeenCalled();
  //     });
  //   });

  //   describe('removeTrigger', () => {
  //     test('should remove trigger', () => {
  //       OneSignal.InAppMessages.removeTrigger('key');
  //       expect(mockRNOneSignal.removeTrigger).toHaveBeenCalledWith('key');
  //     });

  //     test('should not remove trigger if native module is not loaded', () => {
  //       vi.mocked(helpers.isNativeModuleLoaded).mockReturnValue(false);
  //       OneSignal.InAppMessages.removeTrigger('key');
  //       expect(mockRNOneSignal.removeTrigger).not.toHaveBeenCalled();
  //     });
  //   });

  //   describe('removeTriggers', () => {
  //     test('should remove triggers', () => {
  //       const keys = ['key1', 'key2'];
  //       OneSignal.InAppMessages.removeTriggers(keys);
  //       expect(mockRNOneSignal.removeTriggers).toHaveBeenCalledWith(keys);
  //     });

  //     test('should not remove triggers if native module is not loaded', () => {
  //       vi.mocked(helpers.isNativeModuleLoaded).mockReturnValue(false);
  //       OneSignal.InAppMessages.removeTriggers(['key']);
  //       expect(mockRNOneSignal.removeTriggers).not.toHaveBeenCalled();
  //     });
  //   });

  //   describe('clearTriggers', () => {
  //     test('should clear triggers', () => {
  //       OneSignal.InAppMessages.clearTriggers();
  //       expect(mockRNOneSignal.clearTriggers).toHaveBeenCalled();
  //     });

  //     test('should not clear triggers if native module is not loaded', () => {
  //       vi.mocked(helpers.isNativeModuleLoaded).mockReturnValue(false);
  //       OneSignal.InAppMessages.clearTriggers();
  //       expect(mockRNOneSignal.clearTriggers).not.toHaveBeenCalled();
  //     });
  //   });

  //   describe('setPaused', () => {
  //     test('should set paused', () => {
  //       OneSignal.InAppMessages.setPaused(true);
  //       expect(mockRNOneSignal.paused).toHaveBeenCalledWith(true);
  //     });

  //     test('should not set paused if native module is not loaded', () => {
  //       vi.mocked(helpers.isNativeModuleLoaded).mockReturnValue(false);
  //       OneSignal.InAppMessages.setPaused(true);
  //       expect(mockRNOneSignal.paused).not.toHaveBeenCalled();
  //     });
  //   });

  //   describe('getPaused', () => {
  //     test('should get paused status', async () => {
  //       vi.mocked(mockRNOneSignal.getPaused).mockResolvedValue(true);
  //       const result = await OneSignal.InAppMessages.getPaused();
  //       expect(result).toBe(true);
  //       expect(mockRNOneSignal.getPaused).toHaveBeenCalled();
  //     });

  //     test('should reject if native module is not loaded', async () => {
  //       vi.mocked(helpers.isNativeModuleLoaded).mockReturnValue(false);
  //       await expect(OneSignal.InAppMessages.getPaused()).rejects.toThrow(
  //         'OneSignal native module not loaded',
  //       );
  //     });
  //   });
  // });

  // describe('Location', () => {
  //   describe('requestPermission', () => {
  //     test('should request location permission', () => {
  //       OneSignal.Location.requestPermission();
  //       expect(mockRNOneSignal.requestLocationPermission).toHaveBeenCalled();
  //     });

  //     test('should not request permission if native module is not loaded', () => {
  //       vi.mocked(helpers.isNativeModuleLoaded).mockReturnValue(false);
  //       OneSignal.Location.requestPermission();
  //       expect(
  //         mockRNOneSignal.requestLocationPermission,
  //       ).not.toHaveBeenCalled();
  //     });
  //   });

  //   describe('setShared', () => {
  //     test('should set location shared', () => {
  //       OneSignal.Location.setShared(true);
  //       expect(mockRNOneSignal.setLocationShared).toHaveBeenCalledWith(true);
  //     });

  //     test('should not set shared if native module is not loaded', () => {
  //       vi.mocked(helpers.isNativeModuleLoaded).mockReturnValue(false);
  //       OneSignal.Location.setShared(true);
  //       expect(mockRNOneSignal.setLocationShared).not.toHaveBeenCalled();
  //     });
  //   });

  //   describe('isShared', () => {
  //     test('should check if location is shared', async () => {
  //       vi.mocked(mockRNOneSignal.isLocationShared).mockResolvedValue(true);
  //       const result = await OneSignal.Location.isShared();
  //       expect(result).toBe(true);
  //       expect(mockRNOneSignal.isLocationShared).toHaveBeenCalled();
  //     });

  //     test('should reject if native module is not loaded', async () => {
  //       vi.mocked(helpers.isNativeModuleLoaded).mockReturnValue(false);
  //       await expect(OneSignal.Location.isShared()).rejects.toThrow(
  //         'OneSignal native module not loaded',
  //       );
  //     });
  //   });
  // });

  // describe('Session', () => {
  //   describe('addOutcome', () => {
  //     test('should add outcome', () => {
  //       OneSignal.Session.addOutcome('outcome-name');
  //       expect(mockRNOneSignal.addOutcome).toHaveBeenCalledWith('outcome-name');
  //     });

  //     test('should not add outcome if native module is not loaded', () => {
  //       vi.mocked(helpers.isNativeModuleLoaded).mockReturnValue(false);
  //       OneSignal.Session.addOutcome('outcome-name');
  //       expect(mockRNOneSignal.addOutcome).not.toHaveBeenCalled();
  //     });
  //   });

  //   describe('addUniqueOutcome', () => {
  //     test('should add unique outcome', () => {
  //       OneSignal.Session.addUniqueOutcome('outcome-name');
  //       expect(mockRNOneSignal.addUniqueOutcome).toHaveBeenCalledWith(
  //         'outcome-name',
  //       );
  //     });

  //     test('should not add unique outcome if native module is not loaded', () => {
  //       vi.mocked(helpers.isNativeModuleLoaded).mockReturnValue(false);
  //       OneSignal.Session.addUniqueOutcome('outcome-name');
  //       expect(mockRNOneSignal.addUniqueOutcome).not.toHaveBeenCalled();
  //     });
  //   });

  //   describe('addOutcomeWithValue', () => {
  //     test('should add outcome with string value', () => {
  //       OneSignal.Session.addOutcomeWithValue('outcome-name', '100');
  //       expect(mockRNOneSignal.addOutcomeWithValue).toHaveBeenCalledWith(
  //         'outcome-name',
  //         100,
  //       );
  //     });

  //     test('should add outcome with number value', () => {
  //       OneSignal.Session.addOutcomeWithValue('outcome-name', 100);
  //       expect(mockRNOneSignal.addOutcomeWithValue).toHaveBeenCalledWith(
  //         'outcome-name',
  //         100,
  //       );
  //     });

  //     test('should convert string value to number', () => {
  //       OneSignal.Session.addOutcomeWithValue('outcome-name', '50');
  //       expect(mockRNOneSignal.addOutcomeWithValue).toHaveBeenCalledWith(
  //         'outcome-name',
  //         50,
  //       );
  //     });

  //     test('should not add outcome if native module is not loaded', () => {
  //       vi.mocked(helpers.isNativeModuleLoaded).mockReturnValue(false);
  //       OneSignal.Session.addOutcomeWithValue('outcome-name', 100);
  //       expect(mockRNOneSignal.addOutcomeWithValue).not.toHaveBeenCalled();
  //     });
  //   });
  // });
});
