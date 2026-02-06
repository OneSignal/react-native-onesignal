import React, { useState, useEffect } from 'react';
import { Modal, View, Text, StyleSheet } from 'react-native';
import { OneSignal } from 'react-native-onesignal';
import { ActionButton } from '../common/ActionButton';
import { Colors } from '../../constants/Colors';
import { useAppState } from '../../context/AppStateContext';

interface PrivacyConsentSectionProps {
  loggingFunction: (message: string, optionalArg?: unknown) => void;
}

export function PrivacyConsentSection({
  loggingFunction,
}: PrivacyConsentSectionProps) {
  const { state, dispatch } = useAppState();
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    // Only show the modal initially, not on every render
    // In a real app, you might want to persist this in AsyncStorage
    const checkConsent = async () => {
      if (!state.consentGiven && !showModal) {
        // Show modal only once at startup
        setTimeout(() => {
          setShowModal(true);
        }, 500);
      }
    };
    checkConsent();
  }, []);

  const handleAllow = async () => {
    loggingFunction('Privacy consent granted');
    await OneSignal.setConsentGiven(true);
    dispatch({ type: 'SET_CONSENT_GIVEN', payload: true });
    setShowModal(false);
  };

  if (!showModal) {
    return null;
  }

  return (
    <Modal visible={showModal} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>Privacy Consent</Text>
          <Text style={styles.message}>
            This app would like to send you notifications. Your data will be
            handled according to our privacy policy.
          </Text>
          <ActionButton
            title="Allow"
            onPress={handleAllow}
            style={styles.button}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 8,
    padding: 24,
    width: '80%',
    maxWidth: 400,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.darkText,
    marginBottom: 16,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: Colors.darkText,
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 22,
  },
  button: {
    marginTop: 8,
  },
});
