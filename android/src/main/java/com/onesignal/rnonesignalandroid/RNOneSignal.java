/*
Modified MIT License

Copyright 2023 OneSignal

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

1. The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

2. All copies of substantial portions of the Software may only be used in connection
with services provided by OneSignal.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

Authors:
 - Avishay Bar (creator) - 1/31/16
 - Brad Hesse
 - Josh Kasten
 - Rodrigo Gomez-Palacio
 - Michael DiCioccio
 - Ruslan Kesheshian
*/

package com.onesignal.rnonesignalandroid;

import android.content.Context;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.LifecycleEventListener;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.onesignal.Continue;
import com.onesignal.OneSignal;
import com.onesignal.common.OneSignalWrapper;
import com.onesignal.debug.LogLevel;
import com.onesignal.debug.internal.logging.Logging;
import com.onesignal.inAppMessages.IInAppMessageClickEvent;
import com.onesignal.inAppMessages.IInAppMessageClickListener;
import com.onesignal.inAppMessages.IInAppMessageDidDismissEvent;
import com.onesignal.inAppMessages.IInAppMessageDidDisplayEvent;
import com.onesignal.inAppMessages.IInAppMessageLifecycleListener;
import com.onesignal.inAppMessages.IInAppMessageWillDismissEvent;
import com.onesignal.inAppMessages.IInAppMessageWillDisplayEvent;
import com.onesignal.notifications.INotification;
import com.onesignal.notifications.INotificationClickEvent;
import com.onesignal.notifications.INotificationClickListener;
import com.onesignal.notifications.INotificationLifecycleListener;
import com.onesignal.notifications.INotificationWillDisplayEvent;
import com.onesignal.notifications.IPermissionObserver;
import com.onesignal.user.state.IUserStateObserver;
import com.onesignal.user.state.UserChangedState;
import com.onesignal.user.subscriptions.IPushSubscription;
import com.onesignal.user.subscriptions.IPushSubscriptionObserver;
import com.onesignal.user.subscriptions.PushSubscriptionChangedState;
import java.util.HashMap;
import java.util.Map;
import org.json.JSONException;

