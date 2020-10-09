import { NativeModules, Platform } from 'react-native';
const RNOneSignal = NativeModules.OneSignal;

export default class NotificationReceivedEvent {
    constructor(receivedEvent){
        if (Platform.OS === 'android') {
            const { notification }= receivedEvent;
            this.body = notification.body;
            this.title = notification.title;
            this.priority = notification.priority;
            this.launchURL = notification.launchURL;
            this.rawPayload = notification.rawPayload;
            this.groupMessage = notification.groupMessage;
            this.actionButtons = notification.actionButtons;
            this.notificationId = notification.notificationId;
            this.additionalData = notification.additionalData;
            this.fromProjectNumber = notification.fromProjectNumber;
            this.lockScreenVisibility = notification.lockScreenVisibililty;
            this.androidNotificationId = notification.androidNotificationId;
        }

        if (Platform.OS = 'ios') {
            this.body = receivedEvent.body;
            this.sound = receivedEvent.sound;
            this.title = receivedEvent.title;
            this.rawPayload = receivedEvent.rawPayload;
            this.actionButtons = receivedEvent.actionButtons;
            this.mutableContent = receivedEvent.mutableContent;
            this.notificationId = receivedEvent.notificationId;
        }
    }

    complete(notificationReceivedEvent) {
        if (!notificationReceivedEvent) {
            // if the notificationReceivedEvent is null, we want to call the native-side
            // complete/completion with null to silence the notification
            RNOneSignal.completeNotificationEvent(this.notificationId, false);
            return;
        }

        // if the notificationReceivedEvent is not null, we want to pass the specific event
        // future: Android side: make the notification modifiable
        // the notification id is associated with the native-side complete/completion handler/block
        RNOneSignal.completeNotificationEvent(notificationReceivedEvent.notificationId, true);
    }
}