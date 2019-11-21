package com.geektime.rnonesignalandroid;

import android.content.Context;
import android.database.Cursor;
import android.database.sqlite.SQLiteDatabase;
import android.database.sqlite.SQLiteOpenHelper;
import android.os.Build;
import android.util.Log;

import com.onesignal.NotificationExtenderService;
import com.onesignal.OSNotificationReceivedResult;
import com.onesignal.OneSignal;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.List;

/**
 * Created by Andrey Beletsky on 6/5/17.
 */
public class NotificationNotDisplayingExtender extends NotificationExtenderService {

    private static final String TAG = NotificationNotDisplayingExtender.class.getSimpleName();
    private static SQLiteDatabase _db;
    public static final String CANCELS_NOTIFICATION = "cancelsNotification";

    private SQLiteDatabase getDataBase() {
        if (_db == null) {
            OneSignalDbHelper oneSignalDbHelper = new OneSignalDbHelper(getApplicationContext());
            if (_db != null && !_db.isOpen()) {
                _db.close();
                _db = null;
            }
            _db = oneSignalDbHelper.getReadableDatabase();
        }
        return _db;
    }

    @Override
    protected boolean onNotificationProcessing(OSNotificationReceivedResult receivedResult) {
        Log.e(this.getClass().getSimpleName(), "onNotificationProcessing: ");
        try {
            if (!receivedResult.isAppInFocus && !receivedResult.payload.additionalData.getBoolean("isSilent")) {
                NotificationService.getInstance(getApplicationContext()).updateForPayload(receivedResult);
            }
        } catch (JSONException e) {
            e.printStackTrace();
        }
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
            if (!receivedResult.payload.additionalData.has(CANCELS_NOTIFICATION)
                    || !receivedResult.payload.additionalData.getBoolean(CANCELS_NOTIFICATION)) {
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
        android.os.Debug.waitForDebugger();


        if (messageIds.size() > 0) {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                for (String messageId : messageIds) {
                    try {
                        String recipient = receivedResult.payload.additionalData.getString("recipient");
                        String collapseId = recipient + "-" + messageId;
                        cancelNotificationByOneSignalId(collapseId);
                    } catch (JSONException e) {
                        Log.e(TAG, "Failed to cancel notification, no recipient in additionalData paylaod.");
                        return;
                    }
                }
//                StatusBarNotification[] activeNotifications = notificationManager.getActiveNotifications();


//                for (StatusBarNotification not : activeNotifications) {
//                    Bundle bundle = not.getNotification().extras;
//                    HashMap<String, Object> map = new HashMap<>();
//                    if (bundle != null) {
//                        for (String key : bundle.keySet()) {
//                            map.put(key, bundle.get(key));
//                            Log.e(getClass().getSimpleName(), "notExtra1: " + key + " : " + (bundle.get(key) != null ? bundle.get(key) : "NULL"));
//                        }
//                    }
//
//                }
            } else {
                Log.e(getClass().getSimpleName(), "Cannot cancel notifications on api < 23");
            }
        }
    }

    class OneSignalDbHelper extends SQLiteOpenHelper {
        private final String TAG = NotificationService.TwobirdDbHelper.class.getSimpleName();
        // If you change the database schema, you must increment the database version.
        static final int DATABASE_VERSION = 1;
        static final String DATABASE_NAME = "OneSignal.db";

        OneSignalDbHelper(Context context) {
            super(context, DATABASE_NAME, null, DATABASE_VERSION);
        }

        public void onCreate(SQLiteDatabase db) {
            Log.d(TAG, "onCreate");
        }

        public void onUpgrade(SQLiteDatabase db, int oldVersion, int newVersion) {
            // This database is only a cache for online data, so its upgrade policy is
            // to simply to discard the data and start over
            // Don't need this for now.
        }

        public void onDowngrade(SQLiteDatabase db, int oldVersion, int newVersion) {

        }
    }

    private void cancelNotificationByOneSignalId(String collapseId) {
        try (Cursor cursor = getDataBase().query("notification", new String[]{"android_notification_id"}, "collapse_id=?", new String[]{collapseId}, null, null, null)) {
            Log.e(TAG, "cursor: " + cursor.toString());
            if (cursor.moveToNext()) {
                int androidNotId = cursor.getInt(cursor.getColumnIndex("android_notification_id"));
                OneSignal.cancelNotification(androidNotId);
                Log.d(TAG, "Canceling notification with id: " + androidNotId);
            } else {
                Log.e(TAG, "Failed to cancelNotificationByOneSignalId,cursor has 0 items.");
            }
        } catch (Exception e) {
            Log.e(TAG, "Failed to cancelNotificationByOneSignalId", e);
        }

    }

    @Override
    public void onDestroy() {
        NotificationService.getInstance(getApplicationContext()).onDestroy();
        if (_db != null) {
            _db.close();
            _db = null;
        }
        super.onDestroy();
    }
}
