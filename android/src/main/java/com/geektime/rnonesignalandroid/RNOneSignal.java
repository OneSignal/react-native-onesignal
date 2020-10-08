/*
Modified MIT License

Copyright 2020 OneSignal

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
*/

package com.geektime.rnonesignalandroid;

import java.util.Iterator;
import java.util.HashMap;

import android.content.Context;
import android.os.Bundle;
import android.util.Log;
import android.content.pm.ApplicationInfo;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.WritableNativeMap;
import com.facebook.react.bridge.LifecycleEventListener;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.modules.core.DeviceEventManagerModule;

import com.onesignal.OSEmailSubscriptionStateChanges;
import com.onesignal.OneSignal;
import com.onesignal.OutcomeEvent;
import com.onesignal.OSDeviceState;
import com.onesignal.OSPermissionState;
import com.onesignal.OSInAppMessageAction;
import com.onesignal.OSNotification;
import com.onesignal.OSNotificationReceivedEvent;
import com.onesignal.OSNotificationOpenedResult;
import com.onesignal.OneSignal.OutcomeCallback;
import com.onesignal.OneSignal.EmailUpdateError;
import com.onesignal.OSNotificationGenerationJob;

import com.onesignal.OSSubscriptionState;
import com.onesignal.OSEmailSubscriptionState;
import com.onesignal.OSPermissionSubscriptionState;

import com.onesignal.OneSignal.EmailUpdateHandler;
import com.onesignal.OneSignal.OSInAppMessageClickHandler;
import com.onesignal.OneSignal.OSNotificationOpenedHandler;
import com.onesignal.OneSignal.OSExternalUserIdUpdateCompletionHandler;
import com.onesignal.OneSignal.OutcomeCallback;
import com.onesignal.OneSignal.OSInAppMessageClickHandler;
import com.onesignal.OutcomeEvent;
import com.onesignal.OSDeviceState;

import com.onesignal.OSPermissionObserver;
import com.onesignal.OSSubscriptionObserver;
import com.onesignal.OSEmailSubscriptionObserver;

import com.onesignal.OSPermissionStateChanges;
import com.onesignal.OSSubscriptionStateChanges;
import com.onesignal.OSEmailSubscriptionObserver;

import org.json.JSONObject;
import org.json.JSONArray;
import org.json.JSONException;

