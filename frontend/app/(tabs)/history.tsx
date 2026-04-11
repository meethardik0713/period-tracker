import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../../src/context/AppContext';
import { COLORS } from '../../src/utils/colors';
import * as CycleUtils from '../../src/utils/cycleUtils';

function fmtPeriodDate(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function HistoryScreen() {
  const { periods, dailyLogs, cycleLength } = useApp();
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

  const sorted = useMemo(() => [...periods].reverse(), [periods]);

  const getCycleLen = (revIdx: number) => {
    const origIdx = periods.length - 1 - revIdx;
    if (origIdx < periods.length - 1) {
      const cur = periods[origIdx];
      const nxt = periods[origIdx + 1];
      return CycleUtils.daysBetween(
        CycleUtils.parseDate(cur.startDate),
        CycleUtils.parseDate(nxt.startDate)
      );
    }
    return cycleLength;
  };

  const getDuration = (p: { startDate: string; endDate: string | null }) => {
    if (!p.endDate) return 'Ongoing';
    return `${
      CycleUtils.daysBetween(
        CycleUtils.parseDate(p.startDate),
        CycleUtils.parseDate(p.endDate)
      ) + 1
    } days`;
  };

  const getLogEntries = (p: { startDate: string; endDate: string | null }) => {
    const entries: { date: string; moods: string[]; symptoms: string[]; notes: string }[] = [];
    const start = CycleUtils.parseDate(p.startDate);
    const end = p.endDate ? CycleUtils.parseDate(p.endDate) : new Date();
    const cur = new Date(start);
    while (cur <= end) {
      const ds = CycleUtils.formatDate(cur);
      if (dailyLogs[ds]) {
        entries.push({ date: ds, ...dailyLogs[ds] });
      }
      cur.setDate(cur.getDate() + 1);
    }
    return entries;
  };

  return (
    <SafeAreaView style={styles.container} testID="history-screen">
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>History</Text>

        {sorted.length === 0 ? (
          <View style={styles.emptyWrap} testID="history-empty">
            <Ionicons name="time-outline" size={48} color={COLORS.border} />
            <Text style={styles.emptyTitle}>No cycles logged yet</Text>
            <Text style={styles.emptySub}>
              Start tracking from the Home screen
            </Text>
          </View>
        ) : (
          sorted.map((period, idx) => {
            const expanded = expandedIdx === idx;
            const logs = expanded ? getLogEntries(period) : [];
            return (
              <TouchableOpacity
                key={idx}
                style={styles.card}
                onPress={() => setExpandedIdx(expanded ? null : idx)}
                testID={`history-card-${idx}`}
                activeOpacity={0.7}
              >
                <View style={styles.cardHeader}>
                  <View style={styles.badge}>
                    <Ionicons name="water" size={16} color={COLORS.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardDates}>
                      {fmtPeriodDate(period.startDate)} —{' '}
                      {period.endDate
                        ? fmtPeriodDate(period.endDate)
                        : 'Ongoing'}
                    </Text>
                    <View style={styles.meta}>
                      <Text style={styles.metaText}>
                        Duration: {getDuration(period)}
                      </Text>
                      <Text style={styles.metaDot}>·</Text>
                      <Text style={styles.metaText}>
                        Cycle: {getCycleLen(idx)} days
                      </Text>
                    </View>
                  </View>
                  <Ionicons
                    name={expanded ? 'chevron-up' : 'chevron-down'}
                    size={18}
                    color={COLORS.textSecondary}
                  />
                </View>

                {expanded && (
                  <View style={styles.expandBody}>
                    {logs.length === 0 ? (
                      <Text style={styles.noLogs}>
                        No tracking data for this period
                      </Text>
                    ) : (
                      logs.map((log, li) => (
                        <View key={li} style={styles.logItem}>
                          <Text style={styles.logDate}>
                            {new Date(log.date + 'T12:00:00').toLocaleDateString(
                              'en-US',
                              { weekday: 'short', month: 'short', day: 'numeric' }
                            )}
                          </Text>
                          {log.moods.length > 0 && (
                            <Text style={styles.logDetail}>
                              Mood: {log.moods.join(', ')}
                            </Text>
                          )}
                          {log.symptoms.length > 0 && (
                            <Text style={styles.logDetail}>
                              Symptoms: {log.symptoms.join(', ')}
                            </Text>
                          )}
                          {log.notes ? (
                            <Text style={styles.logNotes}>{log.notes}</Text>
                          ) : null}
                        </View>
                      ))
                    )}
                  </View>
                )}
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { padding: 20, paddingBottom: 40 },
  title: {
    fontSize: 28,
    fontWeight: '300',
    color: COLORS.textPrimary,
    letterSpacing: 0.5,
    marginBottom: 24,
  },
  emptyWrap: { alignItems: 'center', paddingTop: 60 },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '400',
    color: COLORS.textPrimary,
    marginTop: 16,
  },
  emptySub: { fontSize: 14, color: COLORS.textSecondary, marginTop: 4 },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 3,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  badge: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: COLORS.periodLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardDates: { fontSize: 14, fontWeight: '500', color: COLORS.textPrimary },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  metaText: { fontSize: 12, color: COLORS.textSecondary },
  metaDot: { fontSize: 12, color: COLORS.border },
  expandBody: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  noLogs: { fontSize: 13, color: COLORS.textSecondary, fontStyle: 'italic' },
  logItem: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  logDate: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  logDetail: { fontSize: 13, color: COLORS.textSecondary, marginTop: 2 },
  logNotes: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
    marginTop: 4,
  },
});
