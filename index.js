
'use strict';

import { NativeModules, NativeEventEmitter, NetInfo, Platform } from 'react-native';
import invariant from 'invariant';

const RNOneSignal = NativeModules.OneSignal;

var oneSignalEventEmitter = new NativeEventEmitter(RNOneSignal);

const eventBroadcastNames = [
    'OneSignal-remoteNotificationReceived',
    'OneSignal-remoteNotificationOpened',
    'OneSignal-idsAvailable',
    'OneSignal-emailSubscription'
];

var _eventNames = [ "received", "opened", "ids", "emailSubscription"];

var _notificationHandler = new Map();
var _notificationCache = new Map();
var _listeners = [];

for(var i = 0; i < eventBroadcastNames.length; i++) {
    var eventBroadcastName = eventBroadcastNames[i];
    var eventName = _eventNames[i];

    _listeners[eventName] = handleEventBroadcast(eventName, eventBroadcastName)
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
            type === 'received' || type === 'opened' || type === 'ids' || type == 'emailSubscription',
            'OneSignal only supports `received`, `opened`, and `ids` events'
        );

        _notificationHandler.set(type, handler);

        // Check if there is a cache for this type of event
        var cache = _notificationCache.get(type);
        if (handler && cache) {
            handler(cache);
            _notificationCache.delete(type);
        }
    }

    static removeEventListener(type, handler) {
        invariant(
            type === 'received' || type === 'opened' || type === 'ids' || type == 'emailSubscription',
            'OneSignal only supports `received`, `opened`, and `ids` events'
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

    static promptForPushNotificationPermissions(callback) {
       if (Platform.OS === 'ios') {
         RNOneSignal.promptForPushNotificationPermissions(callback);
       } else {
          console.log('This function is not supported on Android');
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

    static setEmail(email, emailAuthCode, callback) {
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
        invariant(
            typeof callback === 'function',
            'Must provide a valid callback'
        );
        
        RNOneSignal.logoutEmail(callback);
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
