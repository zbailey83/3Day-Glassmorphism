import React, { useState } from 'react';
import { X, UploadCloud, Loader2, Camera, User, MapPin, Briefcase, FileText } from 'lucide-react';
import { uploadFile, updateUserProfile, auth } from '../../services/firebase';
import { updateProfile } from 'firebase/auth';
import { useAuth } from '../../contexts/AuthContext';
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
        try {
            let photoURL = initialData.photoURL;
            let bannerURL = initialData.bannerURL;

            // 1. Upload new avatar if selected
            if (avatarFile) {
                const path = `avatars/${user.uid}/${Date.now()}_${avatarFile.name}`;
                photoURL = await uploadFile(avatarFile, path);
            }

            // 2. Upload new banner if selected
            if (bannerFile) {
                const path = `banners/${user.uid}/${Date.now()}_${bannerFile.name}`;
                bannerURL = await uploadFile(bannerFile, path);
            }

            // 3. Update Firestore Profile
            const updates: Partial<UserProfile> = {
                displayName,
                bio,
                location,
                role,
                photoURL,
                bannerURL
            };
            await updateUserProfile(user.uid, updates);

            // 4. Update Firebase Auth Profile (for consistency across app)
            if (auth.currentUser) {
                await updateProfile(auth.currentUser, {
                    displayName: displayName,
                    photoURL: photoURL
                });
            }

            onUpdateComplete();
            onClose();
        } catch (error) {
            console.error("Update failed", error);
            alert("Failed to update profile.");
        } finally {
            setIsSaving(false);
        }
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
                        />
                        {bannerPreviewUrl ? (
                            <img src={bannerPreviewUrl} alt="Banner" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full bg-gradient-to-r from-[#38BDF8] via-[#6366F1] to-[#A855F7] opacity-50 block"></div>
                        )}

                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="bg-black/50 backdrop-blur-md px-4 py-2 rounded-full text-white flex items-center font-medium text-sm">
                                <UploadCloud size={16} className="mr-2" /> Change Banner
                            </div>
                        </div>
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
                                />
                                <div className="w-24 h-24 rounded-full border-4 border-white dark:border-[#0F172A] shadow-lg overflow-hidden relative bg-[#0F172A]">
                                    <img src={previewUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.uid}`} alt="Avatar" className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Camera size={24} className="text-white" />
                                    </div>
                                </div>
                                <div className="absolute bottom-0 right-0 bg-[#38BDF8] p-1.5 rounded-full text-white shadow-md border-2 border-white dark:border-[#0F172A]">
                                    <Camera size={12} />
                                </div>
                            </div>
                        </div>

                        {/* Form Fields */}
                        <div className="space-y-4">
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
                    </div>
                </div>

                <div className="p-6 border-t border-slate-200 dark:border-white/5 flex justify-end gap-3">
                    <button onClick={onClose} className="px-5 py-2.5 rounded-xl font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors">
                        Cancel
                    </button>
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
                </div>
            </div>
        </div>
    );
};
