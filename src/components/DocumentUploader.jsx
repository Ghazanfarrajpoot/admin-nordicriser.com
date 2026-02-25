import { useState } from 'react';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase/config';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';

const DocumentUploader = ({ userId, caseId = null }) => {
  const [file, setFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = (e) => {
    const selected = e.target.files[0];
    if (selected && selected.size < 10 * 1024 * 1024) { // 10MB limit
      setFile(selected);
    } else {
      alert('File must be less than 10MB');
    }
  };

  const handleUpload = async () => {
    if (!file || !userId) return;

    setUploading(true);
    
    // Create unique filename
    const timestamp = Date.now();
    const safeFileName = file.name.replace(/[^a-zA-Z0-9.]/g, '_');
    const filePath = caseId 
      ? `cases/${caseId}/${timestamp}_${safeFileName}`
      : `users/${userId}/${timestamp}_${safeFileName}`;

    console.log('📤 Uploading to path:', filePath);
    console.log('Expected: users/..., Actual:', filePath.includes('documents/') ? 'WRONG' : 'CORRECT');
    
    const storageRef = ref(storage, filePath);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadProgress(Math.round(progress));
      },
      (error) => {
        console.error('Upload failed:', error);
        alert(`Upload failed: ${error.message}`);
        setUploading(false);
      },
      async () => {
        // Upload completed
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        
        // Save metadata to Firestore
        await setDoc(doc(db, 'documents', `${userId}_${timestamp}`), {
          fileName: file.name,
          storagePath: filePath,
          downloadURL,
          uploadedBy: userId,
          uploadedAt: serverTimestamp(),
          fileSize: file.size,
          mimeType: file.type,
          caseId: caseId || null,
          visibleTo: caseId ? [userId, 'admin'] : [userId]
        });

        alert('Document uploaded successfully!');
        setFile(null);
        setUploadProgress(0);
        setUploading(false);
      }
    );
  };

  return (
    <div className="document-uploader">
      <h3>Upload Document</h3>
      <input
        type="file"
        onChange={handleFileSelect}
        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
        disabled={uploading}
      />
      
      {file && (
        <div>
          <p>Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)</p>
          <button onClick={handleUpload} disabled={uploading}>
            {uploading ? `Uploading... ${uploadProgress}%` : 'Upload Now'}
          </button>
          
          {uploadProgress > 0 && (
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          )}
        </div>
      )}
      
      <p className="help-text">
        Allowed: PDF, Images, Word docs (Max 10MB)
      </p>
    </div>
  );
};

export default DocumentUploader;