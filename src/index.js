'use strict';

import { NativeModules, Platform } from 'react-native';
import EventManager from './EventManager';
import {
    PERMISSION_CHANGED,
    SUBSCRIPTION_CHANGED,
    IN_APP_MESSAGE_CLICKED,
    NOTIFICATION_WILL_SHOW,
    NOTIFICATION_OPENED,
    EMAIL_SUBSCRIPTION_CHANGED
} from './events';
import { isValidCallback, checkIfInitialized } from './helpers';

const RNOneSignal = NativeModules.OneSignal;
const eventManager = new EventManager(RNOneSignal);

export default class OneSignal {
    /* I N I T I A L I Z A T I O N */

    /**
     * Sets the OneSignal application Id. 1/2 of the initialization process.
     * @param {string} appId
     */
    static setAppId(appId) {
        RNOneSignal.setAppId(appId);
    }

    /* O B S E R V E R S */

    static addPermissionObserver(observer) {
        if (!checkIfInitialized(RNOneSignal)) return;
        isValidCallback(observer);
        if (Platform.OS === 'android') {
            RNOneSignal.addPermissionObserver();
        }
        eventManager.addEventHandler(PERMISSION_CHANGED, observer);
    }

    static addSubscriptionObserver(observer) {
        if (!checkIfInitialized(RNOneSignal)) return;
        isValidCallback(observer);
        if (Platform.OS === 'android') {
            RNOneSignal.addSubscriptionObserver();
        }
        eventManager.addEventHandler(SUBSCRIPTION_CHANGED, observer);
    }

    static addEmailSubscriptionObserver(observer) {
        if (!checkIfInitialized(RNOneSignal)) return;
        isValidCallback(observer);
        if (Platform.OS === 'android') {
            RNOneSignal.addEmailSubscriptionObserver();
        }
        eventManager.addEventHandler(EMAIL_SUBSCRIPTION_CHANGED, observer);
    }

    /* H A N D L E R S */

    /**
     * Sets the handler that fires before the notification is displayed
     * Callback parameter is a `NotificationReceivedEvent` with:
     *  - notification data
     *  - `complete` function that accepts the `NotificationReceivedEvent`
     * @param  {function} handler
     */
    static setNotificationWillShowInForegroundHandler(handler){
        if (!checkIfInitialized(RNOneSignal)) return;
        isValidCallback(handler);
        RNOneSignal.setNotificationWillShowInForegroundHandler();
        eventManager.setEventHandler(NOTIFICATION_WILL_SHOW, handler);
    }

    static setNotificationOpenedHandler(handler){
        if (!checkIfInitialized(RNOneSignal)) return;
        isValidCallback(handler);

        RNOneSignal.setNotificationOpenedHandler();
        eventManager.setEventHandler(NOTIFICATION_OPENED, handler);
    }

    /* R E G I S T R A T I O N  E T C */

    static registerForPushNotifications() {
        if (!checkIfInitialized(RNOneSignal)) return;

        if (Platform.OS === 'ios') {
            RNOneSignal.registerForPushNotifications();
        } else {
            console.log("registerForPushNotifications: this function is not supported on Android");
        }
    }

    static promptForPushNotificationsWithUserResponse(handler) {
        if (!checkIfInitialized(RNOneSignal)) return;

        if (Platform.OS === 'ios') {
            isValidCallback(handler);
            RNOneSignal.promptForPushNotificationsWithUserResponse(handler);
        } else {
            console.log("promptForPushNotificationsWithUserResponse: this function is not supported on Android");
        }
    }

    static requestPermissions(permissions) {
        if (!checkIfInitialized(RNOneSignal)) return;

        let requestedPermissions = {};
        if (Platform.OS === 'ios') {
            if (permissions) {
                requestedPermissions = {
                    alert: !!permissions.alert,
                    badge: !!permissions.badge,
                    sound: !!permissions.sound
                };
            } else {
                requestedPermissions = {
                    alert: true,
                    badge: true,
                    sound: true
                };
            }
            RNOneSignal.requestPermissions(requestedPermissions);
        } else {
            console.log("requestPermissions: this function is not supported on Android");
        }
    }

