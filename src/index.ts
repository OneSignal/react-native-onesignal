'use strict';

import { NativeModules, Platform } from 'react-native';
import EventManager from './events/EventManager';
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
} from './events/events';
import {
  NotificationEventName,
  NotificationEventTypeMap,
  NotificationClickEvent,
} from './models/NotificationEvents';
import {
  PushSubscriptionState,
  OSNotificationPermission,
  PushSubscriptionChangedState,
} from './models/Subscription';
import { UserState, UserChangedState } from './models/User';
import NotificationWillDisplayEvent from './events/NotificationWillDisplayEvent';
import {
  InAppMessage,
  InAppMessageEventTypeMap,
  InAppMessageEventName,
  InAppMessageClickEvent,
  InAppMessageWillDisplayEvent,
  InAppMessageDidDisplayEvent,
  InAppMessageWillDismissEvent,
  InAppMessageDidDismissEvent,
} from './models/InAppMessage';
import { isValidCallback, isNativeModuleLoaded } from './helpers';

const RNOneSignal = NativeModules.OneSignal;
const eventManager = new EventManager(RNOneSignal);

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

// Internal wrapper notification permission state that is being updated by the permission change handler.
let notificationPermission = false;

// Internal wrapper push subscription state that is being updated by the subscription change handler.
let pushSub: PushSubscriptionState = {
  id: '',
  token: '',
  optedIn: false,
};

async function _addPermissionObserver() {
  OneSignal.Notifications.addEventListener('permissionChange', (granted) => {
    notificationPermission = granted;
  });

  notificationPermission = await RNOneSignal.hasNotificationPermission();
}

async function _addPushSubscriptionObserver() {
  OneSignal.User.pushSubscription.addEventListener(
    'change',
    (subscriptionChange) => {
      pushSub = subscriptionChange.current;
    },
  );

  pushSub.id = await RNOneSignal.getPushSubscriptionId();
  pushSub.token = await RNOneSignal.getPushSubscriptionToken();
  pushSub.optedIn = await RNOneSignal.getOptedIn();
}

export namespace OneSignal {
  /** Initializes the OneSignal SDK. This should be called during startup of the application. */
  export function initialize(appId: string) {
    if (!isNativeModuleLoaded(RNOneSignal)) return;

    RNOneSignal.initialize(appId);

    _addPermissionObserver();
    _addPushSubscriptionObserver();
  }

  /**
   * If your integration is user-centric, or you want the ability to identify the user beyond the current device, the
   * login method should be called to identify the user.
   */
  export function login(externalId: string) {
    if (!isNativeModuleLoaded(RNOneSignal)) return;

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

    RNOneSignal.setPrivacyConsentRequired(required);
  }

  /**
   * If your application is set to require the user's privacy consent, you can provide this consent using this method.
   * Indicates whether privacy consent has been granted. This field is only relevant when the application has opted
   * into data privacy protections.
   */
  export function setConsentGiven(granted: boolean) {
    if (!isNativeModuleLoaded(RNOneSignal)) return;

    RNOneSignal.setPrivacyConsentGiven(granted);
  }

  export namespace Debug {
    /**
     * Enable logging to help debug if you run into an issue setting up OneSignal.
     * @param {LogLevel} nsLogLevel - Sets the logging level to print to the Android LogCat log or Xcode log.
     */
    export function setLogLevel(nsLogLevel: LogLevel) {
      if (!isNativeModuleLoaded(RNOneSignal)) return;

      RNOneSignal.setLogLevel(nsLogLevel);
    }

    /**
     * Enable logging to help debug if you run into an issue setting up OneSignal.
     * @param {LogLevel} visualLogLevel - Sets the logging level to show as alert dialogs.
     */
    export function setAlertLevel(visualLogLevel: LogLevel) {
      if (!isNativeModuleLoaded(RNOneSignal)) return;

      RNOneSignal.setAlertLevel(visualLogLevel);
    }
  }

