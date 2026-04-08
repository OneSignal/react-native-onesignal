import { beforeEach, describe, expect, test, vi } from 'vite-plus/test';

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
import EventManager from './EventManager';
import NotificationWillDisplayEvent from './NotificationWillDisplayEvent';

function createMockNativeModule() {
  const callbacks = new Map<string, (payload: unknown) => void>();

  const makeEmitter = (name: string) =>
    vi.fn((cb: (payload: unknown) => void) => {
      callbacks.set(name, cb);
      return { remove: vi.fn() };
    });

  const module = {
    onPermissionChanged: makeEmitter('onPermissionChanged'),
    onSubscriptionChanged: makeEmitter('onSubscriptionChanged'),
    onUserStateChanged: makeEmitter('onUserStateChanged'),
    onNotificationWillDisplay: makeEmitter('onNotificationWillDisplay'),
    onNotificationClicked: makeEmitter('onNotificationClicked'),
    onInAppMessageClicked: makeEmitter('onInAppMessageClicked'),
    onInAppMessageWillDisplay: makeEmitter('onInAppMessageWillDisplay'),
    onInAppMessageDidDisplay: makeEmitter('onInAppMessageDidDisplay'),
    onInAppMessageWillDismiss: makeEmitter('onInAppMessageWillDismiss'),
    onInAppMessageDidDismiss: makeEmitter('onInAppMessageDidDismiss'),
  };

  return { module, callbacks };
}

