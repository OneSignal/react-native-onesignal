import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
} from 'react-native';
import { OneSignal } from 'react-native-onesignal';
import { Card } from '../common/Card';
import { SectionHeader } from '../common/SectionHeader';
import { EmptyState } from '../common/EmptyState';
import { ActionButton } from '../common/ActionButton';
import { AddPairDialog } from '../dialogs/AddPairDialog';
import { MultiPairInputDialog } from '../dialogs/MultiPairInputDialog';
import { useAppState } from '../../context/AppStateContext';
import { Colors } from '../../constants/Colors';

interface AliasesSectionProps {
  loggingFunction: (message: string, optionalArg?: unknown) => void;
}

export function AliasesSection({ loggingFunction }: AliasesSectionProps) {
  const { state, dispatch } = useAppState();
  const [dialogVisible, setDialogVisible] = useState(false);
  const [multiDialogVisible, setMultiDialogVisible] = useState(false);

  const handleAddAlias = (key: string, value: string) => {
    loggingFunction(`Adding alias ${key} with value: `, value);
    OneSignal.User.addAlias(key, value);
    dispatch({ type: 'ADD_ALIAS', payload: { key, value } });
  };

  const handleAddMultipleAliases = (pairs: { key: string; value: string }[]) => {
    pairs.forEach((pair) => {
      loggingFunction(`Adding alias ${pair.key} with value: `, pair.value);
      OneSignal.User.addAlias(pair.key, pair.value);
      dispatch({ type: 'ADD_ALIAS', payload: { key: pair.key, value: pair.value } });
    });
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
      </View>
      <AddPairDialog
        visible={dialogVisible}
        title="Add Alias"
        onClose={() => setDialogVisible(false)}
        onConfirm={handleAddAlias}
        keyPlaceholder="Alias Key"
        valuePlaceholder="Alias Value"
      />
      <MultiPairInputDialog
        visible={multiDialogVisible}
        title="Add Multiple Aliases"
        onClose={() => setMultiDialogVisible(false)}
        onConfirm={handleAddMultipleAliases}
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
  buttonContainer: {
    flexDirection: 'column',
    gap: 8,
    marginTop: 12,
  },
  button: {
    width: '100%',
  },
});
