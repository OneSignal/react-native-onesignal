/**
 * @providesModule Notifications
 */

'use strict';

import { NativeModules, NativeEventEmitter, NetInfo, Platform } from 'react-native';
import invariant from 'invariant';

const { RNOneSignal } = NativeModules;

var Notifications = {
	onError: false,
	onNotificationReceived: false,
	onNotificationOpened: false,
	onNotificationsRegistered: false
};

//Holds an array of stringified OSNotification objects
var _pendingNotificationsReceived = [];

//Holds an array of stringified OSNotificationResult objects
var _pendingNotificationsOpened = [];

var DEVICE_NOTIF_RECEIVED_EVENT = 'remoteNotificationReceived';
var DEVICE_NOTIF_OPENED_EVENT = 'remoteNotificationOpened';
var DEVICE_NOTIF_REG_EVENT = 'remoteNotificationsRegistered';
var DEVICE_IDS_AVAILABLE = 'idsAvailable';

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

	if ( typeof options.onNotificationReceived !== 'undefined' ) {
		this.onNotificationReceived = options.onNotificationReceived;

		if (_pendingNotifications.length > 0) {
			var notification = _pendingNotificationsReceived.pop();
			this._onNotificationReceived(JSON.parse(notification));
		}
	}

	if ( typeof options.onNotificationOpened !== 'undefined' ) {
		this.onNotificationOpened = options.onNotificationOpened;

		if (_pendingNotificationsOpened.length > 0) {
			var result = _pendingNotificationsOpened.pop();
			this._onNotificationOpened(JSON.parse(result));
		}
	}

	if( typeof options.onNotificationsRegistered !== 'undefined' ) {
		this.onNotificationsRegistered = options.onNotificationsRegistered;
	}

	if( typeof options.onIdsAvailable !== 'undefined' ) {
		this.onIdsAvailable = options.onIdsAvailable;
	}

	function handleConnectionStateChange(isConnected) {
    	if(!isConnected) return;

    	RNOneSignal.configure();
    	NetInfo.isConnected.removeEventListener('change', handleConnectionStateChange);
  	}

  NetInfo.isConnected.fetch().then(isConnected => {
    if(isConnected) return RNOneSignal.configure();
    NetInfo.isConnected.addEventListener('change', handleConnectionStateChange);
  });
};

/* Unregister */
Notifications.unregister = function() {
	this.onNotificationOpened = false;
};

Notifications.requestPermissions = function(permissions) {
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
};

Notifications.registerForPushNotifications = function(){
	if (Platform.OS == 'ios') {
		RNOneSignal.registerForPushNotifications();
	} else {
		console.log("This function is not supported on Android");
	}
};

Notifications.checkPermissions = function(callback: Function) {
	if (Platform.OS == 'ios') {
		invariant(
			typeof callback === 'function',
			'Must provide a valid callback'
		);
		RNOneSignal.checkPermissions(callback);
	} else {
		console.log("This function is not supported on Android");
	}
};

//notification is a stringified JSON object of type OSNotification
Notifications._onNotificationReceived = function(notification) {
	if ( this.onNotificationReceived === false) {
		_pendingNotificationsReceived.push(notification);
		return;
	}
	this.onNotificationReceived(JSON.parse(notification));
};

//result is a stringified JSON object of type OSNOtificationResult
Notifications._onNotificationOpened = function(result) {
	if ( this.onNotificationOpened === false ) {
		_pendingNotificationsOpened.push(result);
		return;
	}
	this.onNotificationOpened(JSON.parse(result));
};

Notifications._onNotificationsRegistered = function(payload) {
	if ( this.onNotificationsRegistered === false ) {
		return;
 	}
 	this.onNotificationsRegistered(payload);
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
	if (Platform.OS == 'android') {
		RNOneSignal.enableVibrate(enable);
	} else {
		console.log("This function is not supported on iOS");
	}
};

Notifications.enableSound = function(enable) {
	if (Platform.OS == 'android') {
		RNOneSignal.enableSound(enable);
	} else {
		console.log("This function is not supported on iOS");
	}
};

Notifications.enableNotificationsWhenActive = function(enable) {
	if (Platform.OS == 'android') {
		RNOneSignal.enableNotificationsWhenActive(enable);
	} else {
		console.log("This function is not supported on iOS");
	}
};

Notifications.setSubscription = function(enable) {
	RNOneSignal.setSubscription(enable);
};

Notifications.promptLocation = function() {
	//Supported in both iOS & Android
	RNOneSignal.promptLocation();
};

Notifications.postNotification = function(contents, data, player_id) {
	if (Platform.OS == 'android') {
		RNOneSignal.postNotification(JSON.stringify(contents), JSON.stringify(data), player_id);
	} else {
		RNOneSignal.postNotification(contents, data, player_id);
	}
};

Notifications.clearOneSignalNotifications = function() {
	if (Platform.OS == 'android') {
		RNOneSignal.clearOneSignalNotifications();
	} else {
		console.log("This function is not supported on iOS");
	}
};

Notifications.cancelNotification = function(id) {
	if (Platform.OS == 'android') {
		RNOneSignal.cancelNotification(id);
	} else {
		console.log("This function is not supported on iOS");
	}
};

Notifications.idsAvailable = function(idsAvailable) {
	console.log('Please use the onIdsAvailable event instead, it can be defined in the register options');
};

//Sends MD5 and SHA1 hashes of the user's email address (https://documentation.onesignal.com/docs/ios-sdk-api#section-synchashedemail)
Notifications.syncHashedEmail = function(email) {
	RNOneSignal.syncHashedEmail(email);
}

Notifications.setLogLevel = function(nsLogLevel, visualLogLevel) {
	RNOneSignal.setLogLevel(nsLogLevel, visualLogLevel);
}

// Listen to events of notification received, opened, device registered and IDSAvailable.
DeviceEventEmitter.addListener(DEVICE_NOTIF_RECEIVED_EVENT, function(notification) {
	Notifications._onNotificationReceived(notification);
});

DeviceEventEmitter.addListener(DEVICE_NOTIF_OPENED_EVENT, function(result) {
	Notifications._onNotificationOpened(result);
});

DeviceEventEmitter.addListener(DEVICE_NOTIF_REG_EVENT, function(notifData) {
	Notifications._onNotificationsRegistered(notifData)
});

DeviceEventEmitter.addListener(DEVICE_IDS_AVAILABLE, function(idsAvailable) {
	if (Notifications.onIdsAvailable) {
		Notifications.onIdsAvailable(idsAvailable);
	}
});

module.exports = Notifications;
