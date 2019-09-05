
'use strict';

import { NativeModules, NativeEventEmitter, NetInfo, Platform } from 'react-native';
import invariant from 'invariant';

const RNOneSignal = NativeModules.OneSignal;

const OS_REMOTE_NOTIFICATION_RECEIVED = 'OneSignal-remoteNotificationReceived';
const OS_REMOTE_NOTIFICATION_OPENED = 'OneSignal-remoteNotificationOpened';
const OS_IDS_AVAILABLE = 'OneSignal-idsAvailable';
const OS_EMAIL_SUBSCRIPTION = 'OneSignal-emailSubscription';
const OS_IN_APP_MESSAGE_CLICKED = 'OneSignal-inAppMessageClicked';

const eventBroadcastNames = [
    OS_REMOTE_NOTIFICATION_RECEIVED,
    OS_REMOTE_NOTIFICATION_OPENED,
    OS_IDS_AVAILABLE,
    OS_EMAIL_SUBSCRIPTION,
    OS_IN_APP_MESSAGE_CLICKED
];

const NOTIFICATION_RECEIVED_EVENT = "received";
const NOTIFICATION_OPENED_EVENT = "opened";
const IDS_AVAILABLE_EVENT = "ids";
const EMAIL_SUBSCRIPTION_EVENT = "emailSubscription";
const IN_APP_MESSAGE_CLICKED_EVENT = "inAppMessageClicked";

const _eventNames = [
    NOTIFICATION_RECEIVED_EVENT,
    NOTIFICATION_OPENED_EVENT,
    IDS_AVAILABLE_EVENT,
    EMAIL_SUBSCRIPTION_EVENT,
    IN_APP_MESSAGE_CLICKED_EVENT
];

var oneSignalEventEmitter;

var _eventTypeHandler = new Map();
var _notificationCache = new Map();
var _listeners = [];

if (RNOneSignal != null) {
    oneSignalEventEmitter = new NativeEventEmitter(RNOneSignal);

    for(var i = 0; i < eventBroadcastNames.length; i++) {
        var eventBroadcastName = eventBroadcastNames[i];
        var eventName = _eventNames[i];

        _listeners[eventName] = handleEventBroadcast(eventName, eventBroadcastName)
    }
}

function handleEventBroadcast(type, broadcast) {
    return oneSignalEventEmitter.addListener(
        broadcast, (notification) => {
            // Check if we have added listener for this type yet
            // Cache the result first if we have not.
            var handler = _eventTypeHandler.get(type);

            if (handler) {
                handler(notification);
            } else {
                _notificationCache.set(type, notification);
            }
        }
    );
}

function checkIfInitialized() {
    return RNOneSignal != null;
}

export default class OneSignal {
    static addEventListener(type, handler) {
        if (!checkIfInitialized()) return;

        // Listen to events of notification received, opened, device registered, IDSAvailable, and IAMClicked.

        invariant(
            type === NOTIFICATION_RECEIVED_EVENT ||
            type === NOTIFICATION_OPENED_EVENT ||
            type === IDS_AVAILABLE_EVENT ||
            type === EMAIL_SUBSCRIPTION_EVENT ||
            type === IN_APP_MESSAGE_CLICKED_EVENT,
            'OneSignal only supports `received`, `opened`, `ids`, `emailSubscription`, and `inAppMessageClicked` events'
        );

        _eventTypeHandler.set(type, handler);

        if (type === NOTIFICATION_OPENED_EVENT) {
            RNOneSignal.initNotificationOpenedHandlerParams();
        }

        // triggers ids event
        if (type === IDS_AVAILABLE_EVENT) {
            RNOneSignal.idsAvailable();
        }

        if (type === IN_APP_MESSAGE_CLICKED_EVENT) {
            if (Platform.OS === 'android') {
                RNOneSignal.initInAppMessageClickHandlerParams();
            } else if (Platform.OS === 'ios') {
                RNOneSignal.setInAppMessageClickHandler();
            }
        }

        // Check if there is a cache for this type of event
        var cache = _notificationCache.get(type);
        if (handler && cache) {
            handler(cache);
            _notificationCache.delete(type);
        }
    }

