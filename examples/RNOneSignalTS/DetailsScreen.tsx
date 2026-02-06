import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Platform,
  Alert,
} from 'react-native';
import { OneSignal } from 'react-native-onesignal';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from './components/common/Card';
import { SectionHeader } from './components/common/SectionHeader';
import { Colors } from './constants/Colors';

const DetailsScreen: React.FC = () => {
  const [onesignalId, setOnesignalId] = useState<string | null>(null);
  const [externalId, setExternalId] = useState<string | null>(null);
  const [pushSubscriptionId, setPushSubscriptionId] = useState<string | null>(
    null,
  );
  const [pushToken, setPushToken] = useState<string | null>(null);

  useEffect(() => {
    loadUserInfo();
  }, []);

  const loadUserInfo = async () => {
    try {
      const osId = await OneSignal.User.getOnesignalId();
      setOnesignalId(osId);

      const extId = await OneSignal.User.getExternalId();
      setExternalId(extId);

      const subId = await OneSignal.User.pushSubscription.getIdAsync();
      setPushSubscriptionId(subId);

      const token = await OneSignal.User.pushSubscription.getTokenAsync();
      setPushToken(token);
    } catch (error) {
      console.error('Error loading user info:', error);
    }
  };

  const copyToClipboard = (text: string | null, label: string) => {
    if (text) {
      // Use Alert to show the value since copying to clipboard isn't critical
      Alert.alert(label, text, [
        {
          text: 'OK',
          style: 'default',
        },
      ]);
    }
  };

  const InfoRow = ({
    label,
    value,
  }: {
    label: string;
    value: string | null;
  }) => (
    <View style={styles.infoRow}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.valueContainer}>
        <Text style={styles.value} numberOfLines={2} ellipsizeMode="middle">
          {value || 'Not available'}
        </Text>
        {value && (
          <TouchableOpacity
            onPress={() => copyToClipboard(value, label)}
            style={styles.copyButton}
          >
            <Text style={styles.copyText}>View</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      <ScrollView style={styles.scrollView}>
        <Card>
          <SectionHeader title="User Information" />
          <InfoRow label="OneSignal User ID" value={onesignalId} />
          <InfoRow label="External User ID" value={externalId} />
          <InfoRow label="Push Subscription ID" value={pushSubscriptionId} />
          <InfoRow label="Push Token" value={pushToken} />
        </Card>

        <Card>
          <SectionHeader title="Device Information" />
          <View style={styles.infoRow}>
            <Text style={styles.label}>Platform</Text>
            <Text style={styles.value}>{Platform.OS}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>OS Version</Text>
            <Text style={styles.value}>{Platform.Version}</Text>
          </View>
        </Card>

        <Card>
          <SectionHeader title="App Information" />
          <View style={styles.infoRow}>
            <Text style={styles.label}>App ID</Text>
            <Text style={styles.value}>
              77e32082-ea27-42e3-a898-c72e141824ef
            </Text>
          </View>
        </Card>

        <TouchableOpacity style={styles.refreshButton} onPress={loadUserInfo}>
          <Text style={styles.refreshButtonText}>Refresh</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  infoRow: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.darkText,
    marginBottom: 4,
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  value: {
    fontSize: 14,
    color: Colors.darkText,
    flex: 1,
  },
  copyButton: {
    marginLeft: 8,
    paddingVertical: 4,
    paddingHorizontal: 12,
    backgroundColor: Colors.primary,
    borderRadius: 4,
  },
  copyText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  refreshButton: {
    backgroundColor: Colors.primary,
    borderRadius: 6,
    padding: 16,
    margin: 12,
    alignItems: 'center',
  },
  refreshButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default DetailsScreen;
