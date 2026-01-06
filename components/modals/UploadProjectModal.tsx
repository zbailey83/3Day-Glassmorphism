import React, { useState } from 'react';
import { X, UploadCloud, Loader2, Image as ImageIcon } from 'lucide-react';
import { uploadFile, createGalleryItem, addXP } from '../../services/firebase';
import { useAuth } from '../../hooks/useAuth';
import { GalleryItem } from '../../types';

interface UploadProjectModalProps {
    onClose: () => void;
    onUploadComplete: (newItem: GalleryItem) => void;
}

export const UploadProjectModal: React.FC<UploadProjectModalProps> = ({ onClose, onUploadComplete }) => {
    const { user } = useAuth();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [tags, setTags] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            setFile(selectedFile);
            setPreviewUrl(URL.createObjectURL(selectedFile));
        }
    };

    const djangoUpload = async () => {
        if (!user || !file || !title) return;

        setIsUploading(true);
        try {
            // 1. Upload Image
            const path = `gallery/${user.uid}/${Date.now()}_${file.name}`;
            const imageUrl = await uploadFile(file, path);

            // 2. Create Firestore Doc
            const newItem: Omit<GalleryItem, 'id'> = {
                userId: user.uid,
                courseId: 'general', // Default for now
                title,
                description,
                imageUrl,
                submittedAt: new Date(),
                likes: 0,
                tags: tags.split(',').map(t => t.trim()).filter(t => t)
            };

            const created = await createGalleryItem(newItem);

            // 3. Award XP
            await addXP(user.uid, 50);

            onUploadComplete(created);
            onClose();
        } catch (error) {
            console.error("Upload failed", error);
            alert("Upload failed, please try again.");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white dark:bg-[#0F172A] w-full max-w-lg rounded-[24px] border border-slate-200 dark:border-white/10 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">

                <div className="p-6 border-b border-slate-200 dark:border-white/5 flex items-center justify-between">
                    <h2 className="text-xl font-display font-bold text-slate-900 dark:text-white">Upload Project</h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full transition-colors">
                        <X size={20} className="text-slate-500" />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto space-y-5">
                    {/* Image Upload Area */}
                    <div className="relative group">
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        <div className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center transition-all ${previewUrl
                            ? 'border-[#38BDF8]/50 bg-[#38BDF8]/5'
                            : 'border-slate-300 dark:border-white/10 hover:border-[#38BDF8]/50 hover:bg-[#38BDF8]/5'
                            }`}>
                            {previewUrl ? (
                                <div className="relative w-full aspect-video rounded-lg overflow-hidden shadow-md">
                                    <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <span className="text-white font-bold bg-black/50 px-3 py-1 rounded-full text-sm">Change Image</span>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center mb-4 text-slate-400 group-hover:text-[#38BDF8] transition-colors">
                                        <ImageIcon size={32} />
                                    </div>
                                    <p className="font-bold text-slate-700 dark:text-slate-200">Click to upload image</p>
                                    <p className="text-xs text-slate-400 mt-2">PNG, JPG up to 5MB</p>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Form Fields */}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Project Title</label>
                            <input
                                type="text"
                                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 focus:outline-none focus:border-[#38BDF8] transition-colors"
                                placeholder="e.g. Neon City Landing Page"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Description</label>
                            <textarea
                                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 focus:outline-none focus:border-[#38BDF8] transition-colors resize-none h-24"
                                placeholder="What did you build? What technologies did you use?"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Tags</label>
                            <input
                                type="text"
                                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 focus:outline-none focus:border-[#38BDF8] transition-colors"
                                placeholder="e.g. React, CSS, AI (comma separated)"
                                value={tags}
                                onChange={(e) => setTags(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t border-slate-200 dark:border-white/5 flex justify-end gap-3">
                    <button onClick={onClose} className="px-5 py-2.5 rounded-xl font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors">
                        Cancel
                    </button>
                    <button
                        onClick={djangoUpload}
                        disabled={!file || !title || isUploading}
                        className={`px-6 py-2.5 rounded-xl font-bold text-white flex items-center shadow-lg transition-all ${!file || !title || isUploading
                            ? 'bg-slate-300 dark:bg-white/10 cursor-not-allowed'
                            : 'bg-gradient-to-r from-[#38BDF8] to-[#6366F1] hover:shadow-[0_0_20px_rgba(56,189,248,0.4)] hover:scale-105 active:scale-95'
                            }`}
                    >
                        {isUploading ? <Loader2 size={18} className="animate-spin mr-2" /> : <UploadCloud size={18} className="mr-2" />}
                        {isUploading ? 'Uploading...' : 'Publish Project'}
                    </button>
                </div>
            </div>
        </div>
    );
};
