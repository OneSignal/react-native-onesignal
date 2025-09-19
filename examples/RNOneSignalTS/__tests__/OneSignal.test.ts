/**
 * @format
 */

import 'react-native';
import OneSignal from 'react-native-onesignal';

// Mock the OneSignal module
jest.mock('react-native-onesignal', () => ({
  initialize: jest.fn(),
  login: jest.fn(),
  logout: jest.fn(),
  Debug: {
    setLogLevel: jest.fn(),
    setAlertLevel: jest.fn(),
  },
  User: {
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    getOnesignalId: jest.fn(),
    getExternalId: jest.fn(),
    addTag: jest.fn(),
    addEmail: jest.fn(),
    trackEvent: jest.fn(),
    pushSubscription: {
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      getIdAsync: jest.fn(),
      getTokenAsync: jest.fn(),
      getOptedInAsync: jest.fn(),
      optIn: jest.fn(),
      optOut: jest.fn(),
    },
  },
  Notifications: {
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    requestPermission: jest.fn(),
    getPermissionAsync: jest.fn(),
    clearAll: jest.fn(),
  },
  InAppMessages: {
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    addTrigger: jest.fn(),
    removeTrigger: jest.fn(),
  },
}));

describe('OneSignal Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize OneSignal with app ID', () => {
    const appId = 'test-app-id';
    OneSignal.initialize(appId);
    expect(OneSignal.initialize).toHaveBeenCalledWith(appId);
  });

  it('should set debug log level', () => {
    OneSignal.Debug.setLogLevel(5); // LogLevel.Verbose
    expect(OneSignal.Debug.setLogLevel).toHaveBeenCalledWith(5);
  });

  it('should login user with external ID', () => {
    const externalId = 'user123';
    OneSignal.login(externalId);
    expect(OneSignal.login).toHaveBeenCalledWith(externalId);
  });

  it('should logout user', () => {
    OneSignal.logout();
    expect(OneSignal.logout).toHaveBeenCalled();
  });

  it('should add user tag', () => {
    const key = 'user_type';
    const value = 'premium';
    OneSignal.User.addTag(key, value);
    expect(OneSignal.User.addTag).toHaveBeenCalledWith(key, value);
  });

  it('should add user email', () => {
    const email = 'test@example.com';
    OneSignal.User.addEmail(email);
    expect(OneSignal.User.addEmail).toHaveBeenCalledWith(email);
  });

  it('should track custom event', () => {
    const eventName = 'button_clicked';
    const properties = { button_id: 'login' };
    OneSignal.User.trackEvent(eventName, properties);
    expect(OneSignal.User.trackEvent).toHaveBeenCalledWith(
      eventName,
      properties,
    );
  });

  it('should add in-app message trigger', () => {
    const key = 'welcome_message';
    const value = 'true';
    OneSignal.InAppMessages.addTrigger(key, value);
    expect(OneSignal.InAppMessages.addTrigger).toHaveBeenCalledWith(key, value);
  });

  it('should request notification permission', async () => {
    const mockPermission = Promise.resolve(true);
    (OneSignal.Notifications.requestPermission as jest.Mock).mockReturnValue(
      mockPermission,
    );

    const result = await OneSignal.Notifications.requestPermission(false);
    expect(OneSignal.Notifications.requestPermission).toHaveBeenCalledWith(
      false,
    );
    expect(result).toBe(true);
  });

  it('should clear all notifications', () => {
    OneSignal.Notifications.clearAll();
    expect(OneSignal.Notifications.clearAll).toHaveBeenCalled();
  });
});
