# Gym Everyday — Expo shell

Native shell around the public site:

https://mypeanutbutterjam-netizen.github.io/gym-everyday/

Display name: **Gym Everyday**

| | |
| --- | --- |
| iOS bundle identifier | `com.mypeanutbutterjam.gymeveryday` |
| Android package | `com.mypeanutbutterjam.gymeveryday` |
| Privacy policy | https://mypeanutbutterjam-netizen.github.io/gym-everyday/privacy.html |

The same privacy URL is `expo.extra.privacyPolicyUrl` in `app.json`. Paste it into App Store Connect and Play Console when you submit. This repo does not configure App Store Connect or Apple payments.

## What the shell does

- Loads the official site in a WebView, including `privacy.html` and in-app hash routes
- Keeps that origin inside the WebView
- Opens other `http` and `https` links in the system browser (Safari View Controller on iOS, Chrome Custom Tabs on Android)
- Opens `mailto:` and other non-http links with the system handler
- Pads for the safe area
- Shows a loading spinner, and a retry screen if the site fails to load
- Pull to refresh reloads the page
- Share opens the system share sheet with the current site URL

The public site does not use the camera or the photo library. Exercise pictures are files shipped with the site. This app does not request photo or camera permission, and `app.json` has no photo usage strings.

Google sign-in is not enabled on the public site (no `VITE_GOOGLE_CLIENT_ID` in that build), so cloud sync stays off. This shell does not add Google OAuth. Google blocks OAuth inside embedded WebViews, so do not expect sign-in to work here even if sync is turned on later for the website.

## Install

From this directory:

```bash
npm install
npx expo start
```

Typecheck:

```bash
npx tsc --noEmit
```

A development build needs a dev client (`expo-dev-client` is already a dependency). Expo Go can load the JavaScript, but a store build should go through EAS.

## EAS build

Install the CLI once if you need it: `npm install -g eas-cli`, or call `npx eas-cli`. Log in with `eas login`. The first `eas build` links this project to an Expo account and writes `extra.eas.projectId`.

```bash
eas build --profile development --platform all
eas build --profile preview --platform all
eas build --profile production --platform all
```

Profiles in `eas.json`:

- `development` — dev client, internal distribution, iOS simulator build
- `preview` — internal distribution, Android APK you can install without Play
- `production` — store binaries (Android App Bundle, iOS IPA). `autoIncrement` is on, with versions stored on EAS (`appVersionSource: remote`)

## EAS submit

After a production build:

```bash
eas submit --profile production --platform ios
eas submit --profile production --platform android
```

Use the privacy URL above in both stores. iOS export compliance is already set (`ios.config.usesNonExemptEncryption: false`) because the app only uses standard HTTPS.
