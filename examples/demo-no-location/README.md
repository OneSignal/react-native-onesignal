# OneSignal No-Location Demo

This lightweight runnable example shows the native build flags for apps that use OneSignal push and in-app messaging, but do not use `OneSignal.Location`.

Run it with:

```sh
vp run ios
vp run android
```

Both platforms exclude the native location module by setting the
`ONESIGNAL_DISABLE_LOCATION=true` environment variable when dependencies are
resolved.

## iOS

`ios/Podfile` exports the variable before React Native installs pods, so
`pod install` resolves OneSignal without the location subspec:

```ruby
ENV['ONESIGNAL_DISABLE_LOCATION'] = 'true'
```

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
