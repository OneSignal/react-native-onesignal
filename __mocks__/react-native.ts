import { vi } from 'vitest';

export const createEmitterSubscriptionMock = (
  eventName: string,
  callback: (payload: unknown) => void,
) => ({
  remove: vi.fn(),
  emitter: {
    addListener: vi.fn(),
    removeAllListeners: vi.fn(),
    listenerCount: vi.fn(() => 1),
    emit: vi.fn(),
  },
  listener: () => callback,
  context: undefined,
  eventType: eventName,
  key: 0,
  subscriber: {
    addSubscription: vi.fn(),
    removeSubscription: vi.fn(),
    removeAllSubscriptions: vi.fn(),
    getSubscriptionsForType: vi.fn(),
  },
});

const mockRNOneSignal = {
  initialize: vi.fn(),
  login: vi.fn(),
  logout: vi.fn(),
  setPrivacyConsentRequired: vi.fn(),
  setPrivacyConsentGiven: vi.fn(),
  setLogLevel: vi.fn(),
  setAlertLevel: vi.fn(),
  enterLiveActivity: vi.fn(),
  exitLiveActivity: vi.fn(),
  setPushToStartToken: vi.fn(),
  removePushToStartToken: vi.fn(),
  setupDefaultLiveActivity: vi.fn(),
  startDefaultLiveActivity: vi.fn(),
  addPushSubscriptionObserver: vi.fn(),
  getPushSubscriptionId: vi.fn(),
  getPushSubscriptionToken: vi.fn(),
  getOptedIn: vi.fn(),
  optOut: vi.fn(),
  optIn: vi.fn(),
  addUserStateObserver: vi.fn(),
  getOnesignalId: vi.fn(),
  getExternalId: vi.fn(),
  setLanguage: vi.fn(),
  addAlias: vi.fn(),
  addAliases: vi.fn(),
  removeAlias: vi.fn(),
  removeAliases: vi.fn(),
  addEmail: vi.fn(),
  removeEmail: vi.fn(),
  addSms: vi.fn(),
  removeSms: vi.fn(),
  addTag: vi.fn(),
  addTags: vi.fn(),
  removeTags: vi.fn(),
  getTags: vi.fn(),
  hasNotificationPermission: vi.fn(),
  requestNotificationPermission: vi.fn(),
  canRequestNotificationPermission: vi.fn(),
  registerForProvisionalAuthorization: vi.fn(),
  permissionNative: vi.fn(),
  addNotificationClickListener: vi.fn(),
  addNotificationForegroundLifecycleListener: vi.fn(),
  addPermissionObserver: vi.fn(),
  clearAllNotifications: vi.fn(),
  removeNotification: vi.fn(),
  removeGroupedNotifications: vi.fn(),
  addInAppMessageClickListener: vi.fn(),
  addInAppMessagesLifecycleListener: vi.fn(),
  addTriggers: vi.fn(),
  removeTrigger: vi.fn(),
  removeTriggers: vi.fn(),
  clearTriggers: vi.fn(),
  paused: vi.fn(),
  getPaused: vi.fn(),
  requestLocationPermission: vi.fn(),
  setLocationShared: vi.fn(),
  isLocationShared: vi.fn(),
  addOutcome: vi.fn(),
  addUniqueOutcome: vi.fn(),
  addOutcomeWithValue: vi.fn(),
  displayNotification: vi.fn(),
};

const mockPlatform = {
  OS: 'ios',
};

export const NativeModules = {
  OneSignal: mockRNOneSignal,
};

export const Platform = mockPlatform;

export { mockPlatform, mockRNOneSignal };

export class NativeEventEmitter {
  constructor(_nativeModule: typeof mockRNOneSignal) {}

  addListener(eventName: string, callback: (payload: unknown) => void) {
    return createEmitterSubscriptionMock(eventName, callback);
  }

  removeListener(_eventName: string, _callback: (payload: unknown) => void) {
    // Mock implementation
  }

  removeAllListeners(_eventName: string) {
    // Mock implementation
  }
}
