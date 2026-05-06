# Trekunity Build Targets

This repo now has three client targets:

- Website: existing Vite app in `frontend`
- Android/Web mobile app: Expo React Native app in `apps/mobile`
- Windows desktop app: Electron wrapper in `desktop`

## Install

```powershell
npm install
```

## Website

```powershell
npm run build:frontend
npm run dev:frontend
```

## Android APK

Expo/EAS is configured for an APK preview build.

```powershell
npm run dev:mobile
npm run build:android:apk
```

Requirements:

- Expo/EAS account
- Android package configured in `apps/mobile/app.json`
- API URL set with `EXPO_PUBLIC_API_URL` for physical devices

## Desktop EXE

```powershell
npm run build:desktop:exe
```

Output goes to `desktop/release`.

## Backend

All clients expect the backend API to be available. For Android emulator use `http://10.0.2.2:3001/api`; for web/desktop use `http://127.0.0.1:3001/api` or the deployed API URL.
