/**
 * @providesModule Notifications
 */

'use strict';

import { NativeModules, DeviceEventEmitter, NetInfo } from 'react-native';

const { RNOneSignal } = NativeModules;

var Notifications = {
	onError: false,
	onNotificationOpened: false,
};

var _pendingNotifications = [];
var DEVICE_NOTIF_EVENT = 'remoteNotificationOpened';

/**
 * Configure local and remote notifications
 * @param {Object}		options
 * @param {function}	options.onNotificationOpened - Fired when a remote notification is received.
 * @param {function} 	options.onError - None
 */
Notifications.configure = function(options: Object) {
	if ( typeof options.onError !== 'undefined' ) {
		this.onError = options.onError;
	}

	if ( typeof options.onNotificationOpened !== 'undefined' ) {
		this.onNotificationOpened = options.onNotificationOpened;

		if (_pendingNotifications.length > 0) {
			var notification = _pendingNotifications.pop();
			this._onNotificationOpened(notification.message, notification.data, notification.isActive);
		}
	}
};

/* Unregister */
Notifications.unregister = function() {
	this.onNotificationOpened = false;
};

Notifications.registerForPushNotifications = function(){

	RNOneSignal.registerForPushNotifications();
}

Notifications._onNotificationOpened = function(message, data, isActive) {
	if ( this.onNotificationOpened === false ) {
		var notification = {message: message, data: data, isActive: isActive};
		_pendingNotifications.push(notification);
		return;
	}
	this.onNotificationOpened(message, data, isActive);
};

Notifications.sendTag = function(key, value) {
	RNOneSignal.sendTag(key, value);
};

Notifications.sendTags = function(tags) {
	RNOneSignal.sendTags(tags || {});
};

Notifications.getTags = function(next) {
	RNOneSignal.getTags(next);
};

Notifications.deleteTag = function(key) {
	RNOneSignal.deleteTag(key);
};

Notifications.enableVibrate = function(enable) {
	RNOneSignal.enableVibrate(enable);
};

Notifications.enableSound = function(enable) {
	RNOneSignal.enableSound(enable);
};

Notifications.enableInAppAlertNotification = function(enable) {
	RNOneSignal.enableInAppAlertNotification(enable);
};

Notifications.setSubscription = function(enable) {
	RNOneSignal.setSubscription(enable);
};

Notifications.idsAvailable = function(idsAvailable) {
    NetInfo.isConnected.fetch().then(isConnected => {
        if (isConnected == true) {
            RNOneSignal.idsAvailable(idsAvailable);
        }
        else {
            return;
        }
    });
}

DeviceEventEmitter.addListener(DEVICE_NOTIF_EVENT, function(notifData) {
		var message = notifData.message;
		var data = (notifData.additionalData !== null && typeof notifData.additionalData === 'object') ? notifData.additionalData : JSON.parse(notifData.additionalData);
		var isActive = notifData.isActive;
		Notifications._onNotificationOpened(message, data, isActive);
	}
);

module.exports = Notifications;
