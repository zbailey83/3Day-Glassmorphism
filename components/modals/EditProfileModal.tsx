import React, { useState } from 'react';
import { X, UploadCloud, Loader2, Camera, User, MapPin, Briefcase, FileText, AlertCircle, RefreshCw, HelpCircle, ExternalLink } from 'lucide-react';
import { uploadFile, updateUserProfile, auth, UploadError } from '../../services/firebase';
import { updateProfile } from 'firebase/auth';
import { useAuth } from '../../hooks/useAuth';
import { UserProfile } from '../../types';

interface EditProfileModalProps {
    onClose: () => void;
    onUpdateComplete: () => void;
    initialData: UserProfile;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({ onClose, onUpdateComplete, initialData }) => {
    const { user } = useAuth();
    const [displayName, setDisplayName] = useState(initialData.displayName || '');
    const [bio, setBio] = useState(initialData.bio || '');
    const [location, setLocation] = useState(initialData.location || '');
    const [role, setRole] = useState(initialData.role || '');
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(initialData.photoURL);

    // Banner State
    const [bannerFile, setBannerFile] = useState<File | null>(null);
    const [bannerPreviewUrl, setBannerPreviewUrl] = useState<string | null>(initialData.bannerURL || null);

    const [isSaving, setIsSaving] = useState(false);
    const [avatarUploadProgress, setAvatarUploadProgress] = useState<number>(0);
    const [bannerUploadProgress, setBannerUploadProgress] = useState<number>(0);
    const [uploadError, setUploadError] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            setAvatarFile(selectedFile);
            setPreviewUrl(URL.createObjectURL(selectedFile));
        }
    };

    const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            setBannerFile(selectedFile);
            setBannerPreviewUrl(URL.createObjectURL(selectedFile));
        }
    };

    const handleSave = async () => {
        if (!user) return;

        setIsSaving(true);
        setUploadError(null);
        setAvatarUploadProgress(0);
        setBannerUploadProgress(0);
        console.log("Starting profile update...");

        try {
            let photoURL = initialData.photoURL ?? null;
            let bannerURL = initialData.bannerURL ?? null;

            // Handle concurrent uploads (avatar + banner)
            const uploadPromises: Promise<void>[] = [];

            // 1. Upload new avatar if selected
            if (avatarFile) {
                console.log("Uploading avatar...");
                const avatarPath = `avatars/${user.uid}/${Date.now()}_${avatarFile.name}`;
                const avatarPromise = uploadFile(avatarFile, avatarPath, setAvatarUploadProgress)
                    .then(url => {
                        photoURL = url;
                        console.log("Avatar uploaded:", photoURL);
                    });
                uploadPromises.push(avatarPromise);
            }

            // 2. Upload new banner if selected
            if (bannerFile) {
                console.log("Uploading banner...");
                const bannerPath = `banners/${user.uid}/${Date.now()}_${bannerFile.name}`;
                const bannerPromise = uploadFile(bannerFile, bannerPath, setBannerUploadProgress)
                    .then(url => {
                        bannerURL = url;
                        console.log("Banner uploaded:", bannerURL);
                    });
                uploadPromises.push(bannerPromise);
            }

            // Wait for all uploads to complete concurrently
            if (uploadPromises.length > 0) {
                await Promise.all(uploadPromises);
            }

            // 3. Update Firestore Profile with timeout
            console.log("Updating Firestore profile...");
            const updates: Partial<UserProfile> = {
                displayName,
                bio,
                location,
                role,
                photoURL,
                bannerURL
            };

            const firestoreUpdatePromise = updateUserProfile(user.uid, updates);
            const firestoreTimeout = new Promise<never>((_, reject) =>
                setTimeout(() => reject(new Error('Firestore update timed out after 30 seconds')), 30000)
            );

            await Promise.race([firestoreUpdatePromise, firestoreTimeout]);
            console.log("Firestore updated");

            // 4. Update Firebase Auth Profile (for consistency across app)
            const currentUser = auth.currentUser;
            if (currentUser) {
                console.log("Updating Auth profile...");
                const authUpdatePromise = updateProfile(currentUser, {
                    displayName: displayName,
                    photoURL: photoURL
                });
                const authTimeout = new Promise<never>((_, reject) =>
                    setTimeout(() => reject(new Error('Auth profile update timed out after 15 seconds')), 15000)
                );

                await Promise.race([authUpdatePromise, authTimeout]);
                console.log("Auth profile updated");
            }

            console.log("Update sequence complete. Closing modal.");
            onUpdateComplete();
            onClose();
        } catch (error: any) {
            console.error("Update failed detailed:", error);

            // Handle structured upload errors
            if (error && typeof error === 'object' && 'type' in error) {
                const uploadError = error as UploadError;
                setUploadError(`${uploadError.message}\n\n${uploadError.actionableSteps}`);
            } else {
                setUploadError(`Failed to update profile: ${error.message || error}`);
            }

            // Reset progress on error
            setAvatarUploadProgress(0);
            setBannerUploadProgress(0);
        } finally {
            setIsSaving(false);
        }
    };

    const handleRetry = () => {
        setUploadError(null);
        setAvatarUploadProgress(0);
        setBannerUploadProgress(0);
        handleSave();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white dark:bg-[#0F172A] w-full max-w-lg rounded-[24px] border border-slate-200 dark:border-white/10 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">

                <div className="p-6 border-b border-slate-200 dark:border-white/5 flex items-center justify-between z-20 relative bg-white dark:bg-[#0F172A]">
                    <h2 className="text-xl font-display font-bold text-slate-900 dark:text-white">Edit Profile</h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full transition-colors">
                        <X size={20} className="text-slate-500" />
                    </button>
                </div>

                <div className="overflow-y-auto">
                    {/* Banner Upload Area */}
                    <div className="h-40 w-full relative group cursor-pointer bg-slate-100 dark:bg-white/5">
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleBannerChange}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            disabled={isSaving}
                        />
                        {bannerPreviewUrl ? (
                            <img src={bannerPreviewUrl} alt="Banner" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full bg-gradient-to-r from-[#38BDF8] via-[#6366F1] to-[#A855F7] opacity-50 block"></div>
                        )}

                        {bannerUploadProgress > 0 && bannerUploadProgress < 100 && (
                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                <div className="text-center">
                                    <Loader2 size={32} className="text-white animate-spin mx-auto mb-2" />
                                    <span className="text-white text-sm font-bold">{Math.round(bannerUploadProgress)}%</span>
                                </div>
                            </div>
                        )}

                        {!isSaving && (
                            <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="bg-black/50 backdrop-blur-md px-4 py-2 rounded-full text-white flex items-center font-medium text-sm">
                                    <UploadCloud size={16} className="mr-2" /> Change Banner
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="px-6 pb-6">
                        {/* Avatar Upload (Overlapping) */}
                        <div className="flex justify-between items-end mb-6 -mt-12 relative z-10">
                            <div className="relative group cursor-pointer">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                    disabled={isSaving}
                                />
                                <div className="w-24 h-24 rounded-full border-4 border-white dark:border-[#0F172A] shadow-lg overflow-hidden relative bg-[#0F172A]">
                                    <img src={previewUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.uid}`} alt="Avatar" className="w-full h-full object-cover" />
                                    {avatarUploadProgress > 0 && avatarUploadProgress < 100 && (
                                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                            <div className="text-center">
                                                <Loader2 size={24} className="text-white animate-spin mx-auto mb-1" />
                                                <span className="text-white text-xs font-bold">{Math.round(avatarUploadProgress)}%</span>
                                            </div>
                                        </div>
                                    )}
                                    {!isSaving && (
                                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Camera size={24} className="text-white" />
                                        </div>
                                    )}
                                </div>
                                <div className="absolute bottom-0 right-0 bg-[#38BDF8] p-1.5 rounded-full text-white shadow-md border-2 border-white dark:border-[#0F172A]">
                                    <Camera size={12} />
                                </div>
                            </div>
                        </div>

                        {/* Form Fields */}
                        <div className="space-y-4">
                            {/* Help Text */}
                            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-3">
                                <div className="flex items-start gap-2">
                                    <HelpCircle size={16} className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                                    <div className="flex-1">
                                        <p className="text-xs text-blue-700 dark:text-blue-300">
                                            <strong>Image uploads:</strong> Maximum 5MB per image. Click on avatar or banner to change.
                                        </p>
                                        <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                                            <strong>Having issues?</strong> Check the{' '}
                                            <a
                                                href="SETUP.md"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="underline hover:text-blue-800 dark:hover:text-blue-200 inline-flex items-center gap-1"
                                            >
                                                setup guide <ExternalLink size={10} />
                                            </a>
                                            {' '}for troubleshooting.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="flex items-center text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
                                    <User size={14} className="mr-2 text-slate-400" /> Display Name
                                </label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 focus:outline-none focus:border-[#38BDF8] transition-colors"
                                    value={displayName}
                                    onChange={(e) => setDisplayName(e.target.value)}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="flex items-center text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
                                        <Briefcase size={14} className="mr-2 text-slate-400" /> Role
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Frontend Dev"
                                        className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 focus:outline-none focus:border-[#38BDF8] transition-colors"
                                        value={role}
                                        onChange={(e) => setRole(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="flex items-center text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
                                        <MapPin size={14} className="mr-2 text-slate-400" /> Location
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g. New York, USA"
                                        className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 focus:outline-none focus:border-[#38BDF8] transition-colors"
                                        value={location}
                                        onChange={(e) => setLocation(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="flex items-center text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
                                    <FileText size={14} className="mr-2 text-slate-400" /> Bio
                                </label>
                                <textarea
                                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 focus:outline-none focus:border-[#38BDF8] transition-colors resize-none h-24"
                                    placeholder="Tell us a bit about yourself..."
                                    value={bio}
                                    onChange={(e) => setBio(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Error Display */}
                        {uploadError && (
                            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mt-4">
                                <div className="flex items-start gap-3">
                                    <AlertCircle size={20} className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                                    <div className="flex-1">
                                        <h4 className="font-bold text-red-900 dark:text-red-200 mb-1">Update Failed</h4>
                                        <p className="text-sm text-red-700 dark:text-red-300 whitespace-pre-line">{uploadError}</p>
                                        <div className="mt-2 pt-2 border-t border-red-200 dark:border-red-800">
                                            <p className="text-xs text-red-600 dark:text-red-400">
                                                <strong>Common solutions:</strong>
                                            </p>
                                            <ul className="text-xs text-red-600 dark:text-red-400 list-disc list-inside mt-1 space-y-0.5">
                                                <li>Check your internet connection</li>
                                                <li>Ensure images are under 5MB each</li>
                                                <li>Try uploading one image at a time</li>
                                                <li>Clear browser cache and retry</li>
                                                <li>
                                                    See{' '}
                                                    <a
                                                        href="SETUP.md"
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="underline hover:text-red-700 dark:hover:text-red-300"
                                                    >
                                                        troubleshooting guide
                                                    </a>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="p-6 border-t border-slate-200 dark:border-white/5 flex justify-end gap-3">
                    <button onClick={onClose} className="px-5 py-2.5 rounded-xl font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors">
                        Cancel
                    </button>
                    {uploadError ? (
                        <button
                            onClick={handleRetry}
                            className="px-6 py-2.5 rounded-xl font-bold text-white flex items-center shadow-lg transition-all bg-gradient-to-r from-[#38BDF8] to-[#6366F1] hover:shadow-[0_0_20px_rgba(56,189,248,0.4)] hover:scale-105 active:scale-95"
                        >
                            <RefreshCw size={18} className="mr-2" />
                            Retry Update
                        </button>
                    ) : (
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className={`px-6 py-2.5 rounded-xl font-bold text-white flex items-center shadow-lg transition-all ${isSaving
                                ? 'bg-slate-300 dark:bg-white/10 cursor-not-allowed'
                                : 'bg-gradient-to-r from-[#38BDF8] to-[#6366F1] hover:shadow-[0_0_20px_rgba(56,189,248,0.4)] hover:scale-105 active:scale-95'
                                }`}
                        >
                            {isSaving && <Loader2 size={18} className="animate-spin mr-2" />}
                            {isSaving ? 'Saving...' : 'Save Changes'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
