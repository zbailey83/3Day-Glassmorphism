import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, updateDoc, increment, serverTimestamp } from 'firebase/firestore';
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
            enrolledCourses: []
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

        // Timeout watchdog
        const timeoutId = setTimeout(() => {
            uploadTask.cancel();
            console.error("Upload timeout: No completion within 20 seconds.");
            reject(new Error("Upload timed out. Check your network or Firebase Storage CORS configuration."));
        }, 20000);

        uploadTask.on('state_changed',
            (snapshot) => {
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

export const updateUserProfile = async (uid: string, data: Partial<UserProfile>) => {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, data);
};