public class RNOneSignal extends ReactContextBaseJavaModule
        implements IPushSubscriptionObserver,
                IPermissionObserver,
                IUserStateObserver,
                LifecycleEventListener,
                INotificationLifecycleListener {
    private ReactApplicationContext mReactApplicationContext;
    private ReactContext mReactContext;

    private boolean oneSignalInitDone;
    private boolean hasSetPermissionObserver = false;
    private boolean hasSetPushSubscriptionObserver = false;
    private boolean hasSetUserStateObserver = false;

    private HashMap<String, INotificationWillDisplayEvent> notificationWillDisplayCache;
    private HashMap<String, INotificationWillDisplayEvent> preventDefaultCache;

    private boolean hasAddedNotificationForegroundListener = false;
    private boolean hasAddedInAppMessageLifecycleListener = false;
    private boolean hasAddedNotificationClickListener = false;
    private boolean hasAddedInAppMessageClickListener = false;

    // Static reference to track current instance for cleanup on reload
    private static RNOneSignal currentInstance = null;

    private IInAppMessageClickListener rnInAppClickListener = new IInAppMessageClickListener() {
        @Override
        public void onClick(IInAppMessageClickEvent event) {
            try {
                sendEvent(
                        "OneSignal-inAppMessageClicked",
                        RNUtils.convertHashMapToWritableMap(RNUtils.convertInAppMessageClickEventToMap(event)));
            } catch (JSONException e) {
                e.printStackTrace();
            }
        }
    };

    private IInAppMessageLifecycleListener rnInAppLifecycleListener = new IInAppMessageLifecycleListener() {
        @Override
        public void onWillDisplay(IInAppMessageWillDisplayEvent event) {
            try {
                sendEvent(
                        "OneSignal-inAppMessageWillDisplay",
                        RNUtils.convertHashMapToWritableMap(RNUtils.convertInAppMessageWillDisplayEventToMap(event)));
            } catch (JSONException e) {
                e.printStackTrace();
            }
        }

        @Override
        public void onDidDisplay(IInAppMessageDidDisplayEvent event) {
            try {
                sendEvent(
                        "OneSignal-inAppMessageDidDisplay",
                        RNUtils.convertHashMapToWritableMap(RNUtils.convertInAppMessageDidDisplayEventToMap(event)));
            } catch (JSONException e) {
                e.printStackTrace();
            }
        }

        @Override
        public void onWillDismiss(IInAppMessageWillDismissEvent event) {
            try {
                sendEvent(
                        "OneSignal-inAppMessageWillDismiss",
                        RNUtils.convertHashMapToWritableMap(RNUtils.convertInAppMessageWillDismissEventToMap(event)));
            } catch (JSONException e) {
                e.printStackTrace();
            }
        }

        @Override
        public void onDidDismiss(IInAppMessageDidDismissEvent event) {
            try {
                sendEvent(
                        "OneSignal-inAppMessageDidDismiss",
                        RNUtils.convertHashMapToWritableMap(RNUtils.convertInAppMessageDidDismissEventToMap(event)));
            } catch (JSONException e) {
                e.printStackTrace();
            }
        }
    };

    private INotificationClickListener rnNotificationClickListener = new INotificationClickListener() {
        @Override
        public void onClick(INotificationClickEvent event) {
            try {
                sendEvent(
                        "OneSignal-notificationClicked",
                        RNUtils.convertHashMapToWritableMap(RNUtils.convertNotificationClickEventToMap(event)));
            } catch (JSONException e) {
                e.printStackTrace();
            }
        }
    };

    private void removeObservers() {
        if (!oneSignalInitDone) {
            Logging.debug("OneSignal React-Native SDK not initialized yet. Could not remove observers.", null);
            return;
        }

        this.removePermissionObserver();
        this.removePushSubscriptionObserver();
        this.removeUserStateObserver();

        if (hasAddedInAppMessageClickListener) {
            OneSignal.getInAppMessages().removeClickListener(rnInAppClickListener);
            hasAddedInAppMessageClickListener = false;
        }
        if (hasAddedInAppMessageLifecycleListener) {
            OneSignal.getInAppMessages().removeLifecycleListener(rnInAppLifecycleListener);
            hasAddedInAppMessageLifecycleListener = false;
        }
        if (hasAddedNotificationClickListener) {
            OneSignal.getNotifications().removeClickListener(rnNotificationClickListener);
            hasAddedNotificationClickListener = false;
        }
        if (hasAddedNotificationForegroundListener) {
            OneSignal.getNotifications().removeForegroundLifecycleListener(this);
            hasAddedNotificationForegroundListener = false;
        }
    }

    private void sendEvent(String eventName, Object params) {
        mReactContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit(eventName, params);
    }

    public RNOneSignal(ReactApplicationContext reactContext) {
        super(reactContext);
        mReactApplicationContext = reactContext;
        mReactContext = reactContext;
        mReactContext.addLifecycleEventListener(this);
        notificationWillDisplayCache = new HashMap<String, INotificationWillDisplayEvent>();
        preventDefaultCache = new HashMap<String, INotificationWillDisplayEvent>();

        // Clean up previous instance if it exists (handles reload scenario)
        if (currentInstance != null && currentInstance != this) {
            currentInstance.removeObservers();
        }
        currentInstance = this;
    }

    /** Native Module Overrides */
    @Override
    public String getName() {
        return "OneSignal";
    }

    @Override
    public void onHostDestroy() {
        removeObservers();
    }

    @Override
    public void onHostPause() {}

    @Override
    public void onHostResume() {}

    @Override
    public void onCatalystInstanceDestroy() {
        removeObservers();
    }

    // OneSignal namespace methods
    @ReactMethod
    public void initialize(String appId) {
        Context context = mReactApplicationContext.getCurrentActivity();
        OneSignalWrapper.setSdkType("reactnative");
        OneSignalWrapper.setSdkVersion("050213");

        if (oneSignalInitDone) {
            Logging.debug("Already initialized the OneSignal React-Native SDK", null);
            return;
        }

        if (context == null) {
            // in some cases, especially when react-native-navigation is installed,
            // the activity can be null, so we can initialize with the context instead
            context = mReactApplicationContext.getApplicationContext();
        }

        OneSignal.initWithContext(context, appId);
        oneSignalInitDone = true;
    }

    @ReactMethod
    public void setPrivacyConsentGiven(Boolean value) {
        OneSignal.setConsentGiven(value);
    }

    @ReactMethod
    public void setPrivacyConsentRequired(Boolean required) {
        OneSignal.setConsentRequired(required);
    }

    // OneSignal.Debug namespace methods
    @ReactMethod
    public void setLogLevel(int logLevel) {
        OneSignal.getDebug().setLogLevel(LogLevel.fromInt(logLevel));
    }

    @ReactMethod
    public void setAlertLevel(int logLevel) {
        OneSignal.getDebug().setAlertLevel(LogLevel.fromInt(logLevel));
    }

    // OneSignal.InAppMessages namespace methods
    @ReactMethod
    public void addInAppMessageClickListener() {
        if (!hasAddedInAppMessageClickListener) {
            OneSignal.getInAppMessages().addClickListener(rnInAppClickListener);
            hasAddedInAppMessageClickListener = true;
        }
    }

    @ReactMethod
    public void addInAppMessagesLifecycleListener() {
        if (!hasAddedInAppMessageLifecycleListener) {
            OneSignal.getInAppMessages().addLifecycleListener(rnInAppLifecycleListener);
            hasAddedInAppMessageLifecycleListener = true;
        }
    }

    @ReactMethod
    public void getPaused(Promise promise) {
        promise.resolve(OneSignal.getInAppMessages().getPaused());
    }

    @ReactMethod
    public void paused(Boolean pause) {
        OneSignal.getInAppMessages().setPaused(pause);
    }

    @ReactMethod
    public void addTrigger(String key, String value) {
        OneSignal.getInAppMessages().addTrigger(key, value);
    }

    @ReactMethod
    public void addTriggers(ReadableMap triggers) {
        OneSignal.getInAppMessages().addTriggers(RNUtils.convertReadableMapIntoStringMap(triggers));
    }

    @ReactMethod
    public void removeTrigger(String key) {
        OneSignal.getInAppMessages().removeTrigger(key);
    }

    @ReactMethod
    public void removeTriggers(ReadableArray keys) {
        OneSignal.getInAppMessages().removeTriggers(RNUtils.convertReadableArrayIntoStringCollection(keys));
    }

    @ReactMethod
    public void clearTriggers() {
        OneSignal.getInAppMessages().clearTriggers();
    }

    // OneSignal.Location namespace methods
    @ReactMethod
    public void requestLocationPermission() {
        OneSignal.getLocation().requestPermission(Continue.none());
    }

    @ReactMethod
    public void isLocationShared(Promise promise) {
        promise.resolve(OneSignal.getLocation().isShared());
    }

    @ReactMethod
    public void setLocationShared(Boolean shared) {
        OneSignal.getLocation().setShared(shared);
    }

    // OneSignal.Notifications namespace methods
    @ReactMethod
    public void addNotificationClickListener() {
        if (this.hasAddedNotificationClickListener) {
            return;
        }

        OneSignal.getNotifications().addClickListener(rnNotificationClickListener);
        hasAddedNotificationClickListener = true;
    }

    @ReactMethod
    public void addNotificationForegroundLifecycleListener() {
        if (this.hasAddedNotificationForegroundListener) {
            return;
        }

        OneSignal.getNotifications().addForegroundLifecycleListener(this);
        hasAddedNotificationForegroundListener = true;
    }

    @Override
    public void onWillDisplay(INotificationWillDisplayEvent event) {
        if (!this.hasAddedNotificationForegroundListener) {
            event.getNotification().display();
        }

        INotification notification = event.getNotification();
        String notificationId = notification.getNotificationId();
        notificationWillDisplayCache.put(notificationId, (INotificationWillDisplayEvent) event);
        event.preventDefault();

        try {
            sendEvent(
                    "OneSignal-notificationWillDisplayInForeground",
                    RNUtils.convertHashMapToWritableMap(RNUtils.convertNotificationToMap(notification)));

            try {
                synchronized (event) {
                    while (preventDefaultCache.containsKey(notificationId)) {
                        event.wait();
                    }
                }
            } catch (InterruptedException e) {
                Logging.error("InterruptedException: " + e.toString(), null);
            }
        } catch (JSONException e) {
            e.printStackTrace();
        }
    }

    @ReactMethod
    private void displayNotification(String notificationId) {
        INotificationWillDisplayEvent event = notificationWillDisplayCache.get(notificationId);
        if (event == null) {
            Logging.error(
                    "Could not find onWillDisplayNotification event for notification with id: " + notificationId, null);
            return;
        }
        event.getNotification().display();
    }

    @ReactMethod
    private void preventDefault(String notificationId) {
        INotificationWillDisplayEvent event = notificationWillDisplayCache.get(notificationId);
        if (event == null) {
            Logging.error(
                    "Could not find onWillDisplayNotification event for notification with id: " + notificationId, null);
            return;
        }
        event.preventDefault();
        this.preventDefaultCache.put(notificationId, event);
    }

    @ReactMethod
    public void addPermissionObserver() {
        if (!hasSetPermissionObserver) {
            OneSignal.getNotifications().addPermissionObserver(this);
            hasSetPermissionObserver = true;
        }
    }

    @ReactMethod
    public void removePermissionObserver() {
        if (hasSetPermissionObserver) {
            OneSignal.getNotifications().removePermissionObserver(this);
            hasSetPermissionObserver = false;
        }
    }

    @Override
    public void onNotificationPermissionChange(boolean permission) {
        try {
            sendEvent(
                    "OneSignal-permissionChanged",
                    RNUtils.convertHashMapToWritableMap(RNUtils.convertPermissionToMap(permission)));
            Logging.debug("Sending permission change event", null);
        } catch (JSONException e) {
            e.printStackTrace();
        }
    }

    @ReactMethod
    public void requestNotificationPermission(final boolean fallbackToSettings, Promise promise) {
        // if permission already exists, return early as the method call will not resolve
        if (OneSignal.getNotifications().getPermission()) {
            promise.resolve(true);
            return;
        }

        OneSignal.getNotifications().requestPermission(fallbackToSettings, Continue.with(result -> {
            if (result.isSuccess()) {
                promise.resolve(result.getData());
            } else {
                promise.reject(result.getThrowable().getMessage());
            }
        }));
    }

    @ReactMethod
    public void hasNotificationPermission(Promise promise) {
        promise.resolve(OneSignal.getNotifications().getPermission());
    }

    @ReactMethod
    public void permissionNative(Promise promise) {
        if (OneSignal.getNotifications().getPermission()) {
            promise.resolve(2);
        } else {
            promise.resolve(1);
        }
    }

    @ReactMethod
    public void canRequestNotificationPermission(Promise promise) {
        promise.resolve(OneSignal.getNotifications().getCanRequestPermission());
    }

    @ReactMethod
    public void clearAllNotifications() {
        OneSignal.getNotifications().clearAllNotifications();
    }

    @ReactMethod
    public void removeNotification(int id) {
        OneSignal.getNotifications().removeNotification(id);
    }

    @ReactMethod
    public void removeGroupedNotifications(String id) {
        OneSignal.getNotifications().removeGroupedNotifications(id);
    }

    // OneSignal.User.pushSubscription namespace methods
    @ReactMethod
    public void getPushSubscriptionId(Promise promise) {
        IPushSubscription pushSubscription = OneSignal.getUser().getPushSubscription();
        String pushId = pushSubscription.getId();
        if (pushId != null && !pushId.isEmpty()) {
            promise.resolve(pushId);
        } else {
            promise.resolve(null);
        }
    }

    @ReactMethod
    public void getPushSubscriptionToken(Promise promise) {
        IPushSubscription pushSubscription = OneSignal.getUser().getPushSubscription();
        String pushToken = pushSubscription.getToken();
        if (pushToken != null && !pushToken.isEmpty()) {
            promise.resolve(pushToken);
        } else {
            promise.resolve(null);
        }
    }

    @ReactMethod
    public void getOptedIn(Promise promise) {
        IPushSubscription pushSubscription = OneSignal.getUser().getPushSubscription();
        promise.resolve(pushSubscription.getOptedIn());
    }

    @ReactMethod
    public void optIn() {
        IPushSubscription pushSubscription = OneSignal.getUser().getPushSubscription();
        pushSubscription.optIn();
    }

    @ReactMethod
    public void optOut() {
        IPushSubscription pushSubscription = OneSignal.getUser().getPushSubscription();
        pushSubscription.optOut();
    }

    @ReactMethod
    public void addPushSubscriptionObserver() {
        if (!hasSetPushSubscriptionObserver) {
            OneSignal.getUser().getPushSubscription().addObserver(this);
            hasSetPushSubscriptionObserver = true;
        }
    }

    @Override
    public void onPushSubscriptionChange(PushSubscriptionChangedState pushSubscriptionChangedState) {
        try {
            sendEvent(
                    "OneSignal-subscriptionChanged",
                    RNUtils.convertHashMapToWritableMap(
                            RNUtils.convertPushSubscriptionChangedStateToMap(pushSubscriptionChangedState)));
            Logging.debug("Sending subscription change event", null);
        } catch (JSONException e) {
            e.printStackTrace();
        }
    }

    @ReactMethod
    public void removePushSubscriptionObserver() {
        if (hasSetPushSubscriptionObserver) {
            OneSignal.getUser().getPushSubscription().removeObserver(this);
            hasSetPushSubscriptionObserver = false;
        }
    }

    // OneSignal.Session namespace methods
    @ReactMethod
    public void addOutcome(String name) {
        OneSignal.getSession().addOutcome(name);
    }

    @ReactMethod
    public void addUniqueOutcome(String name) {
        OneSignal.getSession().addUniqueOutcome(name);
    }

    @ReactMethod
    public void addOutcomeWithValue(String name, float value) {
        OneSignal.getSession().addOutcomeWithValue(name, value);
    }

    // OneSignal.User namespace methods
    @ReactMethod
    public void login(String externalUserId) {
        OneSignal.login(externalUserId);
    }

    @ReactMethod
    public void logout() {
        OneSignal.logout();
    }

    @ReactMethod
    public void setLanguage(String language) {
        OneSignal.getUser().setLanguage(language);
    }

    @ReactMethod
    public void addTag(String key, String value) {
        OneSignal.getUser().addTag(key, value);
    }

    @ReactMethod
    public void removeTag(String key) {
        OneSignal.getUser().removeTag(key);
    }

    @ReactMethod
    public void addTags(ReadableMap tags) {
        OneSignal.getUser().addTags(RNUtils.convertReadableMapIntoStringMap(tags));
    }

    @ReactMethod
    public void removeTags(ReadableArray tagKeys) {
        OneSignal.getUser().removeTags(RNUtils.convertReadableArrayIntoStringCollection(tagKeys));
    }

    @ReactMethod
    public void getTags(Promise promise) {
        Map<String, String> tags = OneSignal.getUser().getTags();
        WritableMap writableTags = Arguments.createMap();
        for (Map.Entry<String, String> entry : tags.entrySet()) {
            writableTags.putString(entry.getKey(), entry.getValue());
        }
        promise.resolve(writableTags);
    }

    @ReactMethod
    public void addEmail(String email, Promise promise) {
        try {
            OneSignal.getUser().addEmail(email);
            promise.resolve(null);
        } catch (Throwable t) {
            promise.reject(t.getMessage());
        }
    }

    @ReactMethod
    public void removeEmail(String email, Promise promise) {
        try {
            OneSignal.getUser().removeEmail(email);
            promise.resolve(null);
        } catch (Throwable t) {
            promise.reject(t.getMessage());
        }
    }

    @ReactMethod
    public void addSms(String smsNumber, Promise promise) {
        try {
            OneSignal.getUser().addSms(smsNumber);
            promise.resolve(null);
        } catch (Throwable t) {
            promise.reject(t.getMessage());
        }
    }

    @ReactMethod
    public void removeSms(String smsNumber, Promise promise) {
        try {
            OneSignal.getUser().removeSms(smsNumber);
            promise.resolve(null);
        } catch (Throwable t) {
            promise.reject(t.getMessage());
        }
    }

    @ReactMethod
    public void addAlias(String label, String id) {
        OneSignal.getUser().addAlias(label, id);
    }

    @ReactMethod
    public void removeAlias(String label) {
        OneSignal.getUser().removeAlias(label);
    }

    @ReactMethod
    public void addAliases(ReadableMap aliases) {
        OneSignal.getUser().addAliases(RNUtils.convertReadableMapIntoStringMap(aliases));
    }

    @ReactMethod
    public void removeAliases(ReadableArray aliasLabels) {
        OneSignal.getUser().removeAliases(RNUtils.convertReadableArrayIntoStringCollection(aliasLabels));
    }

    @ReactMethod
    public void getOnesignalId(Promise promise) {
        String onesignalId = OneSignal.getUser().getOnesignalId();
        if (onesignalId.isEmpty()) {
            onesignalId = null;
        }
        promise.resolve(onesignalId);
    }

    @ReactMethod
    public void getExternalId(Promise promise) {
        String externalId = OneSignal.getUser().getExternalId();
        if (externalId.isEmpty()) {
            externalId = null;
        }
        promise.resolve(externalId);
    }

    @ReactMethod
    public void addUserStateObserver() {
        if (!hasSetUserStateObserver) {
            OneSignal.getUser().addObserver(this);
            hasSetUserStateObserver = true;
        }
    }

    @Override
    public void onUserStateChange(UserChangedState state) {
        try {
            sendEvent(
                    "OneSignal-userStateChanged",
                    RNUtils.convertHashMapToWritableMap(RNUtils.convertUserChangedStateToMap(state)));
            Logging.debug("Sending user state change event", null);
        } catch (JSONException e) {
            e.printStackTrace();
        }
    }

    @ReactMethod
    public void removeUserStateObserver() {
        if (hasSetUserStateObserver) {
            OneSignal.getUser().removeObserver(this);
            hasSetUserStateObserver = false;
        }
    }

    /** Added for NativeEventEmitter */
    @ReactMethod
    public void addListener(String eventName) {
        // Keep: Required for RN built in Event Emitter Calls.
    }

    @ReactMethod
    public void removeListeners(int count) {
        // Keep: Required for RN built in Event Emitter Calls.
    }
}
