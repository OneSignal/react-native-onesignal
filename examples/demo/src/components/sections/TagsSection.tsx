import React, { useState } from 'react';
import { View } from 'react-native';
import SectionCard from '../SectionCard';
import ActionButton from '../ActionButton';
import PairInputModal from '../modals/PairInputModal';
import MultiPairInputModal from '../modals/MultiPairInputModal';
import MultiSelectRemoveModal from '../modals/MultiSelectRemoveModal';
import { PairList, EmptyState } from '../ListWidgets';
import { AppTheme } from '../../theme';

interface Props {
  tags: [string, string][];
  onAdd: (key: string, value: string) => void;
  onAddMultiple: (pairs: Record<string, string>) => void;
  onRemoveSelected: (keys: string[]) => void;
  onInfoTap?: () => void;
}

export default function TagsSection({
  tags,
  onAdd,
  onAddMultiple,
  onRemoveSelected,
  onInfoTap,
}: Props) {
  const [addVisible, setAddVisible] = useState(false);
  const [addMultipleVisible, setAddMultipleVisible] = useState(false);
  const [removeVisible, setRemoveVisible] = useState(false);

  return (
    <SectionCard title="Tags" onInfoTap={onInfoTap}>
      {tags.length === 0 ? (
        <View style={AppTheme.card}>
          <EmptyState message="No tags added" testID="tags_empty" />
        </View>
      ) : (
        <PairList items={tags} />
      )}
      <ActionButton label="ADD" onPress={() => setAddVisible(true)} testID="add_tag_button" />
      <ActionButton
        label="ADD MULTIPLE"
        onPress={() => setAddMultipleVisible(true)}
        testID="add_multiple_tags_button"
      />
      {tags.length > 0 && (
        <ActionButton
          label="REMOVE SELECTED"
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
