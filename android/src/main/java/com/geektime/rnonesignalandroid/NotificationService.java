package com.geektime.rnonesignalandroid;

import android.content.Context;
import android.database.Cursor;
import android.database.sqlite.SQLiteDatabase;
import android.database.sqlite.SQLiteOpenHelper;
import android.util.Log;

import androidx.annotation.NonNull;

import com.onesignal.OSNotificationReceivedResult;

import java.util.ArrayList;
import java.util.List;

public class NotificationService {
    private static final String TAG = NotificationService.class.getSimpleName();
    private static TwobirdDbHelper twobirdDbHelper;
    private static final String MAIL_STATE_FORMAT = "May-22-2019";
    private static final String MAIL_STATE_TABLE_NAME = "mailstate";
    private static final String MAIL_STATE_VALUE = "value";

    private NotificationService() {
    }

    private static NotificationService instance;

    public static NotificationService getInstance(Context context) {
        if (instance == null) {
            instance = new NotificationService();
        }
        twobirdDbHelper = new TwobirdDbHelper(context);
        return instance;
    }


    public interface CompletionHandler {
        void onCompleted(boolean success, Object data);
    }

    void updateForPayload(OSNotificationReceivedResult receivedResult) {
        queryMailStateWithRecipient(receivedResult, (success, data) -> Log.e(TAG, "got state: " + data));
    }

    private void queryMailStateWithRecipient(OSNotificationReceivedResult result, @NonNull CompletionHandler completionHandler) {
        SQLiteDatabase db = twobirdDbHelper.getReadableDatabase();

        // Define a projection that specifies which columns from the database
        // you will actually use after this query.
        String[] projection = {
                MAIL_STATE_VALUE
        };

        // Filter results WHERE fmt = ?
        String selection = "fmt = ?";
        String[] selectionArgs = {MAIL_STATE_FORMAT};

        // The table to query
        // The array of columns to return (pass null to get all)
        // The columns for the WHERE clause
        // The values for the WHERE clause
        // don't group the rows
        // don't filter by row groups
        // The sort order

        try (Cursor cursor = db.query(
                MAIL_STATE_TABLE_NAME,   // The table to query
                projection,             // The array of columns to return (pass null to get all)
                selection,              // The columns for the WHERE clause
                selectionArgs,          // The values for the WHERE clause
                null,                   // don't group the rows
                null,                   // don't filter by row groups
                null               // The sort order
        )) {
            cursor.moveToNext();
            String columnData = cursor.getString(cursor.getColumnIndexOrThrow(MAIL_STATE_VALUE));
            completionHandler.onCompleted(true, columnData);
        }

    }


    public void queryServerWithState(String state, @NonNull CompletionHandler completionHandler) {
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

    public static class TwobirdDbHelper extends SQLiteOpenHelper {
        private static final String TAG = TwobirdDbHelper.class.getSimpleName();
        // If you change the database schema, you must increment the database version.
        static final int DATABASE_VERSION = 1;
        static final String DATABASE_NAME = "twobird.db";

        public TwobirdDbHelper(Context context) {
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
