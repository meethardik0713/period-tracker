import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Vibration } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../utils/colors';
import { useApp } from '../context/AppContext';

const NUM_ROWS = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['', '0', 'del'],
];

export default function PinLock() {
  const { pin, unlock } = useApp();
  const [entered, setEntered] = useState('');
  const [error, setError] = useState(false);

  const handlePress = (num: string) => {
    if (entered.length >= 4) return;
    const next = entered + num;
    setEntered(next);
    setError(false);
    if (next.length === 4) {
      if (next === pin) {
        unlock();
      } else {
        setError(true);
        setEntered('');
        Vibration.vibrate(200);
      }
    }
  };

  const handleDelete = () => {
    setEntered((e) => e.slice(0, -1));
    setError(false);
  };

  return (
    <SafeAreaView style={styles.container} testID="pin-lock-screen">
      <View style={styles.header}>
        <Text style={styles.emoji}>🌙</Text>
        <Text style={styles.title}>Luna</Text>
        <Text style={styles.subtitle}>Enter your PIN</Text>
      </View>

      <View style={styles.dots}>
        {[0, 1, 2, 3].map((i) => (
          <View
            key={i}
            style={[
              styles.dot,
              entered.length > i && styles.dotFilled,
              error && styles.dotError,
            ]}
          />
        ))}
      </View>

      {error && <Text style={styles.errorText}>Incorrect PIN, try again</Text>}

      <View style={styles.pad}>
        {NUM_ROWS.map((row, ri) => (
          <View key={ri} style={styles.padRow}>
            {row.map((num, ci) => {
              if (num === '') return <View key={ci} style={styles.padBtn} />;
              return (
                <TouchableOpacity
                  key={ci}
                  style={styles.padBtn}
                  onPress={() => (num === 'del' ? handleDelete() : handlePress(num))}
                  testID={num === 'del' ? 'pin-delete-btn' : `pin-btn-${num}`}
                  activeOpacity={0.7}
                >
                  <Text style={styles.padText}>{num === 'del' ? '⌫' : num}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: { alignItems: 'center', marginBottom: 40 },
  emoji: { fontSize: 48, marginBottom: 8 },
  title: {
    fontSize: 32,
    fontWeight: '300',
    color: COLORS.textPrimary,
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginTop: 8,
  },
  dots: { flexDirection: 'row', gap: 16, marginBottom: 16 },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: COLORS.primaryLight,
  },
  dotFilled: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  dotError: {
    borderColor: COLORS.error,
    backgroundColor: COLORS.error,
  },
  errorText: {
    color: COLORS.error,
    fontSize: 14,
    marginBottom: 20,
  },
  pad: { width: '80%', marginTop: 20 },
  padRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  padBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 3,
  },
  padText: {
    fontSize: 28,
    fontWeight: '300',
    color: COLORS.textPrimary,
  },
});
