# Wiggle Pop 1.0.0 - Google Play release checklist

## Release baseline

- Package ID: `co.za.toddlerplay.wigglepop`
- Version: `1.0.0` (`versionCode` 1)
- Platform: Android phone and tablet
- Target SDK: Android 16 / API 36
- Minimum SDK: API 24
- Distribution: Android App Bundle (`.aab`) with Play App Signing

## Product and data declaration

Wiggle Pop is an offline-first children’s play app. The released build must continue to have:

- no accounts, authentication, server API, advertising, analytics, purchases, location, camera, microphone, contacts, or social features;
- only the local `darkMode` preference stored on-device; and
- no external links reachable by a child without a parent gate.

In Play Console, declare the target audience accurately as **Ages 5 and under**. Complete the Data safety, content-rating, ads, and target-audience declarations from the final built app—not from planned features. The app is subject to Google Play Families requirements.

## Required before upload

1. Publish an active, public privacy-policy URL and include the same policy inside the app. It must be reviewed to confirm the final data practices.
2. Create the Play Console app entry and finish its store listing: support email, short and full descriptions, app category, 512px icon, feature graphic, and phone/tablet screenshots that accurately show the released experience.
3. Create and safely store an upload key. Copy `android/keystore.properties.example` to the ignored `android/keystore.properties`, fill it with the local key details, and do not commit the keystore or its passwords. Enrol the app in Play App Signing.
4. Run `npm run build`, then `npx cap sync android`.
5. Build a signed release bundle from `android` with `./gradlew bundleRelease` (or `gradlew.bat bundleRelease` on Windows).
6. Verify the generated `.aab`, install a debug/release build on a physical Android phone and tablet, and exercise every route, dark mode, touch, keyboard, audio, orientation change, return-home action, and offline launch.
7. Upload first to the internal testing track, resolve every Play Console error, then use tester feedback before any production submission.

## Current repository gaps

- No public privacy-policy URL or in-app privacy-policy screen exists yet.
- Native Android launcher icons are still the Capacitor defaults; replace them with approved Wiggle Pop Play assets before store submission.
- No signing configuration, signed `.aab`, physical-device test record, Play Console app entry, store listing, screenshots, or completed policy declarations exist in this repository.

These are release gates, not backend work. A backend is intentionally out of scope for version 1.0.0.
