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

interface AliasesSectionProps {
  loggingFunction: (message: string, optionalArg?: unknown) => void;
}

export function AliasesSection({ loggingFunction }: AliasesSectionProps) {
  const { state, dispatch } = useAppState();
  const [dialogVisible, setDialogVisible] = useState(false);

  const handleAddAlias = (key: string, value: string) => {
    loggingFunction(`Adding alias ${key} with value: `, value);
    OneSignal.User.addAlias(key, value);
    dispatch({ type: 'ADD_ALIAS', payload: { key, value } });
  };

  const handleRemoveAlias = (key: string) => {
    loggingFunction(`Removing alias: ${key}`);
    OneSignal.User.removeAlias(key);
    dispatch({ type: 'REMOVE_ALIAS', payload: key });
  };

  const handleRemoveAllAliases = () => {
    if (state.aliases.length === 0) return;

    const aliasLabels = state.aliases.map((alias) => alias.key);
    loggingFunction('Removing all aliases: ', aliasLabels);
    OneSignal.User.removeAliases(aliasLabels);
    dispatch({ type: 'CLEAR_ALL_ALIASES' });
  };

  return (
    <Card>
      <SectionHeader title="Aliases" tooltipKey="aliases" />
      {state.aliases.length === 0 ? (
        <EmptyState message="No Aliases Added" />
      ) : (
        <FlatList
          data={state.aliases}
          keyExtractor={(item) => item.key}
          scrollEnabled={false}
          renderItem={({ item }) => (
            <View style={styles.item}>
              <View style={styles.itemContent}>
                <Text style={styles.itemKey}>{item.key}</Text>
                <Text style={styles.itemValue}>{item.value}</Text>
              </View>
              <TouchableOpacity
                onPress={() => handleRemoveAlias(item.key)}
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
          title="Add Alias"
          onPress={() => setDialogVisible(true)}
          style={styles.button}
        />
        {state.aliases.length > 0 && (
          <ActionButton
            title="Remove All Aliases"
            onPress={handleRemoveAllAliases}
            style={[styles.button, styles.removeAllButton]}
            textStyle={styles.removeAllButtonText}
          />
        )}
      </View>
      <AddPairDialog
        visible={dialogVisible}
        title="Add Alias"
        onClose={() => setDialogVisible(false)}
        onConfirm={handleAddAlias}
        keyPlaceholder="Alias Key"
        valuePlaceholder="Alias Value"
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
  removeAllButton: {
    backgroundColor: Colors.primary,
  },
  removeAllButtonText: {
    color: Colors.white,
  },
});
