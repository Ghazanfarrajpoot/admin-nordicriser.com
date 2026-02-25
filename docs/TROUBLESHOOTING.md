# Common issues
markdown
# Troubleshooting Guide

## Common Issues

### 1. Java Error with Emulators
**Error:** "Could not spawn `java -version`"
**Fix:** Install Java JDK 21+ and add to PATH

### 2. API Key Invalid
**Error:** "auth/invalid-api-key"
**Fix:** Use fake API key for emulators in `config.js`

### 3. Storage Permission Denied
**Error:** "storage/unauthorized"
**Fix:** Ensure path uses `users/` not `documents/`

### 4. Build Cache Issues
```bash
# Clean rebuild
rmdir /s /q dist dist-admin
npm run build
Emulator Ports
Auth: 9099

Storage: 9199

Hosting: 5000

UI: 4000

text

---

## 📄 **7. Create `docs/07_MAINTENANCE.md`:**

```markdown
# Maintenance Checklist

## Weekly
- [ ] Test all portal URLs
- [ ] Check Firebase Console for errors
- [ ] Verify custom domains resolve

## Monthly
- [ ] Update npm dependencies
- [ ] Backup configuration files
- [ ] Test deployment process

## Quarterly
- [ ] Security audit
- [ ] Review Firebase costs
- [ ] Update documentation