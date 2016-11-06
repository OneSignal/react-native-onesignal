package com.geektime.rnonesignalandroid;

import android.app.Activity;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.os.Bundle;
import android.util.Log;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.LifecycleEventListener;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.onesignal.OneSignal;

import org.json.JSONObject;
import org.json.JSONException;


/**
 * Created by Avishay on 1/31/16.
 */
public class RNOneSignal extends ReactContextBaseJavaModule implements LifecycleEventListener {
    public static final String NOTIFICATION_OPENED_INTENT_FILTER = "GTNotificationOpened";
    public static final String NOTIFICATION_RECEIVED_INTENT_FILTER = "GTNotificationReceived";

    private ReactContext mReactContext;
    private boolean oneSignalInitDone;

    public RNOneSignal(ReactApplicationContext reactContext) {
        super(reactContext);
        mReactContext = reactContext;
        mReactContext.addLifecycleEventListener(this);
        initOneSignal();
    }

    // Initialize OneSignal only once when an Activity is available.
    // React creates an instance of this class to late for OneSignal to get the current Activity
    // based on registerActivityLifecycleCallbacks it uses to listen for the first Activity.
    // However it seems it is also to soon to call getCurrentActivity() from the reactContext as well.
    // This will normally succeed when onHostResume fires instead.
    private void initOneSignal() {
        Activity activity = getCurrentActivity();
        if (activity == null || oneSignalInitDone)
            return;

        // Uncomment to debug init issues.
        // OneSignal.setLogLevel(OneSignal.LOG_LEVEL.VERBOSE, OneSignal.LOG_LEVEL.ERROR);

        oneSignalInitDone = true;

        registerNotificationsOpenedNotification();
        registerNotificationsReceivedNotification();

        OneSignal.sdkType = "react";
        OneSignal.startInit(activity)
                .setNotificationOpenedHandler(new NotificationOpenedHandler(mReactContext))
                .setNotificationReceivedHandler(new NotificationReceivedHandler(mReactContext))
                .init();
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
    public void configure() {
        OneSignal.idsAvailable(new OneSignal.IdsAvailableHandler() {
            public void idsAvailable(String userId, String registrationId) {
                final WritableMap params = Arguments.createMap();

                params.putString("userId", userId);
                params.putString("pushToken", registrationId);

                sendEvent("idsAvailable", params);
            }
        });
    }

    @ReactMethod
    public void inFocusDisplaying(int displayOption) {
        OneSignal.setInFocusDisplaying(displayOption);
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
    public void setSubscription(Boolean enable) {
        OneSignal.setSubscription(enable);
    }

    @ReactMethod
    public void promptLocation() {
        OneSignal.promptLocation();
    }

    @ReactMethod
    public void syncHashedEmail(String email) {
        OneSignal.syncHashedEmail(email);
    }

    @ReactMethod
    public void setlogLevel(int logLevel, int visualLogLevel) {
        OneSignal.setLogLevel(logLevel, visualLogLevel);
    }

    @ReactMethod
    public void postNotification(String contents, String data, String player_id) {
        try {
          OneSignal.postNotification(new JSONObject("{'contents': " + contents + ", 'data': {'p2p_notification': " + data +"}, 'include_player_ids': ['" + player_id + "']}"),
             new OneSignal.PostNotificationResponseHandler() {
               @Override
               public void onSuccess(JSONObject response) {
                 Log.i("OneSignal", "postNotification Success: " + response.toString());
               }

               @Override
               public void onFailure(JSONObject response) {
                 Log.e("OneSignal", "postNotification Failure: " + response.toString());
               }
             });
        } catch (JSONException e) {
          e.printStackTrace();
        }
    }

    @ReactMethod
    public void clearOneSignalNotifications() {
        OneSignal.clearOneSignalNotifications();
    }

    @ReactMethod
    public void cancelNotification(int id) {
        OneSignal.cancelNotification(id);
    }

    private void registerNotificationsReceivedNotification() {
        IntentFilter intentFilter = new IntentFilter(NOTIFICATION_RECEIVED_INTENT_FILTER);
        mReactContext.registerReceiver(new BroadcastReceiver() {
            @Override
            public void onReceive(Context context, Intent intent) {
                notifyNotificationReceived(intent.getExtras());
            }
        }, intentFilter);
    }

    private void registerNotificationsOpenedNotification() {
        IntentFilter intentFilter = new IntentFilter(NOTIFICATION_OPENED_INTENT_FILTER);
        mReactContext.registerReceiver(new BroadcastReceiver() {
            @Override
            public void onReceive(Context context, Intent intent) {
                notifyNotificationOpened(intent.getExtras());
            }
        }, intentFilter);
    }

    private void notifyNotificationReceived(Bundle bundle) {
        try {
            JSONObject jsonObject = new JSONObject(bundle.getString("notification"));
            sendEvent("remoteNotificationReceived", RNUtils.jsonToWritableMap(jsonObject));
        } catch(Throwable t) {
            t.printStackTrace();
        }
    }

    private void notifyNotificationOpened(Bundle bundle) {
        try {
            JSONObject jsonObject = new JSONObject(bundle.getString("result"));
            sendEvent("remoteNotificationOpened",  RNUtils.jsonToWritableMap(jsonObject));
        } catch(Throwable t) {
            t.printStackTrace();
        }
    }

    @Override
    public String getName() {
        return "OneSignal";
    }

    @Override
    public void onHostDestroy() {

    }

    @Override
    public void onHostPause() {

    }

    @Override
    public void onHostResume() {
        initOneSignal();
    }

}
