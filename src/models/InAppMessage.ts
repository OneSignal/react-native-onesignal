export interface InAppMessage {
  messageId: string;
}

export interface InAppMessageAction {
  closes_message: boolean;
  first_click: boolean;
  click_name?: string;
  click_url?: string;
  outcomes?: object[];
  tags?: object;
}

export interface InAppMessageLifecycleHandlerObject {
  onWillDisplayInAppMessage?: (message: InAppMessage) => void;
  onDidDisplayInAppMessage?: (message: InAppMessage) => void;
  onWillDismissInAppMessage?: (message: InAppMessage) => void;
  onDidDismissInAppMessage?: (message: InAppMessage) => void;
}
