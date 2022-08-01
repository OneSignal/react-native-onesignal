'use strict';

import { NativeModules, Platform } from 'react-native';
import EventManager from './events/EventManager';
import {
    PERMISSION_CHANGED,
    SUBSCRIPTION_CHANGED,
    IN_APP_MESSAGE_CLICKED,
    NOTIFICATION_WILL_SHOW,
    NOTIFICATION_OPENED,
    EMAIL_SUBSCRIPTION_CHANGED,
    SMS_SUBSCRIPTION_CHANGED,
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
import { OpenedEvent } from './models/NotificationEvents';
import { OutcomeEvent } from './models/Outcomes';
import { InAppMessage, InAppMessageAction, InAppMessageLifecycleHandlerObject } from './models/InAppMessage';
import { isValidCallback, isNativeModuleLoaded } from './helpers';

const RNOneSignal = NativeModules.OneSignal;
const eventManager = new EventManager(RNOneSignal);

// 0 = None, 1 = Fatal, 2 = Errors, 3 = Warnings, 4 = Info, 5 = Debug, 6 = Verbose
export type LogLevel = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export default class OneSignal {
    /* I N I T I A L I Z A T I O N */

    /**
     * Completes OneSignal initialization by setting the OneSignal Application ID.
     * @param  {string} appId
     * @returns void
     */
    static setAppId(appId: string): void {
        if (!isNativeModuleLoaded(RNOneSignal)) return;
        RNOneSignal.setAppId(appId);
    }

    /* O B S E R V E R S */

    /**
     * Add a callback that fires when the native push permission changes.
     * @param  {(event:ChangeEvent<PermissionChange>) => void} observer
     * @returns void
     */
    static addPermissionObserver(observer: (event: ChangeEvent<PermissionChange>) => void): void {
        if (!isNativeModuleLoaded(RNOneSignal)) return;
        isValidCallback(observer);
        RNOneSignal.addPermissionObserver();
        eventManager.addEventHandler<PermissionChange>(PERMISSION_CHANGED, observer);
    }

    /**
     * Clears current permission observers.
     * @returns void
     */
    static clearPermissionObservers(): void {
        if (!isNativeModuleLoaded(RNOneSignal)) return;
        RNOneSignal.removePermissionObserver();
        eventManager.clearEventHandler(PERMISSION_CHANGED);
    }

    /**
     * Add a callback that fires when the OneSignal subscription state changes.
     * @param  {(event:ChangeEvent<SubscriptionChange>) => void} observer
     * @returns void
     */
    static addSubscriptionObserver(observer: (event: ChangeEvent<SubscriptionChange>) => void): void {
        if (!isNativeModuleLoaded(RNOneSignal)) return;
        isValidCallback(observer);
        RNOneSignal.addSubscriptionObserver();
        eventManager.addEventHandler<SubscriptionChange>(SUBSCRIPTION_CHANGED, observer);
    }

    /**
     * Clears current subscription observers.
     * @returns void
     */
    static clearSubscriptionObservers(): void {
        if (!isNativeModuleLoaded(RNOneSignal)) return;
        RNOneSignal.removeSubscriptionObserver();
        eventManager.clearEventHandler(SUBSCRIPTION_CHANGED);
    }

    /**
     * Add a callback that fires when the OneSignal email subscription changes.
     * @param  {(event:ChangeEvent<EmailSubscriptionChange>) => void} observer
     * @returns void
     */
    static addEmailSubscriptionObserver(observer: (event: ChangeEvent<EmailSubscriptionChange>) => void): void {
        if (!isNativeModuleLoaded(RNOneSignal)) return;
        isValidCallback(observer);
        RNOneSignal.addEmailSubscriptionObserver();
        eventManager.addEventHandler<EmailSubscriptionChange>(EMAIL_SUBSCRIPTION_CHANGED, observer);
    }

    /**
     * Clears current email subscription observers.
     * @returns void
     */
    static clearEmailSubscriptionObservers(): void {
        if (!isNativeModuleLoaded(RNOneSignal)) return;
        RNOneSignal.removeEmailSubscriptionObserver();
        eventManager.clearEventHandler(EMAIL_SUBSCRIPTION_CHANGED);
    }

    /**
     * Add a callback that fires when the OneSignal sms subscription changes.
     * @param  {(event:ChangeEvent<SMSSubscriptionChange>) => void} observer
     * @returns void
     */
    static addSMSSubscriptionObserver(observer: (event: ChangeEvent<SMSSubscriptionChange>) => void): void {
        if (!isNativeModuleLoaded(RNOneSignal)) return;
        isValidCallback(observer);
        RNOneSignal.addSMSSubscriptionObserver();
        eventManager.addEventHandler<SMSSubscriptionChange>(SMS_SUBSCRIPTION_CHANGED, observer);
    }

    /**
     * Clears current SMS subscription observers.
     * @returns void
     */
    static clearSMSSubscriptionObservers(): void {
        if (!isNativeModuleLoaded(RNOneSignal)) return;
        RNOneSignal.removeSMSSubscriptionObserver();
        eventManager.clearEventHandler(SMS_SUBSCRIPTION_CHANGED);
    }

    /* H A N D L E R S */

    /**
     * Sets the handler that fires before the notification is displayed
     * Callback parameter is a `NotificationReceivedEvent` with:
     *  - notification data
     *  - `complete` function that accepts the `NotificationReceivedEvent`
     * @param  {(event:NotificationReceivedEvent) => void} handler
     */
    static setNotificationWillShowInForegroundHandler(handler: (event: NotificationReceivedEvent) => void): void {
        if (!isNativeModuleLoaded(RNOneSignal)) return;
        isValidCallback(handler);
        RNOneSignal.setNotificationWillShowInForegroundHandler();
        eventManager.setEventHandler<NotificationReceivedEvent>(NOTIFICATION_WILL_SHOW, handler);
    }

    /**
     * Set the callback to run on notification open.
     * @param  {(openedEvent:OpenedEvent) => void} handler
     * @returns void
     */
    static setNotificationOpenedHandler(handler: (openedEvent: OpenedEvent) => void): void {
        if (!isNativeModuleLoaded(RNOneSignal)) return;
        isValidCallback(handler);

        RNOneSignal.setNotificationOpenedHandler();
        eventManager.setEventHandler<OpenedEvent>(NOTIFICATION_OPENED, handler);
    }

    /* R E G I S T R A T I O N  E T C */

    /**
     * Prompts the user for push notifications permission in iOS and Android 13+.
     * Use the fallbackToSettings parameter to prompt to open the settings app if a user has already declined push permissions.
     *
     * Call with promptForPushNotificationsWithUserResponse(fallbackToSettings?, handler?)
     *
     * Recommended: Do not use and instead follow: https://documentation.onesignal.com/docs/ios-push-opt-in-prompt.
     * @param  {boolean} fallbackToSettings
     * @param  {(response:boolean) => void} handler
     * @returns void
     */
    static promptForPushNotificationsWithUserResponse(fallbackToSettingsOrHandler?: boolean | ((response: boolean) => void), handler?: (response: boolean) => void): void {
        if (!isNativeModuleLoaded(RNOneSignal)) return;

        let fallbackToSettings = false;

        if (typeof fallbackToSettingsOrHandler === "function") {
            // Method was called like promptForPushNotificationsWithUserResponse(handler: function)
            handler = fallbackToSettingsOrHandler;
        }
        else if (typeof fallbackToSettingsOrHandler === "boolean") {
            // Method was called like promptForPushNotificationsWithUserResponse(fallbackToSettings: boolean, handler?: function)
            fallbackToSettings = fallbackToSettingsOrHandler;
        }
        // Else method was called like promptForPushNotificationsWithUserResponse(), no need to modify

        if (!handler && Platform.OS === 'ios') {
            handler = function(){};
        }

        RNOneSignal.promptForPushNotificationsWithUserResponse(fallbackToSettings, handler);
    }

    /**
     * Only applies to iOS (does nothing on Android as it always silently registers)
     * Request for Direct-To-History push notification authorization
     *
     * For more information: https://documentation.onesignal.com/docs/ios-customizations#provisional-push-notifications
     *
     * @param  {(response:boolean) => void} handler
     * @returns void
     */
    static registerForProvisionalAuthorization(handler: (response: boolean) => void): void {
        if (!isNativeModuleLoaded(RNOneSignal)) return;

        if (Platform.OS === 'ios') {
            isValidCallback(handler);
            RNOneSignal.registerForProvisionalAuthorization(handler);
        } else {
            console.log("registerForProvisionalAuthorization: this function is not supported on Android");
        }
    }

    /**
     * Disable the push notification subscription to OneSignal.
     * @param  {boolean} disable
     * @returns void
     */
    static disablePush(disable: boolean): void {
        if (!isNativeModuleLoaded(RNOneSignal)) return;

        RNOneSignal.disablePush(disable);
    }

    /**
     * Android Only. If notifications are disabled for your application, unsubscribe the user from OneSignal.
     * @param  {boolean} unsubscribe
     * @returns void
     */
    static unsubscribeWhenNotificationsAreDisabled(unsubscribe: boolean): void {
        if (!isNativeModuleLoaded(RNOneSignal)) return;

        if (Platform.OS === 'android') {
            RNOneSignal.unsubscribeWhenNotificationsAreDisabled(unsubscribe);
        } else {
            console.log("unsubscribeWhenNotificationsAreDisabled: this function is not supported on iOS");
        }
    }

    /* L O C A T I O N */

    /**
     * True if the application has location share activated, false otherwise
     * @returns Promise<boolean>
     */
    static isLocationShared(): Promise<boolean> {
        // must return a promise
        if (!isNativeModuleLoaded(RNOneSignal)) return Promise.resolve(false);
        return RNOneSignal.isLocationShared();
    }

    /**
     * Disable or enable location collection (defaults to enabled if your app has location permission).
     * @param  {boolean} shared
     * @returns void
     */
    static setLocationShared(shared: boolean): void {
        if (!isNativeModuleLoaded(RNOneSignal)) return;

        RNOneSignal.setLocationShared(shared);
    }

    /**
     * Prompts the user for location permissions to allow geotagging from the OneSignal dashboard.
     * @returns void
     */
    static promptLocation(): void {
        if (!isNativeModuleLoaded(RNOneSignal)) return;

        //Supported in both iOS & Android
        RNOneSignal.promptLocation();
    }

    /* D E V I C E  I N F O */

    /**
     * Gets the device state.
     * This method returns a "snapshot" of the device state for when it was called.
     * @returns Promise<DeviceState | null>
     */
    static async getDeviceState(): Promise<DeviceState | null> {
        if (!isNativeModuleLoaded(RNOneSignal)) return Promise.resolve(null);
        const deviceState = await RNOneSignal.getDeviceState();

        if (Platform.OS === 'android') {
            deviceState['hasNotificationPermission'] = deviceState['areNotificationsEnabled'];
            delete deviceState['areNotificationsEnabled'];
        }

        return deviceState;
    }

    /**
     * Allows you to set the app defined language with the OneSignal SDK.
     * @param  {string} language
     * @param  {(success:object) => void} onSuccess
     * @param  {(failure:object) => void} onFailure
     * @returns void
     */
     static setLanguage(language: string, onSuccess?: (success: object) => void, onFailure?: (failure: object) => void): void {
        if (!isNativeModuleLoaded(RNOneSignal)) return;

        if (!onSuccess) {
            onSuccess = function(){};
        }

        if (!onFailure) {
            onFailure = function(){};
        }
        RNOneSignal.setLanguage(language, onSuccess, onFailure);
    }

    /* T A G S */

    /**
     * Tag a user based on an app event of your choosing so they can be targeted later via segments.
     * @param  {string} key
     * @param  {string} value
     * @returns void
     */
    static sendTag(key: string, value: string): void {
        if (!isNativeModuleLoaded(RNOneSignal)) return;

        if (!key || (!value && value !== "")) {
            console.error("OneSignal: sendTag: must include a key and a value");
        }

        RNOneSignal.sendTag(key, value);
    }

    /**
     * Tag a user with multiple tags based on an app event of your choosing so they can be targeted later via segments.
     * @param  {[key: string]: string} tags
     * @returns void
     */
    static sendTags(tags: { [key: string]: string }): void {
        if (!isNativeModuleLoaded(RNOneSignal)) return;
        let keys = Object.keys(tags);

        if (keys.length === 0) {
            console.error(`OneSignal: sendTags: argument must be of type object of the form { key : 'value' }`);
        }

        RNOneSignal.sendTags(tags || {});
    }

    /**
     * Retrieve a list of tags that have been set on the user from the OneSignal server.
     * @param  {(tags: {[key: string]: string} | null) => void} handler
     * @returns void
     */
    static getTags(handler: (tags: { [key: string]: string } | null) => void): void {
        if (!isNativeModuleLoaded(RNOneSignal)) return;
        RNOneSignal.getTags(handler);
    }

    /**
     * Deletes a single tag that was previously set on a user.
     * @param  {string} key
     * @returns void
     */
    static deleteTag(key: string): void {
        if (!isNativeModuleLoaded(RNOneSignal)) return;
        if (typeof key !== "string") {
            console.error("OneSignal: deleteTag: key argument must be of type string");
        }
        RNOneSignal.deleteTags([key]);
    }

    /**
     * Deletes multiple tags that were previously set on a user.
     * @param  {string[]} keys
     */
    static deleteTags(keys: string[]): void {
        if (!isNativeModuleLoaded(RNOneSignal)) return;

        if (!Array.isArray(keys)) {
            console.error("OneSignal: deleteTags: argument must be of array type");
        }

        RNOneSignal.deleteTags(keys)
    }

    /* E M A I L */

    /**
     * Allows you to set the user's email address with the OneSignal SDK.
     * @param  {string} email
     * @param  {string} emailAuthCode
     * @param  {Function} handler
     * @returns void
     */
    static setEmail(email: string, emailAuthCode?: string | null, handler?: Function): void {
        if (!isNativeModuleLoaded(RNOneSignal)) return;

        if (emailAuthCode === undefined)
            emailAuthCode = null;

        // Android workaround for the current issue of callback fired more than once
        if (!handler && Platform.OS === 'ios')
            handler = function(){};

        RNOneSignal.setEmail(email, emailAuthCode, handler);
    }

    /**
     * If your app implements logout functionality, you can call logoutEmail to dissociate the email from the device.
     * @param  {Function} handler
     */
    static logoutEmail(handler?: Function): void {
        if (!isNativeModuleLoaded(RNOneSignal)) return;

        // Android workaround for the current issue of callback fired more than once
        if (!handler && Platform.OS === 'ios')
            handler = function(){};

        RNOneSignal.logoutEmail(handler);
    }

    /* S M S */

    /**
     * Allows you to set the user's SMS number with the OneSignal SDK.
     * @param  {string} smsNumber
     * @param  {string} smsAuthCode
     * @param  {Function} handler
     * @returns void
     */
    static setSMSNumber(smsNumber: string, smsAuthCode?: string | null, handler?: Function): void {
        if (!isNativeModuleLoaded(RNOneSignal)) return;

        if (smsAuthCode === undefined)
            smsAuthCode = null;

        // Android workaround for the current issue of callback fired more than once
        if (!handler && Platform.OS === 'ios')
            handler = function(){};

        RNOneSignal.setSMSNumber(smsNumber, smsAuthCode, handler);
    }

    /**
     * If your app implements logout functionality, you can call logoutSMSNumber to dissociate the SMS number from the device.
     * @param  {Function} handler
     */
    static logoutSMSNumber(handler?: Function): void {
        if (!isNativeModuleLoaded(RNOneSignal)) return;

        // Android workaround for the current issue of callback fired more than once
        if (!handler && Platform.OS === 'ios')
            handler = function(){};

        RNOneSignal.logoutSMSNumber(handler);
    }

    /* N O T I F I C A T I O N S */

    /**
     * Send a notification
     * @param  {string} notificationObjectString - JSON string payload (see REST API reference)
     * @param  {(success:object) => void} onSuccess
     * @param  {(failure:object) => void} onFailure
     * @returns void
     */
    static postNotification(notificationObjectString: string, onSuccess?: (success: object) => void, onFailure?: (failure: object) => void): void {
        if (!isNativeModuleLoaded(RNOneSignal)) return;

        if (!onSuccess)
            onSuccess = function(){};

        if (!onFailure)
            onFailure = function(){};

        RNOneSignal.postNotification(notificationObjectString, onSuccess, onFailure);
    }

    /**
     * Android Only. iOS provides a standard way to clear notifications by clearing badge count.
     * @returns void
     */
    static clearOneSignalNotifications(): void {
        if (!isNativeModuleLoaded(RNOneSignal)) return;

        if (Platform.OS === 'android') {
            RNOneSignal.clearOneSignalNotifications();
        } else {
            console.log("clearOneSignalNotifications: this function is not supported on iOS");
        }
    }

    /**
     * Android Only.
     * Removes a single OneSignal notification based on its Android notification integer id.
     * @param  {number} id - notification id to cancel
     * @returns void
     */
    static removeNotification(id: number): void {
        if (!isNativeModuleLoaded(RNOneSignal)) return;

        if (Platform.OS === 'android') {
            RNOneSignal.removeNotification(id);
        } else {
            console.log("removeNotification: this function is not supported on iOS");
        }
    }

    /**
     * Android Only.
     * Removes all OneSignal notifications based on its Android notification group Id.
     * @param  {string} id - notification group id to cancel
     * @returns void
     */
    static removeGroupedNotifications(id: string): void {
        if (!isNativeModuleLoaded(RNOneSignal)) return;

        if (Platform.OS === 'android') {
            RNOneSignal.removeGroupedNotifications(id);
        } else {
            console.log("removeGroupedNotifications: this function is not supported on iOS");
        }
    }

    /**
     * This method can be used to set if launch URLs should be opened in safari or within the application.
     * @param  {boolean} isEnabled
     * @returns
     */
    static setLaunchURLsInApp(isEnabled: boolean): void {
      if (!isNativeModuleLoaded(RNOneSignal)) return;

      if (Platform.OS === 'ios') {
        RNOneSignal.setLaunchURLsInApp(isEnabled);
      } else {
        console.log("setLaunchURLsInApp: this function is not supported on Android");
      }
    }

    /* E X T E R N A L  U S E R  I D */

    /**
     * Allows you to use your own system's user ID's to send push notifications to your users.
     * @param  {string} externalId
     * @param  {string} externalIdAuthCode?
     * @param  {(results:object) => void} handler?
     * @returns void
     */
    static setExternalUserId(externalId: string, handlerOrAuth?: ((results: object) => void) | string, handler?: (results: object) => void): void {

        if (!isNativeModuleLoaded(RNOneSignal)) return;

        if (typeof handlerOrAuth === "function") {
            RNOneSignal.setExternalUserId(externalId, null, handlerOrAuth);
            return;
        }

        if (!handler && Platform.OS === 'ios') {
            handler = function(){};
        }

        RNOneSignal.setExternalUserId(externalId, handlerOrAuth, handler);
    }

    /**
     * Removes whatever was set as the current user's external user ID.
     * @param  {(results:object) => void} handler
     * @returns void
     */
    static removeExternalUserId(handler?: (results: object) => void): void {
        if (!isNativeModuleLoaded(RNOneSignal)) return;

        // Android workaround for the current issue of callback fired more than once
        if (handler === undefined && Platform.OS === 'ios')
            handler = function(){};

        RNOneSignal.removeExternalUserId(handler);
    }

    /* I N  A P P  M E S S A G I N G */

    /**
     * Sets an In-App Message click event handler.
     * @param  {(action:InAppMessageAction) => void} handler
     * @returns void
     */
    static setInAppMessageClickHandler(handler: (action: InAppMessageAction) => void): void {
        if (!isNativeModuleLoaded(RNOneSignal)) return;
        isValidCallback(handler);
        RNOneSignal.initInAppMessageClickHandlerParams();
        RNOneSignal.setInAppMessageClickHandler();
        eventManager.setEventHandler<InAppMessageAction>(IN_APP_MESSAGE_CLICKED, handler);
    }

    /**
     * Sets the In-App Message lifecycle handler object to run on displaying and/or dismissing an In-App Message.
     * @param  {InAppMessageLifecycleHandlerObject} handlerObject
     * @returns void
     */
    static setInAppMessageLifecycleHandler(handlerObject: InAppMessageLifecycleHandlerObject): void {
        if (!isNativeModuleLoaded(RNOneSignal)) return;

        if (handlerObject.onWillDisplayInAppMessage) {
            isValidCallback(handlerObject.onWillDisplayInAppMessage);
            eventManager.setEventHandler<InAppMessage>(IN_APP_MESSAGE_WILL_DISPLAY, handlerObject.onWillDisplayInAppMessage);
        }
        if (handlerObject.onDidDisplayInAppMessage) {
            isValidCallback(handlerObject.onDidDisplayInAppMessage);
            eventManager.setEventHandler<InAppMessage>(IN_APP_MESSAGE_DID_DISPLAY, handlerObject.onDidDisplayInAppMessage);
        }
        if (handlerObject.onWillDismissInAppMessage) {
            isValidCallback(handlerObject.onWillDismissInAppMessage);
            eventManager.setEventHandler<InAppMessage>(IN_APP_MESSAGE_WILL_DISMISS, handlerObject.onWillDismissInAppMessage);
        }
        if (handlerObject.onDidDismissInAppMessage) {
            isValidCallback(handlerObject.onDidDismissInAppMessage);
            eventManager.setEventHandler<InAppMessage>(IN_APP_MESSAGE_DID_DISMISS, handlerObject.onDidDismissInAppMessage);
        }

        RNOneSignal.setInAppMessageLifecycleHandler();
    }

    /**
     * Add an In-App Message Trigger.
     * @param  {string} key
     * @param  {string | number | boolean} value
     * @returns void
     */
    static addTrigger(key: string, value: string | number | boolean): void {
        if (!isNativeModuleLoaded(RNOneSignal)) return;

        // value can be assigned to `false` so we cannot just check `!value`
        if (!key || value == null) {
            console.error("OneSignal: addTrigger: must include a key and a value");
        }

        let trigger: { [key: string]: string | number | boolean } = {};
        trigger[key] = value;
        RNOneSignal.addTriggers(trigger);
    }

    /**
     * Adds Multiple In-App Message Triggers.
     * @param  {[key: string]: string | number | boolean} triggers
     * @returns void
     */
    static addTriggers(triggers: { [key: string]: string | number | boolean }): void {
        if (!isNativeModuleLoaded(RNOneSignal)) return;

        let keys = Object.keys(triggers);

        if (keys.length === 0) {
            console.error(`OneSignal: addTriggers: argument must be an object of the form { key : 'value' }`);
        }

        RNOneSignal.addTriggers(triggers);
    }

    /**
     * Removes a list of triggers based on a collection of keys.
     * @param  {string[]} keys
     * @returns void
     */
    static removeTriggersForKeys(keys: string[]): void {
        if (!isNativeModuleLoaded(RNOneSignal)) return;

        RNOneSignal.removeTriggersForKeys(keys);
    }

    /**
     * Removes a list of triggers based on a key.
     * @param  {string} key
     * @returns void
     */
    static removeTriggerForKey(key: string): void {
        if (!isNativeModuleLoaded(RNOneSignal)) return;
        RNOneSignal.removeTriggerForKey(key);
    }

    /**
     * Gets a trigger value for a provided trigger key.
     * @param  {string} key
     * @returns Promise<string | number | boolean | null>
     */
    static getTriggerValueForKey(key: string): Promise<string | number | boolean | null> {
        // must return a promise
        if (!isNativeModuleLoaded(RNOneSignal)) return Promise.resolve(null);
        return RNOneSignal.getTriggerValueForKey(key);
    }

    /**
     * Pause & unpause In-App Messages
     * @param  {boolean} pause
     * @returns void
     */
    static pauseInAppMessages(pause: boolean): void {
        if (!isNativeModuleLoaded(RNOneSignal)) return;
        RNOneSignal.pauseInAppMessages(pause);
    }

    /* O U T C O M E S */

    /**
     * Increases the "Count" of this Outcome by 1 and will be counted each time sent.
     * @param  {string} name
     * @param  {(event:OutcomeEvent) => void} handler
     * @returns void
     */
    static sendOutcome(name: string, handler?: (event: OutcomeEvent) => void): void {
        if (!isNativeModuleLoaded(RNOneSignal)) return;

        if (!handler) {
            handler = function(){};
        }

        RNOneSignal.sendOutcome(name, handler);
    }

    /**
     * Increases "Count" by 1 only once. This can only be attributed to a single notification.
     * @param  {string} name
     * @param  {(event:OutcomeEvent) => void} handler
     * @returns void
     */
    static sendUniqueOutcome(name: string, handler?: (event: OutcomeEvent) => void): void {
        if (!isNativeModuleLoaded(RNOneSignal)) return;

        if (!handler) {
            handler = function(){};
        }

        RNOneSignal.sendUniqueOutcome(name, handler);
    }

    /**
     * Increases the "Count" of this Outcome by 1 and the "Sum" by the value. Will be counted each time sent.
     * If the method is called outside of an attribution window, it will be unattributed until a new session occurs.
     * @param  {string} name
     * @param  {string|number} value
     * @param  {(event:OutcomeEvent) => void} handler
     * @returns void
     */
    static sendOutcomeWithValue(name: string, value: string | number, handler?: (event: OutcomeEvent) => void): void {
        if (!isNativeModuleLoaded(RNOneSignal)) return;

        if (!handler) {
            handler = function(){};
        }

        RNOneSignal.sendOutcomeWithValue(name, Number(value), handler);
    }

    /* P R I V A C Y  C O N S E N T */

    /**
     * Did the user provide privacy consent for GDPR purposes.
     * @returns Promise<boolean>
     */
    static userProvidedPrivacyConsent(): Promise<boolean> {
        if (!isNativeModuleLoaded(RNOneSignal)) return Promise.resolve(false);

        //returns a promise
        return RNOneSignal.userProvidedPrivacyConsent();
    }

    /**
     * True if the application requires user privacy consent, false otherwise
     * @returns Promise<boolean>
     */
    static requiresUserPrivacyConsent(): Promise<boolean> {
        if (!isNativeModuleLoaded(RNOneSignal)) return Promise.resolve(false);

        //returns a promise
        return RNOneSignal.requiresUserPrivacyConsent();
    }

    /**
     * For GDPR users, your application should call this method before setting the App ID.
     * @param  {boolean} required
     * @returns void
     */
    static setRequiresUserPrivacyConsent(required: boolean): void {
        if (!isNativeModuleLoaded(RNOneSignal)) return;

        RNOneSignal.setRequiresUserPrivacyConsent(required);
    }

    /**
     * If your application is set to require the user's privacy consent, you can provide this consent using this method.
     * @param  {boolean} granted
     * @returns void
     */
    static provideUserConsent(granted: boolean): void {
        if (!isNativeModuleLoaded(RNOneSignal)) return;

        RNOneSignal.provideUserConsent(granted);
    }

    /* O T H E R  F U N C T I O N S */

    /**
     * Enable logging to help debug if you run into an issue setting up OneSignal.
     * @param  {LogLevel} nsLogLevel - Sets the logging level to print to the Android LogCat log or Xcode log.
     * @param  {LogLevel} visualLogLevel - Sets the logging level to show as alert dialogs.
     * @returns void
     */
    static setLogLevel(nsLogLevel: LogLevel, visualLogLevel: LogLevel): void {
        if (!isNativeModuleLoaded(RNOneSignal)) return;

        RNOneSignal.setLogLevel(nsLogLevel, visualLogLevel);
    }

    /**
     * Clears all handlers and observers.
     * @returns void
     */
    static clearHandlers(): void {
        if (!isNativeModuleLoaded(RNOneSignal)) return;
        eventManager.clearHandlers();
    }
}

/* Export all public models */

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
}

export { default as OSNotification } from './OSNotification';
export { OpenedEventAction, OpenedEventActionType } from './models/NotificationEvents';
export { IosPermissionStatus, ObserverChangeEvent } from './models/Subscription';
