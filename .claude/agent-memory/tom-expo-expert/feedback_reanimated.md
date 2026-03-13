---
name: feedback_reanimated
description: reanimated v4 setup requirements and breaking API changes vs v2/v3
type: project
---

## babel.config.js is required — do not omit it

Without a `babel.config.js` at the project root with `react-native-reanimated/plugin` listed, the worklet Babel transform is never applied and the app crashes at runtime when any reanimated hook runs.

The correct config for this project:
```js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: ['react-native-reanimated/plugin'],
  };
};
```

**Why:** The project root had no babel.config.js, causing a hard crash on launch.
**How to apply:** Always verify babel.config.js exists and contains the reanimated plugin before debugging other reanimated issues.

## Easing.step0 / Easing.step1 removed in v4

reanimated v4 dropped `Easing.step0` and `Easing.step1`. Replacement:
- `Easing.step0` → `Easing.steps(1, false)` (jump at start of interval)
- `Easing.step1` → `Easing.steps(1, true)` (jump at end of interval)

**Why:** Used step0 in EyesLogo.tsx saccade animation; caused a runtime TypeError.
**How to apply:** Any time writing hold/discrete timing in reanimated v4, use `Easing.steps(n, roundToNextStep)`.

## reanimated v4 babel plugin delegates to react-native-worklets

`react-native-reanimated/plugin/index.js` simply re-exports `react-native-worklets/plugin`. Both packages must be installed. In this project, `react-native-worklets` is a direct dependency in package.json.
