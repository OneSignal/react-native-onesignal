# OneSignal React Native Sample App - Build Guide

This document contains all the prompts and requirements needed to build the OneSignal React Native TypeScript Sample App from scratch. Give these prompts to an AI assistant or follow them manually to recreate the app.

---

## Phase 1: Initial Setup

### Prompt 1.1 - Project Foundation

```
Build a sample React Native TypeScript app with:
- React Native 0.82+ with TypeScript
- React Context API with useReducer for state management
- React Navigation with bottom tabs (Home and Details screens)
- react-native-onesignal SDK integration (local package)
- react-native-safe-area-context and react-native-screens
- Package name: com.rnonesignalts
- All dialogs should have EMPTY input fields (for Appium testing - test framework enters values)
- OneSignal brand colors with clean, modern UI styling
```

### Prompt 1.2 - OneSignal SDK Integration

```
All OneSignal SDK calls are made directly inline (no separate repository class).
The SDK is accessed via the OneSignal namespace from 'react-native-onesignal'.

User operations:
- OneSignal.login(externalUserId)
- OneSignal.logout()

Alias operations:
- OneSignal.User.addAlias(label, id)
- OneSignal.User.addAliases(aliases)  // Batch add

Email operations:
- OneSignal.User.addEmail(email)
- OneSignal.User.removeEmail(email)

SMS operations:
- OneSignal.User.addSms(smsNumber)
- OneSignal.User.removeSms(smsNumber)

Tag operations:
- OneSignal.User.addTag(key, value)
- OneSignal.User.addTags(tags)  // Batch add
- OneSignal.User.removeTag(key)
- OneSignal.User.removeTags(keys)  // Batch remove
- OneSignal.User.getTags()

Trigger operations:
- OneSignal.InAppMessages.addTrigger(key, value)
- OneSignal.InAppMessages.removeTrigger(key)
- OneSignal.InAppMessages.clearTriggers()

Outcome operations:
- OneSignal.Session.addOutcome(name)
- OneSignal.Session.addUniqueOutcome(name)
- OneSignal.Session.addOutcomeWithValue(name, value)

Track Event:
- OneSignal.User.trackEvent(name, properties)

Push subscription:
- OneSignal.User.pushSubscription.getIdAsync()
- OneSignal.User.pushSubscription.getOptedInAsync()
- OneSignal.User.pushSubscription.optIn()
- OneSignal.User.pushSubscription.optOut()

In-App Messages:
- OneSignal.InAppMessages.setPaused(paused)
- OneSignal.InAppMessages.getPaused()

Location:
- OneSignal.Location.setShared(shared)
- OneSignal.Location.isShared()
- OneSignal.Location.requestPermission()

Privacy consent:
- OneSignal.setConsentRequired(required)
- OneSignal.setConsentGiven(granted)

User identity (async):
- await OneSignal.User.getOnesignalId()   // Returns Promise<string | null>
- await OneSignal.User.getExternalId()    // Returns Promise<string | null>

IMPORTANT: getOnesignalId() and getExternalId() are async methods that return
Promises. They are NOT synchronous properties. Always use `await` and wrap in
try-catch since they throw "Must call 'initWithContext' before use" if called
before the SDK is fully initialized.

Notification sending (via REST API, delegated to services):
- NotificationSender.sendNotification(template)
- OneSignalService.fetchUserData(onesignalId)
```

### Prompt 1.3 - OneSignalService (REST API Client)

```
Create services/OneSignalService.ts for REST API calls:

Constants:
- APP_ID from constants/Config.ts
- ONESIGNAL_API_BASE = 'https://api.onesignal.com'

Methods:
- fetchUserData(onesignalId: string): Promise<UserData>

fetchUser endpoint:
- GET https://api.onesignal.com/apps/{APP_ID}/users/by/onesignal_id/{onesignalId}
- NO Authorization header needed (public endpoint)
- Returns UserData with aliases, tags, emails, smsNumbers, externalId

Parse response:
- aliases: from identity object (filter out external_id, onesignal_id)
- tags: from properties.tags object
- emails: from subscriptions where type="Email" -> token
- smsNumbers: from subscriptions where type="SMS" -> token
- externalId: from identity.external_id
```