    static removeEventListener(type) {
        if (!checkIfInitialized()) return;

        invariant(
            type === NOTIFICATION_RECEIVED_EVENT ||
            type === NOTIFICATION_OPENED_EVENT ||
            type === IDS_AVAILABLE_EVENT ||
            type === EMAIL_SUBSCRIPTION_EVENT ||
            type === IN_APP_MESSAGE_CLICKED_EVENT,
            'OneSignal only supports `received`, `opened`, `ids`, `emailSubscription`, and `inAppMessageClicked` events'
        );

        _eventTypeHandler.delete(type);
    }

    static clearListeners() {
        if (!checkIfInitialized()) return;

        for(var i = 0; i < _eventNames.length; i++) {
            _listeners[_eventNames].remove();
        }
    }

    static registerForPushNotifications() {
        if (!checkIfInitialized()) return;

        if (Platform.OS === 'ios') {
            RNOneSignal.registerForPushNotifications();
        } else {
            console.log("This function is not supported on Android");
        }
    }

    static promptForPushNotificationsWithUserResponse(callback) {
        if (!checkIfInitialized()) return;

        if (Platform.OS === 'ios') {
            invariant(
                typeof callback === 'function',
                'Must provide a valid callback'
            );
            RNOneSignal.promptForPushNotificationsWithUserResponse(callback);
        } else {
            console.log("This function is not supported on Android");
        }
    }

