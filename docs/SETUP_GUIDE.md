# Setup instructions
# Development Setup

## Prerequisites
- Node.js 18+
- Java JDK 21+ (for Firebase emulators)
- Firebase CLI
- Git

## Installation
1. Clone repository
2. `npm install`
3. Copy `.env.example` to `.env` and configure
4. `firebase login`
5. `firebase use nordicrisercom`

## Environment Variables
Create `.env` file:
VITE_FIREBASE_API_KEY=your_key_here
VITE_FIREBASE_AUTH_DOMAIN=nordicrisercom.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=nordicrisercom
VITE_FIREBASE_STORAGE_BUCKET=nordicrisercom.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=648135525212
VITE_FIREBASE_APP_ID=1:648135525212:web:336ad5c5389e72f61c7799