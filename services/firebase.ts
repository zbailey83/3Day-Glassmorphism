import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, updateDoc, increment, serverTimestamp, arrayRemove, arrayUnion, documentId, enableIndexedDbPersistence, CACHE_SIZE_UNLIMITED } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';
import { UserProfile } from '../types';

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

console.log("Firebase Config Loaded:", {
    projectId: firebaseConfig.projectId,
    authDomain: firebaseConfig.authDomain,
    apiKeyLength: firebaseConfig.apiKey?.length
});

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
export const storage = getStorage(app);
export const analytics = getAnalytics(app);

// Enable offline persistence for Firestore
enableIndexedDbPersistence(db, {
    cacheSizeBytes: CACHE_SIZE_UNLIMITED
}).catch((err) => {
    if (err.code === 'failed-precondition') {
        console.warn('Firestore persistence failed: Multiple tabs open');
    } else if (err.code === 'unimplemented') {
        console.warn('Firestore persistence not available in this browser');
    } else {
        console.error('Firestore persistence error:', err);
    }
});

// Wait for Firestore to connect
import { waitForPendingWrites, onSnapshot } from 'firebase/firestore';

let firestoreReady = false;
const firestoreReadyPromise = new Promise<void>((resolve) => {
    // Test connection by listening to a dummy document
    const testRef = doc(db, '_connection_test_', 'test');
    const unsubscribe = onSnapshot(testRef,
        () => {
            if (!firestoreReady) {
                firestoreReady = true;
                console.log('✅ Firestore connected and ready');
                resolve();
            }
            unsubscribe();
        },
        (error) => {
            console.error('❌ Firestore connection test failed:', error);
            // Resolve anyway after a timeout to prevent hanging
            setTimeout(() => {
                console.warn('⚠️ Firestore connection timeout - proceeding anyway');
                firestoreReady = true;
                resolve();
            }, 3000);
            unsubscribe();
        }
    );
});

console.log('Firestore initialized with offline persistence');

// Export connection status checker and promise
export const isFirestoreReady = () => firestoreReady;
export const waitForFirestore = () => firestoreReadyPromise;

// Helper to create/update user profile on login
export const syncUserProfile = async (user: any, retries = 3) => {
    if (!user) return;

    // Wait for Firestore to be ready before attempting operations
    await waitForFirestore();
    console.log('[Firebase] Firestore ready, syncing user profile...');

    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            const userRef = doc(db, 'users', user.uid);
            const userSnap = await getDoc(userRef);

            if (!userSnap.exists()) {
                // New user - create full profile
                const newProfile: UserProfile = {
                    uid: user.uid,
                    email: user.email,
                    displayName: user.displayName,
                    photoURL: user.photoURL,
                    xp: 0,
                    level: 1,
                    streakDays: 1,
                    lastLogin: serverTimestamp(),
                    unlockedAchievements: [],
                    enrolledCourses: [],
                    courseProgress: [],
                    savedProjects: [],
                    likedProjects: []
                };
                await setDoc(userRef, newProfile);
                console.log('[Firebase] ✅ Created new user profile with gamification fields');
                return; // Success
            } else {
                // Existing user - check if gamification fields exist and initialize if missing
                const userData = userSnap.data() as UserProfile;
                const updates: any = {
                    lastLogin: serverTimestamp()
                };

                // Initialize missing gamification fields for existing users
                if (userData.xp === undefined) {
                    updates.xp = 0;
                    console.log('[Firebase] Initializing XP field for existing user');
                }
                if (userData.level === undefined) {
                    updates.level = 1;
                    console.log('[Firebase] Initializing level field for existing user');
                }
                if (userData.unlockedAchievements === undefined) {
                    updates.unlockedAchievements = [];
                    console.log('[Firebase] Initializing unlockedAchievements field for existing user');
                }
                if (userData.streakDays === undefined) {
                    updates.streakDays = 1;
                    console.log('[Firebase] Initializing streakDays field for existing user');
                }

                await updateDoc(userRef, updates);

                if (Object.keys(updates).length > 1) { // More than just lastLogin
                    console.log('[Firebase] ✅ Updated existing user profile with missing gamification fields');
                } else {
                    console.log('[Firebase] ✅ User profile synced');
                }
                return; // Success
            }
        } catch (error: any) {
            console.error(`[Firebase] Profile sync attempt ${attempt}/${retries} failed:`, error);

            if (attempt < retries) {
                // Wait before retrying (exponential backoff)
                const delay = 1000 * attempt;
                console.log(`[Firebase] Retrying in ${delay}ms...`);
                await new Promise(resolve => setTimeout(resolve, delay));
            } else {
                // All retries failed
                console.error('[Firebase] ❌ Profile sync failed after all retries');
                throw error;
            }
        }
    }
};

