# OneSignal No-Location Demo

This lightweight runnable example shows the native build flags for apps that use OneSignal push and in-app messaging, but do not use `OneSignal.Location`.

Run it with:

```sh
vp run ios
vp run android
```

## Setup

Copy `.env.example` to `.env` and set your OneSignal app ID:

```sh
cp .env.example .env
```

Then edit `.env`:

```sh
ONESIGNAL_APP_ID=your-onesignal-app-id
```

Both platforms exclude the native location module by setting the
`ONESIGNAL_DISABLE_LOCATION=true` environment variable when dependencies are
resolved.

## iOS

The `pods` and `update:pods` scripts in `package.json` export the variable so
CocoaPods resolves OneSignal without the location subspec:

```sh
ONESIGNAL_DISABLE_LOCATION=true bundle exec pod install
```

If you run `pod install` or `pod update` manually, set
`ONESIGNAL_DISABLE_LOCATION=true` in that shell too.

## Android

The `android` script in `package.json` exports the variable so Gradle resolves
OneSignal without the location module:

```sh
ONESIGNAL_DISABLE_LOCATION=true bash ../run-android.sh
```

If you build Android another way (Android Studio, a raw `./gradlew` invocation),
set `ONESIGNAL_DISABLE_LOCATION=true` in that environment too.

## App Code

`App.tsx` initializes OneSignal and requests notification permission without calling the `OneSignal.Location` namespace. With the native flags enabled, the build excludes the native OneSignal location module.
