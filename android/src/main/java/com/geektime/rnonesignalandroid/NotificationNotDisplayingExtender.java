package com.geektime.rnonesignalandroid;

import android.util.Log;

import com.onesignal.NotificationExtenderService;
import com.onesignal.OSNotificationReceivedResult;

import org.json.JSONException;
import org.json.JSONObject;

/**
 * Created by Andrey Beletsky on 6/5/17.
 */
public class NotificationNotDisplayingExtender extends NotificationExtenderService {

    private static final String TAG = NotificationNotDisplayingExtender.class.getSimpleName();

    public static final String CANCELS_NOTIFICATION = "cancelsNotification";

    @Override
    protected boolean onNotificationProcessing(OSNotificationReceivedResult receivedResult) {
        Log.e(this.getClass().getSimpleName(), "onNotificationProcessing: ");
        boolean isSilent = receivedResult.payload.additionalData.optBoolean("isSilent");
        if (!receivedResult.isAppInFocus && !isSilent) {
            BackgroundNotificationService.getInstance(getApplicationContext()).updateForPayload(receivedResult);
        }
        NotificationCleaner.getInstance(getApplicationContext()).cleanNotificationIfNeeded(getApplicationContext(), receivedResult);
        return shouldHideNotification(receivedResult);
    }

    // Return true if the message should be hidden.
    private boolean shouldHideNotification(OSNotificationReceivedResult receivedResult) {
        JSONObject additionalData = receivedResult.payload.additionalData;
        boolean hidden = false;
        try {
            hidden = additionalData.optBoolean(RNOneSignal.HIDDEN_MESSAGE_KEY);
            if (!hidden && additionalData.has(CANCELS_NOTIFICATION)) {
                hidden = additionalData.getBoolean(CANCELS_NOTIFICATION);
            }
        } catch (JSONException e) {
            Log.e(TAG, "onNotificationProcessing Failure: " + e.getMessage());
        }
        return hidden;
    }

    @Override
    public void onDestroy() {
        NotificationCleaner.getInstance(getApplicationContext()).onDestroy();
        BackgroundNotificationService.getInstance(getApplicationContext()).onDestroy();
        super.onDestroy();
    }
}
