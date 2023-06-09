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

package com.geektime.rnonesignalandroid;

import android.content.Context;
import android.content.pm.ApplicationInfo;
import android.os.Bundle;
import android.util.Log;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.LifecycleEventListener;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.onesignal.Continue;
import com.onesignal.OneSignal;
import com.onesignal.debug.LogLevel;
import com.onesignal.inAppMessages.IInAppMessage;
import com.onesignal.inAppMessages.IInAppMessageClickListener;
import com.onesignal.inAppMessages.IInAppMessageClickEvent;
import com.onesignal.inAppMessages.IInAppMessageClickResult;
import com.onesignal.inAppMessages.IInAppMessageLifecycleListener;
import com.onesignal.inAppMessages.IInAppMessageWillDisplayEvent;
import com.onesignal.inAppMessages.IInAppMessageDidDisplayEvent;
import com.onesignal.inAppMessages.IInAppMessageWillDismissEvent;
import com.onesignal.inAppMessages.IInAppMessageDidDismissEvent;
import com.onesignal.notifications.INotification;
import com.onesignal.notifications.INotificationClickHandler;
import com.onesignal.notifications.INotificationClickResult;
import com.onesignal.notifications.INotificationReceivedEvent;
import com.onesignal.notifications.INotificationWillShowInForegroundHandler;
import com.onesignal.notifications.IPermissionChangedHandler;
import com.onesignal.user.subscriptions.IPushSubscription;
import com.onesignal.user.subscriptions.ISubscription;
import com.onesignal.user.subscriptions.ISubscriptionChangedHandler;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.HashMap;