### Prompt 1.4 - NotificationSender (REST API Client)

```
Create services/NotificationSender.ts for sending notifications:

Methods:
- sendNotification(template: NotificationPayload): Promise<boolean>
- getPushSubscriptionId(): Promise<string | null>
- isUserOptedIn(): Promise<boolean>

sendNotification endpoint:
- POST https://onesignal.com/api/v1/notifications
- Accept header: "application/vnd.onesignal.v1+json"
- Uses include_subscription_ids (not include_player_ids)
- Builds payload from NotificationPayload template
```

### Prompt 1.5 - SDK Event Listeners & Observers

```
In OSDemo.tsx, set up OneSignal listeners via useFocusEffect:

Notification events:
- OneSignal.Notifications.addEventListener('foregroundWillDisplay', handler)
  - Call event.preventDefault() then display after delay (async display testing)
- OneSignal.Notifications.addEventListener('click', handler)
- OneSignal.Notifications.addEventListener('permissionChange', handler)

In-App Message events:
- OneSignal.InAppMessages.addEventListener('click', handler)
- OneSignal.InAppMessages.addEventListener('willDisplay', handler)
- OneSignal.InAppMessages.addEventListener('didDisplay', handler)
- OneSignal.InAppMessages.addEventListener('willDismiss', handler)
- OneSignal.InAppMessages.addEventListener('didDismiss', handler)

User events:
- OneSignal.User.addEventListener('change', handler)
  - When fired, call fetchAndPopulateUserData() to sync with server state
  - Add a 1-second delay before fetching to let SDK finalize user state

Push subscription events:
- OneSignal.User.pushSubscription.addEventListener('change', handler)

All listeners must be cleaned up on unmount via removeEventListener.
```

---

## Phase 2: UI Sections

### Section Order (top to bottom) - FINAL

1. **Debug Console** (Collapsible log viewer at top)
2. **App Info Section** (App ID, Guidance Banner, Consent Toggles)
3. **User Section** (Logged-in-as display, Login/Logout)
4. **Push Subscription Section** (Push ID, Enabled Toggle, Prompt Push)
5. **Notification Demo Section** (Simple, With Image, Custom buttons + notification templates)
6. **In-App Messaging Section** (Pause toggle)
7. **IAM Demo Section** (Top Banner, Bottom Banner, Center Modal, Full Screen)
8. **Aliases Section** (Add/Add Multiple, read-only list)
9. **Emails Section** (Collapsible list >5 items)
10. **SMS Section** (Collapsible list >5 items)
11. **Tags Section** (Add/Add Multiple/Remove Selected)
12. **Outcome Section** (Send Outcome dialog with type selection)
13. **Triggers Section** (Add/Add Multiple/Remove Selected/Clear All - IN MEMORY ONLY)
14. **Track Event Section** (Track Event with JSON validation)
15. **Location Section** (Location Shared toggle, Prompt Location button)
16. **Live Activities Section** (iOS-only, setup/start/update/end)

### Prompt 2.1 - Debug Console (Top of Screen)

```
Debug Console at top of main screen:

- Collapsible text log viewer (default expanded)
- Dark background (#1A1B1E) with light text
- Header bar with "Console" title and collapse/expand toggle
- Scrollable text area showing log messages
- Clear button to reset logs
- All SDK events and user actions are logged here via OSLog function
- Auto-scrolls to newest entries

The console stays at the top of the screen above all sections.
OSLog function appends messages to console state and also calls console.log().
```

### Prompt 2.2 - App Info Section

```
App Info Section layout:

1. App ID display (readonly Text showing the OneSignal App ID from Config.ts)

2. Guidance banner below App ID:
   - Text: "Add your own App ID, then rebuild to fully test all functionality."
   - Light warning background color (#FFF8E1)

3. Consent card with two toggles:
   a. "Consent Required" toggle (always visible):
      - Label: "Consent Required"
      - Description: "Require consent before SDK processes data"
      - Calls OneSignal.setConsentRequired()
   b. "Privacy Consent" toggle (only visible when Consent Required is ON):
      - Label: "Privacy Consent"
      - Description: "Consent given for data collection"
      - Calls OneSignal.setConsentGiven()
      - Separated from the above toggle by a horizontal divider
```

