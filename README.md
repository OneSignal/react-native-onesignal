# React Native OneSignal

React Native Push Notifications support with OneSignal integration.


[![npm version](https://img.shields.io/npm/v/react-native-onesignal.svg?style=flat-square)](https://www.npmjs.com/package/react-native-onesignal)
[![npm downloads](https://img.shields.io/npm/dm/react-native-onesignal.svg?style=flat-square)](https://www.npmjs.com/package/react-native-onesignal)

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
                new ReactNativeOneSignalPackage(this) // Add this line
        );
    }
  ......

}
```

## iOS Installation

 * Follow the steps according to the official OneSignal SDK Installation here: https://documentation.onesignal.com/docs/installing-the-onesignal-ios-sdk
 * Make sure you installed the OneSignal Pod.
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

## Handling Notifications
When any notification is opened or received the callback `onNotification` is called passing an object with the notification data.

Notification object example:
```javascript
{
    isActive: false, // BOOLEAN: If the notification was received in foreground or not
    message: 'My Notification Message', // STRING: The notification message
    data: {}, // OBJECT: The push data
}
```

## Sending and Getting OneSignal Tags

We exposed the tags API of OneSignal (currently on Android) in order to segment people in a better way.

````javascript
// Sending the tags for the device
OneSignal.sendTags(missingTags);

//Getting the tags from the server and use the received object
OneSignal.getTags((receivedTags) => {
    console.log(receivedTags);
});

//Delete a tag
OneSignal.deleteTag(tag);
````

## Getting Player ID and Push Token

We exposed the idsAvailable API of OneSignal (both Android & iOS) as a callback so you can handle it further yourself.

*Lets you retrieve the OneSignal user id and push token. Your callback block is called after the device is successfully registered with OneSignal. pushToken will be nil if the user did not accept push notifications.*

````javascript
// Getting idsAvailable
OneSignal.idsAvailable((idsAvailable) => {
    console.log(idsAvailable.pushToken);
    console.log(idsAvailable.userId);
});
````

## Enable Vibration

We exposed the enableVibrate API of OneSignal (Android only).

*You can call this from your UI from a button press for example to give your user's options for your notifications. By default OneSignal always vibrates the device when a notification is displayed unless the device is in a total silent mode. Passing false means that the device will only vibrate lightly when the device is in it's vibrate only mode.*

````javascript
// Setting enableVibrate
OneSignal.enableVibrate(true);
````

## Enable Sound

We exposed the enableSound API of OneSignal (Android only).

*You can call this from your UI from a button press for example to give your user's options for your notifications. By default OneSignal plays the system's default notification sound when the device's notification system volume is turned on. Passing false means that the device will only vibrate unless the device is set to a total silent mode.*

````javascript
// Setting enableSound
OneSignal.enableSound(true);
````

## Enable Notification When App Active

We exposed the enableNotificationsWhenActive API of OneSignal (Android only).

*By default this is false and notifications will not be shown when the user is in your app, instead the NotificationOpenedHandler is fired. If set to true notifications will always show in the notification area and NotificationOpenedHandler will not fire until the user taps on the notification.*

````javascript
// Setting enableNotificationsWhenActive
OneSignal.enableNotificationsWhenActive(true);
````

## Enable In-App Alert Notification

We exposed the enableInAppAlertNotification API of OneSignal (both Android & iOS).

*By default this is false and notifications will not be shown when the user is in your app, instead the OneSignalHandleNotificationBlock is fired. If set to true notifications will be shown as native alert boxes if a notification is received when the user is in your app. The OneSignalHandleNotificationBlock is then fired after the alert box is closed.*

````javascript
// Setting enableInAppAlertNotification
OneSignal.enableInAppAlertNotification(true);
````

## Change User Subscription Status

We exposed the setSubscription API of OneSignal (both Android & iOS).

*You can call this method with false to opt users out of receiving all notifications through OneSignal. You can pass true later to opt users back into notifications*

````javascript
// Setting setSubscription
OneSignal.setSubscription(true);
````

## Prompt Location (Android Only)

We exposed the promptLocation API of OneSignal (currently supported only on Android).

*Prompts the user for location permissions. This allows for geotagging so you can send notifications to users based on location.
Note: Make sure you also have the required location permission in your AndroidManifest.xml.*

````javascript
// Calling promptLocation
OneSignal.promptLocation();
````

## Request Push Notification Permissions

We exposed the requestPermissions API of OneSignal (currently supported only on iOS).

````javascript
// Setting requestPermissions
permissions = {
    alert: true,
    badge: true,
    sound: true
};
OneSignal.requestPermissions(permissions);
````

## Register For Push Notifications

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

### CREDITS
Thanks for all the awesome fellows that contributed to this repository!
@danpe, @lunchieapp, @gaykov, @williamrijksen, @adrienbrault, @kennym, @dunghuynh, @holmesal, @joshuapinter

### TODO
 * [ ] Tell us?
