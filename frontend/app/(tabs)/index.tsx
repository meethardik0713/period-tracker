import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../../src/context/AppContext';
import { COLORS } from '../../src/utils/colors';
import ProgressRing from '../../src/components/ProgressRing';
import * as CycleUtils from '../../src/utils/cycleUtils';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

function getPhaseColor(phase: string): string {
  switch (phase) {
    case 'Period':
      return COLORS.period;
    case 'Ovulation':
      return COLORS.ovulation;
    case 'PMS':
      return COLORS.secondary;
    default:
      return COLORS.fertile;
  }
}

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

function fmtDate(d: Date): string {
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function HomeScreen() {
  const {
    periods,
    cycleLength,
    periodLength,
    dailyLogs,
    startPeriod,
    endPeriod,
  } = useApp();
  const [aiInsight, setAiInsight] = useState('');
  const [loadingInsight, setLoadingInsight] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const lastPeriod = periods.length > 0 ? periods[periods.length - 1] : null;
  const isOnPeriod = lastPeriod !== null && lastPeriod.endDate === null;

  const cycleDay = lastPeriod
    ? CycleUtils.getCurrentCycleDay(lastPeriod.startDate)
    : 0;
  const phase = lastPeriod
    ? CycleUtils.getCurrentPhase(cycleDay, periodLength, cycleLength)
    : 'No data';
  const progress = lastPeriod ? Math.min(cycleDay / cycleLength, 1) : 0;

  const nextPeriod = lastPeriod
    ? CycleUtils.getNextPeriodDate(lastPeriod.startDate, cycleLength)
    : null;
  const ovulation = lastPeriod
    ? CycleUtils.getOvulationDate(lastPeriod.startDate, cycleLength)
    : null;
  const daysUntilNext = nextPeriod
    ? Math.max(0, CycleUtils.daysBetween(new Date(), nextPeriod))
    : 0;

  const fetchInsight = useCallback(async () => {
    if (!lastPeriod) return;
    setLoadingInsight(true);
    try {
      const today = CycleUtils.formatDate(new Date());
      const todayLog = dailyLogs[today];
      const res = await fetch(`${BACKEND_URL}/api/ai-insights`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cycle_day: cycleDay,
          phase,
          cycle_length: cycleLength,
          period_length: periodLength,
          recent_moods: todayLog?.moods || [],
          recent_symptoms: todayLog?.symptoms || [],
          days_until_next_period: daysUntilNext,
        }),
      });
      const data = await res.json();
      setAiInsight(data.insight);
    } catch {
      setAiInsight(
        'Take care of yourself today! Stay hydrated and listen to your body.'
      );
    } finally {
      setLoadingInsight(false);
    }
  }, [lastPeriod, cycleDay, phase, cycleLength, periodLength, dailyLogs, daysUntilNext]);

  useEffect(() => {
    fetchInsight();
  }, [fetchInsight]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchInsight();
    setRefreshing(false);
  }, [fetchInsight]);

  const handlePeriodAction = async () => {
    const today = CycleUtils.formatDate(new Date());
    if (isOnPeriod) {
      await endPeriod(today);
    } else {
      await startPeriod(today);
    }
  };

  return (
    <SafeAreaView style={styles.container} testID="home-screen">
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.greeting} testID="home-greeting">
            {getGreeting()} 🌸
          </Text>
          <Text style={styles.appName}>Luna</Text>
        </View>

        {lastPeriod ? (
          <>
            {/* Progress Ring */}
            <View style={styles.ringSection}>
              <ProgressRing progress={progress} size={180} strokeWidth={14}>
                <Text style={styles.cycleDay} testID="cycle-day-number">
                  {cycleDay}
                </Text>
                <Text style={styles.cycleDayLabel}>Day of Cycle</Text>
              </ProgressRing>
            </View>

            {/* Phase Card */}
            <View style={styles.card} testID="phase-card">
              <View style={styles.cardRow}>
                <View
                  style={[
                    styles.phaseDot,
                    { backgroundColor: getPhaseColor(phase) },
                  ]}
                />
                <Text style={styles.cardLabel}>CURRENT PHASE</Text>
              </View>
              <Text style={styles.phaseText}>{phase}</Text>
              <Text style={styles.cardSubtext}>
                {phase === 'Period'
                  ? 'Take it easy and rest'
                  : phase === 'Ovulation'
                  ? 'Most fertile window'
                  : phase === 'PMS'
                  ? 'Be gentle with yourself'
                  : 'Your body is preparing'}
              </Text>
            </View>

            {/* Prediction Cards */}
            <View style={styles.predictionRow}>
              <View style={[styles.miniCard, { flex: 1 }]} testID="next-period-card">
                <Ionicons name="calendar-outline" size={20} color={COLORS.primary} />
                <Text style={styles.miniLabel}>NEXT PERIOD</Text>
                <Text style={styles.miniValue}>
                  {nextPeriod ? fmtDate(nextPeriod) : '—'}
                </Text>
                <Text style={styles.miniSub}>
                  {daysUntilNext > 0 ? `in ${daysUntilNext} days` : 'Today'}
                </Text>
              </View>
              <View style={[styles.miniCard, { flex: 1 }]} testID="ovulation-card">
                <Ionicons name="flower-outline" size={20} color={COLORS.ovulation} />
                <Text style={styles.miniLabel}>OVULATION</Text>
                <Text style={styles.miniValue}>
                  {ovulation ? fmtDate(ovulation) : '—'}
                </Text>
                <Text style={styles.miniSub}>Fertile window</Text>
              </View>
            </View>

            {/* AI Insight */}
            <View style={styles.insightCard} testID="ai-insight-card">
              <View style={styles.insightHeader}>
                <Ionicons name="sparkles" size={18} color={COLORS.primary} />
                <Text style={styles.insightTitle}>Luna's Insight</Text>
              </View>
              {loadingInsight ? (
                <ActivityIndicator
                  size="small"
                  color={COLORS.primary}
                  style={{ marginTop: 12 }}
                />
              ) : (
                <Text style={styles.insightText} testID="ai-insight-text">
                  {aiInsight || 'Pull down to refresh for your daily insight'}
                </Text>
              )}
            </View>
          </>
        ) : (
          <View style={styles.welcomeCard} testID="welcome-card">
            <Text style={styles.welcomeEmoji}>🌙</Text>
            <Text style={styles.welcomeTitle}>Welcome to Luna</Text>
            <Text style={styles.welcomeText}>
              Start tracking your cycle by logging your first period below
            </Text>
          </View>
        )}

        {/* Period Action */}
        <TouchableOpacity
          style={[styles.actionBtn, isOnPeriod && styles.actionBtnEnd]}
          onPress={handlePeriodAction}
          testID="period-action-btn"
          activeOpacity={0.8}
        >
          <Ionicons
            name={isOnPeriod ? 'stop-circle-outline' : 'play-circle-outline'}
            size={22}
            color={COLORS.white}
          />
          <Text style={styles.actionBtnText}>
            {isOnPeriod ? 'End Period' : 'Start Period'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { padding: 20, paddingBottom: 40 },
  header: { marginBottom: 24 },
  greeting: { fontSize: 16, color: COLORS.textSecondary, fontWeight: '400' },
  appName: {
    fontSize: 32,
    fontWeight: '300',
    color: COLORS.textPrimary,
    letterSpacing: 1,
    marginTop: 4,
  },
  ringSection: { alignItems: 'center', paddingVertical: 20, marginBottom: 16 },
  cycleDay: { fontSize: 48, fontWeight: '200', color: COLORS.textPrimary },
  cycleDayLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '500',
    marginTop: -4,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 4,
  },
  cardRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  phaseDot: { width: 10, height: 10, borderRadius: 5 },
  cardLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '600',
    letterSpacing: 1,
  },
  phaseText: {
    fontSize: 24,
    fontWeight: '300',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  cardSubtext: { fontSize: 14, color: COLORS.textSecondary },
  predictionRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  miniCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  miniLabel: {
    fontSize: 10,
    color: COLORS.textSecondary,
    fontWeight: '600',
    marginTop: 8,
    letterSpacing: 0.5,
  },
  miniValue: {
    fontSize: 18,
    fontWeight: '400',
    color: COLORS.textPrimary,
    marginTop: 4,
  },
  miniSub: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  insightCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 4,
  },
  insightHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  insightTitle: { fontSize: 14, fontWeight: '600', color: COLORS.textPrimary },
  insightText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 22,
    marginTop: 10,
  },
  welcomeCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 28,
    padding: 32,
    alignItems: 'center',
    marginVertical: 40,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 24,
    elevation: 6,
  },
  welcomeEmoji: { fontSize: 64, marginBottom: 16 },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: '300',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  welcomeText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  actionBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 100,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
    marginTop: 8,
  },
  actionBtnEnd: { backgroundColor: COLORS.textSecondary },
  actionBtnText: { fontSize: 16, fontWeight: '600', color: COLORS.white },
});