export const addXP = async (uid: string, amount: number) => {
    try {
        const userRef = doc(db, 'users', uid);
        await updateDoc(userRef, {
            xp: increment(amount)
        });
        console.log(`Added ${amount} XP to user ${uid}`);
    } catch (error) {
        console.error("Error adding XP:", error);
        // Don't rethrow, let it fail silently but logged
    }
};

import { ref, uploadBytes, getDownloadURL, uploadBytesResumable } from 'firebase/storage';
import { collection, addDoc, query, where, getDocs, orderBy } from 'firebase/firestore';
import { GalleryItem } from '../types';

// Upload error types
export enum UploadErrorType {
    CORS = 'CORS',
    NETWORK = 'NETWORK',
    TIMEOUT = 'TIMEOUT',
    PERMISSION = 'PERMISSION',
    UNKNOWN = 'UNKNOWN'
}

export interface UploadError {
    type: UploadErrorType;
    message: string;
    actionableSteps: string;
    originalError?: any;
}

const createUploadError = (type: UploadErrorType, message: string, actionableSteps: string, originalError?: any): UploadError => {
    return { type, message, actionableSteps, originalError };
};

export const uploadFile = async (file: File, path: string, onProgress?: (progress: number) => void) => {
    return new Promise<string>((resolve, reject) => {
        console.log(`[Upload] Starting upload to ${path} (${file.size} bytes)...`);
        const storageRef = ref(storage, path);

        // Use resumable upload for better state tracking
        const uploadTask = uploadBytesResumable(storageRef, file);
        let uploadStarted = false;
        let isResolved = false;

        // Helper to safely resolve/reject only once
        const safeResolve = (url: string) => {
            if (!isResolved) {
                isResolved = true;
                clearTimeout(timeoutId);
                resolve(url);
            }
        };

        const safeReject = (error: UploadError) => {
            if (!isResolved) {
                isResolved = true;
                clearTimeout(timeoutId);
                reject(error);
            }
        };

        // Timeout watchdog
        const timeoutId = setTimeout(() => {
            console.error("[Upload] Timeout triggered. Started:", uploadStarted);
            uploadTask.cancel();
            if (!uploadStarted) {
                safeReject(createUploadError(
                    UploadErrorType.CORS,
                    "Upload failed to start. This is likely a CORS issue.",
                    "Please configure CORS on Firebase Storage by running: gsutil cors set cors.json gs://<your-bucket>. See SETUP.md for detailed instructions."
                ));
            } else {
                safeReject(createUploadError(
                    UploadErrorType.TIMEOUT,
                    "Upload timed out after 60 seconds.",
                    "Please try uploading a smaller file or check your internet connection and try again."
                ));
            }
        }, 60000); // 60s

        uploadTask.on('state_changed',
            (snapshot) => {
                uploadStarted = true;
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                console.log(`[Upload] Progress: ${progress.toFixed(1)}%`);

                // Call progress callback if provided
                if (onProgress) {
                    onProgress(progress);
                }
            },
            (error) => {
                console.error("[Upload] Error:", error.code, error.message);

                // Categorize the error
                let uploadError: UploadError;

                if (error.code === 'storage/unauthorized') {
                    uploadError = createUploadError(
                        UploadErrorType.PERMISSION,
                        "Permission denied. You don't have access to upload files.",
                        "Please check Firebase Security Rules or try logging out and back in. Contact support if the issue persists.",
                        error
                    );
                } else if (error.code === 'storage/canceled') {
                    uploadError = createUploadError(
                        UploadErrorType.NETWORK,
                        "Upload was canceled.",
                        "Please try uploading again.",
                        error
                    );
                } else if (error.code === 'storage/unknown' || error.message?.includes('network')) {
                    uploadError = createUploadError(
                        UploadErrorType.NETWORK,
                        "Upload failed due to network issues.",
                        "Please check your internet connection and try again.",
                        error
                    );
                } else {
                    uploadError = createUploadError(
                        UploadErrorType.UNKNOWN,
                        `Upload failed: ${error.message}`,
                        "Please try again. If the problem persists, contact support.",
                        error
                    );
                }

                safeReject(uploadError);
            },
            async () => {
                console.log("[Upload] Upload complete, getting download URL...");
                try {
                    // Add timeout for getDownloadURL
                    const downloadURLPromise = getDownloadURL(uploadTask.snapshot.ref);
                    const urlTimeout = new Promise<never>((_, rej) =>
                        setTimeout(() => rej(new Error('getDownloadURL timed out after 15 seconds')), 15000)
                    );

                    const downloadURL = await Promise.race([downloadURLPromise, urlTimeout]);
                    console.log("[Upload] File available at", downloadURL);
                    safeResolve(downloadURL);
                } catch (e: any) {
                    console.error("[Upload] Failed to get download URL:", e);
                    safeReject(createUploadError(
                        UploadErrorType.UNKNOWN,
                        `Upload completed but failed to get download URL: ${e.message || e}`,
                        "Please try again or contact support.",
                        e
                    ));
                }
            }
        );
    });
};

