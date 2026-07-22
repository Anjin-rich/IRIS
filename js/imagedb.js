// ============================================================
//  IMAGE STORAGE — IndexedDB + Canvas Compression
// ============================================================
const ImageDB = {
    DB_NAME: 'IrisImages',
    DB_VERSION: 1,
    STORE: 'images',
    db: null,

    async init() {
        if (typeof indexedDB === 'undefined') {
            console.warn('IndexedDB not available, images stored inline');
            return false;
        }
        return new Promise((resolve, reject) => {
            const req = indexedDB.open(this.DB_NAME, this.DB_VERSION);
            req.onupgradeneeded = e => {
                const db = e.target.result;
                if (!db.objectStoreNames.contains(this.STORE)) {
                    db.createObjectStore(this.STORE);
                }
            };
            req.onsuccess = e => { this.db = e.target.result; resolve(true); };
            req.onerror = () => { console.warn('IndexedDB open failed'); resolve(false); };
        });
    },

    async save(id, base64Data) {
        if (!this.db) return false;
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction(this.STORE, 'readwrite');
            tx.objectStore(this.STORE).put(base64Data, id);
            tx.oncomplete = () => resolve(true);
            tx.onerror = () => resolve(false);
        });
    },

    async get(id) {
        if (!this.db) return null;
        return new Promise((resolve) => {
            const tx = this.db.transaction(this.STORE, 'readonly');
            const req = tx.objectStore(this.STORE).get(id);
            req.onsuccess = () => resolve(req.result || null);
            req.onerror = () => resolve(null);
        });
    },

    async getBatch(ids) {
        if (!this.db || !ids || ids.length === 0) return [];
        return Promise.all(ids.map(id => this.get(id)));
    },

    async remove(id) {
        if (!this.db) return;
        return new Promise((resolve) => {
            const tx = this.db.transaction(this.STORE, 'readwrite');
            tx.objectStore(this.STORE).delete(id);
            tx.oncomplete = () => resolve();
            tx.onerror = () => resolve();
        });
    },

    async removeBatch(ids) {
        if (!ids || ids.length === 0) return;
        return Promise.all(ids.map(id => this.remove(id)));
    },

    genId() {
        return 'img_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7);
    }
};

// ============================================================
//  Canvas Compression (shared utility)
// ============================================================
function compressImage(file, maxSizeKB = 200) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = function (e) {
            const img = new Image();
            img.onload = function () {
                let width = img.width, height = img.height;
                const maxDim = 1200;
                if (width > maxDim || height > maxDim) {
                    const ratio = Math.min(maxDim / width, maxDim / height);
                    width = Math.round(width * ratio);
                    height = Math.round(height * ratio);
                }
                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                let quality = 0.85;
                let dataUrl;
                let size = Infinity;
                while (size > maxSizeKB * 1024 && quality > 0.1) {
                    dataUrl = canvas.toDataURL('image/jpeg', quality);
                    size = dataUrl.length * 3 / 4;
                    quality -= 0.05;
                }
                resolve(dataUrl);
            };
            img.onerror = reject;
            img.src = e.target.result;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// ============================================================
//  MIGRATION — move existing base64 images from state → IndexedDB
// ============================================================
async function migrateImagesToIndexedDB() {
    if (!await ImageDB.init()) return;

    const migrated = localStorage.getItem('IrisImageMigrated');
    if (migrated === '1') return;

    let changed = false;
    let count = 0;

    if (state.diaries) {
        for (const entry of state.diaries) {
            if (entry.images && entry.images.length > 0) {
                const newIds = [];
                for (const imgData of entry.images) {
                    if (typeof imgData === 'string' && imgData.startsWith('data:')) {
                        const id = ImageDB.genId();
                        await ImageDB.save(id, imgData);
                        newIds.push(id);
                        count++;
                    } else {
                        newIds.push(imgData);
                    }
                }
                entry.images = newIds;
                changed = true;
            }
        }
    }

    if (state.books) {
        for (const book of state.books) {
            if (book.cover && book.cover.startsWith('data:')) {
                const id = ImageDB.genId();
                await ImageDB.save(id, book.cover);
                book.imageId = id;
                delete book.cover;
                changed = true;
                count++;
            }
        }
    }

    if (state.avatar && state.avatar.startsWith('data:')) {
        const id = ImageDB.genId();
        await ImageDB.save(id, state.avatar);
        state.avatarId = id;
        delete state.avatar;
        changed = true;
        count++;
    }

    localStorage.setItem('IrisImageMigrated', '1');
    if (changed) {
        saveState();
        console.log(`ImageDB: migrated ${count} images to IndexedDB`);
    }
}

// ============================================================
//  CLEANUP — delete images from IndexedDB when data is removed
// ============================================================
async function cleanupDiaryImages(entry) {
    if (entry && entry.images && entry.images.length > 0) {
        await ImageDB.removeBatch(entry.images);
    }
}

async function cleanupBookImage(book) {
    if (book && book.imageId) {
        await ImageDB.remove(book.imageId);
    }
}
