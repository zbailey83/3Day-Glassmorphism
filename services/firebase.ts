import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, updateDoc, increment, serverTimestamp, arrayRemove, arrayUnion, documentId } from 'firebase/firestore';
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

// Helper to create/update user profile on login
export const syncUserProfile = async (user: any) => {
    if (!user) return;

    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
        const newProfile: UserProfile = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            xp: 0,
            level: 1,
            streakDays: 1,
            lastLogin: serverTimestamp(),
            enrolledCourses: [],
            courseProgress: [],
            savedProjects: [],
            likedProjects: []
        };
        await setDoc(userRef, newProfile);
    } else {
        await updateDoc(userRef, {
            lastLogin: serverTimestamp()
        });
    }
};

export const addXP = async (uid: string, amount: number) => {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
        xp: increment(amount)
    });
};

import { ref, uploadBytes, getDownloadURL, uploadBytesResumable } from 'firebase/storage';
import { collection, addDoc, query, where, getDocs, orderBy } from 'firebase/firestore';
import { GalleryItem } from '../types';

export const uploadFile = async (file: File, path: string) => {
    return new Promise<string>((resolve, reject) => {
        console.log(`Starting upload to ${path} (${file.size} bytes)...`);
        const storageRef = ref(storage, path);

        // Use resumable upload for better state tracking
        const uploadTask = uploadBytesResumable(storageRef, file);
        let uploadStarted = false;

        // Timeout watchdog
        const timeoutId = setTimeout(() => {
            uploadTask.cancel();
            console.error("Upload timeout. Started:", uploadStarted);
            if (!uploadStarted) {
                reject(new Error("Upload failed to start. This is likely a CORS issue. Please run 'gsutil cors set cors.json gs://<your-bucket>'"));
            } else {
                reject(new Error("Upload timed out (slow network)."));
            }
        }, 60000); // 60s

        uploadTask.on('state_changed',
            (snapshot) => {
                uploadStarted = true;
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                console.log(`Upload is ${progress}% done`);
            },
            (error) => {
                clearTimeout(timeoutId);
                console.error("Upload error specific:", error.code, error.message);
                reject(error);
            },
            async () => {
                clearTimeout(timeoutId);
                try {
                    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                    console.log("File available at", downloadURL);
                    resolve(downloadURL);
                } catch (e) {
                    reject(e);
                }
            }
        );
    });
};

export const createGalleryItem = async (item: Omit<GalleryItem, 'id'>) => {
    const docRef = await addDoc(collection(db, 'gallery'), item);
    return { id: docRef.id, ...item };
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
