package com.geektime.rnonesignalandroid;

import android.content.Context;
import android.database.Cursor;
import android.database.sqlite.SQLiteDatabase;
import android.database.sqlite.SQLiteOpenHelper;
import android.util.Log;

import androidx.annotation.NonNull;

import com.onesignal.OSNotificationReceivedResult;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.BufferedReader;
import java.io.DataOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.ArrayList;
import java.util.List;

class NotificationService {
    private static final String TAG = NotificationService.class.getSimpleName();
    private static SQLiteDatabase db;
    private static final String MAIL_STATE_FORMAT = "May-22-2019";
    private static final String MAIL_STATE_TABLE_NAME = "mailstate";
    private static final String MAIL_STATE_VALUE = "value";

    private NotificationService() {
    }

    private static NotificationService instance;

    static NotificationService getInstance(Context context) {
        if (instance == null) {
            instance = new NotificationService();
            TwobirdDbHelper twobirdDbHelper = new TwobirdDbHelper(context);
            db = twobirdDbHelper.getReadableDatabase();
        }
        return instance;
    }

    public interface CompletionHandler {
        void onCompleted(Object data);
    }

    void updateForPayload(OSNotificationReceivedResult receivedResult) {
        queryMailState((state) -> {
            if (state != null) {
                queryServerWithState(receivedResult, state, (data) -> {
                    Log.e(TAG, "GOT DATA: " + data);
                });
            } else {
                Log.e(TAG, "MailState query failed. Aborting.");
            }

        });
    }

    private void queryMailState(@NonNull CompletionHandler completionHandler) {
        String[] projection = {
                MAIL_STATE_VALUE
        };
        String selection = "fmt = ?";
        String[] selectionArgs = {MAIL_STATE_FORMAT};
        String columnData = null;

        try (Cursor cursor = db.query(
                MAIL_STATE_TABLE_NAME,  // The table to query
                projection,             // The array of columns to return (pass null to get all)
                selection,              // The columns for the WHERE clause
                selectionArgs,          // The values for the WHERE clause
                null,          // don't group the rows
                null,           // don't filter by row groups
                null           // The sort order
        )) {
            cursor.moveToNext();
            columnData = cursor.getString(cursor.getColumnIndexOrThrow(MAIL_STATE_VALUE));
        } finally {
            completionHandler.onCompleted(columnData);
        }
    }

