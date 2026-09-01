import NativeOneSignal from '../NativeOneSignal';
import OSNotification from '../OSNotification';
const RNOneSignal = NativeOneSignal;

const displayedNotifications = new WeakSet<OSNotification>();
const preventedEvents = new WeakSet<NotificationWillDisplayEvent>();

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

  constructor(displayEvent: OSNotification) {
    this.notification = new ForegroundNotification(displayEvent);
  }

  /** This must be called synchronously while the foreground listener is running. */
  preventDefault(): void {
    preventedEvents.add(this);
    RNOneSignal.preventDefault(this.notification.notificationId);
  }

  getNotification(): OSNotification {
    return this.notification;
  }
}

export function isDefaultPrevented(event: NotificationWillDisplayEvent): boolean {
  return preventedEvents.has(event);
}

export function isDisplayRequested(event: NotificationWillDisplayEvent): boolean {
  return displayedNotifications.has(event.notification);
}
