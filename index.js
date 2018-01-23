
'use strict';

import { NativeModules, NativeAppEventEmitter, NetInfo, Platform } from 'react-native';
import invariant from 'invariant';

var _eventBroadcastNames = [
    'OneSignal-remoteNotificationReceived',
    'OneSignal-remoteNotificationOpened',
    'OneSignal-remoteNotificationsRegistered',
    'OneSignal-idsAvailable'
];

var _eventNames = [ "received", "opened", "registered", "ids" ];

var _notificationHandler = new Map();
var _notificationCache = new Map();
var _listeners = [];

for(var i = 0; i < _eventBroadcastNames.length; i++) {
    var eventBroadcastName = _eventBroadcastNames[i];
    var eventName = _eventNames[i];

    _listeners[eventName] = handleEventBroadcast(eventName, eventBroadcastName)
}

var RNOneSignal = NativeModules.OneSignal;


var DEVICE_NOTIF_RECEIVED_EVENT = 'OneSignal-remoteNotificationReceived';
var DEVICE_NOTIF_OPENED_EVENT = 'OneSignal-remoteNotificationOpened';
var DEVICE_NOTIF_REG_EVENT = 'OneSignal-remoteNotificationsRegistered';
var DEVICE_IDS_AVAILABLE = 'OneSignal-idsAvailable';

function handleEventBroadcast(type, broadcast) {
    return NativeAppEventEmitter.addListener(
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

function handleConnectionStateChange(isConnected) {
    if (!isConnected) return;

    OneSignal.configure();
    NetInfo.isConnected.removeEventListener('connectionChange', handleConnectionStateChange);
}

NetInfo.isConnected.fetch().then(isConnected => {
    if (isConnected) return OneSignal.configure();
    NetInfo.isConnected.addEventListener('connectionChange', handleConnectionStateChange);
}).catch((...args) => console.warn("Error: ", args));


export default class OneSignal {

    static addEventListener(type: any, handler: Function) {

        // Listen to events of notification received, opened, device registered and IDSAvailable.

        invariant(
            type === 'received' || type === 'opened' || type === 'registered' || type === 'ids',
            'OneSignal only supports `received`, `opened`, `registered`, and `ids` events'
        );

        _notificationHandler.set(type, handler);

        // Check if there is a cache for this type of event
        var cache = _notificationCache.get(type);
        if (handler && cache) {
            handler(cache);
            _notificationCache.delete(type);
        }
    }

    static removeEventListener(type: any, handler: Function) {
        invariant(
            type === 'received' || type === 'opened' || type === 'registered' || type === 'ids',
            'OneSignal only supports `received`, `opened`, `registered`, and `ids` events'
        );

        _notificationHandler.delete(type);
    }

    static clearListeners() {
        for(var i = 0; i < _eventNames.length; i++) {
            _listeners[_eventNames].remove();
        }
    }

    static registerForPushNotifications() {
        if (Platform.OS === 'ios') {
            RNOneSignal.registerForPushNotifications();
        } else {
            console.log("This function is not supported on Android");
        }
    }
    
    static promptForPushNotificationsWithUserResponse(callback: Function) {
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
        RNOneSignal.configure();
    }

    static checkPermissions(callback: Function) {
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

    static getPermissionSubscriptionState(callback: Function) {
        invariant(
            typeof callback === 'function',
            'Must provide a valid callback'
        );
        RNOneSignal.getPermissionSubscriptionState(callback);
    }

    static sendTag(key, value) {
        RNOneSignal.sendTag(key, value);
    }

    static sendTags(tags) {
        RNOneSignal.sendTags(tags || {});
    }

    static getTags(next) {
        RNOneSignal.getTags(next);
    }

    static deleteTag(key) {
        RNOneSignal.deleteTag(key);
    }

    static enableVibrate(enable) {
        if (Platform.OS === 'android') {
            RNOneSignal.enableVibrate(enable);
        } else {
            console.log("This function is not supported on iOS");
        }
    }

    static enableSound(enable) {
        if (Platform.OS === 'android') {
            RNOneSignal.enableSound(enable);
        } else {
            console.log("This function is not supported on iOS");
        }
    }
    
    static setLocationShared(shared) {
        RNOneSignal.setLocationShared(shared);
    }

    static setSubscription(enable) {
        RNOneSignal.setSubscription(enable);
    }

    static promptLocation() {
        //Supported in both iOS & Android
        RNOneSignal.promptLocation();
    }

    static inFocusDisplaying(displayOption) {
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
        if (Platform.OS === 'android') {
            RNOneSignal.postNotification(JSON.stringify(contents), JSON.stringify(data), player_id, JSON.stringify(otherParameters));
        } else {
            RNOneSignal.postNotification(contents, data, player_id, otherParameters);
        }
    }

    static clearOneSignalNotifications() {
        if (Platform.OS === 'android') {
            RNOneSignal.clearOneSignalNotifications();
        } else {
            console.log("This function is not supported on iOS");
        }
    }

    static cancelNotification(id) {
        if (Platform.OS === 'android') {
            RNOneSignal.cancelNotification(id);
        } else {
            console.log("This function is not supported on iOS");
        }
    }

    //Sends MD5 and SHA1 hashes of the user's email address (https://documentation.onesignal.com/docs/ios-sdk-api#section-synchashedemail)
    static syncHashedEmail(email) {
        RNOneSignal.syncHashedEmail(email);
    }

    static setLogLevel(nsLogLevel, visualLogLevel) {
        RNOneSignal.setLogLevel(nsLogLevel, visualLogLevel);
    }

}
