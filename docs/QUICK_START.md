# Quick Start Guide

## Development
```bash
npm run dev              # Member portal (localhost:5173)
npm run dev:admin        # Admin portal
firebase emulators:start --only auth,storage
Build & Deploy
bash
npm run deploy           # Deploy member portal
npm run deploy:admin     # Deploy admin portal
firebase deploy --only storage  # Deploy storage rules
URLs
Dev: http://localhost:5173

Emulator UI: http://127.0.0.1:4000

Production: https://portal.nordicriser.com

Key Files
Config: src/firebase/config.js

Rules: storage.rules

Firebase: firebase.json

text

---

## 🎯 **One More Important File:**

Create `docs/PROJECT_STRUCTURE.txt` (pure file list):

```txt
nordic-riser-portal/
├── docs/
│   ├── 01_ARCHITECTURE.md
│   ├── 02_SETUP.md
│   ├── 03_DEPLOYMENT.md
│   ├── 04_FIREBASE.md
│   ├── 05_API_REFERENCE.md
│   ├── 06_TROUBLESHOOTING.md
│   ├── 07_MAINTENANCE.md
│   └── QUICK_START.md
├── src/
│   ├── components/
│   │   ├── DocumentVault.jsx
│   │   ├── DocumentUploader.jsx
│   │   ├── Login.jsx
│   │   ├── AdminLogin.jsx
│   │   ├── ProtectedRoute.jsx
│   │   ├── SecureMessaging.jsx
│   │   ├── PaymentCenter.jsx
│   │   └── CaseTracking.jsx
│   ├── contexts/
│   │   └── AuthContext.jsx
│   ├── firebase/
│   │   └── config.js
│   ├── App.jsx
│   ├── AdminApp.jsx
│   ├── main.jsx
│   ├── admin-main.jsx
│   └── index.css
├── dist/
├── dist-admin/
├── firebase.json
├── .firebaserc
├── storage.rules
├── firestore.rules
├── vite.config.js
├── package.json
├── .env
└── .gitignore