# React Native v5.0.0 Migration Guide

#### ⚠️ Migration Advisory for current OneSignal customers

Our new [user-centric APIs and v5.x.x SDKs](https://onesignal.com/blog/unify-your-users-across-channels-and-devices/) offer an improved user and data management experience. However, they may not be at 1:1 feature parity with our previous versions yet.

If you are migrating an existing app, we suggest using iOS and Android’s Phased Rollout capabilities to ensure that there are no unexpected issues or edge cases. Here is the documentation for each:

- [iOS Phased Rollout](https://developer.apple.com/help/app-store-connect/update-your-app/release-a-version-update-in-phases/)
- [Google Play Staged Rollouts](https://support.google.com/googleplay/android-developer/answer/6346149?hl=en)

If you run into any challenges or have concerns, please contact our support team at support@onesignal.com

# Intro

In this release, we are making a significant shift from a device-centered model to a user-centered model. A user-centered model allows for more powerful omni-channel integrations within the OneSignal platform.

To facilitate this change, the `externalId` approach for identifying users is being replaced by the `login` and `logout` methods. In addition, the SDK now makes use of namespaces such as `User`, `Notifications`, and `InAppMessages` to better separate code.

This migration guide will walk you through the React Native SDK changes as a result of this shift.

# Overview

Under the user-centered model, the concept of a "player" is being replaced with three new concepts: **users**, **subscriptions**, and **aliases**.

## Users

A user is a new concept which is meant to represent your end-user. A user has zero or more subscriptions and can be uniquely identified by one or more aliases. In addition to subscriptions, a user can have **data tags** which allows for user attribution.

## Subscription

A subscription refers to the method in which an end-user can receive various communications sent by OneSignal, including push notifications, SMS, and email. In previous versions of the OneSignal platform, each of these channels was referred to as a “player”. A subscription is in fact identical to the legacy “player” concept. Each subscription has a **subscription_id** (previously, player_id) to uniquely identify that communication channel.

## Aliases

Aliases are a concept evolved from [external user ids](https://documentation.onesignal.com/docs/external-user-ids) which allows the unique identification of a user within a OneSignal application. Aliases are a key-value pair made up of an **alias label** (the key) and an **alias id** (the value). The **alias label** can be thought of as a consistent keyword across all users, while the **alias id** is a value specific to each user for that particular label. The combined **alias label** and **alias id** provide uniqueness to successfully identify a user.

OneSignal uses a built-in **alias label** called `external_id` which supports existing use of [external user ids](https://documentation.onesignal.com/docs/external-user-ids). `external_id` is also used as the identification method when a user identifies themselves to the OneSignal SDK via `OneSignal.login`. Multiple aliases can be created for each user to allow for your own application's unique identifier as well as identifiers from other integrated applications.

# Migration Guide (v4 to v5)

The React Native SDK accesses the OneSignal native iOS and Android SDKs. For this update, all SDK versions are aligning across OneSignal’s suite of client SDKs. As such, the native iOS SDK is making the jump from `v3` to `v5`. See existing install instructions [here](https://documentation.onesignal.com/docs/react-native-sdk-setup) for more information.

## iOS
### Notification Service Extension Changes

In your Project Root > ios > Podfile, update the notification service extension:

```
    // 4.x.x
    target 'OneSignalNotificationServiceExtension' do
      pod 'OneSignalXCFramework', '>= 3.0', '< 4.0'
    end

    // 5.x.x
    target 'OneSignalNotificationServiceExtension' do
      pod 'OneSignalXCFramework', '>= 5.0', '< 6.0'
    end
```

Close Xcode. While still in the ios directory, run `pod install --repo-update`.

# API Changes

## Namespaces

The OneSignal SDK has been updated to be more modular in nature. The SDK has been split into namespaces, and functionality previously in the static `OneSignal` class has been moved to the appropriate namespace. The namespaces and how to access them in code are as follows:

| **Namespace**  | **Access Pattern**         |
| -------------- | -------------------------- |
| Debug          | `OneSignal.Debug`          |
| InAppMessages  | `OneSignal.InAppMessages`  |
| LiveActivities | `OneSignal.LiveActivities` |
| Location       | `OneSignal.Location`       |
| Notifications  | `OneSignal.Notifications`  |
| Session        | `OneSignal.Session`        |
| User           | `OneSignal.User`           |

## Initialization

Initialization of the OneSignal SDK is now completed through the `initialize` method. A typical initialization now looks similar to below.

Navigate to your index.ts file, or the first Javascript file that loads with your app.

Replace the following:

```typescript
OneSignal.setAppId('YOUR_ONESIGNAL_APP_ID');
```

To the match the new initialization:

```typescript
OneSignal.initialize('YOUR_ONESIGNAL_APP_ID');
```

**for iOS:** Remove any usages of `setLaunchURLsInApp` as the method and functionality has been removed.

If your integration is **not** user-centric, there is no additional startup code required. A device-scoped user _(please see definition of “**device-scoped user**” below in Glossary)_ is automatically created as part of the push subscription creation, both of which are only accessible from the current device or through the OneSignal dashboard.

If your integration is user-centric, or you want the ability to identify the user beyond the current device, the `login` method should be called to identify the user:

```typescript
OneSignal.login('USER_EXTERNAL_ID');
```

The `login` method will associate the device’s push subscription to the user that can be identified via the alias `externalId=USER_EXTERNAL_ID`. If that user doesn’t already exist, it will be created. If the user does already exist, the user will be updated to own the device’s push subscription. Note that the push subscription for the device will always be transferred to the newly logged in user, as that user is the current owner of that push subscription.

Once (or if) the user is no longer identifiable in your app (i.e. they logged out), the `logout` method should be called:

```typescript
OneSignal.logout();
```

Logging out has the affect of reverting to a device-scoped user, which is the new owner of the device’s push subscription.

## Subscriptions

In previous versions of the SDK, a “player” could have up to one email address and up to one phone number for SMS. In the user-centered model, a user can own the current device’s **Push Subscription** along with the ability to have **zero or more** email subscriptions and **zero or more** SMS subscriptions. Note: If a new user logs in via the `login` method, the previous user will no longer own that push subscription.

### **Push Subscription**

The current device’s push subscription can be retrieved via:

```typescript
const id: string = OneSignal.User.pushSubscription.getPushSubscriptionId();
const token: string = OneSignal.User.pushSubscription.getPushSubscriptionToken();
const optedIn: boolean = OneSignal.User.pushSubscription.getOptedIn();
```

### **Opting In and Out of Push Notifications**

To receive push notifications on the device, call the push subscription’s `optIn()` method. If needed, this method will prompt the user for push notifications permission.

Note: For greater control over prompting for push notification permission, you may use the `OneSignal.Notifications.requestPermission` method detailed below in the API Reference.

```typescript
OneSignal.User.pushSubscription.optIn();
```

If at any point you want the user to stop receiving push notifications on the current device (regardless of system-level permission status), you can use the push subscription to opt out:

```typescript
OneSignal.User.pushSubscription.optOut();
```

To resume receiving of push notifications (driving the native permission prompt if permissions are not available), you can opt back in with the `optIn` method from above.

### **Email/SMS Subscriptions**

Email and/or SMS subscriptions can be added or removed via the following methods. The remove methods will result in a no-op if the specified email or SMS number does not exist on the user within the SDK, and no request will be made.

```typescript
// Add email subscription
OneSignal.User.addEmail('customer@company.com');
// Remove previously added email subscription
OneSignal.User.removeEmail('customer@company.com');

// Add SMS subscription
OneSignal.User.addSms('+15558675309');
// Remove previously added SMS subscription
OneSignal.User.removeSms('+15558675309');
```

# API Reference

Below is a comprehensive reference to the `5.0.0` OneSignal React Native SDK.

## OneSignal

The SDK is still accessible via a `OneSignal` static class. It provides access to higher level functionality and is a gateway to each subspace of the SDK.

| **React Native**                                | **Description**                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| ----------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `OneSignal.initialize("YOUR_ONESIGNAL_APP_ID")` | _Initializes the OneSignal SDK. This should be called during startup of the application._                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `OneSignal.login("USER_EXTERNAL_ID")`      | _Login to OneSignal under the user identified by the [externalId] provided. The act of logging a user into the OneSignal SDK will switch the [user] context to that specific user.<br><br> - If the [externalId] exists, the user will be retrieved and the context will be set from that user information. If operations have already been performed under a device-scoped user, they **_will not_** be applied to the now logged in user (they will be lost).<br> - If the [externalId] does not exist the user, the user will be created and the context set from the current local state. If operations have already been performed under a device-scoped user, those operations **_will_** be applied to the newly created user.<br><br>**_Push Notifications and In App Messaging_**<br>Logging in a new user will automatically transfer the push notification and in app messaging subscription from the current user (if there is one) to the newly logged in user. This is because both push notifications and in-app messages are owned by the device._ |
| `OneSignal.logout()`                       | _Logout the user previously logged in via [login]. The [user] property now references a new device-scoped user. A device-scoped user has no user identity that can later be retrieved, except through this device as long as the app remains installed and the app data is not cleared._                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| `OneSignal.setConsentGiven(true)`               | _Indicates whether privacy consent has been granted. This field is only relevant when the application has opted into data privacy protections. See [requiresPrivacyConsent]._                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| `OneSignal.setConsentRequired(true)`            | _Determines whether a user must consent to privacy prior to their user data being sent up to OneSignal. This should be set to `true` prior to the invocation of `initialize` to ensure compliance._                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    

## Live Activities Namespace

Live Activities are a type of interactive push notification. Apple introduced them in October 2022 to enable iOS apps to provide real-time updates to their users that are visible from the lock screen and the dynamic island.

Please refer to OneSignal’s guide on [Live Activities](https://documentation.onesignal.com/docs/live-activities), the [Live Activities Quickstart](https://documentation.onesignal.com/docs/live-activities-quickstart) tutorial, and the [existing SDK reference](https://documentation.onesignal.com/docs/live-activities-sdk-methods) on Live Activities.

| **React Native**                                                                                       | **Description**                                                                                                                                                                                                                         |
| ------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `OneSignal.LiveActivities.enter("ACTIVITY_ID", "TOKEN")`<br><br>**_See below for usage of callbacks_** | _Entering a Live Activity associates an `activityId` with a live activity temporary push `token` on OneSignal's server. The activityId is then used with the OneSignal REST API to update one or multiple Live Activities at one time._ |
| `OneSignal.LiveActivities.exit("ACTIVITY_ID")`<br><br>**_See below for usage of callbacks_**           | _Exiting a Live activity deletes the association between a customer defined `activityId` with a Live Activity temporary push `token` on OneSignal's server._                                                                            |

```typescript
// Enter a Live Activity
OneSignal.LiveActivities.enter('ACTIVITY_ID', 'TOKEN', (results) => {
  console.log('Results of entering live activity');
  console.log(results);
});

// Exit a Live Activity
OneSignal.LiveActivities.exit('ACTIVITY_ID', (results) => {
  console.log('Results of exiting live activity');
  console.log(results);
});
```

## User Namespace

The User namespace is accessible via `OneSignal.User` and provides access to user-scoped functionality.

| **React Native**                                                                            | **Description**                                                                                                                                                                                                                         |
| ------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `OneSignal.User.setLanguage("en")`                                                          | _Set the 2-character language for this user._                                                                                                                                                                                           |
| `OneSignal.User.addAlias("ALIAS_LABEL", "ALIAS_ID")`                                        | _Set an alias for the current user. If this alias label already exists on this user, it will be overwritten with the new alias id._                                                                                                     |
| `OneSignal.User.addAliases({ALIAS_LABEL_01: "ALIAS_ID_01", ALIAS_LABEL_02: "ALIAS_ID_02"})` | _Set aliases for the current user. If any alias already exists, it will be overwritten to the new values._                                                                                                                              |
| `OneSignal.User.removeAlias("ALIAS_LABEL")`                                                 | _Remove an alias from the current user._                                                                                                                                                                                                |
| `OneSignal.User.removeAliases(["ALIAS_LABEL_01", "ALIAS_LABEL_02"]])`                       | _Remove aliases from the current user._                                                                                                                                                                                                 |
| `OneSignal.User.addEmail("customer@company.com")`                                           | _Add a new email subscription to the current user._                                                                                                                                                                                     |
| `OneSignal.User.removeEmail("customer@company.com")`                                        | _Results in a no-op if the specified email does not exist on the user within the SDK, and no request will be made._                                                                                                                     |
| `OneSignal.User.addSms("+15558675309")`                                                     | _Add a new SMS subscription to the current user._                                                                                                                                                                                       |
| `OneSignal.User.removeSms("+15558675309")`                                                  | _Results in a no-op if the specified phone number does not exist on the user within the SDK, and no request will be made.._                                                                                                             |
| `OneSignal.User.addTag("KEY", "VALUE")`                                                     | _Add a tag for the current user. Tags are key:value pairs used as building blocks for targeting specific users and/or personalizing messages. If the tag key already exists, it will be replaced with the value provided here._         |
| `OneSignal.User.addTags({"KEY_01": "VALUE_01", "KEY_02": "VALUE_02"})`                      | _Add multiple tags for the current user. Tags are key:value pairs used as building blocks for targeting specific users and/or personalizing messages. If the tag key already exists, it will be replaced with the value provided here._ |
| `OneSignal.User.removeTag("KEY")`                                                           | _Remove the data tag with the provided key from the current user._                                                                                                                                                                      |
| `OneSignal.User.removeTags(["KEY_01", "KEY_02"])`                                           | _Remove multiple tags with the provided keys from the current user._                                                                                                                                                                    |
| `OneSignal.User.getTags()`                                                                  | _Returns the local tags for the current user._|
| `OneSignal.User.addEventListener("change", (event: UserChangedState) => void)`<br><br>**_See below for usage_**                                                                  | _Add a User State callback which contains the nullable onesignalId and externalId. The listener will be fired when these values change._|
| `await OneSignal.User.getOnesignalId()`                                                                  | _Returns the OneSignal ID for the current user, which can be null if it is not yet available._|
| `await OneSignal.User.getExternalId()`                                                                  | _Returns the External ID for the current user, which can be null if not set._|

### User State Listener

```typescript
    const listener = (event: UserChangedState) => {
        console.log("User changed: " + (event));
    };

    OneSignal.User.addEventListener("change", listener);
    // Remove the listener
    OneSignal.User.removeEventListener("change", listener);
```

## Push Subscription Namespace

The Push Subscription namespace is accessible via `OneSignal.User.pushSubscription` and provides access to push subscription-scoped functionality.

| **React Native**                                                                                          | **Description**                                                                                                                                                                                                                                                                                                                                                                  |
| --------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `OneSignal.User.pushSubscription.getPushSubscriptionId()`                                                           | _**DEPRECATED**<br>use `getIdAsync`._                                                                                                                                                                                                                                                                                                                                             |
| `OneSignal.User.pushSubscription.getPushSubscriptionToken()`                                                        | _**DEPRECATED**<br>use `getTokenAsync`_                                                                                                                                                                                                                                                                                                                                                       |
| `OneSignal.User.pushSubscription.getOptedIn()`                                                      | _**DEPRECATED**<br>use `getOptedInAsync`_ |
| `await OneSignal.User.pushSubscription.getIdAsync()`                                                           | _The readonly push subscription ID._                                                                                                                                                                                                                                                                                                                                             |
| `await OneSignal.User.pushSubscription.getTokenAsync()`                                                        | _The readonly push token._                                                                                                                                                                                                                                                                                                                                                       |
| `await OneSignal.User.pushSubscription.getOptedInAsync()`                                                      | _Gets a boolean value indicating whether the current user is opted in to push notifications. This returns `true` when the app has notifications permission and `optedOut` is called. **_Note:_** Does not take into account the existence of the subscription ID and push token. This boolean may return `true` but push notifications may still not be received by the user._ |
| `OneSignal.User.pushSubscription.optIn()`                                                                 | _Call this method to receive push notifications on the device or to resume receiving of push notifications after calling `optOut`. If needed, this method will prompt the user for push notifications permission._                                                                                                                                                               |
| `OneSignal.User.pushSubscription.optOut()`                                                                | _If at any point you want the user to stop receiving push notifications on the current device (regardless of system-level permission status), you can call this method to opt out._                                                                                                                                                                                              |
| `OneSignal.User.pushSubscription.addEventListener('change', listener: (event) => void)`<br><br>**_See below for usage_** | _Adds the listener to run when the push subscription changes._                                                                                                                                   |
| `OneSignal.User.pushSubscription.removeEventListener('change', listener)`<br><br>**_See below for usage_**               | _Remove a push subscription listener that has been previously added._                                                                                                                                                                                                                                                                                                            |

### Push Subscription Observer

```typescript
// Create an observer
OneSignal.User.pushSubscription.addEventListener('change', (subscription) => {
  console.log('OneSignal: subscription changed:', subscription);
});

// Removes the previously added observer
OneSignal.User.pushSubscription.removeEventListener('change', subscription);
```

## Session Namespace

The Session namespace is accessible via `OneSignal.Session` and provides access to session-scoped functionality.

| **React Native**                                           | **Description**                                                                          |
| ---------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `OneSignal.Session.addOutcome("OUTCOME_NAME")`             | _Add an outcome with the provided name, captured against the current session._           |
| `OneSignal.Session.addUniqueOutcome("OUTCOME_NAME")`       | _Add a unique outcome with the provided name, captured against the current session._     |
| `OneSignal.Session.addOutcomeWithValue("OUTCOME_NAME", 1)` | _Add an outcome with the provided name and value, captured against the current session._ |

## Notifications Namespace

The Notifications namespace is accessible via `OneSignal.Notifications` and provides access to notification-scoped functionality.

| **React Native**                       | **Description** |
|--------------------------------------- | --------------- |
| `OneSignal.Notifications.hasPermission()`                                                                      | _**DEPRECATED**<br>use `getPermissionAsync()`_                                                                                                                                                                                                                                                                                                                                                                |
| `OneSignal.Notifications.getPermissionAsync()`                                                                      | _Whether this app has push notification permission._                                                                                                                                                                                                                                                                                                                                                                |
| `await OneSignal.Notifications.canRequestPermission()`                                                               | _Whether attempting to request notification permission will show a prompt. Returns `true` if the device has not been prompted for push notification permission already._                                                                                                                                                                                                                                            |
| `await OneSignal.Notifications.permissionNative()`                                                                   | _(ios only) Returns the enum for the native permission of the device. It will be one of: NotDetermined, Denied, Authorized, Provisional (only available in iOS 12), Ephemeral (only available in iOS 14)_                                                                                                                                                                                                           |
| `OneSignal.Notifications.clearAll();`                                                                                | _Removes all OneSignal notifications._                                                                                                                                                                                                                                                                                                                                                                              |
| `OneSignal.Notifications.removeNotification(32432)`                                                      | _(Android only) Cancels a single OneSignal notification based on its Android notification integer ID. Use instead of Android's [android.app.NotificationManager.cancel], otherwise the notification will be restored when your app is restarted._                                                                                                                                                                   |
| `OneSignal.Notifications.removeGroupedNotifications("GROUP_KEY")`                                                    | _(Android only) Cancels a group of OneSignal notifications with the provided group key. Grouping notifications is a OneSignal concept, there is no [android.app.NotificationManager] equivalent._                                                                                                                                                                                                                   |
| `await OneSignal.Notifications.requestPermission(fallbackToSettings: boolean)`<br><br>**_See below for usage_**                                       | _Prompt the user for permission to receive push notifications. This will display the native system prompt to request push notification permission._                                                                                                                                                                                                                                                                 |
| `OneSignal.Notifications.registerForProvisionalAuthorization()`                                                      | _(iOS only) Instead of having to prompt the user for permission to send them push notifications, your app can request provisional authorization._                                                                                                                                                                                                                                                                   |
| `OneSignal.Notifications.addEventListener("permissionChange", (observer) => {});`<br><br>**_See below for usage_**                           | _This method will fire when a notification permission setting changes. This happens when the user enables or disables notifications for your app from the system settings outside of your app._                                                                                                                                                                                                                     |
| `OneSignal.Notifications.removeEventListener("permissionChange", (observer) => {});`<br><br>**_See below for usage_**                        | _Remove a push permission observer that has been previously added._                                                                                                                                                                                                                                                                                                                                                 |
| `OneSignal.Notifications.addEventListener("foregroundWillDisplay", (event) => {};)`<br><br>**_See below for usage_** | _Sets the handler to run before displaying a notification while the app is in focus. Use this handler to read notification data and change it or decide if the notification **_should_** show or not.<br><br>**_Note:_** this runs **_after_** the [Notification Service Extension](https://documentation.onesignal.com/docs/service-extensions) which can be used to modify the notification before showing it._ |
| `OneSignal.Notifications.addEventListener("click", (event) => {};)`<br><br>**_See below for usage_**                 | _Sets a handler that will run whenever a notification is opened by the user._                                                                                                                                                                                                                                                                                                                                       |

### Prompt for Push Notification Permission

```typescript
OneSignal.Notifications.requestPermission(true).then(accepted => {
  console.log('User accepted notifications: ' + accepted);
});
```

### Permission Observer

Add an observer when permission status changes. You can call `removeEventListener` to remove any existing listeners.

```typescript
// Add an observer
OneSignal.Notifications.addEventListener('permissionChange', (granted: boolean) => {
  console.log('OneSignal: permission changed:', granted);
});

// Remove previously added observer
OneSignal.Notifications.removeEventListener('permissionChange', observer);
```

### Notification Lifecycle Listener

```typescript
OneSignal.Notifications.addEventListener('foregroundWillDisplay', (event: NotificationWillDisplayEvent) => {
  event.preventDefault();
  // some async work

  // Use display() to display the notification after some async work
  event.getNotification().display();
});
```

### Notification Click Listener

```typescript
OneSignal.Notifications.addEventListener('click', (event: NotificationClickEvent) => {
  console.log('OneSignal: notification clicked: ' + event);
});
```

## Location Namespace

The Location namespace is accessible via `OneSignal.Location` and provide access to location-scoped functionality.

| **React Native**                                                        | **Description**                                                                                                                                          |
| ----------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `OneSignal.Location.setShared(shared: boolean)`                         | _Set whether location is currently shared with OneSignal._                                                                                               |
| `await OneSignal.Location.isShared()`                                   | _Whether location is currently shared with OneSignal._                                                                                                   |
| `OneSignal.Location.requestPermission()`                                | _Use this method to manually prompt the user for location permissions. This allows for geotagging so you send notifications to users based on location._ |

## InAppMessages Namespace

The In App Messages namespace is accessible via `OneSignal.InAppMessages` and provide access to in app messages-scoped functionality.

|  **React Native**                                                                                                                             | **Description**                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| ----------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `await OneSignal.InAppMessages.getPaused()`<br><br>`OneSignal.InAppMessages.setPaused(true)`                                  | _Whether in-app messaging is currently paused. When set to `true`, no IAM will be presented to the user regardless of whether they qualify for them. When set to `false`, any IAMs the user qualifies for will be presented to the user at the appropriate time._                                                                                                                                                                                             |
| `OneSignal.InAppMessages.addTrigger("triggerKey", "triggerValue")`                                                            | _Add a trigger for the current user. Triggers are currently explicitly used to determine whether a specific IAM should be displayed to the user. See [Triggers](https://documentation.onesignal.com/docs/iam-triggers).<br><br>If the trigger key already exists, it will be replaced with the value provided here. Note that triggers are not persisted to the backend. They only exist on the local device and are applicable to the current user._         |
| `OneSignal.InAppMessages.addTriggers({"triggerKey1":"triggerValue", "triggerKey2": "triggerValue"})`                          | _Add multiple triggers for the current user. Triggers are currently explicitly used to determine whether a specific IAM should be displayed to the user. See [Triggers](https://documentation.onesignal.com/docs/iam-triggers).<br><br>If any trigger key already exists, it will be replaced with the value provided here. Note that triggers are not persisted to the backend. They only exist on the local device and are applicable to the current user._ |
| `OneSignal.InAppMessages.removeTrigger("triggerKey")`                                                                         | _Remove the trigger with the provided key from the current user._                                                                                                                                                                                                                                                                                                                                                                                             |
| `OneSignal.InAppMessages.removeTriggers(["triggerKey1", "triggerKey2"])`                                                      | _Remove multiple triggers from the current user._                                                                                                                                                                                                                                                                                                                                                                                                             |
| `OneSignal.InAppMessages.clearTriggers()`                                                                                     | _Clear all triggers from the current user._                                                                                                                                                                                                                                                                                                                                                                                                                   |
| ` OneSignal.InAppMessages.setLifecycleHandler(handlerObject)`<br><br>**_See below for usage_**                                | _Set the in-app message lifecycle handler._                                                                                                                                                                                                                                                                                                                                                                                                                   |
| `OneSignal.InAppMessages.setClickHandler(handler)`<br><br>**_See below for usage_**                                           | _Set the in-app message click handler._                                                                                                                                                                                                                                                                                                                                                                                                                       |

### In-App Message Click Listener

```typescript
OneSignal.InAppMessages.addEventListener('click', (event) => {
  console.log('OneSignal IAM clicked: ' + event);
});
```

### In-App Message Lifecycle Listeners

```typescript
OneSignal.InAppMessages.addEventListener('willDisplay', (event) => {
  console.log('OneSignal: will display IAM: ', event);
});

OneSignal.InAppMessages.addEventListener('didDisplay', (event) => {
  console.log('OneSignal: did display IAM: ', event);
});

OneSignal.InAppMessages.addEventListener('willDismiss', (event) => {
  console.log('OneSignal: will dismiss IAM: ', event);
});

OneSignal.InAppMessages.addEventListener('didDismiss', (event) => {
  console.log('OneSignal: did dismiss IAM: ', event);
});
```

## Debug Namespace

The Debug namespace is accessible via `OneSignal.Debug` and provide access to debug-scoped functionality.

| **React Native**                   | **Description**                                                            |
| ---------------------------------- | -------------------------------------------------------------------------- |
| `OneSignal.Debug.setLogLevel(LogLevel.Verbose)`   | _Sets the log level the OneSignal SDK should be writing to the Xcode log._ |
| `OneSignal.Debug.setAlertLevel(LogLevel.Verbose)` | _Sets the logging level to show as alert dialogs._                         |

# Glossary

**device-scoped user**

> An anonymous user with no aliases that cannot be retrieved except through the current device or OneSignal dashboard. On app install, the OneSignal SDK is initialized with a _device-scoped user_. A _device-scoped user_ can be upgraded to an identified user by calling `OneSignal.login("USER_EXTERNAL_ID")` to identify the user by the specified external user ID.

# Limitations

- Changing app IDs is not supported.
- Any `User` namespace calls must be invoked **after** initialization. Example: `OneSignal.User.addTag("tag", "2")`
- In the SDK, the user state is only refreshed from the server when a new session is started (cold start or backgrounded for over 30 seconds) or when the user is logged in. This is by design.

# Known issues

- Identity Verification
  - We will be introducing Identity Verification using JWT in a follow up release
