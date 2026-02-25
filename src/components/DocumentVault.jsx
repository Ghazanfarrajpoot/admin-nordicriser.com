import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db, storage } from '../firebase/config';
import {
  collection, query, where, onSnapshot,
  deleteDoc, doc, setDoc, serverTimestamp
} from 'firebase/firestore';
import { ref, deleteObject, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/gif',
  'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
const MAX_SIZE_MB = 10;

const DocumentVault = () => {
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [dragOver, setDragOver] = useState(false);

  const user = auth.currentUser;

  // Load files from Firestore in real-time
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'documents'), where('uploadedBy', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(d => ({
        id: d.id,
        ...d.data(),
        uploadedAt: d.data().uploadedAt?.toDate() || null
      }));
      docs.sort((a, b) => (b.uploadedAt || 0) - (a.uploadedAt || 0));
      setFiles(docs);
      setLoading(false);
    }, (err) => {
      setError('Failed to load documents: ' + err.message);
      setLoading(false);
    });
    return unsubscribe;
  }, [user]);

  const validateFile = (file) => {
    if (!file) return 'No file selected';
    if (file.size > MAX_SIZE_MB * 1024 * 1024) return `File must be smaller than ${MAX_SIZE_MB}MB`;
    if (!ALLOWED_TYPES.includes(file.type)) return 'Only PDF, images, and Word documents are allowed';
    return null;
  };

  const handleFileSelect = (file) => {
    const err = validateFile(file);
    if (err) { setError(err); setSelectedFile(null); return; }
    setError('');
    setSelectedFile(file);
  };

  const handleInputChange = (e) => handleFileSelect(e.target.files[0]);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFileSelect(e.dataTransfer.files[0]);
  };

  const handleUpload = async () => {
    if (!selectedFile || !user) return;
    setUploading(true);
    setError('');
    setSuccessMsg('');

    const timestamp = Date.now();
    const safeFileName = selectedFile.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const filePath = `users/${user.uid}/${timestamp}_${safeFileName}`;
    const storageRef = ref(storage, filePath);
    const uploadTask = uploadBytesResumable(storageRef, selectedFile);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        setUploadProgress(Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100));
      },
      (err) => {
        setError('Upload failed: ' + err.message);
        setUploading(false);
        setUploadProgress(0);
      },
      async () => {
        try {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          await setDoc(doc(db, 'documents', `${user.uid}_${timestamp}`), {
            fileName: selectedFile.name,
            storagePath: filePath,
            downloadURL,
            uploadedBy: user.uid,
            uploadedAt: serverTimestamp(),
            fileSize: selectedFile.size,
            mimeType: selectedFile.type,
            visibleTo: [user.uid]
          });
          setSelectedFile(null);
          setUploadProgress(0);
          setSuccessMsg(`"${selectedFile.name}" uploaded successfully!`);
          setTimeout(() => setSuccessMsg(''), 4000);
        } catch (err) {
          setError('Failed to save file metadata: ' + err.message);
        } finally {
          setUploading(false);
        }
      }
    );
  };

  const handleDownload = (file) => {
    const link = document.createElement('a');
    link.href = file.downloadURL;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDelete = async (file) => {
    if (!window.confirm(`Delete "${file.fileName}"? This cannot be undone.`)) return;
    try {
      await deleteObject(ref(storage, file.storagePath));
      await deleteDoc(doc(db, 'documents', file.id));
    } catch (err) {
      setError('Delete failed: ' + err.message);
    }
  };

  const formatSize = (bytes) => {
    if (!bytes) return '—';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getFileIcon = (mimeType) => {
    if (!mimeType) return '📎';
    if (mimeType.includes('pdf')) return '📄';
    if (mimeType.includes('image')) return '🖼️';
    if (mimeType.includes('word') || mimeType.includes('document')) return '📝';
    return '📎';
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Header */}
      <header style={{ background: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '20px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '960px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button
              onClick={() => navigate('/dashboard')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#3b82f6', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', fontWeight: '500' }}
            >
              ← Back to Portal
            </button>
            <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1e3a8a', margin: 0 }}>
              📁 Document Vault
            </h1>
          </div>
          <div style={{ fontSize: '13px', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '6px' }}>
            🔒 Secured by Firebase
          </div>
        </div>
      </header>

      <div style={{ padding: '24px', maxWidth: '960px', margin: '0 auto' }}>
        {/* Upload Area */}
        <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', marginBottom: '16px' }}>Upload Document</h2>

          {error && (
            <div style={{ background: '#fee2e2', border: '1px solid #fecaca', color: '#991b1b', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' }}>
              ⚠️ {error}
            </div>
          )}

          {successMsg && (
            <div style={{ background: '#d1fae5', border: '1px solid #a7f3d0', color: '#065f46', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' }}>
              ✅ {successMsg}
            </div>
          )}

          {/* Drop Zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            style={{
              border: `2px dashed ${dragOver ? '#3b82f6' : '#d1d5db'}`,
              background: dragOver ? '#eff6ff' : '#fafafa',
              borderRadius: '10px',
              padding: '40px',
              textAlign: 'center',
              marginBottom: '16px',
              transition: 'all 0.2s',
              cursor: 'pointer'
            }}
            onClick={() => document.getElementById('file-input').click()}
          >
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>📤</div>
            <p style={{ color: '#374151', fontWeight: '500', marginBottom: '6px' }}>
              Drag & drop a file here, or click to browse
            </p>
            <p style={{ color: '#9ca3af', fontSize: '13px' }}>
              PDF, images, Word docs • Max {MAX_SIZE_MB}MB
            </p>
          </div>

          <input
            id="file-input"
            type="file"
            style={{ display: 'none' }}
            onChange={handleInputChange}
            accept=".pdf,.jpg,.jpeg,.png,.gif,.doc,.docx"
            disabled={uploading}
          />

          {selectedFile && (
            <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '16px' }}>
              <p style={{ color: '#374151', marginBottom: '12px', fontSize: '14px' }}>
                <strong>Selected:</strong> {selectedFile.name}{' '}
                <span style={{ color: '#6b7280' }}>({formatSize(selectedFile.size)})</span>
              </p>

              {uploading && (
                <div style={{ marginBottom: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontSize: '13px', color: '#6b7280' }}>Uploading...</span>
                    <span style={{ fontSize: '13px', fontWeight: '600', color: '#3b82f6' }}>{uploadProgress}%</span>
                  </div>
                  <div style={{ background: '#e5e7eb', borderRadius: '4px', height: '8px', overflow: 'hidden' }}>
                    <div style={{ background: 'linear-gradient(90deg, #3b82f6, #2563eb)', height: '100%', borderRadius: '4px', width: `${uploadProgress}%`, transition: 'width 0.3s' }} />
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={handleUpload}
                  disabled={uploading}
                  style={{ padding: '10px 20px', background: uploading ? '#9ca3af' : 'linear-gradient(135deg, #10b981, #059669)', color: 'white', border: 'none', borderRadius: '8px', cursor: uploading ? 'not-allowed' : 'pointer', fontWeight: '600', fontSize: '14px' }}
                >
                  {uploading ? `Uploading... ${uploadProgress}%` : '⬆️ Upload Now'}
                </button>
                {!uploading && (
                  <button
                    onClick={() => { setSelectedFile(null); setError(''); }}
                    style={{ padding: '10px 16px', background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' }}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Files List */}
        <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', margin: 0 }}>Your Documents</h2>
            <span style={{ background: '#eff6ff', color: '#3b82f6', padding: '4px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: '600' }}>
              {files.length} {files.length === 1 ? 'file' : 'files'}
            </span>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px' }}>
              <div style={{ width: '36px', height: '36px', border: '3px solid #e5e7eb', borderTop: '3px solid #3b82f6', borderRadius: '50%', margin: '0 auto 16px', animation: 'spin 1s linear infinite' }} />
              <p style={{ color: '#9ca3af' }}>Loading documents...</p>
            </div>
          ) : files.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 24px', color: '#9ca3af' }}>
              <div style={{ fontSize: '64px', marginBottom: '16px' }}>📂</div>
              <p style={{ fontSize: '18px', fontWeight: '500', marginBottom: '8px' }}>No documents yet</p>
              <p style={{ fontSize: '14px' }}>Upload your first document using the form above</p>
            </div>
          ) : (
            <div style={{ padding: '12px' }}>
              {files.map(file => (
                <div
                  key={file.id}
                  style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', border: '1px solid #f3f4f6', borderRadius: '8px', marginBottom: '8px', background: 'white', transition: 'border-color 0.2s' }}
                >
                  <div style={{ fontSize: '36px', flexShrink: 0 }}>{getFileIcon(file.mimeType)}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: '600', color: '#1f2937', marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {file.fileName}
                    </p>
                    <p style={{ fontSize: '12px', color: '#9ca3af' }}>
                      {formatSize(file.fileSize)}
                      {file.uploadedAt && ` • ${file.uploadedAt.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}`}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                    <button
                      onClick={() => handleDownload(file)}
                      title="Download"
                      style={{ padding: '8px 16px', background: '#eff6ff', color: '#3b82f6', border: '1px solid #bfdbfe', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      ↓ Download
                    </button>
                    <button
                      onClick={() => handleDelete(file)}
                      title="Delete"
                      style={{ padding: '8px 12px', background: '#fff1f2', color: '#e11d48', border: '1px solid #fecdd3', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <p style={{ textAlign: 'center', fontSize: '12px', color: '#d1d5db', marginTop: '20px' }}>
          🔐 Files stored securely in Firebase Cloud Storage • Encrypted at rest
        </p>
      </div>

      <style>{`
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default DocumentVault;
