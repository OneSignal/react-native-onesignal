import { Platform } from 'react-native';

import {
  IN_APP_MESSAGE_CLICKED,
  IN_APP_MESSAGE_DID_DISMISS,
  IN_APP_MESSAGE_DID_DISPLAY,
  IN_APP_MESSAGE_WILL_DISMISS,
  IN_APP_MESSAGE_WILL_DISPLAY,
  NOTIFICATION_CLICKED,
  NOTIFICATION_WILL_DISPLAY,
  PERMISSION_CHANGED,
  SUBSCRIPTION_CHANGED,
  USER_STATE_CHANGED,
} from './constants/events';
import type { OSNotificationPermission } from './constants/subscription';
import EventManager from './events/EventManager';
import NotificationWillDisplayEvent from './events/NotificationWillDisplayEvent';
import {
  encodeNullsForIOS,
  hasMissingEntries,
  hasMissingItems,
  isBoolean,
  isNativeModuleLoaded,
  isFunction,
  isMissing,
  isObject,
  isObjectSerializable,
  isValidCallback,
} from './helpers';
import NativeOneSignal from './NativeOneSignal';
import type {
  InAppMessage,
  InAppMessageClickEvent,
  InAppMessageDidDismissEvent,
  InAppMessageDidDisplayEvent,
  InAppMessageListeners,
  InAppMessageWillDismissEvent,
  InAppMessageWillDisplayEvent,
} from './types/inAppMessage';
import type { LiveActivitySetupOptions } from './types/liveActivities';
import type { NotificationClickEvent, NotificationListeners } from './types/notificationEvents';
import type { PushSubscriptionChangedState, PushSubscriptionState } from './types/subscription';
import type { UserChangedState, UserState } from './types/user';

const RNOneSignal = NativeOneSignal;

const GLOBAL_KEY = '__oneSignalEventManager';
const prev = (globalThis as Record<string, unknown>)[GLOBAL_KEY];
if (prev instanceof EventManager) {
  prev.clearListeners();
}
const eventManager = new EventManager(RNOneSignal);
(globalThis as Record<string, unknown>)[GLOBAL_KEY] = eventManager;

/// An enum that declares different types of log levels you can use with the OneSignal SDK, going from the least verbose (none) to verbose (print all comments).
export enum LogLevel {
  None,
  Fatal,
  Error,
  Warn,
  Info,
  Debug,
  Verbose,
}

// Native maps the level straight onto its own enum without a range check.
function isValidLogLevel(level: unknown, api: string): boolean {
  if (typeof level === 'number' && Number.isInteger(level) && level in LogLevel) return true;
  console.error(`OneSignal: ${api}: level must be a LogLevel value`);
  return false;
}

// iOS reads each flag with `boolValue`, which throws on objects, arrays, and NSNull.
function isValidSetupOptions(options: unknown): boolean {
  if (!isObject(options, 'setupDefault: options')) return false;
  return (['enablePushToStart', 'enablePushToUpdate'] as const).every((flag) => {
    if (options[flag] === undefined || typeof options[flag] === 'boolean') return true;
    console.error(`OneSignal: setupDefault: ${flag} must be a boolean`);
    return false;
  });
}

// iOS bridges tags into a Swift [String: String], which crashes on non-string values.
function stringifyValues(values: Record<string, unknown>): Record<string, string> {
  return Object.fromEntries(Object.entries(values).map(([key, value]) => [key, String(value)]));
}

let notificationPermission = false;
let permissionObserverAdded = false;
let subscriptionObserverAdded = false;
let permissionVersion = 0;
let subscriptionVersion = 0;

let pushSub: PushSubscriptionState = {
  id: '',
  token: '',
  optedIn: false,
};

async function _addPermissionObserver() {
  const version = ++permissionVersion;
  if (!permissionObserverAdded) {
    OneSignal.Notifications.addEventListener('permissionChange', (granted: boolean) => {
      permissionVersion++;
      notificationPermission = granted;
    });
    permissionObserverAdded = true;
  }

  const permission = await RNOneSignal.hasNotificationPermission();
  if (version === permissionVersion) notificationPermission = permission;
}

async function _addPushSubscriptionObserver() {
  const version = ++subscriptionVersion;
  if (!subscriptionObserverAdded) {
    OneSignal.User.pushSubscription.addEventListener('change', (subscriptionChange) => {
      subscriptionVersion++;
      pushSub = subscriptionChange.current;
    });
    subscriptionObserverAdded = true;
  }

  const [id, token, optedIn] = await Promise.all([
    RNOneSignal.getPushSubscriptionId(),
    RNOneSignal.getPushSubscriptionToken(),
    RNOneSignal.getOptedIn(),
  ]);
  if (version === subscriptionVersion) {
    pushSub = { id: id ?? undefined, token: token ?? undefined, optedIn };
  }
}

