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
<!-- Add the necessary permissions and receivers -->
<permission
    android:name="${applicationId}.permission.C2D_MESSAGE"
    android:protectionLevel="signature" />
<uses-permission android:name="${applicationId}.permission.C2D_MESSAGE" />
<uses-permission android:name="android.permission.WAKE_LOCK" />
<uses-permission android:name="android.permission.VIBRATE" />

<application ....>
    <activity
        android:launchMode="singleTop"> <!-- Add this parameter -->
    <receiver
        android:name="com.google.android.gms.gcm.GcmReceiver"
        android:exported="true"
        android:permission="com.google.android.c2dm.permission.SEND" >
        <intent-filter>
            <action android:name="com.google.android.c2dm.intent.RECEIVE" />
            <category android:name="${applicationId}" />
        </intent-filter>
    </receiver>

    .....
```

In `android/settings.gradle`
```gradle
...

include ':react-native-onesignal'
project(':react-native-onesignal').projectDir = new File(rootProject.projectDir, '../node_modules/react-native-onesignal/android')
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

In `node_modules/react-native-onesignal/android/build.gradle`

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
```

That step is neccesary right now due to OneSignal SDK tests being performed at build. until we'll find a better solution you'll have to include this snippet twice, Once in your app build.gradle and in the module build.gradle as well.

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

 * Follow the steps according the official OneSignal SDK Installation here: https://documentation.onesignal.com/docs/installing-the-onesignal-ios-sdk
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

````javascript
// Getting idsAvailable
OneSignal.idsAvailable((idsAvailable) => {
    console.log(idsAvailable.pushToken);
    console.log(idsAvailable.playerId);
});
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

### TODO
 * [ ] Tell us?
