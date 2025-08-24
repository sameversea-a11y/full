// utils/fileStorage.ts
interface StoredFile {
  id: string;
  name: string;
  size: number;
  type: string;
  documentTypeId: string;
  tier: string;
  timestamp: string;
  file: Blob;
}

class FileStorageService {
  private dbName = 'udin_files_db';
  private dbVersion = 1;
  private storeName = 'uploaded_files';

  async openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          const objectStore = db.createObjectStore(this.storeName, { keyPath: 'id' });
          // Optional: Create indexes for better querying
          objectStore.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    });
  }

  //@ts-ignore
  async storeFiles(files: UploadedFile[]): Promise<void> {
    const db = await this.openDB();
    const transaction = db.transaction([this.storeName], 'readwrite');
    const store = transaction.objectStore(this.storeName);

    const promises = files.map((fileItem) => {
      const storedFile: StoredFile = {
        id: fileItem.id,
        name: fileItem.name,
        size: fileItem.size,
        type: fileItem.type,
        documentTypeId: fileItem.documentTypeId,
        tier: fileItem.tier,
        timestamp: new Date().toISOString(),
        file: fileItem.file,
      };

      return new Promise<void>((resolve, reject) => {
        const request = store.put(storedFile);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    });

    await Promise.all(promises);
  }

  async getStoredFiles(): Promise<StoredFile[]> {
    const db = await this.openDB();
    const transaction = db.transaction([this.storeName], 'readonly');
    const store = transaction.objectStore(this.storeName);

    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  async getFileById(id: string): Promise<StoredFile | null> {
    const db = await this.openDB();
    const transaction = db.transaction([this.storeName], 'readonly');
    const store = transaction.objectStore(this.storeName);

    return new Promise((resolve, reject) => {
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  async deleteFile(id: string): Promise<void> {
    const db = await this.openDB();
    const transaction = db.transaction([this.storeName], 'readwrite');
    const store = transaction.objectStore(this.storeName);

    return new Promise((resolve, reject) => {
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async clearAllFiles(): Promise<void> {
    const db = await this.openDB();
    const transaction = db.transaction([this.storeName], 'readwrite');
    const store = transaction.objectStore(this.storeName);

    return new Promise((resolve, reject) => {
      const request = store.clear();
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getStorageInfo(): Promise<{ count: number; totalSize: number }> {
    const files = await this.getStoredFiles();
    return {
      count: files.length,
      totalSize: files.reduce((total, file) => total + file.size, 0)
    };
  }
}

export const fileStorage = new FileStorageService();
