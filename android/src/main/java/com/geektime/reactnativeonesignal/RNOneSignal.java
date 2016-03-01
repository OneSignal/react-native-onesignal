package com.geektime.reactnativeonesignal;

import android.app.Activity;
import android.app.Application;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.os.Bundle;
import android.util.Log;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.onesignal.OneSignal;

import org.json.JSONObject;


/**
 * Created by Avishay on 1/31/16.
 */
public class RNOneSignal extends ReactContextBaseJavaModule implements Application.ActivityLifecycleCallbacks {
    public static final String NOTIFICATION_OPENED_INTENT_FILTER = "GTNotificatinOpened";

    private ReactContext mReactContext;
    private Activity mActivity;

    public RNOneSignal(ReactApplicationContext reactContext, Activity activity) {
        super(reactContext);
        mActivity = activity;
        mReactContext = reactContext;

        OneSignal.startInit(mActivity)
                .setNotificationOpenedHandler(new NotificationOpenedHandler(reactContext))
                .init();
        OneSignal.enableNotificationsWhenActive(true);

        activity.getApplication().registerActivityLifecycleCallbacks(this);

        registerNotificationsReceiveNotification();
    }

    public RNOneSignal(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    private void sendEvent(String eventName, Object params) {
        mReactContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit(eventName, params);
    }

    @ReactMethod
    public void sendTag(String key, String value) {
        OneSignal.sendTag(key, value);
    }

    @ReactMethod
    public void sendTags(ReadableMap tags) {
        OneSignal.sendTags(RNUtils.readableMapToJson(tags));
    }

    @ReactMethod
    public void getTags(final Callback callback) {
        OneSignal.getTags(new OneSignal.GetTagsHandler() {
            @Override
            public void tagsAvailable(JSONObject tags) {
                callback.invoke(RNUtils.jsonToWritableMap(tags));
            }
        });
    }

    @ReactMethod
    public void idsAvailable(final Callback callback) {
        OneSignal.idsAvailable(new OneSignal.IdsAvailableHandler() {
            public void idsAvailable(String userId, String registrationId) {
                if (registrationId != null) {
                    Log.d("debug", "User:" + userId);
                    Log.d("debug", "registrationId:" + registrationId);

                    final WritableMap value = Arguments.createMap();
                    value.putString("userId", userId);
                    value.putString("pushToken", registrationId);
                    
                    callback.invoke(value);
                } else {
                    Log.d("debug", "Cannot Fetch Push Token");
                }
            }
        });
    }
    
    @ReactMethod
    public void deleteTag(String key) {
        OneSignal.deleteTag(key);
    }

    @ReactMethod
    public void enableVibrate(Boolean enable) {
        OneSignal.enableVibrate(enable);
    }

    @ReactMethod
    public void enableSound(Boolean enable) {
        OneSignal.enableSound(enable);
    }

    @ReactMethod
    public void enableNotificationsWhenActive(Boolean enable) {
        OneSignal.enableNotificationsWhenActive(enable);
    }

    @ReactMethod
    public void enableInAppAlertNotification(Boolean enable) {
        OneSignal.enableInAppAlertNotification(enable);
    }

    @ReactMethod
    public void setSubscription(Boolean enable) {
        OneSignal.setSubscription(enable);
    }

    private void registerNotificationsReceiveNotification() {
        IntentFilter intentFilter = new IntentFilter(NOTIFICATION_OPENED_INTENT_FILTER);

        mReactContext.registerReceiver(new BroadcastReceiver() {
            @Override
            public void onReceive(Context context, Intent intent) {
                notifyNotification(intent.getExtras());
            }
        }, intentFilter);
    }

    private void notifyNotification(Bundle bundle) {
        final WritableMap params = Arguments.createMap();
        params.putString("message", bundle.getString("message"));
        params.putString("additionalData", bundle.getString("additionalData"));
        params.putBoolean("isActive", bundle.getBoolean("isActive"));

        sendEvent("remoteNotificationOpened", params);
    }

    @Override
    public String getName() {
        return "RNOneSignal";
    }

    @Override
    public void onActivityCreated(Activity activity, Bundle savedInstanceState) {

    }

    @Override
    public void onActivityStarted(Activity activity) {

    }

    @Override
    public void onActivityResumed(Activity activity) {

    }

    @Override
    public void onActivityPaused(Activity activity) {

    }

    @Override
    public void onActivityStopped(Activity activity) {

    }

    @Override
    public void onActivitySaveInstanceState(Activity activity, Bundle outState) {

    }

    @Override
    public void onActivityDestroyed(Activity activity) {
        if (activity.equals(mActivity)) {
            OneSignal.removeNotificationOpenedHandler();
        }
    }
}
