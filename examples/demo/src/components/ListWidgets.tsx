import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Colors, AppTheme } from '../theme';

// PairItem
interface PairItemProps {
  itemKey: string;
  itemValue: string;
  onDelete?: () => void;
  testID?: string;
}

export function PairItem({ itemKey, itemValue, onDelete, testID }: PairItemProps) {
  return (
    <View style={styles.pairRow} testID={testID}>
      <Text style={styles.pairKey} numberOfLines={1}>{itemKey}</Text>
      <Text style={styles.pairSeparator}>|</Text>
      <Text style={styles.pairValue} numberOfLines={1}>{itemValue}</Text>
      {onDelete && (
        <TouchableOpacity onPress={onDelete} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Icon name="delete" size={18} color={Colors.textSecondary} />
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
      <Text style={styles.singleValue} numberOfLines={1}>{value}</Text>
      {onDelete && (
        <TouchableOpacity onPress={onDelete} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Icon name="delete" size={18} color={Colors.textSecondary} />
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
  onDelete?: (key: string) => void;
  filterKeys?: string[];
}

export function PairList({ items, onDelete, filterKeys }: PairListProps) {
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

export function CollapsibleSingleList({ items, onDelete, emptyMessage }: CollapsibleSingleListProps) {
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
        <TouchableOpacity onPress={() => setExpanded(true)} style={styles.moreButton}>
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
    paddingVertical: 8,
  },
  pairKey: {
    flex: 1,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  pairSeparator: {
    fontSize: 14,
    color: Colors.dividerColor,
    marginHorizontal: 8,
  },
  pairValue: {
    flex: 1,
    fontSize: 14,
    color: Colors.textPrimary,
    textAlign: 'right',
    marginRight: 8,
  },
  singleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  singleValue: {
    flex: 1,
    fontSize: 14,
    color: Colors.textPrimary,
  },
  emptyContainer: {
    paddingVertical: 8,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.dividerColor,
  },
  moreButton: {
    paddingVertical: 8,
    alignItems: 'center',
  },
  moreText: {
    fontSize: 13,
    color: Colors.oneSignalRed,
    fontWeight: '500',
  },
});
