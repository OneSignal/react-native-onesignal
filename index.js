
'use strict';

import { NativeModules, NativeAppEventEmitter, NetInfo, Platform } from 'react-native';
import invariant from 'invariant';

var RNOneSignal = NativeModules.OneSignal;

var DEVICE_NOTIF_RECEIVED_EVENT = 'remoteNotificationReceived';
var DEVICE_NOTIF_OPENED_EVENT = 'remoteNotificationOpened';
var DEVICE_NOTIF_REG_EVENT = 'remoteNotificationsRegistered';
var DEVICE_IDS_AVAILABLE = 'idsAvailable';

const _notifHandlers = new Map();

function handleConnectionStateChange(isConnected) {
    if (!isConnected) return;

    OneSignal.configure();
    NetInfo.isConnected.removeEventListener('change', handleConnectionStateChange);
}

NetInfo.isConnected.fetch().then(isConnected => {
    if (isConnected) return OneSignal.configure();
    NetInfo.isConnected.addEventListener('change', handleConnectionStateChange);
}).catch((...args) => console.warn("Error: ", args));


export default class OneSignal {

    static addEventListener(type: any, handler: Function) {

        // Listen to events of notification received, opened, device registered and IDSAvailable.

        invariant(
            type === 'received' || type === 'opened' || type === 'registered' || type === 'ids',
            'OneSignal only supports `received`, `opened`, `registered`, and `ids` events'
        );

        var listener;

        if (type === 'received') {
            listener = NativeAppEventEmitter.addListener(
                DEVICE_NOTIF_RECEIVED_EVENT,
                (notification) => {
                    handler(notification);
                }
            );
        } else if (type === 'opened') {
            listener = NativeAppEventEmitter.addListener(
                DEVICE_NOTIF_OPENED_EVENT,
                (result) => {
                    handler(result);
                }
            );
        } else if (type === 'registered') {
            listener = NativeAppEventEmitter.addListener(
                DEVICE_NOTIF_REG_EVENT,
                (notifData) => {
                    handler(notifData);
                }
            );
        } else if (type === 'ids') {
            listener = NativeAppEventEmitter.addListener(
                DEVICE_IDS_AVAILABLE,
                (ids) => {
                    handler(ids);
                }
            );
        }
        _notifHandlers.set(type, listener);

    }

    static removeEventListener(type: any, handler: Function) {
        invariant(
            type === 'received' || type === 'opened' || type === 'registered' || type === 'ids',
            'OneSignal only supports `received`, `opened`, `registered`, and `ids` events'
        );
        var listener = _notifHandlers.get(type);
        if (!listener) {
            return;
        }
        listener.remove();
        _notifHandlers.delete(type);
    }

    static registerForPushNotifications() {
        if (Platform.OS == 'ios') {
            RNOneSignal.registerForPushNotifications();
        } else {
            console.log("This function is not supported on Android");
        }
    }

    static requestPermissions(permissions) {
        var requestedPermissions = {};
        if (Platform.OS == 'ios') {
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
        if (Platform.OS == 'ios') {
            invariant(
                typeof callback === 'function',
                'Must provide a valid callback'
            );
            RNOneSignal.checkPermissions(callback);
        } else {
            console.log("This function is not supported on Android");
        }
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
        if (Platform.OS == 'android') {
            RNOneSignal.enableVibrate(enable);
        } else {
            console.log("This function is not supported on iOS");
        }
    }

    static enableSound(enable) {
        if (Platform.OS == 'android') {
            RNOneSignal.enableSound(enable);
        } else {
            console.log("This function is not supported on iOS");
        }
    }


    static setSubscription(enable) {
        RNOneSignal.setSubscription(enable);
    }

    static promptLocation() {
        //Supported in both iOS & Android
        RNOneSignal.promptLocation();
    }

    //Android only: Set Display option of the notifications. displayOption is of type OSInFocusDisplayOption
    // 0 -> None, 1 -> InAppAlert, 2 -> Notification
    static inFocusDisplaying(displayOption) {
        if (Platform.OS == 'android') {
            RNOneSignal.inFocusDisplaying(displayOption);
        }
    }

    static postNotification(contents, data, player_id) {
        if (Platform.OS == 'android') {
            RNOneSignal.postNotification(JSON.stringify(contents), JSON.stringify(data), player_id);
        } else {
            RNOneSignal.postNotification(contents, data, player_id);
        }
    }

    static clearOneSignalNotifications() {
        if (Platform.OS == 'android') {
            RNOneSignal.clearOneSignalNotifications();
        } else {
            console.log("This function is not supported on iOS");
        }
    }

    static cancelNotification(id) {
        if (Platform.OS == 'android') {
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