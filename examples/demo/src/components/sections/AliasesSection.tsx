import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import SectionCard from '../SectionCard';
import ActionButton from '../ActionButton';
import PairInputModal from '../modals/PairInputModal';
import MultiPairInputModal from '../modals/MultiPairInputModal';
import { PairList, EmptyState } from '../ListWidgets';
import { AppTheme, Spacing } from '../../theme';

const FILTERED_KEYS = ['external_id', 'onesignal_id'];

interface Props {
  aliases: [string, string][];
  onAdd: (label: string, id: string) => void;
  onAddMultiple: (pairs: Record<string, string>) => void;
  onInfoTap?: () => void;
}

export default function AliasesSection({
  aliases,
  onAdd,
  onAddMultiple,
  onInfoTap,
}: Props) {
  const [addVisible, setAddVisible] = useState(false);
  const [addMultipleVisible, setAddMultipleVisible] = useState(false);

  const filtered = aliases.filter(([k]) => !FILTERED_KEYS.includes(k));

  return (
    <SectionCard title="Aliases" onInfoTap={onInfoTap}>
      {filtered.length === 0 ? (
        <View style={[AppTheme.card, styles.listCard]}>
          <EmptyState message="No aliases added" testID="aliases_empty" />
        </View>
      ) : (
        <View style={styles.listCard}>
          <PairList items={filtered} />
        </View>
      )}
      <ActionButton
        label="ADD"
        onPress={() => setAddVisible(true)}
        testID="add_alias_button"
      />
      <ActionButton
        label="ADD MULTIPLE"
        onPress={() => setAddMultipleVisible(true)}
        testID="add_multiple_aliases_button"
      />
      <PairInputModal
        visible={addVisible}
        title="Add Alias"
        keyPlaceholder="Label"
        valuePlaceholder="ID"
        onConfirm={onAdd}
        onClose={() => setAddVisible(false)}
        keyTestID="alias_label_input"
        valueTestID="alias_id_input"
      />
      <MultiPairInputModal
        visible={addMultipleVisible}
        title="Add Multiple Aliases"
        keyPlaceholder="Label"
        valuePlaceholder="ID"
        onConfirm={onAddMultiple}
        onClose={() => setAddMultipleVisible(false)}
      />
    </SectionCard>
  );
}

const styles = StyleSheet.create({
  listCard: {
    marginBottom: Spacing.cardGap,
  },
});
