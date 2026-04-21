package com.onesignal.rnonesignalandroid;

import android.app.Application;
import android.content.Context;
import androidx.annotation.NonNull;
import androidx.startup.Initializer;
import java.util.Collections;
import java.util.List;

/**
 * androidx.startup entry point that registers {@link ActivityLifecycleTracker} against the host
 * {@link Application} during {@code Application.onCreate}, before any Activity is created.
 *
 * <p>This does NOT initialize the OneSignal SDK itself: the App ID is supplied at runtime by JS
 * via {@code OneSignal.initialize(appId)}. The job here is purely to capture the current Activity
 * early so that when JS later calls initialize, {@code RNOneSignal} can hand a real Activity to
 * {@code OneSignal.initWithContext}.
 */
public class OneSignalInitializer implements Initializer<ActivityLifecycleTracker> {

    @NonNull
    @Override
    public ActivityLifecycleTracker create(@NonNull Context context) {
        ActivityLifecycleTracker tracker = ActivityLifecycleTracker.getInstance();
        Context appContext = context.getApplicationContext();
        if (appContext instanceof Application) {
            ((Application) appContext).registerActivityLifecycleCallbacks(tracker);
        }
        return tracker;
    }

    @NonNull
    @Override
    public List<Class<? extends Initializer<?>>> dependencies() {
        return Collections.emptyList();
    }
}
