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
import { AddEmailDialog } from '../dialogs/AddEmailDialog';
import { useAppState } from '../../context/AppStateContext';
import { Colors } from '../../constants/Colors';

interface EmailSectionProps {
  loggingFunction: (message: string, optionalArg?: unknown) => void;
}

export function EmailSection({ loggingFunction }: EmailSectionProps) {
  const { state, dispatch } = useAppState();
  const [dialogVisible, setDialogVisible] = useState(false);

  const handleAddEmail = (email: string) => {
    loggingFunction('Attempting to set email: ', email);
    OneSignal.User.addEmail(email);
    dispatch({ type: 'ADD_EMAIL', payload: email });
  };

  const handleRemoveEmail = (email: string) => {
    loggingFunction('Attempting to remove email: ', email);
    OneSignal.User.removeEmail(email);
    dispatch({ type: 'REMOVE_EMAIL', payload: email });
  };

  return (
    <Card>
      <SectionHeader title="Email" />
      {state.emails.length === 0 ? (
        <EmptyState message="No Emails Added" />
      ) : (
        <FlatList
          data={state.emails}
          keyExtractor={(item, index) => `${item}-${index}`}
          renderItem={({ item }) => (
            <View style={styles.item}>
              <Text style={styles.itemText}>{item}</Text>
              <TouchableOpacity
                onPress={() => handleRemoveEmail(item)}
                style={styles.deleteButton}
              >
                <Text style={styles.deleteText}>✕</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}
      <ActionButton
        title="Add Email"
        onPress={() => setDialogVisible(true)}
        style={styles.addButton}
      />
      <AddEmailDialog
        visible={dialogVisible}
        onClose={() => setDialogVisible(false)}
        onConfirm={handleAddEmail}
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