### Prompt 2.3 - User Section

```
User Section:
- Section title: "User"

- "Logged in as" display (only visible when logged in):
  - Green Card background (#E6F4EA)
  - "Logged in as:" label
  - External User ID displayed prominently (bold, green #34A853)

- LOGIN USER button:
  - Shows "LOGIN USER" when no user is logged in
  - Shows "SWITCH USER" when a user is logged in
  - Opens LoginUserDialog with empty "External User ID" field

- LOGOUT USER button

On login:
- Call OneSignal.login(externalId)
- Wait 2 seconds for SDK to finalize user identity
- Then call fetchAndPopulateUserData() to load user data from API

On logout:
- Call OneSignal.logout()
- Clear all user-specific local state (aliases, tags, emails, SMS, triggers)
```

### Prompt 2.4 - Push Subscription Section

```
Push Subscription Section:
- Section title: "Push" with info icon for tooltip
- Push Subscription ID display (readonly)
- Enabled toggle switch (controls optIn/optOut)
- PROMPT PUSH button:
  - Only visible when notification permission is NOT granted
  - Requests notification permission when clicked
  - Hidden once permission is granted
```

### Prompt 2.5 - Notification Demo Section

```
Notification Demo Section:
- Section title: "Send Push Notification" with info icon for tooltip
- Three action buttons:
  1. SIMPLE - sends basic notification with title/body
  2. WITH IMAGE - sends notification with big picture
     (use https://media.onesignal.com/automated_push_templates/ratings_template.png)
  3. CUSTOM - opens CustomNotificationDialog for custom title and body

- Pre-defined notification templates below (each as a tappable card):
  - General, Greetings, Promotions, Breaking News,
    Abandoned Cart, New Post, Re-Engagement, Rating
  - Each template has 3 random variations
  - Tapping a template sends a notification using that template

Tooltip should explain each button type.
```

### Prompt 2.6 - In-App Messaging Section

```
In-App Messaging Section:
- Section title: "In-App Messaging" with info icon for tooltip
- Pause In-App Messages toggle switch:
  - Label: "Pause In-App Messages"
  - Description: "Toggle in-app message display"
  - Calls OneSignal.InAppMessages.setPaused()
```

### Prompt 2.7 - IAM Demo Section

```
IAM Demo Section (Send In-App Message):
- Section title: "Send In-App Message" with info icon for tooltip
- Four full-width buttons:
  1. TOP BANNER - trigger: "iam_type" = "top_banner"
  2. BOTTOM BANNER - trigger: "iam_type" = "bottom_banner"
  3. CENTER MODAL - trigger: "iam_type" = "center_modal"
  4. FULL SCREEN - trigger: "iam_type" = "fullscreen"
- Button styling:
  - RED background color (#E54B4D)
  - WHITE text
  - Full width of the card
  - UPPERCASE button text
- On click: adds trigger "iam_type" with the type's value
```

### Prompt 2.8 - Aliases Section

```
Aliases Section:
- Section title: "Aliases" with info icon for tooltip
- List showing key-value pairs (read-only, no delete icons)
- Each item shows: Label | ID
- Filter out "external_id" and "onesignal_id" from display
- "No Aliases Added" text when empty
- ADD button -> AddPairDialog with empty Label and ID fields (single add)
- ADD MULTIPLE button -> MultiPairInputDialog (dynamic rows, add/remove)
- No remove/delete functionality (aliases are add-only from the UI)
```

### Prompt 2.9 - Emails Section

```
Emails Section:
- Section title: "Emails" with info icon for tooltip
- List showing email addresses
- Each item shows email with delete icon
- "No Emails Added" text when empty
- ADD EMAIL button -> AddEmailDialog with empty email field
- Collapse behavior when >5 items:
  - Show first 5 items
  - Show "X more" text (clickable)
  - Expand to show all when clicked
```

### Prompt 2.10 - SMS Section

