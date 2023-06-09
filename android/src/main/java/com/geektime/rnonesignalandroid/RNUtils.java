package com.geektime.rnonesignalandroid;

import java.util.ArrayList;
import java.util.Collection;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.ReadableMapKeySetIterator;
import com.facebook.react.bridge.ReadableType;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableNativeArray;
import com.facebook.react.bridge.WritableNativeMap;

// import com.onesignal.OSInAppMessage;
import com.onesignal.inAppMessages.IInAppMessage;
import com.onesignal.inAppMessages.IInAppMessageClickResult;
import com.onesignal.inAppMessages.IInAppMessageWillDisplayEvent;
import com.onesignal.inAppMessages.IInAppMessageDidDisplayEvent;
import com.onesignal.inAppMessages.IInAppMessageWillDismissEvent;
import com.onesignal.inAppMessages.IInAppMessageDidDismissEvent;
import com.onesignal.notifications.INotification;
// import com.onesignal.notifications.INotificationAction;
import com.onesignal.notifications.INotificationClickResult;
import com.onesignal.notifications.INotificationReceivedEvent;
import com.onesignal.user.subscriptions.IPushSubscription;
import com.onesignal.user.subscriptions.ISubscription;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import java.util.Iterator;
import java.util.HashMap;
import java.util.Map;
import java.util.List;
import javax.annotation.Nullable;

public class RNUtils {
    public static WritableMap convertHashMapToWritableMap(HashMap<String, Object> hashMap) throws JSONException {
        WritableMap writableMap = Arguments.createMap();
        for (Map.Entry<String, Object> entry : hashMap.entrySet()) {
            String key = entry.getKey();
            Object value = entry.getValue();

            if (value instanceof String) {
                writableMap.putString(key, (String) value);
            } else if (value instanceof Boolean) {
                writableMap.putBoolean(key, (Boolean) value);
            } else if (value instanceof Integer) {
                writableMap.putInt(key, (Integer) value);
            } else if (value instanceof Double) {
                writableMap.putDouble(key, (Double) value);
            } else if (value instanceof Float) {
                writableMap.putDouble(key, ((Float) value).doubleValue());
            } else if (value instanceof Long) {
                writableMap.putDouble(key, ((Long) value).doubleValue());
            } else if (value instanceof HashMap) {
                writableMap.putMap(key, convertHashMapToWritableMap((HashMap<String, Object>) value));
            } else {
                writableMap.putNull(key);
            }
        }
        return writableMap;
    }

    public static HashMap<String, Object> convertNotificationToMap(INotification notification) throws JSONException {
        HashMap<String, Object> hash = new HashMap<>();

        hash.put("androidNotificationId", notification.getAndroidNotificationId());

        if (notification.getGroupedNotifications() != null) {
            hash.put("groupKey", notification.getGroupKey());
            hash.put("groupMessage", notification.getGroupMessage());
            hash.put("groupedNotifications", notification.getGroupedNotifications());
        }

        hash.put("notificationId", notification.getNotificationId());
        hash.put("title", notification.getTitle());

        if (notification.getBody() != null)
            hash.put("body", notification.getBody());
        if (notification.getSmallIcon() != null)
            hash.put("smallIcon", notification.getSmallIcon());
        if (notification.getLargeIcon() != null)
            hash.put("largeIcon", notification.getLargeIcon());
        if (notification.getBigPicture() != null)
            hash.put("bigPicture", notification.getBigPicture());
        if (notification.getSmallIconAccentColor() != null)
            hash.put("smallIconAccentColor", notification.getSmallIconAccentColor());
        if (notification.getLaunchURL() != null)
            hash.put("launchUrl", notification.getLaunchURL());
        if (notification.getSound() != null)
            hash.put("sound", notification.getSound());
        if (notification.getLedColor() != null)
            hash.put("ledColor", notification.getLedColor());
        hash.put("lockScreenVisibility", notification.getLockScreenVisibility());
        if (notification.getGroupKey() != null)
            hash.put("groupKey", notification.getGroupKey());
        if (notification.getGroupMessage() != null)
            hash.put("groupMessage", notification.getGroupMessage());
        if (notification.getFromProjectNumber() != null)
            hash.put("fromProjectNumber", notification.getFromProjectNumber());
        if (notification.getCollapseId() != null)
            hash.put("collapseId", notification.getCollapseId());
        hash.put("priority", notification.getPriority());
        if (notification.getAdditionalData() != null && notification.getAdditionalData().length() > 0)
            hash.put("additionalData", convertJSONObjectToHashMap(notification.getAdditionalData()));
        if (notification.getActionButtons() != null) {
            hash.put("actionButtons", notification.getActionButtons());
        }
        hash.put("rawPayload", notification.getRawPayload());

        return hash;
    }

