# OneSignal React Native Sample App - Build Guide

This document contains all the prompts and requirements needed to build the OneSignal React Native Sample App from scratch. Give these prompts to an AI assistant or follow them manually to recreate the app.

---

## Phase 0: Reference Screenshots (REQUIRED)

### Prompt 0.1 - Capture Reference UI

```
Before building anything, an Android emulator MUST be running with the
reference OneSignal demo app installed. These screenshots are the source
of truth for the UI you are building. Do NOT proceed to Phase 1 without them.

Check for connected emulators:
  adb devices

If no device is listed, stop and ask the user to start one.

Identify which emulator has com.onesignal.sdktest installed by checking each listed device, e.g.:
  adb -s emulator-5554 shell pm list packages 2>/dev/null | grep -i onesignal
  adb -s emulator-5556 shell pm list packages 2>/dev/null | grep -i onesignal

Use that emulator's serial (e.g. emulator-5556) for all subsequent adb commands via the -s flag.

Launch the reference app:
  adb -s <emulator-serial> shell am start -n com.onesignal.sdktest/.ui.main.MainActivity

Dismiss any in-app messages that appear on launch. Tap the X or
click-through button on each IAM until the main UI is fully visible
with no overlays.

Create an output directory:
  mkdir -p /tmp/onesignal_reference

Capture screenshots by scrolling through the full UI:
1. Take a screenshot from the top of the screen:
     adb shell screencap -p /sdcard/ref_01.png && adb pull /sdcard/ref_01.png /tmp/onesignal_reference/ref_01.png
2. Scroll down by roughly one viewport height:
     adb shell input swipe 500 1500 500 500
3. Take the next screenshot (ref_02.png, ref_03.png, etc.)
4. Repeat until you've reached the bottom of the scrollable content

You MUST read each captured screenshot image so you can see the actual UI.
These images define the visual target for every section you build later.
Pay close attention to:
  - Section header style and casing
  - Card vs non-card content grouping
  - Button placement (inside vs outside cards)
  - List item layout (stacked vs inline key-value)
  - Icon choices (delete, close, info, etc.)
  - Typography, spacing, and colors
  - Spacing: 12px gap between sections, 8px gap between cards/buttons within a section

You can also interact with the reference app to observe specific flows:

Dump the UI hierarchy to find elements by resource-id, text, or content-desc:
  adb shell uiautomator dump /sdcard/ui.xml && adb pull /sdcard/ui.xml /tmp/onesignal_reference/ui.xml

Parse the XML to find an element's bounds, then tap it:
  adb shell input tap <centerX> <centerY>

Type into a focused text field:
  adb shell input text "test"

Example flow to observe "Add Tag" behavior:
  1. Dump UI -> find the ADD button bounds -> tap it
  2. Dump UI -> find the Key and Value fields -> tap and type into them
  3. Tap the confirm button -> screenshot the result
  4. Compare the tag list state before and after

Also capture screenshots of key dialogs to match their layout:
  - Add Alias (single pair input)
  - Add Multiple Aliases/Tags (dynamic rows with add/remove)
  - Remove Selected Tags (checkbox multi-select)
  - Login User
  - Send Outcome (radio options)
  - Track Event (with JSON properties field)
  - Custom Notification (title + body)
These dialog screenshots are important for matching field layout,
button placement, spacing, and validation behavior.

Refer back to these screenshots throughout all remaining phases whenever
you need to decide on layout, spacing, section order, dialog flows, or
overall look and feel.
```

---

## Phase 1: Initial Setup

### Prompt 1.1 - Project Foundation

```
Create a new React Native project at examples/demo/ (relative to the SDK repo root)
using the TypeScript template:

  npx @react-native-community/cli init demo --template react-native-template-typescript
  mv demo examples/demo

Build the app with:
- Clean architecture: repository pattern with React Context + reducer-based state management
- TypeScript with strict mode enabled
- OneSignal brand colors and a consistent stylesheet-based theme
- App name: "OneSignal Demo"
- Top navigation header: centered title with OneSignal logo SVG + "Sample App" text
- Support for both Android and iOS
- Android package name: com.onesignal.example
- iOS bundle identifier: com.onesignal.example
- All dialogs should have EMPTY input fields (for Appium testing - test framework enters values)
- Separate component files per section to keep files focused and readable

Download the app bar logo SVG from:
  https://raw.githubusercontent.com/OneSignal/sdk-shared/refs/heads/main/assets/onesignal_logo.svg
Save it to the demo project at assets/onesignal_logo.svg and use it for the header logo via react-native-svg.

Download the padded app icon PNG from:
  https://raw.githubusercontent.com/OneSignal/sdk-shared/refs/heads/main/assets/onesignal_logo_icon_padded.png
Save it to assets/onesignal_logo_icon_padded.png, generate all platform app icons using:
  bun examples/generate-icons.ts

Reference the OneSignal React Native SDK from the parent repo using a packed tarball:
  "react-native-onesignal": "file:../../react-native-onesignal.tgz"

A setup.sh script in examples/ handles building, packing, and installing automatically.
Add/verify the following scripts in package.json:
  "setup": "../setup.sh",
  "preandroid": "bun run setup",
  "preios": "bun run setup",
```

### Prompt 1.2 - Dependencies (package.json)

