 Nordic Riser AB - Firebase Storage Implementation
**Last Updated:** December 22, 2025  
**Current Status:** Testing Firebase Storage with Emulators

---

## 🎯 PROJECT OVERVIEW

**Company:** Nordic Riser AB  
**Project:** Member Portal & Admin CRM  
**Tech Stack:** React 18 + Vite + Firebase  
**Current Phase:** Implementing Firebase Storage for document uploads

---

## 📁 PROJECT STRUCTURE
nordic-riser-portal/
├── src/
│ ├── components/
│ │ ├── DocumentVault.jsx # Main upload component (USES: users/${uid}/)
│ │ ├── DocumentUploader.jsx # Alternative upload component
│ │ ├── Login.jsx
│ │ ├── AdminLogin.jsx
│ │ ├── ProtectedRoute.jsx
│ │ └── ... (other components)
│ ├── firebase/
│ │ └── config.js # Firebase configuration
│ ├── App.jsx # Member Portal App
│ ├── AdminApp.jsx # Admin Portal App
│ ├── main.jsx # Member entry point
│ └── admin-main.jsx # Admin entry point
├── dist/ # Built Member Portal
├── dist-admin/ # Built Admin Portal
├── firebase.json # Firebase configuration
├── storage.rules # Storage Security Rules
└── .env # Environment variables (VITE_ prefix)

text

---

## 🔧 CURRENT SETUP

### **Firebase Services:**
- ✅ **Authentication:** Live with email verification
- ✅ **Firestore:** Configured (users, documents collections)
- ✅ **Storage:** Configured but uploads failing
- ✅ **Hosting:** Multi-site (Member + Admin portals)

### **Storage Bucket:**
gs://nordicrisercom.firebasestorage.app/
├── documents/ (old structure - causing errors)
└── users/ (new structure - should be used)

text

### **Emulators Running:**
- **Auth:** http://127.0.0.1:9099
- **Storage:** http://127.0.0.1:9199  
- **Hosting:** http://127.0.0.1:5000
- **UI Dashboard:** http://127.0.0.1:4000

---

## ⚠️ CURRENT ISSUES

### **1. Upload Path Mismatch**
**Error:** `Firebase Storage: User does not have permission to access 'documents/{userId}/Personal/...'`

**Root Cause:** 
- Source code uses `users/${userId}/` ✅
- But compiled/built code still has old `documents/` path ❌
- **FIX:** Need to rebuild project to update compiled files

### **2. API Key with Emulators**
**Error:** `400 Bad Request` on sign-in to emulator

**Root Cause:**
- Real API key being sent to emulator
- **FIX:** Use fake API key for emulator mode

### **Updated Firebase Config:**
```javascript
// In src/firebase/config.js
const isEmulator = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const firebaseConfig = isEmulator ? {
  apiKey: "fake-api-key-for-emulator",      // ← FAKE for emulator
  projectId: "demo-nordicrisercom",         // ← Different project ID
  // ... other config
} : {
  apiKey: "AIzaSyAYNbjudJvVReEoJiVspXE8M2OAUvr2pFw",  // ← REAL key
  projectId: "nordicrisercom",
  // ... other config
};
🔄 STORAGE RULES (Current)
File: storage.rules

javascript
rules_version = '2';

function isAdmin() {
  return request.auth != null && (
    request.auth.token.email.matches('.*@nordicriser.com$') ||
    request.auth.token.email in ['admin@nordicriser.com']
  );
}

service firebase.storage {
  match /b/{bucket}/o {
    // User personal files
    match /users/{userId}/{allPaths=**} {
      allow read: if request.auth != null && (request.auth.uid == userId || isAdmin());
      allow write: if request.auth != null && (request.auth.uid == userId || isAdmin());
    }
    
    // Case documents  
    match /cases/{caseId}/{allPaths=**} {
      allow read: if request.auth != null && (
        exists(/databases/$(database)/documents/cases/$(caseId)/participants/$(request.auth.uid)) ||
        isAdmin()
      );
      allow write: if request.auth != null && (
        isAdmin() ||
        get(/databases/$(database)/documents/cases/$(caseId)).data.ownerId == request.auth.uid
      );
    }
    
    // Public templates
    match /public/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if isAdmin();
    }
  }
}
🚀 NEXT STEPS REQUIRED
Immediate Actions:
Rebuild project to update compiled code in dist/

bash
npm run build
Test with Vite dev server (bypasses Firebase Hosting cache)

bash
npm run dev                    # Runs on localhost:5173
firebase emulators:start --only auth,storage
Clear ALL browser cache completely

Testing Sequence:
Access: http://localhost:5173

Sign in with test user (create in emulator UI: http://127.0.0.1:4000/auth)

Test file upload in Document Vault

Check console for debug logs

Expected Success Path:
text
User upload → users/{uid}/{filename} → Storage rules allow → Upload succeeds
📝 COMMANDS REFERENCE
bash
# Development
npm run dev              # Vite dev server (localhost:5173)
npm run dev:admin        # Admin dev server

# Building  
npm run build            # Build member portal → dist/
npm run build:admin      # Build admin portal → dist-admin/

# Firebase Emulators
firebase emulators:start --only auth,storage,hosting
firebase emulators:start --only auth,storage  # For Vite dev server

# Deployment
npm run deploy           # Deploy member portal
npm run deploy:admin     # Deploy admin portal
🔗 IMPORTANT URLs
Local Development:
Vite Dev Server: http://localhost:5173

Firebase Hosting: http://127.0.0.1:5000

Emulator UI: http://127.0.0.1:4000

Auth Emulator: http://127.0.0.1:4000/auth

Storage Emulator: http://127.0.0.1:4000/storage

Production:
Member Portal: https://portal.nordicriser.com

Admin Portal: https://nordicrisercom-admin.web.app

Public Website: https://nordicriser.com

🐛 KNOWN ISSUES & SOLUTIONS
Issue 1: "documents/" path in compiled code
Solution: Rebuild with npm run build

Issue 2: API key error with emulators
Solution: Use fake API key in emulator mode (already fixed in config.js)

Issue 3: Browser cache loading old files
Solution:

Hard refresh: Ctrl+Shift+R

Clear site data in DevTools → Application → Clear storage

Issue 4: Storage rules not applying
Solution:

Deploy rules: firebase deploy --only storage

Test in emulator UI: http://127.0.0.1:4000/storage

✅ SUCCESS CRITERIA
User can upload file to users/{userId}/ path

Storage rules correctly enforce permissions

File appears in Storage emulator UI

Firestore document record created with metadata

User can download uploaded file

Admin can access user files

Rules prevent unauthorized access

📞 CONTEXT FOR NEXT CHAT
When continuing, reference:

"Testing Firebase Storage uploads with emulators"

"Just fixed API key issue for emulators"

"Need to test upload path: users/{userId}/ vs documents/{userId}/"

"Using Vite dev server on localhost:5173 with auth/storage emulators"

text

---

**Save this file as `PROJECT_REFERENCE.md` in your project root.** This will help you (and me) remember exactly where we are in the next chat session.

