export type InAppMessageEventName =
  | 'click'
  | 'willDisplay'
  | 'didDisplay'
  | 'willDismiss'
  | 'didDismiss';

export type InAppMessageEventTypeMap = {
  click: InAppMessageClickEvent;
  willDisplay: InAppMessageWillDisplayEvent;
  didDisplay: InAppMessageDidDisplayEvent;
  willDismiss: InAppMessageWillDismissEvent;
  didDismiss: InAppMessageDidDismissEvent;
};

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
