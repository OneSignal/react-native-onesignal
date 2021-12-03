import NotificationReceivedEvent from "../NotificationReceivedEvent";
import OSNotification from "../OSNotification";
import { InAppMessageAction, InAppMessageLifecycleHandlerObject } from "./InAppMessage";
import { ChangeEvent, ObserverChangeEvent } from "./Subscription";

export type HandlerEvent = NotificationReceivedEvent | OpenedEvent | InAppMessageAction | InAppMessageLifecycleHandlerObject["onWillDisplayInAppMessage"] | InAppMessageLifecycleHandlerObject["onDidDisplayInAppMessage"] | InAppMessageLifecycleHandlerObject["onWillDismissInAppMessage"] | InAppMessageLifecycleHandlerObject["onDidDismissInAppMessage"]

export type OSEvent = ChangeEvent<ObserverChangeEvent> | HandlerEvent 

// 0 = NotificationClicked, 1 = ButtonClicked
export type OpenedEventActionType = 0 | 1;

export interface OpenedEvent {
    action          : OpenedEventAction;
    notification    : OSNotification;
}

export interface OpenedEventAction {
    type : OpenedEventActionType
}
