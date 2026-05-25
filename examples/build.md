# OneSignal React Native Sample App - Build Guide

This document extends the shared build guide with React Native-specific details.

**Read the shared guide first:**
https://raw.githubusercontent.com/OneSignal/sdk-shared/refs/heads/main/demo/build.md

Replace `{{PLATFORM}}` with `React Native` everywhere in that guide. Everything below either overrides or supplements sections from the shared guide.

---

## Project Setup

Create a new React Native project at `examples/demo/` (relative to the SDK repo root):

```bash
npx @react-native-community/cli init demo --template react-native-template-typescript
mv demo examples/demo
```

- TypeScript strict mode enabled
- Architecture: provider + hook (`OneSignalProvider` / `useOneSignal`), no repository class, no reducer
- Separate component files per section
- Support both Android and iOS

App bar logo: import SVG directly via `react-native-svg-transformer`:

```tsx
import OneSignalLogo from './assets/onesignal_logo.svg';
<OneSignalLogo width={99} height={22} />;
```

App icon generation:

```bash
bun examples/generate-icons.ts
```

Local SDK reference via packed tarball:

```json
"react-native-onesignal": "file:../../react-native-onesignal.tgz"
```

A `setup.sh` script in `examples/` handles building, packing, and installing automatically.

Package scripts (`examples/demo/package.json`):

```json
{
  "scripts": {
    "setup": "../setup.sh",
    "preandroid": "vp run setup",
    "preios": "vp run setup",
    "android": "bash ../run-android.sh",
    "ios": "bash ../run-ios.sh",
    "update:pods": "(cd ios && pod update OneSignalXCFramework --no-repo-update)",
    "clean:android": "rm -rf android/app/build android/app/.cxx android/build && adb uninstall com.onesignal.example >/dev/null 2>&1 || true",
    "clean:ios": "rm -rf ios/build ios/Pods",
    "start": "react-native start"
  },
  "packageManager": "bun@1.3.13"
}
```

- `packageManager` field pins the bun version Corepack/Volta should activate.
- `preandroid`/`preios` shell out to `vp run setup` so the local SDK tarball is rebuilt before each native run.

### Dependencies (package.json)

Runtime:

- `react-native-onesignal` (local tarball)
- `@react-native-async-storage/async-storage` for local persistence
- `react-native-svg` for SVG rendering
- `react-native-vector-icons` for Material icons
- `@react-navigation/native`, `@react-navigation/native-stack` for navigation
- `react-native-screens`, `react-native-safe-area-context` (navigation peer deps)
- `react-native-toast-message` for toast/snackbar feedback

Dev:

- `react-native-svg-transformer` for importing `.svg` files as components
- `react-native-dotenv` Babel plugin for `.env` loading
- `@types/react-native-vector-icons`

Metro config for SVG:

```js
const { assetExts, sourceExts } = defaultConfig.resolver;
module.exports = mergeConfig(defaultConfig, {
  transformer: {
    babelTransformerPath: require.resolve('react-native-svg-transformer'),
  },
  resolver: {
    assetExts: assetExts.filter((ext) => ext !== 'svg'),
    sourceExts: [...sourceExts, 'svg'],
  },
});
```

TypeScript SVG declaration (`types/svg.d.ts`):

```ts
declare module '*.svg' {
  import type { FunctionComponent } from 'react';
  import type { SvgProps } from 'react-native-svg';
  const content: FunctionComponent<SvgProps>;
  export default content;
}
```

iOS vector-icons: autolinked via `use_native_modules!` in `ios/Podfile`; no manual `pod` entry required.

Android setup: add to `android/app/build.gradle`:

```groovy
apply from: "../../node_modules/react-native-vector-icons/fonts.gradle"
```

### Environment variables

- `react-native-dotenv` Babel plugin loads `.env` at build time; module id is `@env`.
- `types/env.d.ts` declares typed exports so imports like `import { ONESIGNAL_APP_ID } from '@env'` type-check.
- Keys read by the demo:
  - `ONESIGNAL_APP_ID` -- app id passed to `OneSignal.initialize(...)`.
  - `ONESIGNAL_API_KEY` -- REST key used by `OneSignalApiService` for sends and Live Activity update/end.
  - `ONESIGNAL_ANDROID_CHANNEL_ID` -- channel id sent with the WITH SOUND push (`android_channel_id`).