```
SMS Section:
- Section title: "SMS" with info icon for tooltip
- List showing phone numbers
- Each item shows phone number with delete icon
- "No SMS Added" text when empty
- ADD SMS button -> AddSmsDialog with empty SMS field
- Collapse behavior when >5 items (same as Emails)
```

### Prompt 2.11 - Tags Section

```
Tags Section:
- Section title: "Tags" with info icon for tooltip
- List showing key-value pairs
- Each item shows: Key | Value with delete icon
- "No Tags Added" text when empty
- ADD button -> AddPairDialog with empty Key and Value fields (single add)
- ADD MULTIPLE button -> MultiPairInputDialog (dynamic rows)
- REMOVE SELECTED button:
  - Only visible when at least one tag exists
  - Opens MultiSelectRemoveDialog with checkboxes
```

### Prompt 2.12 - Outcome Events Section

```
Outcome Events Section:
- Section title: "Outcome Events" with info icon for tooltip
- SEND OUTCOME button -> opens SendOutcomeDialog with 3 radio options:
  1. Normal Outcome -> shows name input field
  2. Unique Outcome -> shows name input field
  3. Outcome with Value -> shows name and value (float) input fields
```

### Prompt 2.13 - Triggers Section (IN MEMORY ONLY)

```
Triggers Section:
- Section title: "Triggers" with info icon for tooltip
- List showing key-value pairs
- Each item shows: Key | Value with delete icon
- "No Triggers Added" text when empty
- ADD button -> AddPairDialog with empty Key and Value fields (single add)
- ADD MULTIPLE button -> MultiPairInputDialog (dynamic rows)
- Two action buttons (only visible when triggers exist):
  - REMOVE SELECTED -> MultiSelectRemoveDialog with checkboxes
  - CLEAR ALL -> Removes all triggers at once

IMPORTANT: Triggers are stored IN MEMORY ONLY during the app session.
- Triggers are kept in the React context state
- Triggers are NOT persisted to AsyncStorage or any storage
- Triggers are cleared when the app is killed/restarted
- This is intentional - triggers are transient test data for IAM testing
```

### Prompt 2.14 - Track Event Section

```
Track Event Section:
- Section title: "Track Event" with info icon for tooltip
- TRACK EVENT button -> opens TrackEventDialog with:
  - "Event Name" label + empty input field (required)
  - "Properties (optional, JSON)" label + input field with placeholder {"key": "value"}
  - If non-empty and not valid JSON, shows "Invalid JSON format" error
  - If valid JSON, parsed and passed to SDK call
  - If empty, passes null/undefined
- Calls OneSignal.User.trackEvent(name, properties)
```

### Prompt 2.15 - Location Section

```
Location Section:
- Section title: "Location" with info icon for tooltip
- Location Shared toggle switch:
  - Label: "Location Shared"
  - Description: "Share device location with OneSignal"
  - Calls OneSignal.Location.setShared()
- PROMPT LOCATION button
  - Calls OneSignal.Location.requestPermission()
```

### Prompt 2.16 - Live Activities Section (iOS Only)

```
Live Activities Section:
- Section title: "Live Activities" with info icon for tooltip
- Platform.OS === 'ios' check (hide on Android)
- SETUP DEFAULT button -> OneSignal.LiveActivities.setupDefault()
- START DEFAULT button -> OneSignal.LiveActivities.startDefault()
- UPDATE button -> Updates current live activity
- END button -> Ends current live activity
```

### Prompt 2.17 - Details Screen (Secondary Tab)

```
Details Screen (second tab in bottom navigation):
- Shows user information:
  - OneSignal ID (from getOnesignalId())
  - External ID (from getExternalId())
  - Push Subscription ID
  - Push Token
- Shows device information:
  - Platform (iOS/Android)
  - OS Version
- Shows app information:
  - App ID
- Refresh button to reload all data
```

---

## Phase 3: View User API Integration

### Prompt 3.1 - Data Loading Flow