```
Add these dependencies to package.json:

dependencies:
  react-native-onesignal: file:../../           # OneSignal SDK (local path)
  @react-native-async-storage/async-storage: ^2.1.0  # Local persistence
  react-native-svg: ^15.8.0                    # SVG rendering (header logo)
  react-native-vector-icons: ^10.2.0           # Material icons
  @react-navigation/native: ^6.1.0             # Navigation
  @react-navigation/native-stack: ^6.11.0      # Stack navigator
  react-native-screens: ^3.29.0               # Navigation peer dep
  react-native-safe-area-context: ^4.10.0     # Safe area handling
  react-native-toast-message: ^2.2.0          # Toast/SnackBar equivalent

devDependencies:
  @types/react-native-vector-icons: ^6.4.18
  @typescript-eslint/eslint-plugin: ^7.0.0
  @typescript-eslint/parser: ^7.0.0
  eslint: ^8.57.0

After installing, run pod install for iOS:
  cd ios && pod install && cd ..

For react-native-vector-icons on iOS, add to ios/Podfile:
  pod 'RNVectorIcons', :path => '../node_modules/react-native-vector-icons'

For react-native-vector-icons on Android, add to android/app/build.gradle:
  apply from: "../../node_modules/react-native-vector-icons/fonts.gradle"
```

### Prompt 1.3 - OneSignal Repository

```
Create a OneSignalRepository class that centralizes all OneSignal SDK calls.
This is a plain TypeScript class (not a Context) used inside AppContextProvider.

User operations:
- loginUser(externalUserId: string): Promise<void>
- logoutUser(): Promise<void>

Alias operations:
- addAlias(label: string, id: string): void
- addAliases(aliases: Record<string, string>): void

Email operations:
- addEmail(email: string): void
- removeEmail(email: string): void

SMS operations:
- addSms(smsNumber: string): void
- removeSms(smsNumber: string): void

Tag operations:
- addTag(key: string, value: string): void
- addTags(tags: Record<string, string>): void
- removeTags(keys: string[]): void

Trigger operations (via OneSignal.InAppMessages):
- addTrigger(key: string, value: string): void
- addTriggers(triggers: Record<string, string>): void
- removeTriggers(keys: string[]): void
- clearTriggers(): void

Outcome operations (via OneSignal.Session):
- sendOutcome(name: string): void
- sendUniqueOutcome(name: string): void
- sendOutcomeWithValue(name: string, value: number): void

Track Event:
- trackEvent(name: string, properties?: Record<string, unknown>): void

Push subscription:
- getPushSubscriptionId(): string | undefined
- isPushOptedIn(): boolean | undefined
- optInPush(): void
- optOutPush(): void

Notifications:
- hasPermission(): boolean
- requestPermission(fallbackToSettings: boolean): Promise<boolean>

In-App Messages:
- setPaused(paused: boolean): void

Location:
- setLocationShared(shared: boolean): void
- requestLocationPermission(): void

Privacy consent:
- setConsentRequired(required: boolean): void
- setConsentGiven(granted: boolean): void

User IDs:
- getExternalId(): string | undefined
- getOnesignalId(): string | undefined

Notification sending (via REST API, delegated to OneSignalApiService):
- sendNotification(type: NotificationType): Promise<boolean>
- sendCustomNotification(title: string, body: string): Promise<boolean>
- fetchUser(onesignalId: string): Promise<UserData | null>
```

### Prompt 1.4 - OneSignalApiService (REST API Client)

```
Create OneSignalApiService class for REST API calls using the built-in fetch API:

Properties:
- _appId: string (set during initialization)

Methods:
- setAppId(appId: string): void
- getAppId(): string
- sendNotification(type: NotificationType, subscriptionId: string): Promise<boolean>
- sendCustomNotification(title: string, body: string, subscriptionId: string): Promise<boolean>
- fetchUser(onesignalId: string): Promise<UserData | null>

sendNotification endpoint:
- POST https://onesignal.com/api/v1/notifications
- Accept header: "application/vnd.onesignal.v1+json"
- Uses include_subscription_ids (not include_player_ids)
- Includes big_picture for Android image notifications
- Includes ios_attachments for iOS image notifications (needed for the NSE to download and attach images)

fetchUser endpoint:
- GET https://api.onesignal.com/apps/{app_id}/users/by/onesignal_id/{onesignal_id}
- NO Authorization header needed (public endpoint)
- Returns UserData with aliases, tags, emails, smsNumbers, externalId
```

### Prompt 1.5 - SDK Observers