- `src/hooks/useOneSignal.ts` defines a hardcoded `DEFAULT_APP_ID` fallback used when `ONESIGNAL_APP_ID` is unset/empty.

---

## OneSignal SDK API Mapping

Use the `OneSignal` object from `react-native-onesignal`:

| Operation                         | SDK Call                                                  |
| --------------------------------- | --------------------------------------------------------- |
| LoginUser(externalUserId)         | `OneSignal.login(externalUserId)`                         |
| LogoutUser()                      | `OneSignal.logout()`                                      |
| AddAlias(label, id)               | `OneSignal.User.addAlias(label, id)`                      |
| AddAliases(aliases)               | `OneSignal.User.addAliases(aliases)`                      |
| AddEmail(email)                   | `OneSignal.User.addEmail(email)`                          |
| RemoveEmail(email)                | `OneSignal.User.removeEmail(email)`                       |
| AddSms(number)                    | `OneSignal.User.addSms(number)`                           |
| RemoveSms(number)                 | `OneSignal.User.removeSms(number)`                        |
| AddTag(key, value)                | `OneSignal.User.addTag(key, value)`                       |
| AddTags(tags)                     | `OneSignal.User.addTags(tags)`                            |
| RemoveTags(keys)                  | `OneSignal.User.removeTags(keys)`                         |
| AddTrigger(key, value)            | `OneSignal.InAppMessages.addTrigger(key, value)`          |
| AddTriggers(triggers)             | `OneSignal.InAppMessages.addTriggers(triggers)`           |
| RemoveTriggers(keys)              | `OneSignal.InAppMessages.removeTriggers(keys)`            |
| ClearTriggers()                   | `OneSignal.InAppMessages.clearTriggers()`                 |
| SendOutcome(name)                 | `OneSignal.Session.addOutcome(name)`                      |
| SendUniqueOutcome(name)           | `OneSignal.Session.addUniqueOutcome(name)`                |
| SendOutcomeWithValue(name, value) | `OneSignal.Session.addOutcomeWithValue(name, value)`      |
| TrackEvent(name, properties)      | `OneSignal.User.trackEvent(name, properties)`             |
| GetPushSubscriptionId()           | `await OneSignal.User.pushSubscription.getIdAsync()`      |
| IsPushOptedIn()                   | `await OneSignal.User.pushSubscription.getOptedInAsync()` |
| OptInPush()                       | `OneSignal.User.pushSubscription.optIn()`                 |
| OptOutPush()                      | `OneSignal.User.pushSubscription.optOut()`                |
| ClearAllNotifications()           | `OneSignal.Notifications.clearAll()`                      |
| HasPermission()                   | `await OneSignal.Notifications.getPermissionAsync()`      |
| RequestPermission(fallback)       | `OneSignal.Notifications.requestPermission(fallback)`     |
| SetPaused(paused)                 | `OneSignal.InAppMessages.setPaused(paused)`               |
| SetLocationShared(shared)         | `OneSignal.Location.setShared(shared)`                    |
| RequestLocationPermission()       | `OneSignal.Location.requestPermission()`                  |
| SetConsentRequired(required)      | `OneSignal.setConsentRequired(required)`                  |
| SetConsentGiven(granted)          | `OneSignal.setConsentGiven(granted)`                      |
| GetExternalId()                   | `OneSignal.User.getExternalId()`                          |
| GetOnesignalId()                  | `OneSignal.User.getOnesignalId()`                         |

REST API client uses built-in `fetch` (see `OneSignalApiService`).

---

## SDK Initialization & Observers

All SDK init, listeners, and state restoration live inside `src/hooks/useOneSignal.ts` in a `useEffect` that runs after first render. `App.tsx` only sets up navigation, calls `TooltipHelper.init()`, and wraps the tree in `OneSignalProvider` + `ToastProvider`.

Inside the hook's load function:

