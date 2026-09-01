import NativeOneSignal from '../NativeOneSignal';
import OSNotification from '../OSNotification';
const RNOneSignal = NativeOneSignal;

export default class NotificationWillDisplayEvent {
  public notification: OSNotification;
  private defaultPrevented = false;

  constructor(displayEvent: OSNotification) {
    this.notification = new OSNotification(displayEvent);
  }

  preventDefault(): void {
    this.defaultPrevented = true;
    RNOneSignal.preventDefault(this.notification.notificationId);
  }

  getNotification(): OSNotification {
    return this.notification;
  }

  isDefaultPrevented(): boolean {
    return this.defaultPrevented;
  }
}