  export namespace LiveActivities {
    /**
     * Associates a temporary push token with an Activity ID on the OneSignal server.
     */
    export function enter(
      activityId: string,
      token: string,
      handler?: Function,
    ) {
      if (!isNativeModuleLoaded(RNOneSignal)) return;

      if (!handler) {
        handler = () => {};
      }

      // Only Available on iOS
      if (Platform.OS === 'ios') {
        RNOneSignal.enterLiveActivity(activityId, token, handler);
      }
    }

    /**
     * Deletes activityId associated temporary push token on the OneSignal server.
     */
    export function exit(activityId: string, handler?: Function) {
      if (!isNativeModuleLoaded(RNOneSignal)) return;

      if (!handler) {
        handler = () => {};
      }

      // Only Available on iOS
      if (Platform.OS === 'ios') {
        RNOneSignal.exitLiveActivity(activityId, handler);
      }
    }
  }

  export namespace User {
    export namespace pushSubscription {
      /** Add a callback that fires when the OneSignal subscription state changes. */
      export function addEventListener(
        event: 'change',
        listener: (event: PushSubscriptionChangedState) => void,
      ) {
        if (!isNativeModuleLoaded(RNOneSignal)) return;

        isValidCallback(listener);
        RNOneSignal.addPushSubscriptionObserver();
        eventManager.addEventListener<PushSubscriptionChangedState>(
          SUBSCRIPTION_CHANGED,
          listener,
        );
      }

      /** Clears current subscription observers. */
      export function removeEventListener(
        event: 'change',
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
          return Promise.reject(
            new Error('OneSignal native module not loaded'),
          );
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
          return Promise.reject(
            new Error('OneSignal native module not loaded'),
          );
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

        return pushSub.optedIn;
      }

