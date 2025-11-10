import type { EventListenerMap } from '../events/EventManager';

export type InAppMessageEventName =
  | 'click'
  | 'willDisplay'
  | 'didDisplay'
  | 'willDismiss'
  | 'didDismiss';

export type InAppMessageListeners =
  | ['click', EventListenerMap['OneSignal-inAppMessageClicked']]
  | ['willDisplay', EventListenerMap['OneSignal-inAppMessageWillDisplay']]
  | ['didDisplay', EventListenerMap['OneSignal-inAppMessageDidDisplay']]
  | ['willDismiss', EventListenerMap['OneSignal-inAppMessageWillDismiss']]
  | ['didDismiss', EventListenerMap['OneSignal-inAppMessageDidDismiss']];

export interface InAppMessage {
  messageId: string;
}

export interface InAppMessageClickEvent {
  message: InAppMessage;
  result: InAppMessageClickResult;
}

export interface InAppMessageClickResult {
  closingMessage: boolean;
  actionId?: string;
  url?: string;
  urlTarget?: string;
}

export interface InAppMessageWillDisplayEvent {
  message: InAppMessage;
}

export interface InAppMessageDidDisplayEvent {
  message: InAppMessage;
}

export interface InAppMessageWillDismissEvent {
  message: InAppMessage;
}

export interface InAppMessageDidDismissEvent {
  message: InAppMessage;
}
