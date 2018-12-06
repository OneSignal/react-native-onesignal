
'use strict';

import { NativeModules, NativeEventEmitter, NetInfo, Platform } from 'react-native';
import invariant from 'invariant';

const RNOneSignal = NativeModules.OneSignal;

const eventBroadcastNames = [
    'OneSignal-remoteNotificationReceived',
    'OneSignal-remoteNotificationOpened',
    'OneSignal-idsAvailable',
    'OneSignal-emailSubscription'
];

var oneSignalEventEmitter;

var _eventNames = [ "received", "opened", "ids", "emailSubscription"];

var _notificationHandler = new Map();
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
            var handler = _notificationHandler.get(type);

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

        // Listen to events of notification received, opened, device registered and IDSAvailable.

        invariant(
            type === 'received' || type === 'opened' || type === 'ids' || type == 'emailSubscription',
            'OneSignal only supports `received`, `opened`, and `ids` events'
        );

        _notificationHandler.set(type, handler);

        if (type == 'opened') {
            RNOneSignal.didSetNotificationOpenedHandler();
        }

        // Check if there is a cache for this type of event
        var cache = _notificationCache.get(type);
        if (handler && cache) {
            handler(cache);
            _notificationCache.delete(type);
        }
    }

    static removeEventListener(type, handler) {
        if (!checkIfInitialized()) return;

        invariant(
            type === 'received' || type === 'opened' || type === 'ids' || type == 'emailSubscription',
            'OneSignal only supports `received`, `opened`, and `ids` events'
        );

        _notificationHandler.delete(type);
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

    static configure() {
        if (!checkIfInitialized()) return;

        RNOneSignal.configure();
    }

    static init(appId, iOSSettings) {
        if (!checkIfInitialized()) return;

        if (Platform.OS == 'ios') {
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
}
