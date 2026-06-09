# OneSignal No-Location Demo

This lightweight runnable example shows the native build flags for apps that use OneSignal push and in-app messaging, but do not use `OneSignal.Location`.

Run it with:

```sh
vp run ios
vp run android
```

## iOS

The CocoaPods flag is set before `use_native_modules!` installs React Native pods:

```ruby
$OneSignalDisableLocation = true
```

See `ios/Podfile`.

## Android

The Gradle property is set in `android/gradle.properties`:

```properties
OneSignal_disableLocation=true
```

## App Code

`App.tsx` initializes OneSignal and requests notification permission without calling the `OneSignal.Location` namespace. With the native flags enabled, the build excludes the native OneSignal location module.
