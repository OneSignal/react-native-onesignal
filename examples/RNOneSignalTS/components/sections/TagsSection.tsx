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

interface TagsSectionProps {
  loggingFunction: (message: string, optionalArg?: unknown) => void;
}

export function TagsSection({ loggingFunction }: TagsSectionProps) {
  const { state, dispatch } = useAppState();
  const [dialogVisible, setDialogVisible] = useState(false);
  const [multiDialogVisible, setMultiDialogVisible] = useState(false);
  const [removeDialogVisible, setRemoveDialogVisible] = useState(false);

  const handleAddTag = (key: string, value: string) => {
    loggingFunction(`Sending tag ${key} with value: `, value);
    OneSignal.User.addTag(key, value);
    dispatch({ type: 'ADD_TAG', payload: { key, value } });
  };

  const handleAddMultipleTags = (pairs: { key: string; value: string }[]) => {
    pairs.forEach((pair) => {
      loggingFunction(`Sending tag ${pair.key} with value: `, pair.value);
      OneSignal.User.addTag(pair.key, pair.value);
      dispatch({ type: 'ADD_TAG', payload: { key: pair.key, value: pair.value } });
    });
  };

  const handleRemoveTag = (key: string) => {
    loggingFunction(`Deleting tag with key: ${key}`);
    OneSignal.User.removeTag(key);
    dispatch({ type: 'REMOVE_TAG', payload: key });
  };

  const handleRemoveSelected = (keys: string[]) => {
    keys.forEach((key) => {
      loggingFunction(`Deleting tag with key: ${key}`);
      OneSignal.User.removeTag(key);
      dispatch({ type: 'REMOVE_TAG', payload: key });
    });
  };

  return (
    <Card>
      <SectionHeader title="Tags" tooltipKey="tags" />
      {state.tags.length === 0 ? (
        <EmptyState message="No Tags Added" />
      ) : (
        <FlatList
          data={state.tags}
          keyExtractor={(item) => item.key}
          scrollEnabled={false}
          renderItem={({ item }) => (
            <View style={styles.item}>
              <View style={styles.itemContent}>
                <Text style={styles.itemKey}>{item.key}</Text>
                <Text style={styles.itemValue}>{item.value}</Text>
              </View>
              <TouchableOpacity
                onPress={() => handleRemoveTag(item.key)}
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
        {state.tags.length > 0 && (
          <ActionButton
            title="Remove Selected"
            onPress={() => setRemoveDialogVisible(true)}
            variant="outline"
            style={styles.button}
          />
        )}
      </View>
      <AddPairDialog
        visible={dialogVisible}
        title="Add Tag"
        onClose={() => setDialogVisible(false)}
        onConfirm={handleAddTag}
        keyPlaceholder="Tag Key"
        valuePlaceholder="Tag Value"
      />
      <MultiPairInputDialog
        visible={multiDialogVisible}
        title="Add Multiple Tags"
        onClose={() => setMultiDialogVisible(false)}
        onConfirm={handleAddMultipleTags}
        keyPlaceholder="Tag Key"
        valuePlaceholder="Tag Value"
      />
      <MultiSelectRemoveDialog
        visible={removeDialogVisible}
        title="Remove Tags"
        items={state.tags}
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
