import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import SectionCard from '../SectionCard';
import ActionButton from '../ActionButton';
import PairInputModal from '../modals/PairInputModal';
import MultiPairInputModal from '../modals/MultiPairInputModal';
import MultiSelectRemoveModal from '../modals/MultiSelectRemoveModal';
import { PairList, EmptyState } from '../ListWidgets';
import { AppTheme, Spacing } from '../../theme';

const styles = StyleSheet.create({
  listCard: {
    marginBottom: Spacing.cardGap,
  },
});

interface Props {
  triggers: [string, string][];
  onAdd: (key: string, value: string) => void;
  onAddMultiple: (pairs: Record<string, string>) => void;
  onRemoveSelected: (keys: string[]) => void;
  onClearAll: () => void;
  onInfoTap?: () => void;
}

export default function TriggersSection({
  triggers,
  onAdd,
  onAddMultiple,
  onRemoveSelected,
  onClearAll,
  onInfoTap,
}: Props) {
  const [addVisible, setAddVisible] = useState(false);
  const [addMultipleVisible, setAddMultipleVisible] = useState(false);
  const [removeVisible, setRemoveVisible] = useState(false);

  return (
    <SectionCard title="Triggers" onInfoTap={onInfoTap}>
      {triggers.length === 0 ? (
        <View style={[AppTheme.card, styles.listCard]}>
          <EmptyState message="No triggers added" testID="triggers_empty" />
        </View>
      ) : (
        <View style={styles.listCard}>
          <PairList
            items={triggers}
            layout="stacked"
            onDelete={(key) => onRemoveSelected([key])}
          />
        </View>
      )}
      <ActionButton
        label="ADD"
        onPress={() => setAddVisible(true)}
        testID="add_trigger_button"
      />
      <ActionButton
        label="ADD MULTIPLE"
        onPress={() => setAddMultipleVisible(true)}
        testID="add_multiple_triggers_button"
      />
      {triggers.length > 0 && (
        <>
          <ActionButton
            label="REMOVE SELECTED"
            onPress={() => setRemoveVisible(true)}
            variant="outlined"
            testID="remove_triggers_button"
          />
          <ActionButton
            label="CLEAR ALL"
            onPress={onClearAll}
            variant="outlined"
            testID="clear_triggers_button"
          />
        </>
      )}
      <PairInputModal
        visible={addVisible}
        title="Add Trigger"
        onConfirm={onAdd}
        onClose={() => setAddVisible(false)}
        keyTestID="trigger_key_input"
        valueTestID="trigger_value_input"
      />
      <MultiPairInputModal
        visible={addMultipleVisible}
        title="Add Multiple Triggers"
        onConfirm={onAddMultiple}
        onClose={() => setAddMultipleVisible(false)}
      />
      <MultiSelectRemoveModal
        visible={removeVisible}
        title="Remove Triggers"
        items={triggers}
        onConfirm={onRemoveSelected}
        onClose={() => setRemoveVisible(false)}
      />
    </SectionCard>
  );
}
