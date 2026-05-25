import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';

import { AppTheme, AppSpacing } from '../../theme';
import ActionButton from '../ActionButton';
import { PairList, EmptyState, LoadingState } from '../ListWidgets';
import MultiPairInputModal from '../modals/MultiPairInputModal';
import MultiSelectRemoveModal from '../modals/MultiSelectRemoveModal';
import PairInputModal from '../modals/PairInputModal';
import SectionCard from '../SectionCard';

interface Props {
  tags: [string, string][];
  loading?: boolean;
  onAdd: (key: string, value: string) => void;
  onAddMultiple: (pairs: Record<string, string>) => void;
  onRemoveSelected: (keys: string[]) => void;
  onInfoTap?: () => void;
}

export default function TagsSection({
  tags,
  loading = false,
  onAdd,
  onAddMultiple,
  onRemoveSelected,
  onInfoTap,
}: Props) {
  const [addOpen, setAddOpen] = useState(false);
  const [addMultipleOpen, setAddMultipleOpen] = useState(false);
  const [removeOpen, setRemoveOpen] = useState(false);

  return (
    <SectionCard title="Tags" onInfoTap={onInfoTap} sectionKey="tags">
      {tags.length === 0 ? (
        <View style={[AppTheme.card, styles.listCard]}>
          {loading ? (
            <LoadingState testID="tags_loading" />
          ) : (
            <EmptyState message="No tags added" testID="tags_empty" />
          )}
        </View>
      ) : (
        <View style={styles.listCard}>
          <PairList
            items={tags}
            layout="stacked"
            onDelete={(key) => onRemoveSelected([key])}
            sectionKey="tags"
          />
        </View>
      )}
      <ActionButton label="ADD TAG" onPress={() => setAddOpen(true)} testID="add_tag_button" />
      <ActionButton
        label="ADD MULTIPLE TAGS"
        onPress={() => setAddMultipleOpen(true)}
        testID="add_multiple_tags_button"
      />
      {tags.length > 0 && (
        <ActionButton
          label="REMOVE TAGS"
          onPress={() => setRemoveOpen(true)}
          variant="outlined"
          testID="remove_tags_button"
        />
      )}
      <PairInputModal
        visible={addOpen}
        title="Add Tag"
        keyPlaceholder="Key"
        valuePlaceholder="Value"
        onConfirm={onAdd}
        onClose={() => setAddOpen(false)}
        keyTestID="tag_key_input"
        valueTestID="tag_value_input"
      />
      <MultiPairInputModal
        visible={addMultipleOpen}
        title="Add Multiple Tags"
        onConfirm={onAddMultiple}
        onClose={() => setAddMultipleOpen(false)}
      />
      <MultiSelectRemoveModal
        visible={removeOpen}
        title="Remove Tags"
        items={tags}
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
