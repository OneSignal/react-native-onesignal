import { NativeModules, Platform } from 'react-native';
const RNOneSignal = NativeModules.OneSignal;

export default class NotificationReceivedEvent {
    constructor(payload){
        if (Platform.OS === 'android') {
            const { notification }= payload;
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
            this.body = payload.body;
            this.sound = payload.sound;
            this.title = payload.title;
            this.rawPayload = payload.rawPayload;
            this.actionButtons = payload.actionButtons;
            this.mutableContent = payload.mutableContent;
            this.notificationId = payload.notificationId;
        }
    }

    complete(notificationReceivedEvent) {
        if (!notificationReceivedEvent) {
            return;
        }

        RNOneSignal.completeNotificationJob(notificationReceivedEvent.notificationId);
    }
}