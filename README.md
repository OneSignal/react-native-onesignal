<p align="center">
  <img src="https://onesignal.com/assets/common/logo_onesignal_color.png"/>
</p>

### React Native OneSignal SDK

[![npm version](https://img.shields.io/npm/v/react-native-onesignal.svg)](https://www.npmjs.com/package/react-native-onesignal) [![npm downloads](https://img.shields.io/npm/dm/react-native-onesignal.svg)](https://www.npmjs.com/package/react-native-onesignal)

---

#### ⚠️ Migration Advisory for current OneSignal customers

Our new [user-centric APIs and v5.x.x SDKs](https://onesignal.com/blog/unify-your-users-across-channels-and-devices/) offer an improved user and data management experience. However, they may not be at 1:1 feature parity with our previous versions yet.

If you are migrating an existing app, we suggest using iOS and Android’s Phased Rollout capabilities to ensure that there are no unexpected issues or edge cases. Here is the documentation for each:

- [iOS Phased Rollout](https://developer.apple.com/help/app-store-connect/update-your-app/release-a-version-update-in-phases/)
- [Google Play Staged Rollouts](https://support.google.com/googleplay/android-developer/answer/6346149?hl=en)

If you run into any challenges or have concerns, please contact our support team at support@onesignal.com

---

[OneSignal](https://onesignal.com/) is a free email, sms, push notification, and in-app message service for mobile apps. This SDK makes it easy to integrate your native React-Native iOS and/or Android apps with OneSignal.

#### Requirements

- React Native `>=0.79.0` for `5.4.x` and later. The TurboModule registers itself through the `codegenConfig.ios.modulesProvider` field added in React Native 0.79, so earlier versions will throw `TurboModuleRegistry.getEnforcing(...): 'OneSignal' could not be found` at runtime when the New Architecture is enabled. Apps on React Native `0.76`–`0.78` (including Expo SDK 52) should stay on `5.3.x`, which uses the legacy bridge module and works on the New Architecture via the interop layer.

#### Installation

See the [Setup Guide](https://documentation.onesignal.com/docs/react-native-sdk-setup) for setup instructions.

#### Disable Location Module

By default, `react-native-onesignal` includes OneSignal's native location module so `OneSignal.Location` works without extra setup. If your app does not use location features, you can exclude the native location module from iOS and Android builds.

Set `ONESIGNAL_DISABLE_LOCATION=true` in the environment before resolving or building, for both CocoaPods (iOS) and Gradle (Android). The value is case-insensitive, and `1` is also accepted:

```sh
ONESIGNAL_DISABLE_LOCATION=true pod install        # iOS, from the ios directory
ONESIGNAL_DISABLE_LOCATION=true ./gradlew assembleDebug   # Android, from the android directory
```

For Android, you can also persist the Gradle property in `android/gradle.properties`:

```properties
onesignal.disableLocation=true
```

In GitHub Actions, you can also set it once at the job or step level so
`pod install`, `pod update`, and Gradle builds inherit it:

```yaml
env:
  ONESIGNAL_DISABLE_LOCATION: true
```

When disabled, `OneSignal.Location.requestPermission()` and `OneSignal.Location.setShared()` no-op on native builds without the location module, and `OneSignal.Location.isShared()` resolves `false`.

##### Applying the change (clearing cached pods)

The environment variable is only read when dependencies are **resolved**. CocoaPods pins the resolved pods in `Podfile.lock`, so after changing the variable on an existing project you must reinstall pods in a shell where the variable is exported:

```sh
cd ios
pod deintegrate
rm -rf Pods Podfile.lock
ONESIGNAL_DISABLE_LOCATION=true pod install
```

Gradle re-reads the environment variable or `onesignal.disableLocation` property on each configuration, so a clean build after changing the flag is enough on Android.

> [!IMPORTANT]
> When using Xcode or Android Studio, launch the IDE from a terminal that has `ONESIGNAL_DISABLE_LOCATION` exported. An IDE launched from the Dock/Finder does not inherit variables set only in your shell profile. On CI, key any CocoaPods / Gradle caches on the value of `ONESIGNAL_DISABLE_LOCATION` so a restored cache does not resurrect the location module.

#### Change Log

See this repository's [release tags](https://github.com/OneSignal/react-native-onesignal/releases) for a complete change log of every released version.

#### Support

Please visit this repository's [Github issue tracker](https://github.com/OneSignal/react-native-onesignal/issues) for feature requests and bug reports related specifically to the SDK.
For account issues and support please contact OneSignal support from the [OneSignal.com](https://onesignal.com) dashboard.

#### Demo Project

To make things easier, we have published some demo projects in the `/examples` folder of this repository.