```
In App.tsx, set up OneSignal initialization and listeners before rendering:

OneSignal.Debug.setLogLevel(LogLevel.Verbose);
OneSignal.setConsentRequired(cachedConsentRequired);
OneSignal.setConsentGiven(cachedPrivacyConsent);
OneSignal.initialize(appId);

Then register listeners:
- OneSignal.InAppMessages.addEventListener('willDisplay', handler)
- OneSignal.InAppMessages.addEventListener('didDisplay', handler)
- OneSignal.InAppMessages.addEventListener('willDismiss', handler)
- OneSignal.InAppMessages.addEventListener('didDismiss', handler)
- OneSignal.InAppMessages.addEventListener('click', handler)
- OneSignal.Notifications.addEventListener('click', handler)
- OneSignal.Notifications.addEventListener('foregroundWillDisplay', handler)

After initialization, restore cached SDK states from AsyncStorage:
- OneSignal.InAppMessages.setPaused(cachedPausedStatus)
- OneSignal.Location.setShared(cachedLocationShared)

In AppContextProvider, register observers:
- OneSignal.User.pushSubscription.addEventListener('change', handler) - react to push subscription changes
- OneSignal.Notifications.addEventListener('permissionChange', handler) - react to permission changes
- OneSignal.User.addEventListener('change', handler) - call fetchUserDataFromApi() when user changes

Always remove listeners on cleanup (useEffect return function):
- OneSignal.User.pushSubscription.removeEventListener('change', handler)
- OneSignal.Notifications.removeEventListener('permissionChange', handler)
- OneSignal.User.removeEventListener('change', handler)
```

---

## Phase 2: UI Sections

### Section Order (top to bottom)

1. **App Section** (App ID, Guidance Banner, Consent Toggle, Logged-in-as display, Login/Logout)
2. **Push Section** (Push ID, Enabled Toggle, Auto-prompts permission on load)
3. **Send Push Notification Section** (Simple, With Image, Custom buttons)
4. **In-App Messaging Section** (Pause toggle)
5. **Send In-App Message Section** (Top Banner, Bottom Banner, Center Modal, Full Screen - with icons)
6. **Aliases Section** (Add/Add Multiple, read-only list)
7. **Emails Section** (Collapsible list >5 items)
8. **SMS Section** (Collapsible list >5 items)
9. **Tags Section** (Add/Add Multiple/Remove Selected)
10. **Outcome Events Section** (Send Outcome dialog with type selection)
11. **Triggers Section** (Add/Add Multiple/Remove Selected/Clear All - IN MEMORY ONLY)
12. **Track Event Section** (Track Event with JSON validation)
13. **Location Section** (Location Shared toggle, Prompt Location button)
14. **Next Page Button**

### Prompt 2.1 - App Section

```
App Section layout:

1. App ID display (readonly Text showing the OneSignal App ID)

2. Sticky guidance banner below App ID:
   - Text: "Add your own App ID, then rebuild to fully test all functionality."
   - Link text: "Get your keys at onesignal.com" (clickable, opens browser via Linking.openURL)
   - Light background color to stand out

3. Consent card with up to two toggles:
   a. "Consent Required" toggle (always visible):
      - Label: "Consent Required"
      - Description: "Require consent before SDK processes data"
      - Calls OneSignal.setConsentRequired(value)
   b. "Privacy Consent" toggle (only visible when Consent Required is ON):
      - Label: "Privacy Consent"
      - Description: "Consent given for data collection"
      - Calls OneSignal.setConsentGiven(value)
      - Separated from the above toggle by a horizontal divider
   - NOT a blocking overlay - user can interact with app regardless of state

4. User status card (always visible, ABOVE the login/logout buttons):
   - Card with two rows separated by a divider
   - Row 1: "Status" label on the left, value on the right
   - Row 2: "External ID" label on the left, value on the right
   - When logged out:
     - Status shows "Anonymous"
     - External ID shows "–" (dash)
   - When logged in:
     - Status shows "Logged In" with green styling (#2E7D32)
     - External ID shows the actual external user ID

5. LOGIN USER button:
   - Shows "LOGIN USER" when no user is logged in
   - Shows "SWITCH USER" when a user is logged in
   - Opens modal with empty "External User Id" field

6. LOGOUT USER button (only visible when a user is logged in)
```

### Prompt 2.2 - Push Section

```
Push Section:
- Section title: "Push" with info icon for tooltip
- Push Subscription ID display (readonly)
- Enabled toggle switch (controls optIn/optOut)
  - Disabled when notification permission is NOT granted
- Notification permission is automatically requested when home screen loads
- PROMPT PUSH button:
  - Only visible when notification permission is NOT granted (fallback if user denied)
  - Requests notification permission when clicked
  - Hidden once permission is granted
```

### Prompt 2.3 - Send Push Notification Section

```
Send Push Notification Section (placed right after Push Section):
- Section title: "Send Push Notification" with info icon for tooltip
- Three buttons:
  1. SIMPLE - title: "Simple Notification", body: "This is a simple push notification"
  2. WITH IMAGE - title: "Image Notification", body: "This notification includes an image"
     big_picture (Android): https://media.onesignal.com/automated_push_templates/ratings_template.png
     ios_attachments (iOS): {"image": "https://media.onesignal.com/automated_push_templates/ratings_template.png"}
  3. CUSTOM - opens modal for custom title and body

Tooltip should explain each button type.
```

### Prompt 2.4 - In-App Messaging Section

```
In-App Messaging Section (placed right after Send Push):
- Section title: "In-App Messaging" with info icon for tooltip
- Pause In-App Messages toggle switch:
  - Label: "Pause In-App Messages"
  - Description: "Toggle in-app message display"
```

### Prompt 2.5 - Send In-App Message Section

