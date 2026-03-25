# Deployment Info

## The two ways to run your app

### Expo Go
A pre-built app from the App Store that loads any Expo project by scanning a QR code. Downloads just your JavaScript bundle — never touches native `ios/` or `android/` folders.

- **Pros:** instant, no build needed, just `npx expo start`
- **Cons:** icon/splash are not your real ones, can't use custom native plugins, IAP does not work

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
Same as above but on Expo's cloud servers. No Xcode needed. Slower (queue + upload) but hands-off. This is the recommended path for App Store distribution.

---

## The workflow ladder

```
Expo Go          → fastest dev, fake icon/splash, no custom plugins, no IAP
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

> **IAP note:** In-app purchases only work in `preview` (TestFlight) and `production` builds. They will not work in `development` builds or Expo Go.

---

## Apple Developer Account

Required for installing on real iPhones and App Store distribution. **$99/year** at developer.apple.com. No way around it for iOS.

Android is a one-time **$25**.

What you get:
- Sign and install apps on real devices
- TestFlight (beta testing)
- App Store submission
- Access to App Store Connect (where you manage IAP, listings, pricing)

**Free alternatives while developing:**
- iOS Simulator (needs Xcode, no Apple account)
- Expo Go (no account, works on real device, but fake icon/splash, no IAP)

**Your bundle ID:** `com.whohere.app` — this must match exactly across App Store Connect, `app.json`, and your provisioning profile.

---

## Roadmap to App Store

### Phase 1 — Share with friends (TestFlight)
1. Buy Apple Developer account at developer.apple.com
2. Create your app in App Store Connect (use bundle ID `com.whohere.app`)
3. `eas build --profile preview --platform ios`
4. `eas submit --platform ios` → uploads to TestFlight
5. Invite friends by email via App Store Connect
6. Friends install TestFlight app and get your build

### Phase 2 — App Store
1. Fill out App Store Connect listing (screenshots, description, age rating, privacy policy URL)
2. Set up IAP products if applicable (see In-App Purchases section below)
3. `eas build --profile production --platform ios`
4. `eas submit --platform ios`
5. Submit for Apple review (usually 1–3 days; IAP products reviewed separately)
6. Approved → live on App Store

### Practical order
```
Fix Xcode simulator → see real build locally
         ↓
Buy Apple Developer account ($99)
         ↓
Create app in App Store Connect
         ↓
Set up IAP products (if needed)
         ↓
eas build preview → TestFlight → friends test (sandbox IAP works here)
         ↓
eas build production → App Store
```

EAS handles almost all the complicated signing/certificate stuff automatically.

---

## In-App Purchases

### How IAP works on iOS
Apple controls all purchases in iOS apps. You define products in App Store Connect, Apple handles the payment, and your app gets a receipt to verify. Apple takes a cut (see Revenue below).

### 1. Create the product in App Store Connect
1. Go to your app → **Features → In-App Purchases → (+)**
2. Choose type — for a one-time premium unlock, use **Non-Consumable**
   - Consumable: bought multiple times (coins, boosts)
   - Non-Consumable: bought once, permanent (premium unlock)
   - Subscription: recurring charge
3. Set a **Product ID** — convention: `com.whohere.app.premium`
4. Set price tier (Apple has fixed tiers, e.g. Tier 1 = $0.99)
5. Add display name + description (shown to users in the purchase dialog)
6. Submit the IAP product for review — Apple reviews it separately from the app itself

### 2. Install expo-iap
```bash
npx expo install expo-iap
```

Works with the managed workflow via EAS Build — no need to eject.

Add the plugin to `app.json`:
```json
"plugins": [
  "expo-iap"
]
```

### 3. Basic purchase flow (code structure)
```ts
import { initConnection, getProducts, requestPurchase, finishTransaction } from 'expo-iap';

// 1. Initialize (call once on app start)
await initConnection();

// 2. Fetch product info from Apple
const products = await getProducts(['com.whohere.app.premium']);

// 3. Trigger purchase (called when user taps "Buy")
const purchase = await requestPurchase({ sku: 'com.whohere.app.premium' });

// 4. Verify + finish
// Always call finishTransaction — Apple won't let the user buy again until you do
await finishTransaction({ purchase });

// 5. Unlock premium in your app state (Zustand store)
// Store a flag in AsyncStorage so it persists across restarts
```

### 4. Restoring purchases
Users who reinstall or switch devices expect to restore purchases. Add a "Restore Purchases" button:
```ts
import { getAvailablePurchases } from 'expo-iap';

const purchases = await getAvailablePurchases();
const hasPremium = purchases.some(p => p.productId === 'com.whohere.app.premium');
```

### 5. Sandbox testing
Real money is never charged during testing — Apple uses sandbox accounts.

1. In App Store Connect → **Users and Access → Sandbox Testers → (+)**
2. Create a fake Apple ID (use a real email you control, or a throwaway)
3. On your test device: sign out of your real Apple ID in **Settings → App Store** (not iCloud — just the App Store section)
4. Sign in with the sandbox account
5. Run a TestFlight or preview build — purchases go through but no charge

> Never test IAP in Expo Go or development builds — it won't work.

### 6. Revenue
- Apple takes **30%** by default
- If your app earns under $1M/year, enroll in the **App Store Small Business Program** → drops to **15%**
- Enroll at developer.apple.com after your app is live

### 7. Privacy policy requirement
Apple requires a **privacy policy URL** for any app on the App Store — even if you collect no data. Options:
- Host a simple page on GitHub Pages, Notion, or any public URL
- Use a generator like privacypolicygenerator.info
- Add the URL in App Store Connect under your app listing

---

## Icon & Splash Screen notes

- `assets/icon.png` — app icon, must be opaque (Apple requires it)
- `assets/adaptive-icon.png` — Android adaptive icon foreground, transparent bg
- `assets/splash-icon.png` — dark mode splash (`#111111` bg)
- `assets/splash-icon-light.png` — light mode splash (`#F2EEE9` bg)
- Regenerate all assets: `python3 scripts/generate-icon.py`
- Icon/splash changes only show up in a real build — not in Expo Go
- `userInterfaceStyle: "automatic"` in `app.json` means the app respects system dark/light mode
