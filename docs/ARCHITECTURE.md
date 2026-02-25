# High-level architecture
# Architecture Overview

## System Architecture
- **Public Website:** Static HTML/CSS/JS on GitHub Pages
- **Member Portal:** React SPA on Firebase Hosting
- **Admin Portal:** React SPA on Firebase Hosting (separate build)
- **Backend:** Firebase Services (Auth, Firestore, Storage)

## Tech Stack
- **Frontend:** React 18, Vite, CSS3
- **Backend:** Firebase (Auth, Firestore, Storage, Hosting)
- **Build Tool:** Vite with multi-configuration
- **Hosting:** Firebase Hosting (multi-site)

## Data Flow
User → React App → Firebase Auth → Firestore/Storage → User

Frontend (Vite + React) → Firebase Emulators → Local Storage/Firestore
    ↓
DocumentVault.jsx (Component)
    ├── handleUpload() - Storage uploads WORKING ✅
    ├── handleDownload() - File downloads WORKING ✅
    ├── handleDelete() - File deletion READY ✅
    ├── fetchDocumentsFromFirestore() - Implemented 🔄
    └── UI Components - Complete ✅