    static promptForPushNotificationPermissions(handler) {
        if (!checkIfInitialized(RNOneSignal)) return;

        if (Platform.OS === 'ios') {
            RNOneSignal.promptForPushNotificationPermissions(handler);
        } else {
            console.log('promptForPushNotificationPermissions: this function is not supported on Android');
        }
    }

    static disablePush(disable) {
        if (!checkIfInitialized(RNOneSignal)) return;

        RNOneSignal.disablePush(disable);
    }

    static setLocationShared(shared) {
        if (!checkIfInitialized(RNOneSignal)) return;

        RNOneSignal.setLocationShared(shared);
    }

    static promptLocation() {
        if (!checkIfInitialized(RNOneSignal)) return;

        //Supported in both iOS & Android
        RNOneSignal.promptLocation();
    }

    /* D E V I C E  I N F O */

    /**
     * Gets the device state.
     * // TO DO: add more details here
     */
    static getDeviceState() {
        // TODO: check if we need to return promise?
        if (!checkIfInitialized(RNOneSignal)) return Promise.resolve();
        const deviceState = await RNOneSignal.getDeviceState();

        if (Platform.OS === 'android') {
            deviceState['hasNotificationPermission'] = deviceState['areNotificationsEnabled'];
            delete deviceState['areNotificationsEnabled'];
        }

        return deviceState;
    }

    static getPermissionSubscriptionState(handler) {
        if (!checkIfInitialized(RNOneSignal)) return;
        isValidCallback(handler);
        RNOneSignal.getPermissionSubscriptionState(handler);
    }

    static userProvidedPrivacyConsent() {
        if (!checkIfInitialized(RNOneSignal)) return;

        //returns a promise
        return RNOneSignal.userProvidedPrivacyConsent();
    }

    /* T A G S */

    static sendTag(key, value) {
        if (!checkIfInitialized(RNOneSignal)) return;

        if (typeof value === "boolean") {
            value = value.toString();
        }

        RNOneSignal.sendTag(key, value);
    }

    static sendTags(tags) {
        if (!checkIfInitialized(RNOneSignal)) return;

        Object.keys(tags).forEach((key)=>{
            if (typeof tags[key] === "boolean"){
                tags[key] = tags[key].toString();
            }
        })

        RNOneSignal.sendTags(tags || {});
    }

    static getTags(next) {
        if (!checkIfInitialized(RNOneSignal)) return;
        RNOneSignal.getTags(next);
    }

    static deleteTag(key) {
        if (!checkIfInitialized(RNOneSignal)) return;
        RNOneSignal.deleteTags([key]);
    }

    static deleteTags(tagKeys) {
        if (!checkIfInitialized(RNOneSignal)) return;
        RNOneSignal.deleteTags(tagKeys)
    }

    /* V I B R A T I O N */

    static enableVibrate(enable) {
        if (!checkIfInitialized(RNOneSignal)) return;

        if (Platform.OS === 'android') {
            RNOneSignal.enableVibrate(enable);
        } else {
            console.log("This function is not supported on iOS");
        }
    }

    static enableSound(enable) {
        if (!checkIfInitialized(RNOneSignal)) return;

        if (Platform.OS === 'android') {
            RNOneSignal.enableSound(enable);
        } else {
            console.log("This function is not supported on iOS");
        }
    }

    /* E M A I L */

    static setEmail(email, emailAuthCode, handler) {
        if (!checkIfInitialized(RNOneSignal)) return;

        if (emailAuthCode === undefined)
            emailAuthCode = null;

        if (handler === undefined)
            handler = function(){};

        RNOneSignal.setEmail(email, emailAuthCode, handler);
    }

    static logoutEmail(handler) {
        if (!checkIfInitialized(RNOneSignal)) return;
        isValidCallback(handler);
        RNOneSignal.logoutEmail(handler);
    }

    /* N O T I F I C A T I O N S */

    static postNotification(contents, data, player_id, otherParameters) {
        if (!checkIfInitialized(RNOneSignal)) return;

        if (Platform.OS === 'android')
            RNOneSignal.postNotification(JSON.stringify(contents), JSON.stringify(data), JSON.stringify(player_id), JSON.stringify(otherParameters));
        else
            RNOneSignal.postNotification(contents, data, player_id, otherParameters);
    }

