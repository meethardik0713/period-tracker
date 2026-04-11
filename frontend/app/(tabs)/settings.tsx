import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Switch,
  Vibration,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../../src/context/AppContext';
import { COLORS } from '../../src/utils/colors';

const NUM_ROWS = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['', '0', 'del'],
];

export default function SettingsScreen() {
  const {
    cycleLength,
    periodLength,
    pinEnabled,
    pin,
    setAndSavePin,
    togglePinEnabled,
    removePin,
    updateCycleLength,
    updatePeriodLength,
  } = useApp();

  const [pinMode, setPinMode] = useState<'none' | 'set' | 'change'>('none');
  const [pinStep, setPinStep] = useState<'old' | 'new' | 'confirm'>('new');
  const [tempPin, setTempPin] = useState('');
  const [entered, setEntered] = useState('');
  const [pinError, setPinError] = useState('');

  const handlePinToggle = (value: boolean) => {
    if (value) {
      setPinMode('set');
      setPinStep('new');
      setEntered('');
      setTempPin('');
    } else {
      removePin();
      setPinMode('none');
    }
  };

  const handleChangePin = () => {
    setPinMode('change');
    setPinStep('old');
    setEntered('');
    setTempPin('');
    setPinError('');
  };

  const handlePinDigit = (num: string) => {
    if (entered.length >= 4) return;
    const next = entered + num;
    setEntered(next);
    setPinError('');
    if (next.length === 4) {
      if (pinStep === 'old') {
        if (next === pin) {
          setPinStep('new');
          setEntered('');
        } else {
          setPinError('Incorrect PIN');
          setEntered('');
          Vibration.vibrate(200);
        }
      } else if (pinStep === 'new') {
        setTempPin(next);
        setPinStep('confirm');
        setEntered('');
      } else if (pinStep === 'confirm') {
        if (next === tempPin) {
          setAndSavePin(next);
          setPinMode('none');
          setEntered('');
          setTempPin('');
        } else {
          setPinError("PINs don't match");
          setEntered('');
          Vibration.vibrate(200);
        }
      }
    }
  };

  const handlePinDelete = () => {
    setEntered((e) => e.slice(0, -1));
    setPinError('');
  };

  const cancelPin = () => {
    setPinMode('none');
    setEntered('');
    setTempPin('');
    setPinError('');
  };

  const getPinPrompt = () => {
    if (pinStep === 'old') return 'Enter current PIN';
    if (pinStep === 'new') return 'Enter new PIN';
    return 'Confirm PIN';
  };

  // PIN entry overlay
  if (pinMode !== 'none') {
    return (
      <SafeAreaView style={styles.container} testID="settings-pin-entry">
        <View style={styles.pinOverlay}>
          <TouchableOpacity
            onPress={cancelPin}
            style={styles.cancelBtn}
            testID="pin-cancel-btn"
          >
            <Ionicons name="close" size={24} color={COLORS.textSecondary} />
          </TouchableOpacity>
          <Text style={styles.pinTitle}>{getPinPrompt()}</Text>
          <View style={styles.pinDots}>
            {[0, 1, 2, 3].map((i) => (
              <View
                key={i}
                style={[
                  styles.pinDot,
                  entered.length > i && styles.pinDotFilled,
                ]}
              />
            ))}
          </View>
          {pinError ? (
            <Text style={styles.pinErrorText}>{pinError}</Text>
          ) : null}
          <View style={styles.numpad}>
            {NUM_ROWS.map((row, ri) => (
              <View key={ri} style={styles.numRow}>
                {row.map((n, ci) => {
                  if (n === '')
                    return <View key={ci} style={styles.numBtn} />;
                  return (
                    <TouchableOpacity
                      key={ci}
                      style={styles.numBtn}
                      onPress={() =>
                        n === 'del'
                          ? handlePinDelete()
                          : handlePinDigit(n)
                      }
                      testID={`settings-pin-${n}`}
                    >
                      <Text style={styles.numText}>
                        {n === 'del' ? '⌫' : n}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))}
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} testID="settings-screen">
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Settings</Text>

        {/* Cycle Length */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Cycle Length</Text>
          <Text style={styles.cardSub}>
            Average number of days in your cycle
          </Text>
          <View style={styles.stepper}>
            <TouchableOpacity
              style={styles.stepBtn}
              onPress={() => updateCycleLength(Math.max(21, cycleLength - 1))}
              testID="cycle-minus-btn"
            >
              <Ionicons name="remove" size={20} color={COLORS.primary} />
            </TouchableOpacity>
            <Text style={styles.stepValue}>{cycleLength} days</Text>
            <TouchableOpacity
              style={styles.stepBtn}
              onPress={() => updateCycleLength(Math.min(40, cycleLength + 1))}
              testID="cycle-plus-btn"
            >
              <Ionicons name="add" size={20} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Period Length */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Period Length</Text>
          <Text style={styles.cardSub}>
            Average number of days your period lasts
          </Text>
          <View style={styles.stepper}>
            <TouchableOpacity
              style={styles.stepBtn}
              onPress={() =>
                updatePeriodLength(Math.max(2, periodLength - 1))
              }
              testID="period-minus-btn"
            >
              <Ionicons name="remove" size={20} color={COLORS.primary} />
            </TouchableOpacity>
            <Text style={styles.stepValue}>{periodLength} days</Text>
            <TouchableOpacity
              style={styles.stepBtn}
              onPress={() =>
                updatePeriodLength(Math.min(10, periodLength + 1))
              }
              testID="period-plus-btn"
            >
              <Ionicons name="add" size={20} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* PIN Lock */}
        <View style={styles.card}>
          <View style={styles.switchRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>PIN Lock</Text>
              <Text style={styles.cardSub}>
                Protect your data with a 4-digit PIN
              </Text>
            </View>
            <Switch
              value={pinEnabled}
              onValueChange={handlePinToggle}
              trackColor={{ false: COLORS.border, true: COLORS.primaryLight }}
              thumbColor={pinEnabled ? COLORS.primary : '#f4f3f4'}
              testID="pin-toggle"
            />
          </View>
          {pinEnabled && (
            <TouchableOpacity
              style={styles.changeBtn}
              onPress={handleChangePin}
              testID="change-pin-btn"
            >
              <Text style={styles.changeBtnText}>Change PIN</Text>
              <Ionicons
                name="chevron-forward"
                size={18}
                color={COLORS.primary}
              />
            </TouchableOpacity>
          )}
        </View>

        {/* About */}
        <View style={styles.aboutCard}>
          <Text style={styles.aboutEmoji}>🌙</Text>
          <Text style={styles.aboutTitle}>Luna</Text>
          <Text style={styles.aboutSub}>Your private cycle companion</Text>
          <Text style={styles.aboutVer}>Version 1.0.0</Text>
        </View>
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
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 3,
  },
  cardTitle: { fontSize: 16, fontWeight: '600', color: COLORS.textPrimary },
  cardSub: { fontSize: 13, color: COLORS.textSecondary, marginTop: 4 },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    gap: 20,
  },
  stepBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.secondaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepValue: {
    fontSize: 20,
    fontWeight: '500',
    color: COLORS.textPrimary,
    minWidth: 90,
    textAlign: 'center',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  changeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: 4,
  },
  changeBtnText: { fontSize: 14, fontWeight: '500', color: COLORS.primary },
  aboutCard: { alignItems: 'center', marginTop: 32, padding: 24 },
  aboutEmoji: { fontSize: 48, marginBottom: 8 },
  aboutTitle: { fontSize: 24, fontWeight: '300', color: COLORS.textPrimary },
  aboutSub: { fontSize: 14, color: COLORS.textSecondary, marginTop: 4 },
  aboutVer: { fontSize: 12, color: COLORS.border, marginTop: 8 },
  // PIN entry
  pinOverlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  cancelBtn: { position: 'absolute', top: 20, right: 20, padding: 8 },
  pinTitle: {
    fontSize: 20,
    fontWeight: '400',
    color: COLORS.textPrimary,
    marginBottom: 32,
  },
  pinDots: { flexDirection: 'row', gap: 16, marginBottom: 16 },
  pinDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: COLORS.primaryLight,
  },
  pinDotFilled: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  pinErrorText: { color: COLORS.error, fontSize: 14, marginBottom: 20 },
  numpad: { width: '80%', marginTop: 20 },
  numRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  numBtn: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 3,
  },
  numText: { fontSize: 26, fontWeight: '300', color: COLORS.textPrimary },
});
