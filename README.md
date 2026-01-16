# 🎬 IMDb Movie App

A sleek, Netflix-inspired mobile application for discovering movies and TV shows using the IMDb API.

![React Native](https://img.shields.io/badge/React_Native-0.79.2-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript)
![Platform](https://img.shields.io/badge/Platform-iOS%20%7C%20Android-lightgrey)

## ✨ Features

| Feature | Description |
|---------|-------------|
| **Top 250 Movies** | Browse the highest-rated movies on IMDb |
| **Smart Search** | Find movies and TV shows with autocomplete |
| **Categories** | Explore Popular, Top Rated, and Box Office hits |
| **Favorites** | Save movies to your personal watchlist |
| **Movie Details** | View full cast, crew, ratings, and plot info |
| **Dark Theme** | Beautiful Netflix-style dark interface |

## 🛠 Tech Stack

- **Framework:** React Native 0.79.2
- **Language:** TypeScript
- **Navigation:** React Navigation 7
- **State Management:** Zustand
- **HTTP Client:** Axios
- **Storage:** AsyncStorage

### Installation

```bash
# Clone the repository
git clone https://github.com/apps-cmyk/app_rd_13_p_1.git

# Navigate to project
cd app_rd_13_p_1

# Install dependencies
npm install

# Install iOS pods
cd ios && pod install && cd ..
```

### Running the App

```bash
# Start Metro bundler
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android
```

## 📁 Project Structure

```
src/
├── components/     # Reusable UI components
├── screens/        # App screens (12 screens)
├── navigation/     # Tab & Stack navigators
├── hooks/          # Custom React hooks
├── services/       # API services
├── storage/        # AsyncStorage utilities
├── theme/          # Colors, typography, spacing
├── types/          # TypeScript definitions
└── utils/          # Helper functions
```

## 🎨 Design System

| Color | Hex | Usage |
|-------|-----|-------|
| Background | `#000000` | Main background |
| Surface | `#2C2C2E` | Cards & containers |
| Primary | `#E10101` | Buttons & accents |
| Text | `#FFFFFF` | Primary text |