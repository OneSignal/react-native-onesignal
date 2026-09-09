package com.onesignal.rnonesignalandroid;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;

import java.util.HashMap;
import java.util.List;
import org.junit.Test;

public class RNUtilsTest {
    @Test
    public void convertRawPayloadToHashMapConvertsNestedJson() {
        HashMap<String, Object> payload = RNUtils.convertRawPayloadToHashMap(
                "{\"message\":\"hello\",\"count\":2,\"enabled\":true,\"nested\":{\"value\":\"inside\"},"
                        + "\"items\":[1,{\"name\":\"item\"}]}");

        assertEquals("hello", payload.get("message"));
        assertEquals(2, payload.get("count"));
        assertEquals(true, payload.get("enabled"));

        HashMap<String, Object> nested = (HashMap<String, Object>) payload.get("nested");
        assertEquals("inside", nested.get("value"));

        List<Object> items = (List<Object>) payload.get("items");
        assertEquals(1, items.get(0));
        assertEquals("item", ((HashMap<String, Object>) items.get(1)).get("name"));
    }

    @Test
    public void convertRawPayloadToHashMapReturnsEmptyMapForEmptyPayload() {
        assertTrue(RNUtils.convertRawPayloadToHashMap("").isEmpty());
        assertTrue(RNUtils.convertRawPayloadToHashMap("   ").isEmpty());
        assertTrue(RNUtils.convertRawPayloadToHashMap(null).isEmpty());
    }

    @Test
    public void convertRawPayloadToHashMapReturnsEmptyMapForInvalidPayload() {
        assertTrue(RNUtils.convertRawPayloadToHashMap("not-json").isEmpty());
        assertTrue(RNUtils.convertRawPayloadToHashMap("[1, 2]").isEmpty());
    }
}