public class RNOneSignal extends ReactContextBaseJavaModule
        implements
        OSPermissionObserver,
        OSSubscriptionObserver,
        OSNotificationOpenedHandler,
        OSEmailSubscriptionObserver,
        LifecycleEventListener,
        OSInAppMessageClickHandler
{

   public static final String HIDDEN_MESSAGE_KEY = "hidden";

   private ReactApplicationContext mReactApplicationContext;
   private ReactContext mReactContext;

   private boolean oneSignalInitDone;
   private boolean registeredEvents = false;

   private OSInAppMessageAction inAppMessageActionResult;

   private HashMap<String, OSNotificationReceivedEvent> notificationReceivedEventCache;

   private boolean hasSetNotificationOpenedHandler = false;
   private boolean hasSetInAppClickedHandler = false;
   private boolean hasSetRequiresPrivacyConsent = false;
   private boolean waitingForUserPrivacyConsent = false;

   // A native module is supposed to invoke its callback only once. It can, however, store the callback and invoke it later.
   // It is very important to highlight that the callback is not invoked immediately after the native function completes
   // - remember that bridge communication is asynchronous, and this too is tied to the run loop.
   // Once you have done invoke() on the callback, you cannot use it again. Store it here.
   private Callback pendingGetTagsCallback;
   private Callback inAppMessageClickedCallback;

   private String appIdFromManifest(ReactApplicationContext context) {
      try {
         ApplicationInfo ai = context.getPackageManager().getApplicationInfo(context.getPackageName(), context.getPackageManager().GET_META_DATA);
         Bundle bundle = ai.metaData;
         return bundle.getString("onesignal_app_id");
      } catch (Throwable t) {
         t.printStackTrace();
         return null;
      }
   }

   private void sendEvent(String eventName, Object params) {
      mReactContext
              .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
              .emit(eventName, params);
   }

   private JSONObject jsonFromErrorMessageString(String errorMessage) throws JSONException {
      return new JSONObject().put("error", errorMessage);
   }

   public RNOneSignal(ReactApplicationContext reactContext) {
      super(reactContext);
      mReactApplicationContext = reactContext;
      mReactContext = reactContext;
      mReactContext.addLifecycleEventListener(this);
      notificationReceivedEventCache = new HashMap<String, OSNotificationReceivedEvent>();
   }

   // Initialize OneSignal only once when an Activity is available.
   // React creates an instance of this class to late for OneSignal to get the current Activity
   // based on registerActivityLifecycleCallbacks it uses to listen for the first Activity.
   // However it seems it is also to soon to call getCurrentActivity() from the reactContext as well.
   // This will normally succeed when onHostResume fires instead.
   private void initOneSignal() {
      OneSignal.sdkType = "react";
      Context context = mReactApplicationContext.getCurrentActivity();

      if (oneSignalInitDone) {
         Log.e("onesignal", "Already initialized the OneSignal React-Native SDK");
         return;
      }

      oneSignalInitDone = true;


      if (context == null) {
         // in some cases, especially when react-native-navigation is installed,
         // the activity can be null, so we can initialize with the context instead
         context = mReactApplicationContext.getApplicationContext();
      }

      OneSignal.setInAppMessageClickHandler(this);
      OneSignal.initWithContext(context);

      if (this.hasSetRequiresPrivacyConsent)
         this.waitingForUserPrivacyConsent = true;
   }

   @ReactMethod
   public void setAppId(String appId) {
      OneSignal.setAppId(appId);
   }

   /* Observers */
   @Override
   public void onOSPermissionChanged(OSPermissionStateChanges stateChanges) {
      Log.e("Onesignal", "sending permission change event");
      sendEvent("OneSignal-permissionChanged", RNUtils.jsonToWritableMap(stateChanges.toJSONObject()));
   }

   @Override
   public void onOSSubscriptionChanged(OSSubscriptionStateChanges stateChanges) {
      Log.e("Onesignal", "sending subscription change event");
      sendEvent("OneSignal-subscriptionChanged", RNUtils.jsonToWritableMap(stateChanges.toJSONObject()));
   }

   @Override
   public void onOSEmailSubscriptionChanged(OSEmailSubscriptionStateChanges stateChanges) {
      Log.e("Onesignal", "sending email subscription change event");
      sendEvent("OneSignal-emailSubscriptionChanged", RNUtils.jsonToWritableMap(stateChanges.toJSONObject()));
   }

   @ReactMethod
   public void addPermissionObserver() {
      OneSignal.addPermissionObserver(this);
   }

   @ReactMethod
   public void addSubscriptionObserver() {
      OneSignal.addSubscriptionObserver(this);
   }

   @ReactMethod
   public void addEmailSubscriptionObserver() {
      OneSignal.addEmailSubscriptionObserver(this);
   }

   /* Other methods */

   @ReactMethod
   public void getDeviceState(Promise promise) {
      OSDeviceState state = OneSignal.getDeviceState();
      promise.resolve(RNUtils.jsonToWritableMap(state.toJSONObject()));
   }

   @ReactMethod
   public void disablePush(boolean disable) {
      OneSignal.disablePush(disable);
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
   public void deleteTags(ReadableArray tagKeys) {
      OneSignal.deleteTags(RNUtils.convertReableArrayIntoStringCollection(tagKeys));
   }

   @ReactMethod
   public void getTags(final Callback callback) {
      if (pendingGetTagsCallback == null)
         pendingGetTagsCallback = callback;

      OneSignal.getTags(new OneSignal.OSGetTagsHandler() {
         @Override
         public void tagsAvailable(JSONObject tags) {
            if (pendingGetTagsCallback != null)
               pendingGetTagsCallback.invoke(RNUtils.jsonToWritableMap(tags));

            pendingGetTagsCallback = null;
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
               callback.invoke(RNUtils.jsonToWritableMap(jsonFromErrorMessageString(error.getMessage())));
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
               callback.invoke(RNUtils.jsonToWritableMap(jsonFromErrorMessageString(error.getMessage())));
            } catch (JSONException exception) {
               exception.printStackTrace();
            }
         }
      });
   }

   @ReactMethod
   public void promptLocation() {
      OneSignal.promptLocation();
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
         JSONObject postNotification = new JSONObject();
         postNotification.put("contents", new JSONObject(contents));

         if (playerId != null) {
            JSONArray playerIds = new JSONArray(playerId);
            postNotification.put("include_player_ids", playerIds);
         }

         if (data != null) {
            JSONObject additionalData = new JSONObject();
            additionalData.put("p2p_notification", new JSONObject(data));
            postNotification.put("data", additionalData);
         }

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

   @ReactMethod
   public void setRequiresUserPrivacyConsent(Boolean required) {
      OneSignal.setRequiresUserPrivacyConsent(required);
   }

   @ReactMethod
   public void provideUserConsent(Boolean granted) {
      OneSignal.provideUserConsent(granted);
   }

   @ReactMethod
   public void userProvidedPrivacyConsent(Promise promise) {
      promise.resolve(OneSignal.userProvidedPrivacyConsent());
   }

   @ReactMethod
   public void setExternalUserId(final String externalId, final Callback callback) {
      OneSignal.setExternalUserId(externalId, new OneSignal.OSExternalUserIdUpdateCompletionHandler() {
         @Override
         public void onComplete(JSONObject results) {
            Log.i("OneSignal", "Completed setting external user id: " + externalId + "with results: " + results.toString());
            if (callback != null)
               callback.invoke(RNUtils.jsonToWritableMap(results));
         }
      });
   }

   @ReactMethod
   public void removeExternalUserId(final Callback callback) {
      OneSignal.removeExternalUserId(new OneSignal.OSExternalUserIdUpdateCompletionHandler() {
         @Override
         public void onComplete(JSONObject results) {
            Log.i("OneSignal", "Completed removing external user id with results: " + results.toString());
            if (callback != null)
               callback.invoke(RNUtils.jsonToWritableMap(results));
         }
      });
   }

   /* notification opened / received */

   @ReactMethod
   public void setNotificationOpenedHandler() {
      OneSignal.setNotificationOpenedHandler(this);
   }

   @Override
   public void notificationOpened(OSNotificationOpenedResult result) {
      sendEvent("OneSignal-remoteNotificationOpened", RNUtils.jsonToWritableMap(result.toJSONObject()));
   }

   @ReactMethod
   public void setNotificationWillShowInForegroundHandler() {
      OneSignal.setNotificationWillShowInForegroundHandler(new OneSignal.OSNotificationWillShowInForegroundHandler() {
         @Override
         public void notificationWillShowInForeground(OSNotificationReceivedEvent notificationReceivedEvent) {
            OSNotification notification = notificationReceivedEvent.getNotification();
            String notificationJobId = notification.getNotificationId();
            notificationReceivedEventCache.put(notificationJobId, notificationReceivedEvent);

            sendEvent("OneSignal-notificationWillShowInForeground", RNUtils.jsonToWritableMap(notificationReceivedEvent.toJSONObject()));
         }
      });
   }

   @ReactMethod
   public void completeNotificationJob(String uuid) {
      OSNotificationReceivedEvent receivedEvent = notificationReceivedEventCache.get(uuid);
      OSNotification notification = receivedEvent.getNotification();
      receivedEvent.complete(notification);
      notificationReceivedEventCache.remove(uuid);
   }

   /**
    * In-App Messaging
    */

   /* triggers */

   @ReactMethod
   public void addTrigger(String key, Object object) {
      OneSignal.addTrigger(key, object);
   }

   @ReactMethod
   public void addTriggers(ReadableMap triggers) {
      OneSignal.addTriggers(triggers.toHashMap());
   }

   @ReactMethod
   public void removeTriggerForKey(String key) {
      OneSignal.removeTriggerForKey(key);
   }

   @ReactMethod
   public void removeTriggersForKeys(ReadableArray keys) {
      OneSignal.removeTriggersForKeys(RNUtils.convertReableArrayIntoStringCollection(keys));
   }

   @ReactMethod
   public void getTriggerValueForKey(String key, Promise promise) {
      promise.resolve(OneSignal.getTriggerValueForKey(key));
   }

   /* in app message click */

   @ReactMethod
   public void setInAppMessageClickHandler() {
      OneSignal.setInAppMessageClickHandler(new OneSignal.OSInAppMessageClickHandler() {
         @Override
         public void inAppMessageClicked(OSInAppMessageAction result) {
            if (!hasSetInAppClickedHandler) {
               inAppMessageActionResult = result;
               return;
            }
            sendEvent("OneSignal-inAppMessageClicked", RNUtils.jsonToWritableMap(result.toJSONObject()));
         }
      });
   }

   @ReactMethod
   public void initInAppMessageClickHandlerParams() {
      this.hasSetInAppClickedHandler = true;
      if (this.inAppMessageActionResult != null) {
         this.inAppMessageClicked(this.inAppMessageActionResult);
         this.inAppMessageActionResult = null;
      }
   }

   @Override
   public void inAppMessageClicked(OSInAppMessageAction result) {
      if (!this.hasSetInAppClickedHandler) {
         this.inAppMessageActionResult = result;
         return;
      }
      this.sendEvent("OneSignal-inAppMessageClicked", RNUtils.jsonToWritableMap(result.toJSONObject()));
   }

   /* other IAM functions */

   @ReactMethod
   public void pauseInAppMessages(Boolean pause) {
      OneSignal.pauseInAppMessages(pause);
   }

   /**
    * Outcomes
    */

   @ReactMethod
   public void sendOutcome(final String name, final Callback callback) {
      OneSignal.sendOutcome(name, new OutcomeCallback() {
         @Override
         public void onSuccess(OutcomeEvent outcomeEvent) {
            if (outcomeEvent == null)
               callback.invoke(new WritableNativeMap());
            else {
               try {
                  callback.invoke(RNUtils.jsonToWritableMap(outcomeEvent.toJSONObject()));
               } catch (JSONException e) {
                  Log.e("OneSignal", "sendOutcome with name: " + name + ", failed with message: " + e.getMessage());
               }
            }
         }
      });
   }

   @ReactMethod
   public void sendUniqueOutcome(final String name, final Callback callback) {
      OneSignal.sendUniqueOutcome(name, new OutcomeCallback() {
         @Override
         public void onSuccess(OutcomeEvent outcomeEvent) {
            if (outcomeEvent == null)
               callback.invoke(new WritableNativeMap());
            else {
               try {
                  callback.invoke(RNUtils.jsonToWritableMap(outcomeEvent.toJSONObject()));
               } catch (JSONException e) {
                  Log.e("OneSignal", "sendUniqueOutcome with name: " + name + ", failed with message: " + e.getMessage());
               }
            }
         }
      });
   }

   @ReactMethod
   public void sendOutcomeWithValue(final String name, final float value, final Callback callback) {
      OneSignal.sendOutcomeWithValue(name, value, new OutcomeCallback() {
         @Override
         public void onSuccess(OutcomeEvent outcomeEvent) {
            if (outcomeEvent == null)
               callback.invoke(new WritableNativeMap());
            else {
               try {
                  callback.invoke(RNUtils.jsonToWritableMap(outcomeEvent.toJSONObject()));
               } catch (JSONException e) {
                  Log.e("OneSignal", "sendOutcomeWithValue with name: " + name + " and value: " + value + ", failed with message: " + e.getMessage());
               }
            }
         }
      });
   }

   /**
    * Native Module Overrides
    */

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
