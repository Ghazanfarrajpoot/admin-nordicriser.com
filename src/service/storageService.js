// src/services/storageService.js
import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject,
  listAll,
  getMetadata,
  updateMetadata,
  uploadBytesResumable
} from 'firebase/storage';
import { storage } from '../firebase/config';

class StorageService {
  constructor() {
    this.storage = storage;
  }

  async uploadFile(file, path, metadata = {}, onProgress = null) {
    try {
      const storageRef = ref(this.storage, path);
      const uploadTask = uploadBytesResumable(storageRef, file, metadata);
      
      return new Promise((resolve, reject) => {
        uploadTask.on('state_changed',
          (snapshot) => {
            if (onProgress) {
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              onProgress(progress);
            }
          },
          (error) => {
            reject(error);
          },
          async () => {
            try {
              const snapshot = await uploadTask;
              const downloadURL = await getDownloadURL(snapshot.ref);
              resolve({
                success: true,
                downloadURL,
                metadata: snapshot.metadata,
                ref: snapshot.ref
              });
            } catch (error) {
              reject(error);
            }
          }
        );
      });
    } catch (error) {
      console.error('Upload setup error:', error);
      throw error;
    }
  }

  async deleteFile(path) {
    try {
      const storageRef = ref(this.storage, path);
      await deleteObject(storageRef);
      return { success: true };
    } catch (error) {
      console.error('Delete error:', error);
      throw error;
    }
  }

  async listFiles(path) {
    try {
      const storageRef = ref(this.storage, path);
      const result = await listAll(storageRef);
      
      const files = await Promise.all(
        result.items.map(async (itemRef) => {
          try {
            const url = await getDownloadURL(itemRef);
            const meta = await getMetadata(itemRef);
            return {
              name: itemRef.name,
              fullPath: itemRef.fullPath,
              url,
              metadata: meta,
              size: meta.size,
              contentType: meta.contentType,
              updated: meta.updated
            };
          } catch (error) {
            console.warn(`Failed to get metadata for ${itemRef.name}:`, error);
            return {
              name: itemRef.name,
              fullPath: itemRef.fullPath,
              url: null,
              metadata: null,
              size: 0,
              contentType: null,
              updated: null
            };
          }
        })
      );
      
      return {
        files: files.filter(f => f !== null),
        prefixes: result.prefixes
      };
    } catch (error) {
      // If folder doesn't exist, return empty
      if (error.code === 'storage/object-not-found') {
        return { files: [], prefixes: [] };
      }
      console.error('List files error:', error);
      throw error;
    }
  }

  async downloadFile(path) {
    try {
      const storageRef = ref(this.storage, path);
      const url = await getDownloadURL(storageRef);
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to download file');
      return await response.blob();
    } catch (error) {
      console.error('Download error:', error);
      throw error;
    }
  }
}

export default new StorageService();