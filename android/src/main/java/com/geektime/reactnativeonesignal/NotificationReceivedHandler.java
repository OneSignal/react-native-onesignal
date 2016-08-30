package com.geektime.reactnativeonesignal;

import android.content.Intent;
import android.os.Bundle;

import com.facebook.react.bridge.LifecycleEventListener;
import com.facebook.react.bridge.ReactContext;
import com.onesignal.OneSignal;

import org.json.JSONObject;

/**
 * Created by Avishay on 1/31/16.
 */
public class NotificationReceivedHandler implements OneSignal.NotificationReceivedHandler {

	private ReactContext mReactContext;

	public NotificationReceived(ReactContext reactContext) {
		mReactContext = reactContext;
	}

    @Override
    public void notificationReceived(OSNotification notification) {
		Bundle bundle = new Bundle();
		bundle.putString("message", notification.stringify());
		
		final Intent intent = new Intent(RNOneSignal.NOTIFICATION_RECEIVED_INTENT_FILTER);
		intent.putExtras(bundle);

        if (mReactContext.hasActiveCatalystInstance()) {
			mReactContext.sendBroadcast(intent);
            return;
        }

        mReactContext.addLifecycleEventListener(new LifecycleEventListener() {
			@Override
			public void onHostResume() {
				mReactContext.sendBroadcast(intent);
                mReactContext.removeLifecycleEventListener(this);
			}

			@Override
			public void onHostPause() {

			}

			@Override
			public void onHostDestroy() {

			}
		});
    }
}
