# Weight Loss Tracker

A mobile-first weight loss tracking application with a clean iOS-inspired design. Now available as a Progressive Web App (PWA)!

## Project Structure

```
log-daily-weight/
├── index.html          # Main entry point
├── manifest.json       # PWA manifest
├── sw.js              # Service worker for offline support
├── css/
│   └── styles.css      # Custom styles
├── js/
│   └── app.js          # Application logic
├── assets/             # Static assets (icons, images)
│   └── icon-*.png      # PWA icons (various sizes)
└── README.md           # This file
```

## Features

- **Dashboard**: View current weight, BMI, goal progress, and weekly trend
- **Log Weight**: Track daily weight with mood and notes
- **Insights**: View weekly averages and monthly changes with detailed charts
- **History**: Browse all weight logs with dates and notes
- **Settings**: Configure goal weight and height
- **Progressive Web App (PWA)**: Install on your device for app-like experience
- **Offline Support**: Works without internet connection
- **Haptic Feedback**: Vibration feedback when logging weight

## Technologies

- HTML5
- CSS3 (Tailwind CSS)
- Vanilla JavaScript
- Chart.js for data visualization
- LocalStorage for data persistence
- Service Worker for offline functionality
- Web App Manifest for PWA support

## Usage

### Web Browser
Simply open `index.html` in a web browser. The app works offline and stores all data locally in your browser's localStorage.

### Install as PWA

**On Mobile (Android/iPhone):**
1. Open the app in your mobile browser
2. Look for "Add to Home Screen" or "Install App" prompt
3. Tap to install
4. The app will appear on your home screen like a native app

**On Desktop (Chrome/Edge):**
1. Open the app in Chrome or Edge
2. Click the install icon in the address bar
3. Or go to Menu → Install App
4. The app will open in its own window

## PWA Features

- ✅ Installable on mobile and desktop
- ✅ Works offline (service worker caches resources)
- ✅ App-like experience (standalone display mode)
- ✅ Fast loading (cached resources)
- ✅ White browser navigation bar
- ✅ Custom app icons
- ✅ Haptic feedback for better UX

## Browser Support

Works on all modern browsers with localStorage and service worker support:
- Chrome/Edge (Desktop & Mobile)
- Safari (iOS 11.3+)
- Firefox (Mobile)
- Samsung Internet

## Development

To regenerate app icons, open `generate-icons.html` in a browser and download the generated icons.

