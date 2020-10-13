import { NativeModules, Platform } from 'react-native';
const RNOneSignal = NativeModules.OneSignal;

export default class NotificationReceivedEvent {
    constructor(receivedEvent){
        this.body = receivedEvent.body;
        this.sound = receivedEvent.sound;
        this.title = receivedEvent.title;
        this.launchURL = receivedEvent.launchURL;
        this.rawPayload = receivedEvent.rawPayload;
        this.actionButtons = receivedEvent.actionButtons;
        this.additionalData = receivedEvent.additionalData;
        this.notificationId = receivedEvent.notificationId;

        if (Platform.OS === 'android') {
            this.groupKey = receivedEvent.groupKey;
            this.ledColor = receivedEvent.ledColor;
            this.priority = receivedEvent.priority;
            this.smallIcon = receivedEvent.smallIcon;
            this.largeIcon = receivedEvent.largeIcon;
            this.bigPicture = receivedEvent.bigPicture;
            this.collapseId = receivedEvent.collapseId;
            this.groupMessage = receivedEvent.groupMessage;
            this.fromProjectNumber = receivedEvent.fromProjectNumber;
            this.smallIconAccentColor = receivedEvent.smallIconAccentColor;
            this.lockScreenVisibility = receivedEvent.lockScreenVisibililty;
            this.androidNotificationId = receivedEvent.androidNotificationId;
        }

        if (Platform.OS = 'ios') {
            this.badge = receivedEvent.badge;
            this.category = receivedEvent.category;
            this.threadId = receivedEvent.threadId;
            this.subtitle = receivedEvent.subtitle;
            this.templateId = receivedEvent.templateId;
            this.attachments = receivedEvent.attachments;
            this.templateName = receivedEvent.templateName;
            this.actionButtons = receivedEvent.actionButtons;
            this.mutableContent = receivedEvent.mutableContent;
            this.badgeIncrement = receivedEvent.badgeIncrement;
            this.contentAvailable = receivedEvent.contentAvailable;
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
        // iOS & Android: the notification id is associated with the native-side complete handler / completion block
        RNOneSignal.completeNotificationEvent(notificationReceivedEvent.notificationId, true);
    }
}