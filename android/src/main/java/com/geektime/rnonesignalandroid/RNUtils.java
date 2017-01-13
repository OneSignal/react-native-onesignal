package com.geektime.rnonesignalandroid;

import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.ReadableMapKeySetIterator;
import com.facebook.react.bridge.ReadableType;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableNativeArray;
import com.facebook.react.bridge.WritableNativeMap;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.Iterator;

import javax.annotation.Nullable;

/**
 * Created by danpeleg on 15/02/16.
 * Copyright (c) GlobeKeeper 2014-2015
 */
public class RNUtils {

    /**
     * Converts a react native readable map into a JSON object.
     *
     * @param readableMap map to convert to JSON Object
     * @return JSON Object that contains the readable map properties
     */
    @Nullable
    public static JSONObject readableMapToJson(ReadableMap readableMap) {
        JSONObject jsonObject = new JSONObject();

        if (readableMap == null) {
            return null;
        }

        ReadableMapKeySetIterator iterator = readableMap.keySetIterator();
        if (!iterator.hasNextKey()) {
            return null;
        }

        while (iterator.hasNextKey()) {
            String key = iterator.nextKey();
            ReadableType readableType = readableMap.getType(key);

            try {
                switch (readableType) {
                    case Null:
                        jsonObject.put(key, null);
                        break;
                    case Boolean:
                        jsonObject.put(key, readableMap.getBoolean(key));
                        break;
                    case Number:
                        // Can be int or double.
                        jsonObject.put(key, readableMap.getInt(key));
                        break;
                    case String:
                        jsonObject.put(key, readableMap.getString(key));
                        break;
                    case Map:
                        jsonObject.put(key, readableMapToJson(readableMap.getMap(key)));
                        break;
                    case Array:
                        jsonObject.put(key, readableMap.getArray(key));
                    default:
                        // Do nothing and fail silently
                }
            } catch (JSONException ex) {
                // Do nothing and fail silently
            }
        }

        return jsonObject;
    }

    @Nullable
    public static WritableMap jsonToWritableMap(JSONObject jsonObject) {
        WritableMap writableMap = new WritableNativeMap();

        if (jsonObject == null) {
            return null;
        }


        Iterator<String> iterator = jsonObject.keys();
        if (!iterator.hasNext()) {
            return null;
        }

        while (iterator.hasNext()) {
            String key = iterator.next();

            try {
                Object value = jsonObject.get(key);

                if (value == null) {
                    writableMap.putNull(key);
                } else if (value instanceof Boolean) {
                    writableMap.putBoolean(key, (Boolean) value);
                } else if (value instanceof Integer) {
                    writableMap.putInt(key, (Integer) value);
                } else if (value instanceof Double) {
                    writableMap.putDouble(key, (Double) value);
                } else if (value instanceof String) {
                    writableMap.putString(key, (String) value);
                } else if (value instanceof JSONObject) {
                    writableMap.putMap(key, jsonToWritableMap((JSONObject) value));
                } else if (value instanceof JSONArray) {
                    writableMap.putArray(key, jsonArrayToWritableArray((JSONArray) value));
                }
            } catch (JSONException ex) {
                // Do nothing and fail silently
            }
        }

        return writableMap;
    }

    @Nullable
    public static WritableArray jsonArrayToWritableArray(JSONArray jsonArray) {
        WritableArray writableArray = new WritableNativeArray();

        if (jsonArray == null) {
            return null;
        }

        if (jsonArray.length() <= 0) {
            return null;
        }

        for (int i = 0 ; i < jsonArray.length(); i++) {
            try {
                Object value = jsonArray.get(i);
                if (value == null) {
                    writableArray.pushNull();
                } else if (value instanceof Boolean) {
                    writableArray.pushBoolean((Boolean) value);
                } else if (value instanceof Integer) {
                    writableArray.pushInt((Integer) value);
                } else if (value instanceof Double) {
                    writableArray.pushDouble((Double) value);
                } else if (value instanceof String) {
                    writableArray.pushString((String) value);
                } else if (value instanceof JSONObject) {
                    writableArray.pushMap(jsonToWritableMap((JSONObject) value));
                } else if (value instanceof JSONArray) {
                    writableArray.pushArray(jsonArrayToWritableArray((JSONArray) value));
                }
            } catch (JSONException e) {
                // Do nothing and fail silently
            }
        }

        return writableArray;
    }
}