export namespace OneSignal {
  /** Initializes the OneSignal SDK. This should be called during startup of the application. */
  export function initialize(appId: string) {
    if (!isNativeModuleLoaded(RNOneSignal)) return;
    if (isMissing(appId, 'initialize: appId')) return;

    RNOneSignal.initialize(appId);

    void Promise.all([_addPermissionObserver(), _addPushSubscriptionObserver()]).catch((error) => {
      console.warn('OneSignal: failed to read initial state', error);
    });
  }

  /**
   * If your integration is user-centric, or you want the ability to identify the user beyond the current device, the
   * login method should be called to identify the user.
   */
  export function login(externalId: string) {
    if (!isNativeModuleLoaded(RNOneSignal)) return;
    if (isMissing(externalId, 'login: externalId')) return;

    RNOneSignal.login(externalId);
  }

  /**
   * Once (or if) the user is no longer identifiable in your app (i.e. they logged out), the logout method should be
   * called.
   */
  export function logout() {
    if (!isNativeModuleLoaded(RNOneSignal)) return;

    RNOneSignal.logout();
  }

  /** For GDPR users, your application should call this method before setting the App ID. */
  export function setConsentRequired(required: boolean) {
    if (!isNativeModuleLoaded(RNOneSignal)) return;
    if (!isBoolean(required, 'setConsentRequired: required')) return;

    RNOneSignal.setPrivacyConsentRequired(required);
  }

  /**
   * If your application is set to require the user's privacy consent, you can provide this consent using this method.
   * Indicates whether privacy consent has been granted. This field is only relevant when the application has opted
   * into data privacy protections.
   */
  export function setConsentGiven(granted: boolean) {
    if (!isNativeModuleLoaded(RNOneSignal)) return;
    if (!isBoolean(granted, 'setConsentGiven: granted')) return;

    RNOneSignal.setPrivacyConsentGiven(granted);
  }

  export namespace Debug {
    /**
     * Enable logging to help debug if you run into an issue setting up OneSignal.
     * @param {LogLevel} nsLogLevel - Sets the logging level to print to the Android LogCat log or Xcode log.
     */
    export function setLogLevel(nsLogLevel: LogLevel) {
      if (!isNativeModuleLoaded(RNOneSignal)) return;
      if (!isValidLogLevel(nsLogLevel, 'setLogLevel')) return;

      RNOneSignal.setLogLevel(nsLogLevel);
    }

    /**
     * Enable logging to help debug if you run into an issue setting up OneSignal.
     * @param {LogLevel} visualLogLevel - Sets the logging level to show as alert dialogs.
     */
    export function setAlertLevel(visualLogLevel: LogLevel) {
      if (!isNativeModuleLoaded(RNOneSignal)) return;
      if (!isValidLogLevel(visualLogLevel, 'setAlertLevel')) return;

      RNOneSignal.setAlertLevel(visualLogLevel);
    }
  }

  export namespace LiveActivities {
    /**
     * Indicate this device has entered a live activity, identified within OneSignal by the `activityId`.
     *
     * Only applies to iOS
     *
     * @param activityId: The activity identifier the live activity on this device will receive updates for.
     * @param token: The activity's update token to receive the updates.
     **/
    export function enter(
      activityId: string,
      token: string,
      handler: (result: object) => void = () => {},
    ) {
      if (!isNativeModuleLoaded(RNOneSignal)) return;

      if (Platform.OS === 'ios') {
        if (
          isMissing(activityId, 'enter: activityId') ||
          isMissing(token, 'enter: token') ||
          !isFunction(handler, 'enter: handler')
        ) {
          return;
        }
        RNOneSignal.enterLiveActivity(activityId, token, handler);
      }
    }

    /**
     * Indicate this device has exited a live activity, identified within OneSignal by the `activityId`.
     *
     * Only applies to iOS
     *
     * @deprecated Currently unsupported, avoid using this method.
     * @param activityId: The activity identifier the live activity on this device will no longer receive updates for.
     **/
    export function exit(activityId: string, handler: (result: object) => void = () => {}) {
      if (!isNativeModuleLoaded(RNOneSignal)) return;

      if (Platform.OS === 'ios') {
        if (isMissing(activityId, 'exit: activityId') || !isFunction(handler, 'exit: handler')) {
          return;
        }
        RNOneSignal.exitLiveActivity(activityId, handler);
      }
    }

