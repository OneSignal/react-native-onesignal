# React Native v5.0.0-beta-01 Migration Guide

# Intro

In this release, we are making a significant shift from a device-centered model to a user-centered model. A user-centered model allows for more powerful omni-channel integrations within the OneSignal platform.

To facilitate this change, the `externalId` approach for identifying users is being replaced by the `login` and `logout` methods. In addition, the SDK now makes use of namespaces such as `User`, `Notifications`, and `InAppMessages` to better separate code.

This migration guide will walk you through the React Native SDK changes as a result of this shift.

# Overview

Under the user-centered model, the concept of a "player" is being replaced with three new concepts: **users**, **subscriptions**, and **aliases**.

## Users

A user is a new concept which is meant to represent your end-user. A user has zero or more subscriptions and can be uniquely identified by one or more aliases. In addition to subscriptions, a user can have **data tags** which allows for user attribution.

## Subscription

A subscription refers to the method in which an end-user can receive various communications sent by OneSignal, including push notifications, SMS, and email.  In previous versions of the OneSignal platform, each of these channels was referred to as a “player”. A subscription is in fact identical to the legacy “player” concept.  Each subscription has a **subscription_id** (previously, player_id) to uniquely identify that communication channel.

## Aliases

Aliases are a concept evolved from [external user ids](https://documentation.onesignal.com/docs/external-user-ids) which allows the unique identification of a user within a OneSignal application.  Aliases are a key-value pair made up of an **alias label** (the key) and an **alias id** (the value). The **alias label** can be thought of as a consistent keyword across all users, while the **alias id** is a value specific to each user for that particular label. The combined **alias label** and **alias id** provide uniqueness to successfully identify a user.

OneSignal uses a built-in **alias label** called `external_id` which supports existing use of [external user ids](https://documentation.onesignal.com/docs/external-user-ids). `external_id` is also used as the identification method when a user identifies themselves to the OneSignal SDK via `OneSignal.login`.  Multiple aliases can be created for each user to allow for your own application's unique identifier as well as identifiers from other integrated applications.

# Migration Guide (v3 to v5)

The React Native SDK accesses the OneSignal native iOS and Android SDKs. For this update, all SDK versions are aligning across OneSignal’s suite of client SDKs. As such, the React Native SDK is making the jump from `v3` to `v5`.

# API Changes
## Namespaces

The OneSignal SDK has been updated to be more modular in nature. The SDK has been split into namespaces, and functionality previously in the static `OneSignal` class has been moved to the appropriate namespace. The namespaces and how to access them in code are as follows:

| **Namespace** | **Access Pattern**            |
| ------------- | ----------------------------- |
| Debug         | `OneSignal.Debug`         |
| InAppMessages | `OneSignal.InAppMessages` |
| Location      | `OneSignal.Location`      |
| Notifications | `OneSignal.Notifications` |
| Session       | `OneSignal.Session`       |
| User          | `OneSignal.User`          |

## Initialization

Initialization of the OneSignal SDK is now completed through the `init` method. A typical initialization now looks similar to below.

Navigate to your index.ts file, or the first Javascript file that loads with your app.

Replace the following:


```typescript
    OneSignal.setAppId("YOUR_ONESIGNAL_APP_ID");
```

To the match the new initialization:

```typescript
    OneSignal.init("YOUR_ONESIGNAL_APP_ID");
```

If your integration is **not** user-centric, there is no additional startup code required. A device-scoped user *(please see definition of “**device-scoped user**” below in Glossary)* is automatically created as part of the push subscription creation, both of which are only accessible from the current device or through the OneSignal dashboard.

If your integration is user-centric, or you want the ability to identify the user beyond the current device, the `login` method should be called to identify the user:

```typescript
    OneSignal.User.login("USER_EXTERNAL_ID");
```

The `login` method will associate the device’s push subscription to the user that can be identified via the alias `externalId=USER_EXTERNAL_ID`. If that user doesn’t already exist, it will be created. If the user does already exist, the user will be updated to own the device’s push subscription. Note that the push subscription for the device will always be transferred to the newly logged in user, as that user is the current owner of that push subscription.

Once (or if) the user is no longer identifiable in your app (i.e. they logged out), the `logout` method should be called:

```typescript
    OneSignal.User.logout();
```

Logging out has the affect of reverting to a device-scoped user, which is the new owner of the device’s push subscription.

## Subscriptions

In previous versions of the SDK, a “player” could have up to one email address and up to one phone number for SMS. In the user-centered model, a user can own the current device’s **Push Subscription** along with the ability to have **zero or more** email subscriptions and **zero or more** SMS subscriptions. Note: If a new user logs in via the `login` method, the previous user will no longer own that push subscription.

### **Push Subscription**
The current device’s push subscription can be retrieved via:

```typescript
    const id: string = await OneSignal.User.PushSubscription.getPushSubscriptionId();
    const token: string = await OneSignal.User.PushSubscription.getPushSubscriptionToken();
    const optedIn: boolean = await OneSignal.User.PushSubscription.getOptedIn();
```

### **Opting In and Out of Push Notifications**

To receive push notifications on the device, call the push subscription’s `optIn` method. If needed, this method will prompt the user for push notifications permission.

Note: For greater control over prompting for push notification permission, you may use the `OneSignal.Notifications.requestPermission` method detailed below in the API Reference.

```typescript
    OneSignal.User.PushSubscription.optIn();
```

If at any point you want the user to stop receiving push notifications on the current device (regardless of system-level permission status), you can use the push subscription to opt out:

```typescript
    OneSignal.User.PushSubscription.optOut();
```

To resume receiving of push notifications (driving the native permission prompt if permissions are not available), you can opt back in with the `optIn` method from above.

### **Email/SMS Subscriptions**

Email and/or SMS subscriptions can be added or removed via the following methods. The remove methods will result in a no-op if the specified email or SMS number does not exist on the user within the SDK, and no request will be made.

```typescript
    // Add email subscription
    OneSignal.User.addEmail("customer@company.com");
    // Remove previously added email subscription
    OneSignal.User.removeEmail("customer@company.com");
    
    // Add SMS subscription
    OneSignal.User.addSms("+15558675309");
    // Remove previously added SMS subscription
    OneSignal.User.removeSms("+15558675309");
```

# API Reference

Below is a comprehensive reference to the `5.0.0-beta-01` OneSignal React Native SDK.

## OneSignal

The SDK is still accessible via a `OneSignal` static class. It provides access to higher level functionality and is a gateway to each subspace of the SDK.

|                                                                                | **Description**                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
|-----------------------------------------------------------------------------------------------| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `OneSignal.init("YOUR_ONESIGNAL_APP_ID")`                                                     | *Initializes the OneSignal SDK. This should be called during startup of the application.*                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| `OneSignal.User.login("USER_EXTERNAL_ID")`                                                    | *Login to OneSignal under the user identified by the [externalId] provided. The act of logging a user into the OneSignal SDK will switch the [user] context to that specific user.<br><br> - If the [externalId] exists, the user will be retrieved and the context will be set from that user information. If operations have already been performed under a device-scoped user, they ***will not*** be applied to the now logged in user (they will be lost).<br> - If the [externalId] does not exist the user, the user will be created and the context set from the current local state. If operations have already been performed under a device-scoped user, those operations ***will*** be applied to the newly created user.<br><br>***Push Notifications and In App Messaging***<br>Logging in a new user will automatically transfer the push notification and in app messaging subscription from the current user (if there is one) to the newly logged in user. This is because both push notifications and in-app messages are owned by the device.* |
| `OneSignal.User.logout()`                                                                     | *Logout the user previously logged in via [login]. The [user] property now references a new device-scoped user. A device-scoped user has no user identity that can later be retrieved, except through this device as long as the app remains installed and the app data is not cleared.*                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| `OneSignal.getPrivacyConsent()`<br><br>`OneSignal.setPrivacyConsent(true);`                   | *Indicates whether privacy consent has been granted. This field is only relevant when the application has opted into data privacy protections. See [requiresPrivacyConsent].*                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| `OneSignal.setRequiresPrivacyConsent(true)`                                                   | *Determines whether a user must consent to privacy prior to their user data being sent up to OneSignal.  This should be set to `true` prior to the invocation of `initialize` to ensure compliance.*                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| `OneSignal.setLaunchURLsInApp(true)`                                                          | *This method can be used to set if launch URLs should be opened in safari or within the application. Set to `true` to launch all notifications with a URL in the app instead of the default web browser. Make sure to call `setLaunchURLsInApp` before the `initialize` call.*                                                                                                                                                                                                                                                                   |                                                      
| `OneSignal.enterLiveActivity("ACTIVITY_ID", "TOKEN")`<br><br>***See below for usage of callbacks*** |*Entering a Live Activity associates an `activityId` with a live activity temporary push `token` on OneSignal's server. The activityId is then used with the OneSignal REST API to update one or multiple Live Activities at one time.*                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| `OneSignal.exitLiveActivity("ACTIVITY_ID")`<br><br>***See below for usage of callbacks***     |*Exiting a Live activity deletes the association between a customer defined `activityId` with a Live Activity temporary push `token` on OneSignal's server.*                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |


## Live Activities

Live Activities are a type of interactive push notification. Apple introduced them in October 2022 to enable iOS apps to provide real-time updates to their users that are visible from the lock screen and the dynamic island.

Please refer to OneSignal’s guide on [Live Activities](https://documentation.onesignal.com/docs/live-activities), the [Live Activities Quickstart](https://documentation.onesignal.com/docs/live-activities-quickstart) tutorial, and the [existing SDK reference](https://documentation.onesignal.com/docs/sdk-reference#live-activities) on Live Activities.

```typescript
    // Enter a Live Activity
    OneSignal.enterLiveActivity("ACTIVITY_ID", "TOKEN", (results) => {
        console.log("Results of entering live activity");
        console.log(results);
    });
    
    // Exit a Live Activity
    OneSignal.exitLiveActivity("ACTIVITY_ID", (results) => {
        console.log("Results of exiting live activity");
        console.log(results);
    });
```

## User Namespace

The User namespace is accessible via `OneSignal.User` and provides access to user-scoped functionality.


|                                                                                          | **Description**                                                                                                                                                                                                                          |
|------------------------------------------------------------------------------------------| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `OneSignal.User.setLanguage("en")`                                                       | *Set the 2-character language  for this user.*                                                                                                                                                                                                   |
| `OneSignal.User.addAlias("ALIAS_LABEL", "ALIAS_ID")`                                     | *Set an alias for the current user.  If this alias label already exists on this user, it will be overwritten with the new alias id.*                                                                                         |
| `OneSignal.User.addAliases({ALIAS_LABEL_01: "ALIAS_ID_01", ALIAS_LABEL_02: "ALIAS_ID_02"})` | *Set aliases for the current user. If any alias already exists, it will be overwritten to the new values.*                                                                                                                       |
| `OneSignal.User.removeAlias("ALIAS_LABEL")`                                              | *Remove an alias from the current user.*                                                                                                                                                                                                 |
| `OneSignal.User.removeAliases(["ALIAS_LABEL_01", "ALIAS_LABEL_02"]])`                    | *Remove aliases from the current user.*                                                                                                                                                                                              |
| `OneSignal.User.addEmail("customer@company.com")`                                        | *Add a new email subscription to the current user.*                                                                                                                                                                                      |
| `OneSignal.User.removeEmail("customer@company.com")`                                     | *Results in a no-op if the specified email does not exist on the user within the SDK, and no request will be made.*                                                               |
| `OneSignal.User.addSms("+15558675309")`                                                  | *Add a new SMS subscription to the current user.*                                                                                                                                                                                        |
| `OneSignal.User.removeSms("+15558675309")`                                               | *Results in a no-op if the specified phone number does not exist on the user within the SDK, and no request will be made..*                                                            |
| `OneSignal.User.addTag("KEY", "VALUE")`                                                  | *Add a tag for the current user.  Tags are key:value pairs used as building blocks for targeting specific users and/or personalizing messages. If the tag key already exists, it will be replaced with the value provided here.*         |
| `OneSignal.User.addTags({"KEY_01": "VALUE_01", "KEY_02": "VALUE_02"})`                   | *Add multiple tags for the current user.  Tags are key:value pairs used as building blocks for targeting specific users and/or personalizing messages. If the tag key already exists, it will be replaced with the value provided here.* |
| `OneSignal.User.removeTag("KEY")`                                                        | *Remove the data tag with the provided key from the current user.*                                                                                                                                                                       |
| `OneSignal.User.removeTags(["KEY_01", "KEY_02"])`                                        | *Remove multiple tags with the provided keys from the current user.*                                                                                                                                                             |



## Push Subscription Namespace

The Push Subscription namespace is accessible via `OneSignal.User.pushSubscription` and provides access to push subscription-scoped functionality.


|                                                                                                                                 | **Description**                                                                                                                                                                                                                                                                                                                                                                                    |
|---------------------------------------------------------------------------------------------------------------------------------------------| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `await OneSignal.User.PushSubscription.getId()`                                                                                             | *The readonly push subscription ID.*                                                                                                                                                                                                                                                                                                                                                               |
| `await OneSignal.User.PushSubscription.getToken()`                                                                                          | *The readonly push token.*                                                                                                                                                                                                                                                                                                                                                                         |
| `await OneSignal.User.PushSubscription.getOptedIn()`                                                                                        | *Gets a boolean value indicating whether the current user is opted in to push notifications. This returns `true` when the app has notifications permission and `optedOut` is called. ***Note:*** Does not take into account the existence of the subscription ID and push token. This boolean may return `true` but push notifications may still not be received by the user.* |
| `OneSignal.User.PushSubscription.optIn()`                                                                                                   | *Call this method to receive push notifications on the device or to resume receiving of push notifications after calling `optOut`. If needed, this method will prompt the user for push notifications permission.*                                                                                                                                                                     |
| `OneSignal.User.PushSubscription.optOut()`                                                                                                  | *If at any point you want the user to stop receiving push notifications on the current device (regardless of system-level permission status), you can call this method to opt out.*                                                                                                                                                                                                              |
| `OneSignal.User.PushSubscription.addChangeHandler(handler: (event: ChangeEvent<SubscriptionChange>) => void)`<br><br>***See below for usage*** | *The `OSPushSubscriptionObserver.onOSPushSubscriptionChanged` method will be fired on the passed-in object when the push subscription changes. This method returns the current `OSPushSubscriptionState` at the time of adding this observer.*                                                                                                                                 |
| `OneSignal.User.PushSubscription.removeObserver()`<br><br>***See below for usage***                                                         | *Remove a push subscription observer that has been previously added.*                                                                                                                                                                                                                                                                                                                      |

### Push Subscription Observer

Any object implementing the `OSPushSubscriptionObserver` protocol can be added as an observer. You can call `removeObserver` to remove any existing listeners.


```typescript
    // Create an observer
    OneSignal.User.PushSubscription.addChangeHandler(subscription => {
      console.log('OneSignal: subscription changed: ', subscription);
    });
    
    // Removes the previously added observer
    OneSignal.User.PushSubscription.removeChangeHandler();
```

## Session Namespace

The Session namespace is accessible via `OneSignal.Session` and provides access to session-scoped functionality.


|                                          | **Description**                                                                          |
| --------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `OneSignal.Session.addOutcome("OUTCOME_NAME")`                           | *Add an outcome with the provided name, captured against the current session.*           |
| `OneSignal.Session.addUniqueOutcome("OUTCOME_NAME")`                     | *Add a unique outcome with the provided name, captured against the current session.*     |
| `OneSignal.Session.addOutcomeWithValue("OUTCOME_NAME", 1)` | *Add an outcome with the provided name and value, captured against the current session.* |



## Notifications Namespace

The Notifications namespace is accessible via `OneSignal.Notifications` and provides access to notification-scoped functionality.

|                                                                                                                |                                                                                              **Description** |
|----------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------|
| `await OneSignal.Notifications.hasPermission()`                                                                | *Whether this app has push notification permission.*                                                                                                                                                                                                                                                                                                                                                                        |
| `await OneSignal.Notifications.canRequestPermission()`                                                         | *Whether attempting to request notification permission will show a prompt. Returns `true` if the device has not been prompted for push notification permission already.*                                                                                                                                                                                                                                                |
| `OneSignal.Notifications.clearAll();`                                                                          | *Removes all OneSignal notifications.*|                                                                                                                                                           
| `OneSignal.Notifications.removeNotification("NOTIFICATION_ID")`                                                | *(Android only) Cancels a single OneSignal notification based on its Android notification integer ID. Use instead of Android's [android.app.NotificationManager.cancel], otherwise the notification will be restored when your app is restarted.*|                                                                                                                                                                                                    
| `OneSignal.Notifications.removeGroupedNotifications("GROUP_KEY")`                                              | *(Android only) Cancels a group of OneSignal notifications with the provided group key. Grouping notifications is a OneSignal concept, there is no [android.app.NotificationManager] equivalent.*|                                                                                                                                                                                                                                                                                                                        
| `OneSignal.Notifications.requestPermission()`<br><br>***See below for usage***                                 | *Prompt the user for permission to receive push notifications. This will display the native system prompt to request push notification permission.* |                                                                                                                                                                                                   
| `OneSignal.Notifications.registerForProvisionalAuthorization()`                                                | *(iOS only) Instead of having to prompt the user for permission to send them push notifications, your app can request provisional authorization.*|                                                                                                                                                                                                    
| `OneSignal.Notifications.addPermissionObserver(observer)`<br><br>***See below for usage***                     | *This method will fire when a notification permission setting changes. This happens when the user enables or disables notifications for your app from the system settings outside of your app.*|                                        
| `OneSignal.Notifications.removePermissionObserver(observer)`<br><br>***See below for usage***                  | *Remove a push permission observer that has been previously added.*|                                                                                                                                                                                                                         
| `OneSignal.Notifications.setNotificationWillShowInForegroundHandler(handler)`<br><br>***See below for usage*** | *Sets the handler to run before displaying a notification while the app is in focus. Use this handler to read notification data and change it or decide if the notification ***should*** show or not.<br><br>***Note:*** this runs ***after*** the [Notification Service Extension](https://documentation.onesignal.com/docs/service-extensions) which can be used to modify the notification before showing it.* |
| `OneSignal.Notifications.setNotificationOpenedHandler()`<br><br>***See below for usage***                      | *Sets a handler that will run whenever a notification is opened by the user.*|                                                                                                                                                                                                                                                                                                                     


### Prompt for Push Notification Permission
```typescript
OneSignal.Notifications.requestPermission(accepted => {
  console.log("User accepted notifications: " + accepted);
});
```

### Permission Observer
Add an observer when permission status changes. You can call `removePermissionChangedHandler` to remove any existing listeners.

```typescript
// Add a change hanlder
OneSignal.Notifications.addPermissionChangedHandler(granted => {
  console.log("OneSignal: permission state changed to: ", granted);
});

// Remove previously added handler
OneSignal.Notifications.removePermissionChangedHandler();
```

### Notification Will Show in Foreground Handler
```typescript
OneSignal.Notifications.setNotificationWillShowInForegroundHandler(notificationReceivedEvent => {
    notificationReceivedEvent.complete(notificationReceivedEvent.getNotification());
});
```

### Notification Click Handler
```typescript
OneSignal.Notifications.setNotificationClickHandler(clicked => {
    const notificationData = JSON.stringify(clicked);
    console.log('notificationOpenedCallback: ' + notificationData);
});
```

## Location Namespace
The Location namespace is accessible via `OneSignal.Location` and provide access to location-scoped functionality.

|                                                          | **Description**                                                                           |
|-------------------------------------------------------------------------|-------------------------------------------------------------------------------------------|
| `await OneSignal.Location.isShared()` <br><br>***See below for usage*** | *Whether location is currently shared with OneSignal.*|
| `OneSignal.Location.requestPermission()`                                | *Use this method to manually prompt the user for location permissions. This allows for geotagging so you send notifications to users based on location.* |

### isShared method
```typescript
const shared: boolean = await OneSignal.Location.isShared();
console.log("Location shared: ", shared); 
```

## InAppMessages Namespace
The In App Messages namespace is accessible via `OneSignal.InAppMessages` and provide access to in app messages-scoped functionality.

|                                                                                                        |       **Description**                                                                                             |
|------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------|
| `await OneSignal.InAppMessages.getPaused()`<br><br>***See below for usage***<br><br>`OneSignal.InAppMessages.setPaused(true)` | *Whether in-app messaging is currently paused.  When set to `true`, no IAM will be presented to the user regardless of whether they qualify for them. When set to `false`, any IAMs the user qualifies for will be presented to the user at the appropriate time.*                                                                                                                                                                                                  |
| `OneSignal.InAppMessages.addTrigger("triggerKey", "triggerValue")`                                                     | *Add a trigger for the current user.  Triggers are currently explicitly used to determine whether a specific IAM should be displayed to the user. See [Triggers](https://documentation.onesignal.com/docs/iam-triggers).<br><br>If the trigger key already exists, it will be replaced with the value provided here. Note that triggers are not persisted to the backend. They only exist on the local device and are applicable to the current user.*                    |
| `OneSignal.InAppMessages.addTriggers({"triggerKey1":"triggerValue", "triggerKey2": "triggerValue"})`                   | *Add multiple triggers for the current user. Triggers are currently explicitly used to determine whether a specific IAM should be displayed to the user. See [Triggers](https://documentation.onesignal.com/docs/iam-triggers).<br><br>If any trigger key already exists, it will be replaced with the value provided here. Note that triggers are not persisted to the backend. They only exist on the local device and are applicable to the current user.* |
| `OneSignal.InAppMessages.removeTrigger("triggerKey")`                                                                  | *Remove the trigger with the provided key from the current user.*                                                                                                                                                                                                                                                                                                                                                                                                               |
| `OneSignal.InAppMessages.removeTriggers(["triggerKey1", "triggerKey2"])`                                               | *Remove multiple triggers from the current user.*                                                                                                                                                                                                                                                                                                                                                                                                                               |
| `OneSignal.InAppMessages.clearTriggers()`                                                                              | *Clear all triggers from the current user.*                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| ` OneSignal.InAppMessages.setLifecycleHandler(handlerObject)`<br><br>***See below for usage***                         | *Set the in-app message lifecycle handler.*                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| `OneSignal.InAppMessages.setClickHandler(handler)`<br><br>***See below for usage***                                    | *Set the in-app message click handler.*                                                                                                                                                                                                                                                                                                                                                                                                                                     |

### In-App Message isPaused method
```typescript
const paused = await OneSignal.InAppMessages.getPaused();
console.log("IAM paused: ", paused);
```

### In-App Message Click Handler
```typescript
OneSignal.InAppMessages.setClickHandler(result => {
  const iamClickAction = JSON.stringify(jsonData);
  console.log('iamClickCallback: ' + iamClickAction);
});
```

### In-App Message Lifecycle Handler
```typescript
    OneSignal.InAppMessages.setLifecycleHandler({
        onWillDisplayInAppMessage: message => {
            console.log("OneSignal: will display IAM: ", message.messageId)
        },
        onDidDisplayInAppMessage: message => {
            console.log("OneSignal: did display IAM: ", message.messageId)
        },
        onWillDismissInAppMessage: message => {
            console.log("OneSignal: will dismiss IAM: ", message.messageId)
        },
        onDidDismissInAppMessage: message => {
            console.log("OneSignal: did dismiss IAM: ", message.messageId)
        }
    });
```

## Debug Namespace
The Debug namespace is accessible via `OneSignal.Debug` and provide access to debug-scoped functionality.

| **Objective-C**                                | **Description**                                                                    |
| ---------------------------------------------- | ---------------------------------------------------------------------------------- |
| `OneSignal.Debug.setLogLevel(6)` | *Sets the log level the OneSignal SDK should be writing to the Xcode log.* |
| `OneSignal.Debug.setAlertLevel(0)` | *Sets the logging level to show as alert dialogs.*                                 |


# Glossary
**device-scoped user**
> An anonymous user with no aliases that cannot be retrieved except through the current device or OneSignal dashboard. On app install, the OneSignal SDK is initialized with a *device-scoped user*. A *device-scoped user* can be upgraded to an identified user by calling `OneSignal.login("USER_EXTERNAL_ID")`  to identify the user by the specified external user ID.

# Limitations
**General**
- Recommend using only in development and staging environments for Alpha releases
- Users are deleted when the last Subscription (push, email, or sms) is removed
- Any `User` namespace calls must be invoked **after** initialization. Example: `OneSignal.User.addTag("tag", "2")`

# Known issues
- Identity Verification
    - We will be introducing JWT in a follow-up Beta release
- User properties may not update correctly when Subscriptions are transferred
    - Please report any issues you find with this