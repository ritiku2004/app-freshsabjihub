# FreshCart - Grocery Delivery App 🛒

FreshCart is a modern, responsive, and cross-platform grocery delivery client application built with React Native and Expo. It offers a premium user experience with smooth navigation, a clean UI system, and an intuitive shopping flow from onboarding to checkout.

## 🚀 Features

- **Cross-Platform**: Runs natively on iOS, Android, and on the Web.
- **Modern UI/UX**: Premium aesthetic with custom gradients, soft shadows, flat minimalistic inputs, and `lucide-react-native` iconography.
- **Authentication Flow**: Includes seamless Onboarding, Login, and OTP Verification mock screens.
- **Interactive Shopping Flow**:
  - Home Dashboard with dynamic banners, quick categories, and a sticky search bar.
  - Interactive Address Management with mock map location picking.
  - Cart and Checkout system with price calculations.
  - Order History and live Order Tracking details.
- **Static Content**: Dedicated pages for Profile management, About Us, Privacy Policy, Terms & Conditions, and Contact Us.
- **Mock Backend**: Entirely self-contained for prototyping with an extensive mock data service (`src/services/mockData.js`) that simulates API calls, user cart persistence, and product catalogs.

## 🛠 Tech Stack

- **Framework**: [React Native](https://reactnative.dev/)
- **Build Tool**: [Expo](https://expo.dev/) (SDK 50+)
- **Navigation**: React Navigation V6 (Stack & Bottom Tabs)
- **Styling**: Vanilla React Native StyleSheet with a central Theme object.
- **Icons**: `lucide-react-native`
- **State Management / Storage**: React Context API & Async Storage

## 📂 Project Structure

```text
src/
├── components/       # Reusable UI components (AppInput, AppButton, Cards)
├── context/          # Context API Providers (AuthContext, CartContext)
├── navigation/       # React Navigation setup (AppNavigator.js)
├── screens/          # All app screens, grouped by feature
│   ├── Home/
│   ├── Cart/
│   ├── Profile/
│   ├── AddressManagement/
│   ├── Static/       # About, Privacy, Terms, Contact
│   └── ...
├── services/         # API logic (Currently holding mockData.js)
└── theme.js          # Centralized design tokens (colors, typography, spacing)
```

## ⚙️ Prerequisites

Before you begin, ensure you have the following installed on your machine:
- [Node.js](https://nodejs.org/en/) (v16 or higher)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [Expo CLI](https://docs.expo.dev/get-started/installation/)

## 📦 Installation & Setup

1. **Clone or Download the Repository:**
   Navigate into your project directory:
   ```bash
   cd "Grocery client"
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   ```

3. **Start the Expo Server:**
   ```bash
   npx expo start
   ```

## 💻 Running the App

After starting the Expo server, you will see a QR code in your terminal. 

- **Run on Web:** Press `w` in the terminal to open the app in your web browser. (Alternatively, run `npm run web`).
- **Run on Android:** Download the "Expo Go" app from the Google Play Store, open it, and scan the terminal QR code.
- **Run on iOS:** Download the "Expo Go" app from the App Store. Open your iPhone camera, point it at the QR code, and click the link to open it in Expo Go.

## 🎨 Customization

To change the primary colors, typography sizes, or global styles, edit the `src/theme.js` file. The entire app relies on these design tokens, so changing the `theme.colors.primary` will instantly re-brand the application.
