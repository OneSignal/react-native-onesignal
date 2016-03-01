/**
 * @providesModule Notifications
 */

'use strict';

import { NativeModules, DeviceEventEmitter } from 'react-native';

const { RNOneSignal } = NativeModules;

var Notifications = {
	onError: false,
	onNotificationOpened: false,

	loaded: false,
};

var _notifHandlers = new Map();
var DEVICE_NOTIF_EVENT = 'remoteNotificationOpened';

Notifications.addEventListener = function(type: string, handler: Function) {
	var listener;
	if (type === 'notification') {
		console.log('Regsitered notification event listener at', Date.now());
		listener =  DeviceEventEmitter.addListener(
			DEVICE_NOTIF_EVENT,
			function(notifData) {
				console.log(notifData);
				var message = notifData.message;
				var data = (notifData.additionalData !== null && typeof notifData.additionalData === 'object') ? notifData.additionalData : JSON.parse(notifData.additionalData);
				var isActive = notifData.isActive;
				handler(message, data, isActive);
			}
		);
	}

	_notifHandlers.set(handler, listener);
};

Notifications.removeEventListener = function(type: string, handler: Function) {
	var listener = _notifHandlers.get(handler);
	if (!listener) {
		return;
	}
	listener.remove();
	_notifHandlers.delete(handler);
};

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
	}

	if ( this.loaded === false ) {
		this.addEventListener('notification', this._onNotificationOpened.bind(this));

		this.loaded = true;
	}
};

/* Unregister */
Notifications.unregister = function() {
	this.removeEventListener('notification', this._onNotificationOpened.bind(this));
};

Notifications._onNotificationOpened = function(message, data, isActive) {
	if ( this.onNotificationOpened !== false ) {
		this.onNotificationOpened(message, data, isActive);
	}
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

Notifications.enableNotificationsWhenActive = function(enable) {
	RNOneSignal.enableNotificationsWhenActive(enable);
};

Notifications.enableNotificationsWhenActive = function(enable) {
	RNOneSignal.enableNotificationsWhenActive(enable);
};

Notifications.setSubscription = function(enable) {
	RNOneSignal.setSubscription(enable);
};


module.exports = Notifications;