    static requestPermissions(permissions) {
        if (!checkIfInitialized()) return;

        var requestedPermissions = {};
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
            console.log("This function is not supported on Android");
        }
    }

    /* deprecated */
    static configure() {
        console.warn("OneSignal: the `configure` method has been deprecated. The `ids` event is now triggered automatically.");
    }

    static init(appId, iOSSettings) {
        if (!checkIfInitialized()) return;

        if (Platform.OS === 'ios') {
            RNOneSignal.initWithAppId(appId, iOSSettings);
        } else {
            RNOneSignal.init(appId);
        }
    }

    static checkPermissions(callback) {
        if (!checkIfInitialized()) return;

        if (Platform.OS === 'ios') {
            invariant(
                typeof callback === 'function',
                'Must provide a valid callback'
            );
            RNOneSignal.checkPermissions(callback);
        } else {
            console.log("This function is not supported on Android");
        }
    }

    static promptForPushNotificationPermissions(callback) {
        if (!checkIfInitialized()) return;

        if (Platform.OS === 'ios') {
            RNOneSignal.promptForPushNotificationPermissions(callback);
        } else {
            console.log('This function is not supported on Android');
        }
    }

    static getPermissionSubscriptionState(callback) {
        if (!checkIfInitialized()) return;

        invariant(
            typeof callback === 'function',
            'Must provide a valid callback'
        );
        RNOneSignal.getPermissionSubscriptionState(callback);
    }

    static sendTag(key, value) {
        if (!checkIfInitialized()) return;

        RNOneSignal.sendTag(key, value);
    }

    static sendTags(tags) {
        if (!checkIfInitialized()) return;

        RNOneSignal.sendTags(tags || {});
    }

    static getTags(next) {
        if (!checkIfInitialized()) return;

        RNOneSignal.getTags(next);
    }

    static deleteTag(key) {
        if (!checkIfInitialized()) return;

        RNOneSignal.deleteTag(key);
    }

    static enableVibrate(enable) {
        if (!checkIfInitialized()) return;

        if (Platform.OS === 'android') {
            RNOneSignal.enableVibrate(enable);
        } else {
            console.log("This function is not supported on iOS");
        }
    }

    static enableSound(enable) {
        if (!checkIfInitialized()) return;

        if (Platform.OS === 'android') {
            RNOneSignal.enableSound(enable);
        } else {
            console.log("This function is not supported on iOS");
        }
    }

    static setEmail(email, emailAuthCode, callback) {
        if (!checkIfInitialized()) return;

        if (emailAuthCode == undefined) {
            //emailAuthCode is an optional parameter
            //since JS does not support function overloading,
            //unauthenticated setEmail calls will have emailAuthCode as the callback

            RNOneSignal.setUnauthenticatedEmail(email, function(){});
        } else if (callback == undefined && typeof emailAuthCode == 'function') {
            RNOneSignal.setUnauthenticatedEmail(email, emailAuthCode);
        } else if (callback == undefined) {
            RNOneSignal.setEmail(email, emailAuthCode, function(){});
        } else {
            RNOneSignal.setEmail(email, emailAuthCode, callback);
        }
    }

    static logoutEmail(callback) {
        if (!checkIfInitialized()) return;

        invariant(
            typeof callback === 'function',
            'Must provide a valid callback'
        );

        RNOneSignal.logoutEmail(callback);
    }

    static setLocationShared(shared) {
        if (!checkIfInitialized()) return;

        RNOneSignal.setLocationShared(shared);
    }

    static setSubscription(enable) {
        if (!checkIfInitialized()) return;

        RNOneSignal.setSubscription(enable);
    }

    static promptLocation() {
        if (!checkIfInitialized()) return;

        //Supported in both iOS & Android
        RNOneSignal.promptLocation();
    }

    static inFocusDisplaying(displayOption) {
        if (!checkIfInitialized()) return;

        if (Platform.OS === 'android') {
            //Android: Set Display option of the notifications. displayOption is of type OSInFocusDisplayOption
            // 0 -> None, 1 -> InAppAlert, 2 -> Notification
            RNOneSignal.inFocusDisplaying(displayOption);
        } else {
            //iOS: displayOption is a number, 0 -> None, 1 -> InAppAlert, 2 -> Notification
            RNOneSignal.setInFocusDisplayType(displayOption);
        }
    }

    static postNotification(contents, data, player_id, otherParameters) {
        if (!checkIfInitialized()) return;

        if (Platform.OS === 'android') {
            RNOneSignal.postNotification(JSON.stringify(contents), JSON.stringify(data), player_id, JSON.stringify(otherParameters));
        } else {
            RNOneSignal.postNotification(contents, data, player_id, otherParameters);
        }
    }

    static clearOneSignalNotifications() {
        if (!checkIfInitialized()) return;

        if (Platform.OS === 'android') {
            RNOneSignal.clearOneSignalNotifications();
        } else {
            console.log("This function is not supported on iOS");
        }
    }

    static cancelNotification(id) {
        if (!checkIfInitialized()) return;

        if (Platform.OS === 'android') {
            RNOneSignal.cancelNotification(id);
        } else {
            console.log("This function is not supported on iOS");
        }
    }

    //Sends MD5 and SHA1 hashes of the user's email address (https://documentation.onesignal.com/docs/ios-sdk-api#section-synchashedemail)
    static syncHashedEmail(email) {
        if (!checkIfInitialized()) return;

        RNOneSignal.syncHashedEmail(email);
    }

    static setLogLevel(nsLogLevel, visualLogLevel) {
        if (!checkIfInitialized()) return;

        RNOneSignal.setLogLevel(nsLogLevel, visualLogLevel);
    }

    static setRequiresUserPrivacyConsent(required) {
        if (!checkIfInitialized()) return;

        RNOneSignal.setRequiresUserPrivacyConsent(required);
    }

    static provideUserConsent(granted) {
        if (!checkIfInitialized()) return;

        RNOneSignal.provideUserConsent(granted);
    }

    static userProvidedPrivacyConsent() {
        if (!checkIfInitialized()) return;

        //returns a promise
        return RNOneSignal.userProvidedPrivacyConsent();
    }

    static setExternalUserId(externalId) {
        if (!checkIfInitialized()) return;

        RNOneSignal.setExternalUserId(externalId);
    }

    static removeExternalUserId() {
        if (!checkIfInitialized()) return;

        RNOneSignal.removeExternalUserId();
    }

    /**
     * In-App Messaging
     */

    // Pass a String key and any value and creates a trigger map to pass to addTriggers()
    static addTrigger(key, value) {
        if (!checkIfInitialized()) return;

        var trigger = {};
        trigger[key] = value;
        RNOneSignal.addTriggers(trigger);
    }

    
    // Expected format is Map<String, Object>, make sure all values are Objects and keys are Strings
    static addTriggers(triggers) {
        if (!checkIfInitialized()) return;

        RNOneSignal.addTriggers(triggers);
    }

    static removeTriggersForKeys(keys) {
        if (!checkIfInitialized()) return;

        RNOneSignal.removeTriggersForKeys(keys);
    }

    static removeTriggerForKey(key) {
        if (!checkIfInitialized()) return;

        RNOneSignal.removeTriggerForKey(key);
    }

    static getTriggerValueForKey(key) {
        // must return a promise
        if (!checkIfInitialized()) return Promise.resolve();

        return RNOneSignal.getTriggerValueForKey(key);
    }

    static pauseInAppMessages(pause) {
        if (!checkIfInitialized()) return;

        RNOneSignal.pauseInAppMessages(pause);
    }

}
