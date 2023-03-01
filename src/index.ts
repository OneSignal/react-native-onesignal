'use strict';

import {
  NativeModules, 
  Platform
} from 'react-native';
import EventManager from './events/EventManager';
import {
  PERMISSION_CHANGED,
  SUBSCRIPTION_CHANGED,
  IN_APP_MESSAGE_CLICKED,
  NOTIFICATION_WILL_SHOW,
  NOTIFICATION_OPENED,
  IN_APP_MESSAGE_WILL_DISPLAY,
  IN_APP_MESSAGE_WILL_DISMISS,
  IN_APP_MESSAGE_DID_DISMISS,
  IN_APP_MESSAGE_DID_DISPLAY,
} from './events/events';
import {
  DeviceState,
  ChangeEvent, 
  PermissionChange, 
  SubscriptionChange, 
  EmailSubscriptionChange, 
  SMSSubscriptionChange,
} from './models/Subscription';
import NotificationReceivedEvent from './events/NotificationReceivedEvent';
import {OpenedEvent} from './models/NotificationEvents';
import {OutcomeEvent} from './models/Outcomes';
import {
  InAppMessage, 
  InAppMessageAction,
  InAppMessageLifecycleHandlerObject,
} from './models/InAppMessage';
import {
  isValidCallback, 
  isNativeModuleLoaded
} from './helpers';

const RNOneSignal = NativeModules.OneSignal;
const eventManager = new EventManager(RNOneSignal);

