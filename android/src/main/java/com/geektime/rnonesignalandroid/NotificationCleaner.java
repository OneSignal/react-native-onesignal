package com.geektime.rnonesignalandroid;

import android.content.Context;
import android.database.Cursor;
import android.database.sqlite.SQLiteDatabase;
import android.database.sqlite.SQLiteOpenHelper;
import android.util.Log;

import com.google.android.gms.common.util.Strings;
import com.onesignal.OSNotificationReceivedResult;
import com.onesignal.OneSignal;

import org.json.JSONArray;
import org.json.JSONException;

import java.util.ArrayList;
import java.util.List;

class NotificationCleaner {

    private static final String TAG = NotificationCleaner.class.getSimpleName();

    private static SQLiteDatabase db;
    private static NotificationCleaner instance;

    private NotificationCleaner() {
    }

    static NotificationCleaner getInstance(Context context) {
        if (instance == null) {
            instance = new NotificationCleaner();
            OneSignalDbHelper oneSignalDbHelper = new OneSignalDbHelper(context);
            if (db == null || !db.isOpen()) {
                db = oneSignalDbHelper.getReadableDatabase();
            }
        }
        return instance;
    }

    void cleanNotificationIfNeeded(OSNotificationReceivedResult receivedResult) {
        List<String> messageIds = new ArrayList<>();
        try {
            if (!receivedResult.payload.additionalData.optBoolean(NotificationNotDisplayingExtender.CANCELS_NOTIFICATION)) {
                // No need to do anything if this event does not cancel the notification.
                return;
            }
            Object messageIdRaw = receivedResult.payload.additionalData.get("messageId");
            if (messageIdRaw == null) {
                Log.e(TAG, "cleanNotificationIfNeeded: messageIdRaw is null");
                return;
            }
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
            Log.e(TAG, "cleanNotificationIfNeeded Failed", e);
            return;
        }

        if (messageIds.size() > 0) {
            for (String messageId : messageIds) {
                if (Strings.isEmptyOrWhitespace(messageId)) {
                    Log.e(TAG, "cleanNotificationIfNeeded: messageId is null");
                    continue;
                }
                String recipient = receivedResult.payload.additionalData.optString("recipient");
                if (Strings.isEmptyOrWhitespace(recipient)) {
                    Log.e(TAG, "cleanNotificationIfNeeded: recipient is null");
                    continue;
                }
                String collapseId = recipient + "-" + messageId;
                cancelNotificationByOneCollapseId(collapseId);
            }
        } else {
            Log.e(TAG, "cleanNotificationIfNeeded: messageIds.size = 0");
        }
    }

    private void cancelNotificationByOneCollapseId(String collapseId) {
        try (Cursor cursor = db.query("notification", new String[]{"android_notification_id"}, "collapse_id=?",
                new String[]{collapseId}, null, null, null)) {
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

    static class OneSignalDbHelper extends SQLiteOpenHelper {
        private final String TAG = BackgroundNotificationService.TwobirdDbHelper.class.getSimpleName();
        static final int DATABASE_VERSION = 1;
        static final String DATABASE_NAME = "OneSignal.db";

        OneSignalDbHelper(Context context) {
            super(context, DATABASE_NAME, null, DATABASE_VERSION);
        }

        public void onCreate(SQLiteDatabase db) {
            Log.d(TAG, "onCreate");
        }

        public void onUpgrade(SQLiteDatabase db, int oldVersion, int newVersion) {
            Log.d(TAG, "onUpgrade");
        }

        public void onDowngrade(SQLiteDatabase db, int oldVersion, int newVersion) {
            Log.d(TAG, "onDowngrade");
        }

    }

    void onDestroy() {
        if (db != null) {
            db.close();
            db = null;
        }
    }
}
