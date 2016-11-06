package com.geektime.rnonesignalandroid;

import android.content.Intent;
import android.os.Bundle;

import com.facebook.react.bridge.LifecycleEventListener;
import com.facebook.react.bridge.ReactContext;
import com.onesignal.OSNotificationOpenResult;
import com.onesignal.OneSignal;

/**
 * Created by Avishay on 1/31/16.
 */
public class NotificationOpenedHandler implements OneSignal.NotificationOpenedHandler {

	private ReactContext mReactContext;

	public NotificationOpenedHandler(ReactContext reactContext) {
		mReactContext = reactContext;
	}

    @Override
    public void notificationOpened(OSNotificationOpenResult result) {
		Bundle bundle = new Bundle();
		bundle.putString("result", result.toJSONObject().toString());

		final Intent intent = new Intent(RNOneSignal.NOTIFICATION_OPENED_INTENT_FILTER);
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
