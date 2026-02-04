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
import { useAppState } from '../../context/AppStateContext';
import { Colors } from '../../constants/Colors';

interface TagsSectionProps {
  loggingFunction: (message: string, optionalArg?: unknown) => void;
}

export function TagsSection({ loggingFunction }: TagsSectionProps) {
  const { state, dispatch } = useAppState();
  const [dialogVisible, setDialogVisible] = useState(false);

  const handleAddTag = (key: string, value: string) => {
    loggingFunction(`Sending tag ${key} with value: `, value);
    OneSignal.User.addTag(key, value);
    dispatch({ type: 'ADD_TAG', payload: { key, value } });
  };

  const handleRemoveTag = (key: string) => {
    loggingFunction(`Deleting tag with key: ${key}`);
    OneSignal.User.removeTag(key);
    dispatch({ type: 'REMOVE_TAG', payload: key });
  };

  const handleGetTags = async () => {
    const tags = await OneSignal.User.getTags();
    loggingFunction('Tags:', tags);
  };

  return (
    <Card>
      <SectionHeader title="Tags" />
      {state.tags.length === 0 ? (
        <EmptyState message="No Tags Added" />
      ) : (
        <FlatList
          data={state.tags}
          keyExtractor={(item) => item.key}
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
          title="Add Tag"
          onPress={() => setDialogVisible(true)}
          style={styles.button}
        />
        <ActionButton
          title="Get Tags"
          onPress={handleGetTags}
          style={styles.button}
        />
      </View>
      <AddPairDialog
        visible={dialogVisible}
        title="Add Tag"
        onClose={() => setDialogVisible(false)}
        onConfirm={handleAddTag}
        keyPlaceholder="Tag Key"
        valuePlaceholder="Tag Value"
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
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  button: {
    flex: 1,
  },
});
