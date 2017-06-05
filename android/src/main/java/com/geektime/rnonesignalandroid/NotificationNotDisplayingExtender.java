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
    @Override
    protected boolean onNotificationProcessing(OSNotificationReceivedResult receivedResult) {
        JSONObject additionalData = receivedResult.payload.additionalData;
        boolean hidden = false;
        try {
            if (additionalData.has(RNOneSignal.HIDDEN_MESSAGE_KEY)) {
                hidden = additionalData.getBoolean(RNOneSignal.HIDDEN_MESSAGE_KEY);
            }
        } catch (JSONException e) {
            Log.e("OneSignal", "onNotificationProcessing Failure: " + e.getMessage());
        }

        // Return true to stop the notification from displaying.
        return hidden;
    }
}