```typescript
OneSignal.Debug.setLogLevel(LogLevel.Verbose);
OneSignal.setConsentRequired(cachedConsentRequired);
OneSignal.setConsentGiven(cachedPrivacyConsent);
OneSignal.initialize(appId);
```

Event listeners (addEventListener pattern):

```typescript
OneSignal.InAppMessages.addEventListener('willDisplay', handler);
OneSignal.InAppMessages.addEventListener('didDisplay', handler);
OneSignal.InAppMessages.addEventListener('willDismiss', handler);
OneSignal.InAppMessages.addEventListener('didDismiss', handler);
OneSignal.InAppMessages.addEventListener('click', handler);
OneSignal.Notifications.addEventListener('click', handler);
OneSignal.Notifications.addEventListener('foregroundWillDisplay', handler);
```

After initialization, restore cached state:

```typescript
OneSignal.InAppMessages.setPaused(cachedPausedStatus);
OneSignal.Location.setShared(cachedLocationShared);
```

Observers (cleanup in `useEffect` return):

```typescript
OneSignal.User.pushSubscription.addEventListener('change', handler);
OneSignal.Notifications.addEventListener('permissionChange', handler);
OneSignal.User.addEventListener('change', handler);
```

### Foreground notification handler

- `foregroundWillDisplay` calls `e.getNotification().display()` inside `useOneSignal.ts` so foreground pushes are still shown by the OS UI.

---

## State Management (provider + hook)

- State lives in a single `OneSignalProvider` exposed via `useOneSignal()` (`src/hooks/useOneSignal.ts`). No Context+reducer, no repository class. The hook uses many `useState` hooks internally.
- SDK init: all SDK init, listeners, and state restoration happen inside `useOneSignal.ts` in a `useEffect` (after first render). `App.tsx` only sets up navigation, `TooltipHelper.init()`, and the `OneSignalProvider` + `ToastProvider` wrappers.
- Restoration order: consent flags BEFORE `OneSignal.initialize(...)`; IAM paused + location shared AFTER initialize; `OneSignal.login(storedExternalUserId)` after initialize if cached.
- Stale-result protection: `requestSequenceRef` in the hook drops out-of-date REST results from rapid back-to-back fetches.
- REST client: `OneSignalApiService` singleton for push sends, user fetch, and Live Activity update/end.
- Initialize SDK from the hook's effect, fetch tooltips in background (non-blocking) from `App.tsx`.

### Persistence

- `PreferencesService` wraps `AsyncStorage`
- Triggers list (`triggersList`) is NOT persisted

### SDK State Restoration

In `useOneSignal.ts`, restore from `AsyncStorage` BEFORE `initialize`:

```typescript
OneSignal.setConsentRequired(cachedConsentRequired);
OneSignal.setConsentGiven(cachedPrivacyConsent);
OneSignal.initialize(appId);
```

Then AFTER initialize:

```typescript
OneSignal.InAppMessages.setPaused(cachedPausedStatus);
OneSignal.Location.setShared(cachedLocationShared);
if (storedExternalUserId) OneSignal.login(storedExternalUserId);
```

External ID is read in `useOneSignal.ts` during init (via `OneSignal.User.getExternalId()`) and via the user-change listener; there is no `AppContextProvider`.

### REST API service

- `OneSignalApiService` singleton in `src/services/` -- used for push sends (`sendNotification`, `sendCustomNotification`), user fetch (`fetchUser`), and Live Activity `update`/`end`.

---

## React Native-Specific UI Details

### Notification Permission

- `useEffect` gated on `isReady`: `useEffect(() => { if (isReady) promptPush(); }, [isReady, promptPush])` in `HomeScreen.tsx`.

### Loading Indicator

- No full-screen overlay. List sections (Aliases, Emails, SMS, Tags) render an inline `LoadingState` in `ListWidgets.tsx` when `isLoading` is true.

### Toast Messages

