package com.onesignal.rnonesignalandroid;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.ReadableMapKeySetIterator;
import com.facebook.react.bridge.ReadableType;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.onesignal.inAppMessages.IInAppMessage;
import com.onesignal.inAppMessages.IInAppMessageClickEvent;
import com.onesignal.inAppMessages.IInAppMessageClickResult;
import com.onesignal.inAppMessages.IInAppMessageDidDismissEvent;
import com.onesignal.inAppMessages.IInAppMessageDidDisplayEvent;
import com.onesignal.inAppMessages.IInAppMessageWillDismissEvent;
import com.onesignal.inAppMessages.IInAppMessageWillDisplayEvent;
import com.onesignal.notifications.INotification;
import com.onesignal.notifications.INotificationClickEvent;
import com.onesignal.notifications.INotificationClickResult;
import com.onesignal.user.state.UserChangedState;
import com.onesignal.user.state.UserState;
import com.onesignal.user.subscriptions.PushSubscriptionChangedState;
import com.onesignal.user.subscriptions.PushSubscriptionState;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

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
            } else if (value instanceof List) {
                writableMap.putArray(key, convertListToWritableArray((List<Object>) value));
            } else {
                writableMap.putNull(key);
            }
        }
        return writableMap;
    }

    public static HashMap<String, Object> convertNotificationClickEventToMap(INotificationClickEvent event)
            throws JSONException {
        HashMap<String, Object> clickResultHash = new HashMap<>();
        HashMap<String, Object> hash = new HashMap<>();
        HashMap<String, Object> notificationHash = convertNotificationToMap(event.getNotification());
        INotificationClickResult clickResult = event.getResult();

        clickResultHash.put("actionId", clickResult.getActionId());
        clickResultHash.put("url", clickResult.getUrl());

        hash.put("notification", notificationHash);
        hash.put("result", clickResultHash);

        return hash;
    }

    public static HashMap<String, Object> convertNotificationToMap(INotification notification) throws JSONException {
        HashMap<String, Object> notificationHash = new HashMap<>();
        notificationHash.put("androidNotificationId", notification.getAndroidNotificationId());

        if (notification.getGroupedNotifications() != null) {
            notificationHash.put("groupKey", notification.getGroupKey());
            notificationHash.put("groupMessage", notification.getGroupMessage());
            notificationHash.put("groupedNotifications", notification.getGroupedNotifications());
        }

        notificationHash.put("notificationId", notification.getNotificationId());
        notificationHash.put("title", notification.getTitle());

        if (notification.getBody() != null) notificationHash.put("body", notification.getBody());
        if (notification.getSmallIcon() != null) notificationHash.put("smallIcon", notification.getSmallIcon());
        if (notification.getLargeIcon() != null) notificationHash.put("largeIcon", notification.getLargeIcon());
        if (notification.getBigPicture() != null) notificationHash.put("bigPicture", notification.getBigPicture());
        if (notification.getSmallIconAccentColor() != null)
            notificationHash.put("smallIconAccentColor", notification.getSmallIconAccentColor());
        if (notification.getLaunchURL() != null) notificationHash.put("launchURL", notification.getLaunchURL());
        if (notification.getSound() != null) notificationHash.put("sound", notification.getSound());
        if (notification.getLedColor() != null) notificationHash.put("ledColor", notification.getLedColor());
        notificationHash.put("lockScreenVisibility", notification.getLockScreenVisibility());
        if (notification.getGroupKey() != null) notificationHash.put("groupKey", notification.getGroupKey());
        if (notification.getGroupMessage() != null)
            notificationHash.put("groupMessage", notification.getGroupMessage());
        if (notification.getFromProjectNumber() != null)
            notificationHash.put("fromProjectNumber", notification.getFromProjectNumber());
        if (notification.getCollapseId() != null) notificationHash.put("collapseId", notification.getCollapseId());
        notificationHash.put("priority", notification.getPriority());
        if (notification.getAdditionalData() != null
                && notification.getAdditionalData().length() > 0)
            notificationHash.put("additionalData", convertJSONObjectToHashMap(notification.getAdditionalData()));
        if (notification.getActionButtons() != null) {
            notificationHash.put("actionButtons", notification.getActionButtons());
        }
        notificationHash.put("rawPayload", notification.getRawPayload());

        return notificationHash;
    }

    private static HashMap<String, Object> convertInAppMessageToMap(IInAppMessage message) {
        HashMap<String, Object> hash = new HashMap<>();
        hash.put("messageId", message.getMessageId());

        return hash;
    }

    public static HashMap<String, Object> convertInAppMessageWillDisplayEventToMap(
            IInAppMessageWillDisplayEvent event) {
        HashMap<String, Object> hash = new HashMap<>();
        hash.put("message", convertInAppMessageToMap(event.getMessage()));

        return hash;
    }

    public static HashMap<String, Object> convertInAppMessageDidDisplayEventToMap(IInAppMessageDidDisplayEvent event) {
        HashMap<String, Object> hash = new HashMap<>();
        hash.put("message", convertInAppMessageToMap(event.getMessage()));

        return hash;
    }

    public static HashMap<String, Object> convertInAppMessageWillDismissEventToMap(
            IInAppMessageWillDismissEvent event) {
        HashMap<String, Object> hash = new HashMap<>();
        hash.put("message", convertInAppMessageToMap(event.getMessage()));

        return hash;
    }

    public static HashMap<String, Object> convertInAppMessageDidDismissEventToMap(IInAppMessageDidDismissEvent event) {
        HashMap<String, Object> hash = new HashMap<>();
        hash.put("message", convertInAppMessageToMap(event.getMessage()));

        return hash;
    }

    public static HashMap<String, Object> convertInAppMessageClickEventToMap(IInAppMessageClickEvent event) {
        HashMap<String, Object> resultHash = new HashMap<>();
        HashMap<String, Object> hash = new HashMap<>();
        IInAppMessageClickResult result = event.getResult();

        resultHash.put("actionId", result.getActionId());
        resultHash.put("urlTarget", result.getUrlTarget());
        resultHash.put("url", result.getUrl());
        resultHash.put("closingMessage", result.getClosingMessage());

        hash.put("result", resultHash);
        hash.put("message", convertInAppMessageToMap(event.getMessage()));

        return hash;
    }

    public static HashMap<String, Object> convertPushSubscriptionStateToMap(PushSubscriptionState state) {
        HashMap<String, Object> hash = new HashMap<>();
        if (state.getToken() != null && !state.getToken().isEmpty()) {
            hash.put("token", state.getToken());
        } else {
            hash.put("token", JSONObject.NULL);
        }
        if (state.getId() != null && !state.getId().isEmpty()) {
            hash.put("id", state.getId());
        } else {
            hash.put("id", JSONObject.NULL);
        }
        hash.put("optedIn", state.getOptedIn());

        return hash;
    }

    public static HashMap<String, Object> convertUserStateToMap(UserState user) {
        HashMap<String, Object> hash = new HashMap<>();

        if (user.getExternalId() != null && !user.getExternalId().isEmpty()) {
            hash.put("externalId", user.getExternalId());
        } else {
            hash.put("externalId", JSONObject.NULL);
        }
        if (user.getOnesignalId() != null && !user.getOnesignalId().isEmpty()) {
            hash.put("onesignalId", user.getOnesignalId());
        } else {
            hash.put("onesignalId", JSONObject.NULL);
        }

        return hash;
    }

    public static HashMap<String, Object> convertPushSubscriptionChangedStateToMap(PushSubscriptionChangedState state) {
        HashMap<String, Object> hash = new HashMap<>();
        hash.put("current", convertPushSubscriptionStateToMap(state.getCurrent()));
        hash.put("previous", convertPushSubscriptionStateToMap(state.getPrevious()));

        return hash;
    }

    public static HashMap<String, Object> convertUserChangedStateToMap(UserChangedState state) {
        HashMap<String, Object> hash = new HashMap<>();
        hash.put("current", convertUserStateToMap(state.getCurrent()));

        return hash;
    }

    public static HashMap<String, Object> convertJSONObjectToHashMap(JSONObject object) throws JSONException {
        HashMap<String, Object> hash = new HashMap<>();

        if (object == null || object == JSONObject.NULL) return hash;

        Iterator<String> keys = object.keys();

        while (keys.hasNext()) {
            String key = keys.next();

            if (object.isNull(key)) continue;

            Object val = object.get(key);

            if (val instanceof JSONArray) {
                val = convertJSONArrayToList((JSONArray) val);
            } else if (val instanceof JSONObject) {
                val = convertJSONObjectToHashMap((JSONObject) val);
            }

            hash.put(key, val);
        }

        return hash;
    }

    public static Collection<String> convertReadableArrayIntoStringCollection(ReadableArray readableArray) {
        ArrayList<String> strings = new ArrayList<>();
        for (Object object : readableArray.toArrayList()) {
            if (object instanceof String) strings.add((String) object);
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

    private static List<Object> convertJSONArrayToList(JSONArray array) throws JSONException {
        List<Object> list = new ArrayList<>();

        for (int i = 0; i < array.length(); i++) {
            Object val = array.get(i);

            if (val instanceof JSONArray) val = RNUtils.convertJSONArrayToList((JSONArray) val);
            else if (val instanceof JSONObject) val = convertJSONObjectToHashMap((JSONObject) val);

            list.add(val);
        }

        return list;
    }

    private static WritableArray convertListToWritableArray(List<Object> list) throws JSONException {
        WritableArray writableArray = Arguments.createArray();
        for (Object item : list) {
            if (item instanceof String) {
                writableArray.pushString((String) item);
            } else if (item instanceof Boolean) {
                writableArray.pushBoolean((Boolean) item);
            } else if (item instanceof Integer) {
                writableArray.pushInt((Integer) item);
            } else if (item instanceof Double) {
                writableArray.pushDouble((Double) item);
            } else if (item instanceof Float) {
                writableArray.pushDouble(((Float) item).doubleValue());
            } else if (item instanceof Long) {
                writableArray.pushDouble(((Long) item).doubleValue());
            } else if (item instanceof HashMap) {
                writableArray.pushMap(convertHashMapToWritableMap((HashMap<String, Object>) item));
            } else if (item instanceof List) {
                writableArray.pushArray(convertListToWritableArray((List<Object>) item));
            } else {
                writableArray.pushNull();
            }
        }
        return writableArray;
    }
}
