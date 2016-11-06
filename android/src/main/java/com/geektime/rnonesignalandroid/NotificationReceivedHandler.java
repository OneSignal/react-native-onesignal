package com.geektime.rnonesignalandroid;

import android.content.Intent;
import android.os.Bundle;

import com.facebook.react.bridge.LifecycleEventListener;
import com.facebook.react.bridge.ReactContext;
import com.onesignal.OSNotification;
import com.onesignal.OneSignal;

/**
 * Created by Avishay on 1/31/16.
 */
public class NotificationReceivedHandler implements OneSignal.NotificationReceivedHandler {

	private ReactContext mReactContext;

	public NotificationReceivedHandler(ReactContext reactContext) {
		mReactContext = reactContext;
	}

    @Override
    public void notificationReceived(OSNotification notification) {
		Bundle bundle = new Bundle();
		bundle.putString("notification", notification.toJSONObject().toString());
		
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