```
Send In-App Message Section (placed right after In-App Messaging):
- Section title: "Send In-App Message" with info icon for tooltip
- Four FULL-WIDTH buttons (not a grid):
  1. TOP BANNER - icon: arrow-up-bold-box-outline, trigger: "iam_type" = "top_banner"
  2. BOTTOM BANNER - icon: arrow-down-bold-box-outline, trigger: "iam_type" = "bottom_banner"
  3. CENTER MODAL - icon: crop-square, trigger: "iam_type" = "center_modal"
  4. FULL SCREEN - icon: fullscreen, trigger: "iam_type" = "full_screen"
- Button styling:
  - RED background color (#E9444E)
  - WHITE text
  - Type-specific icon on LEFT side only (no right side icon)
  - Full width of the card
  - Left-aligned text and icon content (not centered)
  - UPPERCASE button text
- On tap: adds trigger and shows Toast "Sent In-App Message: {type}"
  - Also upserts `iam_type` in the Triggers list immediately so UI reflects the sent IAM type

Use react-native-vector-icons (MaterialCommunityIcons or MaterialIcons) for icons.
Tooltip should explain each IAM type.
```

### Prompt 2.6 - Aliases Section

```
Aliases Section (placed after Send In-App Message):
- Section title: "Aliases" with info icon for tooltip
- List showing key-value pairs (read-only, no delete icons)
- Each item shows: Label | ID
- Filter out "external_id" and "onesignal_id" from display (these are special)
- "No Aliases Added" text when empty
- ADD button -> PairInputModal with empty Label and ID fields on the same row (single add)
- ADD MULTIPLE button -> MultiPairInputModal (dynamic rows, add/remove)
- No remove/delete functionality (aliases are add-only from the UI)
```

### Prompt 2.7 - Emails Section

```
Emails Section:
- Section title: "Emails" with info icon for tooltip
- List showing email addresses
- Each item shows email with an X icon (remove action)
- "No Emails Added" text when empty
- ADD EMAIL button -> modal with empty email field
- Collapse behavior when >5 items:
  - Show first 5 items
  - Show "X more" text (tappable)
  - Expand to show all when tapped
```

### Prompt 2.8 - SMS Section

```
SMS Section:
- Section title: "SMS" with info icon for tooltip
- List showing phone numbers
- Each item shows phone number with an X icon (remove action)
- "No SMS Added" text when empty
- ADD SMS button -> modal with empty SMS field
- Collapse behavior when >5 items (same as Emails)
```

### Prompt 2.9 - Tags Section

```
Tags Section:
- Section title: "Tags" with info icon for tooltip
- List showing key-value pairs
- Each item shows key above value (stacked layout) with an X icon on the right (remove action)
- "No Tags Added" text when empty
- ADD button -> PairInputModal with empty Key and Value fields (single add)
- ADD MULTIPLE button -> MultiPairInputModal (dynamic rows)
- REMOVE SELECTED button:
  - Only visible when at least one tag exists
  - Opens MultiSelectRemoveModal with checkboxes
```

### Prompt 2.10 - Outcome Events Section

```
Outcome Events Section:
- Section title: "Outcome Events" with info icon for tooltip
- SEND OUTCOME button -> opens modal with 3 radio options:
  1. Normal Outcome -> shows name input field
  2. Unique Outcome -> shows name input field
  3. Outcome with Value -> shows name and value (number) input fields
```

### Prompt 2.11 - Triggers Section (IN MEMORY ONLY)

```
Triggers Section:
- Section title: "Triggers" with info icon for tooltip
- List showing key-value pairs
- Each item shows key above value (stacked layout) with an X icon on the right (remove action)
- "No Triggers Added" text when empty
- ADD button -> PairInputModal with empty Key and Value fields (single add)
- ADD MULTIPLE button -> MultiPairInputModal (dynamic rows)
- Two action buttons (only visible when triggers exist):
  - REMOVE SELECTED -> MultiSelectRemoveModal with checkboxes
  - CLEAR ALL -> Removes all triggers at once

IMPORTANT: Triggers are stored IN MEMORY ONLY during the app session.
- triggersList is a [string, string][] array in the app state
- Sending an IAM button also updates the same list by setting `iam_type`
- Triggers are NOT persisted to AsyncStorage
- Triggers are cleared when the app is killed/restarted
- This is intentional - triggers are transient test data for IAM testing
```

### Prompt 2.12 - Track Event Section

```
Track Event Section:
- Section title: "Track Event" with info icon for tooltip
- TRACK EVENT button -> opens TrackEventModal with:
  - "Event Name" label + empty TextInput (required, shows error if empty on submit)
  - "Properties (optional, JSON)" label + TextInput with placeholder hint {"key": "value"}
    - If non-empty and not valid JSON, shows "Invalid JSON format" error on the field
    - If valid JSON, parsed via JSON.parse and converted to Record<string, unknown> for the SDK call
    - If empty, passes undefined
  - TRACK button disabled until name is filled AND JSON is valid (or empty)
- Calls OneSignal.User.trackEvent(name, properties)
```

### Prompt 2.13 - Location Section

```
Location Section:
- Section title: "Location" with info icon for tooltip
- Location Shared toggle switch:
  - Label: "Location Shared"
  - Description: "Share device location with OneSignal"
- PROMPT LOCATION button
```

### Prompt 2.14 - Secondary Screen

