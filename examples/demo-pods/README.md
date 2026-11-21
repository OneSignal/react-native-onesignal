# OneSignal React Native Demo (CocoaPods)

The [`demo`](../demo) app's iOS build, integrated with CocoaPods. Use it to check the SDK in apps that have not moved to React Native's Swift Package Manager mode.

The JavaScript (`App.tsx`, `src/`, `assets/`, `types/`) must stay identical to `demo`; a test in the repository root fails when they drift. Make JavaScript changes in `demo` and copy them here. There is no Android project here; use `demo` for Android.

## Setup

Install the SDK's dependencies from the repository root, since setup builds and packs the SDK from there:

```sh
vp install
```

Then, in this directory, copy `.env.example` to `.env` and set your credentials as described in the [`demo` README](../demo/README.md#setup). Install CocoaPods on first run:

```sh
bundle install
cd ios && bundle exec pod install && cd ..
```

## Run

```sh
vp run ios
```

## Other scripts

| Script               | Purpose                                                               |
| -------------------- | --------------------------------------------------------------------- |
| `vp run setup`       | Build, pack, and install the SDK into the demo.                       |
| `vp run start`       | Start Metro.                                                          |
| `vp run update:pods` | Run `pod update OneSignalXCFramework` after native SDK changes.       |
| `vp run clean:ios`   | Wipe iOS build outputs and `ios/Pods`. Run `pod install` again after. |
