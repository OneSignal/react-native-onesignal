import { NativeModules } from 'react-native';
import OSNotification from '../OSNotification';
const RNOneSignal = NativeModules.OneSignal;

export default class NotificationWillDisplayEvent {
  public notification: OSNotification;

  constructor(displayEvent: OSNotification) {
    this.notification = new OSNotification(displayEvent);
  }

  preventDefault(): void {
    RNOneSignal.preventDefault(this.notification.notificationId);
    return;
  }

  getNotification(): OSNotification {
    return this.notification;
  }
}