```
Secondary Screen (launched by "Next Activity" button at bottom of main screen):
- Screen title: "Secondary Activity" (set via React Navigation header options)
- Screen content: centered text "Secondary Activity" using a large font style
- Simple screen, no additional functionality needed
```

---

## Phase 3: View User API Integration

### Prompt 3.1 - Data Loading Flow

```
Loading indicator overlay:
- Full-screen semi-transparent overlay with centered ActivityIndicator
- isLoading flag in app state
- Show/hide via absolute positioned View based on isLoading state
- IMPORTANT: Add 100ms delay after populating data before dismissing loading indicator
  - This ensures UI has time to render
  - Use await new Promise(resolve => setTimeout(resolve, 100)) after setting state

On cold start:
- Check if OneSignal onesignalId is not undefined (via OneSignal.User.getOnesignalId())
- If exists: show loading -> call fetchUserDataFromApi() -> populate UI -> delay 100ms -> hide loading
- If null: just show empty state (no loading indicator)

On login (LOGIN USER / SWITCH USER):
- Show loading indicator immediately
- Call OneSignal.login(externalUserId)
- Clear old user data (aliases, emails, sms, triggers)
- Wait for onUserStateChange callback
- onUserStateChange calls fetchUserDataFromApi()
- fetchUserDataFromApi() populates UI, delays 100ms, then hides loading

On logout:
- Show loading indicator
- Call OneSignal.logout()
- Clear local lists (aliases, emails, sms, triggers)
- Hide loading indicator

On onUserStateChange callback:
- Call fetchUserDataFromApi() to sync with server state
- Update UI with new data (aliases, tags, emails, sms)

Note: REST API key is NOT required for fetchUser endpoint.
```

### Prompt 3.2 - UserData Model

```typescript
interface UserData {
  aliases: Record<string, string>;  // From identity object (filter out external_id, onesignal_id)
  tags: Record<string, string>;     // From properties.tags object
  emails: string[];                  // From subscriptions where type=="Email" -> token
  smsNumbers: string[];              // From subscriptions where type=="SMS" -> token
  externalId?: string;               // From identity.external_id
}

function userDataFromJson(json: Record<string, unknown>): UserData { ... }
```

---

## Phase 4: Info Tooltips

### Prompt 4.1 - Tooltip Content (Remote)

```
Tooltip content is fetched at runtime from the sdk-shared repo. Do NOT bundle a local copy.

URL:
https://raw.githubusercontent.com/OneSignal/sdk-shared/main/demo/tooltip_content.json

This file is maintained in the sdk-shared repo and shared across all platform demo apps.
```

### Prompt 4.2 - Tooltip Helper

```typescript
class TooltipHelper {
  private static instance: TooltipHelper;
  static getInstance(): TooltipHelper { ... }

  private tooltips: Record<string, TooltipData> = {};
  private initialized = false;

  private static readonly TOOLTIP_URL =
    'https://raw.githubusercontent.com/OneSignal/sdk-shared/main/demo/tooltip_content.json';

  async init(): Promise<void> {
    if (this.initialized) return;

    try {
      // Fetch tooltip_content.json from TOOLTIP_URL
      // Parse JSON into tooltips map
      // On failure (no network, etc.), leave tooltips empty — tooltips are non-critical
    } catch (_) {}

    this.initialized = true;
  }

  getTooltip(key: string): TooltipData | undefined {
    return this.tooltips[key];
  }
}

interface TooltipData {
  title: string;
  description: string;
  options?: TooltipOption[];
}

interface TooltipOption {
  name: string;
  description: string;
}
```

### Prompt 4.3 - Tooltip UI Integration

```
For each section, pass an onInfoTap callback to SectionCard:
- SectionCard has an optional info icon that calls onInfoTap when tapped
- In HomeScreen, wire onInfoTap to show a TooltipModal
- TooltipModal displays title, description, and options (if present)

Example in HomeScreen:
<AliasesSection
    ...
    onInfoTap={() => showTooltipModal('aliases')}
/>

function showTooltipModal(key: string) {
    const tooltip = TooltipHelper.getInstance().getTooltip(key);
    if (tooltip) {
        setActiveTooltip(tooltip);
        setTooltipVisible(true);
    }
}
```

---

## Phase 5: Data Persistence & Initialization

### What IS Persisted (AsyncStorage)

```
PreferencesService stores:
- OneSignal App ID
- Consent required status
- Privacy consent status
- External user ID (for login state restoration)
- Location shared status
- In-app messaging paused status
```

### Initialization Flow

```
On app startup, state is restored in two layers:

1. App.tsx restores SDK state from AsyncStorage cache BEFORE initialize:
   - OneSignal.setConsentRequired(cachedConsentRequired)
   - OneSignal.setConsentGiven(cachedPrivacyConsent)
   - OneSignal.initialize(appId)
   Then AFTER initialize, restores remaining SDK state:
   - OneSignal.InAppMessages.setPaused(cachedPausedStatus)
   - OneSignal.Location.setShared(cachedLocationShared)
   This ensures consent settings are in place before the SDK initializes.

2. AppContextProvider initialization restores UI state:
   - consentRequired from cached prefs (no SDK getter)
   - privacyConsentGiven from cached prefs (no SDK getter)
   - inAppMessagesPaused from cached prefs
   - locationShared from cached prefs
   - externalUserId from OneSignal.User.getExternalId()
   - appId from PreferencesService (app-level config)

This two-layer approach ensures:
- The SDK is configured with the user's last preferences before anything else runs
- AppContextProvider exposes one state object and action API for screens
- Reducer transitions keep state updates predictable
```

