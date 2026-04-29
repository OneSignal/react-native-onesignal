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
import androidx.annotation.Nullable;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.LifecycleEventListener;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableMap;
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

public class RNOneSignal extends NativeOneSignalSpec
        implements IPushSubscriptionObserver,
                IPermissionObserver,
                IUserStateObserver,
                LifecycleEventListener,
                INotificationLifecycleListener {
    public static final String NAME = "OneSignal";

    private boolean oneSignalInitDone;
    private boolean hasSetPermissionObserver = false;
    private boolean hasSetPushSubscriptionObserver = false;
    private boolean hasSetUserStateObserver = false;

    private final HashMap<String, INotificationWillDisplayEvent> notificationWillDisplayCache = new HashMap<>();
    private final HashMap<String, INotificationWillDisplayEvent> preventDefaultCache = new HashMap<>();

    private boolean hasAddedNotificationForegroundListener = false;
    private boolean hasAddedInAppMessageLifecycleListener = false;
    private boolean hasAddedNotificationClickListener = false;
    private boolean hasAddedInAppMessageClickListener = false;

    // Static reference to track current instance for cleanup on reload
    private static RNOneSignal currentInstance = null;

    private final IInAppMessageClickListener rnInAppClickListener = new IInAppMessageClickListener() {
        @Override
        public void onClick(IInAppMessageClickEvent event) {
            try {
                emitOnInAppMessageClicked(
                        RNUtils.convertHashMapToWritableMap(RNUtils.convertInAppMessageClickEventToMap(event)));
            } catch (JSONException e) {
                logJSONException("onInAppMessageClicked", e);
            }
        }
    };

    private final IInAppMessageLifecycleListener rnInAppLifecycleListener = new IInAppMessageLifecycleListener() {
        @Override
        public void onWillDisplay(IInAppMessageWillDisplayEvent event) {
            try {
                emitOnInAppMessageWillDisplay(
                        RNUtils.convertHashMapToWritableMap(RNUtils.convertInAppMessageWillDisplayEventToMap(event)));
            } catch (JSONException e) {
                logJSONException("onInAppMessageWillDisplay", e);
            }
        }

        @Override
        public void onDidDisplay(IInAppMessageDidDisplayEvent event) {
            try {
                emitOnInAppMessageDidDisplay(
                        RNUtils.convertHashMapToWritableMap(RNUtils.convertInAppMessageDidDisplayEventToMap(event)));
            } catch (JSONException e) {
                logJSONException("onInAppMessageDidDisplay", e);
            }
        }

        @Override
        public void onWillDismiss(IInAppMessageWillDismissEvent event) {
            try {
                emitOnInAppMessageWillDismiss(
                        RNUtils.convertHashMapToWritableMap(RNUtils.convertInAppMessageWillDismissEventToMap(event)));
            } catch (JSONException e) {
                logJSONException("onInAppMessageWillDismiss", e);
            }
        }

        @Override
        public void onDidDismiss(IInAppMessageDidDismissEvent event) {
            try {
                emitOnInAppMessageDidDismiss(
                        RNUtils.convertHashMapToWritableMap(RNUtils.convertInAppMessageDidDismissEventToMap(event)));
            } catch (JSONException e) {
                logJSONException("onInAppMessageDidDismiss", e);
            }
        }
    };

    private final INotificationClickListener rnNotificationClickListener = new INotificationClickListener() {
        @Override
        public void onClick(INotificationClickEvent event) {
            try {
                emitOnNotificationClicked(
                        RNUtils.convertHashMapToWritableMap(RNUtils.convertNotificationClickEventToMap(event)));
            } catch (JSONException e) {
                logJSONException("onNotificationClicked", e);
            }
        }
    };

    private void logJSONException(String eventName, JSONException exception) {
        Logging.error("Failed to serialize payload for " + eventName, exception);
    }

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

    public RNOneSignal(ReactApplicationContext reactContext) {
        super(reactContext);
        reactContext.addLifecycleEventListener(this);

        // Clean up previous instance if it exists (handles reload scenario)
        if (currentInstance != null && currentInstance != this) {
            currentInstance.removeObservers();
        }
        currentInstance = this;
    }

    @Override
    public String getName() {
        return NAME;
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
    public void invalidate() {
        removeObservers();
        super.invalidate();
    }

    @Override
    public void initialize(String appId) {
        OneSignalWrapper.setSdkType("reactnative");
        OneSignalWrapper.setSdkVersion("050404");

        if (oneSignalInitDone) {
            Logging.debug("Already initialized the OneSignal React-Native SDK", null);
            return;
        }

        ReactApplicationContext reactContext = getReactApplicationContext();
        // Prefer the Activity captured by ActivityLifecycleTracker (registered via androidx.startup
        // before MainActivity.onResume), then fall back to ReactApplicationContext's accessor and
        // finally the ApplicationContext. Passing the real Activity lets the OneSignal SDK populate
        // ApplicationService.current immediately, so requestPermission() can launch the OS dialog
        // on the first cold-start instead of waiting for the next foreground event.
        Context context = ActivityLifecycleTracker.getInstance().getCurrentActivity();
        if (context == null) {
            context = reactContext.getCurrentActivity();
        }
        if (context == null) {
            context = reactContext.getApplicationContext();
        }

        Logging.debug(
                "OneSignal initialize using context: " + context.getClass().getSimpleName(), null);
        OneSignal.initWithContext(context, appId);
        oneSignalInitDone = true;
    }

    @Override
    public void setPrivacyConsentGiven(boolean value) {
        OneSignal.setConsentGiven(value);
    }

    @Override
    public void setPrivacyConsentRequired(boolean required) {
        OneSignal.setConsentRequired(required);
    }

    @Override
    public void setLogLevel(double logLevel) {
        OneSignal.getDebug().setLogLevel(LogLevel.fromInt((int) logLevel));
    }

    @Override
    public void setAlertLevel(double logLevel) {
        OneSignal.getDebug().setAlertLevel(LogLevel.fromInt((int) logLevel));
    }

    @Override
    public void addInAppMessageClickListener() {
        if (!hasAddedInAppMessageClickListener) {
            OneSignal.getInAppMessages().addClickListener(rnInAppClickListener);
            hasAddedInAppMessageClickListener = true;
        }
    }

    @Override
    public void addInAppMessagesLifecycleListener() {
        if (!hasAddedInAppMessageLifecycleListener) {
            OneSignal.getInAppMessages().addLifecycleListener(rnInAppLifecycleListener);
            hasAddedInAppMessageLifecycleListener = true;
        }
    }

    @Override
    public void getPaused(Promise promise) {
        promise.resolve(OneSignal.getInAppMessages().getPaused());
    }

    @Override
    public void paused(boolean pause) {
        OneSignal.getInAppMessages().setPaused(pause);
    }

    @Override
    public void addTrigger(String key, String value) {
        OneSignal.getInAppMessages().addTrigger(key, value);
    }

    @Override
    public void addTriggers(ReadableMap triggers) {
        OneSignal.getInAppMessages().addTriggers(RNUtils.convertReadableMapIntoStringMap(triggers));
    }

    @Override
    public void removeTrigger(String key) {
        OneSignal.getInAppMessages().removeTrigger(key);
    }

    @Override
    public void removeTriggers(ReadableArray keys) {
        OneSignal.getInAppMessages().removeTriggers(RNUtils.convertReadableArrayIntoStringCollection(keys));
    }

    @Override
    public void clearTriggers() {
        OneSignal.getInAppMessages().clearTriggers();
    }

    @Override
    public void requestLocationPermission() {
        OneSignal.getLocation().requestPermission(Continue.none());
    }

    @Override
    public void isLocationShared(Promise promise) {
        promise.resolve(OneSignal.getLocation().isShared());
    }

    @Override
    public void setLocationShared(boolean shared) {
        OneSignal.getLocation().setShared(shared);
    }

    @Override
    public void addNotificationClickListener() {
        if (this.hasAddedNotificationClickListener) {
            return;
        }

        OneSignal.getNotifications().addClickListener(rnNotificationClickListener);
        hasAddedNotificationClickListener = true;
    }

    @Override
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
        notificationWillDisplayCache.put(notificationId, event);
        event.preventDefault();

        try {
            emitOnNotificationWillDisplay(
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
            logJSONException("onNotificationWillDisplay", e);
        }
    }

    @Override
    public void displayNotification(String notificationId) {
        INotificationWillDisplayEvent event = notificationWillDisplayCache.get(notificationId);
        if (event == null) {
            Logging.error(
                    "Could not find onWillDisplayNotification event for notification with id: " + notificationId, null);
            return;
        }
        event.getNotification().display();
    }

    @Override
    public void preventDefault(String notificationId) {
        INotificationWillDisplayEvent event = notificationWillDisplayCache.get(notificationId);
        if (event == null) {
            Logging.error(
                    "Could not find onWillDisplayNotification event for notification with id: " + notificationId, null);
            return;
        }
        event.preventDefault();
        this.preventDefaultCache.put(notificationId, event);
    }

    @Override
    public void addPermissionObserver() {
        if (!hasSetPermissionObserver) {
            OneSignal.getNotifications().addPermissionObserver(this);
            hasSetPermissionObserver = true;
        }
    }

    private void removePermissionObserver() {
        if (hasSetPermissionObserver) {
            OneSignal.getNotifications().removePermissionObserver(this);
            hasSetPermissionObserver = false;
        }
    }

    @Override
    public void onNotificationPermissionChange(boolean permission) {
        try {
            emitOnPermissionChanged(RNUtils.convertHashMapToWritableMap(RNUtils.convertPermissionToMap(permission)));
            Logging.debug("Sending permission change event", null);
        } catch (JSONException e) {
            logJSONException("onPermissionChanged", e);
        }
    }

    @Override
    public void requestNotificationPermission(boolean fallbackToSettings, Promise promise) {
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

    @Override
    public void hasNotificationPermission(Promise promise) {
        promise.resolve(OneSignal.getNotifications().getPermission());
    }

    @Override
    public void permissionNative(Promise promise) {
        if (OneSignal.getNotifications().getPermission()) {
            promise.resolve(2);
        } else {
            promise.resolve(1);
        }
    }

    @Override
    public void canRequestNotificationPermission(Promise promise) {
        promise.resolve(OneSignal.getNotifications().getCanRequestPermission());
    }

    @Override
    public void registerForProvisionalAuthorization(Callback callback) {
        // iOS only, no-op on Android
    }

    @Override
    public void clearAllNotifications() {
        OneSignal.getNotifications().clearAllNotifications();
    }

    @Override
    public void removeNotification(double id) {
        OneSignal.getNotifications().removeNotification((int) id);
    }

    @Override
    public void removeGroupedNotifications(String id) {
        OneSignal.getNotifications().removeGroupedNotifications(id);
    }

    // Live Activities stubs (iOS only)
    @Override
    public void enterLiveActivity(String activityId, String token, Callback callback) {
        // iOS only, no-op on Android
    }

    @Override
    public void exitLiveActivity(String activityId, Callback callback) {
        // iOS only, no-op on Android
    }

    @Override
    public void setPushToStartToken(String activityType, String token) {
        // iOS only, no-op on Android
    }

    @Override
    public void removePushToStartToken(String activityType) {
        // iOS only, no-op on Android
    }

    @Override
    public void setupDefaultLiveActivity(@Nullable ReadableMap options) {
        // iOS only, no-op on Android
    }

    @Override
    public void startDefaultLiveActivity(String activityId, ReadableMap attributes, ReadableMap content) {
        // iOS only, no-op on Android
    }

    @Override
    public void getPushSubscriptionId(Promise promise) {
        IPushSubscription pushSubscription = OneSignal.getUser().getPushSubscription();
        String pushId = pushSubscription.getId();
        if (pushId != null && !pushId.isEmpty()) {
            promise.resolve(pushId);
        } else {
            promise.resolve(null);
        }
    }

    @Override
    public void getPushSubscriptionToken(Promise promise) {
        IPushSubscription pushSubscription = OneSignal.getUser().getPushSubscription();
        String pushToken = pushSubscription.getToken();
        if (pushToken != null && !pushToken.isEmpty()) {
            promise.resolve(pushToken);
        } else {
            promise.resolve(null);
        }
    }

    @Override
    public void getOptedIn(Promise promise) {
        IPushSubscription pushSubscription = OneSignal.getUser().getPushSubscription();
        promise.resolve(pushSubscription.getOptedIn());
    }

    @Override
    public void optIn() {
        IPushSubscription pushSubscription = OneSignal.getUser().getPushSubscription();
        pushSubscription.optIn();
    }

    @Override
    public void optOut() {
        IPushSubscription pushSubscription = OneSignal.getUser().getPushSubscription();
        pushSubscription.optOut();
    }

    @Override
    public void addPushSubscriptionObserver() {
        if (!hasSetPushSubscriptionObserver) {
            OneSignal.getUser().getPushSubscription().addObserver(this);
            hasSetPushSubscriptionObserver = true;
        }
    }

    @Override
    public void onPushSubscriptionChange(PushSubscriptionChangedState pushSubscriptionChangedState) {
        try {
            emitOnSubscriptionChanged(RNUtils.convertHashMapToWritableMap(
                    RNUtils.convertPushSubscriptionChangedStateToMap(pushSubscriptionChangedState)));
            Logging.debug("Sending subscription change event", null);
        } catch (JSONException e) {
            logJSONException("onSubscriptionChanged", e);
        }
    }

    private void removePushSubscriptionObserver() {
        if (hasSetPushSubscriptionObserver) {
            OneSignal.getUser().getPushSubscription().removeObserver(this);
            hasSetPushSubscriptionObserver = false;
        }
    }

    @Override
    public void addOutcome(String name) {
        OneSignal.getSession().addOutcome(name);
    }

    @Override
    public void addUniqueOutcome(String name) {
        OneSignal.getSession().addUniqueOutcome(name);
    }

    @Override
    public void addOutcomeWithValue(String name, double value) {
        OneSignal.getSession().addOutcomeWithValue(name, (float) value);
    }

    @Override
    public void login(String externalUserId) {
        OneSignal.login(externalUserId);
    }

    @Override
    public void logout() {
        OneSignal.logout();
    }

    @Override
    public void setLanguage(String language) {
        OneSignal.getUser().setLanguage(language);
    }

    @Override
    public void addTag(String key, String value) {
        OneSignal.getUser().addTag(key, value);
    }

    @Override
    public void removeTag(String key) {
        OneSignal.getUser().removeTag(key);
    }

    @Override
    public void addTags(ReadableMap tags) {
        OneSignal.getUser().addTags(RNUtils.convertReadableMapIntoStringMap(tags));
    }

    @Override
    public void removeTags(ReadableArray tagKeys) {
        OneSignal.getUser().removeTags(RNUtils.convertReadableArrayIntoStringCollection(tagKeys));
    }

    @Override
    public void getTags(Promise promise) {
        Map<String, String> tags = OneSignal.getUser().getTags();
        WritableMap writableTags = Arguments.createMap();
        for (Map.Entry<String, String> entry : tags.entrySet()) {
            writableTags.putString(entry.getKey(), entry.getValue());
        }
        promise.resolve(writableTags);
    }

    @Override
    public void addEmail(String email) {
        OneSignal.getUser().addEmail(email);
    }

    @Override
    public void removeEmail(String email) {
        OneSignal.getUser().removeEmail(email);
    }

    @Override
    public void addSms(String smsNumber) {
        OneSignal.getUser().addSms(smsNumber);
    }

    @Override
    public void removeSms(String smsNumber) {
        OneSignal.getUser().removeSms(smsNumber);
    }

    @Override
    public void addAlias(String label, String id) {
        OneSignal.getUser().addAlias(label, id);
    }

    @Override
    public void removeAlias(String label) {
        OneSignal.getUser().removeAlias(label);
    }

    @Override
    public void addAliases(ReadableMap aliases) {
        OneSignal.getUser().addAliases(RNUtils.convertReadableMapIntoStringMap(aliases));
    }

    @Override
    public void removeAliases(ReadableArray aliasLabels) {
        OneSignal.getUser().removeAliases(RNUtils.convertReadableArrayIntoStringCollection(aliasLabels));
    }

    @Override
    public void getOnesignalId(Promise promise) {
        String onesignalId = OneSignal.getUser().getOnesignalId();
        if (onesignalId == null || onesignalId.isEmpty()) {
            promise.resolve(null);
        } else {
            promise.resolve(onesignalId);
        }
    }

    @Override
    public void getExternalId(Promise promise) {
        String externalId = OneSignal.getUser().getExternalId();
        if (externalId == null || externalId.isEmpty()) {
            promise.resolve(null);
        } else {
            promise.resolve(externalId);
        }
    }

    @Override
    public void addUserStateObserver() {
        if (!hasSetUserStateObserver) {
            OneSignal.getUser().addObserver(this);
            hasSetUserStateObserver = true;
        }
    }

    @Override
    public void onUserStateChange(UserChangedState state) {
        try {
            emitOnUserStateChanged(RNUtils.convertHashMapToWritableMap(RNUtils.convertUserChangedStateToMap(state)));
            Logging.debug("Sending user state change event", null);
        } catch (JSONException e) {
            logJSONException("onUserStateChanged", e);
        }
    }

    private void removeUserStateObserver() {
        if (hasSetUserStateObserver) {
            OneSignal.getUser().removeObserver(this);
            hasSetUserStateObserver = false;
        }
    }

    @Override
    public void trackEvent(String name, @Nullable ReadableMap properties) {
        OneSignal.getUser().trackEvent(name, properties != null ? properties.toHashMap() : new HashMap<>());
    }
}