    /**
     * Indicate this device is capable of receiving pushToStart live activities for the
     * `activityType`. The `activityType` **must** be the name of the struct conforming
     * to `ActivityAttributes` that will be used to start the live activity.
     *
     * Only applies to iOS
     *
     * @param activityType: The name of the specific `ActivityAttributes` structure tied
     * to the live activity.
     * @param token: The activity type's pushToStart token.
     */
    export function setPushToStartToken(activityType: string, token: string) {
      if (!isNativeModuleLoaded(RNOneSignal)) return;

      if (Platform.OS === 'ios') {
        if (
          isMissing(activityType, 'setPushToStartToken: activityType') ||
          isMissing(token, 'setPushToStartToken: token')
        ) {
          return;
        }
        RNOneSignal.setPushToStartToken(activityType, token);
      }
    }

    /**
     * Indicate this device is no longer capable of receiving pushToStart live activities
     * for the `activityType`. The `activityType` **must** be the name of the struct conforming
     * to `ActivityAttributes` that will be used to start the live activity.
     *
     * Only applies to iOS
     *
     * @param activityType: The name of the specific `ActivityAttributes` structure tied
     * to the live activity.
     */
    export function removePushToStartToken(activityType: string) {
      if (!isNativeModuleLoaded(RNOneSignal)) return;

      if (Platform.OS === 'ios') {
        if (isMissing(activityType, 'removePushToStartToken: activityType')) return;
        RNOneSignal.removePushToStartToken(activityType);
      }
    }

    /**
     * Enable the OneSignalSDK to setup the default`DefaultLiveActivityAttributes` structure,
     * which conforms to the `OneSignalLiveActivityAttributes`. When using this function, the
     * widget attributes are owned by the OneSignal SDK, which will allow the SDK to handle the
     * entire lifecycle of the live activity.  All that is needed from an app-perspective is to
     * create a Live Activity widget in a widget extension, with a `ActivityConfiguration` for
     * `DefaultLiveActivityAttributes`. This is most useful for users that (1) only have one Live
     * Activity widget and (2) are using a cross-platform framework and do not want to create the
     * cross-platform <-> iOS native bindings to manage ActivityKit.
     *
     * Only applies to iOS
     *
     * @param options: An optional structure to provide for more granular setup options.
     */
    export function setupDefault(options?: LiveActivitySetupOptions) {
      if (!isNativeModuleLoaded(RNOneSignal)) return;

      if (Platform.OS === 'ios') {
        if (options != null && !isValidSetupOptions(options)) return;
        RNOneSignal.setupDefaultLiveActivity(options ?? null);
      }
    }

    /**
     * Start a new LiveActivity that is modelled by the default`DefaultLiveActivityAttributes`
     * structure. The `DefaultLiveActivityAttributes` is initialized with the dynamic `attributes`
     * and `content` passed in.
     *
     * Only applies to iOS
     *
     * @param activityId: The activity identifier the live activity on this device will be started
     * and eligible to receive updates for.
     * @param attributes: A dynamic type containing the static attributes passed into `DefaultLiveActivityAttributes`.
     * @param content: A dynamic type containing the content attributes passed into `DefaultLiveActivityAttributes`.
     */
    export function startDefault(activityId: string, attributes: object, content: object) {
      if (!isNativeModuleLoaded(RNOneSignal)) return;

      if (Platform.OS === 'ios') {
        if (
          isMissing(activityId, 'startDefault: activityId') ||
          !isObject(attributes, 'startDefault: attributes') ||
          !isObject(content, 'startDefault: content')
        ) {
          return;
        }
        RNOneSignal.startDefaultLiveActivity(activityId, attributes, content);
      }
    }
  }

  export namespace User {
    export namespace pushSubscription {
      /** Add a callback that fires when the OneSignal subscription state changes. */
      export function addEventListener(
        _event: 'change',
        listener: (event: PushSubscriptionChangedState) => void,
      ) {
        if (!isNativeModuleLoaded(RNOneSignal)) return;

        isValidCallback(listener);
        RNOneSignal.addPushSubscriptionObserver();
        eventManager.addEventListener(SUBSCRIPTION_CHANGED, listener);
      }

      /** Clears current subscription observers. */
      export function removeEventListener(
        _event: 'change',
        listener: (event: PushSubscriptionChangedState) => void,
      ) {
        if (!isNativeModuleLoaded(RNOneSignal)) return;

        eventManager.removeEventListener(SUBSCRIPTION_CHANGED, listener);
      }

      /**
       * @deprecated This method is deprecated. It has been replaced by {@link getIdAsync}.
       */
      export function getPushSubscriptionId(): string {
        if (!isNativeModuleLoaded(RNOneSignal)) {
          return '';
        }
        console.warn(
          'OneSignal: This method has been deprecated. Use getIdAsync instead for getting push subscription id.',
        );

        return pushSub.id ? pushSub.id : '';
      }

