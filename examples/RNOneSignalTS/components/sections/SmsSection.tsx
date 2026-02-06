import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { OneSignal } from 'react-native-onesignal';
import { Card } from '../common/Card';
import { SectionHeader } from '../common/SectionHeader';
import { EmptyState } from '../common/EmptyState';
import { ActionButton } from '../common/ActionButton';
import { AddSmsDialog } from '../dialogs/AddSmsDialog';
import { useAppState } from '../../context/AppStateContext';
import { Colors } from '../../constants/Colors';

interface SmsSectionProps {
  loggingFunction: (message: string, optionalArg?: unknown) => void;
}

export function SmsSection({ loggingFunction }: SmsSectionProps) {
  const { state, dispatch } = useAppState();
  const [dialogVisible, setDialogVisible] = useState(false);

  const handleAddSms = (phone: string) => {
    loggingFunction('Attempting to set SMS number: ', phone);
    OneSignal.User.addSms(phone);
    dispatch({ type: 'ADD_SMS', payload: phone });
  };

  const handleRemoveSms = (phone: string) => {
    loggingFunction('Attempting to remove SMS number: ', phone);
    OneSignal.User.removeSms(phone);
    dispatch({ type: 'REMOVE_SMS', payload: phone });
  };

  return (
    <Card>
      <SectionHeader title="SMS" />
      {state.smsNumbers.length === 0 ? (
        <EmptyState message="No SMS Numbers Added" />
      ) : (
        <FlatList
          data={state.smsNumbers}
          keyExtractor={(item, index) => `${item}-${index}`}
          renderItem={({ item }) => (
            <View style={styles.item}>
              <Text style={styles.itemText}>{item}</Text>
              <TouchableOpacity
                onPress={() => handleRemoveSms(item)}
                style={styles.deleteButton}
              >
                <Text style={styles.deleteText}>✕</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}
      <ActionButton
        title="Add SMS Number"
        onPress={() => setDialogVisible(true)}
        style={styles.addButton}
      />
      <AddSmsDialog
        visible={dialogVisible}
        onClose={() => setDialogVisible(false)}
        onConfirm={handleAddSms}
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  itemText: {
    fontSize: 14,
    color: Colors.darkText,
    flex: 1,
  },
  deleteButton: {
    padding: 8,
  },
  deleteText: {
    fontSize: 18,
    color: Colors.primary,
  },
  addButton: {
    marginTop: 12,
  },
});
