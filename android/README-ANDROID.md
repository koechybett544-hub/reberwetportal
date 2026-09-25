# Reberwet Junior Secondary School Portal - Production Android Application

This is the standalone native Android application codebase for **Reberwet Junior Secondary School Portal** (`ke.ac.reberwet.jssportal`).

It launches directly into the Reberwet Portal without opening Google AI Studio or requiring users to access AI Studio. It is fully prepared for independent device installation (sideloading) and publishing to the **Google Play Store**.

---

## 1. Project Specifications

- **Application Name**: Reberwet JSS
- **Full Title**: Reberwet Junior Secondary School Portal
- **Package Name**: `ke.ac.reberwet.jssportal`
- **Minimum SDK**: Android 7.0 (API 24)
- **Target SDK**: Android 15 (API 35 - Google Play Store Requirement)
- **Architecture**: Native Android Kotlin + Android WebKit + Native JavaScript Bridge (`AndroidBridge`)
- **Key Features**:
  - Direct launch into Reberwet Portal (zero third-party development wrappers)
  - CBC Assessment, Rubric & Marks Entry
  - Full-screen school interface with pull-to-refresh
  - Teacher Profile & Staff Login (OTP & Google Sign-In)
  - Native PDF Report Card & Mark Sheet Downloads to Android `Downloads/`
  - Camera & Gallery picker for Learner photos and school documents
  - Haptic feedback on saving marks and attendance
  - Digital Asset Links support (`/.well-known/assetlinks.json`)
  - Offline mode resilience with automatic retry

---

## 2. Opening in Android Studio

1. Launch **Android Studio** (Koala, Ladybug, or newer).
2. Choose **Open** and select the `/android` directory.
3. Allow Gradle to sync dependencies.
4. Connect an Android phone via USB (with Developer Mode and USB Debugging enabled) or start an Android Emulator.
5. Click **Run 'app'** (`Shift + F10`).

---

## 3. Building the Standalone APK (Sideloading on Devices)

To generate an APK that teachers can install directly from WhatsApp, flash drive, or email:

```bash
cd android
./gradlew assembleDebug
```

The APK will be generated at:
`app/build/outputs/apk/debug/app-debug.apk`

To install on a connected phone via ADB:
```bash
adb install app/build/outputs/apk/debug/app-debug.apk
```

---

## 4. Building the Production Release Bundle (.AAB) for Google Play

Google Play requires Android App Bundles (`.aab`) targeting API 35.

### Step 4.1: Generate a Production Keystore
```bash
keytool -genkey -v -keystore reberwet-release-key.jks \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -alias reberwet-key \
  -dname "CN=Reberwet JSS, OU=ICT Department, O=Reberwet Junior Secondary School, L=Kericho, ST=Rift Valley, C=KE"
```

### Step 4.2: Build the Release AAB
```bash
./gradlew bundleRelease
```
The production bundle will be located at:
`app/build/outputs/bundle/release/app-release.aab`

---

## 5. Google Play Console Listing Information

- **App Name**: Reberwet JSS Portal
- **Short Description (Max 80 chars)**:
  Official CBC marks entry, learner attendance & assessment portal for Reberwet JSS.
- **Category**: Education
- **Content Rating**: Everyone (3+)
- **Target Audience**: Teachers, School Administrators, Educators
- **Tags**: School Portal, CBC Grading, Kenya JSS, Teacher Attendance, Report Cards

---

## 6. Permissions Configured

- `android.permission.INTERNET`: Connect to portal database and real-time sync.
- `android.permission.ACCESS_NETWORK_STATE`: Monitor offline/online status.
- `android.permission.CAMERA`: Scan documents & capture learner profile photos.
- `android.permission.READ_MEDIA_IMAGES`: Upload school documents and badges.
- `android.permission.VIBRATE`: Native haptic confirmation on marks submission.
- `android.permission.POST_NOTIFICATIONS`: Receive school circulars and exam announcements.