export const createGalleryItem = async (item: Omit<GalleryItem, 'id'>) => {
    console.log("Creating gallery item:", item);
    try {
        const docRef = await addDoc(collection(db, 'gallery'), item);
        console.log("Gallery item created with ID:", docRef.id);

        // Award XP for project upload
        try {
            const { uploadProject } = await import('./xpService');
            await uploadProject(item.userId, docRef.id);
        } catch (xpError) {
            console.error("Error awarding XP for project upload:", xpError);
            // Don't throw - XP award failure shouldn't break the upload
        }

        return { id: docRef.id, ...item };
    } catch (error) {
        console.error("Error creating gallery item:", error);
        throw error;
    }
};

export const getUserGallery = async (userId: string) => {
    const q = query(
        collection(db, 'gallery'),
        where('userId', '==', userId),
        orderBy('submittedAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as GalleryItem));
};

export const getProjectsByIds = async (ids: string[]) => {
    if (!ids || ids.length === 0) return [];

    // Firestore 'in' has a limit of 10-30, so for production app needs chunking
    // For now we'll slice to 10
    const chunks = [];
    for (let i = 0; i < ids.length; i += 10) {
        chunks.push(ids.slice(i, i + 10));
    }

    let results: GalleryItem[] = [];

    for (const chunk of chunks) {
        const q = query(
            collection(db, 'gallery'),
            where(documentId(), 'in', chunk)
        );
        const querySnapshot = await getDocs(q);
        const docs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as GalleryItem));
        results = [...results, ...docs];
    }

    return results;
};

export const updateUserProfile = async (uid: string, data: Partial<UserProfile>) => {
    const userRef = doc(db, 'users', uid);

    // Safety: Remove undefined fields which strictly crash Firestore
    const cleanData: Record<string, any> = {};

    Object.keys(data).forEach(key => {
        const val = (data as any)[key];
        if (val !== undefined) {
            cleanData[key] = val;
        }
    });

    console.log("Updating user profile:", uid, cleanData);

    try {
        await updateDoc(userRef, cleanData);
    } catch (error: any) {
        console.error("Firestore Update Error:", error);
        if (error.code === 'permission-denied') {
            throw new Error("Permission Denied: Check your Firestore Security Rules in Firebase Console.");
        }
        throw error;
    }
};

