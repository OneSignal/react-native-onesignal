import { NativeModules } from 'react-native';
import OSNotification, { type BaseNotificationData } from '../OSNotification';
import NotificationWillDisplayEvent from './NotificationWillDisplayEvent';

const mockRNOneSignal = NativeModules.OneSignal;

describe('NotificationWillDisplayEvent', () => {
  const notificationId = 'test-notification-id';
  const baseNotificationData: BaseNotificationData = {
    body: 'Test notification body',
    sound: 'default',
    title: 'Test Title',
    launchURL: 'https://example.com',
    rawPayload: { key: 'value' },
    actionButtons: [{ id: 'btn1', text: 'Button 1' }],
    additionalData: { custom: 'data' },
    notificationId,
  };

  describe('constructor', () => {
    test('should initialize with OSNotification instance', () => {
      const notification = new OSNotification(baseNotificationData);
      const event = new NotificationWillDisplayEvent(notification);

      expect(event.notification).toBeInstanceOf(OSNotification);
      expect(event.notification.notificationId).toBe(notificationId);
      expect(event.notification.body).toBe('Test notification body');
      expect(event.notification.title).toBe('Test Title');
    });

    test('should create a new OSNotification instance from the provided notification', () => {
      const notification = new OSNotification(baseNotificationData);
      const event = new NotificationWillDisplayEvent(notification);

      expect(event.notification).not.toBe(notification);
      expect(event.notification.notificationId).toBe(notificationId);
      expect(event.notification.body).toBe(notification.body);
    });

    test('should initialize with notification containing all optional fields', () => {
      const fullData = {
        ...baseNotificationData,
        sound: 'custom-sound',
        launchURL: 'https://example.com/launch',
        actionButtons: [
          { id: 'btn1', text: 'Button 1' },
          { id: 'btn2', text: 'Button 2' },
        ],
        additionalData: { key1: 'value1', key2: 'value2' },
      };
      const notification = new OSNotification(fullData);
      const event = new NotificationWillDisplayEvent(notification);

      expect(event.notification.sound).toBe('custom-sound');
      expect(event.notification.launchURL).toBe('https://example.com/launch');
      expect(event.notification.actionButtons).toHaveLength(2);
      expect(event.notification.additionalData).toEqual({
        key1: 'value1',
        key2: 'value2',
      });
    });
  });

  describe('preventDefault', () => {
    test('should call native preventDefault with notificationId', () => {
      const notification = new OSNotification(baseNotificationData);
      const event = new NotificationWillDisplayEvent(notification);
      const result = event.preventDefault();

      expect(mockRNOneSignal.preventDefault).toHaveBeenCalledWith(
        notificationId,
      );
      expect(result).toBeUndefined();
    });

    test('should allow multiple calls to preventDefault', () => {
      const notification = new OSNotification(baseNotificationData);
      const event = new NotificationWillDisplayEvent(notification);

      event.preventDefault();
      event.preventDefault();
      event.preventDefault();

      expect(mockRNOneSignal.preventDefault).toHaveBeenCalledTimes(3);
      expect(mockRNOneSignal.preventDefault).toHaveBeenCalledWith(
        'test-notification-id',
      );
    });
  });

  describe('getNotification', () => {
    test('should return the notification instance', () => {
      const notification = new OSNotification(baseNotificationData);
      const event = new NotificationWillDisplayEvent(notification);
      const returnedNotification = event.getNotification();

      expect(returnedNotification).toBe(event.notification);
      expect(returnedNotification).toBeInstanceOf(OSNotification);

      expect(returnedNotification.notificationId).toBe('test-notification-id');
      expect(returnedNotification.body).toBe('Test notification body');
      expect(returnedNotification.title).toBe('Test Title');
      expect(returnedNotification.sound).toBe('default');
      expect(returnedNotification.rawPayload).toEqual({ key: 'value' });
    });
  });
});