- Single `ToastProvider` (`src/components/ToastProvider.tsx`) wraps `<App/>` in `App.tsx` and owns `react-native-toast-message`'s `<Toast position="bottom" bottomOffset={20} />` host plus the imperative `showSnackbar` function.
- The provider exports a `useSnackbar()` hook returning `(message: string) => void`. Section components call `const showSnackbar = useSnackbar()` at the top of the component body and invoke it from action handlers for the allowed actions (Outcomes, Custom Events, Location check).
- Replace-on-show: `showSnackbar` calls `Toast.hide()` before `Toast.show({ type: 'info', text1: message, visibilityTime: TOAST_DURATION_MS })`.
- Duration is the module-level constant `TOAST_DURATION_MS = 3000`.
- Do not place a second `<Toast />` host anywhere else in the tree; the `ToastProvider` is the sole host.
- The OneSignal provider/hook must not hold toast state or expose toast messages.

### AppHeader

- `src/components/AppHeader.tsx` is a custom stack header with a back button and `useSafeAreaInsets()` padding; wired via `screenOptions.header` in `App.tsx`'s `Stack.Navigator`.

### Secondary Screen

- Title set via React Navigation header options
- Content: centered text with large font style

### Dialogs

- The home screen owns layout + `TooltipModal` only. Tooltip visibility is a single local `tooltipOpen` boolean; action dialog state never lives here or in the OneSignal provider.
- Sections render `Modal` components as siblings of `SectionCard`, with one local `useState` boolean per dialog (`open`, `loginOpen`, `addOpen`, `removeOpen`, ...). Section button press sets the flag; modal `onSubmit` calls the SDK callback received via props, then closes the modal and (where applicable) calls `showSnackbar`.
- All modals use the RN `Modal` component with `AppDialogStyles.backdrop` (`padding: 16`) and `AppDialogStyles.container` from `src/theme.ts`. `MultiSelectRemoveModal` uses custom checkbox rows with `TouchableOpacity` + icon (RN has no cross-platform built-in `Checkbox`). JSON parsing via `JSON.parse` returns `Record<string, unknown>` for Track Event.
- Shared modal primitives live in `src/components/modals/` (`SingleInputModal`, `PairInputModal`, `MultiPairInputModal`, `MultiSelectRemoveModal`, `OutcomeModal`, `TrackEventModal`, `CustomNotificationModal`, `TooltipModal`).
- Login: there is no dedicated `LoginModal`. `UserSection.tsx` uses `SingleInputModal` for the login user-id prompt.
- Do not centralize action dialogs in a `DialogState` union on the home screen and do not lift dialog visibility into the OneSignal provider.

### Accessibility (Appium)

- Use `testID` props on interactive/structural elements. Real examples from the demo:

  ```tsx
  <ScrollView testID="main_scroll_view">...</ScrollView>
  <SectionCard sectionKey="custom_events" />        // renders testID="custom_events_section"
  <ActionButton testID="add_tag_button" />
  <ActionButton testID="track_event_button" />
  ```

---

## Live Activities (iOS only)

- `LiveActivitySection` (`src/components/sections/LiveActivitySection.tsx`) is rendered from `HomeScreen.tsx` only when `Platform.OS === 'ios'`.
- `useOneSignal.ts` calls `OneSignal.LiveActivities.setupDefault({ enablePushToStart: true, enablePushToUpdate: true })` during init.
- `start` uses `OneSignal.LiveActivities.startDefault(activityId, attributes, content)` via the hook's `startDefaultLiveActivity`.
- `update` and `end` go through `OneSignalApiService.updateLiveActivity(activityId, 'update'|'end', eventUpdates)` against `https://api.onesignal.com/apps/{appId}/live_activities/{activityId}/notifications`, authenticated with `Key {ONESIGNAL_API_KEY}`.
- The Live Activity UI is gated client-side on `OneSignalApiService.hasApiKey()` so the section degrades cleanly when `ONESIGNAL_API_KEY` is unset.

## iOS app extensions

`ios/Podfile` declares two extra Pod targets next to the app:

- `OneSignalNotificationServiceExtension` -- NSE for rich media / mutable-content pushes; pulls `OneSignalXCFramework`.
- `OneSignalWidgetExtension` -- Live Activity widget target; pulls `OneSignalXCFramework`.

Both targets pin `OneSignalXCFramework '>= 5.0.0', '< 6.0'` and ship alongside the main `demo` app target which uses `use_native_modules!` + `use_react_native!`.

---

## Theme

