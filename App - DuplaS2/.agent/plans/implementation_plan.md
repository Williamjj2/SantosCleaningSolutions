# 📋 DuplaS2 - Implementation Plan (Native iOS + Firebase)

## 🏗️ Phase 1: Project Cleanup & Native Setup (Done)
**Goal:** Convert the hybrid web/native mess into a clean, buildable React Native Expo project.
- [x] **Cleanup:** Delete web artifacts.
- [x] **Dependencies:** Reconfigure `package.json` for Expo 50+ & Firebase.
- [x] **Tailwind:** Configure `nativewind`.
- [x] **Assets:** Setup basic placeholders.

## 🧱 Phase 2: Core Infrastructure (Firebase & Auth)
**Goal:** Allow users to sign in and be associated with a "Household".
- [x] **Firebase Setup:**
    - Create Firebase Project `duplas2-app-v1`.
    - Configure `lib/firebase.ts` with AsyncStorage persistence.
- [ ] **Auth Context:** Create `AuthProvider` using Firebase `onAuthStateChanged`.
- [ ] **Screens:**
    - Build `LoginScreen` (Email/Password).
    - Build `SignUpScreen` (Create User + Firestore Document).
    - Build `HouseholdInviteScreen` (Create/Join Household in Firestore).
- [ ] **Data Model (Firestore):**
    - `users/{userId}`: Profile data.
    - `households/{householdId}`: Shared data.
    - `bills/{billId}`: Bill details (linked to household).

## 🎨 Phase 3: The "Luxury" Shell (UI/UX)
**Goal:** Implement the "Modern Dark Fintech" aesthetic.
- [ ] **Design System:** Define colors in Tailwind config.
- [ ] **Navigation:** Glassmorphism Tab Bar.
- [ ] **Components:** "Glass Card", "Gradient Button".
- [ ] **Typography:** Load 'Inter'.

## 📱 Phase 4: Core Features (The MVP)
**Goal:** The functional "Bill Calendar".
- [ ] **Dashboard (Bento Grid):**
    - "Financial Pulse" widget (Total Due).
    - "Morning Briefing" card.
- [ ] **Calendar Screen:**
    - Firestore real-time listener for bills.
    - Custom Month View.
- [ ] **Add Bill Flow:**
    - 3-Step Wizard.
- [ ] **Settings:**
    - User Profile.
    - Household Management.

## 🚀 Phase 5: "Wow" Factors & Polish
- [ ] **Interactions:** Slide to Pay.
- [ ] **Feedback:** Confetti & Haptics.
- [ ] **Animations:** Reanimated Pulse.

## 🍎 Phase 6: App Store Prep
- [ ] **EAS Config:** Metadata & Build.
