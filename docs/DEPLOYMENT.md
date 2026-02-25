# Deployment commands
arkdown
# Deployment Guide

## Build Commands
```bash
# Member Portal
npm run build              # Build to dist/
npm run deploy             # Build + deploy

# Admin Portal  
npm run build:admin        # Build to dist-admin/
npm run deploy:admin       # Build + deploy admin
Firebase Targets
Member Portal: nordicrisercom

Admin Portal: nordicrisercom-admin

Custom Domains
Member: portal.nordicriser.com → nordicrisercom.web.app

Admin: nordicrisercom-admin.web.app (future: admin.nordicriser.com)

text

---

## 📄 **4. Create `docs/04_FIREBASE.md`:**

```markdown
# Firebase Configuration

## Project: nordicrisercom
**Services:**
- ✅ Authentication (Email/Password + verification)
- ✅ Firestore Database
- ✅ Storage (gs://nordicrisercom.firebasestorage.app)
- ✅ Hosting (Multi-site)

## Emulator Setup
```bash
# Install Java JDK 21+ first
firebase init emulators
firebase emulators:start --only auth,storage,hosting

# Access:
# - UI: http://127.0.0.1:4000
# - Auth: http://127.0.0.1:9099
# - Storage: http://127.0.0.1:9199
# - Hosting: http://127.0.0.1:5000
Storage Rules
See: ../storage.rules for current security rules
Path structure: users/{userId}/, cases/{caseId}/, public/

text

---

## 📄 **5. Create `docs/05_API_REFERENCE.md`:**

```markdown
# API & Data Reference

## Firestore Collections
### `users`
- uid, email, firstName, lastName, role (member/admin)
- profileComplete, emailVerified, createdAt

### `documents`
- userId, fileName, storagePath, downloadURL
- fileType, fileSize, category, status
- uploadedAt, reviewedAt, reviewedBy

## Storage Paths
- User files: `users/{userId}/{filename}`
- Case files: `cases/{caseId}/{filename}`
- Templates: `public/{filename}`