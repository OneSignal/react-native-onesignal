import React, { useRef, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { clearLogs, useLogs } from '../services/LogService';
import { AppColors } from '../theme';

const MONOSPACE = Platform.select({ ios: 'Menlo', default: 'monospace' });

export default function LogView() {
  const logs = useLogs();
  const scrollRef = useRef<ScrollView>(null);
  const [collapsed, setCollapsed] = useState(false);
  const scrollToEnd = () => scrollRef.current?.scrollToEnd({ animated: false });

  return (
    <View style={styles.container} testID="log_view">
      <View style={styles.header}>
        <Text style={styles.headerText}>LOGS ({logs.length})</Text>
        <View style={styles.actions}>
          <Pressable
            onPress={clearLogs}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Clear logs"
            testID="log_clear_button"
          >
            <Icon name="delete" size={14} color={AppColors.osGrey500} />
          </Pressable>
          <Pressable
            onPress={() => setCollapsed((value) => !value)}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={collapsed ? 'Expand logs' : 'Collapse logs'}
            testID="log_toggle_button"
          >
            <Icon
              name={collapsed ? 'expand-more' : 'expand-less'}
              size={18}
              color={AppColors.osGrey500}
            />
          </Pressable>
        </View>
      </View>
      {/* Collapsed via height so entries stay in the view hierarchy. */}
      <ScrollView
        ref={scrollRef}
        style={collapsed ? styles.bodyCollapsed : styles.body}
        contentContainerStyle={styles.bodyContent}
        onContentSizeChange={scrollToEnd}
        onLayout={scrollToEnd}
        nestedScrollEnabled
      >
        {logs.length === 0 ? (
          <Text style={[styles.entry, styles.muted]}>No logs yet</Text>
        ) : (
          logs.map((entry, index) => (
            <Text key={entry.id} style={styles.entry} testID={`log_entry_${index}`}>
              <Text style={styles.muted}>{entry.time}</Text> {entry.message}
            </Text>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const ENTRY_FONT_SIZE = 8;

const styles = StyleSheet.create({
  container: {
    backgroundColor: AppColors.osLogBackground,
  },
  header: {
    height: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  headerText: {
    color: AppColors.osGrey500,
    fontFamily: MONOSPACE,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  body: {
    height: 100,
  },
  bodyCollapsed: {
    height: 0,
  },
  bodyContent: {
    paddingHorizontal: 16,
    paddingBottom: 6,
  },
  entry: {
    color: AppColors.osLogText,
    fontFamily: MONOSPACE,
    fontSize: ENTRY_FONT_SIZE,
    lineHeight: ENTRY_FONT_SIZE * 1.4,
  },
  muted: {
    color: AppColors.osGrey600,
  },
});
