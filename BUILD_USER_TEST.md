# Yaya'sDay user-test build

The target for this milestone is a real Android APK built with EAS using the `preview` profile. The APK is for internal user testing, not public store release.

Build command:

`npx eas-cli build --platform android --profile preview`

The preview profile must use `distribution: internal` and Android `buildType: apk`.

Before calling this release user-testable, verify the app starts, onboarding completes, My Day is reachable, and no build/runtime configuration errors remain.
