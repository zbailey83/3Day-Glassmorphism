import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { auth, googleProvider, syncUserProfile } from '../services/firebase';
import { UserProfile } from '../types';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebase';

interface AuthContextType {
    user: User | null;
    userProfile: UserProfile | null;
    loading: boolean;
    error: string | null;
    signInWithGoogle: () => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

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

    const signInWithGoogle = async () => {
        setError(null);
        try {
            await signInWithPopup(auth, googleProvider);
        } catch (err: any) {
            console.error("Error signing in with Google", err);
            let errorMessage = "Failed to sign in";
            if (err.code === 'auth/popup-closed-by-user') {
                errorMessage = "Sign-in cancelled";
            } else if (err.code === 'auth/configuration-not-found') {
                errorMessage = "Authentication not enabled in Firebase Console";
            } else if (err.code === 'auth/unauthorized-domain') {
                errorMessage = "Domain not authorized in Firebase Console";
            } else {
                errorMessage = err.message || "An unexpected error occurred";
            }
            setError(errorMessage);
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
        <AuthContext.Provider value={{ user, userProfile, loading, error, signInWithGoogle, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
