# OneSignal React Native TypeScript Example

This is a comprehensive example project demonstrating how to integrate and use the OneSignal React Native SDK with TypeScript support.

## Features Demonstrated

- **Push Notifications**: Request permissions, handle notification clicks and foreground display
- **User Management**: Login/logout users with external IDs
- **User Attributes**: Add/remove tags, emails, and SMS numbers
- **In-App Messages**: Add triggers and handle in-app message events
- **Event Tracking**: Track custom events for analytics
- **Subscription Management**: Opt in/out of push notifications
- **Real-time State**: Display current user state and subscription status

## Prerequisites

- Node.js (>= 20)
- React Native development environment set up
- OneSignal account and App ID
- iOS Simulator or Android Emulator (or physical device)

## Setup Instructions

### 1. Install Dependencies

```bash
cd examples/RNOneSignalTS
npm install
```

### 2. Configure OneSignal App ID

1. Open `App.tsx`
2. Replace `YOUR_ONESIGNAL_APP_ID` with your actual OneSignal App ID
3. You can find your App ID in the OneSignal dashboard under Settings > Keys & IDs

### 3. iOS Setup

```bash
cd ios
pod install
cd ..
```

### 4. Android Setup

No additional setup required for Android (autolinking handles the integration).

## Running the Example

### Start Metro Bundler

```bash
npm start
```

### Run on iOS

```bash
npm run ios
```

### Run on Android

```bash
npm run android
```

## Example App Features

### User State Display

- Shows current OneSignal ID, External ID, and subscription status
- Displays push subscription ID and token
- Real-time updates when user state changes

### Permission Management

- Request push notification permissions
- Toggle opt-in/opt-out status
- View current permission status

### User Management

- Login users with external IDs
- Logout users
- Track user state changes

### Email Management

- Add email addresses to user profile
- Remove email addresses

### Tag Management

- Add custom tags to users
- Remove tags
- Tags are used for targeting and personalization

### In-App Message Triggers

- Add triggers to show in-app messages
- Remove triggers
- Handle in-app message events

### Event Tracking

- Track custom events
- Events can be used for analytics and targeting

### Notification Management

- Clear all notifications
- Handle notification clicks
- Handle foreground notification display

## Code Structure

### Main Components

- **App.tsx**: Main application component with all OneSignal integration
- **UserState Interface**: TypeScript interface for user state management
- **Event Listeners**: Comprehensive event handling for all OneSignal features

### Key OneSignal Features Used

```typescript
// Initialize OneSignal
OneSignal.initialize(ONESIGNAL_APP_ID);

// User management
OneSignal.login(externalId);
OneSignal.logout();

// Push notifications
OneSignal.Notifications.requestPermission(false);
OneSignal.Notifications.addEventListener('click', handler);

// User attributes
OneSignal.User.addTag(key, value);
OneSignal.User.addEmail(email);

// In-app messages
OneSignal.InAppMessages.addTrigger(key, value);
OneSignal.InAppMessages.addEventListener('click', handler);

// Event tracking
OneSignal.User.trackEvent('event_name', properties);
```

## Event Handling

The example demonstrates comprehensive event handling for:

- **User State Changes**: Track when user login/logout occurs
- **Push Subscription Changes**: Monitor subscription status changes
- **Permission Changes**: Handle permission grant/deny events
- **Notification Events**: Handle clicks and foreground display
- **In-App Message Events**: Handle display, click, and dismiss events

## Testing

### Push Notifications

1. Run the app and request permissions
2. Send a test notification from OneSignal dashboard
3. Test notification clicks and foreground display

### In-App Messages

1. Add triggers in the app
2. Create an in-app message in OneSignal dashboard with matching triggers
3. Test message display and interactions

### User Targeting

1. Add tags to users in the app
2. Create segments in OneSignal dashboard based on tags
3. Send targeted notifications to specific segments

## Troubleshooting

### Common Issues

1. **App ID not set**: Make sure to replace `YOUR_ONESIGNAL_APP_ID` with your actual App ID
2. **Permissions not working**: Check device settings and ensure notifications are enabled
3. **Metro bundler issues**: Try clearing Metro cache with `npx react-native start --reset-cache`
4. **iOS build issues**: Make sure to run `pod install` in the ios directory

### Debug Logging

The example enables verbose logging for debugging:

```typescript
OneSignal.Debug.setLogLevel(LogLevel.Verbose);
OneSignal.Debug.setAlertLevel(LogLevel.Verbose);
```

Check the console for detailed logs of OneSignal operations.

## Platform-Specific Notes

### iOS

- Requires iOS 10.0+
- Uses APNs for push notifications
- Supports Live Activities (iOS 16.1+)
- Requires proper provisioning profile for push notifications

### Android

- Requires Android API 21+
- Uses FCM for push notifications
- Supports notification channels
- Requires Google Services configuration

## Next Steps

1. **Customize the UI**: Modify the example to match your app's design
2. **Add more features**: Implement additional OneSignal features like Live Activities
3. **Error handling**: Add comprehensive error handling for production use
4. **Testing**: Add unit tests for your OneSignal integration
5. **Analytics**: Implement custom event tracking for your specific use cases

## Resources

- [OneSignal Documentation](https://documentation.onesignal.com/)
- [React Native OneSignal SDK](https://github.com/OneSignal/react-native-onesignal)
- [OneSignal Dashboard](https://app.onesignal.com/)
- [React Native Documentation](https://reactnative.dev/)

## Support

For issues related to this example:

1. Check the troubleshooting section above
2. Review OneSignal documentation
3. Check the main SDK repository for known issues
4. Contact OneSignal support for SDK-specific issues
