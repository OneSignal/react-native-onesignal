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
- Clean architecture: repository pattern + React Context + reducer state
- Separate component files per section
- Support both Android and iOS

App bar logo: import SVG directly via `react-native-svg-transformer`:
```tsx
import OneSignalLogo from './assets/onesignal_logo.svg';
<OneSignalLogo width={99} height={22} />
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

Package scripts:
```json
{
  "scripts": {
    "setup": "../setup.sh",
    "preandroid": "bun run setup",
    "preios": "bun run setup"
  }
}
```

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
- `@types/react-native-vector-icons`

Metro config for SVG:
```js
const { assetExts, sourceExts } = defaultConfig.resolver;
module.exports = mergeConfig(defaultConfig, {
  transformer: {
    babelTransformerPath: require.resolve('react-native-svg-transformer/react-native'),
  },
  resolver: {
    assetExts: assetExts.filter(ext => ext !== 'svg'),
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

iOS setup: add to `ios/Podfile`:
```ruby
pod 'RNVectorIcons', :path => '../node_modules/react-native-vector-icons'
```

Android setup: add to `android/app/build.gradle`:
```groovy
apply from: "../../node_modules/react-native-vector-icons/fonts.gradle"
```

---

## OneSignal Repository (SDK API Mapping)

Use the `OneSignal` object from `react-native-onesignal`:

| Operation | SDK Call |
|---|---|
| LoginUser(externalUserId) | `OneSignal.login(externalUserId)` |
| LogoutUser() | `OneSignal.logout()` |
| AddAlias(label, id) | `OneSignal.User.addAlias(label, id)` |
| AddAliases(aliases) | `OneSignal.User.addAliases(aliases)` |
| AddEmail(email) | `OneSignal.User.addEmail(email)` |
| RemoveEmail(email) | `OneSignal.User.removeEmail(email)` |
| AddSms(number) | `OneSignal.User.addSms(number)` |
| RemoveSms(number) | `OneSignal.User.removeSms(number)` |
| AddTag(key, value) | `OneSignal.User.addTag(key, value)` |
| AddTags(tags) | `OneSignal.User.addTags(tags)` |
| RemoveTags(keys) | `OneSignal.User.removeTags(keys)` |
| AddTrigger(key, value) | `OneSignal.InAppMessages.addTrigger(key, value)` |
| AddTriggers(triggers) | `OneSignal.InAppMessages.addTriggers(triggers)` |
| RemoveTriggers(keys) | `OneSignal.InAppMessages.removeTriggers(keys)` |
| ClearTriggers() | `OneSignal.InAppMessages.clearTriggers()` |
| SendOutcome(name) | `OneSignal.Session.addOutcome(name)` |
| SendUniqueOutcome(name) | `OneSignal.Session.addUniqueOutcome(name)` |
| SendOutcomeWithValue(name, value) | `OneSignal.Session.addOutcomeWithValue(name, value)` |
| TrackEvent(name, properties) | `OneSignal.User.trackEvent(name, properties)` |
| GetPushSubscriptionId() | `await OneSignal.User.pushSubscription.getIdAsync()` |
| IsPushOptedIn() | `await OneSignal.User.pushSubscription.getOptedInAsync()` |
| OptInPush() | `OneSignal.User.pushSubscription.optIn()` |
| OptOutPush() | `OneSignal.User.pushSubscription.optOut()` |
| ClearAllNotifications() | `OneSignal.Notifications.clearAll()` |
| HasPermission() | `await OneSignal.Notifications.getPermissionAsync()` |
| RequestPermission(fallback) | `OneSignal.Notifications.requestPermission(fallback)` |
| SetPaused(paused) | `OneSignal.InAppMessages.setPaused(paused)` |
| SetLocationShared(shared) | `OneSignal.Location.setShared(shared)` |
| RequestLocationPermission() | `OneSignal.Location.requestPermission()` |
| SetConsentRequired(required) | `OneSignal.setConsentRequired(required)` |
| SetConsentGiven(granted) | `OneSignal.setConsentGiven(granted)` |
| GetExternalId() | `OneSignal.User.getExternalId()` |
| GetOnesignalId() | `OneSignal.User.getOnesignalId()` |

REST API client uses built-in `fetch`.

---

## SDK Initialization & Observers

In `App.tsx`, initialize before rendering:
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

---

## State Management (Context + Reducer)

- `AppContextProvider` at the root of the component tree, owns all state via `useReducer`
- Expose state and actions through `useAppContext()`
- `OneSignalRepository` is a plain TypeScript class (not a Context)
- Initialize SDK before rendering, fetch tooltips in background (non-blocking)

### Persistence

- `PreferencesService` wraps `AsyncStorage`
- Triggers list (`triggersList`) is NOT persisted

### SDK State Restoration

In `App.tsx`, restore from `AsyncStorage` BEFORE `initialize`:
```typescript
OneSignal.setConsentRequired(cachedConsentRequired);
OneSignal.setConsentGiven(cachedPrivacyConsent);
OneSignal.initialize(appId);
```

Then AFTER initialize:
```typescript
OneSignal.InAppMessages.setPaused(cachedPausedStatus);
OneSignal.Location.setShared(cachedLocationShared);
```

In `AppContextProvider`, read UI state from SDK (not cache):
- `OneSignal.User.getExternalId()` for external user ID

---

## React Native-Specific UI Details

### Notification Permission
- Call `appContext.promptPush()` in a `useEffect` with empty deps in `HomeScreen`

### Loading Overlay
- `ActivityIndicator` centered in a full-screen semi-transparent overlay
- Absolute positioned `View` based on `isLoading` state
- Use `await new Promise(resolve => setTimeout(resolve, 100))` after setting state for render delay

### Toast Messages
- `react-native-toast-message` with `<Toast position="bottom" bottomOffset={20} />` at root of `App.tsx`
- Call `Toast.show({ type: 'info', text1: message })` from action handlers
- Call `Toast.hide()` before showing new toast if needed

### Send In-App Message Icons
- TOP BANNER: `format-vertical-align-top` (MaterialCommunityIcons)
- BOTTOM BANNER: `format-vertical-align-bottom`
- CENTER MODAL: `crop-square`
- FULL SCREEN: `fullscreen`

### Secondary Screen
- Title set via React Navigation header options
- Content: centered text with large font style

### Dialogs
- All modals use `Modal` component with `padding: 16` and `width: '100%'` inner container
- `MultiSelectRemoveModal` uses custom checkbox rows with `TouchableOpacity` + icon (RN has no built-in Checkbox on both platforms)
- JSON parsing via `JSON.parse` returns `Record<string, unknown>` for Track Event

### Accessibility (Appium)
- Use `testID` prop:
  ```tsx
  <Text testID={`log_entry_${index}_message`}>{entry.message}</Text>
  ```

### Log Manager
- Singleton with subscriber callbacks for reactive UI updates
- `.d(tag, message)`, `.i()`, `.w()`, `.e()` with `console.log/warn/error` forwarding

---

## Theme

Create `src/theme.ts` with `AppColors`, `AppSpacing`, and `AppTheme` objects. Export reusable `StyleSheet` base styles (cards, buttons, typography, shadows) mapped from the shared style reference.

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

### Custom Notification Sound

Copy `vine_boom.wav` from [sdk-shared/assets](https://github.com/OneSignal/sdk-shared/tree/main/assets) and place in:

- **Android**: `android/app/src/main/res/raw/vine_boom.wav`
- **iOS**: `ios/demo/vine_boom.wav` (add to Xcode project as a bundle resource)

---

## Key Files Structure

```
examples/demo/
├── src/
│   ├── App.tsx
│   ├── theme.ts
│   ├── models/
│   │   ├── UserData.ts
│   │   ├── NotificationType.ts
│   │   └── InAppMessageType.ts
│   ├── services/
│   │   ├── OneSignalApiService.ts
│   │   ├── PreferencesService.ts
│   │   ├── TooltipHelper.ts
│   │   └── LogManager.ts
│   ├── repositories/
│   │   └── OneSignalRepository.ts
│   ├── context/
│   │   └── AppContext.tsx
│   ├── screens/
│   │   ├── HomeScreen.tsx
│   │   └── SecondaryScreen.tsx
│   └── components/
│       ├── SectionCard.tsx
│       ├── ToggleRow.tsx
│       ├── ActionButton.tsx
│       ├── ListWidgets.tsx
│       ├── LoadingOverlay.tsx
│       ├── LogView.tsx
│       ├── modals/
│       │   ├── SingleInputModal.tsx
│       │   ├── PairInputModal.tsx
│       │   ├── MultiPairInputModal.tsx
│       │   ├── MultiSelectRemoveModal.tsx
│       │   ├── LoginModal.tsx
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
│           ├── TrackEventSection.tsx
│           └── LocationSection.tsx
├── android/
├── ios/
├── package.json
├── tsconfig.json
└── metro.config.js
```

---

## React Native Best Practices

- **TypeScript strict mode** on all source files, avoiding `any` and type assertions
- **React Context** for dependency injection, avoiding global mutable state
- **Cleanup in useEffect** return functions for all SDK event listeners
- **testID** props on interactive elements for Appium test automation
- **Immutable state** updates using spread/map/filter rather than direct mutation
- **Consistent theming** via `theme.ts` using the shared style reference
- **Minimal re-renders** via `useMemo`/`useCallback` where appropriate
- **No native modules beyond SDK** since the OneSignal React Native SDK handles all bridging
