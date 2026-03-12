import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

export interface Spec extends TurboModule {
  // OneSignal root
  initialize(appId: string): void;
  login(externalId: string): void;
  logout(): void;
  setPrivacyConsentRequired(required: boolean): void;
  setPrivacyConsentGiven(granted: boolean): void;

  // Debug
  setLogLevel(logLevel: number): void;
  setAlertLevel(logLevel: number): void;

  // Live Activities (iOS only, stubs on Android)
  enterLiveActivity(
    activityId: string,
    token: string,
    callback: (result: Object) => void,
  ): void;
  exitLiveActivity(
    activityId: string,
    callback: (result: Object) => void,
  ): void;
  setPushToStartToken(activityType: string, token: string): void;
  removePushToStartToken(activityType: string): void;
  setupDefaultLiveActivity(options: Object | null): void;
  startDefaultLiveActivity(
    activityId: string,
    attributes: Object,
    content: Object,
  ): void;

  // Push Subscription
  addPushSubscriptionObserver(): void;
  getPushSubscriptionId(): Promise<string | null>;
  getPushSubscriptionToken(): Promise<string | null>;
  getOptedIn(): Promise<boolean>;
  optIn(): void;
  optOut(): void;

  // User
  addUserStateObserver(): void;
  getOnesignalId(): Promise<string | null>;
  getExternalId(): Promise<string | null>;
  setLanguage(language: string): void;
  addAlias(label: string, id: string): void;
  addAliases(aliases: Object): void;
  removeAlias(label: string): void;
  removeAliases(labels: string[]): void;
  addEmail(email: string): void;
  removeEmail(email: string): void;
  addSms(smsNumber: string): void;
  removeSms(smsNumber: string): void;
  addTag(key: string, value: string): void;
  addTags(tags: Object): void;
  removeTags(keys: string[]): void;
  getTags(): Promise<Object>;
  trackEvent(name: string, properties: Object): void;

  // Notifications
  hasNotificationPermission(): Promise<boolean>;
  requestNotificationPermission(fallbackToSettings: boolean): Promise<boolean>;
  canRequestNotificationPermission(): Promise<boolean>;
  registerForProvisionalAuthorization(
    callback: (accepted: boolean) => void,
  ): void;
  permissionNative(): Promise<number>;
  addNotificationClickListener(): void;
  addNotificationForegroundLifecycleListener(): void;
  addPermissionObserver(): void;
  clearAllNotifications(): void;
  removeNotification(id: number): void;
  removeGroupedNotifications(id: string): void;
  displayNotification(notificationId: string): void;
  preventDefault(notificationId: string): void;

  // In-App Messages
  addInAppMessageClickListener(): void;
  addInAppMessagesLifecycleListener(): void;
  addTriggers(triggers: Object): void;
  removeTrigger(key: string): void;
  removeTriggers(keys: string[]): void;
  clearTriggers(): void;
  paused(pause: boolean): void;
  getPaused(): Promise<boolean>;

  // Location
  requestLocationPermission(): void;
  setLocationShared(shared: boolean): void;
  isLocationShared(): Promise<boolean>;

  // Session
  addOutcome(name: string): void;
  addUniqueOutcome(name: string): void;
  addOutcomeWithValue(name: string, value: number): void;

  // Events (required for NativeEventEmitter)
  addListener(eventName: string): void;
  removeListeners(count: number): void;
}

export default TurboModuleRegistry.getEnforcing<Spec>('OneSignal');