```
Loading indicator:
- isLoading state in AppStateContext
- ActivityIndicator shown when loading is true
- Sections show loading state while data is being fetched

On cold start (useEffect in OSDemo.tsx):
- Call OneSignal.initialize(APP_ID)
- Set debug log level
- Wait 3 seconds for SDK native initialization to complete
  (RN's initialize() is fire-and-forget, unlike Flutter's awaitable version)
- Try to get OneSignal ID via await OneSignal.User.getOnesignalId()
  - Wrap in try-catch (throws if SDK not ready yet)
- If ID exists: call fetchAndPopulateUserData()
- If null or error: wait for user change event to trigger fetch

On login (UserSection):
- Call OneSignal.login(externalId)
- Set externalUserId in state
- Wait 2 seconds for SDK to finalize user identity
- Call fetchAndPopulateUserData()
- The user change event listener also fires and re-fetches as backup

On logout:
- Call OneSignal.logout()
- Clear local lists (aliases, tags, emails, SMS, triggers)

On user change event (onUserChange callback):
- Wait 1 second for SDK to finalize state
- Call fetchAndPopulateUserData()

fetchAndPopulateUserData():
- Get OneSignal ID via await OneSignal.User.getOnesignalId() (try-catch)
- If no ID, return early
- Call OneSignalService.fetchUserData(onesignalId)
- Dispatch SET_ALL_ALIASES, SET_ALL_TAGS, SET_ALL_EMAILS, SET_ALL_SMS
- If externalId in response, dispatch SET_EXTERNAL_USER_ID

Note: REST API key is NOT required for fetchUser endpoint.
```

### Prompt 3.2 - UserData Model

```typescript
interface UserData {
  aliases: KeyValuePair[];    // From identity object (filter out external_id, onesignal_id)
  tags: KeyValuePair[];       // From properties.tags object
  emails: string[];           // From subscriptions where type="Email" -> token
  smsNumbers: string[];       // From subscriptions where type="SMS" -> token
  externalId: string | null;  // From identity.external_id
}

interface KeyValuePair {
  key: string;
  value: string;
}
```

---

## Phase 4: Info Tooltips

### Prompt 4.1 - Tooltip Content

```
Tooltip content is defined locally in constants/TooltipContent.ts.
Each tooltip has a key, title, description, and optional options array.

Note: The Android and Flutter demos fetch tooltip content from:
https://raw.githubusercontent.com/OneSignal/sdk-shared/main/demo/tooltip_content.json

The RN demo currently bundles tooltips locally. Future improvement: migrate to
fetching from the same remote URL for consistency across platforms.
```

### Prompt 4.2 - Tooltip Helper

```
Create utils/TooltipHelper.ts:

import { Alert } from 'react-native';

Functions:
- showTooltip(key: string): void
  - Looks up tooltip data by key from TooltipContent
  - Shows Alert.alert() with title, description, and options list
  - Options are formatted as bullet points in the message

- getTooltip(key: string): TooltipData | undefined
  - Returns raw tooltip data for a given key
```

### Prompt 4.3 - Tooltip UI Integration

```
SectionHeader component accepts an optional tooltipKey prop.
When tooltipKey is provided, a TooltipButton (info icon) is rendered
at the right edge of the section header.

SectionHeader uses flexDirection: 'row', justifyContent: 'space-between',
and alignSelf: 'stretch' to push the tooltip icon to the far right.

TooltipButton renders a custom circled "i" icon (not an emoji) to avoid
platform-specific rendering artifacts. Uses a View with borderRadius for
the circle and a Text "i" inside.
```

---

## Phase 5: State Management

### Prompt 5.1 - App State Context