    static clearOneSignalNotifications() {
        if (!checkIfInitialized(RNOneSignal)) return;

        if (Platform.OS === 'android') {
            RNOneSignal.clearOneSignalNotifications();
        } else {
            console.log("clearOneSignalNotifications: this function is not supported on iOS");
        }
    }

    static cancelNotification(id) {
        if (!checkIfInitialized(RNOneSignal)) return;

        if (Platform.OS === 'android') {
            RNOneSignal.cancelNotification(id);
        } else {
            console.log("cancelNotification: this function is not supported on iOS");
        }
    }

    /* E X T E R N A L  U S E R  I D */

    static setExternalUserId(externalId, handler) {
        if (!checkIfInitialized(RNOneSignal)) return;

        if (handler === undefined)
            handler = function(){};

        RNOneSignal.setExternalUserId(externalId, handler);
    }

    static removeExternalUserId(handler) {
        if (!checkIfInitialized(RNOneSignal)) return;

        if (handler === undefined)
            handler = function(){};

        RNOneSignal.removeExternalUserId(handler);
    }

    /* I N  A P P  M E S S A G I N G */

    static setInAppMessageClickHandler(handler) {
        if (!checkIfInitialized(RNOneSignal)) return;
        isValidCallback(handler);

        if (Platform.OS === 'android') {
            RNOneSignal.initInAppMessageClickHandlerParams();
        }

        RNOneSignal.setInAppMessageClickHandler();
        eventManager.setEventHandler(IN_APP_MESSAGE_CLICKED, handler);
    }

    // Pass a String key and any value and creates a trigger map to pass to addTriggers()
    static addTrigger(key, value) {
        if (!checkIfInitialized(RNOneSignal)) return;

        let trigger = {};
        trigger[key] = value;
        RNOneSignal.addTriggers(trigger);
    }


    // Expected format is Map<String, Object>, make sure all values are Objects and keys are Strings
    static addTriggers(triggers) {
        if (!checkIfInitialized(RNOneSignal)) return;

        RNOneSignal.addTriggers(triggers);
    }

    static removeTriggersForKeys(keys) {
        if (!checkIfInitialized(RNOneSignal)) return;

        RNOneSignal.removeTriggersForKeys(keys);
    }

    static removeTriggerForKey(key) {
        if (!checkIfInitialized(RNOneSignal)) return;
        RNOneSignal.removeTriggerForKey(key);
    }

    static getTriggerValueForKey(key) {
        // must return a promise
        if (!checkIfInitialized(RNOneSignal)) return Promise.resolve();
        return RNOneSignal.getTriggerValueForKey(key);
    }

    static pauseInAppMessages(pause) {
        if (!checkIfInitialized(RNOneSignal)) return;
        RNOneSignal.pauseInAppMessages(pause);
    }

    /* O U T C O M E S */

    static sendOutcome(name, handler=function(){}) {
        if (!checkIfInitialized(RNOneSignal)) return;
        RNOneSignal.sendOutcome(name, handler);
    }

    static sendUniqueOutcome(name, handler=function(){}) {
        if (!checkIfInitialized(RNOneSignal)) return;
        RNOneSignal.sendUniqueOutcome(name, handler);
    }

    static sendOutcomeWithValue(name, value, handler=function(){}) {
        if (!checkIfInitialized(RNOneSignal)) return;
        RNOneSignal.sendOutcomeWithValue(name, Number(value), handler);
    }

    /* O T H E R  F U N C T I O N S */

    static setLogLevel(nsLogLevel, visualLogLevel) {
        if (!checkIfInitialized(RNOneSignal)) return;

        RNOneSignal.setLogLevel(nsLogLevel, visualLogLevel);
    }

    static clearHandlers() {
        eventManager.clearHandlers();
    }

    static setRequiresUserPrivacyConsent(required) {
        if (!checkIfInitialized(RNOneSignal)) return;

        RNOneSignal.setRequiresUserPrivacyConsent(required);
    }

    static provideUserConsent(granted) {
        if (!checkIfInitialized(RNOneSignal)) return;

        RNOneSignal.provideUserConsent(granted);
    }
}
