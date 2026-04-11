# Luna - Period Tracker App PRD

## Overview
Luna is a modern, aesthetic period tracker mobile app with a clean, soft pink/white UI designed for privacy and elegance. Built with Expo React Native (frontend) and FastAPI (backend for AI insights only).

## Architecture
- **Frontend**: Expo React Native with expo-router (file-based routing)
- **Backend**: FastAPI (minimal - only AI insights endpoint)
- **Data Storage**: All user data stored locally via AsyncStorage (maximum privacy)
- **AI**: GPT-4o-mini via Emergent LLM key for personalized health insights

## Features

### 1. Home Dashboard
- Greeting with time-of-day awareness
- Progress ring showing cycle day/total
- Current phase card (Period, Follicular, Ovulation, PMS)
- Prediction cards (Next Period date, Ovulation date)
- AI-powered health insights card
- Start/End Period button
- Pull-to-refresh for insights

### 2. Calendar View
- Monthly calendar with navigation
- Color-coded day highlighting:
  - Pink: Period days
  - Light pink: Predicted period
  - Purple: Ovulation day
  - Light green: Fertile window
- Tap any day to navigate to Track screen

### 3. Mood & Symptom Tracker
- 6 mood options: Happy, Sad, Angry, Emotional, Tired, Calm
- 7 symptom options: Cramps, Headache, Acne, Bloating, Back Pain, Nausea, Low Energy
- Notes text input
- Save per day

### 4. Cycle History
- List of past periods with dates and duration
- Expandable cards showing mood/symptom/notes data
- Cycle length calculation between periods

### 5. Settings
- Cycle length adjustment (21-40 days)
- Period length adjustment (2-10 days)
- PIN lock enable/disable/change
- About section

### 6. PIN Lock (Privacy)
- Optional 4-digit PIN protection
- Set/change/disable from Settings
- Soft aesthetic lock screen

### 7. AI Health Insights
- Powered by GPT-4o-mini via Emergent LLM key
- Personalized tips based on cycle day, phase, moods, symptoms
- Fallback message when API unavailable

## Tech Stack
- Expo SDK 54 / React Native 0.81.5
- expo-router v6 (file-based routing)
- AsyncStorage for local data
- react-native-svg for progress ring
- FastAPI backend (AI endpoint only)
- emergentintegrations library for LLM access

## Color Palette
- Background: #FDF9F9
- Primary: #F2A7B8 (pink)
- Surface: #FFFFFF
- Text: #2D2A2B / #6A6063
- Period: #F4B8C8
- Ovulation: #C4A7D7
- Fertile: #D8E2DC

## File Structure
```
frontend/
  app/
    _layout.tsx          (Root layout with PIN gate)
    index.tsx            (Redirect to tabs)
    (tabs)/
      _layout.tsx        (Bottom tab navigator)
      index.tsx          (Home dashboard)
      calendar.tsx       (Calendar view)
      track.tsx          (Mood/symptom tracker)
      history.tsx        (Cycle history)
      settings.tsx       (Settings + PIN management)
  src/
    utils/
      colors.ts          (Color constants)
      storage.ts         (AsyncStorage CRUD)
      cycleUtils.ts      (Cycle calculations)
    context/
      AppContext.tsx      (Global state provider)
    components/
      ProgressRing.tsx   (SVG circular progress)
      PinLock.tsx        (PIN lock screen)
backend/
  server.py              (FastAPI with AI insights endpoint)
```

## API Endpoints
- `GET /api/health` - Health check
- `POST /api/ai-insights` - Get AI-powered health insights

## Business Enhancement Suggestion
- **Premium Subscription**: Add cycle pattern analysis, multi-month predictions, and partner sharing features as premium tier ($2.99/mo)
