import { useEffect } from 'react';
import { SafeAreaView, StyleSheet, Text } from 'react-native';
import { OneSignal } from 'react-native-onesignal';

const ONESIGNAL_APP_ID = 'YOUR-ONESIGNAL-APP-ID';

export default function App() {
  useEffect(() => {
    OneSignal.initialize(ONESIGNAL_APP_ID);
    OneSignal.Notifications.requestPermission(false);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>OneSignal No-Location Demo</Text>
      <Text style={styles.body}>
        This app initializes OneSignal without using the OneSignal.Location namespace.
      </Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 12,
  },
  body: {
    fontSize: 16,
  },
});
