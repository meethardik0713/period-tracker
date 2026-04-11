import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { useApp } from '../../src/context/AppContext';
import { COLORS } from '../../src/utils/colors';
import { formatDate } from '../../src/utils/cycleUtils';

const MOODS = [
  { id: 'happy', label: 'Happy', icon: 'happy-outline' as const },
  { id: 'sad', label: 'Sad', icon: 'sad-outline' as const },
  { id: 'angry', label: 'Angry', icon: 'flame-outline' as const },
  { id: 'emotional', label: 'Emotional', icon: 'heart-outline' as const },
  { id: 'tired', label: 'Tired', icon: 'moon-outline' as const },
  { id: 'calm', label: 'Calm', icon: 'leaf-outline' as const },
];

const SYMPTOMS = [
  { id: 'cramps', label: 'Cramps', icon: 'flash-outline' as const },
  { id: 'headache', label: 'Headache', icon: 'thunderstorm-outline' as const },
  { id: 'acne', label: 'Acne', icon: 'water-outline' as const },
  { id: 'bloating', label: 'Bloating', icon: 'ellipse-outline' as const },
  { id: 'back_pain', label: 'Back Pain', icon: 'body-outline' as const },
  { id: 'nausea', label: 'Nausea', icon: 'medkit-outline' as const },
  { id: 'low_energy', label: 'Low Energy', icon: 'battery-dead-outline' as const },
];

export default function TrackScreen() {
  const params = useLocalSearchParams<{ date?: string }>();
  const { dailyLogs, saveDailyLog, selectedDate, setSelectedDate } = useApp();

  const date = params.date || selectedDate || formatDate(new Date());

  useEffect(() => {
    if (params.date) setSelectedDate(params.date);
  }, [params.date]);

  const existingLog = dailyLogs[date];
  const [selectedMoods, setSelectedMoods] = useState<string[]>(
    existingLog?.moods || []
  );
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>(
    existingLog?.symptoms || []
  );
  const [notes, setNotes] = useState(existingLog?.notes || '');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const log = dailyLogs[date];
    setSelectedMoods(log?.moods || []);
    setSelectedSymptoms(log?.symptoms || []);
    setNotes(log?.notes || '');
    setSaved(false);
  }, [date]);

  const toggleMood = (id: string) => {
    setSelectedMoods((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
    setSaved(false);
  };

  const toggleSymptom = (id: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
    setSaved(false);
  };

  const handleSave = async () => {
    await saveDailyLog(date, {
      moods: selectedMoods,
      symptoms: selectedSymptoms,
      notes,
    });
    setSaved(true);
    Keyboard.dismiss();
    setTimeout(() => setSaved(false), 2000);
  };

  const displayDate = useMemo(() => {
    const d = new Date(date + 'T12:00:00');
    return d.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
  }, [date]);

  return (
    <SafeAreaView style={styles.container} testID="track-screen">
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.title}>Track</Text>
          <Text style={styles.dateText} testID="track-date">
            {displayDate}
          </Text>

          {/* Moods */}
          <Text style={styles.sectionTitle}>How are you feeling?</Text>
          <View style={styles.moodRow}>
            {MOODS.map((mood) => {
              const active = selectedMoods.includes(mood.id);
              return (
                <TouchableOpacity
                  key={mood.id}
                  style={[styles.moodItem, active && styles.moodActive]}
                  onPress={() => toggleMood(mood.id)}
                  testID={`mood-${mood.id}`}
                >
                  <Ionicons
                    name={mood.icon}
                    size={24}
                    color={active ? COLORS.primary : COLORS.textSecondary}
                  />
                  <Text
                    style={[styles.moodLabel, active && styles.moodLabelActive]}
                  >
                    {mood.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Symptoms */}
          <Text style={styles.sectionTitle}>Any symptoms?</Text>
          <View style={styles.symptomGrid}>
            {SYMPTOMS.map((symptom) => {
              const active = selectedSymptoms.includes(symptom.id);
              return (
                <TouchableOpacity
                  key={symptom.id}
                  style={[styles.symptomItem, active && styles.symptomActive]}
                  onPress={() => toggleSymptom(symptom.id)}
                  testID={`symptom-${symptom.id}`}
                >
                  <Ionicons
                    name={symptom.icon}
                    size={18}
                    color={active ? COLORS.primary : COLORS.textSecondary}
                  />
                  <Text
                    style={[
                      styles.symptomLabel,
                      active && styles.symptomLabelActive,
                    ]}
                  >
                    {symptom.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Notes */}
          <Text style={styles.sectionTitle}>Notes</Text>
          <TextInput
            style={styles.notesInput}
            placeholder="How was your day?"
            placeholderTextColor={COLORS.border}
            multiline
            numberOfLines={4}
            value={notes}
            onChangeText={(t) => {
              setNotes(t);
              setSaved(false);
            }}
            testID="notes-input"
          />

          {/* Save */}
          <TouchableOpacity
            style={[styles.saveBtn, saved && styles.saveBtnSaved]}
            onPress={handleSave}
            testID="save-tracking-btn"
            activeOpacity={0.8}
          >
            <Ionicons
              name={saved ? 'checkmark-circle' : 'bookmark-outline'}
              size={20}
              color={COLORS.white}
            />
            <Text style={styles.saveBtnText}>
              {saved ? 'Saved!' : 'Save'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
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
  },
  dateText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 12,
    marginTop: 8,
  },
  moodRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 24,
  },
  moodItem: {
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 16,
    backgroundColor: COLORS.surface,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    minWidth: 72,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 1,
  },
  moodActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.secondaryLight,
  },
  moodLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 6,
    fontWeight: '500',
  },
  moodLabelActive: { color: COLORS.primary },
  symptomGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 24,
  },
  symptomItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: COLORS.surface,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  symptomActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.secondaryLight,
  },
  symptomLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  symptomLabelActive: { color: COLORS.primary },
  notesInput: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    fontSize: 14,
    color: COLORS.textPrimary,
    borderWidth: 1,
    borderColor: COLORS.border,
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: 24,
  },
  saveBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 100,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },
  saveBtnSaved: { backgroundColor: COLORS.success },
  saveBtnText: { fontSize: 16, fontWeight: '600', color: COLORS.white },
});
