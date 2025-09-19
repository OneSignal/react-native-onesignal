import React, { useEffect, useState } from 'react';
import {
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { LogLevel, OneSignal } from 'react-native-onesignal';

// Replace with your OneSignal App ID
const ONESIGNAL_APP_ID = 'YOUR_ONESIGNAL_APP_ID';

interface UserState {
  onesignalId: string | null;
  externalId: string | null;
  pushSubscriptionId: string | null;
  pushSubscriptionToken: string | null;
  optedIn: boolean;
  hasPermission: boolean;
}

function App(): React.JSX.Element {
  const [userState, setUserState] = useState<UserState>({
    onesignalId: null,
    externalId: null,
    pushSubscriptionId: null,
    pushSubscriptionToken: null,
    optedIn: false,
    hasPermission: false,
  });
  const [externalIdInput, setExternalIdInput] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [tagKey, setTagKey] = useState('');
  const [tagValue, setTagValue] = useState('');
  const [triggerKey, setTriggerKey] = useState('');
  const [triggerValue, setTriggerValue] = useState('');

  useEffect(() => {
    // Initialize OneSignal
    OneSignal.initialize(ONESIGNAL_APP_ID);

    // Enable debug logging
    OneSignal.Debug.setLogLevel(LogLevel.Verbose);
    OneSignal.Debug.setAlertLevel(LogLevel.Verbose);

    // Set up event listeners
    setupEventListeners();

    // Load initial state
    loadUserState();
  }, []);

  const setupEventListeners = () => {
    // User state change listener
    OneSignal.User.addEventListener('change', event => {
      console.log('User state changed:', event);
      setUserState(prev => ({
        ...prev,
        onesignalId: event.current.onesignalId,
        externalId: event.current.externalId,
      }));
    });

    // Push subscription change listener
    OneSignal.User.pushSubscription.addEventListener('change', event => {
      console.log('Push subscription changed:', event);
      setUserState(prev => ({
        ...prev,
        pushSubscriptionId: event.current.id,
        pushSubscriptionToken: event.current.token,
        optedIn: event.current.optedIn,
      }));
    });

    // Notification permission change listener
    OneSignal.Notifications.addEventListener('permissionChange', granted => {
      console.log('Permission changed:', granted);
      setUserState(prev => ({
        ...prev,
        hasPermission: granted,
      }));
    });

    // Notification click listener
    OneSignal.Notifications.addEventListener('click', event => {
      console.log('Notification clicked:', event);
    });

    // Notification foreground display listener
    OneSignal.Notifications.addEventListener('foregroundWillDisplay', event => {
      console.log('Notification will display in foreground:', event);
      // Complete the notification to show it
      event.complete(event.getNotification());
    });

    // In-app message listeners
    OneSignal.InAppMessages.addEventListener('click', event => {
      console.log('In-app message clicked:', event);
    });

    OneSignal.InAppMessages.addEventListener('willDisplay', event => {
      console.log('In-app message will display:', event);
    });

    OneSignal.InAppMessages.addEventListener('didDisplay', event => {
      console.log('In-app message did display:', event);
    });
  };

  const loadUserState = async () => {
    try {
      const [
        onesignalId,
        externalId,
        pushSubscriptionId,
        pushSubscriptionToken,
        optedIn,
        hasPermission,
      ] = await Promise.all([
        OneSignal.User.getOnesignalId(),
        OneSignal.User.getExternalId(),
        OneSignal.User.pushSubscription.getIdAsync(),
        OneSignal.User.pushSubscription.getTokenAsync(),
        OneSignal.User.pushSubscription.getOptedInAsync(),
        OneSignal.Notifications.getPermissionAsync(),
      ]);

      setUserState({
        onesignalId,
        externalId,
        pushSubscriptionId,
        pushSubscriptionToken,
        optedIn,
        hasPermission,
      });
    } catch (error) {
      console.error('Error loading user state:', error);
    }
  };

  const requestPermission = async () => {
    try {
      const granted = await OneSignal.Notifications.requestPermission(false);
      console.log('Permission granted:', granted);
    } catch (error) {
      console.error('Failed to request permission:', error);
    }
  };

  const loginUser = () => {
    if (externalIdInput.trim()) {
      OneSignal.login(externalIdInput.trim());
      setExternalIdInput('');
      console.log('User logged in successfully');
    } else {
      console.log('Please enter an external ID');
    }
  };

  const logoutUser = () => {
    OneSignal.logout();
    console.log('User logged out successfully');
  };

  const addEmail = () => {
    if (emailInput.trim()) {
      OneSignal.User.addEmail(emailInput.trim());
      setEmailInput('');
      console.log('Email added successfully');
    } else {
      console.log('Please enter an email address');
    }
  };

  const addTag = () => {
    if (tagKey.trim() && tagValue.trim()) {
      OneSignal.User.addTag(tagKey.trim(), tagValue.trim());
      setTagKey('');
      setTagValue('');
      console.log('Tag added successfully');
    } else {
      console.log('Please enter both key and value');
    }
  };

  const addTrigger = () => {
    if (triggerKey.trim() && triggerValue.trim()) {
      OneSignal.InAppMessages.addTrigger(
        triggerKey.trim(),
        triggerValue.trim(),
      );
      setTriggerKey('');
      setTriggerValue('');
      console.log('Trigger added successfully');
    } else {
      console.log('Please enter both key and value');
    }
  };

  const trackEvent = () => {
    OneSignal.User.trackEvent('example_event', {
      platform: Platform.OS,
      timestamp: new Date().toISOString(),
    });
    console.log('Event tracked successfully');
  };

  const toggleOptIn = () => {
    if (userState.optedIn) {
      OneSignal.User.pushSubscription.optOut();
    } else {
      OneSignal.User.pushSubscription.optIn();
    }
  };

  const clearAllNotifications = () => {
    OneSignal.Notifications.clearAll();
    console.log('All notifications cleared');
  };

  const Button = ({
    title,
    onPress,
    style,
  }: {
    title: string;
    onPress: () => void;
    style?: any;
  }) => (
    <TouchableOpacity style={[styles.button, style]} onPress={onPress}>
      <Text style={styles.buttonText}>{title}</Text>
    </TouchableOpacity>
  );

  const Input = ({
    placeholder,
    value,
    onChangeText,
  }: {
    placeholder: string;
    value: string;
    onChangeText: (text: string) => void;
  }) => (
    <TextInput
      style={styles.input}
      placeholder={placeholder}
      value={value}
      onChangeText={onChangeText}
      placeholderTextColor="#999"
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
      <ScrollView style={styles.scrollView}>
        <Text style={styles.title}>OneSignal React Native Example</Text>

        {/* User State Display */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>User State</Text>
          <Text style={styles.infoText}>
            OneSignal ID: {userState.onesignalId || 'Not available'}
          </Text>
          <Text style={styles.infoText}>
            External ID: {userState.externalId || 'Not set'}
          </Text>
          <Text style={styles.infoText}>
            Push Subscription ID:{' '}
            {userState.pushSubscriptionId || 'Not available'}
          </Text>
          <Text style={styles.infoText}>
            Opted In: {userState.optedIn ? 'Yes' : 'No'}
          </Text>
          <Text style={styles.infoText}>
            Has Permission: {userState.hasPermission ? 'Yes' : 'No'}
          </Text>
        </View>

        {/* Permission Management */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Permission Management</Text>
          <Button title="Request Permission" onPress={requestPermission} />
          <View style={styles.switchContainer}>
            <Text style={styles.switchLabel}>Opt In to Push Notifications</Text>
            <Switch value={userState.optedIn} onValueChange={toggleOptIn} />
          </View>
        </View>

        {/* User Management */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>User Management</Text>
          <Input
            placeholder="External ID"
            value={externalIdInput}
            onChangeText={setExternalIdInput}
          />
          <Button title="Login User" onPress={loginUser} />
          <Button title="Logout User" onPress={logoutUser} />
        </View>

        {/* Email Management */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Email Management</Text>
          <Input
            placeholder="Email address"
            value={emailInput}
            onChangeText={setEmailInput}
          />
          <Button title="Add Email" onPress={addEmail} />
        </View>

        {/* Tag Management */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tag Management</Text>
          <Input
            placeholder="Tag Key"
            value={tagKey}
            onChangeText={setTagKey}
          />
          <Input
            placeholder="Tag Value"
            value={tagValue}
            onChangeText={setTagValue}
          />
          <Button title="Add Tag" onPress={addTag} />
        </View>

        {/* In-App Message Triggers */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>In-App Message Triggers</Text>
          <Input
            placeholder="Trigger Key"
            value={triggerKey}
            onChangeText={setTriggerKey}
          />
          <Input
            placeholder="Trigger Value"
            value={triggerValue}
            onChangeText={setTriggerValue}
          />
          <Button title="Add Trigger" onPress={addTrigger} />
        </View>

        {/* Event Tracking */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Event Tracking</Text>
          <Button title="Track Example Event" onPress={trackEvent} />
        </View>

        {/* Notification Management */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notification Management</Text>
          <Button
            title="Clear All Notifications"
            onPress={clearAllNotifications}
          />
        </View>

        {/* Instructions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Instructions</Text>
          <Text style={styles.instructionText}>
            1. Replace 'YOUR_ONESIGNAL_APP_ID' with your actual OneSignal App ID
            {'\n'}
            2. Request permission to receive push notifications{'\n'}
            3. Login with an external ID to identify the user{'\n'}
            4. Add tags and triggers to test targeting{'\n'}
            5. Send test notifications from OneSignal dashboard{'\n'}
            6. Test in-app messages with triggers
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
    color: '#333',
  },
  section: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  infoText: {
    fontSize: 14,
    marginBottom: 4,
    color: '#666',
  },
  button: {
    backgroundColor: '#007bff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 6,
    marginVertical: 4,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginVertical: 4,
    fontSize: 16,
    backgroundColor: 'white',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 8,
  },
  switchLabel: {
    fontSize: 16,
    color: '#333',
  },
  instructionText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});

export default App;