      export async function getIdAsync(): Promise<string | null> {
        if (!isNativeModuleLoaded(RNOneSignal)) {
          return Promise.reject(new Error('OneSignal native module not loaded'));
        }

        return await RNOneSignal.getPushSubscriptionId();
      }

      /**
       * @deprecated This method is deprecated. It has been replaced by {@link getTokenAsync}.
       */
      export function getPushSubscriptionToken(): string {
        if (!isNativeModuleLoaded(RNOneSignal)) {
          return '';
        }
        console.warn(
          'OneSignal: This method has been deprecated. Use getTokenAsync instead for getting push subscription token.',
        );

        return pushSub.token ? pushSub.token : '';
      }

      /** The readonly push subscription token */
      export async function getTokenAsync(): Promise<string | null> {
        if (!isNativeModuleLoaded(RNOneSignal)) {
          return Promise.reject(new Error('OneSignal native module not loaded'));
        }

        return await RNOneSignal.getPushSubscriptionToken();
      }

      /**
       * @deprecated This method is deprecated. It has been replaced by {@link getOptedInAsync}.
       */
      export function getOptedIn(): boolean {
        if (!isNativeModuleLoaded(RNOneSignal)) {
          return false;
        }
        console.warn(
          'OneSignal: This method has been deprecated. Use getOptedInAsync instead for getting push subscription opted in status.',
        );

        return pushSub.optedIn ?? false;
      }

      /**
       * Gets a boolean value indicating whether the current user is opted in to push notifications.
       * This returns true when the app has notifications permission and optOut is not called.
       * Note: Does not take into account the existence of the subscription ID and push token.
       * This boolean may return true but push notifications may still not be received by the user.
       */
      export async function getOptedInAsync(): Promise<boolean> {
        if (!isNativeModuleLoaded(RNOneSignal)) {
          return Promise.reject(new Error('OneSignal native module not loaded'));
        }

        return await RNOneSignal.getOptedIn();
      }

      /** Disable the push notification subscription to OneSignal. */
      export function optOut() {
        if (!isNativeModuleLoaded(RNOneSignal)) return;

        RNOneSignal.optOut();
      }

      /** Enable the push notification subscription to OneSignal. */
      export function optIn() {
        if (!isNativeModuleLoaded(RNOneSignal)) return;

        RNOneSignal.optIn();
      }
    }

    /**
     * Add a callback that fires when the OneSignal user state changes.
     * Important: When using the observer to retrieve the onesignalId, check the externalId as well to confirm the values are associated with the expected user.
     */
    export function addEventListener(
      _event: 'change',
      listener: (event: UserChangedState) => void,
    ) {
      if (!isNativeModuleLoaded(RNOneSignal)) return;

      isValidCallback(listener);
      RNOneSignal.addUserStateObserver();
      eventManager.addEventListener(USER_STATE_CHANGED, listener);
    }

    /** Clears current user state observers. */
    export function removeEventListener(
      _event: 'change',
      listener: (event: UserChangedState) => void,
    ) {
      if (!isNativeModuleLoaded(RNOneSignal)) return;

      eventManager.removeEventListener(USER_STATE_CHANGED, listener);
    }

    /** Get the nullable OneSignal Id associated with the user. */
    export async function getOnesignalId(): Promise<string | null> {
      if (!isNativeModuleLoaded(RNOneSignal)) {
        return Promise.reject(new Error('OneSignal native module not loaded'));
      }
      return RNOneSignal.getOnesignalId();
    }

    /** Get the nullable External Id associated with the user. */
    export async function getExternalId(): Promise<string | null> {
      if (!isNativeModuleLoaded(RNOneSignal)) {
        return Promise.reject(new Error('OneSignal native module not loaded'));
      }
      return RNOneSignal.getExternalId();
    }

    /** Explicitly set a 2-character language code for the user. Empty string resets to the device language. */
    export function setLanguage(language: string) {
      if (!isNativeModuleLoaded(RNOneSignal)) return;
      if (typeof language !== 'string') {
        console.error('OneSignal: setLanguage: language is required');
        return;
      }

      RNOneSignal.setLanguage(language);
    }

    /** Set an alias for the current user. If this alias label already exists on this user, it will be overwritten with the new alias id. */
    export function addAlias(label: string, id: string) {
      if (!isNativeModuleLoaded(RNOneSignal)) return;
      if (isMissing(label, 'addAlias: label') || isMissing(id, 'addAlias: id')) return;

      RNOneSignal.addAlias(label, id);
    }

