# React Native OneSignal

React Native Push Notifications support with OneSignal integration.

[![npm version](https://img.shields.io/npm/v/react-native-onesignal.svg?style=flat-square)](https://www.npmjs.com/package/react-native-onesignal)
[![npm downloads](https://img.shields.io/npm/dm/react-native-onesignal.svg?style=flat-square)](https://www.npmjs.com/package/react-native-onesignal)

<!-- TOC depthFrom:1 depthTo:6 withLinks:1 updateOnSave:1 orderedList:0 -->

- [React Native OneSignal](#react-native-onesignal)
	- [Installation](#installation)
	- [Android Installation](#android-installation)
		- [RN < 0.29](#rn-029)
		- [RN >= 0.29](#rn-029)
	- [iOS Installation](#ios-installation)
		- [Importing The Library](#importing-the-library)
		- [Adding the Code](#adding-the-code)
	- [Android Usage](#android-usage)
	- [iOS Usage](#ios-usage)
	- [API](#api)
		- [Handling Notifications](#handling-notifications)
		- [Sending and Getting OneSignal Tags](#sending-and-getting-onesignal-tags)
		- [Getting Player ID and Push Token](#getting-player-id-and-push-token)
		- [Enable Vibration](#enable-vibration)
		- [Enable Sound](#enable-sound)
		- [Enable Notification When App Active](#enable-notification-when-app-active)
		- [Enable In-App Alert Notification](#enable-in-app-alert-notification)
		- [Change User Subscription Status](#change-user-subscription-status)
		- [Post Notification (Peer-to-Peer Notifications)](#post-notification-peer-to-peer-notifications)
		- [Prompt Location (Android Only)](#prompt-location-android-only)
		- [Clear Notifications (Android Only)](#clear-notifications-android-only)
		- [Cancel Notifications (Android Only)](#cancel-notifications-android-only)
		- [Check Push Notification Permissions (iOS Only)](#check-push-notification-permissions-ios-only)
		- [Request Push Notification Permissions (iOS Only)](#request-push-notification-permissions-ios-only)
		- [Register For Push Notifications (iOS Only)](#register-for-push-notifications-ios-only)
	- [FAQ / Repeating Issues](#faq-repeating-issues)
		- [Issue 1 - Multiple dex files define:](#issue-1-multiple-dex-files-define)
		- [Issue 2 - Multiple dex files define (Again):](#issue-2-multiple-dex-files-define-again)
		- [Issue 3 - symbol(s) not found for architecture x86_64 and/or OneSignal/OneSignal.h file not found](#issue-3-symbols-not-found-for-architecture-x8664-andor-onesignalonesignalh-file-not-found)
	- [CREDITS](#credits)
	- [TODO](#todo)

<!-- /TOC -->

## Installation
`npm install react-native-onesignal`

## Android Installation
In your `AndroidManifest.xml`

```xml
.....

<!-- Optional - Add the necessary permissions (Choose one of those) -->

<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION"/> <!-- Approximate location - If you want to use promptLocation for letting OneSignal know the user location. -->
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION"/> <!--  Precise location If you want to use promptLocation for letting OneSignal know the user location. -->

<!-- End optional permissions -->

<application ....>
    <activity
        android:launchMode="singleTop"> <!-- Add this parameter -->
    .....
```

In `android/gradle/wrapper/gradle-wrapper.properties`
````javascript
...

distributionBase=GRADLE_USER_HOME
distributionPath=wrapper/dists
zipStoreBase=GRADLE_USER_HOME
zipStorePath=wrapper/dists
distributionUrl=https://services.gradle.org/distributions/gradle-2.10-all.zip
```

In `android/settings.gradle`
```gradle
...

include ':react-native-onesignal'
project(':react-native-onesignal').projectDir = new File(rootProject.projectDir, '../node_modules/react-native-onesignal/android')
```

In `android/build.gradle`
```gradle
...

dependencies {
    classpath 'com.android.tools.build:gradle:2.1.0' // Upgrade gradle

    // NOTE: Do not place your application dependencies here; they belong
    // in the individual module build.gradle files
}
```

In `android/app/build.gradle`

```gradle
...

android {
    ...
    buildToolsVersion "23.0.2" // NOT REQUIRED BUT RECOMMENDED - This is good for in-process dex (faster)
    ...
    defaultConfig {
        ...
        manifestPlaceholders = [manifestApplicationId: "${applicationId}",
                                onesignal_app_id: "YOUR_ONESIGNAL_ID",
                                onesignal_google_project_number: "YOUR_GOOGLE_PROJECT_NUMBER"]
    }
}

dependencies {
    ...

    compile project(':react-native-onesignal')
}
```

### RN < 0.29

Register module (in `MainActivity.java`)

```java
import com.geektime.reactnativeonesignal.ReactNativeOneSignalPackage;  // <--- Import

public class MainActivity extends ReactActivity {
  ......

      /**
     * A list of packages used by the app. If the app uses additional views
     * or modules besides the default ones, add more packages here.
     */
    @Override
    protected List<ReactPackage> getPackages() {
        ...
        return Arrays.<ReactPackage>asList(
                new MainReactPackage(),
                new ReactNativeOneSignalPackage() // Add this line
        );
    }
  ......

}
```

### RN >= 0.29

In RN 0.29 FB changed the way RN libraries should be included in Android, and listen to application life cycle.

Register module (in `MainApplication.java`)

```java
import com.geektime.reactnativeonesignal.ReactNativeOneSignalPackage;  // <--- Import

public class MainApplication extends Application implements ReactApplication {

	private final ReactNativeHost mReactNativeHost = new ReactNativeHost(this) {
  		......

	      /**
	     * A list of packages used by the app. If the app uses additional views
	     * or modules besides the default ones, add more packages here.
	     */
	    @Override
	    protected List<ReactPackage> getPackages() {
	        ...
	        return Arrays.<ReactPackage>asList(
	                new MainReactPackage(),
	                new ReactNativeOneSignalPackage() // Add this line
	        );
	    }
	};
	......
	@Override
	public ReactNativeHost getReactNativeHost() {
    	return mReactNativeHost;
	}
};

```

## iOS Installation

 * Follow the steps according to the official OneSignal SDK Installation here: https://documentation.onesignal.com/docs/installing-the-onesignal-ios-sdk
 * Make sure you installed the OneSignal Pod (Version 1.13.3).
 * Once you've finished, Open your project in Xcode.

### Importing The Library

 * Drag the file `RCTOneSignal.xcodeproj` from `/node_modules/react-native-onesignal/ios` into the `Libraries` group in the Project navigator. Ensure that `Copy items if needed` is UNCHECKED!

  ![Add Files To...](http://i.imgur.com/puxHiIg.png)

  ![Library Imported Successfuly](http://i.imgur.com/YJPQLPD.png)

 * Ensure that `libRTCOneSignal.a` is linked through `Link Binary With Libraries` on `Build Phases`:

  ![Add Files To...](http://i.imgur.com/IxIQ4s8.png)

 * Ensure that `Header Search Paths` on `Build Settings` has the path `$(SRCROOT)/../node_modules/react-native-onesignal` set to `recursive`:

### Adding the Code

 * When you reach `AppDelegate.m` instructions on the OneSignal documentation, stop and enter this following code snippets instead:
    * Import `RCTOneSignal.h`:

        ```objc
        #import "RCTOneSignal.h"
        ```

    * Synthesize `oneSignal` after `@implementation AppDelegate`

        ```objc
        @synthesize oneSignal = _oneSignal;
        ```

    * On the `application didFinishLaunchingWithOptions` method, insert the following code (replace YOUR_ONESIGNAL_APP_ID with your OneSignal app ID):

        ```objc
        self.oneSignal = [[RCTOneSignal alloc] initWithLaunchOptions:launchOptions
                                                               appId:@"YOUR_ONESIGNAL_APP_ID"];
        ```

    * After `application ` insert the code for the notification event:

        ```objc
        // Required for the notification event.
        - (void)application:(UIApplication *)application didReceiveRemoteNotification:(NSDictionary *)notification {
            [RCTOneSignal didReceiveRemoteNotification:notification];
        }
        ```

* on `AppDelegate.h`:
   * Import `RCTOneSignal.h`:

       ```objc
       #import <RCTOneSignal.h>
       ```

   * Declare the `RCTOneSignal` property:

       ```objc
       @property (strong, nonatomic) RCTOneSignal* oneSignal;
       ```

 * You're All Set!


## Android Usage

In your `index.android.js`:
```javascript
import OneSignal from 'react-native-onesignal'; // Import package from node modules
// var _navigator; // If applicable, declare a variable for accessing your navigator object to handle payload.

OneSignal.configure({
	onIdsAvailable: function(device) {
		console.log('UserId = ', device.userId);
		console.log('PushToken = ', device.pushToken);
	},
  onNotificationOpened: function(message, data, isActive) {
      console.log('MESSAGE: ', message);
      console.log('DATA: ', data);
      console.log('ISACTIVE: ', isActive);
      // Do whatever you want with the objects here
      // _navigator.to('main.post', data.title, { // If applicable
      //  article: {
      //    title: data.title,
      //    link: data.url,
      //    action: data.actionSelected
      //  }
      // });
  }
});
```

## iOS Usage

In iOS, we have to wait a little bit before fetching the notification. The reason is that notification is coming too fast, before the main view of the app is being rendered.
Therefore, the notification could get lost. We solve it in an ugly way, but working one.

In your `index.ios.js`:
```javascript
import OneSignal from 'react-native-onesignal'; // Import package from node modules

var pendingNotifications = [];
// var _navigator; // If applicable, declare a variable for accessing your navigator object to handle payload.
// function handleNotification (notification) { // If you want to handle the notifiaction with a payload.
    // _navigator.to('main.post', notification.data.title, {
    //  article: {
    //    title: notification.data.title,
    //    link: notification.data.url,
    //    action: notification.data.actionSelected
    //  }
    //});
// }

OneSignal.configure({
	onIdsAvailable: function(device) {
		console.log('UserId = ', device.userId);
		console.log('PushToken = ', device.pushToken);
	},
  onNotificationOpened: function(message, data, isActive) {
      var notification = {message: message, data: data, isActive: isActive};
      console.log('NOTIFICATION OPENED: ', notification);
      //if (!_navigator) { // Check if there is a navigator object. If not, waiting with the notification.
      //    console.log('Navigator is null, adding notification to pending list...');
          pendingNotifications.push(notification);
      //    return;
      // }
      handleNotification(notification);
  }
});
```

## API

### Handling Notifications
When any notification is opened or received the callback `onNotification` is called passing an object with the notification data.

Notification object example:
```javascript
{
    isActive: false, // BOOLEAN: If the notification was received in foreground or not
    message: 'My Notification Message', // STRING: The notification message
    data: {}, // OBJECT: The push data
}
```

### Sending and Getting OneSignal Tags

We exposed the tags API of OneSignal to allow you to target users with notification later.

````javascript
// Sending single tag
OneSignal.sendTags("key", "value");

// Sending multiple tags
OneSignal.sendTags({key: "value", key2: "value2"});

//G etting the tags from the server and use the received object
OneSignal.getTags((receivedTags) => {
    console.log(receivedTags);
});

// Delete a tag
OneSignal.deleteTag("key");
````

### Getting Player ID and Push Token

We exposed the idsAvailable API of OneSignal (both Android & iOS) as an event.
Just define a onIdsAvailable callback in the configure options.

````javascript
// Getting idsAvailable
OneSignal.configure({
	onIdsAvailable: function(device) {
		console.log('UserId = ', device.userId);
		console.log('PushToken = ', device.pushToken);
	}
});
````

### Enable Vibration

We exposed the enableVibrate API of OneSignal (Android only).

*You can call this from your UI from a button press for example to give your user's options for your notifications. By default OneSignal always vibrates the device when a notification is displayed unless the device is in a total silent mode. Passing false means that the device will only vibrate lightly when the device is in it's vibrate only mode.*

````javascript
// Setting enableVibrate
OneSignal.enableVibrate(true);
````

### Enable Sound

We exposed the enableSound API of OneSignal (Android only).

*You can call this from your UI from a button press for example to give your user's options for your notifications. By default OneSignal plays the system's default notification sound when the device's notification system volume is turned on. Passing false means that the device will only vibrate unless the device is set to a total silent mode.*

````javascript
// Setting enableSound
OneSignal.enableSound(true);
````

### Enable Notification When App Active

We exposed the enableNotificationsWhenActive API of OneSignal (Android only).

*By default this is false and notifications will not be shown when the user is in your app, instead the NotificationOpenedHandler is fired. If set to true notifications will always show in the notification area and NotificationOpenedHandler will not fire until the user taps on the notification.*

````javascript
// Setting enableNotificationsWhenActive
OneSignal.enableNotificationsWhenActive(true);
````

### Enable In-App Alert Notification

We exposed the enableInAppAlertNotification API of OneSignal (both Android & iOS).

*By default this is false and notifications will not be shown when the user is in your app, instead the OneSignalHandleNotificationBlock is fired. If set to true notifications will be shown as native alert boxes if a notification is received when the user is in your app. The OneSignalHandleNotificationBlock is then fired after the alert box is closed.*

````javascript
// Setting enableInAppAlertNotification
OneSignal.enableInAppAlertNotification(true);
````

### Change User Subscription Status

We exposed the setSubscription API of OneSignal (both Android & iOS).

*You can call this method with false to opt users out of receiving all notifications through OneSignal. You can pass true later to opt users back into notifications*

````javascript
// Setting setSubscription
OneSignal.setSubscription(true);
````

### Post Notification (Peer-to-Peer Notifications)

We exposed the postNotification API of OneSignal, currently supports one Player ID to send a notification to.
We call it internally P2P Notification, and therefore there is a special attribute to listen to while receiving the notification.

*Allows you to send notifications from user to user or schedule ones in the future to be delivered to the current device.*

````javascript
// Calling postNotification
OneSignal.postNotification(contents, data, player_id);

// Listening to postNotification using OneSignal.Configure:
onNotificationOpened: function(message, data, isActive) {
	if (data.p2p_notification) {
		for (var num in data.p2p_notification) {
			// console.log(data.p2p_notification[num]);
		}
	}
}
````

### Prompt Location (Android Only)

We exposed the promptLocation API of OneSignal (currently supported only on Android).

*Prompts the user for location permissions. This allows for geotagging so you can send notifications to users based on location.
Note: Make sure you also have the required location permission in your AndroidManifest.xml.*

````javascript
// Calling promptLocation
OneSignal.promptLocation();
````

### Clear Notifications (Android Only)

We exposed the clearOneSignalNotifications API of OneSignal (currently supported only on Android).

*Removes all OneSignal notifications from the Notification Shade.*

````javascript
// Calling clearOneSignalNotifications
OneSignal.clearOneSignalNotifications();
````

### Cancel Notifications (Android Only)

We exposed the cancelNotification API of OneSignal (currently supported only on Android).

*Cancels a single OneSignal notification based on its Android notification integer id. You can get the notification Id when invoking OneSignal.onNotificationOpened while receiving a notification.*

````javascript
// Calling cancelNotification
OneSignal.cancelNotification(id);
````

### Check Push Notification Permissions (iOS Only)

See what push permissions are currently enabled. callback will be invoked with a permissions object (currently supported only on iOS).

````javascript
// Requesting permissions
OneSignal.checkPermissions((permissions) => {
	console.log(permissions);
});
````

### Request Push Notification Permissions (iOS Only)

We exposed the requestPermissions method (currently supported only on iOS).

````javascript
// Setting requestPermissions
permissions = {
    alert: true,
    badge: true,
    sound: true
};
OneSignal.requestPermissions(permissions);
````

### Register For Push Notifications (iOS Only)

We exposed the registerForPushNotifications API of OneSignal (currently supported only on iOS).

*Call when you want to prompt the user to accept push notifications. Only call once and only if you passed false to **initWithLaunchOptions autoRegister**:.*

````javascript
// Calling registerForPushNotifications
OneSignal.registerForPushNotifications();
````

The following example is from our own App and needs to be customized in order to work.

Example:
```javascript
_syncOneSignal = () => {
	var allTags = {};
	var missingTags = {};

	OneSignal.getTags((receivedTags) => {
		// Find missing tags
		for (var i = this.categories.length * 1; i >= 0; i--) {
			var category = this.categories[i];
			if (!(category.slug in receivedTags)) {
				missingTags[category.slug] = category.is_push_default;
			}
			// Hash all tags for performance later on deletion
			allTags[category.slug] = category.is_push_default;
		};

		// Send missing tags if there are any
		if (Object.keys(missingTags).length > 0) {
			OneSignal.sendTags(missingTags);
		}

		// Delete tags that doesn't show up in the categories
		Object.keys(receivedTags).forEach(function(key,index) {
		    if (!(key in allTags)) {
		    	OneSignal.deleteTag(key);
		    }
		});
	});
};
```

## FAQ / Repeating Issues
The following issues has been marked as repeating, therefore we decided to devote them a separate section.

### Issue 1 - Multiple dex files define:
```gradle
> com.android.build.api.transform.TransformException: com.android.ide.common.process.ProcessException: java.util.concurrent.ExecutionException: com.android.dex.DexException: Multiple dex files define Lcom/google/android/gms/internal/zzr;
```

Solution: Update all your Google Play Services dependencies to the latest version rather than to a specific version.

From the Google Play Services documentation:
*Be sure you update this version number each time Google Play services is updated https://developers.google.com/android/guides/setup#add_google_play_services_to_your_project*

In `android/app/build.gradle`
```gradle
...
dependencies {
    ...
    compile "com.google.android.gms:play-services-base:+"
    compile "com.google.android.gms:play-services-location:+"
    complie "com.google.android.gms:play-services-ads:+"
}
```

### Issue 2 - Multiple dex files define (Again):
```gradle
:app:dexRelease
Unknown source file : UNEXPECTED TOP-LEVEL EXCEPTION:
Unknown source file : com.android.dex.DexException: Multiple dex files define Landroid/support/v7/appcompat/R$anim;````
```

Solution: Upgrade your gradle to properly handle the dex tasks:

In `android/build.gradle`
```gradle
...
dependencies {
    classpath 'com.android.tools.build:gradle:2.1.0'

    // NOTE: Do not place your application dependencies here; they belong
    // in the individual module build.gradle files
}
```

In `android/gradle/wrapper/gradle-wrapper.properties`
````javascript
distributionBase=GRADLE_USER_HOME
distributionPath=wrapper/dists
zipStoreBase=GRADLE_USER_HOME
zipStorePath=wrapper/dists
distributionUrl=https://services.gradle.org/distributions/gradle-2.10-all.zip
````

### Issue 3 - symbol(s) not found for architecture x86_64 and/or OneSignal/OneSignal.h file not found

Solution: Go to your Podfile file, located within the ios folder on the root of your project.
Add the line pod 'OneSignal' as follows:
````
target 'YourApp' do
...
pod 'OneSignal', '1.13.3'

end

target 'YourAppTests' do

end
````

Then head to the terminal, ls to the ios folder on the root of your project, then type `pod install` to install the pods. After that, make sure to drag `OneSignal.framework` from your Pods project on Xcode to the Frameworks folder on your Xcode workspace. Make sure that your `Link Binary With Libraries` on the `Build Phases` section of your target contains the `Onesignal.framework` file as follows.

![OneSignal Framework On Link Binary With Libraries](http://i.imgur.com/r0dgrAH.png)

## CREDITS
Thanks for all the awesome fellows that contributed to this repository!
@danpe, @lunchieapp, @gaykov, @williamrijksen, @adrienbrault, @kennym, @dunghuynh, @holmesal, @joshuapinter

## TODO
 * [ ] Tell us?