### What is NOT Persisted (In-Memory Only)

```
App state holds in memory:
- triggersList: [string, string][]
  - Triggers are session-only
  - Cleared on app restart
  - Used for testing IAM trigger conditions

- aliasesList:
  - Populated from REST API on each session start
  - When user adds alias locally, added to list immediately (SDK syncs async)
  - Fetched fresh via fetchUserDataFromApi() on login/app start

- emailsList, smsNumbersList:
  - Populated from REST API on each session
  - Not cached locally
  - Fetched fresh via fetchUserDataFromApi()

- tagsList:
  - Can be read from SDK via getTags()
  - Also fetched from API for consistency
```

---

## Phase 6: Testing Values (Appium Compatibility)

```
All modal input fields should be EMPTY by default.
The test automation framework (Appium) will enter these values:

- Login Modal: External User Id = "test"
- Add Alias Modal: Key = "Test", Value = "Value"
- Add Multiple Aliases Modal: Key = "Test", Value = "Value" (first row; supports multiple rows)
- Add Email Modal: Email = "test@onesignal.com"
- Add SMS Modal: SMS = "123-456-5678"
- Add Tag Modal: Key = "Test", Value = "Value"
- Add Multiple Tags Modal: Key = "Test", Value = "Value" (first row; supports multiple rows)
- Add Trigger Modal: Key = "trigger_key", Value = "trigger_value"
- Add Multiple Triggers Modal: Key = "trigger_key", Value = "trigger_value" (first row; supports multiple rows)
- Outcome Modal: Name = "test_outcome", Value = "1.5"
- Track Event Modal: Name = "test_event", Properties = "{\"key\": \"value\"}"
- Custom Notification Modal: Title = "Test Title", Body = "Test Body"
```

---

## Phase 7: Important Implementation Details

### Alias Management

```
Aliases are managed with a hybrid approach:

1. On app start/login: Fetched from REST API via fetchUserDataFromApi()
2. When user adds alias locally:
   - Call OneSignal.User.addAlias(label, id) - syncs to server async
   - Immediately add to local aliasesList (don't wait for API)
   - This ensures instant UI feedback while SDK syncs in background
3. On next app launch: Fresh data from API includes the synced alias
```

### Notification Permission

```
Notification permission is automatically requested when the home screen loads:
- Call appContext.promptPush() in a useEffect with an empty dependency array in HomeScreen
- This ensures prompt appears after user sees the app UI
- PROMPT PUSH button remains as fallback if user initially denied
- Button hidden once permission is granted
- Keep Push "Enabled" toggle disabled until permission is granted
```

---

## Phase 8: React Native Architecture

### Prompt 8.1 - State Management with Context + Reducer

```
Use React Context for dependency injection and useReducer for state management.

App.tsx:
- AppContext.Provider at the root of the component tree
- Initialize OneSignal SDK before rendering (outside component or in early useEffect)
- Fetch tooltips in the background (non-blocking)

AppContextProvider:
- Holds all UI state with useReducer
- Exposes state and action functions through useAppContext
- Uses OneSignalRepository and PreferencesService internally
- Handles observer lifecycle and initialization effects
```

### Prompt 8.2 - Reusable Components

```
Create reusable components in src/components/:

SectionCard.tsx:
- Card View with title Text and optional info TouchableOpacity
- Children slot
- onInfoTap callback for tooltips
- Consistent padding and styling via StyleSheet

ToggleRow.tsx:
- Label, optional description, Switch
- Row layout with justifyContent: 'space-between'

ActionButton.tsx:
- PrimaryButton (filled, primary color background, TouchableOpacity)
- DestructiveButton (outlined, red accent, TouchableOpacity)
- Full-width buttons with width: '100%'

ListWidgets.tsx:
- PairItem (key-value with optional X-icon remove TouchableOpacity)
- SingleItem (single value with optional X-icon remove TouchableOpacity)
- EmptyState (centered "No items" Text)
- CollapsibleList (shows 5 items, expandable)
- PairList (simple list of key-value pairs)

LoadingOverlay.tsx:
- Semi-transparent full-screen overlay using absolute positioned View + StyleSheet
- Centered ActivityIndicator
- Shown via isLoading state from app context

LogView.tsx:
- Sticky at the top of the screen (always visible while ScrollView content scrolls below)
- Full width, no horizontal margin, no rounded corners, no top margin (touches header)
- Background color: #1A1B1E
- Single horizontal ScrollView on the entire log list (not per-row), no text truncation
- Use onLayout + minWidth so content is at least screen-wide
- Vertical ScrollView + mapped entries instead of FlatList (100dp container is small)
- Fixed 100dp height
- Default expanded
- Trash icon button (delete icon from react-native-vector-icons) for clearing logs
- Auto-scroll to newest using scrollToEnd on ScrollView ref

Modals (src/components/modals/):
- All modals use a full-width Modal component with padding: 16 and width: '100%' inner container
- SingleInputModal (one TextInput)
- PairInputModal (key-value TextInputs on the same row, single pair)
- MultiPairInputModal (dynamic rows with dividers, X icon to delete a row, full-width, batch submit)
- MultiSelectRemoveModal (Checkbox per item for batch remove)
- LoginModal, OutcomeModal, TrackEventModal
- CustomNotificationModal, TooltipModal
```

