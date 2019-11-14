package com.geektime.rnonesignalandroid;

import android.util.Log;

public class Utils {

    static void longLog(String tag, String id, String str) {
        if (str.length() > 4000) {
            Log.e(tag, id + ": " + str.substring(0, 4000));
            longLog(tag, id, str.substring(4000));
        } else
            Log.e(tag, id + ": " + str);
    }
}
