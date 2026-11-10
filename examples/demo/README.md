# OneSignal React Native Demo

Reference app for `react-native-onesignal`. It showcases SDK features including push notifications, in-app messaging, user management, tags, triggers, outcomes, live activities, and more, using the SDK packed from this repository.

The demo uses Android package `com.onesignal.sdkdemo` and iOS bundle id `com.onesignal.example`.

## Prerequisites

- [React Native environment setup](https://reactnative.dev/docs/set-up-your-environment) for Android and iOS
- Vite+ (`vp`) and Bun
- Ruby with Bundler, for CocoaPods
- Android Studio with a running emulator, and/or Xcode with a booted simulator

## Setup

Install the SDK's dependencies from the repository root, since setup builds and packs the SDK from there:

```sh
vp install
```

Then, in this directory:

```sh
cp .env.example .env
```

Set your OneSignal credentials in `.env`:

```sh
ONESIGNAL_APP_ID=
ONESIGNAL_API_KEY=your-onesignal-api-key
ONESIGNAL_ANDROID_CHANNEL_ID=
```

- `ONESIGNAL_APP_ID`: required. `metro.config.js` fails the bundle when it's unset.
- `ONESIGNAL_API_KEY`: REST API key, used to update and end live activities. Sending notifications from the demo doesn't need it.
- `ONESIGNAL_ANDROID_CHANNEL_ID`: optional Android notification channel for the sound test notification. Falls back to a built-in default channel.

The OneSignal app needs FCM credentials for the `com.onesignal.sdkdemo` Android package and APNs credentials for the `com.onesignal.example` bundle ID on iOS.

To use Firebase on Android, put a `google-services.json` with a `com.onesignal.sdkdemo` client in `android/app/`. It's gitignored, and the Google Services plugin is applied only when it exists. Pass `-PFIREBASE_INSTALLATION_ID_ENABLED=true` to Gradle to turn on Firebase Installation ID registration; the build fails if the flag is on without the file.

For iOS, install CocoaPods on first run:

```sh
bundle install
cd ios && bundle exec pod install && cd ..
```

## Run

```sh
vp run android
vp run ios
```

Each command first runs `setup` (`../setup.sh`), which:

1. Restarts this demo's Metro server if `.env` changed, so the new values are picked up
2. Builds and packs the SDK from the repository root
3. Installs the packed SDK (and the demo's dependencies) into the demo when it changed

It then builds and launches the app with the React Native CLI, which starts Metro if it isn't running. If more than one emulator or simulator is running, the script asks you to pick one.

## Other scripts

| Script                 | Purpose                                                               |
| ---------------------- | --------------------------------------------------------------------- |
| `vp run setup`         | Build, pack, and install the SDK into the demo.                       |
| `vp run start`         | Start Metro.                                                          |
| `vp run update:pods`   | Run `pod update OneSignalXCFramework` after native SDK changes.       |
| `vp run clean:android` | Wipe Android build outputs and uninstall the app from the device.     |
| `vp run clean:ios`     | Wipe iOS build outputs and `ios/Pods`. Run `pod install` again after. |

## Testing iOS Action Button Icons

The iOS demo bundles shared action button icons in both the `demo` and
`OneSignalNotificationServiceExtension` targets. Create an image notification
in the OneSignal dashboard with these action buttons:

- **Save Story** with icon `template-bookmark-icon`
- **Share** with icon `template-share-icon`

Enter the icon names without the `.png` extension. On an iOS 15 or newer
physical device, expand the notification to verify that both icons render.

## Other demos

- [`demo-no-location`](../demo-no-location): app without the native location module

## Build Guide

See [../build.md](../build.md) for the full set of prompts and requirements used to build this app, and [../build-ios.md](../build-ios.md) for the iOS push and live activity setup.
