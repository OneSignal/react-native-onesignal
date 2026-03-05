import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LogManager, { LogEntry } from '../services/LogManager';
import { AppColors, AppTextStyles } from '../theme';

const LEVEL_COLORS: Record<string, string> = {
  D: AppColors.osLogDebug,
  I: AppColors.osLogInfo,
  W: AppColors.osLogWarn,
  E: AppColors.osLogError,
};

export default function LogView() {
  const [entries, setEntries] = useState<LogEntry[]>([]);
  const [expanded, setExpanded] = useState(true);
  const [containerWidth, setContainerWidth] = useState(0);

  useEffect(() => {
    const unsub = LogManager.getInstance().subscribe(entry => {
      if (entry) {
        setEntries(prev => [entry, ...prev]);
      } else {
        setEntries([]);
      }
    });
    return unsub;
  }, []);

  const clearLogs = () => LogManager.getInstance().clear();

  return (
    <View style={styles.container} testID="log_view_container">
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
          {entries.length > 0 && (
            <TouchableOpacity
              onPress={clearLogs}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              testID="log_view_clear_button"
            >
              <Icon name="delete" size={18} color={AppColors.osGrey500} />
            </TouchableOpacity>
          )}
          <Icon
            name={expanded ? 'expand-less' : 'expand-more'}
            size={18}
            color={AppColors.osGrey500}
            style={styles.expandIcon}
          />
        </View>
      </TouchableOpacity>

      {expanded && (
        <View style={styles.listContainer}>
          <ScrollView
            horizontal
            testID="log_view_list"
            onLayout={e => setContainerWidth(e.nativeEvent.layout.width)}
          >
            <ScrollView
              style={{ minWidth: containerWidth }}
              contentContainerStyle={styles.vertContent}
              showsVerticalScrollIndicator={false}
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
                        {
                          color:
                            LEVEL_COLORS[entry.level] ?? AppColors.osGrey500,
                        },
                      ]}
                      testID={`log_entry_${index}_level`}
                    >
                      {entry.level}
                    </Text>
                    <Text
                      style={styles.message}
                      testID={`log_entry_${index}_message`}
                    >
                      {entry.tag}: {entry.message}
                    </Text>
                  </View>
                ))
              )}
            </ScrollView>
          </ScrollView>
        </View>
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
    ...AppTextStyles.labelSmall,
    fontWeight: '700',
    color: AppColors.white,
    letterSpacing: 0.8,
  },
  countText: {
    ...AppTextStyles.labelSmall,
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
  listContainer: {
    height: 100,
  },
  vertContent: {
    paddingHorizontal: 12,
    paddingBottom: 4,
  },
  logRow: {
    flexDirection: 'row',
    paddingVertical: 1,
    gap: 4,
  },
  timestamp: {
    ...AppTextStyles.labelSmall,
    color: AppColors.osLogTimestamp,
    fontFamily: 'monospace',
  },
  level: {
    ...AppTextStyles.labelSmall,
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  message: {
    ...AppTextStyles.labelSmall,
    color: AppColors.white,
    fontFamily: 'monospace',
  },
  emptyText: {
    ...AppTextStyles.labelSmall,
    color: AppColors.osGrey500,
    paddingVertical: 12,
    textAlign: 'center',
  },
});
