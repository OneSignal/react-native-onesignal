import React, { createContext } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppSpacing } from '../theme';

export const ButtonGridContext = createContext(false);

/**
 * Wraps ActionButtons two per row; an odd last button grows to span the row.
 * Conditionally rendered buttons drop out, so the rest reflow.
 */
export default function ButtonGrid({ children }: { children: React.ReactNode }) {
  return (
    <ButtonGridContext.Provider value>
      <View style={styles.grid}>{children}</View>
    </ButtonGridContext.Provider>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: AppSpacing.gap,
  },
});