```
Create context/AppStateContext.tsx with React Context + useReducer:

AppState shape:
{
  aliases: KeyValuePair[],
  tags: KeyValuePair[],
  triggers: KeyValuePair[],
  emails: string[],
  smsNumbers: string[],
  pushSubscriptionId: string,
  pushEnabled: boolean,
  iamPaused: boolean,
  locationShared: boolean,
  consentRequired: boolean,
  consentGiven: boolean,
  externalUserId: string | null,
  isLoading: boolean,
  permissionGranted: boolean,
}

Action types:
- ADD_ALIAS, REMOVE_ALIAS, SET_ALL_ALIASES, CLEAR_ALL_ALIASES
- ADD_TAG, REMOVE_TAG, SET_ALL_TAGS
- ADD_TRIGGER, REMOVE_TRIGGER, SET_ALL_TRIGGERS, CLEAR_ALL_TRIGGERS
- ADD_EMAIL, REMOVE_EMAIL, SET_ALL_EMAILS
- ADD_SMS, REMOVE_SMS, SET_ALL_SMS
- SET_PUSH_SUBSCRIPTION_ID, SET_PUSH_ENABLED
- SET_IAM_PAUSED, SET_LOCATION_SHARED
- SET_CONSENT_REQUIRED, SET_CONSENT_GIVEN
- SET_EXTERNAL_USER_ID, SET_LOADING, SET_PERMISSION_GRANTED

Provider wraps the main content component.
useAppState() hook provides { state, dispatch }.
```

### Prompt 5.2 - What IS Persisted

```
Currently, no state is persisted to AsyncStorage.
All state resets on app restart.

On cold start:
- SDK state is read from the OneSignal SDK itself
- User data is fetched from the REST API if an OneSignal ID exists
- Push subscription state is read from SDK
```

### Prompt 5.3 - What is NOT Persisted (In-Memory Only)

```
All state in AppStateContext is in-memory:
- triggers: Cleared on app restart (intentional - transient test data)
- aliases, tags, emails, smsNumbers: Fetched fresh from API on each session
- UI state (paused, location shared, etc.): Read from SDK on each session
```

---

## Phase 6: Testing Values (Appium Compatibility)

```
All dialog input fields should be EMPTY by default.
The test automation framework (Appium) will enter these values:

- Login Dialog: External User Id = "test"
- Add Alias Dialog: Key = "Test", Value = "Value"
- Add Multiple Aliases Dialog: Key = "Test", Value = "Value" (first row; supports multiple rows)
- Add Email Dialog: Email = "test@onesignal.com"
- Add SMS Dialog: SMS = "123-456-5678"
- Add Tag Dialog: Key = "Test", Value = "Value"
- Add Multiple Tags Dialog: Key = "Test", Value = "Value" (first row; supports multiple rows)
- Add Trigger Dialog: Key = "trigger_key", Value = "trigger_value"
- Add Multiple Triggers Dialog: Key = "trigger_key", Value = "trigger_value" (first row)
- Outcome Dialog: Name = "test_outcome", Value = "1.5"
- Track Event Dialog: Name = "test_event", Properties = "{\"key\": \"value\"}"
- Custom Notification Dialog: Title = "Test Title", Body = "Test Body"
```

---

## Phase 7: Important Implementation Details

### Alias Management

```
Aliases are managed with a hybrid approach:

1. On app start/login: Fetched from REST API via fetchAndPopulateUserData()
2. When user adds alias locally:
   - Call OneSignal.User.addAlias(label, id) - syncs to server async
   - Immediately dispatch ADD_ALIAS to local state (don't wait for API)
   - This ensures instant UI feedback while SDK syncs in background
3. On next app launch: Fresh data from API includes the synced alias
```

### Notification Permission

```
Notification permission can be requested via:
- PROMPT PUSH button in Push Subscription section
- Button is only visible when permission has not been granted
- Hidden once permission is granted
```

### SDK Initialization Timing

```
CRITICAL: The React Native OneSignal SDK's initialize() method is synchronous
and fire-and-forget. Unlike the Flutter SDK (which supports await), you cannot
await initialization completion.

This means:
- SDK methods like getOnesignalId() may throw if called too soon
- Always wrap getOnesignalId() in try-catch
- Add a delay (2-3 seconds) after initialize() before first SDK query
- The user change event listener serves as a reliable fallback for data loading
- After login, wait 2 seconds before querying for the new user's ID
```

---

## Phase 8: Reusable Components

### Prompt 8.1 - Common Components

