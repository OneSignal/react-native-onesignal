import React from 'react';
import { StyleSheet, View } from 'react-native';

import { AppSpacing } from '../theme';

type ButtonElement = React.ReactElement<{ compact?: boolean }>;

function flatten(children: React.ReactNode): ButtonElement[] {
  return React.Children.toArray(children).flatMap((child) => {
    if (!React.isValidElement<{ children?: React.ReactNode }>(child)) return [];
    if (child.type === React.Fragment) return flatten(child.props.children);
    return [child as ButtonElement];
  });
}

/**
 * Lays out ActionButtons two per row in equal columns; an odd last button
 * spans both. Conditionally rendered buttons drop out so the rest reflow.
 */
export default function ButtonGrid({ children }: { children: React.ReactNode }) {
  const buttons = flatten(children).map((button) => React.cloneElement(button, { compact: true }));
  const rows: ButtonElement[][] = [];
  for (let i = 0; i < buttons.length; i += 2) rows.push(buttons.slice(i, i + 2));

  return (
    <View>
      {rows.map((row, index) =>
        row.length === 1 ? (
          <View key={index}>{row[0]}</View>
        ) : (
          <View key={index} style={styles.row}>
            {row.map((button, cell) => (
              <View key={cell} style={styles.cell}>
                {button}
              </View>
            ))}
          </View>
        ),
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    columnGap: AppSpacing.gap,
  },
  cell: {
    flex: 1,
  },
});
