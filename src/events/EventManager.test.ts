import { NativeEventEmitter } from 'react-native';
import { createEmitterSubscriptionMock } from '../../__mocks__/react-native';
import {
  IN_APP_MESSAGE_CLICKED,
  IN_APP_MESSAGE_DID_DISMISS,
  IN_APP_MESSAGE_DID_DISPLAY,
  IN_APP_MESSAGE_WILL_DISMISS,
  IN_APP_MESSAGE_WILL_DISPLAY,
  NOTIFICATION_CLICKED,
  NOTIFICATION_WILL_DISPLAY,
  PERMISSION_CHANGED,
  SUBSCRIPTION_CHANGED,
  USER_STATE_CHANGED,
} from '../constants/events';
import OSNotification from '../OSNotification';
import type { NotificationClickEvent } from '../types/notificationEvents';
import type { PushSubscriptionChangedState } from '../types/subscription';
import type { UserChangedState } from '../types/user';
import EventManager, { type RawEventListenerMap } from './EventManager';
import NotificationWillDisplayEvent from './NotificationWillDisplayEvent';

describe('EventManager', () => {
  let eventManager: EventManager;
  let mockNativeModule: any;
  let eventCallbacks: Map<string, (payload: any) => void>;

  const getCallback = <K extends keyof RawEventListenerMap>(
    eventName: K,
  ): RawEventListenerMap[K] | undefined => {
    return eventCallbacks.get(eventName) as RawEventListenerMap[K] | undefined;
  };

  beforeEach(() => {
    eventCallbacks = new Map();

    mockNativeModule = {
      addListener: vi.fn(),
      removeListener: vi.fn(),
    };

    // Spy on NativeEventEmitter.prototype.addListener to capture callbacks
    vi.spyOn(NativeEventEmitter.prototype, 'addListener').mockImplementation(
      (eventName: string, callback: (payload: any) => void) => {
        eventCallbacks.set(eventName, callback);
        return createEmitterSubscriptionMock(eventName, callback) as never;
      },
    );

    eventManager = new EventManager(mockNativeModule);
  });

  describe('constructor', () => {
    test('should initialize with all required properties and listeners', () => {
      expect(eventManager).toBeDefined();
      expect(eventManager['RNOneSignal']).toBe(mockNativeModule);
      expect(eventManager['oneSignalEventEmitter']).toBeDefined();
      expect(eventManager['eventListenerArrayMap']).toBeInstanceOf(Map);

      const listeners = eventManager['listeners'];
      const expectedEvents = [
        PERMISSION_CHANGED,
        SUBSCRIPTION_CHANGED,
        USER_STATE_CHANGED,
        NOTIFICATION_WILL_DISPLAY,
        NOTIFICATION_CLICKED,
        IN_APP_MESSAGE_CLICKED,
        IN_APP_MESSAGE_WILL_DISPLAY,
        IN_APP_MESSAGE_WILL_DISMISS,
        IN_APP_MESSAGE_DID_DISMISS,
        IN_APP_MESSAGE_DID_DISPLAY,
      ];

      expectedEvents.forEach((eventName) => {
        expect(listeners[eventName]).toBeDefined();
      });

      // Verify that eventCallbacks were populated during setup
      expect(eventCallbacks.size).toBe(10);
    });
  });

  describe('setupListeners', () => {
    test('should register all event listeners with NativeEventEmitter', () => {
      const eventList = [
        PERMISSION_CHANGED,
        SUBSCRIPTION_CHANGED,
        USER_STATE_CHANGED,
        NOTIFICATION_WILL_DISPLAY,
        NOTIFICATION_CLICKED,
        IN_APP_MESSAGE_CLICKED,
        IN_APP_MESSAGE_WILL_DISPLAY,
        IN_APP_MESSAGE_WILL_DISMISS,
        IN_APP_MESSAGE_DID_DISMISS,
        IN_APP_MESSAGE_DID_DISPLAY,
      ];

      eventList.forEach((eventName) => {
        expect(eventCallbacks.has(eventName)).toBe(true);
      });
    });

    test('should not setup listeners if RNOneSignal is null', () => {
      new EventManager(null as any);
      expect(mockNativeModule.addListener).not.toHaveBeenCalled();
    });
  });

  describe('addEventListener', () => {
    test('should add a handler to a new event', () => {
      const handler = vi.fn();
      eventManager.addEventListener(PERMISSION_CHANGED, handler);

      const handlerArray =
        eventManager['eventListenerArrayMap'].get(PERMISSION_CHANGED);
      expect(handlerArray).toContain(handler);
    });

    test('should add multiple handlers to the same event', () => {
      const handler1 = vi.fn();
      const handler2 = vi.fn();

      eventManager.addEventListener(PERMISSION_CHANGED, handler1);
      eventManager.addEventListener(PERMISSION_CHANGED, handler2);

      const handlerArray =
        eventManager['eventListenerArrayMap'].get(PERMISSION_CHANGED);
      expect(handlerArray).toContain(handler1);
      expect(handlerArray).toContain(handler2);
      expect(handlerArray?.length).toBe(2);
    });

    test('should add handlers to different events independently', () => {
      const handler1 = vi.fn();
      const handler2 = vi.fn();

      eventManager.addEventListener(PERMISSION_CHANGED, handler1);
      eventManager.addEventListener(SUBSCRIPTION_CHANGED, handler2);

      const handlerArray1 =
        eventManager['eventListenerArrayMap'].get(PERMISSION_CHANGED);
      const handlerArray2 =
        eventManager['eventListenerArrayMap'].get(SUBSCRIPTION_CHANGED);

      expect(handlerArray1).toContain(handler1);
      expect(handlerArray2).toContain(handler2);
    });
  });

  describe('removeEventListener', () => {
    test('should remove a handler from an event', () => {
      const handler = vi.fn();
      eventManager.addEventListener(PERMISSION_CHANGED, handler);
      eventManager.removeEventListener(PERMISSION_CHANGED, handler);

      const handlerArray =
        eventManager['eventListenerArrayMap'].get(PERMISSION_CHANGED);
      expect(handlerArray).toBeUndefined();
    });

    test('should remove specific handler when multiple exist', () => {
      const handler1 = vi.fn();
      const handler2 = vi.fn();
      const handler3 = vi.fn();

      eventManager.addEventListener(SUBSCRIPTION_CHANGED, handler1);
      eventManager.addEventListener(SUBSCRIPTION_CHANGED, handler2);
      eventManager.addEventListener(SUBSCRIPTION_CHANGED, handler3);
      eventManager.removeEventListener(SUBSCRIPTION_CHANGED, handler2);

      const handlerArray =
        eventManager['eventListenerArrayMap'].get(SUBSCRIPTION_CHANGED);
      expect(handlerArray).toContain(handler1);
      expect(handlerArray).not.toContain(handler2);
      expect(handlerArray).toContain(handler3);
      expect(handlerArray?.length).toBe(2);
    });

    test('should do nothing if event does not exist', () => {
      const handler = vi.fn();
      expect(() => {
        eventManager.removeEventListener('non-existent-event' as any, handler);
      }).not.toThrow();
    });

    test('should do nothing if handler is not in the list', () => {
      const handler1 = vi.fn();
      const handler2 = vi.fn();

      eventManager.addEventListener(NOTIFICATION_WILL_DISPLAY, handler1);
      expect(() => {
        eventManager.removeEventListener(NOTIFICATION_WILL_DISPLAY, handler2);
      }).not.toThrow();

      const handlerArray = eventManager['eventListenerArrayMap'].get(
        NOTIFICATION_WILL_DISPLAY,
      );
      expect(handlerArray).toContain(handler1);
      expect(handlerArray?.length).toBe(1);
    });
  });

  describe('generateEventListener', () => {
    test('should return an EmitterSubscription', () => {
      const listener =
        eventManager['generateEventListener'](PERMISSION_CHANGED);
      expect(listener).toBeDefined();
      expect(listener.remove).toBeDefined();
    });

    test('should handle NOTIFICATION_WILL_DISPLAY events', () => {
      const handler = vi.fn();
      eventManager.addEventListener(NOTIFICATION_WILL_DISPLAY, handler);

      const callback = getCallback(NOTIFICATION_WILL_DISPLAY);
      callback!(rawWillDisplayPayload);

      expect(handler).toHaveBeenCalled();
      const receivedEvent = handler.mock.calls[0][0];
      expect(receivedEvent).toBeInstanceOf(NotificationWillDisplayEvent);
    });

    test('should handle PERMISSION_CHANGED events with boolean payload', () => {
      const handler = vi.fn();
      eventManager.addEventListener(PERMISSION_CHANGED, handler);

      const payload = getRawPermissionChangedPayload(true);
      const callback = getCallback(PERMISSION_CHANGED);
      callback!(payload);

      expect(handler).toHaveBeenCalledWith(true);
    });

    test('should handle generic events with object payload', () => {
      const handler = vi.fn();

      eventManager.addEventListener(SUBSCRIPTION_CHANGED, handler);

      const callback = getCallback(SUBSCRIPTION_CHANGED);
      callback!(pushChangedPayload);

      expect(handler).toHaveBeenCalledWith(pushChangedPayload);
    });

    test('should call all handlers for an event', () => {
      const handler1 = vi.fn();
      const handler2 = vi.fn();
      const handler3 = vi.fn();

      eventManager.addEventListener(USER_STATE_CHANGED, handler1);
      eventManager.addEventListener(USER_STATE_CHANGED, handler2);
      eventManager.addEventListener(USER_STATE_CHANGED, handler3);

      const callback = getCallback(USER_STATE_CHANGED);
      const payload = {
        current: { onesignalId: '123', externalId: '456' },
      } satisfies UserChangedState;
      callback!(payload);

      expect(handler1).toHaveBeenCalledWith(payload);
      expect(handler2).toHaveBeenCalledWith(payload);
      expect(handler3).toHaveBeenCalledWith(payload);
    });

    test('should do nothing if no handlers are registered', () => {
      const callback = getCallback(IN_APP_MESSAGE_WILL_DISPLAY);

      expect(() => {
        callback!({ message: { messageId: 'msg-123' } });
      }).not.toThrow();
    });

    test('should handle IN_APP_MESSAGE_CLICKED events', () => {
      const handler = vi.fn();
      const payload = {
        message: { messageId: 'msg-123' },
        result: { closingMessage: false, actionId: 'action-1' },
      };

      eventManager.addEventListener(IN_APP_MESSAGE_CLICKED, handler);

      const callback = getCallback(IN_APP_MESSAGE_CLICKED);
      callback!(payload);

      expect(handler).toHaveBeenCalledWith(payload);
    });

    test('should handle IN_APP_MESSAGE_WILL_DISPLAY events', () => {
      const handler = vi.fn();
      const payload = { message: { messageId: 'msg-123' } };

      eventManager.addEventListener(IN_APP_MESSAGE_WILL_DISPLAY, handler);

      const callback = getCallback(IN_APP_MESSAGE_WILL_DISPLAY);
      callback!(payload);

      expect(handler).toHaveBeenCalledWith(payload);
    });

    test('should handle IN_APP_MESSAGE_DID_DISPLAY events', () => {
      const handler = vi.fn();
      const payload = { message: { messageId: 'msg-123' } };

      eventManager.addEventListener(IN_APP_MESSAGE_DID_DISPLAY, handler);

      const callback = getCallback(IN_APP_MESSAGE_DID_DISPLAY);
      callback!(payload);

      expect(handler).toHaveBeenCalledWith(payload);
    });

    test('should handle IN_APP_MESSAGE_WILL_DISMISS events', () => {
      const handler = vi.fn();
      const payload = { message: { messageId: 'msg-123' } };

      eventManager.addEventListener(IN_APP_MESSAGE_WILL_DISMISS, handler);

      const callback = getCallback(IN_APP_MESSAGE_WILL_DISMISS);
      callback!(payload);

      expect(handler).toHaveBeenCalledWith(payload);
    });

    test('should handle IN_APP_MESSAGE_DID_DISMISS events', () => {
      const handler = vi.fn();
      const payload = { message: { messageId: 'msg-123' } };

      eventManager.addEventListener(IN_APP_MESSAGE_DID_DISMISS, handler);

      const callback = getCallback(IN_APP_MESSAGE_DID_DISMISS);
      callback!(payload);

      expect(handler).toHaveBeenCalledWith(payload);
    });

    test('should handle NOTIFICATION_CLICKED events', () => {
      const handler = vi.fn();
      const payload = {
        result: { actionId: 'action-1' },
        notification: new OSNotification({
          notificationId: 'test-id',
          body: 'test-body',
          rawPayload: {},
        }),
      } satisfies NotificationClickEvent;

      eventManager.addEventListener(NOTIFICATION_CLICKED, handler);

      const callback = getCallback(NOTIFICATION_CLICKED);
      callback!(payload);

      expect(handler).toHaveBeenCalledWith(payload);
    });
  });

  describe('integration scenarios', () => {
    test('should handle add and remove listener lifecycle', () => {
      const handler1 = vi.fn();
      const handler2 = vi.fn();

      // Add handlers
      eventManager.addEventListener(PERMISSION_CHANGED, handler1);
      eventManager.addEventListener(PERMISSION_CHANGED, handler2);

      // Trigger event
      const callback = getCallback(PERMISSION_CHANGED);
      const payload = getRawPermissionChangedPayload(true);
      callback!(payload);

      expect(handler1).toHaveBeenCalledWith(true);
      expect(handler2).toHaveBeenCalledWith(true);

      // Remove one handler
      eventManager.removeEventListener(PERMISSION_CHANGED, handler1);

      // Reset mocks
      handler1.mockClear();
      handler2.mockClear();

      // Trigger event again
      callback!(getRawPermissionChangedPayload(false));

      expect(handler1).not.toHaveBeenCalled();
      expect(handler2).toHaveBeenCalledWith(false);
    });

    test('should handle complex event type scenarios', () => {
      const permissionHandler = vi.fn();
      const subscriptionHandler = vi.fn();
      const notificationWillDisplayHandler = vi.fn();

      eventManager.addEventListener(PERMISSION_CHANGED, permissionHandler);
      eventManager.addEventListener(SUBSCRIPTION_CHANGED, subscriptionHandler);
      eventManager.addEventListener(
        NOTIFICATION_WILL_DISPLAY,
        notificationWillDisplayHandler,
      );

      // Get callbacks
      const permissionCallback = getCallback(PERMISSION_CHANGED);
      const subscriptionCallback = getCallback(SUBSCRIPTION_CHANGED);
      const notificationCallback = getCallback(NOTIFICATION_WILL_DISPLAY);

      // Trigger different event types
      const permissionPayload = getRawPermissionChangedPayload(true);
      permissionCallback!(permissionPayload);
      subscriptionCallback!(pushChangedPayload);
      notificationCallback!(rawWillDisplayPayload);

      expect(permissionHandler).toHaveBeenCalledWith(true);
      expect(subscriptionHandler).toHaveBeenCalledWith(pushChangedPayload);
      expect(notificationWillDisplayHandler).toHaveBeenCalledWith(
        new NotificationWillDisplayEvent(rawWillDisplayPayload),
      );
    });

    test('should maintain separate handler arrays for different events', () => {
      const handler1 = vi.fn();
      const handler2 = vi.fn();
      const handler3 = vi.fn();

      eventManager.addEventListener(PERMISSION_CHANGED, handler1);
      eventManager.addEventListener(SUBSCRIPTION_CHANGED, handler2);
      eventManager.addEventListener(USER_STATE_CHANGED, handler3);

      const permissionArray =
        eventManager['eventListenerArrayMap'].get(PERMISSION_CHANGED);
      const subscriptionArray =
        eventManager['eventListenerArrayMap'].get(SUBSCRIPTION_CHANGED);
      const userStateArray =
        eventManager['eventListenerArrayMap'].get(USER_STATE_CHANGED);

      expect(permissionArray).toEqual([handler1]);
      expect(subscriptionArray).toEqual([handler2]);
      expect(userStateArray).toEqual([handler3]);
      expect(permissionArray).not.toEqual(subscriptionArray);
    });

    test('should handle multiple sequential add and remove operations', () => {
      const handler1 = vi.fn();
      const handler2 = vi.fn();
      const handler3 = vi.fn();

      eventManager.addEventListener(SUBSCRIPTION_CHANGED, handler1);
      eventManager.addEventListener(SUBSCRIPTION_CHANGED, handler2);
      eventManager.addEventListener(SUBSCRIPTION_CHANGED, handler3);

      const callback = getCallback(SUBSCRIPTION_CHANGED);

      callback!(pushChangedPayload);
      expect(handler1).toHaveBeenCalledWith(pushChangedPayload);
      expect(handler2).toHaveBeenCalledWith(pushChangedPayload);
      expect(handler3).toHaveBeenCalledWith(pushChangedPayload);

      eventManager.removeEventListener(SUBSCRIPTION_CHANGED, handler2);
      handler1.mockClear();
      handler2.mockClear();
      handler3.mockClear();

      callback!(pushChangedPayload);
      expect(handler1).toHaveBeenCalledWith(pushChangedPayload);
      expect(handler2).not.toHaveBeenCalled();
      expect(handler3).toHaveBeenCalledWith(pushChangedPayload);
    });
  });
});

// helper payloads
const getRawPermissionChangedPayload = (permission: boolean) => ({
  permission: permission,
});

const rawWillDisplayPayload = new OSNotification({
  notificationId: 'test-id',
  body: 'test-body',
  rawPayload: {},
});

const pushChangedPayload = {
  previous: {
    id: 'previous-id',
    token: 'previous-token',
    optedIn: false,
  },
  current: {
    id: 'current-id',
    token: 'current-token',
    optedIn: true,
  },
} satisfies PushSubscriptionChangedState;