```
Create reusable components in components/common/:

Card.tsx:
- White background card with rounded corners and shadow
- Column layout with padding
- Consistent styling via constants/Styles.ts

SectionHeader.tsx:
- Row layout with title text and optional tooltip icon
- Title styled as uppercase, small, secondary color
- Tooltip icon pushed to right edge (justifyContent: 'space-between')
- alignSelf: 'stretch' to span full parent width

ActionButton.tsx:
- Primary variant (filled, primary color background)
- Outline variant (bordered, transparent background)
- Full-width buttons
- Loading state support

ToggleRow.tsx:
- Label, optional description, Switch component
- Horizontal layout with space between

EmptyState.tsx:
- Centered gray text for empty lists
- e.g., "No Aliases Added", "No Tags Added"

TooltipButton.tsx:
- Touchable info icon (circled "i" using View + Text, not emoji)
- Calls showTooltip(key) on press
- hitSlop for easier tapping
```

### Prompt 8.2 - Dialog Components

```
Create dialog components in components/dialogs/:

BaseDialog.tsx:
- Modal overlay with centered card
- Title, content slot, action buttons
- Cancel and confirm buttons

LoginUserDialog.tsx:
- Single input: "External User ID" (empty)

AddPairDialog.tsx:
- Two inputs: configurable labels (e.g., "Key"/"Value" or "Label"/"ID")
- Used for aliases, tags, triggers

MultiPairInputDialog.tsx:
- Dynamic rows of key-value pairs
- "Add Row" button to add more rows
- Remove button per row (hidden when only one row)
- "Add All" button disabled until all fields filled

MultiSelectRemoveDialog.tsx:
- Checkboxes for each item
- "Remove (N)" button showing selected count
- Used for tags and triggers removal

AddEmailDialog.tsx:
- Single input: "Email Address" (empty)

AddSmsDialog.tsx:
- Single input: "Phone Number" (empty)

SendOutcomeDialog.tsx:
- Radio buttons: Normal, Unique, With Value
- Name input (always visible)
- Value input (visible only for "With Value")

TrackEventDialog.tsx:
- Event name input (required)
- Properties JSON input (optional, validated)

CustomNotificationDialog.tsx:
- Title and Body inputs
```

### Prompt 8.3 - Theme & Styling

```
constants/Colors.ts:
- primary: '#E54B4D' (OneSignal Red)
- primaryDark: '#CE3E40'
- accent: '#303030'
- background: '#F8F9FA'
- cardBackground: '#FFFFFF'
- darkText: '#1F1F1F'
- secondaryText: '#5F6368'
- divider: '#E8EAED'
- surfaceBorder: '#DADCE0'
- white: '#FFFFFF'
- consoleBackground: '#1A1B1E'
- consoleHeaderBackground: '#25262A'
- green: '#34A853'
- greenLight: '#E6F4EA'
- warningBackground: '#FFF8E1'

constants/Styles.ts:
- CommonStyles object with shared StyleSheet definitions
- card, sectionHeader, primaryButton, outlineButton, etc.
```

---

## Key Files Structure

