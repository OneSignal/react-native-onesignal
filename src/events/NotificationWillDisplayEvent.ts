import NativeOneSignal from '../NativeOneSignal';
import OSNotification from '../OSNotification';
const RNOneSignal = NativeOneSignal;

export default class NotificationWillDisplayEvent {
  public notification: OSNotification;

  constructor(displayEvent: OSNotification) {
    this.notification = new OSNotification(displayEvent);
  }

  preventDefault(): void {
    RNOneSignal.preventDefault(this.notification.notificationId);
  }

  getNotification(): OSNotification {
    return this.notification;
  }
}
