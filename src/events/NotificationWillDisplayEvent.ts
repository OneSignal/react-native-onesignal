import NativeOneSignal from '../NativeOneSignal';
import OSNotification from '../OSNotification';
const RNOneSignal = NativeOneSignal;

const displayedNotifications = new WeakSet<OSNotification>();

class ForegroundNotification extends OSNotification {
  display(): void {
    if (displayedNotifications.has(this)) {
      return;
    }
    displayedNotifications.add(this);
    super.display();
  }
}

export default class NotificationWillDisplayEvent {
  public notification: OSNotification;
  private defaultPrevented = false;

  constructor(displayEvent: OSNotification) {
    this.notification = new ForegroundNotification(displayEvent);
  }

  /** This must be called synchronously while the foreground listener is running. */
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

  isDisplayRequested(): boolean {
    return displayedNotifications.has(this.notification);
  }
}