### Prompt 8.3 - Reusable Multi-Pair Modal

```
Tags, Aliases, and Triggers all share a reusable MultiPairInputModal component
for adding multiple key-value pairs at once.

Behavior:
- Modal opens full-width (width: '100%' with horizontal padding 16)
- Starts with one empty key-value row (Key and Value TextInputs side by side)
- "Add Row" TextButton below the rows adds another empty row
- Dividers separate each row for visual clarity
- Each row shows an X (close icon) delete button on the right (hidden when only one row)
- "Add All" button is disabled until ALL key and value fields in every row are filled
- Validation runs on every text change and after row add/remove
- On "Add All" press, all rows are collected and submitted as a batch
- Batch operations use SDK bulk APIs (addAliases, addTags, addTriggers)
- State is managed with useState inside the modal component

Used by:
- ADD MULTIPLE button (Aliases section) -> calls viewModel.addAliases(pairs)
- ADD MULTIPLE button (Tags section) -> calls viewModel.addTags(pairs)
- ADD MULTIPLE button (Triggers section) -> calls viewModel.addTriggers(pairs)
```

### Prompt 8.4 - Reusable Remove Multi Modal

```
Tags and Triggers share a reusable MultiSelectRemoveModal component
for selectively removing items from the current list.

Behavior:
- Accepts the current list of items as [string, string][]
- Renders one checkbox per item on the left with just the key as the label (not "key: value")
- Use a custom checkbox row with TouchableOpacity + icon since RN has no built-in Checkbox on both platforms
- User can check 0, 1, or more items
- "Remove (N)" button shows count of selected items, disabled when none selected
- On confirm, checked items' keys are collected as string[] and passed to the callback

Used by:
- REMOVE SELECTED button (Tags section) -> calls viewModel.removeSelectedTags(keys)
- REMOVE SELECTED button (Triggers section) -> calls viewModel.removeSelectedTriggers(keys)
```

### Prompt 8.5 - Theme

```
Create OneSignal theme in src/theme.ts:

Colors:
- oneSignalRed = '#E54B4D' (primary)
- oneSignalGreen = '#34A853' (success)
- oneSignalGreenLight = '#E6F4EA' (success background)
- lightBackground = '#F8F9FA'
- cardBackground = '#FFFFFF'
- dividerColor = '#E8EAED'
- warningBackground = '#FFF8E1'

Spacing constants:
- cardGap = 8    // gap between a card/banner and its action buttons within a section
- sectionGap = 12 // gap between sections (SectionCard wrapper marginBottom)

AppTheme object with:
- Reusable StyleSheet base styles for cards (borderRadius: 12, backgroundColor: cardBackground)
- Reusable button style with borderRadius: 8
- Consistent font sizes, weights, and colors exported as constants
- Shadow/elevation styles for card depth

Apply theme colors and Spacing constants consistently across all components using StyleSheet.create.
```

### Prompt 8.6 - Log View (Appium-Ready)

```
Add collapsible log view at top of screen for debugging and Appium testing.

Files:
- src/services/LogManager.ts - Singleton logger with listener callbacks
- src/components/LogView.tsx - Log viewer component with testID labels

LogManager Features:
- Singleton with subscriber callbacks for reactive UI updates
- API: LogManager.getInstance().d(tag, message), .i(), .w(), .e() mimics debugPrint levels
- Also prints to console via console.log/warn/error for development

LogView Features:
- STICKY at the top of the screen (always visible while ScrollView content scrolls below)
- Full width, no horizontal margin, no rounded corners, no top margin (touches header)
- Background color: #1A1B1E
- Single horizontal ScrollView on the entire log list (not per-row), no text truncation
- Use onLayout + minWidth so content is at least screen-wide
- Vertical ScrollView + mapped entries instead of FlatList (100dp container is small)
- Fixed 100dp height
- Default expanded
- Trash icon button (delete icon) for clearing logs, not a text button
- Auto-scroll to newest using scrollToEnd on ScrollView ref

Appium testID Labels:
| testID                  | Description                        |
|-------------------------|------------------------------------|
| log_view_container      | Main container View                |
| log_view_header         | Tappable expand/collapse row       |
| log_view_count          | Shows "(N)" log count Text         |
| log_view_clear_button   | Clear all logs TouchableOpacity    |
| log_view_list           | Scrollable ScrollView              |
| log_view_empty          | "No logs yet" Text                 |
| log_entry_{N}           | Each log row View (N=index)        |
| log_entry_{N}_timestamp | Timestamp Text                     |
| log_entry_{N}_level     | D/I/W/E indicator Text             |
| log_entry_{N}_message   | Log message Text                   |

Use the testID prop for Appium accessibility:
<Text testID={`log_entry_${index}_message`}>{entry.message}</Text>
```

### Prompt 8.7 - Toast Messages

