/**
 * The setup options for `OneSignal.LiveActivities.setupDefault`.
 */
export type LiveActivitySetupOptions = {
  /**
   * When true, OneSignal will listen for pushToStart tokens for the `OneSignalLiveActivityAttributes` structure.
   */
  enablePushToStart: boolean;

  /**
   * When true, OneSignal will listen for pushToUpdate  tokens for each start live activity that uses the
   * `OneSignalLiveActivityAttributes` structure.
   */
  enablePushToUpdate: boolean;
};