    /** Set aliases for the current user. If any alias already exists, it will be overwritten to the new values. */
    export function addAliases(aliases: Record<string, string>) {
      if (!isNativeModuleLoaded(RNOneSignal)) return;
      if (hasMissingEntries(aliases, 'addAliases')) return;

      RNOneSignal.addAliases(aliases);
    }

    /** Remove an alias from the current user. */
    export function removeAlias(label: string) {
      if (!isNativeModuleLoaded(RNOneSignal)) return;
      if (isMissing(label, 'removeAlias: label')) return;

      RNOneSignal.removeAlias(label);
    }

    /** Remove aliases from the current user. */
    export function removeAliases(labels: string[]) {
      if (!isNativeModuleLoaded(RNOneSignal)) return;
      if (hasMissingItems(labels, 'removeAliases', 'label')) return;

      RNOneSignal.removeAliases(labels);
    }

    /** Add a new email subscription to the current user. */
    export function addEmail(email: string) {
      if (!isNativeModuleLoaded(RNOneSignal)) return;
      if (isMissing(email, 'addEmail: email')) return;

      RNOneSignal.addEmail(email);
    }

    /**
     * Remove an email subscription from the current user. Returns false if the specified email does not exist on the user within the SDK,
     * and no request will be made.
     */
    export function removeEmail(email: string) {
      if (!isNativeModuleLoaded(RNOneSignal)) return;
      if (isMissing(email, 'removeEmail: email')) return;

      RNOneSignal.removeEmail(email);
    }

    /** Add a new SMS subscription to the current user. */
    export function addSms(smsNumber: string) {
      if (!isNativeModuleLoaded(RNOneSignal)) return;
      if (isMissing(smsNumber, 'addSms: smsNumber')) return;

      RNOneSignal.addSms(smsNumber);
    }

    /**
     * Remove an SMS subscription from the current user. Returns false if the specified SMS number does not exist on the user within the SDK,
     * and no request will be made.
     */
    export function removeSms(smsNumber: string) {
      if (!isNativeModuleLoaded(RNOneSignal)) return;
      if (isMissing(smsNumber, 'removeSms: smsNumber')) return;

      RNOneSignal.removeSms(smsNumber);
    }

    /**
     * Add a tag for the current user. Tags are key:value pairs used as building blocks for targeting specific users and/or personalizing
     * messages. If the tag key already exists, it will be replaced with the value provided here.
     */
    export function addTag(key: string, value: string) {
      if (!isNativeModuleLoaded(RNOneSignal)) return;

      if (isMissing(key, 'addTag: key')) return;
      if (value == null) {
        console.error('OneSignal: addTag: value is required');
        return;
      }

      RNOneSignal.addTag(key, String(value));
    }

    /**
     * Add multiple tags for the current user. Tags are key:value pairs used as building blocks for targeting
     * specific users and/or personalizing messages. If the tag key already exists, it will be replaced with
     * the value provided here.
     */
    export function addTags(tags: Record<string, string>) {
      if (!isNativeModuleLoaded(RNOneSignal)) return;
      if (hasMissingEntries(tags, 'addTags', true)) return;

      RNOneSignal.addTags(stringifyValues(tags));
    }

    /** Remove the data tag with the provided key from the current user. */
    export function removeTag(key: string) {
      if (!isNativeModuleLoaded(RNOneSignal)) return;
      if (isMissing(key, 'removeTag: key')) return;

      RNOneSignal.removeTag(key);
    }

    /** Remove multiple tags with the provided keys from the current user. */
    export function removeTags(keys: string[]) {
      if (!isNativeModuleLoaded(RNOneSignal)) return;
      if (hasMissingItems(keys, 'removeTags', 'key')) return;

      RNOneSignal.removeTags(keys);
    }

    /** Returns the local tags for the current user. */
    export async function getTags(): Promise<{ [key: string]: string }> {
      if (!isNativeModuleLoaded(RNOneSignal)) {
        return Promise.reject(new Error('OneSignal native module not loaded'));
      }

      const tags = await RNOneSignal.getTags();
      return tags as { [key: string]: string };
    }

    /**
     * Track custom events for the current user.
     *
     * @param name - The event name.
     * @param properties - A JSON-serializable object, sent as its `JSON.stringify` result:
     * `NaN` and `Infinity` become `null`, `Date` values become ISO strings, and `undefined`
     * values and functions are omitted.
     */
    export function trackEvent(name: string, properties: Record<string, unknown> = {}) {
      if (!isNativeModuleLoaded(RNOneSignal)) return;
      if (isMissing(name, 'trackEvent: name')) return;

      if (!isObjectSerializable(properties)) {
        console.error('OneSignal: trackEvent: properties must be a JSON-serializable object');
        return;
      }

      // Native JSON serializers reject NaN and Infinity (Android throws, iOS drops the event),
      // so send the JSON round-trip, where they become null.
      const json = JSON.parse(JSON.stringify(properties)) as Record<string, unknown>;

      // The iOS TurboModule bridge drops dictionary entries whose value is
      // `null`. Encode nulls as a sentinel string so the native side can
      // restore them as `NSNull`. See SDK-4386.
      const payload = Platform.OS === 'ios' ? encodeNullsForIOS(json) : json;

      RNOneSignal.trackEvent(name, payload);
    }
  }