```
All user actions should display Toast messages via react-native-toast-message:

- Login: "Logged in as: {userId}"
- Logout: "Logged out"
- Add alias: "Alias added: {label}"
- Add multiple aliases: "{count} alias(es) added"
- Similar patterns for tags, triggers, emails, SMS
- Notifications: "Notification sent: {type}" or "Failed to send notification"
- In-App Messages: "Sent In-App Message: {type}"
- Outcomes: "Outcome sent: {name}"
- Events: "Event tracked: {name}"
- Location: "Location sharing enabled/disabled"
- Push: "Push enabled/disabled"

Implementation:
- Place <Toast /> at the root of App.tsx (outside NavigationContainer children)
- Show at the bottom of the screen: <Toast position="bottom" bottomOffset={20} />
- Call Toast.show({ type: 'info', text1: message }) from action handlers
- All Toast messages are also logged via LogManager.getInstance().i()
- Hide previous toast before showing new one via Toast.hide() if needed
```

---

## Key Files Structure

```
examples/demo/
├── src/
│   ├── App.tsx                              # App entry, SDK init, Context setup
│   ├── theme.ts                             # OneSignal theme (colors, StyleSheet constants)
│   ├── models/
│   │   ├── UserData.ts                      # UserData interface from API
│   │   ├── NotificationType.ts              # Enum with bigPicture and iosAttachments
│   │   └── InAppMessageType.ts              # Enum with icon names
│   ├── services/
│   │   ├── OneSignalApiService.ts           # REST API client (fetch)
│   │   ├── PreferencesService.ts            # AsyncStorage wrapper
│   │   ├── TooltipHelper.ts                 # Fetches tooltips from remote URL
│   │   └── LogManager.ts                    # Singleton logger with callbacks
│   ├── repositories/
│   │   └── OneSignalRepository.ts           # Centralized SDK calls
│   ├── context/
│   │   └── AppContext.tsx                   # React Context + useReducer state
│   ├── screens/
│   │   ├── HomeScreen.tsx                   # Main ScrollView screen (includes LogView)
│   │   └── SecondaryScreen.tsx              # "Secondary Activity" screen
│   └── components/
│       ├── SectionCard.tsx                  # Card with title and info icon
│       ├── ToggleRow.tsx                    # Label + Switch
│       ├── ActionButton.tsx                 # Primary/Destructive buttons
│       ├── ListWidgets.tsx                  # PairList, SingleList, EmptyState
│       ├── LoadingOverlay.tsx               # Full-screen loading spinner
│       ├── LogView.tsx                      # Collapsible log viewer (Appium-ready)
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
│           ├── AppSection.tsx               # App ID, consent, login/logout
│           ├── PushSection.tsx              # Push subscription controls
│           ├── SendPushSection.tsx          # Send notification buttons
│           ├── InAppSection.tsx             # IAM pause toggle
│           ├── SendIamSection.tsx           # Send IAM buttons with icons
│           ├── AliasesSection.tsx           # Alias management
│           ├── EmailsSection.tsx            # Email management
│           ├── SmsSection.tsx               # SMS management
│           ├── TagsSection.tsx              # Tag management
│           ├── OutcomesSection.tsx          # Outcome events
│           ├── TriggersSection.tsx          # Trigger management (in-memory)
│           ├── TrackEventSection.tsx        # Event tracking with JSON
│           └── LocationSection.tsx          # Location controls
├── android/
│   └── app/
│       └── src/main/
│           └── AndroidManifest.xml          # Package: com.onesignal.example
├── ios/
│   └── demo/
│       └── Info.plist
├── package.json                             # Dependencies
├── tsconfig.json                            # TypeScript config (strict mode)
└── .eslintrc.js                             # ESLint config
```

Note:

- All UI is React Native components (no platform-specific UI channels needed)
- Tooltip content is fetched from remote URL (not bundled locally)
- LogView at top of screen displays SDK and app logs for debugging/Appium testing
- React Context is used at the root for dependency injection and state management

---

## Configuration

### App ID Placeholder

```typescript
// In App.tsx or a constants file
const ONE_SIGNAL_APP_ID = '77e32082-ea27-42e3-a898-c72e141824ef';
```

Note: REST API key is NOT required for the fetchUser endpoint.

### Package / Bundle Identifier

The identifiers MUST be `com.onesignal.example` to work with the existing:

- `google-services.json` (Firebase configuration)
- `agconnect-services.json` (Huawei configuration)

If you change the identifier, you must also update these files with your own Firebase/Huawei project configuration.

---

## React Native Best Practices Applied

- **TypeScript strict mode** on all source files, avoiding `any` and type assertions
- **React Context** for dependency injection and reactive state, avoiding global mutable state
- **Single responsibility** per file: one component/class per file, sections split into their own files
- **Cleanup in useEffect** return functions for all SDK event listeners
- **Keys** on list items via unique key prop for efficient reconciliation
- **testID** props on interactive elements for Appium test automation
- **async/await** over raw Promise chaining for readability
- **Immutable state** updates using spread/map/filter rather than direct mutation
- **Consistent theming** via a shared theme.ts with StyleSheet constants
- **Minimal re-renders** by splitting context or using useMemo/useCallback where appropriate
- **Error handling** with try/catch on all network and SDK async calls
- **No native modules beyond SDK** since the OneSignal React Native SDK handles all bridging
