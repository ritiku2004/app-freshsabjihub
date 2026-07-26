# FreshSabjiHub Mobile App

This is the React Native mobile application for FreshSabjiHub customers, built using Expo.

## Features
- Seamless grocery shopping experience
- Location tracking and maps integration
- Push notifications and sharing functionality
- Fast and responsive UI with React Navigation

## Prerequisites
- Node.js
- Expo CLI
- Expo Go app on your physical device, or an iOS Simulator / Android Emulator

## Setup Instructions
1. Navigate to the `App` folder.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up necessary environment variables or configurations (e.g., `google-services.json` for Firebase).
4. Start the Expo development server:
   ```bash
   npm start
   ```
5. Scan the QR code with the Expo Go app on your phone, or press `a` for Android / `i` for iOS to run on an emulator/simulator.

## Important Information
- This project utilizes TanStack React Query for robust API data fetching and caching.
- Always use `expo` commands (e.g., `npx expo start`) instead of plain React Native CLI commands.
- Location and notification services are deeply integrated using Expo's core libraries.