  export namespace Notifications {
    /**
     * @deprecated This method is deprecated. It has been replaced by {@link getPermissionAsync}.
     */
    export function hasPermission(): boolean {
      console.warn(
        'OneSignal: This method has been deprecated. Use getPermissionAsync instead for getting notification permission status.',
      );

      return notificationPermission;
    }

    /**
     * Whether this app has push notification permission. Returns true if the user has accepted permissions,
     * or if the app has ephemeral or provisional permission.
     */
    export async function getPermissionAsync(): Promise<boolean> {
      return RNOneSignal.hasNotificationPermission();
    }

    /**
     * Prompt the user for permission to receive push notifications. This will display the native system prompt to request push
     * notification permission. Use the fallbackToSettings parameter to prompt to open the settings app if a user has already
     * declined push permissions.
     */
    export function requestPermission(fallbackToSettings = false): Promise<boolean> {
      if (!isNativeModuleLoaded(RNOneSignal)) {
        return Promise.reject(new Error('OneSignal native module not loaded'));
      }
      if (!isBoolean(fallbackToSettings, 'requestPermission: fallbackToSettings')) {
        return Promise.reject(new Error('fallbackToSettings must be a boolean'));
      }

      return RNOneSignal.requestNotificationPermission(fallbackToSettings);
    }

    /**
     * Whether attempting to request notification permission will show a prompt. Returns true if the device has not been prompted for push
     * notification permission already.
     */
    export function canRequestPermission(): Promise<boolean> {
      if (!isNativeModuleLoaded(RNOneSignal)) {
        return Promise.reject(new Error('OneSignal native module not loaded'));
      }

      return RNOneSignal.canRequestNotificationPermission();
    }

    /**
     * Instead of having to prompt the user for permission to send them push notifications, your app can request provisional authorization.
     * For more information: https://documentation.onesignal.com/docs/ios-customizations#provisional-push-notifications
     * @param  {(response:{accepted:boolean})=>void} handler
     */
    export function registerForProvisionalAuthorization(handler: (response: boolean) => void) {
      if (!isNativeModuleLoaded(RNOneSignal)) return;

      if (Platform.OS === 'ios') {
        isValidCallback(handler);
        RNOneSignal.registerForProvisionalAuthorization(handler);
      } else {
        console.warn(
          'registerForProvisionalAuthorization: this function is not supported on Android',
        );
      }
    }

    /** iOS Only.
     * Returns the enum for the native permission of the device. It will be one of:
     * OSNotificationPermissionNotDetermined,
     * OSNotificationPermissionDenied,
     * OSNotificationPermissionAuthorized,
     * OSNotificationPermissionProvisional - only available in iOS 12,
     * OSNotificationPermissionEphemeral - only available in iOS 14
     * */
    export function permissionNative(): Promise<OSNotificationPermission> {
      if (!isNativeModuleLoaded(RNOneSignal)) {
        return Promise.reject(new Error('OneSignal native module not loaded'));
      }

      return RNOneSignal.permissionNative();
    }

    /**
     * Add listeners for notification click and/or lifecycle events. */
    export function addEventListener(...[event, listener]: NotificationListeners): void {
      if (!isNativeModuleLoaded(RNOneSignal)) return;
      isValidCallback(listener);

      /* v8 ignore else -- @preserve */
      if (event === 'click') {
        RNOneSignal.addNotificationClickListener();
        eventManager.addEventListener(NOTIFICATION_CLICKED, listener);
      } else if (event === 'foregroundWillDisplay') {
        RNOneSignal.addNotificationForegroundLifecycleListener();
        eventManager.addEventListener(NOTIFICATION_WILL_DISPLAY, listener);
      } else if (event === 'permissionChange') {
        RNOneSignal.addPermissionObserver();
        eventManager.addEventListener(PERMISSION_CHANGED, listener);
      }
    }

