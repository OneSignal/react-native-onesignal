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
public class NotificationOpenedHandler implements OneSignal.NotificationOpenedHandler {

	private ReactContext mReactContext;

	public NotificationOpenedHandler(ReactContext reactContext) {
		mReactContext = reactContext;
	}

    @Override
    public void notificationOpened(String s, JSONObject jsonObject, boolean b) {
		Bundle bundle = new Bundle();
		bundle.putString("message", s);
		bundle.putString("additionalData", jsonObject.toString());
		bundle.putBoolean("isActive", b);

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