```
examples/RNOneSignalTS/
├── components/
│   ├── common/
│   │   ├── ActionButton.tsx         # Primary/Outline buttons
│   │   ├── Card.tsx                 # Card container
│   │   ├── EmptyState.tsx           # Empty list state
│   │   ├── SectionHeader.tsx        # Section title + tooltip
│   │   ├── ToggleRow.tsx            # Label + Switch
│   │   └── TooltipButton.tsx        # Circled "i" info icon
│   ├── dialogs/
│   │   ├── BaseDialog.tsx           # Base modal dialog
│   │   ├── AddEmailDialog.tsx       # Add email dialog
│   │   ├── AddPairDialog.tsx        # Key-value pair dialog
│   │   ├── AddSmsDialog.tsx         # Add SMS dialog
│   │   ├── CustomNotificationDialog.tsx  # Custom notification dialog
│   │   ├── LoginUserDialog.tsx      # Login dialog
│   │   ├── MultiPairInputDialog.tsx # Multi-pair batch input
│   │   ├── MultiSelectRemoveDialog.tsx  # Checkbox removal dialog
│   │   ├── SendOutcomeDialog.tsx    # Outcome dialog with type selection
│   │   └── TrackEventDialog.tsx     # Track event with JSON validation
│   └── sections/
│       ├── AliasesSection.tsx       # Alias management
│       ├── AppInfoSection.tsx       # App ID, consent toggles
│       ├── EmailSection.tsx         # Email subscriptions
│       ├── IamDemoSection.tsx       # Send IAM triggers
│       ├── InAppMessagingSection.tsx # IAM pause toggle
│       ├── LiveActivitiesSection.tsx # iOS Live Activities
│       ├── LocationSection.tsx      # Location sharing
│       ├── NavigationSection.tsx    # Navigation testing
│       ├── NotificationDemoSection.tsx  # Send notifications
│       ├── OutcomeSection.tsx       # Outcome events
│       ├── PushSubscriptionSection.tsx  # Push subscription
│       ├── SmsSection.tsx           # SMS subscriptions
│       ├── TagsSection.tsx          # Tag management
│       ├── TrackEventSection.tsx    # Event tracking
│       ├── TriggersSection.tsx      # Trigger management
│       └── UserSection.tsx          # User login/logout
├── constants/
│   ├── Colors.ts                    # OneSignal brand colors
│   ├── Config.ts                    # App ID configuration
│   ├── IamTemplates.ts              # IAM type definitions
│   ├── NotificationPayloads.ts      # Notification templates
│   ├── NotificationTemplates.ts     # Template display data
│   ├── Styles.ts                    # Common StyleSheet styles
│   └── TooltipContent.ts            # Tooltip definitions
├── context/
│   └── AppStateContext.tsx           # React Context + useReducer
├── services/
│   ├── NotificationSender.ts        # REST API notification sending
│   └── OneSignalService.ts          # REST API user data fetching
├── types/
│   └── index.ts                     # TypeScript type definitions
├── utils/
│   └── TooltipHelper.ts             # Tooltip display utility
├── App.tsx                          # Root component with navigation
├── DetailsScreen.tsx                # Secondary tab (user/device info)
├── OSDemo.tsx                       # Main demo screen
├── OSConsole.tsx                    # Debug log console component
├── index.js                         # App entry point
├── package.json
├── tsconfig.json
└── build_app_prompt.md              # This file
```

Note:

- All UI is React Native components (no native XML/Storyboard layouts)
- Tooltip content is bundled locally (future: migrate to remote URL)
- Debug console at top of screen displays SDK and app logs
- Navigation uses bottom tabs with Home (OSDemo) and Details screens

---

## Configuration

### constants/Config.ts

```typescript
export const APP_ID = '77e32082-ea27-42e3-a898-c72e141824ef';
export const ONESIGNAL_API_URL = 'https://onesignal.com/api/v1/notifications';
```

Note: Replace APP_ID with your own OneSignal App ID. REST API key is NOT required for the fetchUser endpoint.

### Package Name

The package name is `com.rnonesignalts` (Android) and the bundle ID configured in Xcode (iOS).

---

## Summary

This app demonstrates all OneSignal React Native SDK features:

- User management (login/logout, aliases with batch add)
- Push notifications (subscription, sending with images, notification templates)
- Email and SMS subscriptions (with collapsible lists)
- Tags for segmentation (batch add/remove support)
- Triggers for in-app message targeting (in-memory only, batch operations)
- Outcomes for conversion tracking
- Event tracking with JSON properties validation
- In-app messages (display testing with trigger-based types)
- Location sharing
- Privacy consent management
- Live Activities (iOS)

The app is designed to be:

1. **Testable** - Empty dialogs for Appium automation
2. **Comprehensive** - All SDK features demonstrated
3. **Clean** - React Context + useReducer state management
4. **Cross-platform ready** - Runs on both iOS and Android
5. **Session-based triggers** - Triggers stored in memory only, cleared on restart
6. **Responsive UI** - Loading indicators during data fetches
7. **Debuggable** - Collapsible log console at top of screen
8. **Modern UI** - OneSignal brand colors with consistent component library
9. **Batch Operations** - Add multiple items at once, select and remove multiple items
10. **Consistent with other platforms** - Matches Android and Flutter demo app design and functionality
