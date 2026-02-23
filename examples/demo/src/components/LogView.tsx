import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LogManager, { LogEntry } from '../services/LogManager';
import { AppColors } from '../theme';

const LEVEL_COLORS: Record<string, string> = {
  D: AppColors.osLogDebug,
  I: AppColors.osLogInfo,
  W: AppColors.osLogWarn,
  E: AppColors.osLogError,
};

export default function LogView() {
  const [entries, setEntries] = useState<LogEntry[]>(() =>
    LogManager.getInstance().getEntries(),
  );
  const [expanded, setExpanded] = useState(true);
  const [containerWidth, setContainerWidth] = useState(0);
  const vertScrollRef = useRef<ScrollView>(null);
  const horizScrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    const unsub = LogManager.getInstance().subscribe(updated => {
      setEntries(updated);
      setTimeout(() => {
        vertScrollRef.current?.scrollToEnd({ animated: false });
      }, 50);
    });
    return unsub;
  }, []);

  const clearLogs = () => LogManager.getInstance().clear();

  return (
    <View
      style={[styles.container, { height: expanded ? 100 : 36 }]}
      testID="log_view_container"
    >
      <TouchableOpacity
        style={styles.header}
        onPress={() => setExpanded(prev => !prev)}
        testID="log_view_header"
      >
        <View style={styles.headerLeft}>
          <Text style={styles.headerText}>LOGS</Text>
          <Text style={styles.countText} testID="log_view_count">
            ({entries.length})
          </Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity
            onPress={clearLogs}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            testID="log_view_clear_button"
          >
            <Icon name="delete" size={18} color={AppColors.osGrey500} />
          </TouchableOpacity>
          <Icon
            name={expanded ? 'expand-less' : 'expand-more'}
            size={18}
            color={AppColors.osGrey500}
            style={styles.expandIcon}
          />
        </View>
      </TouchableOpacity>

      {expanded && (
        <ScrollView
          ref={horizScrollRef}
          horizontal
          testID="log_view_list"
          style={styles.horizScroll}
          onLayout={e => setContainerWidth(e.nativeEvent.layout.width)}
        >
          <ScrollView
            ref={vertScrollRef}
            style={[styles.vertScroll, { minWidth: containerWidth }]}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() =>
              vertScrollRef.current?.scrollToEnd({ animated: false })
            }
          >
            {entries.length === 0 ? (
              <Text style={styles.emptyText} testID="log_view_empty">
                No logs yet
              </Text>
            ) : (
              entries.map((entry, index) => (
                <View
                  key={index}
                  style={styles.logRow}
                  testID={`log_entry_${index}`}
                >
                  <Text
                    style={styles.timestamp}
                    testID={`log_entry_${index}_timestamp`}
                  >
                    {entry.timestamp}
                  </Text>
                  <Text
                    style={[
                      styles.level,
                      { color: LEVEL_COLORS[entry.level] ?? AppColors.osGrey500 },
                    ]}
                    testID={`log_entry_${index}_level`}
                  >
                    {' '}
                    {entry.level}{' '}
                  </Text>
                  <Text
                    style={styles.message}
                    testID={`log_entry_${index}_message`}
                  >
                    [{entry.tag}] {entry.message}
                  </Text>
                </View>
              ))
            )}
          </ScrollView>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: AppColors.osLogBackground,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerText: {
    fontSize: 11,
    fontWeight: '700',
    color: AppColors.white,
    letterSpacing: 0.8,
  },
  countText: {
    fontSize: 11,
    color: AppColors.osGrey500,
    marginLeft: 8,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  expandIcon: {
    marginLeft: 8,
  },
  horizScroll: {
    flex: 1,
  },
  vertScroll: {
    paddingHorizontal: 12,
    paddingBottom: 4,
  },
  logRow: {
    flexDirection: 'row',
    paddingVertical: 1,
  },
  timestamp: {
    fontSize: 11,
    color: AppColors.osLogTimestamp,
    fontFamily: 'monospace',
  },
  level: {
    fontSize: 11,
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  message: {
    fontSize: 11,
    color: AppColors.white,
    fontFamily: 'monospace',
  },
  emptyText: {
    fontSize: 11,
    color: AppColors.osGrey500,
    fontStyle: 'italic',
    paddingVertical: 4,
  },
});
