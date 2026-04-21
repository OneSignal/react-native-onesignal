package com.onesignal.rnonesignalandroid;

import android.app.Activity;
import android.app.Application;
import android.os.Bundle;
import androidx.annotation.Nullable;
import java.lang.ref.WeakReference;

/**
 * Tracks the host app's current Activity from Application.onCreate onward.
 *
 * <p>Registered very early via {@link OneSignalInitializer} (androidx.startup) so it captures the
 * first {@code MainActivity.onResume} that fires before the React Native bridge has loaded the JS
 * bundle. Without this, {@link com.facebook.react.bridge.ReactApplicationContext#getCurrentActivity()}
 * frequently returns {@code null} during cold start in bridgeless mode, causing
 * {@code RNOneSignal.initialize} to hand the OneSignal SDK an ApplicationContext instead of the
 * real Activity. That in turn leaves {@code ApplicationService.current == null} and queues
 * {@code requestPermission()} until the next foreground.
 */
public class ActivityLifecycleTracker implements Application.ActivityLifecycleCallbacks {
    private static final ActivityLifecycleTracker INSTANCE = new ActivityLifecycleTracker();

    private WeakReference<Activity> currentActivity = new WeakReference<>(null);

    private ActivityLifecycleTracker() {}

    public static ActivityLifecycleTracker getInstance() {
        return INSTANCE;
    }

    @Nullable
    public Activity getCurrentActivity() {
        return currentActivity.get();
    }

    @Override
    public void onActivityCreated(Activity activity, @Nullable Bundle savedInstanceState) {
        currentActivity = new WeakReference<>(activity);
    }

    @Override
    public void onActivityStarted(Activity activity) {
        currentActivity = new WeakReference<>(activity);
    }

    @Override
    public void onActivityResumed(Activity activity) {
        currentActivity = new WeakReference<>(activity);
    }

    @Override
    public void onActivityPaused(Activity activity) {
        // Intentionally no-op: keep the reference so a transient overlay (e.g. permission dialog,
        // PermissionsActivity) doesn't blank out the current Activity for callers that race with it.
    }

    @Override
    public void onActivityStopped(Activity activity) {
        // Intentionally no-op for the same reason as onActivityPaused.
    }

    @Override
    public void onActivitySaveInstanceState(Activity activity, Bundle outState) {}

    @Override
    public void onActivityDestroyed(Activity activity) {
        Activity current = currentActivity.get();
        if (current == activity) {
            currentActivity = new WeakReference<>(null);
        }
    }
}