// 0 = None, 1 = Fatal, 2 = Errors, 3 = Warnings, 4 = Info, 5 = Debug, 6 = Verbose
export type LogLevel = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export namespace OneSignal {
  /** Initializes the OneSignal SDK. This should be called during startup of the application. */
  export function initialize(appId: string) {
    if (!isNativeModuleLoaded(RNOneSignal)) return;

    RNOneSignal.initialize(appId);
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

  /** True if the application requires user privacy consent, false otherwise. */
  export function getRequiresPrivacyConsent(): Promise<boolean> {
    if (!isNativeModuleLoaded(RNOneSignal)) {
      return Promise.reject(new Error('OneSignal native module not loaded'));
    }

    return RNOneSignal.getRequiresPrivacyConsent();
  }

  /** For GDPR users, your application should call this method before setting the App ID. */
  export function setRequiresPrivacyConsent(required: boolean) {
    if (!isNativeModuleLoaded(RNOneSignal)) return;

    RNOneSignal.setRequiresPrivacyConsent(required);
  }

  /** Indicates whether privacy consent has been granted. */
   export function getPrivacyConsent(): Promise<boolean> {
    if (!isNativeModuleLoaded(RNOneSignal)) {
      return Promise.reject(new Error('OneSignal native module not loaded'));
    }

    return RNOneSignal.getPrivacyConsent();
  }
  
  /**
   * If your application is set to require the user's privacy consent, you can provide this consent using this method.
   * Indicates whether privacy consent has been granted. This field is only relevant when the application has opted 
   * into data privacy protections.
   */
  export function setPrivacyConsent(granted: boolean) {
    if (!isNativeModuleLoaded(RNOneSignal)) return;

    RNOneSignal.setPrivacyConsent(granted);
  }

  /** This method can be used to set if launch URLs should be opened in safari or within the application. */
  export function setLaunchURLsInApp(isEnabled: boolean) {
    if (!isNativeModuleLoaded(RNOneSignal)) return;

    if (Platform.OS === 'ios') {
      RNOneSignal.setLaunchURLsInApp(isEnabled);
    } else {
      console.log('setLaunchURLsInApp: this function is not supported on Android');
    }
  }

  /** Associates a temporary push token with an Activity ID on the OneSignal server. */
  export function enterLiveActivity(activityId: string, token: string, handler?: Function) {
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
  export function exitLiveActivity(activityId: string, handler?: Function) {
    if (!isNativeModuleLoaded(RNOneSignal)) return;

    if (!handler) {
      handler = () => {};
    }

    // Only Available on iOS
    if (Platform.OS === 'ios') {
      RNOneSignal.exitLiveActivity(activityId, handler);
    }
  }

  /** Clears all handlers and observers. */
  export function clearHandlers() {
    if (!isNativeModuleLoaded(RNOneSignal)) return;

    eventManager.clearHandlers();
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

  export namespace User {
    export namespace PushSubscription {
      /** Add a callback that fires when the OneSignal subscription state changes. */
      export function addObserver(observer: (event: ChangeEvent<SubscriptionChange>) => void) {
        if (!isNativeModuleLoaded(RNOneSignal)) return;

        isValidCallback(observer);
        RNOneSignal.addPushObserver();
        eventManager.addEventHandler<SubscriptionChange>(SUBSCRIPTION_CHANGED, observer);
      }

      /** Clears current subscription observers. */
      export function removeObservers() {
        if (!isNativeModuleLoaded(RNOneSignal)) return;

        RNOneSignal.removePushObserver();
        eventManager.clearEventHandler(SUBSCRIPTION_CHANGED);
      }

      /** The readonly push subscription ID */
      export function getPushSubscriptionId(): Promise<string> {
        if (!isNativeModuleLoaded(RNOneSignal)) {
          return Promise.reject(new Error('OneSignal native module not loaded'));
        }

        return RNOneSignal.getPushSubscriptionId();
      }

      /** The readonly push subscription token */
      export function getPushSubscriptionToken(): Promise<string> {
        if (!isNativeModuleLoaded(RNOneSignal)) {
          return Promise.reject(new Error('OneSignal native module not loaded'));
        }

        return RNOneSignal.getPushSubscriptionToken();
      }

      /**
       * Gets a boolean value indicating whether the current user is opted in to push notifications. 
       * This returns true when the app has notifications permission and optOut is not called. 
       * Note: Does not take into account the existence of the subscription ID and push token. 
       * This boolean may return true but push notifications may still not be received by the user.
       */
      export function getOptedIn(): Promise<boolean> {
        if (!isNativeModuleLoaded(RNOneSignal)) {
          return Promise.reject(new Error('OneSignal native module not loaded'));
        }

        return RNOneSignal.getOptedIn();
      }

      /** Enable the push notification subscription to OneSignal. */
      export function optOut() {
        if (!isNativeModuleLoaded(RNOneSignal)) return;

        RNOneSignal.optOut();
      }

      /** Disable the push notification subscription to OneSignal. */
      export function optIn() {
        if (!isNativeModuleLoaded(RNOneSignal)) return;

        RNOneSignal.optIn();
      }
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

      if (!key || (!value && value !== '')) {
        console.error('OneSignal: sendTag: must include a key and a value');
        return;
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
        console.error('OneSignal: addTags: argument must be of type object of the form { key : "value" }');
        return;
      }

      RNOneSignal.addTags(tags);
    }

    /** Remove the data tag with the provided key from the current user. */
    export function removeTag(key: string) {
      if (!isNativeModuleLoaded(RNOneSignal)) return;

      if (typeof key !== 'string') {
        console.error('OneSignal: removeTag: key argument must be of type string');
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
  }

  export namespace Notifications {
    /**
     * Whether this app has push notification permission. Returns true if the user has accepted permissions, 
     * or if the app has ephemeral or provisional permission.
     */
    export function hasPermission(): Promise<boolean> {
      if (!isNativeModuleLoaded(RNOneSignal)) {
        return Promise.reject(new Error('OneSignal native module not loaded'));
      }

      return RNOneSignal.hasNotificationPermission();
    }

    /**
     * Prompt the user for permission to receive push notifications. This will display the native system prompt to request push 
     * notification permission. Use the fallbackToSettings parameter to prompt to open the settings app if a user has already 
     * declined push permissions.
     */
    export function requestPermission(handler?: (response: boolean) => void, 
                                      fallbackToSettingsOrHandler?: boolean | ((response: boolean) => void)) {
      if (!isNativeModuleLoaded(RNOneSignal)) return;

      let fallbackToSettings = false;

      if (typeof fallbackToSettingsOrHandler === 'function') {
        handler = fallbackToSettingsOrHandler;
      } else if (typeof fallbackToSettingsOrHandler === 'boolean') {
        fallbackToSettings = fallbackToSettingsOrHandler;
      }

      if (!handler && Platform.OS === 'ios') {
        handler = function () {};
      }

      RNOneSignal.requestNotificationPermission(fallbackToSettings, handler);
    }

    /**
     * Whether attempting to request notification permission will show a prompt. Returns true if the device has not been prompted for push 
     * notification permission already.
     */
    export function canRequestPermission() {
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
        console.log('registerForProvisionalAuthorization: this function is not supported on Android');
      }
    }

    /** Add a callback that fires when the native push permission changes. */
    export function addPermissionObserver(observer: (event: ChangeEvent<PermissionChange>) => void) {
      if (!isNativeModuleLoaded(RNOneSignal)) return;

      isValidCallback(observer);
      RNOneSignal.addPermissionObserver();
      eventManager.addEventHandler<PermissionChange>(PERMISSION_CHANGED, observer);
    }

    /** Remove all push permission observers that have been previously added. */
    export function removePermissionObservers() {
      if (!isNativeModuleLoaded(RNOneSignal)) return;

      RNOneSignal.removePermissionObservers();
      eventManager.clearEventHandler(PERMISSION_CHANGED);
    }

    /** Sets a handler that will run whenever a notification is opened by the user. */
    export function setNotificationOpenedHandler(handler: (openedEvent: OpenedEvent) => void) {
      if (!isNativeModuleLoaded(RNOneSignal)) return;

      isValidCallback(handler);

      RNOneSignal.setNotificationOpenedHandler();
      eventManager.setEventHandler<OpenedEvent>(NOTIFICATION_OPENED, handler);
    }

    /**
     * Sets the handler to run before displaying a notification while the app is in focus. Use this handler to read notification 
     * data and change it or decide if the notification should show or not.
     * Note: this runs after the Notification Service Extension which can be used to modify the notification before showing it.
     */
    export function setNotificationWillShowInForegroundHandler(handler: (event: NotificationReceivedEvent) => void) {
      if (!isNativeModuleLoaded(RNOneSignal)) return;

      isValidCallback(handler);

      RNOneSignal.setNotificationWillShowInForegroundHandler();
      eventManager.setEventHandler<NotificationReceivedEvent>(NOTIFICATION_WILL_SHOW, handler,);
    }

    /**
     * Removes all OneSignal notifications.
     * Android Only. iOS provides a standard way to clear notifications by clearing badge count.
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
        console.log('removeNotification: this function is not supported on iOS');
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
        console.log('removeGroupedNotifications: this function is not supported on iOS');
      }
    }
  }

  export namespace InAppMessages {
    /** Set the in-app message click handler. */
    export function setClickHandler(handler: (action: InAppMessageAction) => void) {
      if (!isNativeModuleLoaded(RNOneSignal)) return;

      isValidCallback(handler);
      RNOneSignal.setClickHandler();
      eventManager.setEventHandler<InAppMessageAction>(IN_APP_MESSAGE_CLICKED, handler);
    }

    /** Set the in-app message lifecycle handler. */
    export function setLifecycleHandler(handlerObject: InAppMessageLifecycleHandlerObject) {
      if (!isNativeModuleLoaded(RNOneSignal)) return;

      if (handlerObject.onWillDisplayInAppMessage) {
        isValidCallback(handlerObject.onWillDisplayInAppMessage);
        eventManager.setEventHandler<InAppMessage>(IN_APP_MESSAGE_WILL_DISPLAY, handlerObject.onWillDisplayInAppMessage,);
      }
      if (handlerObject.onDidDisplayInAppMessage) {
        isValidCallback(handlerObject.onDidDisplayInAppMessage);
        eventManager.setEventHandler<InAppMessage>(IN_APP_MESSAGE_DID_DISPLAY, handlerObject.onDidDisplayInAppMessage,);
      }
      if (handlerObject.onWillDismissInAppMessage) {
        isValidCallback(handlerObject.onWillDismissInAppMessage);
        eventManager.setEventHandler<InAppMessage>(IN_APP_MESSAGE_WILL_DISMISS, handlerObject.onWillDismissInAppMessage,);
      }
      if (handlerObject.onDidDismissInAppMessage) {
        isValidCallback(handlerObject.onDidDismissInAppMessage);
        eventManager.setEventHandler<InAppMessage>(IN_APP_MESSAGE_DID_DISMISS, handlerObject.onDidDismissInAppMessage,);
      }

      RNOneSignal.setLifecycleHandler();
    }

    /**
     * Add a trigger for the current user. Triggers are currently explicitly used to determine whether a specific IAM should be 
     * displayed to the user.
     */
    export function addTrigger(key: string, value: string | number | boolean) {
      if (!isNativeModuleLoaded(RNOneSignal)) return;

      // value can be assigned to `false` so we cannot just check `!value`
      if (!key || value == null) {
        console.error('OneSignal: addTrigger: must include a key and a value');
      }

      let trigger: { [key: string]: string | number | boolean } = {};
      trigger[key] = value;
      RNOneSignal.addTriggers(trigger);
    }

    /**
     * Add multiple triggers for the current user. Triggers are currently explicitly used to determine whether a specific IAM should
     * be displayed to the user.
     */
    export function addTriggers(triggers: { [key: string]: string | number | boolean }) {
      if (!isNativeModuleLoaded(RNOneSignal)) return;

      let keys = Object.keys(triggers);

      if (keys.length === 0) {
        console.error("OneSignal: addTriggers: argument must be an object of the form { key : 'value' }",);
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

      RNOneSignal.addUniqueOutcome(name,);
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
  ChangeEvent,
  PermissionChange,
  SubscriptionChange,
  EmailSubscriptionChange,
  SMSSubscriptionChange,
  NotificationReceivedEvent,
  OpenedEvent,
  InAppMessage,
  InAppMessageAction,
  InAppMessageLifecycleHandlerObject,
  OutcomeEvent,
  DeviceState,
};

export {default as OSNotification} from './OSNotification';
export {
  OpenedEventAction, 
  OpenedEventActionType,
} from './models/NotificationEvents';
export {
  IosPermissionStatus, 
  ObserverChangeEvent,
} from './models/Subscription';