    private void queryServerWithState(OSNotificationReceivedResult receivedResult, String state, @NonNull CompletionHandler completionHandler) {
        JSONObject user;
        String recipient;
        String authToken;
        String threadId;
        JSONObject jsonState;

        try {
            jsonState = new JSONObject(state);
            JSONObject jsonAdditionalData = receivedResult.payload.additionalData;
            recipient = jsonAdditionalData.getString("recipient");
            threadId = jsonAdditionalData.getString("threadId");
            user = jsonState.getJSONObject("user");
            authToken = user.getString("authToken");
        } catch (JSONException e) {
            Log.e(TAG, "Failed to get json data: ", e);
            completionHandler.onCompleted(null);
            return;
        }

        String gqlQuery =
                "{" +
                        "   backgroundFetch(threadId: \"" + threadId + "\" email: \"" + recipient + "\") { " +
                        "       self {  " +
                        "          mailboxes {  " +
                        "              inboxMemberships { id historyId }\n " +
                        "              email\n " +
                        "             access { token expiration needsRefresh }" +
                        "          }" +
                        "       } " +
                        "       threadContents " +
                        "   }" +
                        "}";

        JSONObject requestBody = new JSONObject();
        try {
            requestBody.put("operationName", null);
            requestBody.put("query", gqlQuery);
            requestBody.put("variables", null);
        } catch (JSONException e) {
            Log.e(TAG, "Failed to put json data in requestBody: ", e);
            completionHandler.onCompleted(null);
            return;
        }

        String wsBackendUrl;
        String httpBackendURL;

        try {
            wsBackendUrl = jsonState.getString("backendUrl");
            httpBackendURL = wsBackendUrl.startsWith("ws://")
                    ? wsBackendUrl.replace("ws://", "http://")
                    : wsBackendUrl.replace("wss://", "https://");
        } catch (JSONException e) {
            Log.e(TAG, "Failed to get backend json data: ", e);
            completionHandler.onCompleted(null);
            return;
        }
        HttpURLConnection connection = null;
        try {
            URL url = new URL(httpBackendURL);
            connection = (HttpURLConnection) url.openConnection();
            connection.setRequestMethod("POST");
            connection.setRequestProperty("authtoken", authToken);
            connection.setRequestProperty("content-type", "application/json");
            connection.setRequestProperty("Accept", "application/json");
            connection.getRequestMethod();

            try (DataOutputStream outputStream = new DataOutputStream(connection.getOutputStream())) {
                outputStream.writeBytes(requestBody.toString());
                outputStream.flush();
            }

            int code = connection.getResponseCode();
            String mess = connection.getResponseMessage();
            if (code != 200) {
                Log.e(TAG, "Response is not a success: " + code + ", message: " + mess);
                completionHandler.onCompleted(null);
                return;
            }
            String responseString = null;
            try (InputStream inputStream = connection.getInputStream()) {
                responseString = getInputData(inputStream);
            }

            if (responseString == null || responseString.length() == 0) {
                Log.e(TAG, "responseString is missing: " + responseString);
                completionHandler.onCompleted(null);
                return;
            }
            JSONObject responseJson = null;
            try {
                responseJson = new JSONObject(responseString);
                JSONObject dataJson = responseJson.getJSONObject("data");
                JSONObject backgroundFetchJson = dataJson.getJSONObject("backgroundFetch");
                JSONObject threadContentsJson = backgroundFetchJson.getJSONObject("threadContents");
                JSONObject selfJson = backgroundFetchJson.getJSONObject("self");
                JSONArray mailboxesJson = selfJson.getJSONArray("mailboxes");
                if (mailboxesJson == null || mailboxesJson.length() == 0) {
                    Log.e(TAG, "mailboxesJson is missing: " + mailboxesJson);
                    completionHandler.onCompleted(null);
                    return;
                }
                JSONObject metadataByAddressJson = new JSONObject();
                for (int i = 0; i < mailboxesJson.length(); i++) {
                    JSONObject mailbox = mailboxesJson.getJSONObject(i);
                    String email = mailbox.getString("email");
                    if (email == null || email.length() == 0) {
                        Log.e(TAG, "email is missing: " + email);
                        completionHandler.onCompleted(null);
                        return;
                    }
                    JSONObject access = mailbox.getJSONObject("access");
                    if (access == null || access.length() == 0) {
                        Log.e(TAG, "access is missing: " + access);
                        completionHandler.onCompleted(null);
                        return;
                    }
                    JSONArray inboxMemberships = mailbox.getJSONArray("inboxMemberships");
                    JSONObject metaValue = new JSONObject();
                    metaValue.put("access", access);
                    metaValue.put("memberships", inboxMemberships);
                    metadataByAddressJson.put(email, metaValue);

                }
                List<JSONObject> result = new ArrayList<>();
                result.add(threadContentsJson);
                result.add(metadataByAddressJson);
                completionHandler.onCompleted(result);
            } catch (JSONException e) {
                Log.e(TAG, "json error: ", e);
                completionHandler.onCompleted(null);
            }
        } catch (IOException e) {
            Log.e(TAG, "Failed to create url: ", e);
            completionHandler.onCompleted(null);
        } finally {
            if (connection != null) {
                connection.disconnect();
            }
        }

    }

    private String getInputData(InputStream inputStream) {
        BufferedReader reader = new BufferedReader(new InputStreamReader(inputStream));
        StringBuilder buffer = new StringBuilder();
        try {
            String line;
            while ((line = reader.readLine()) != null) {
                buffer.append(line).append("\n");
            }
        } catch (IOException e) {
            Log.e(TAG, "Failed to read line: ", e);
            return null;
        }
        return buffer.toString();
    }

    void onDestroy() {
        db.close();
        instance = null;
    }

    public static class TwobirdDbHelper extends SQLiteOpenHelper {
        private static final String TAG = TwobirdDbHelper.class.getSimpleName();
        // If you change the database schema, you must increment the database version.
        static final int DATABASE_VERSION = 1;
        static final String DATABASE_NAME = "twobird.db";

        TwobirdDbHelper(Context context) {
            super(context, DATABASE_NAME, null, DATABASE_VERSION);
        }

        public void onCreate(SQLiteDatabase db) {
//            db.execSQL(SQL_CREATE_ENTRIES);
            Log.d(TAG, "onCreate");
        }

        public void onUpgrade(SQLiteDatabase db, int oldVersion, int newVersion) {
            // This database is only a cache for online data, so its upgrade policy is
            // to simply to discard the data and start over
            // Don't need this for now.
            throw new RuntimeException("Not implemented");
        }

        public void onDowngrade(SQLiteDatabase db, int oldVersion, int newVersion) {
            onUpgrade(db, oldVersion, newVersion);
        }

    }

}
