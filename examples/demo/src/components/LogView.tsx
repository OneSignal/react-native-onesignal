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

const LEVEL_COLORS: Record<string, string> = {
  D: '#9E9E9E',
  I: '#64B5F6',
  W: '#FFB74D',
  E: '#EF5350',
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
      // auto-scroll to end
      setTimeout(() => {
        vertScrollRef.current?.scrollToEnd({ animated: false });
      }, 50);
    });
    return unsub;
  }, []);

  const clearLogs = () => LogManager.getInstance().clear();

  return (
    <View
      style={[styles.container, { height: expanded ? 200 : 36 }]}
      testID="log_view_container"
    >
      {/* Header */}
      <TouchableOpacity
        style={styles.header}
        onPress={() => setExpanded(prev => !prev)}
        testID="log_view_header"
      >
        <Text style={styles.headerText}>
          LOGS <Text testID="log_view_count">({entries.length})</Text>
        </Text>
        <View style={styles.headerRight}>
          <TouchableOpacity
            onPress={clearLogs}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            testID="log_view_clear_button"
          >
            <Icon name="delete" size={18} color="#9E9E9E" />
          </TouchableOpacity>
          <Icon
            name={expanded ? 'expand-less' : 'expand-more'}
            size={18}
            color="#9E9E9E"
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
                      { color: LEVEL_COLORS[entry.level] ?? '#9E9E9E' },
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
    backgroundColor: '#1A1B1E',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  headerText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#9E9E9E',
    letterSpacing: 0.8,
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
    color: '#757575',
    fontFamily: 'monospace',
  },
  level: {
    fontSize: 11,
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  message: {
    fontSize: 11,
    color: '#E0E0E0',
    fontFamily: 'monospace',
  },
  emptyText: {
    fontSize: 11,
    color: '#757575',
    fontStyle: 'italic',
    paddingVertical: 4,
  },
});
