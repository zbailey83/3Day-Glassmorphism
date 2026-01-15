import React, { createContext, useContext, useEffect, useState } from 'react';
import {
    User,
    signInWithPopup,
    signOut,
    onAuthStateChanged,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    AuthError
} from 'firebase/auth';
import { auth, googleProvider, syncUserProfile } from '../services/firebase';
import { UserProfile } from '../types';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebase';
import { updateStreak } from '../services/streakService';

interface AuthContextType {
    user: User | null;
    userProfile: UserProfile | null;
    loading: boolean;
    error: string | null;
    signInWithGoogle: () => Promise<void>;
    signupWithEmail: (email: string, pass: string) => Promise<void>;
    loginWithEmail: (email: string, pass: string) => Promise<void>;
    logout: () => Promise<void>;
    setError: (error: string | null) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Auth State Listener
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);

            if (currentUser) {
                try {
                    // Sync basic profile if needed
                    await syncUserProfile(currentUser);

                    // Update user's login streak
                    try {
                        await updateStreak(currentUser.uid);
                        console.log('Streak updated successfully for user:', currentUser.uid);
                    } catch (streakError) {
                        // Handle streak update errors gracefully - don't block login
                        console.error('Failed to update streak, but continuing with login:', streakError);
                        // Streak update failure should not prevent user from logging in
                    }

                    // Listen to realtime profile updates (XP, level, etc)
                    const profileUnsub = onSnapshot(doc(db, 'users', currentUser.uid), (doc) => {
                        if (doc.exists()) {
                            setUserProfile(doc.data() as UserProfile);
                        }
                    });

                    setLoading(false);
                    return () => profileUnsub();
                } catch (e) {
                    console.error("Profile sync error:", e);
                    setLoading(false);
                }
            } else {
                setUserProfile(null);
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, []);

    const handleAuthError = (err: any) => {
        console.error("Auth error:", err);
        let errorMessage = "Authentication failed";
        if (err.code === 'auth/popup-closed-by-user') {
            errorMessage = "Sign-in cancelled";
        } else if (err.code === 'auth/email-already-in-use') {
            errorMessage = "Email already in use";
        } else if (err.code === 'auth/invalid-email') {
            errorMessage = "Invalid email address";
        } else if (err.code === 'auth/weak-password') {
            errorMessage = "Password should be at least 6 characters";
        } else if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
            errorMessage = "Invalid email or password";
        } else {
            errorMessage = err.message || "An unexpected error occurred";
        }
        setError(errorMessage);
    };

    const signInWithGoogle = async () => {
        setError(null);
        try {
            await signInWithPopup(auth, googleProvider);
        } catch (err: any) {
            handleAuthError(err);
        }
    };

    const signupWithEmail = async (email: string, pass: string) => {
        setError(null);
        try {
            await createUserWithEmailAndPassword(auth, email, pass);
        } catch (err: any) {
            handleAuthError(err);
            throw err; // Re-throw to allow component to handle specific UI logic if needed
        }
    };

    const loginWithEmail = async (email: string, pass: string) => {
        setError(null);
        try {
            await signInWithEmailAndPassword(auth, email, pass);
        } catch (err: any) {
            handleAuthError(err);
            throw err;
        }
    };

    const logout = async () => {
        try {
            await signOut(auth);
            setError(null);
        } catch (error) {
            console.error("Error signing out", error);
        }
    };

    return (
        <AuthContext.Provider value={{
            user,
            userProfile,
            loading,
            error,
            signInWithGoogle,
            signupWithEmail,
            loginWithEmail,
            logout,
            setError
        }}>
            {children}
        </AuthContext.Provider>
    );
};
