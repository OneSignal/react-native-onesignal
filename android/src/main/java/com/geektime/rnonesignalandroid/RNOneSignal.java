package com.geektime.rnonesignalandroid;

import java.util.Iterator;

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
import com.onesignal.OSPermissionState;
import com.onesignal.OSPermissionSubscriptionState;
import com.onesignal.OSSubscriptionState;
import com.onesignal.OSEmailSubscriptionState;
import com.onesignal.OneSignal;
import com.onesignal.OneSignal.EmailUpdateHandler;
import com.onesignal.OneSignal.EmailUpdateError;

import org.json.JSONObject;
import org.json.JSONException;


/**
* Created by Avishay on 1/31/16.
*/
public class RNOneSignal extends ReactContextBaseJavaModule implements LifecycleEventListener {
   public static final String NOTIFICATION_OPENED_INTENT_FILTER = "GTNotificationOpened";
   public static final String NOTIFICATION_RECEIVED_INTENT_FILTER = "GTNotificationReceived";
   public static final String HIDDEN_MESSAGE_KEY = "hidden";

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
   public void setUnauthenticatedEmail(String email, final Callback callback) {
      OneSignal.setEmail(email, null, new OneSignal.EmailUpdateHandler() {
         @Override
         public void onSuccess() {
               callback.invoke();
         }

         @Override
         public void onFailure(EmailUpdateError error) {
               try {
                  JSONObject errorObject = new JSONObject("{'error' : '" + error.getMessage() + "'}");
                  callback.invoke(RNUtils.jsonToWritableMap(errorObject));
               } catch (JSONException exception) {
                  exception.printStackTrace();
               }
         }
      });
   }

   @ReactMethod 
   public void setEmail(String email, String emailAuthToken, final Callback callback) {
      OneSignal.setEmail(email, emailAuthToken, new EmailUpdateHandler() {
         @Override
         public void onSuccess() {
               callback.invoke();
         }

         @Override
         public void onFailure(EmailUpdateError error) {
               try {
                  JSONObject errorObject = new JSONObject("{'error' : '" + error.getMessage() + "'}");
                  callback.invoke(RNUtils.jsonToWritableMap(errorObject));
               } catch (JSONException exception) {
                  exception.printStackTrace();
               }
         }
      });
   }

   @ReactMethod
   public void logoutEmail(final Callback callback) {
      OneSignal.logoutEmail(new EmailUpdateHandler() {
         @Override
         public void onSuccess() {
               callback.invoke();
         }

         @Override
         public void onFailure(EmailUpdateError error) {
               try {
                  JSONObject errorObject = new JSONObject("{'error' : '" + error.getMessage() + "'}");
                  callback.invoke(RNUtils.jsonToWritableMap(errorObject));
               } catch (JSONException exception) {
                  exception.printStackTrace();
               }
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

               sendEvent("OneSignal-idsAvailable", params);
         }
      });
   }

   @ReactMethod
   public void getPermissionSubscriptionState(final Callback callback) {
      OSPermissionSubscriptionState state = OneSignal.getPermissionSubscriptionState();
      OSPermissionState permissionState = state.getPermissionStatus();
      OSSubscriptionState subscriptionState = state.getSubscriptionStatus();
      OSEmailSubscriptionState emailSubscriptionState = state.getEmailSubscriptionStatus();

      // Notifications enabled for app? (Android Settings)
      boolean notificationsEnabled = permissionState.getEnabled();

      // User subscribed to OneSignal? (automatically toggles with notificationsEnabled)
      boolean subscriptionEnabled = subscriptionState.getSubscribed();

      // User's original subscription preference (regardless of notificationsEnabled)
      boolean userSubscriptionEnabled = subscriptionState.getUserSubscriptionSetting();

      try {
         JSONObject result = new JSONObject("{" +
               "'notificationsEnabled': " + String.valueOf(notificationsEnabled) + "," +
               "'subscriptionEnabled': " + String.valueOf(subscriptionEnabled) + "," +
               "'userSubscriptionEnabled': " + String.valueOf(userSubscriptionEnabled) + "," +
               "'pushToken': " + subscriptionState.getPushToken() + "," +
               "'userId': " + subscriptionState.getUserId() + "," +
               "'emailUserId' : " + emailSubscriptionState.getEmailUserId() + "," +
               "'emailAddress' : " + emailSubscriptionState.getEmailAddress() +
         "}");

         Log.d("onesignal", "permission subscription state: " + result.toString());

         callback.invoke(RNUtils.jsonToWritableMap(result));
      } catch (JSONException e) {
         e.printStackTrace();
      }
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
   public void setLogLevel(int logLevel, int visualLogLevel) {
      OneSignal.setLogLevel(logLevel, visualLogLevel);
   }

   @ReactMethod
   public void setLocationShared(Boolean shared) {
      OneSignal.setLocationShared(shared);
   }

   @ReactMethod
   public void postNotification(String contents, String data, String playerId, String otherParameters) {
      try {
         JSONObject postNotification = new JSONObject("{'contents': " + contents + ", 'data': {'p2p_notification': " + data + "}, 'include_player_ids': ['" + playerId + "']}");
         if (otherParameters != null && !otherParameters.trim().isEmpty()) {
               JSONObject parametersJson = new JSONObject(otherParameters.trim());
               Iterator<String> keys = parametersJson.keys();
               while (keys.hasNext()) {
                  String key = keys.next();
                  postNotification.put(key, parametersJson.get(key));
               }

               if (parametersJson.has(HIDDEN_MESSAGE_KEY) && parametersJson.getBoolean(HIDDEN_MESSAGE_KEY)) {
                  postNotification.getJSONObject("data").put(HIDDEN_MESSAGE_KEY, true);
               }
         }

         OneSignal.postNotification(
               postNotification,
               new OneSignal.PostNotificationResponseHandler() {
                  @Override
                  public void onSuccess(JSONObject response) {
                     Log.i("OneSignal", "postNotification Success: " + response.toString());
                  }

                  @Override
                  public void onFailure(JSONObject response) {
                     Log.e("OneSignal", "postNotification Failure: " + response.toString());
                  }
               }
         );
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
         sendEvent("OneSignal-remoteNotificationReceived", RNUtils.jsonToWritableMap(jsonObject));
      } catch(Throwable t) {
         t.printStackTrace();
      }
   }

   private void notifyNotificationOpened(Bundle bundle) {
      try {
         JSONObject jsonObject = new JSONObject(bundle.getString("result"));
         sendEvent("OneSignal-remoteNotificationOpened",  RNUtils.jsonToWritableMap(jsonObject));
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
