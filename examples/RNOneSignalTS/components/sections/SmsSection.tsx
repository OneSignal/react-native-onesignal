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

const COLLAPSE_THRESHOLD = 5;

interface SmsSectionProps {
  loggingFunction: (message: string, optionalArg?: unknown) => void;
}

export function SmsSection({ loggingFunction }: SmsSectionProps) {
  const { state, dispatch } = useAppState();
  const [dialogVisible, setDialogVisible] = useState(false);
  const [expanded, setExpanded] = useState(false);

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

  const shouldCollapse = state.smsNumbers.length > COLLAPSE_THRESHOLD;
  const displayedNumbers =
    shouldCollapse && !expanded
      ? state.smsNumbers.slice(0, COLLAPSE_THRESHOLD)
      : state.smsNumbers;
  const hiddenCount = state.smsNumbers.length - COLLAPSE_THRESHOLD;

  return (
    <Card>
      <SectionHeader title="SMSs" tooltipKey="sms" />
      {state.smsNumbers.length === 0 ? (
        <EmptyState message="No SMSs Added" />
      ) : (
        <>
          <FlatList
            data={displayedNumbers}
            keyExtractor={(item, index) => `${item}-${index}`}
            scrollEnabled={false}
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
          {shouldCollapse && !expanded && (
            <TouchableOpacity
              onPress={() => setExpanded(true)}
              style={styles.expandButton}
            >
              <Text style={styles.expandText}>
                {hiddenCount} more available
              </Text>
            </TouchableOpacity>
          )}
          {shouldCollapse && expanded && (
            <TouchableOpacity
              onPress={() => setExpanded(false)}
              style={styles.expandButton}
            >
              <Text style={styles.expandText}>Show less</Text>
            </TouchableOpacity>
          )}
        </>
      )}
      <ActionButton
        title="Add SMS"
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
  expandButton: {
    paddingVertical: 8,
    alignItems: 'center',
  },
  expandText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
  },
});
