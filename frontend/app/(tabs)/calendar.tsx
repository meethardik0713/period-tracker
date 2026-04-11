import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useApp } from '../../src/context/AppContext';
import { COLORS } from '../../src/utils/colors';
import * as CycleUtils from '../../src/utils/cycleUtils';

const SCREEN_W = Dimensions.get('window').width;
const CELL_SIZE = (SCREEN_W - 40) / 7;

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

function dayCellBg(type: CycleUtils.DayType) {
  switch (type) {
    case 'period':
      return { backgroundColor: COLORS.period };
    case 'predicted':
      return { backgroundColor: COLORS.primaryLight };
    case 'ovulation':
      return { backgroundColor: COLORS.ovulation };
    case 'fertile':
      return { backgroundColor: COLORS.fertileLight };
    default:
      return {};
  }
}

function dayTextStyle(type: CycleUtils.DayType) {
  if (type === 'period' || type === 'ovulation')
    return { color: COLORS.white, fontWeight: '600' as const };
  return {};
}

export default function CalendarScreen() {
  const { periods, cycleLength, periodLength, setSelectedDate } = useApp();
  const router = useRouter();
  const today = new Date();
  const todayStr = CycleUtils.formatDate(today);
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  const daysInMonth = CycleUtils.getDaysInMonth(year, month);
  const firstDay = CycleUtils.getFirstDayOfMonth(year, month);

  const dayTypes = useMemo(() => {
    const types: Record<string, CycleUtils.DayType> = {};
    for (let d = 1; d <= daysInMonth; d++) {
      const ds = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      types[ds] = CycleUtils.getDayType(ds, periods, cycleLength, periodLength);
    }
    return types;
  }, [year, month, periods, cycleLength, periodLength, daysInMonth]);

  const prevMonth = () => {
    if (month === 0) {
      setMonth(11);
      setYear((y) => y - 1);
    } else {
      setMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (month === 11) {
      setMonth(0);
      setYear((y) => y + 1);
    } else {
      setMonth((m) => m + 1);
    }
  };

  const handleDayPress = (dateStr: string) => {
    setSelectedDate(dateStr);
    router.push({ pathname: '/(tabs)/track', params: { date: dateStr } });
  };

  const cells: React.ReactNode[] = [];
  for (let i = 0; i < firstDay; i++) {
    cells.push(<View key={`e${i}`} style={styles.dayCell} />);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const ds = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const type = dayTypes[ds] || 'normal';
    const isToday = ds === todayStr;
    cells.push(
      <TouchableOpacity
        key={d}
        style={[styles.dayCell, dayCellBg(type), isToday && styles.todayCell]}
        onPress={() => handleDayPress(ds)}
        testID={`calendar-day-${d}`}
      >
        <Text style={[styles.dayText, dayTextStyle(type), isToday && styles.todayText]}>
          {d}
        </Text>
      </TouchableOpacity>
    );
  }

  return (
    <SafeAreaView style={styles.container} testID="calendar-screen">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Calendar</Text>

        {/* Month Nav */}
        <View style={styles.monthNav}>
          <TouchableOpacity onPress={prevMonth} testID="cal-prev-month" style={styles.navBtn}>
            <Ionicons name="chevron-back" size={22} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.monthText}>
            {MONTHS[month]} {year}
          </Text>
          <TouchableOpacity onPress={nextMonth} testID="cal-next-month" style={styles.navBtn}>
            <Ionicons name="chevron-forward" size={22} color={COLORS.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Weekday Headers */}
        <View style={styles.row}>
          {WEEKDAYS.map((d) => (
            <View key={d} style={styles.dayCell}>
              <Text style={styles.weekdayText}>{d}</Text>
            </View>
          ))}
        </View>

        {/* Grid */}
        <View style={styles.grid}>{cells}</View>

        {/* Legend */}
        <View style={styles.legend}>
          {[
            { c: COLORS.period, l: 'Period' },
            { c: COLORS.primaryLight, l: 'Predicted' },
            { c: COLORS.ovulation, l: 'Ovulation' },
            { c: COLORS.fertileLight, l: 'Fertile' },
          ].map((item) => (
            <View key={item.l} style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: item.c }]} />
              <Text style={styles.legendLabel}>{item.l}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { paddingHorizontal: 20, paddingBottom: 40 },
  title: {
    fontSize: 28,
    fontWeight: '300',
    color: COLORS.textPrimary,
    letterSpacing: 0.5,
    marginTop: 16,
    marginBottom: 8,
  },
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  navBtn: { padding: 8 },
  monthText: { fontSize: 18, fontWeight: '500', color: COLORS.textPrimary },
  row: { flexDirection: 'row' },
  dayCell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: CELL_SIZE / 2,
  },
  dayText: { fontSize: 15, color: COLORS.textPrimary, fontWeight: '400' },
  weekdayText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  todayCell: { borderWidth: 2, borderColor: COLORS.primary },
  todayText: { fontWeight: '700' },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginTop: 24,
    flexWrap: 'wrap',
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendLabel: { fontSize: 12, color: COLORS.textSecondary },
});
