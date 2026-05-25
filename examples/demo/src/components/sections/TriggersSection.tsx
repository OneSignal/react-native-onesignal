import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';

import { AppTheme, AppSpacing } from '../../theme';
import ActionButton from '../ActionButton';
import { PairList, EmptyState } from '../ListWidgets';
import MultiPairInputModal from '../modals/MultiPairInputModal';
import MultiSelectRemoveModal from '../modals/MultiSelectRemoveModal';
import PairInputModal from '../modals/PairInputModal';
import SectionCard from '../SectionCard';

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
  const [addOpen, setAddOpen] = useState(false);
  const [addMultipleOpen, setAddMultipleOpen] = useState(false);
  const [removeOpen, setRemoveOpen] = useState(false);

  return (
    <SectionCard title="Triggers" onInfoTap={onInfoTap} sectionKey="triggers">
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
            sectionKey="triggers"
          />
        </View>
      )}
      <ActionButton
        label="ADD TRIGGER"
        onPress={() => setAddOpen(true)}
        testID="add_trigger_button"
      />
      <ActionButton
        label="ADD MULTIPLE TRIGGERS"
        onPress={() => setAddMultipleOpen(true)}
        testID="add_multiple_triggers_button"
      />
      {triggers.length > 0 && (
        <>
          <ActionButton
            label="REMOVE TRIGGERS"
            onPress={() => setRemoveOpen(true)}
            variant="outlined"
            testID="remove_triggers_button"
          />
          <ActionButton
            label="CLEAR ALL TRIGGERS"
            onPress={onClearAll}
            variant="outlined"
            testID="clear_triggers_button"
          />
        </>
      )}
      <PairInputModal
        visible={addOpen}
        title="Add Trigger"
        onConfirm={onAdd}
        onClose={() => setAddOpen(false)}
        keyTestID="trigger_key_input"
        valueTestID="trigger_value_input"
      />
      <MultiPairInputModal
        visible={addMultipleOpen}
        title="Add Multiple Triggers"
        onConfirm={onAddMultiple}
        onClose={() => setAddMultipleOpen(false)}
      />
      <MultiSelectRemoveModal
        visible={removeOpen}
        title="Remove Triggers"
        items={triggers}
        onConfirm={onRemoveSelected}
        onClose={() => setRemoveOpen(false)}
      />
    </SectionCard>
  );
}

const styles = StyleSheet.create({
  listCard: {
    marginBottom: AppSpacing.gap,
  },
});
