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
  const [addVisible, setAddVisible] = useState(false);
  const [addMultipleVisible, setAddMultipleVisible] = useState(false);
  const [removeVisible, setRemoveVisible] = useState(false);

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
      <ActionButton label="ADD TAG" onPress={() => setAddVisible(true)} testID="add_tag_button" />
      <ActionButton
        label="ADD MULTIPLE TAGS"
        onPress={() => setAddMultipleVisible(true)}
        testID="add_multiple_tags_button"
      />
      {tags.length > 0 && (
        <ActionButton
          label="REMOVE TAGS"
          onPress={() => setRemoveVisible(true)}
          variant="outlined"
          testID="remove_tags_button"
        />
      )}
      <PairInputModal
        visible={addVisible}
        title="Add Tag"
        keyPlaceholder="Key"
        valuePlaceholder="Value"
        onConfirm={onAdd}
        onClose={() => setAddVisible(false)}
        keyTestID="tag_key_input"
        valueTestID="tag_value_input"
        confirmTestID="tag_confirm_button"
      />
      <MultiPairInputModal
        visible={addMultipleVisible}
        title="Add Multiple Tags"
        onConfirm={onAddMultiple}
        onClose={() => setAddMultipleVisible(false)}
      />
      <MultiSelectRemoveModal
        visible={removeVisible}
        title="Remove Tags"
        items={tags}
        onConfirm={onRemoveSelected}
        onClose={() => setRemoveVisible(false)}
      />
    </SectionCard>
  );
}

const styles = StyleSheet.create({
  listCard: {
    marginBottom: AppSpacing.gap,
  },
});
