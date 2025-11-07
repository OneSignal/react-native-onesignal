import { NativeModules, Platform } from 'react-native';
import OSNotification, { type BaseNotificationData } from './OSNotification';

const mockRNOneSignal = NativeModules.OneSignal;
const mockPlatform = Platform;

describe('OSNotification', () => {
  const baseNotificationData: BaseNotificationData = {
    body: 'Test notification body',
    sound: 'default',
    title: 'Test Title',
    launchURL: 'https://example.com',
    rawPayload: { key: 'value' },
    actionButtons: [{ id: 'btn1', text: 'Button 1' }],
    additionalData: { custom: 'data' },
    notificationId: 'test-notification-id',
  };

  beforeEach(() => {
    mockPlatform.OS = 'ios';
    mockRNOneSignal.displayNotification.mockClear();
  });

  describe('constructor', () => {
    test('should initialize common properties', () => {
      const notification = new OSNotification(baseNotificationData);

      expect(notification.body).toBe('Test notification body');
      expect(notification.sound).toBe('default');
      expect(notification.title).toBe('Test Title');
      expect(notification.launchURL).toBe('https://example.com');
      expect(notification.rawPayload).toEqual({ key: 'value' });
      expect(notification.actionButtons).toEqual([
        { id: 'btn1', text: 'Button 1' },
      ]);
      expect(notification.additionalData).toEqual({ custom: 'data' });
      expect(notification.notificationId).toBe('test-notification-id');
    });

    test('should initialize with optional common properties as undefined', () => {
      const notificationData = {
        body: 'Test body',
        rawPayload: '',
        notificationId: 'id-123',
      };
      const notification = new OSNotification(notificationData);

      expect(notification.body).toBe('Test body');
      expect(notification.sound).toBeUndefined();
      expect(notification.title).toBeUndefined();
      expect(notification.launchURL).toBeUndefined();
      expect(notification.actionButtons).toBeUndefined();
      expect(notification.additionalData).toBeUndefined();
    });

    describe('Android-specific properties', () => {
      beforeEach(() => {
        mockPlatform.OS = 'android';
      });

      test('should initialize Android-specific properties on Android platform', () => {
        const androidData = {
          ...baseNotificationData,
          groupKey: 'group-1',
          groupMessage: 'group message',
          ledColor: 'FFFF0000',
          priority: 2,
          smallIcon: 'icon_small',
          largeIcon: 'icon_large',
          bigPicture: 'image_url',
          collapseId: 'collapse-1',
          fromProjectNumber: '123456789',
          smallIconAccentColor: 'FFFF0000',
          lockScreenVisibility: '1',
          androidNotificationId: 456,
        };
        const notification = new OSNotification(androidData);

        expect(notification.groupKey).toBe('group-1');
        expect(notification.groupMessage).toBe('group message');
        expect(notification.ledColor).toBe('FFFF0000');
        expect(notification.priority).toBe(2);
        expect(notification.smallIcon).toBe('icon_small');
        expect(notification.largeIcon).toBe('icon_large');
        expect(notification.bigPicture).toBe('image_url');
        expect(notification.collapseId).toBe('collapse-1');
        expect(notification.fromProjectNumber).toBe('123456789');
        expect(notification.smallIconAccentColor).toBe('FFFF0000');
        expect(notification.lockScreenVisibility).toBe('1');
        expect(notification.androidNotificationId).toBe(456);
      });

      test('should not set iOS-specific properties on Android', () => {
        const notification = new OSNotification(baseNotificationData);

        expect(notification.badge).toBeUndefined();
        expect(notification.badgeIncrement).toBeUndefined();
        expect(notification.category).toBeUndefined();
        expect(notification.threadId).toBeUndefined();
        expect(notification.subtitle).toBeUndefined();
        expect(notification.templateId).toBeUndefined();
        expect(notification.templateName).toBeUndefined();
        expect(notification.attachments).toBeUndefined();
        expect(notification.mutableContent).toBeUndefined();
        expect(notification.contentAvailable).toBeUndefined();
        expect(notification.relevanceScore).toBeUndefined();
        expect(notification.interruptionLevel).toBeUndefined();
      });
    });

    describe('iOS-specific properties', () => {
      beforeEach(() => {
        mockPlatform.OS = 'ios';
      });

      test('should initialize iOS-specific properties on iOS platform', () => {
        const iosData = {
          ...baseNotificationData,
          badge: '1',
          badgeIncrement: '5',
          category: 'NOTIFICATION_CATEGORY',
          threadId: 'thread-123',
          subtitle: 'Test Subtitle',
          templateId: 'template-1',
          templateName: 'template-name',
          attachments: { key: 'attachment-value' },
          mutableContent: true,
          contentAvailable: '1',
          relevanceScore: 0.9,
          interruptionLevel: 'timeSensitive',
        };
        const notification = new OSNotification(iosData);

        expect(notification.badge).toBe('1');
        expect(notification.badgeIncrement).toBe('5');
        expect(notification.category).toBe('NOTIFICATION_CATEGORY');
        expect(notification.threadId).toBe('thread-123');
        expect(notification.subtitle).toBe('Test Subtitle');
        expect(notification.templateId).toBe('template-1');
        expect(notification.templateName).toBe('template-name');
        expect(notification.attachments).toEqual({ key: 'attachment-value' });
        expect(notification.mutableContent).toBe(true);
        expect(notification.contentAvailable).toBe('1');
        expect(notification.relevanceScore).toBe(0.9);
        expect(notification.interruptionLevel).toBe('timeSensitive');
      });

      test('should not set Android-specific properties on iOS', () => {
        const notification = new OSNotification(baseNotificationData);

        expect(notification.groupKey).toBeUndefined();
        expect(notification.groupMessage).toBeUndefined();
        expect(notification.ledColor).toBeUndefined();
        expect(notification.priority).toBeUndefined();
        expect(notification.smallIcon).toBeUndefined();
        expect(notification.largeIcon).toBeUndefined();
        expect(notification.bigPicture).toBeUndefined();
        expect(notification.collapseId).toBeUndefined();
        expect(notification.fromProjectNumber).toBeUndefined();
        expect(notification.smallIconAccentColor).toBeUndefined();
        expect(notification.lockScreenVisibility).toBeUndefined();
        expect(notification.androidNotificationId).toBeUndefined();
      });
    });
  });

  describe('display', () => {
    test('should call native displayNotification with notificationId', () => {
      const notification = new OSNotification(baseNotificationData);
      notification.display();

      expect(mockRNOneSignal.displayNotification).toHaveBeenCalledWith(
        'test-notification-id',
      );
    });

    test('should display notification with different notificationId', () => {
      const notificationID = 'custom-id-789';
      const notification = new OSNotification({
        ...baseNotificationData,
        notificationId: notificationID,
      });
      notification.display();

      expect(mockRNOneSignal.displayNotification).toHaveBeenCalledWith(
        notificationID,
      );
    });

    test('should return undefined', () => {
      const notification = new OSNotification(baseNotificationData);
      const result = notification.display();

      expect(result).toBeUndefined();
    });
  });

  describe('rawPayload types', () => {
    test('should accept object as rawPayload', () => {
      const notificationData = {
        ...baseNotificationData,
        rawPayload: { key: 'value', nested: { key: 'value' } },
      };
      const notification = new OSNotification(notificationData);

      expect(notification.rawPayload).toEqual({
        key: 'value',
        nested: { key: 'value' },
      });
    });

    test('should accept string as rawPayload', () => {
      const notificationData = {
        ...baseNotificationData,
        rawPayload: '{"key":"value"}',
      };
      const notification = new OSNotification(notificationData);

      expect(notification.rawPayload).toBe('{"key":"value"}');
    });

    test('should accept empty object as rawPayload', () => {
      const notificationData = {
        ...baseNotificationData,
        rawPayload: {},
      };
      const notification = new OSNotification(notificationData);

      expect(notification.rawPayload).toEqual({});
    });

    test('should accept empty string as rawPayload', () => {
      const notificationData = {
        ...baseNotificationData,
        rawPayload: '',
      };
      const notification = new OSNotification(notificationData);

      expect(notification.rawPayload).toBe('');
    });
  });
});
