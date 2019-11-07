package com.geektime.rnonesignalandroid;

import android.app.NotificationManager;
import android.content.Context;
import android.os.Build;
import android.os.Bundle;
import android.service.notification.StatusBarNotification;
import android.util.Log;

import com.onesignal.NotificationExtenderService;
import com.onesignal.OSNotificationReceivedResult;
import com.onesignal.OneSignal;
import com.onesignal.OneSignalDbHelper;
import com.onesignal.OneSignalNotificationManager;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

/**
 * Created by Andrey Beletsky on 6/5/17.
 */
public class NotificationNotDisplayingExtender extends NotificationExtenderService {

    public static final String CANCELS_NOTIFICATION = "cancelsNotification";

    @Override
    protected boolean onNotificationProcessing(OSNotificationReceivedResult receivedResult) {
        cleanNotificationIfNeeded(receivedResult);
        return shouldHideNotification(receivedResult);
    }

    // Return true if the message should be hidden.
    private boolean shouldHideNotification(OSNotificationReceivedResult receivedResult) {
        JSONObject additionalData = receivedResult.payload.additionalData;
        boolean hidden = false;
        try {
            if (additionalData.has(RNOneSignal.HIDDEN_MESSAGE_KEY)) {
                hidden = additionalData.getBoolean(RNOneSignal.HIDDEN_MESSAGE_KEY);
            }
            if (!hidden && additionalData.has(CANCELS_NOTIFICATION)) {
                hidden = additionalData.getBoolean(CANCELS_NOTIFICATION);
            }
        } catch (JSONException e) {
            Log.e("OneSignal", "onNotificationProcessing Failure: " + e.getMessage());
        }
        return hidden;
    }

    private void cleanNotificationIfNeeded(OSNotificationReceivedResult receivedResult) {
        List<String> messageIds = new ArrayList<>();
        try {
            if (!receivedResult.payload.additionalData.has(CANCELS_NOTIFICATION) || !receivedResult.payload.additionalData.getBoolean(CANCELS_NOTIFICATION)) {
                // No need to do anything if this event does not cancel the notification.
                return;
            }
            Object messageIdRaw = receivedResult.payload.additionalData.get("messageId");
            if (messageIdRaw instanceof String) {
                messageIds.add((String) messageIdRaw);
                Log.d(getClass().getSimpleName(), "messageIdRaw is " + messageIdRaw);
            } else {
                JSONArray messagesJsonArray = (JSONArray) messageIdRaw;
                Log.d(getClass().getSimpleName(), "messageIdRaw is " + messageIdRaw + " -> length: " + messagesJsonArray.length());
                for (int i = 0; i < messagesJsonArray.length(); i++) {
                    messageIds.add(messagesJsonArray.getString(i));
                }
            }
        } catch (JSONException e) {
            e.printStackTrace();
        }

        if (messageIds.size() > 0) {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                NotificationManager notificationManager = (NotificationManager) getApplicationContext().getSystemService(Context.NOTIFICATION_SERVICE);

                StatusBarNotification[] activeNotifications = notificationManager.getActiveNotifications();
                for (StatusBarNotification not : activeNotifications) {
                    Bundle bundle = not.getNotification().extras;
                    HashMap<String, Object> map = new HashMap<>();
                    if (bundle != null) {
                        for (String key : bundle.keySet()) {
                            map.put(key, bundle.get(key));
                            Log.e(getClass().getSimpleName(), "notExtra1: " + key + " : " + (bundle.get(key) != null ? bundle.get(key) : "NULL"));
                        }
                    }

                    for (String messageId : messageIds) {
                        if (not.getKey().equalsIgnoreCase(messageId)) {
                            Log.d(getClass().getSimpleName(), "Canceling notification: " + not.getId());
                            OneSignal.cancelNotification(not.getId());
                        }
                    }
                }
            } else {
                Log.e(getClass().getSimpleName(), "Cannot cancel notifications on api < 23");
            }
        }
    }

}
