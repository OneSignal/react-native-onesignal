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

const COLLAPSE_THRESHOLD = 5;

interface EmailSectionProps {
  loggingFunction: (message: string, optionalArg?: unknown) => void;
}

export function EmailSection({ loggingFunction }: EmailSectionProps) {
  const { state, dispatch } = useAppState();
  const [dialogVisible, setDialogVisible] = useState(false);
  const [expanded, setExpanded] = useState(false);

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

  const shouldCollapse = state.emails.length > COLLAPSE_THRESHOLD;
  const displayedEmails =
    shouldCollapse && !expanded
      ? state.emails.slice(0, COLLAPSE_THRESHOLD)
      : state.emails;
  const hiddenCount = state.emails.length - COLLAPSE_THRESHOLD;

  return (
    <Card>
      <SectionHeader title="Emails" tooltipKey="emails" />
      {state.emails.length === 0 ? (
        <EmptyState message="No Emails Added" />
      ) : (
        <>
          <FlatList
            data={displayedEmails}
            keyExtractor={(item, index) => `${item}-${index}`}
            scrollEnabled={false}
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