public class RNOneSignal extends ReactContextBaseJavaModule implements
        ISubscriptionChangedHandler,
        IPermissionChangedHandler,
        LifecycleEventListener,
        INotificationWillShowInForegroundHandler{
    private ReactApplicationContext mReactApplicationContext;
    private ReactContext mReactContext;

    private boolean oneSignalInitDone;
    private boolean hasSetPermissionObserver = false;
    private boolean hasSetPushSubscriptionObserver = false;

    private HashMap<String, INotificationReceivedEvent> notificationReceivedEventCache;
    private boolean hasSetNotificationWillShowInForegroundHandler = false;
    private boolean hasAddedInAppMessageLifecycleListener = false;

    private void removeObservers() {
        this.removePermissionChangedHandler();
        this.rmeovePushSubscriptionChangeHandler();
    }

    private void removeHandlers() {
        OneSignal.getInAppMessages().setInAppMessageClickHandler(null);
        OneSignal.getInAppMessages().setInAppMessageLifecycleHandler(null);
        OneSignal.getNotifications().setNotificationClickHandler(null);
        OneSignal.getNotifications().setNotificationWillShowInForegroundHandler(null);
    }

    private void sendEvent(String eventName, Object params) {
        mReactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit(eventName, params);
    }

    private void initNotificationWillShowInForegroundHandlerParams() {
        this.hasSetNotificationWillShowInForegroundHandler = true;
    }

    public RNOneSignal(ReactApplicationContext reactContext) {
        super(reactContext);
        mReactApplicationContext = reactContext;
        mReactContext = reactContext;
        mReactContext.addLifecycleEventListener(this);
        notificationReceivedEventCache = new HashMap<String, INotificationReceivedEvent>();
    }


    /** Native Module Overrides */
    @Override
    public String getName() {
        return "OneSignal";
    }

    @Override
    public void onHostDestroy() {
        removeHandlers();
        removeObservers();
    }

    @Override
    public void onHostPause() {}

    @Override
    public void onHostResume() {}

    @Override
    public void onCatalystInstanceDestroy() {
        removeHandlers();
        removeObservers();
    }

    // OneSignal namespace methods
    @ReactMethod
    public void initialize(String appId) {
        Context context = mReactApplicationContext.getCurrentActivity();

        if (oneSignalInitDone) {
            Log.e("OneSignal", "Already initialized the OneSignal React-Native SDK");
            return;
        }

        oneSignalInitDone = true;

        if (context == null) {
            // in some cases, especially when react-native-navigation is installed,
            // the activity can be null, so we can initialize with the context instead
            context = mReactApplicationContext.getApplicationContext();
        }

        OneSignal.initWithContext(context, appId);
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
        OneSignal.getInAppMessages().addClickListener(new IInAppMessageClickListener() {
            @Override
            public void onClick(IInAppMessageClickEvent event) {
                try {
                    IInAppMessageClickResult result = event.getResult();
                    sendEvent("OneSignal-inAppMessageClicked", RNUtils.convertHashMapToWritableMap(RNUtils.convertInAppMessageClickResultToMap(result)));
                } catch (JSONException e) {
                    e.printStackTrace();
                }
            }
        });
    }

    @ReactMethod
    public void addInAppMessagesLifecycleListener() {
        if (!hasAddedInAppMessageLifecycleListener) {
            OneSignal.getInAppMessages().addLifecycleListener(new IInAppMessageLifecycleListener() {
                @Override
                public void onWillDisplay(IInAppMessageWillDisplayEvent event) {
                    try {
                        sendEvent("OneSignal-inAppMessageWillDisplay", RNUtils.convertHashMapToWritableMap(RNUtils.convertInAppMessageToMap(event.getMessage())));
                    } catch (JSONException e) {
                        e.printStackTrace();
                    }
                }

                @Override
                public void onDidDisplay(IInAppMessageDidDisplayEvent event) {
                    try {
                        sendEvent("OneSignal-inAppMessageDidDisplay", RNUtils.convertHashMapToWritableMap(RNUtils.convertInAppMessageToMap(event.getMessage())));
                    } catch (JSONException e) {
                        e.printStackTrace();
                    }
                }

                @Override
                public void onWillDismiss(IInAppMessageWillDismissEvent event) {
                    try {
                        sendEvent("OneSignal-inAppMessageWillDismiss", RNUtils.convertHashMapToWritableMap(RNUtils.convertInAppMessageToMap(event.getMessage())));
                    } catch (JSONException e) {
                        e.printStackTrace();
                    }
                }

                @Override
                public void onDidDismiss(IInAppMessageDidDismissEvent event) {
                    try {
                        sendEvent("OneSignal-inAppMessageDidDismiss", RNUtils.convertHashMapToWritableMap(RNUtils.convertInAppMessageToMap(event.getMessage())));
                    } catch (JSONException e) {
                        e.printStackTrace();
                    }
                }
            });
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
        OneSignal.getInAppMessages().addTriggers(RNUtils.convertReableMapIntoStringMap(triggers));
    }

    @ReactMethod
    public void removeTrigger(String key) {
        OneSignal.getInAppMessages().removeTrigger(key);
    }

    @ReactMethod
    public void removeTriggers(ReadableArray keys) {
        OneSignal.getInAppMessages().removeTriggers(RNUtils.convertReableArrayIntoStringCollection(keys));
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
    public void setNotificationClickHandler() {
        OneSignal.getNotifications().setNotificationClickHandler(new INotificationClickHandler() {
            @Override
            public void notificationClicked(INotificationClickResult result) {
                try {
                    sendEvent("OneSignal-notificationClicked", RNUtils.convertHashMapToWritableMap(RNUtils.convertNotificationClickResultToMap(result)));
                } catch (JSONException e) {
                    e.printStackTrace();
                }
            }
        });
    }

    @ReactMethod
    public void setNotificationWillShowInForegroundHandler() {
        if (this.hasSetNotificationWillShowInForegroundHandler) {
            return;
        }

        OneSignal.getNotifications().setNotificationWillShowInForegroundHandler(this);
        hasSetNotificationWillShowInForegroundHandler = true;
    }

    @Override
    public void notificationWillShowInForeground(INotificationReceivedEvent notificationReceivedEvent) {
        if (!this.hasSetNotificationWillShowInForegroundHandler) {
            notificationReceivedEvent.complete(notificationReceivedEvent.getNotification());
            return;
        }

        INotification notification = notificationReceivedEvent.getNotification();
        String notificationId = notification.getNotificationId();
        notificationReceivedEventCache.put(notificationId, notificationReceivedEvent);

        try {
            sendEvent("OneSignal-notificationWillShowInForeground",
                    RNUtils.convertHashMapToWritableMap(
                            RNUtils.convertNotificationToMap(notification)));

            try {
                synchronized (notificationReceivedEvent) {
                    while (notificationReceivedEventCache.containsKey(notificationId)) {
                        notificationReceivedEvent.wait();
                    }
                }
            } catch(InterruptedException e){
                Log.e("InterruptedException" + e.toString(), null);
            }
        } catch (JSONException e) {
            e.printStackTrace();
        }
    }

    @ReactMethod
    public void completeNotificationEvent(final String uuid, final boolean shouldDisplay) {
        INotificationReceivedEvent receivedEvent = notificationReceivedEventCache.get(uuid);

        if (receivedEvent == null) {
            Log.e("OneSignal", "(java): could not find cached notification received event with id "+uuid);
            return;
        }

        if (shouldDisplay) {
            receivedEvent.complete(receivedEvent.getNotification());
        } else {
            receivedEvent.complete(null);
        }

        notificationReceivedEventCache.remove(uuid);
    }

    @ReactMethod
    public void addPermissionChangedHandler() {
        if (!hasSetPermissionObserver) {
            OneSignal.getNotifications().addPermissionChangedHandler(this);
            hasSetPermissionObserver = true;
        }
    }

    @ReactMethod
    public void removePermissionChangedHandler() {
        if (hasSetPermissionObserver) {
            OneSignal.getNotifications().removePermissionChangedHandler(this);
            hasSetPermissionObserver = false;
        }
    }

    @Override
    public void onPermissionChanged(boolean permission) {
        try {
            sendEvent("OneSignal-permissionChanged", RNUtils.convertHashMapToWritableMap(RNUtils.convertPermissionToMap(permission)));
            Log.i("OneSignal", "sending permission change event");
        } catch (JSONException e) {
            e.printStackTrace();
        }
    }

    @ReactMethod
    public void requestNotificationPermission(final boolean fallbackToSettings, Promise promise) {
        OneSignal.getNotifications().requestPermission(fallbackToSettings, Continue.with(result -> {
            promise.resolve(result.isSuccess());
        }));
    }

    @ReactMethod
    public void hasNotificationPermission(Promise promise) {
        promise.resolve(OneSignal.getNotifications().getPermission());
    }

    @ReactMethod
    public void canRequestNotificationPermission(Promise promise) {
        promise.resolve(true);
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


    // OneSignal.User.PushSubscription namespace methods
    @ReactMethod
    public void getPushSubscriptionId(Promise promise) {
        IPushSubscription pushSubscription = OneSignal.getUser().getPushSubscription();
        promise.resolve(pushSubscription.getId());
    }

    @ReactMethod
    public void getPushSubscriptionToken(Promise promise) {
        IPushSubscription pushSubscription = OneSignal.getUser().getPushSubscription();
        promise.resolve(pushSubscription.getToken());
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
    public void addPushSubscriptionChangeHandler() {
        if (!hasSetPushSubscriptionObserver) {
            OneSignal.getUser().getPushSubscription().addChangeHandler(this);
            hasSetPushSubscriptionObserver = true;
        }
    }

    @ReactMethod
    public void rmeovePushSubscriptionChangeHandler() {
        if (hasSetPushSubscriptionObserver) {
            OneSignal.getUser().getPushSubscription().removeChangeHandler(this);
            hasSetPushSubscriptionObserver = false;
        }
    }

    @Override
    public void onSubscriptionChanged(ISubscription subscription) {
        if (!(subscription instanceof IPushSubscription)) {
            return;
        }

        try {
            sendEvent("OneSignal-subscriptionChanged",
                    RNUtils.convertHashMapToWritableMap(
                            RNUtils.convertOnSubscriptionChangedToMap((IPushSubscription) subscription)));
            Log.i("OneSignal", "sending subscription change event");
        } catch (JSONException e) {
            e.printStackTrace();
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
        OneSignal.getUser().addTags(RNUtils.convertReableMapIntoStringMap(tags));
    }

    @ReactMethod
    public void removeTags(ReadableArray tagKeys) {
        OneSignal.getUser().removeTags(RNUtils.convertReableArrayIntoStringCollection(tagKeys));
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
        OneSignal.getUser().addAliases(RNUtils.convertReableMapIntoStringMap(aliases));
    }

    @ReactMethod
    public void removeAliases(ReadableArray aliasLabels) {
        OneSignal.getUser().removeAliases(RNUtils.convertReableArrayIntoStringCollection(aliasLabels));
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