    /**
     * Remove listeners for notification click and/or lifecycle events. */
    export function removeEventListener(...[event, listener]: NotificationListeners): void {
      /* v8 ignore else -- @preserve */
      if (event === 'click') {
        eventManager.removeEventListener(NOTIFICATION_CLICKED, listener);
      } else if (event === 'foregroundWillDisplay') {
        eventManager.removeEventListener(NOTIFICATION_WILL_DISPLAY, listener);
      } else if (event === 'permissionChange') {
        eventManager.removeEventListener(PERMISSION_CHANGED, listener);
      }
    }

    /**
     * Removes all OneSignal notifications.
     */
    export function clearAll() {
      if (!isNativeModuleLoaded(RNOneSignal)) return;

      RNOneSignal.clearAllNotifications();
    }

    /**
     * Android Only.
     * Removes a single OneSignal notification based on its Android notification integer id.
     */
    export function removeNotification(id: number) {
      if (!isNativeModuleLoaded(RNOneSignal)) return;

      if (Platform.OS === 'android') {
        RNOneSignal.removeNotification(id);
      } else {
        console.warn('removeNotification: this function is not supported on iOS');
      }
    }

    /**
     * Android Only.
     * Removes all OneSignal notifications based on its Android notification group Id.
     * @param {string} id - notification group id to cancel
     */
    export function removeGroupedNotifications(id: string) {
      if (!isNativeModuleLoaded(RNOneSignal)) return;

      if (Platform.OS === 'android') {
        if (isMissing(id, 'removeGroupedNotifications: id')) return;
        RNOneSignal.removeGroupedNotifications(id);
      } else {
        console.warn('removeGroupedNotifications: this function is not supported on iOS');
      }
    }
  }

  export namespace InAppMessages {
    /**
     * Add listeners for In-App Message click and/or lifecycle events.
     */
    export function addEventListener(...[event, listener]: InAppMessageListeners): void {
      if (!isNativeModuleLoaded(RNOneSignal)) return;
      isValidCallback(listener);

      /* v8 ignore else -- @preserve */
      if (event === 'click') {
        RNOneSignal.addInAppMessageClickListener();
        eventManager.addEventListener(IN_APP_MESSAGE_CLICKED, listener);
      } else if (event === 'willDisplay') {
        RNOneSignal.addInAppMessagesLifecycleListener();
        eventManager.addEventListener(IN_APP_MESSAGE_WILL_DISPLAY, listener);
      } else if (event === 'didDisplay') {
        RNOneSignal.addInAppMessagesLifecycleListener();
        eventManager.addEventListener(IN_APP_MESSAGE_DID_DISPLAY, listener);
      } else if (event === 'willDismiss') {
        RNOneSignal.addInAppMessagesLifecycleListener();
        eventManager.addEventListener(IN_APP_MESSAGE_WILL_DISMISS, listener);
      } else if (event === 'didDismiss') {
        RNOneSignal.addInAppMessagesLifecycleListener();
        eventManager.addEventListener(IN_APP_MESSAGE_DID_DISMISS, listener);
      }
    }

    /**
     * Remove listeners for In-App Message click and/or lifecycle events.
     */
    export function removeEventListener(...[event, listener]: InAppMessageListeners): void {
      if (!isNativeModuleLoaded(RNOneSignal)) return;

      if (event === 'click') {
        eventManager.removeEventListener(IN_APP_MESSAGE_CLICKED, listener);
      } else if (event === 'willDisplay') {
        eventManager.removeEventListener(IN_APP_MESSAGE_WILL_DISPLAY, listener);
      } else if (event === 'didDisplay') {
        eventManager.removeEventListener(IN_APP_MESSAGE_DID_DISPLAY, listener);
      } else if (event === 'willDismiss') {
        eventManager.removeEventListener(IN_APP_MESSAGE_WILL_DISMISS, listener);
      } else if (event === 'didDismiss') {
        eventManager.removeEventListener(IN_APP_MESSAGE_DID_DISMISS, listener);
      }
    }

    /**
     * Add a trigger for the current user. Triggers are currently explicitly used to determine whether a specific IAM should be
     * displayed to the user.
     */
    export function addTrigger(key: string, value: string) {
      if (!isNativeModuleLoaded(RNOneSignal)) return;

      // false is a valid trigger value, so reject only null/undefined for value.
      if (isMissing(key, 'addTrigger: key')) return;
      if (value == null) {
        console.error('OneSignal: addTrigger: value is required');
        return;
      }

      RNOneSignal.addTrigger(key, value);
    }

    /**
     * Add multiple triggers for the current user. Triggers are currently explicitly used to determine whether a specific IAM should
     * be displayed to the user.
     */
    export function addTriggers(triggers: Record<string, string>) {
      if (!isNativeModuleLoaded(RNOneSignal)) return;
      if (hasMissingEntries(triggers, 'addTriggers', true)) return;

      RNOneSignal.addTriggers(triggers);
    }