    public static HashMap<String, Object> convertNotificationClickResultToMap(INotificationClickResult openResult) throws JSONException {
        HashMap<String, Object> hash = new HashMap<>();

        hash.put("notification", convertNotificationToMap(openResult.getNotification()));
        hash.put("action", convertNotificationActionToMap(openResult.getAction()));

        return hash;
    }

    public static HashMap<String, Object> convertInAppMessageToMap(IInAppMessage message) {
        HashMap<String, Object> hash = new HashMap<>();

        hash.put("messageId", message.getMessageId());

        return hash;
    }

    public static HashMap<String, Object> convertInAppMessageClickResultToMap(IInAppMessageClickResult result) {
        HashMap<String, Object> hash = new HashMap<>();

        hash.put("actionId", result.getActionId());
        hash.put("urlTarget", result.getUrlTarget());
        hash.put("url", result.getUrl());
        hash.put("closingMessage", result.getClosingMessage());

        return hash;
    }

    public static HashMap<String, Object> convertOnSubscriptionChangedToMap(IPushSubscription state) {
        HashMap<String, Object> hash = new HashMap<>();

        hash.put("token", state.getToken());
        hash.put("id", state.getId());
        hash.put("optedIn", state.getOptedIn());

        return hash;
    }

    public static HashMap<String, Object> convertJSONObjectToHashMap(JSONObject object) throws JSONException {
        HashMap<String, Object> hash = new HashMap<>();

        if (object == null || object == JSONObject.NULL)
            return hash;

        Iterator<String> keys = object.keys();

        while (keys.hasNext()) {
            String key = keys.next();

            if (object.isNull(key))
                continue;

            Object val = object.get(key);

            if (val instanceof JSONArray) {
                val = convertJSONArrayToList((JSONArray)val);
            } else if (val instanceof JSONObject) {
                val = convertJSONObjectToHashMap((JSONObject)val);
            }

            hash.put(key, val);
        }

        return hash;
    }

    public static Collection<String> convertReadableArrayIntoStringCollection(ReadableArray readableArray) {
        ArrayList<String> strings = new ArrayList<>();
        for (Object object : readableArray.toArrayList()) {
            if (object instanceof String)
                strings.add((String) object);
        }
        return strings;
    }

    public static HashMap<String, String> convertReadableMapIntoStringMap(ReadableMap readableMap) {
        HashMap<String, String> stringMap = new HashMap<>();
        ReadableMapKeySetIterator iter = readableMap.keySetIterator();

        while (iter.hasNextKey()) {
            String propKey = iter.nextKey();
            if (readableMap.getType(propKey) == ReadableType.String) {
                stringMap.put(propKey, readableMap.getString(propKey));
            }
        }

        return stringMap;
    }

    public static HashMap<String, Object> convertPermissionToMap(boolean granted) {
        HashMap<String, Object> hash = new HashMap<>();

        hash.put("permission", granted);

        return hash;
    }

    private static HashMap<String, Object> convertNotificationActionToMap(INotificationAction action) {
        HashMap<String, Object> hash = new HashMap<>();

        hash.put("id", action.getActionId());

        switch (action.getType()) {
            case Opened:
                hash.put("type", 0);
                break;
            case ActionTaken:
                hash.put("type", 1);
        }

        return hash;
    }

    private static List<Object> convertJSONArrayToList(JSONArray array) throws JSONException {
        List<Object> list = new ArrayList<>();

        for (int i = 0; i < array.length(); i++) {
            Object val = array.get(i);

            if (val instanceof JSONArray)
                val = RNUtils.convertJSONArrayToList((JSONArray)val);
            else if (val instanceof JSONObject)
                val = convertJSONObjectToHashMap((JSONObject)val);

            list.add(val);
        }

        return list;
    }
}
