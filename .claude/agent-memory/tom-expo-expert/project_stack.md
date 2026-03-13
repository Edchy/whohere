---
name: project_stack
description: SDK versions, installed libraries, and key configuration facts for whohere
type: project
---

- Expo SDK ~54.0.33
- React Native 0.81.5
- React 19.1.0
- expo-router ^6.0.23
- react-native-reanimated ^4.1.1 (installed: 4.1.1) — uses react-native-worklets under the hood
- react-native-worklets ^0.5.1
- zustand ^5.0.11
- expo-haptics ^15.0.8

**Why:** Reference for library compatibility checks and `expo install` version pinning.
**How to apply:** When adding a new library, verify SDK 54 compatibility. When touching reanimated, remember it's v4 (not v2/v3).
