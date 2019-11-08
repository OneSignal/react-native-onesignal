package com.geektime.rnonesignalandroid;

import android.content.Context;
import android.database.Cursor;
import android.database.sqlite.SQLiteDatabase;
import android.database.sqlite.SQLiteOpenHelper;
import android.util.Log;

import androidx.annotation.NonNull;

import com.onesignal.OSNotificationReceivedResult;

import org.json.JSONException;
import org.json.JSONObject;

public class NotificationService {
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
        void onCompleted(String data);
    }

    void updateForPayload(OSNotificationReceivedResult receivedResult) {
        queryMailState((state) -> {
            if (state != null) {
                queryServerWithState(receivedResult, state, (data) -> {

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

    public void queryServerWithState(OSNotificationReceivedResult receivedResult, String state, @NonNull CompletionHandler completionHandler) {
        JSONObject user = null;
        String recipient = null;
        String authToken = null;
        String threadId = null;

        try {
            JSONObject jsonPayload = new JSONObject(receivedResult.payload.rawPayload);
            JSONObject jsonState = new JSONObject(state);
            JSONObject jsonAdditionalData = receivedResult.payload.additionalData;
            recipient = jsonPayload.getString("recipient");
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
                        "   backgroundFetch(threadId: " + threadId + " email: " + recipient + ") { " +
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
            requestBody.put("operationName", "null");
            requestBody.put("query", "gqlQuery");
            requestBody.put("variables", new String[]{});
        } catch (JSONException e) {
            Log.e(TAG, "Failed to put json data in requestBody: ", e);
            completionHandler.onCompleted(null);
            return;
        }


        //        String schema = "type Query{hello: String}";
//
//        SchemaParser schemaParser = new SchemaParser();
//        TypeDefinitionRegistry typeDefinitionRegistry = schemaParser.parse(schema);
//
//        RuntimeWiring runtimeWiring = RuntimeWiring.newRuntimeWiring()
//                .type("Query", builder -> builder.dataFetcher("hello", new StaticDataFetcher("world")))
//                .build();
//
//        SchemaGenerator schemaGenerator = new SchemaGenerator();
//        GraphQLSchema graphQLSchema = schemaGenerator.makeExecutableSchema(typeDefinitionRegistry, runtimeWiring);
//
//        GraphQL build = GraphQL.newGraphQL(graphQLSchema).build();
//        ExecutionResult executionResult = build.execute("{hello}");
//
//        System.out.println(executionResult.getData().toString());
    }

    public void onDestroy() {
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
