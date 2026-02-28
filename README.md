
# PetHero App

This is a cross-platform mobile application built with [Expo](https://expo.dev) using `create-expo-app`. It supports Android, iOS, and Web platforms. This code was build for mobile devices.

---

## Getting Started

 You will need npm and expo to handle it properly, check online on how to install those services.

### 1. Install Dependencies

```bash
npm install
```

### 2. Start the Project

```bash
npx expo start
```

This will start the development server. You can run the app using:

- [Expo Go](https://expo.dev/go) on your phone
- An Android emulator
- An iOS simulator (on macOS)

---

## Building the App

We use [EAS Build](https://docs.expo.dev/eas/), which requires an Expo account and configuration.

### Prerequisites

- Login to Expo account:

```bash
npx eas login
```

- Confirm project ownership:

```bash
npx eas whoami
```

### 1. Build Android APK / AAB

```bash
npx eas build -p android
```

- APKs are easier for testing.
- AABs are required for Google Play Store uploads.

### 2. Build iOS (Requires macOS and Apple Developer Account)

> iOS builds cannot be done locally on Windows. Use EAS Cloud build.

```bash
npx eas build -p ios
```

For production, configure your Apple credentials on [expo.dev](https://expo.dev).

---

## Environment Variables

If your app uses secrets or environment-specific values, add them to `.env`:

```env
API_URL=https://api.example.com
STRIPE_KEY=pk_test_xxx
```

Then use `expo-constants` or `react-native-dotenv` to load them.

---

## Configuration Summary

- `app.json` contains metadata like app name, icons, splash screen, and permissions.
- Plugins used:
  - `expo-image-picker`
  - `expo-media-library`
  - `expo-location`
  - `@stripe/stripe-react-native`
  - `expo-font`
  - `expo-router`

---

## Maintenance Guide

1. **To update dependencies**:
   ```bash
   npm update
   ```

2. **To reset the project**:
   ```bash
   npm run reset-project
   ```

3. **To add new plugins**:
   - Install via `npm install`
   - Add to `app.json` under `plugins`

4. **For Cloudflare / Domain Settings**:
   - Main domain: `petheroplus.com`
   - Ensure redirect from `www.petheroplus.com` to non-www version via Cloudflare Page Rule.

---

## Support

For future devs or maintainers:
- Make sure you have access to the **Expo project owner account** (`jeffersonsousa`).
- Use the [Expo Dashboard](https://expo.dev/accounts/jeffersonsousa/projects) to manage builds.

---

## Resources

- [Expo Docs](https://docs.expo.dev/)
- [EAS Build](https://docs.expo.dev/build/introduction/)
- [Stripe for React Native](https://github.com/stripe/stripe-react-native)

---

## Further Development

- Clone the repo
- Run `npm install`
- Start with `npx expo start`
- Build with `npx eas build`
