# Deployment Info

## The two ways to run your app

### Expo Go
A pre-built app from the App Store that loads any Expo project by scanning a QR code. Downloads just your JavaScript bundle — never touches native `ios/` or `android/` folders.

- **Pros:** instant, no build needed, just `npx expo start`
- **Cons:** icon/splash are not your real ones, can't use custom native plugins

### Your own build
An actual `.app` / `.apk` compiled specifically for your project. Icon, splash, plugins — all baked in properly. This is what real users install.

---

## How you get a real build

### `npx expo prebuild`
Generates the `ios/` and `android/` native folders from `app.json`. Translates your config into native project files. Re-run whenever `app.json` changes (new plugins, icon, splash, permissions etc).

- After running this you can still go back to Expo Go anytime — just run `npx expo start` as normal
- Don't edit `ios/` or `android/` manually — let `app.json` + prebuild manage them
- For a clean slate: delete `ios/` and `android/` and run `npx expo prebuild` again
- Most people add `ios/` and `android/` to `.gitignore` — they're generated files, not source code

### `npx expo run:ios`
Does prebuild (if needed) + compiles + installs on local simulator or USB-connected device. Requires Xcode. Fastest way to test a real build locally. Also triggered by pressing `i` in the Expo CLI.

### EAS Build (`eas build`)
Same as above but on Expo's cloud servers. No Xcode needed. Slower (queue + upload) but hands-off.

---

## The workflow ladder

```
Expo Go          → fastest dev, fake icon/splash, no custom plugins
↓
expo run:ios     → real build, real icon/splash, needs Xcode locally
↓
eas build (dev)  → real build on cloud, install via QR on real device
↓
eas build (prod) → App Store / Play Store submission
```

---

## EAS Build profiles

```bash
npm install -g eas-cli
eas login
eas build --profile <profile> --platform ios
```

| Profile | Purpose |
|---|---|
| `development` | Testing on your own device, never touches App Store |
| `preview` | Like TestFlight — share with a small group of testers |
| `production` | Submits to App Store for real users |

---

## Apple Developer Account

Required for installing on real iPhones and App Store distribution. **$99/year** at developer.apple.com. No way around it for iOS.

Android is a one-time **$25**.

What you get:
- Sign and install apps on real devices
- TestFlight (beta testing)
- App Store submission

**Free alternatives while developing:**
- iOS Simulator (needs Xcode, no Apple account)
- Expo Go (no account, works on real device, but fake icon/splash)

---

## Roadmap to App Store

### Phase 1 — Share with friends (TestFlight)
1. Buy Apple Developer account at developer.apple.com
2. `eas build --profile preview --platform ios`
3. `eas submit --platform ios` → uploads to TestFlight
4. Invite friends by email via App Store Connect
5. Friends install TestFlight app and get your build

### Phase 2 — App Store
1. `eas build --profile production --platform ios`
2. `eas submit --platform ios`
3. Fill out App Store Connect listing (screenshots, description, age rating etc)
4. Submit for Apple review (usually 1-3 days)
5. Approved → live on App Store

### Practical order
```
Fix Xcode simulator → see real build locally
         ↓
Buy Apple Developer account ($99)
         ↓
eas build preview → TestFlight → friends test
         ↓
eas build production → App Store
```

EAS handles almost all the complicated signing/certificate stuff automatically.

---

## Icon & Splash Screen notes

- `assets/icon.png` — app icon, must be opaque (Apple requires it)
- `assets/adaptive-icon.png` — Android adaptive icon foreground, transparent bg
- `assets/splash-icon.png` — dark mode splash (`#111111` bg)
- `assets/splash-icon-light.png` — light mode splash (`#F2EEE9` bg)
- Regenerate all assets: `python3 scripts/generate-icon.py`
- Icon/splash changes only show up in a real build — not in Expo Go
- `userInterfaceStyle: "automatic"` in `app.json` means the app respects system dark/light mode