      /**
       * Gets a boolean value indicating whether the current user is opted in to push notifications.
       * This returns true when the app has notifications permission and optOut is not called.
       * Note: Does not take into account the existence of the subscription ID and push token.
       * This boolean may return true but push notifications may still not be received by the user.
       */
      export async function getOptedInAsync(): Promise<boolean> {
        if (!isNativeModuleLoaded(RNOneSignal)) {
          return Promise.reject(
            new Error('OneSignal native module not loaded'),
          );
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
      event: 'change',
      listener: (event: UserChangedState) => void,
    ) {
      if (!isNativeModuleLoaded(RNOneSignal)) return;

      isValidCallback(listener);
      RNOneSignal.addUserStateObserver();
      eventManager.addEventListener<UserChangedState>(
        USER_STATE_CHANGED,
        listener,
      );
    }

    /** Clears current user state observers. */
    export function removeEventListener(
      event: 'change',
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

    /** Explicitly set a 2-character language code for the user. */
    export function setLanguage(language: string) {
      if (!isNativeModuleLoaded(RNOneSignal)) return;

      RNOneSignal.setLanguage(language);
    }

    /** Set an alias for the current user. If this alias label already exists on this user, it will be overwritten with the new alias id. */
    export function addAlias(label: string, id: string) {
      if (!isNativeModuleLoaded(RNOneSignal)) return;

      RNOneSignal.addAlias(label, id);
    }

    /** Set aliases for the current user. If any alias already exists, it will be overwritten to the new values. */
    export function addAliases(aliases: object) {
      if (!isNativeModuleLoaded(RNOneSignal)) return;

      RNOneSignal.addAliases(aliases);
    }

    /** Remove an alias from the current user. */
    export function removeAlias(label: string) {
      if (!isNativeModuleLoaded(RNOneSignal)) return;

      RNOneSignal.removeAlias(label);
    }

    /** Remove aliases from the current user. */
    export function removeAliases(labels: string[]) {
      if (!isNativeModuleLoaded(RNOneSignal)) return;

      RNOneSignal.removeAliases(labels);
    }

    /** Add a new email subscription to the current user. */
    export function addEmail(email: string) {
      if (!isNativeModuleLoaded(RNOneSignal)) return;

      RNOneSignal.addEmail(email);
    }

    /**
     * Remove an email subscription from the current user. Returns false if the specified email does not exist on the user within the SDK,
     * and no request will be made.
     */
    export function removeEmail(email: string) {
      if (!isNativeModuleLoaded(RNOneSignal)) return;

      RNOneSignal.removeEmail(email);
    }

    /** Add a new SMS subscription to the current user. */
    export function addSms(smsNumber: string) {
      if (!isNativeModuleLoaded(RNOneSignal)) return;

      RNOneSignal.addSms(smsNumber);
    }

    /**
     * Remove an SMS subscription from the current user. Returns false if the specified SMS number does not exist on the user within the SDK,
     * and no request will be made.
     */
    export function removeSms(smsNumber: string) {
      if (!isNativeModuleLoaded(RNOneSignal)) return;

      RNOneSignal.removeSms(smsNumber);
    }

    /**
     * Add a tag for the current user. Tags are key:value pairs used as building blocks for targeting specific users and/or personalizing
     * messages. If the tag key already exists, it will be replaced with the value provided here.
     */
    export function addTag(key: string, value: string) {
      if (!isNativeModuleLoaded(RNOneSignal)) return;

      if (!key || value === undefined || value === null) {
        console.error('OneSignal: addTag: must include a key and a value');
        return;
      }

      // forces values to be string types
      if (typeof value !== 'string') {
        console.warn(
          'OneSignal: addTag: tag value must be of type string; attempting to convert',
        );
        value = String(value);
      }

      RNOneSignal.addTag(key, value);
    }

    /**
     * Add multiple tags for the current user. Tags are key:value pairs used as building blocks for targeting
     * specific users and/or personalizing messages. If the tag key already exists, it will be replaced with
     * the value provided here.
     */
    export function addTags(tags: object) {
      if (!isNativeModuleLoaded(RNOneSignal)) return;

      if (!tags || Object.keys(tags).length === 0) {
        console.error(
          'OneSignal: addTags: argument must be of type object of the form { key : "value" }',
        );
        return;
      }

      const convertedTags = tags as { [key: string]: any };
      Object.keys(tags).forEach(function (key) {
        if (typeof convertedTags[key] !== 'string') {
          console.warn(
            'OneSignal: addTags: tag value for key ' +
              key +
              ' must be of type string; attempting to convert',
          );
          convertedTags[key] = String(convertedTags[key]);
        }
      });

      RNOneSignal.addTags(tags);
    }

    /** Remove the data tag with the provided key from the current user. */
    export function removeTag(key: string) {
      if (!isNativeModuleLoaded(RNOneSignal)) return;

      if (typeof key !== 'string') {
        console.error(
          'OneSignal: removeTag: key argument must be of type string',
        );
        return;
      }

      RNOneSignal.removeTags([key]);
    }

    /** Remove multiple tags with the provided keys from the current user. */
    export function removeTags(keys: string[]) {
      if (!isNativeModuleLoaded(RNOneSignal)) return;

      if (!Array.isArray(keys)) {
        console.error('OneSignal: removeTags: argument must be of array type');
        return;
      }

      RNOneSignal.removeTags(keys);
    }

    /** Returns the local tags for the current user. */
    export function getTags(): Promise<{ [key: string]: string }> {
      if (!isNativeModuleLoaded(RNOneSignal)) {
        return Promise.reject(new Error('OneSignal native module not loaded'));
      }

      return RNOneSignal.getTags();
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
    export function requestPermission(
      fallbackToSettings: boolean,
    ): Promise<boolean> {
      if (!isNativeModuleLoaded(RNOneSignal)) {
        return Promise.reject(new Error('OneSignal native module not loaded'));
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
    export function registerForProvisionalAuthorization(
      handler: (response: boolean) => void,
    ) {
      if (!isNativeModuleLoaded(RNOneSignal)) return;

      if (Platform.OS === 'ios') {
        isValidCallback(handler);
        RNOneSignal.registerForProvisionalAuthorization(handler);
      } else {
        console.log(
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
    export function addEventListener<K extends NotificationEventName>(
      event: K,
      listener: (event: NotificationEventTypeMap[K]) => void,
    ): void {
      if (!isNativeModuleLoaded(RNOneSignal)) return;
      isValidCallback(listener);

      if (event === 'click') {
        RNOneSignal.addNotificationClickListener();
        eventManager.addEventListener<NotificationClickEvent>(
          NOTIFICATION_CLICKED,
          listener as (event: NotificationClickEvent) => void,
        );
      } else if (event === 'foregroundWillDisplay') {
        RNOneSignal.addNotificationForegroundLifecycleListener();
        eventManager.addEventListener<NotificationWillDisplayEvent>(
          NOTIFICATION_WILL_DISPLAY,
          listener as (event: NotificationWillDisplayEvent) => void,
        );
      } else if (event === 'permissionChange') {
        isValidCallback(listener);
        RNOneSignal.addPermissionObserver();
        eventManager.addEventListener<boolean>(
          PERMISSION_CHANGED,
          listener as (event: boolean) => void,
        );
      }
    }

    /**
     * Remove listeners for notification click and/or lifecycle events. */
    export function removeEventListener<K extends NotificationEventName>(
      event: K,
      listener: (event: NotificationEventTypeMap[K]) => void,
    ): void {
      if (event === 'click') {
        eventManager.removeEventListener(NOTIFICATION_CLICKED, listener);
      } else if (event === 'foregroundWillDisplay') {
        eventManager.removeEventListener(NOTIFICATION_WILL_DISPLAY, listener);
      } else if (event === 'permissionChange') {
        eventManager.removeEventListener(PERMISSION_CHANGED, listener);
      } else {
        return;
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
        console.log(
          'removeNotification: this function is not supported on iOS',
        );
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
        RNOneSignal.removeGroupedNotifications(id);
      } else {
        console.log(
          'removeGroupedNotifications: this function is not supported on iOS',
        );
      }
    }
  }

  export namespace InAppMessages {
    /**
     * Add listeners for In-App Message click and/or lifecycle events.
     */
    export function addEventListener<K extends InAppMessageEventName>(
      event: K,
      listener: (event: InAppMessageEventTypeMap[K]) => void,
    ): void {
      if (!isNativeModuleLoaded(RNOneSignal)) {
        return;
      }

      if (event === 'click') {
        isValidCallback(listener);
        RNOneSignal.addInAppMessageClickListener();
        eventManager.addEventListener<InAppMessageClickEvent>(
          IN_APP_MESSAGE_CLICKED,
          listener as (event: InAppMessageClickEvent) => void,
        );
      } else {
        if (event === 'willDisplay') {
          isValidCallback(listener);
          eventManager.addEventListener<InAppMessageWillDisplayEvent>(
            IN_APP_MESSAGE_WILL_DISPLAY,
            listener as (event: InAppMessageWillDisplayEvent) => void,
          );
        } else if (event === 'didDisplay') {
          isValidCallback(listener);
          eventManager.addEventListener<InAppMessageDidDisplayEvent>(
            IN_APP_MESSAGE_DID_DISPLAY,
            listener as (event: InAppMessageDidDisplayEvent) => void,
          );
        } else if (event === 'willDismiss') {
          isValidCallback(listener);
          eventManager.addEventListener<InAppMessageWillDismissEvent>(
            IN_APP_MESSAGE_WILL_DISMISS,
            listener as (event: InAppMessageWillDismissEvent) => void,
          );
        } else if (event === 'didDismiss') {
          isValidCallback(listener);
          eventManager.addEventListener<InAppMessageDidDismissEvent>(
            IN_APP_MESSAGE_DID_DISMISS,
            listener as (event: InAppMessageDidDismissEvent) => void,
          );
        } else {
          return;
        }
        RNOneSignal.addInAppMessagesLifecycleListener();
      }
    }

    /**
     * Remove listeners for In-App Message click and/or lifecycle events.
     */
    export function removeEventListener<K extends InAppMessageEventName>(
      event: K,
      listener: (obj: InAppMessageEventTypeMap[K]) => void,
    ): void {
      if (event === 'click') {
        eventManager.removeEventListener(IN_APP_MESSAGE_CLICKED, listener);
      } else {
        if (event === 'willDisplay') {
          eventManager.removeEventListener(
            IN_APP_MESSAGE_WILL_DISPLAY,
            listener,
          );
        } else if (event === 'didDisplay') {
          eventManager.removeEventListener(
            IN_APP_MESSAGE_DID_DISPLAY,
            listener,
          );
        } else if (event === 'willDismiss') {
          eventManager.removeEventListener(
            IN_APP_MESSAGE_WILL_DISMISS,
            listener,
          );
        } else if (event === 'didDismiss') {
          eventManager.removeEventListener(
            IN_APP_MESSAGE_DID_DISMISS,
            listener,
          );
        } else {
          return;
        }
      }
    }

    /**
     * Add a trigger for the current user. Triggers are currently explicitly used to determine whether a specific IAM should be
     * displayed to the user.
     */
    export function addTrigger(key: string, value: string) {
      if (!isNativeModuleLoaded(RNOneSignal)) return;

      // value can be assigned to `false` so we cannot just check `!value`
      if (!key || value == null) {
        console.error('OneSignal: addTrigger: must include a key and a value');
      }

      let trigger: { [key: string]: string } = {};
      trigger[key] = value;
      RNOneSignal.addTriggers(trigger);
    }

    /**
     * Add multiple triggers for the current user. Triggers are currently explicitly used to determine whether a specific IAM should
     * be displayed to the user.
     */
    export function addTriggers(triggers: { [key: string]: string }) {
      if (!isNativeModuleLoaded(RNOneSignal)) return;

      let keys = Object.keys(triggers);

      if (keys.length === 0) {
        console.error(
          "OneSignal: addTriggers: argument must be an object of the form { key : 'value' }",
        );
      }

      RNOneSignal.addTriggers(triggers);
    }

    /** Remove the trigger with the provided key from the current user. */
    export function removeTrigger(key: string) {
      if (!isNativeModuleLoaded(RNOneSignal)) return;

      RNOneSignal.removeTrigger(key);
    }

    /** Remove multiple triggers from the current user. */
    export function removeTriggers(keys: string[]) {
      if (!isNativeModuleLoaded(RNOneSignal)) return;

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

      RNOneSignal.addOutcome(name);
    }

    /** Increases "Count" by 1 only once. This can only be attributed to a single notification. */
    export function addUniqueOutcome(name: string) {
      if (!isNativeModuleLoaded(RNOneSignal)) return;

      RNOneSignal.addUniqueOutcome(name);
    }

    /**
     * Increases the "Count" of this Outcome by 1 and the "Sum" by the value. Will be counted each time sent.
     * If the method is called outside of an attribution window, it will be unattributed until a new session occurs.
     */
    export function addOutcomeWithValue(name: string, value: string | number) {
      if (!isNativeModuleLoaded(RNOneSignal)) return;

      RNOneSignal.addOutcomeWithValue(name, Number(value));
    }
  }
}

export {
  NotificationWillDisplayEvent,
  NotificationClickEvent,
  InAppMessage,
  InAppMessageClickEvent,
  InAppMessageWillDisplayEvent,
  InAppMessageDidDisplayEvent,
  InAppMessageWillDismissEvent,
  InAppMessageDidDismissEvent,
  PushSubscriptionState,
  PushSubscriptionChangedState,
  UserState,
  UserChangedState,
  OSNotificationPermission,
};

export { default as OSNotification } from './OSNotification';
export { NotificationClickResult } from './models/NotificationEvents';
export { InAppMessageClickResult } from './models/InAppMessage';
