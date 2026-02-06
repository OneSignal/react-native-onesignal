# Quick Start Guide - React Native OneSignal Demo App Redesign

## What Was Changed?

The React Native OneSignal demo app has been redesigned with a modern, card-based Material Design UI that matches the Android SDK demo app quality.

### Visual Changes
- 🔴 OneSignal red (#E9444E) replaces blue (#007bff)
- 📦 Card-based layout replaces flat button list
- 📊 30/70 split (console: 30%, content: 70%) replaces 50/50
- 🎨 Material Design with shadows and elevation
- 🎯 15 organized sections replace 53 flat buttons

### Functional Enhancements
- ✅ State visibility (see current aliases, tags, triggers)
- ✅ Toggle switches for binary states (push on/off, location, IAM)
- ✅ Modal dialogs for user input
- ✅ Empty state placeholders
- ✅ FlatLists for collection management
- ✅ Demo grids for notifications and IAMs
- ✅ Enhanced Details screen with debug info

## Running the App

```bash
cd /Users/sherwin/dev/all-repos/cross-platform/react-native-onesignal/examples/RNOneSignalTS

# Dependencies already installed
# If needed: npm install --legacy-peer-deps

# Run on iOS
npm run ios

# Run on Android
npm run android
```

## File Structure

```
RNOneSignalTS/
├── components/
│   ├── common/           # 6 reusable components
│   │   ├── ActionButton.tsx
│   │   ├── Card.tsx
│   │   ├── EmptyState.tsx
│   │   ├── SectionHeader.tsx
│   │   └── ToggleRow.tsx
│   ├── dialogs/          # 5 input dialogs
│   │   ├── BaseDialog.tsx
│   │   ├── AddPairDialog.tsx
│   │   ├── AddEmailDialog.tsx
│   │   ├── AddSmsDialog.tsx
│   │   └── SendOutcomeDialog.tsx
│   └── sections/         # 15 feature sections
│       ├── PrivacyConsentSection.tsx
│       ├── AppInfoSection.tsx
│       ├── AliasesSection.tsx
│       ├── EmailSection.tsx
│       ├── SmsSection.tsx
│       ├── TagsSection.tsx
│       ├── PushSubscriptionSection.tsx
│       ├── OutcomeSection.tsx
│       ├── InAppMessagingSection.tsx
│       ├── TriggersSection.tsx
│       ├── LocationSection.tsx
│       ├── LiveActivitiesSection.tsx
│       ├── NotificationDemoSection.tsx
│       ├── IamDemoSection.tsx
│       └── NavigationSection.tsx
├── constants/
│   ├── Colors.ts         # OneSignal red color scheme
│   ├── Styles.ts         # Material Design styles
│   ├── NotificationTemplates.ts  # 8 notification types
│   └── IamTemplates.ts   # 4 IAM types
├── context/
│   └── AppStateContext.tsx  # Global state management
├── types/
│   └── index.ts          # TypeScript interfaces
├── App.tsx               # Navigation (unchanged)
├── OSDemo.tsx            # Main screen (refactored)
├── OSConsole.tsx         # Console output (unchanged)
├── DetailsScreen.tsx     # Debug info screen (enhanced)
├── Helpers.tsx           # Utilities (unchanged)
└── OSButtons.tsx.backup  # Old implementation (archived)
```

## Key Features by Section

### 1. Privacy Consent (Modal)
- Blocks UI until consent given
- Shows once at startup
- Can be revoked via App Info section

### 2. App Info
- Displays App ID
- Login/Logout buttons
- Revoke Consent button

### 3-5. Collections (Aliases, Email, SMS)
- FlatList showing current items
- Add button opens dialog
- Delete button (×) on each item
- Empty state when no items

### 6. Tags
- Similar to Aliases (key-value pairs)
- Get Tags button to fetch from server
- Add/Remove functionality

### 7. Push Subscription
- Shows Subscription ID
- Toggle to opt in/out
- Prompt Permission button

### 8. Outcomes
- Send Outcome button
- Dialog for name + optional value

### 9. In-App Messaging
- Toggle to pause/unpause IAM

### 10. Triggers
- FlatList of current triggers
- Add Trigger button
- Clear All button

### 11. Location
- Toggle to share/unshare location
- Request Permission button

### 12. Live Activities (iOS only)
- Start Default button
- Enter Activity button
- Exit Activity button

### 13. Notification Demos
- 2x4 grid of 8 notification types
- Tappable cards with icons

### 14. IAM Demos
- 2x2 grid of 4 IAM types
- Tappable cards with icons

### 15. Navigation
- Button to go to Details screen

### Details Screen
- OneSignal User ID
- External User ID
- Push Subscription ID
- Push Token
- Platform and OS Version
- App ID
- Refresh button

## Color Palette

```typescript
Colors.primary = '#E9444E'           // OneSignal Red (main)
Colors.primaryDark = '#A12F36'       // Dark red
Colors.accent = '#303030'            // Dark gray
Colors.background = '#ECECEC'        // Light gray background
Colors.cardBackground = '#FFFFFF'    // White cards
Colors.darkText = '#3A3A3A'         // Text color
Colors.divider = '#ECECEC'          // Divider lines
Colors.white = '#FFFFFF'            // White
Colors.consoleBackground = '#f8f9fa' // Console area
```

## Testing the App

### Visual Checks
1. Launch app → see Privacy Consent modal
2. Tap "Allow" → modal disappears
3. See card-based sections with red buttons
4. Scroll through all 15 sections
5. Check console at top (30% height)
6. Verify clear button is red, not blue
7. Background should be light gray (#ECECEC)

### Functional Checks
1. **Add Alias**: Tap "Add Alias" → dialog opens → enter key/value → appears in list
2. **Delete Alias**: Tap × button → item removed
3. **Toggle Push**: Switch push toggle → logs to console
4. **Send Outcome**: Tap button → dialog opens → enter name → logs to console
5. **Navigate**: Tap "Go to Details" → Details screen shows
6. **Details Screen**: See user IDs → tap "View" → alert shows full ID

### SDK Integration Checks
- All actions should log to console at top
- OneSignal SDK methods are called (check console output)
- Event listeners fire (notification received, IAM displayed, etc.)

## Troubleshooting

### TypeScript Errors
```bash
npx tsc --noEmit --skipLibCheck
```
Should only show jest-related warnings (ignorable)

### Import Errors
All imports use relative paths from OSDemo.tsx:
- `./components/sections/...`
- `./constants/...`
- `./context/...`

### Navigation Errors
RootTabParamList is defined in App.tsx
NavigationSection imports it from '../../App'

### Build Errors
If Metro bundler has issues:
```bash
npm start -- --reset-cache
```

## Next Steps

### For Development
1. Test on real device with OneSignal App ID
2. Send test notifications from OneSignal dashboard
3. Verify all SDK features work correctly
4. Test on both iOS and Android

### For Production
1. Replace demo App ID with your own
2. Configure OneSignal dashboard
3. Test notification delivery
4. Test IAM campaigns
5. Verify privacy consent flow

### Potential Enhancements
- [ ] Add AsyncStorage to persist state
- [ ] Add pull-to-refresh on Details screen
- [ ] Add search/filter for large lists
- [ ] Add animations for add/remove items
- [ ] Add haptic feedback on actions
- [ ] Add dark mode support
- [ ] Add accessibility labels
- [ ] Add unit tests for components
- [ ] Add integration tests for SDK calls

## Documentation

- `REDESIGN_SUMMARY.md` - Full implementation details
- `BEFORE_AFTER.md` - Visual comparison of old vs new
- `QUICK_START.md` - This file (quick reference)

## Support

If you encounter issues:
1. Check console for errors
2. Verify OneSignal SDK is initialized
3. Check that App ID is valid
4. Ensure all imports are correct
5. Try clearing Metro cache
6. Reinstall dependencies if needed

## Success Criteria ✅

The redesign is successful if:
- ✅ App launches without errors
- ✅ Privacy consent modal appears
- ✅ All 15 sections display correctly
- ✅ Card-based UI with red buttons
- ✅ Console logs SDK events
- ✅ All 53 SDK features work
- ✅ Details screen shows user info
- ✅ Navigation between tabs works
- ✅ Matches Android demo quality

---

**You're all set!** 🚀

Run `npm run ios` or `npm run android` to see the new design in action.