    /** Remove the trigger with the provided key from the current user. */
    export function removeTrigger(key: string) {
      if (!isNativeModuleLoaded(RNOneSignal)) return;
      if (isMissing(key, 'removeTrigger: key')) return;

      RNOneSignal.removeTrigger(key);
    }

    /** Remove multiple triggers from the current user. */
    export function removeTriggers(keys: string[]) {
      if (!isNativeModuleLoaded(RNOneSignal)) return;
      if (hasMissingItems(keys, 'removeTriggers', 'key')) return;

      RNOneSignal.removeTriggers(keys);
    }

    /** Clear all triggers from the current user. */
    export function clearTriggers() {
      if (!isNativeModuleLoaded(RNOneSignal)) return;

      RNOneSignal.clearTriggers();
    }

    /**
     * Set whether in-app messaging is currently paused.
     * When set to true no IAM will be presented to the user regardless of whether they qualify for them.
     * When set to 'false` any IAMs the user qualifies for will be presented to the user at the appropriate time.
     */
    export function setPaused(pause: boolean) {
      if (!isNativeModuleLoaded(RNOneSignal)) return;
      if (!isBoolean(pause, 'setPaused: pause')) return;

      RNOneSignal.paused(pause);
    }

    /** Whether in-app messaging is currently paused. */
    export function getPaused(): Promise<boolean> {
      if (!isNativeModuleLoaded(RNOneSignal)) {
        return Promise.reject(new Error('OneSignal native module not loaded'));
      }

      return RNOneSignal.getPaused();
    }
  }

  export namespace Location {
    /** Prompts the user for location permissions to allow geotagging from the OneSignal dashboard. */
    export function requestPermission() {
      if (!isNativeModuleLoaded(RNOneSignal)) return;

      RNOneSignal.requestLocationPermission();
    }

    /** Disable or enable location collection (defaults to enabled if your app has location permission). */
    export function setShared(shared: boolean) {
      if (!isNativeModuleLoaded(RNOneSignal)) return;
      if (!isBoolean(shared, 'setShared: shared')) return;

      RNOneSignal.setLocationShared(shared);
    }

    /**
     * Checks if location collection is enabled or disabled.
     * @param {(value: boolean) => void} handler
     */
    export function isShared(): Promise<boolean> {
      if (!isNativeModuleLoaded(RNOneSignal)) {
        return Promise.reject(new Error('OneSignal native module not loaded'));
      }

      return RNOneSignal.isLocationShared();
    }
  }

  export namespace Session {
    /** Increases the "Count" of this Outcome by 1 and will be counted each time sent. */
    export function addOutcome(name: string) {
      if (!isNativeModuleLoaded(RNOneSignal)) return;
      if (isMissing(name, 'addOutcome: name')) return;

      RNOneSignal.addOutcome(name);
    }

    /** Increases "Count" by 1 only once. This can only be attributed to a single notification. */
    export function addUniqueOutcome(name: string) {
      if (!isNativeModuleLoaded(RNOneSignal)) return;
      if (isMissing(name, 'addUniqueOutcome: name')) return;

      RNOneSignal.addUniqueOutcome(name);
    }

    /**
     * Increases the "Count" of this Outcome by 1 and the "Sum" by the value. Will be counted each time sent.
     * If the method is called outside of an attribution window, it will be unattributed until a new session occurs.
     */
    export function addOutcomeWithValue(name: string, value: string | number) {
      if (!isNativeModuleLoaded(RNOneSignal)) return;

      if (isMissing(name, 'addOutcomeWithValue: name')) return;

      const numericValue = typeof value === 'string' && value.trim() !== '' ? Number(value) : value;
      if (typeof numericValue !== 'number' || !Number.isFinite(numericValue)) {
        console.error('OneSignal: addOutcomeWithValue: value must be a finite number');
        return;
      }

      RNOneSignal.addOutcomeWithValue(name, numericValue);
    }
  }
}

export { OSNotificationPermission } from './constants/subscription';
export {
  NotificationWillDisplayEvent,
  type InAppMessage,
  type InAppMessageClickEvent,
  type InAppMessageDidDismissEvent,
  type InAppMessageDidDisplayEvent,
  type InAppMessageWillDismissEvent,
  type InAppMessageWillDisplayEvent,
  type NotificationClickEvent,
  type PushSubscriptionChangedState,
  type UserChangedState,
  type UserState,
};

export { default as OSNotification } from './OSNotification';
export type { InAppMessageClickResult } from './types/inAppMessage';
export type { NotificationClickResult } from './types/notificationEvents';
export type { PushSubscriptionState } from './types/subscription';