export const toggleProjectLike = async (userId: string, projectId: string, isLiked: boolean) => {
    const userRef = doc(db, 'users', userId);
    const projectRef = doc(db, 'gallery', projectId);

    if (isLiked) {
        // Unlike
        await updateDoc(userRef, {
            likedProjects: arrayRemove(projectId)
        });
        await updateDoc(projectRef, {
            likes: increment(-1)
        });
    } else {
        // Like
        await updateDoc(userRef, {
            likedProjects: arrayUnion(projectId)
        });
        await updateDoc(projectRef, {
            likes: increment(1)
        });

        // Award XP to the project owner for receiving a like
        try {
            // Get the project to find the owner
            const projectSnap = await getDoc(projectRef);
            if (projectSnap.exists()) {
                const projectData = projectSnap.data() as GalleryItem;
                const projectOwnerId = projectData.userId;

                // Don't award XP if user likes their own project
                if (projectOwnerId !== userId) {
                    const { receiveProjectLike } = await import('./xpService');
                    await receiveProjectLike(projectOwnerId, projectId);
                }
            }
        } catch (xpError) {
            console.error("Error awarding XP for project like:", xpError);
            // Don't throw - XP award failure shouldn't break the like
        }
    }
};

export const toggleProjectSave = async (userId: string, projectId: string, isSaved: boolean) => {
    const userRef = doc(db, 'users', userId);

    if (isSaved) {
        await updateDoc(userRef, {
            savedProjects: arrayRemove(projectId)
        });
    } else {
        await updateDoc(userRef, {
            savedProjects: arrayUnion(projectId)
        });
    }
};

export const enrollCourse = async (userId: string, courseId: string) => {
    const userRef = doc(db, 'users', userId);

    // Create looking initial progress
    const newProgress = {
        courseId,
        completedModules: [],
        lastPlayed: new Date()
    };

    await updateDoc(userRef, {
        enrolledCourses: arrayUnion(courseId),
        courseProgress: arrayUnion(newProgress)
    });
};

export const updateModuleProgress = async (userId: string, courseId: string, moduleId: string) => {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
        const data = userSnap.data() as UserProfile;
        const progressList = data.courseProgress || [];

        const existingIndex = progressList.findIndex(p => p.courseId === courseId);

        if (existingIndex >= 0) {
            // Update existing
            const updatedEntry = {
                ...progressList[existingIndex],
                completedModules: [...new Set([...progressList[existingIndex].completedModules, moduleId])],
                lastPlayed: new Date()
            };

            const newProgressList = [...progressList];
            newProgressList[existingIndex] = updatedEntry;

            await updateDoc(userRef, {
                courseProgress: newProgressList,
                lastLogin: serverTimestamp()
            });
        } else {
            // Create new if missing (fallback)
            const newEntry = {
                courseId,
                completedModules: [moduleId],
                lastPlayed: new Date()
            };
            await updateDoc(userRef, {
                enrolledCourses: arrayUnion(courseId),
                courseProgress: arrayUnion(newEntry)
            });
        }
    }
};

// Tool Usage tracking
export const recordToolUsage = async (userId: string, toolType: 'campaign' | 'image' | 'seo', lessonId: string, courseId: string, completed: boolean = false, result?: any) => {
    try {
        const toolUsageData = {
            userId,
            toolType,
            lessonId,
            courseId,
            timestamp: serverTimestamp(),
            completed,
            result: result || null
        };

        await addDoc(collection(db, 'toolUsage'), toolUsageData);
        console.log(`Recorded tool usage: ${toolType} for lesson ${lessonId}`);
    } catch (error) {
        console.error("Error recording tool usage:", error);
        // Don't throw - tool usage tracking shouldn't break the app
    }
};

export const getRecentToolUsage = async (userId: string, limit: number = 5) => {
    try {
        const q = query(
            collection(db, 'toolUsage'),
            where('userId', '==', userId),
            orderBy('timestamp', 'desc')
        );

        const querySnapshot = await getDocs(q);
        const usageRecords = querySnapshot.docs
            .slice(0, limit)
            .map(doc => ({
                id: doc.id,
                ...doc.data(),
                timestamp: doc.data().timestamp?.toDate() || new Date()
            }));

        return usageRecords;
    } catch (error) {
        console.error("Error fetching recent tool usage:", error);
        return [];
    }
};

