import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { AppColors, AppTextStyles, AppTheme } from '../theme';

// PairItem
interface PairItemProps {
  itemKey: string;
  itemValue: string;
  layout?: 'inline' | 'stacked';
  onDelete?: () => void;
  testID?: string;
}

export function PairItem({
  itemKey,
  itemValue,
  layout = 'inline',
  onDelete,
  testID,
}: PairItemProps) {
  return (
    <View style={styles.pairRow} testID={testID}>
      {layout === 'stacked' ? (
        <View style={styles.pairStackedContent}>
          <Text style={styles.pairStackedKey} numberOfLines={1}>
            {itemKey}
          </Text>
          <Text style={styles.pairStackedValue} numberOfLines={1}>
            {itemValue}
          </Text>
        </View>
      ) : (
        <>
          <Text style={styles.pairKey} numberOfLines={1}>
            {itemKey}
          </Text>
          <Text style={styles.pairSeparator}>|</Text>
          <Text style={styles.pairValue} numberOfLines={1}>
            {itemValue}
          </Text>
        </>
      )}
      {onDelete && (
        <TouchableOpacity
          onPress={onDelete}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Icon name="close" size={18} color={AppColors.osPrimary} />
        </TouchableOpacity>
      )}
    </View>
  );
}

// SingleItem
interface SingleItemProps {
  value: string;
  onDelete?: () => void;
  testID?: string;
}

export function SingleItem({ value, onDelete, testID }: SingleItemProps) {
  return (
    <View style={styles.singleRow} testID={testID}>
      <Text style={styles.singleValue} numberOfLines={1}>
        {value}
      </Text>
      {onDelete && (
        <TouchableOpacity
          onPress={onDelete}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Icon name="close" size={18} color={AppColors.osPrimary} />
        </TouchableOpacity>
      )}
    </View>
  );
}

// EmptyState
interface EmptyStateProps {
  message: string;
  testID?: string;
}

export function EmptyState({ message, testID }: EmptyStateProps) {
  return (
    <View style={styles.emptyContainer} testID={testID}>
      <Text style={styles.emptyText}>{message}</Text>
    </View>
  );
}

// PairList (simple, no collapse)
interface PairListProps {
  items: [string, string][];
  layout?: 'inline' | 'stacked';
  onDelete?: (key: string) => void;
  filterKeys?: string[];
}

export function PairList({
  items,
  layout = 'inline',
  onDelete,
  filterKeys,
}: PairListProps) {
  const filtered = filterKeys
    ? items.filter(([k]) => !filterKeys.includes(k))
    : items;

  if (filtered.length === 0) {
    return null;
  }

  return (
    <View style={AppTheme.card}>
      {filtered.map(([k, v], idx) => (
        <React.Fragment key={k}>
          {idx > 0 && <View style={styles.divider} />}
          <PairItem
            itemKey={k}
            itemValue={v}
            layout={layout}
            onDelete={onDelete ? () => onDelete(k) : undefined}
            testID={`pair_item_${idx}`}
          />
        </React.Fragment>
      ))}
    </View>
  );
}

// CollapsibleList - single items with collapse
const COLLAPSE_THRESHOLD = 5;

interface CollapsibleSingleListProps {
  items: string[];
  onDelete?: (value: string) => void;
  emptyMessage: string;
}

export function CollapsibleSingleList({
  items,
  onDelete,
  emptyMessage,
}: CollapsibleSingleListProps) {
  const [expanded, setExpanded] = useState(false);
  const showAll = expanded || items.length <= COLLAPSE_THRESHOLD;
  const displayItems = showAll ? items : items.slice(0, COLLAPSE_THRESHOLD);
  const hiddenCount = items.length - COLLAPSE_THRESHOLD;

  if (items.length === 0) {
    return (
      <View style={AppTheme.card}>
        <EmptyState message={emptyMessage} />
      </View>
    );
  }

  return (
    <View style={AppTheme.card}>
      {displayItems.map((item, idx) => (
        <React.Fragment key={item}>
          {idx > 0 && <View style={styles.divider} />}
          <SingleItem
            value={item}
            onDelete={onDelete ? () => onDelete(item) : undefined}
            testID={`single_item_${idx}`}
          />
        </React.Fragment>
      ))}
      {!showAll && hiddenCount > 0 && (
        <TouchableOpacity
          onPress={() => setExpanded(true)}
          style={styles.moreButton}
        >
          <Text style={styles.moreText}>{hiddenCount} more</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  pairRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  pairStackedContent: {
    flex: 1,
    marginRight: 8,
  },
  pairStackedKey: {
    ...AppTextStyles.bodyMedium,
    marginBottom: 2,
  },
  pairStackedValue: {
    ...AppTextStyles.bodySmall,
    color: AppColors.osGrey600,
  },
  pairKey: {
    ...AppTextStyles.bodyMedium,
    flex: 1,
    color: AppColors.osGrey600,
  },
  pairSeparator: {
    fontSize: 14,
    color: AppColors.osDivider,
    marginHorizontal: 8,
  },
  pairValue: {
    ...AppTextStyles.bodyMedium,
    flex: 1,
    color: AppColors.osGrey700,
    textAlign: 'right',
    marginRight: 8,
  },
  singleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  singleValue: {
    ...AppTextStyles.bodyMedium,
    flex: 1,
    color: AppColors.osGrey700,
  },
  emptyContainer: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  emptyText: {
    ...AppTextStyles.bodyMedium,
    color: AppColors.osGrey600,
  },
  divider: {
    height: 1,
    backgroundColor: AppColors.osDivider,
  },
  moreButton: {
    paddingVertical: 4,
    alignItems: 'center',
  },
  moreText: {
    fontSize: 14,
    color: AppColors.osPrimary,
    fontWeight: '500',
  },
});
