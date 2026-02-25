# Firestore Database Schema - Nordic Riser

## Collection: `documents`

### Document Structure:
```javascript
{
  // Identification
  "userId": "string",           // Firebase Auth UID
  "userEmail": "string",        // User email for display
  
  // File Information  
  "fileName": "string",         // Original filename
  "originalName": "string",     // Original filename (backup)
  "storagePath": "string",      // gs://... path
  "downloadURL": "string",      // Public download URL
  "fileType": "string",         // MIME type
  "fileSize": "number",         // Bytes
  "fileExtension": "string",    // pdf, jpg, docx
  
  // Categorization
  "category": "string",         // identity, financial, legal, business, other
  "tags": ["array", "of", "strings"], // Optional tags
  
  // Status Tracking
  "status": "string",           // pending, approved, rejected, archived
  "uploadedAt": "timestamp",
  "updatedAt": "timestamp",
  
  // Processing Metadata
  "isProcessed": "boolean",
  "processedAt": "timestamp|null",
  "processedBy": "string|null", // Admin email who processed
  
  // Access Control
  "visibility": "string",       // private, shared, public
  "sharedWith": ["array"],      // User IDs/emails with access
  
  // Business Context
  "caseId": "string|null",      // Linked immigration case
  "serviceType": "string|null", // visa, business_registration, etc.
  
  // Review System
  "reviewedBy": "string|null",
  "reviewedAt": "timestamp|null",
  "reviewStatus": "string",     // pending, reviewed, approved
  "reviewerComments": "string",
  
  // Security
  "isEncrypted": "boolean",
  "checksum": "string|null"     // File integrity hash
}