describe('EventManager', () => {
  let eventManager: EventManager;
  let mockModule: ReturnType<typeof createMockNativeModule>['module'];
  let callbacks: Map<string, (payload: unknown) => void>;

  beforeEach(() => {
    const mock = createMockNativeModule();
    mockModule = mock.module;
    callbacks = mock.callbacks;
    eventManager = new EventManager(mockModule as never);
  });

  describe('constructor', () => {
    test('should initialize with all required properties', () => {
      expect(eventManager).toBeDefined();
      expect(eventManager['RNOneSignal']).toBe(mockModule);
      expect(eventManager['eventListenerArrayMap']).toBeInstanceOf(Map);
    });
  });

  describe('setupListeners', () => {
    test('should subscribe to all 10 event emitters', () => {
      expect(mockModule.onPermissionChanged).toHaveBeenCalledOnce();
      expect(mockModule.onSubscriptionChanged).toHaveBeenCalledOnce();
      expect(mockModule.onUserStateChanged).toHaveBeenCalledOnce();
      expect(mockModule.onNotificationWillDisplay).toHaveBeenCalledOnce();
      expect(mockModule.onNotificationClicked).toHaveBeenCalledOnce();
      expect(mockModule.onInAppMessageClicked).toHaveBeenCalledOnce();
      expect(mockModule.onInAppMessageWillDisplay).toHaveBeenCalledOnce();
      expect(mockModule.onInAppMessageDidDisplay).toHaveBeenCalledOnce();
      expect(mockModule.onInAppMessageWillDismiss).toHaveBeenCalledOnce();
      expect(mockModule.onInAppMessageDidDismiss).toHaveBeenCalledOnce();

      expect(callbacks.size).toBe(10);
    });

    test('should store native subscriptions', () => {
      const subscriptions = eventManager['nativeSubscriptions'];
      expect(subscriptions.length).toBe(10);
      subscriptions.forEach((sub) => {
        expect(sub).toHaveProperty('remove');
      });
    });

    test('should not setup listeners if RNOneSignal is null', () => {
      const { module: freshModule } = createMockNativeModule();
      new EventManager(null as never);
      expect(freshModule.onPermissionChanged).not.toHaveBeenCalled();
    });

    test('should not crash when event emitters are unavailable (Old Architecture)', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const moduleWithoutEmitters = {} as never;

      expect(() => new EventManager(moduleWithoutEmitters)).not.toThrow();
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Native event emitters are not available'),
      );

      consoleSpy.mockRestore();
    });
  });

  describe('addEventListener', () => {
    test('should add a handler to a new event', () => {
      const handler = vi.fn();
      eventManager.addEventListener(PERMISSION_CHANGED, handler);

      const handlerArray = eventManager['eventListenerArrayMap'].get(PERMISSION_CHANGED);
      expect(handlerArray).toContain(handler);
    });

    test('should add multiple handlers to the same event', () => {
      const handler1 = vi.fn();
      const handler2 = vi.fn();

      eventManager.addEventListener(PERMISSION_CHANGED, handler1);
      eventManager.addEventListener(PERMISSION_CHANGED, handler2);

      const handlerArray = eventManager['eventListenerArrayMap'].get(PERMISSION_CHANGED);
      expect(handlerArray).toContain(handler1);
      expect(handlerArray).toContain(handler2);
      expect(handlerArray?.length).toBe(2);
    });

    test('should add handlers to different events independently', () => {
      const handler1 = vi.fn();
      const handler2 = vi.fn();

      eventManager.addEventListener(PERMISSION_CHANGED, handler1);
      eventManager.addEventListener(SUBSCRIPTION_CHANGED, handler2);

      const handlerArray1 = eventManager['eventListenerArrayMap'].get(PERMISSION_CHANGED);
      const handlerArray2 = eventManager['eventListenerArrayMap'].get(SUBSCRIPTION_CHANGED);

      expect(handlerArray1).toContain(handler1);
      expect(handlerArray2).toContain(handler2);
    });
  });

  describe('removeEventListener', () => {
    test('should remove a handler from an event', () => {
      const handler = vi.fn();
      eventManager.addEventListener(PERMISSION_CHANGED, handler);
      eventManager.removeEventListener(PERMISSION_CHANGED, handler);

      const handlerArray = eventManager['eventListenerArrayMap'].get(PERMISSION_CHANGED);
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

      const handlerArray = eventManager['eventListenerArrayMap'].get(SUBSCRIPTION_CHANGED);
      expect(handlerArray).toContain(handler1);
      expect(handlerArray).not.toContain(handler2);
      expect(handlerArray).toContain(handler3);
      expect(handlerArray?.length).toBe(2);
    });

    test('should do nothing if event does not exist', () => {
      const handler = vi.fn();
      expect(() => {
        // @ts-expect-error testing invalid event name
        eventManager.removeEventListener('non-existent-event', handler);
      }).not.toThrow();
    });

    test('should do nothing if handler is not in the list', () => {
      const handler1 = vi.fn();
      const handler2 = vi.fn();

      eventManager.addEventListener(NOTIFICATION_WILL_DISPLAY, handler1);
      expect(() => {
        eventManager.removeEventListener(NOTIFICATION_WILL_DISPLAY, handler2);
      }).not.toThrow();

      const handlerArray = eventManager['eventListenerArrayMap'].get(NOTIFICATION_WILL_DISPLAY);
      expect(handlerArray).toContain(handler1);
      expect(handlerArray?.length).toBe(1);
    });
  });

  describe('event dispatching', () => {
    test('should handle NOTIFICATION_WILL_DISPLAY events', () => {
      const handler = vi.fn();
      eventManager.addEventListener(NOTIFICATION_WILL_DISPLAY, handler);

      const emitCallback = callbacks.get('onNotificationWillDisplay')!;
      emitCallback(rawWillDisplayPayload);

      expect(handler).toHaveBeenCalled();
      const receivedEvent = handler.mock.calls[0][0];
      expect(receivedEvent).toBeInstanceOf(NotificationWillDisplayEvent);
    });

    test('should handle PERMISSION_CHANGED events with boolean payload', () => {
      const handler = vi.fn();
      eventManager.addEventListener(PERMISSION_CHANGED, handler);

      const emitCallback = callbacks.get('onPermissionChanged')!;
      emitCallback(getRawPermissionChangedPayload(true));

      expect(handler).toHaveBeenCalledWith(true);
    });

    test('should handle generic events with object payload', () => {
      const handler = vi.fn();
      eventManager.addEventListener(SUBSCRIPTION_CHANGED, handler);

      const emitCallback = callbacks.get('onSubscriptionChanged')!;
      emitCallback(pushChangedPayload);

      expect(handler).toHaveBeenCalledWith(pushChangedPayload);
    });

    test('should call all handlers for an event', () => {
      const handler1 = vi.fn();
      const handler2 = vi.fn();
      const handler3 = vi.fn();

      eventManager.addEventListener(USER_STATE_CHANGED, handler1);
      eventManager.addEventListener(USER_STATE_CHANGED, handler2);
      eventManager.addEventListener(USER_STATE_CHANGED, handler3);

      const emitCallback = callbacks.get('onUserStateChanged')!;
      const payload = {
        current: { onesignalId: '123', externalId: '456' },
      } satisfies UserChangedState;
      emitCallback(payload);

      expect(handler1).toHaveBeenCalledWith(payload);
      expect(handler2).toHaveBeenCalledWith(payload);
      expect(handler3).toHaveBeenCalledWith(payload);
    });

    test('should do nothing if no handlers are registered', () => {
      const emitCallback = callbacks.get('onInAppMessageWillDisplay')!;

      expect(() => {
        emitCallback({ message: { messageId: 'msg-123' } });
      }).not.toThrow();
    });

    test('should handle IN_APP_MESSAGE_CLICKED events', () => {
      const handler = vi.fn();
      const payload = {
        message: { messageId: 'msg-123' },
        result: { closingMessage: false, actionId: 'action-1' },
      };

      eventManager.addEventListener(IN_APP_MESSAGE_CLICKED, handler);

      const emitCallback = callbacks.get('onInAppMessageClicked')!;
      emitCallback(payload);

      expect(handler).toHaveBeenCalledWith(payload);
    });

    test('should handle IN_APP_MESSAGE_WILL_DISPLAY events', () => {
      const handler = vi.fn();
      const payload = { message: { messageId: 'msg-123' } };

      eventManager.addEventListener(IN_APP_MESSAGE_WILL_DISPLAY, handler);

      const emitCallback = callbacks.get('onInAppMessageWillDisplay')!;
      emitCallback(payload);

      expect(handler).toHaveBeenCalledWith(payload);
    });

    test('should handle IN_APP_MESSAGE_DID_DISPLAY events', () => {
      const handler = vi.fn();
      const payload = { message: { messageId: 'msg-123' } };

      eventManager.addEventListener(IN_APP_MESSAGE_DID_DISPLAY, handler);

      const emitCallback = callbacks.get('onInAppMessageDidDisplay')!;
      emitCallback(payload);

      expect(handler).toHaveBeenCalledWith(payload);
    });

    test('should handle IN_APP_MESSAGE_WILL_DISMISS events', () => {
      const handler = vi.fn();
      const payload = { message: { messageId: 'msg-123' } };

      eventManager.addEventListener(IN_APP_MESSAGE_WILL_DISMISS, handler);

      const emitCallback = callbacks.get('onInAppMessageWillDismiss')!;
      emitCallback(payload);

      expect(handler).toHaveBeenCalledWith(payload);
    });

    test('should handle IN_APP_MESSAGE_DID_DISMISS events', () => {
      const handler = vi.fn();
      const payload = { message: { messageId: 'msg-123' } };

      eventManager.addEventListener(IN_APP_MESSAGE_DID_DISMISS, handler);

      const emitCallback = callbacks.get('onInAppMessageDidDismiss')!;
      emitCallback(payload);

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

      const emitCallback = callbacks.get('onNotificationClicked')!;
      emitCallback(payload);

      expect(handler).toHaveBeenCalledWith(payload);
    });
  });

  describe('integration scenarios', () => {
    test('should handle add and remove listener lifecycle', () => {
      const handler1 = vi.fn();
      const handler2 = vi.fn();

      eventManager.addEventListener(PERMISSION_CHANGED, handler1);
      eventManager.addEventListener(PERMISSION_CHANGED, handler2);

      const emitCallback = callbacks.get('onPermissionChanged')!;
      emitCallback(getRawPermissionChangedPayload(true));

      expect(handler1).toHaveBeenCalledWith(true);
      expect(handler2).toHaveBeenCalledWith(true);

      eventManager.removeEventListener(PERMISSION_CHANGED, handler1);

      handler1.mockClear();
      handler2.mockClear();

      emitCallback(getRawPermissionChangedPayload(false));

      expect(handler1).not.toHaveBeenCalled();
      expect(handler2).toHaveBeenCalledWith(false);
    });

    test('should handle complex event type scenarios', () => {
      const permissionHandler = vi.fn();
      const subscriptionHandler = vi.fn();
      const notificationWillDisplayHandler = vi.fn();

      eventManager.addEventListener(PERMISSION_CHANGED, permissionHandler);
      eventManager.addEventListener(SUBSCRIPTION_CHANGED, subscriptionHandler);
      eventManager.addEventListener(NOTIFICATION_WILL_DISPLAY, notificationWillDisplayHandler);

      callbacks.get('onPermissionChanged')!(getRawPermissionChangedPayload(true));
      callbacks.get('onSubscriptionChanged')!(pushChangedPayload);
      callbacks.get('onNotificationWillDisplay')!(rawWillDisplayPayload);

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

      const permissionArray = eventManager['eventListenerArrayMap'].get(PERMISSION_CHANGED);
      const subscriptionArray = eventManager['eventListenerArrayMap'].get(SUBSCRIPTION_CHANGED);
      const userStateArray = eventManager['eventListenerArrayMap'].get(USER_STATE_CHANGED);

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

      const emitCallback = callbacks.get('onSubscriptionChanged')!;

      emitCallback(pushChangedPayload);
      expect(handler1).toHaveBeenCalledWith(pushChangedPayload);
      expect(handler2).toHaveBeenCalledWith(pushChangedPayload);
      expect(handler3).toHaveBeenCalledWith(pushChangedPayload);

      eventManager.removeEventListener(SUBSCRIPTION_CHANGED, handler2);
      handler1.mockClear();
      handler2.mockClear();
      handler3.mockClear();

      emitCallback(pushChangedPayload);
      expect(handler1).toHaveBeenCalledWith(pushChangedPayload);
      expect(handler2).not.toHaveBeenCalled();
      expect(handler3).toHaveBeenCalledWith(pushChangedPayload);
    });
  });
});

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