Create `src/theme.ts` with `AppColors`, `AppSpacing`, `AppTheme`, `AppDialogStyles`, and `AppInputProps`. Export reusable `StyleSheet` base styles (cards, buttons, typography, dialogs) mapped from the shared style reference.

---

## Platform Config

### Android

```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
```

### iOS

- Standard React Native setup with push notification entitlement
- NSE + Widget targets defined in `ios/Podfile` (see "iOS app extensions" above)

### Custom Notification Sound

- **Android**: the WITH SOUND push sends `android_channel_id` (`ONESIGNAL_ANDROID_CHANNEL_ID` env var, with a hardcoded fallback) in `OneSignalApiService.ts`. The demo bundles `android/app/src/main/res/raw/vine_boom.wav` so the sound is available on-device; the channel itself is also configured server-side on the OneSignal app.
- **iOS**: the WITH SOUND push sends `ios_sound: 'vine_boom.wav'`. The asset is bundled at `ios/demo/vine_boom.wav` and wired into the `demo` Xcode target. If you start from a fresh clone and the asset is missing, copy it from [sdk-shared/assets](https://github.com/OneSignal/sdk-shared/tree/main/assets) and drag into Xcode as a bundle resource.

---

## Key Files Structure

```
examples/demo/
├── App.tsx
├── index.js
├── app.json
├── babel.config.js
├── metro.config.js
├── package.json
├── tsconfig.json
├── assets/
├── types/
│   ├── env.d.ts
│   └── svg.d.ts
├── src/
│   ├── theme.ts
│   ├── models/
│   │   ├── UserData.ts
│   │   ├── NotificationType.ts
│   │   └── InAppMessageType.ts
│   ├── services/
│   │   ├── OneSignalApiService.ts
│   │   ├── PreferencesService.ts
│   │   └── TooltipHelper.ts
│   ├── hooks/
│   │   └── useOneSignal.ts
│   ├── screens/
│   │   ├── HomeScreen.tsx
│   │   └── SecondaryScreen.tsx
│   └── components/
│       ├── AppHeader.tsx
│       ├── ToastProvider.tsx
│       ├── SectionCard.tsx
│       ├── ToggleRow.tsx
│       ├── ActionButton.tsx
│       ├── ListWidgets.tsx
│       ├── modals/
│       │   ├── SingleInputModal.tsx
│       │   ├── PairInputModal.tsx
│       │   ├── MultiPairInputModal.tsx
│       │   ├── MultiSelectRemoveModal.tsx
│       │   ├── OutcomeModal.tsx
│       │   ├── TrackEventModal.tsx
│       │   ├── CustomNotificationModal.tsx
│       │   └── TooltipModal.tsx
│       └── sections/
│           ├── AppSection.tsx
│           ├── UserSection.tsx
│           ├── PushSection.tsx
│           ├── SendPushSection.tsx
│           ├── InAppSection.tsx
│           ├── SendIamSection.tsx
│           ├── AliasesSection.tsx
│           ├── EmailsSection.tsx
│           ├── SmsSection.tsx
│           ├── TagsSection.tsx
│           ├── OutcomesSection.tsx
│           ├── TriggersSection.tsx
│           ├── CustomEventsSection.tsx
│           ├── LocationSection.tsx
│           └── LiveActivitySection.tsx
├── android/
└── ios/
```

The `CustomEventsSection.tsx` renders the "Custom Events" card (title `"Custom Events"`, `sectionKey="custom_events"`) and is the only place `OneSignal.User.trackEvent` is invoked.

---

## React Native Best Practices

- **TypeScript strict mode** on all source files, avoiding `any` and type assertions
- **Provider + hook** (`OneSignalProvider` / `useOneSignal`) for dependency injection, avoiding global mutable state
- **Cleanup in useEffect** return functions for all SDK event listeners
- **testID** props on interactive elements for Appium test automation
- **Immutable state** updates using spread/map/filter rather than direct mutation
- **Consistent theming** via `theme.ts` using the shared style reference
- **Minimal re-renders** via `useMemo`/`useCallback` where appropriate
- **No native modules beyond SDK** since the OneSignal React Native SDK handles all bridging
