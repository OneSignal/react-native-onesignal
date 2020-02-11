export interface PermissionsInput {
  alert?: boolean | 0 | 1
  badge?: boolean | 0 | 1
  sound?: boolean | 0 | 1
}

export interface PermissionsOutput {
  alert: 0 | 1
  badge: 0 | 1
  sound: 0 | 1
}

export interface Settings {
  /** Determines if the application automatically prompts the user for permission to send push notification the first time the application opens. */
  kOSSettingsKeyAutoPrompt?: boolean

  /** Determines if the application opens push notification URL's in an in-app web browser view, or exits the app and opens the URL in Safari. */
  kOSSettingsKeyInAppLaunchURL?: boolean

  /** Determines if the app will pop up an alert view to ask the user if they want to open a URL. If this setting is `false`, the application will immediately open the web browser when the user taps a notification with a launch URL. */
  kOSSSettingsKeyPromptBeforeOpeningPushURL?: boolean

  /**
   * Determines how the app will display push notifications.
   *
   * - `0` = None: When your app is open, OneSignal will not display a notification (it will be up to your app to provide a custom UI to display it)
   * - `1` = In App Alert: Notifications will display as a popup
   * - `2` = Notification: Notifications will display as normal notifications.
   */
  kOSSettingsKeyInFocusDisplayOption?: 0 | 1 | 2
}

export default class OneSignal {
  /** Initializes the SDK. Accepts an OneSignal App Id and optional initialization parameters for arguments. */
  static init(appId: string, settings?: Settings): void

  /**
   * Allows you to delay the initialization of the SDK until the user provides privacy consent. The SDK will not be fully initialized until the `provideUserConsent(true)` method is called.
   *
   * If you set this to be `true`, the SDK will not fully initialize until consent is provided. You can still call OneSignal methods, but nothing will happen, and the user will not be registered for push notifications.
   */
  static setRequiresUserPrivacyConsent(required: boolean): void

  /** If your application is set to require the user's privacy consent, you can provide this consent using this method. Until you call `provideUserConsent(true)`, the SDK will not fully initialize and will not send any data to OneSignal. */
  static provideUserConsent(granted: boolean): void

  /** See what push permissions are currently enabled. callback will be invoked with a permissions object (currently supported only on iOS). */
  static checkPermissions(callback: (permissions: PermissionsOutput) => void): void

  /** We exposed the requestPermissions method (currently supported only on iOS). */
  static requestPermissions(permissions: PermissionsInput): void

  /** We exposed the tags API of OneSignal to allow you to target users with notification later. */
  static sendTag(key: string, value: string): void

  /** We exposed the tags API of OneSignal to allow you to target users with notification later. */
  static sendTags(tags: Record<string, string>): void

  /** We exposed the tags API of OneSignal to allow you to target users with notification later. */
  static getTags(next: (tags: Record<string, string>) => void): void

  /** We exposed the tags API of OneSignal to allow you to target users with notification later. */
  static deleteTag(key: string): void
}
