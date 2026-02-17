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
import { AddPairDialog } from '../dialogs/AddPairDialog';
import { MultiPairInputDialog } from '../dialogs/MultiPairInputDialog';
import { MultiSelectRemoveDialog } from '../dialogs/MultiSelectRemoveDialog';
import { useAppState } from '../../context/AppStateContext';
import { Colors } from '../../constants/Colors';

interface TriggersSectionProps {
  loggingFunction: (message: string, optionalArg?: unknown) => void;
}

export function TriggersSection({ loggingFunction }: TriggersSectionProps) {
  const { state, dispatch } = useAppState();
  const [dialogVisible, setDialogVisible] = useState(false);
  const [multiDialogVisible, setMultiDialogVisible] = useState(false);
  const [removeDialogVisible, setRemoveDialogVisible] = useState(false);

  const handleAddTrigger = (key: string, value: string) => {
    loggingFunction(`Adding trigger ${key} with value: `, value);
    OneSignal.InAppMessages.addTrigger(key, value);
    dispatch({ type: 'ADD_TRIGGER', payload: { key, value } });
  };

  const handleAddMultipleTriggers = (pairs: { key: string; value: string }[]) => {
    pairs.forEach((pair) => {
      loggingFunction(`Adding trigger ${pair.key} with value: `, pair.value);
      OneSignal.InAppMessages.addTrigger(pair.key, pair.value);
      dispatch({ type: 'ADD_TRIGGER', payload: { key: pair.key, value: pair.value } });
    });
  };

  const handleRemoveTrigger = (key: string) => {
    loggingFunction(`Removing trigger for key: ${key}`);
    OneSignal.InAppMessages.removeTrigger(key);
    dispatch({ type: 'REMOVE_TRIGGER', payload: key });
  };

  const handleRemoveSelected = (keys: string[]) => {
    keys.forEach((key) => {
      loggingFunction(`Removing trigger for key: ${key}`);
      OneSignal.InAppMessages.removeTrigger(key);
      dispatch({ type: 'REMOVE_TRIGGER', payload: key });
    });
  };

  const handleClearAll = () => {
    loggingFunction('Clearing all triggers');
    OneSignal.InAppMessages.clearTriggers();
    dispatch({ type: 'CLEAR_ALL_TRIGGERS' });
  };

  return (
    <Card>
      <SectionHeader title="Triggers" tooltipKey="triggers" />
      {state.triggers.length === 0 ? (
        <EmptyState message="No Triggers Added" />
      ) : (
        <FlatList
          data={state.triggers}
          keyExtractor={(item) => item.key}
          renderItem={({ item }) => (
            <View style={styles.item}>
              <View style={styles.itemContent}>
                <Text style={styles.itemKey}>{item.key}</Text>
                <Text style={styles.itemValue}>{item.value}</Text>
              </View>
              <TouchableOpacity
                onPress={() => handleRemoveTrigger(item.key)}
                style={styles.deleteButton}
              >
                <Text style={styles.deleteText}>✕</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}
      <View style={styles.buttonContainer}>
        <ActionButton
          title="Add"
          onPress={() => setDialogVisible(true)}
          style={styles.button}
        />
        <ActionButton
          title="Add Multiple"
          onPress={() => setMultiDialogVisible(true)}
          style={styles.button}
        />
        {state.triggers.length > 0 && (
          <ActionButton
            title="Remove Selected"
            onPress={() => setRemoveDialogVisible(true)}
            variant="outline"
            style={styles.button}
          />
        )}
        {state.triggers.length > 0 && (
          <ActionButton
            title="Clear All"
            onPress={handleClearAll}
            variant="outline"
            style={styles.button}
          />
        )}
      </View>
      <AddPairDialog
        visible={dialogVisible}
        title="Add Trigger"
        onClose={() => setDialogVisible(false)}
        onConfirm={handleAddTrigger}
        keyPlaceholder="Trigger Key"
        valuePlaceholder="Trigger Value"
      />
      <MultiPairInputDialog
        visible={multiDialogVisible}
        title="Add Multiple Triggers"
        onClose={() => setMultiDialogVisible(false)}
        onConfirm={handleAddMultipleTriggers}
        keyPlaceholder="Trigger Key"
        valuePlaceholder="Trigger Value"
      />
      <MultiSelectRemoveDialog
        visible={removeDialogVisible}
        title="Remove Triggers"
        items={state.triggers}
        onClose={() => setRemoveDialogVisible(false)}
        onConfirm={handleRemoveSelected}
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
  itemContent: {
    flex: 1,
  },
  itemKey: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.darkText,
  },
  itemValue: {
    fontSize: 14,
    color: Colors.darkText,
    marginTop: 2,
  },
  deleteButton: {
    padding: 8,
  },
  deleteText: {
    fontSize: 18,
    color: Colors.primary,
  },
  buttonContainer: {
    flexDirection: 'column',
    gap: 8,
    marginTop: 12,
  },
  button: {
    width: '100%',
  },
});
