import React, { useState } from 'react';
import { X, UploadCloud, Loader2, Image as ImageIcon, AlertCircle, RefreshCw, HelpCircle, ExternalLink } from 'lucide-react';
import { uploadFile, createGalleryItem, addXP, UploadError } from '../../services/firebase';
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
    const [uploadProgress, setUploadProgress] = useState<number>(0);
    const [uploadError, setUploadError] = useState<string | null>(null);

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
        setUploadProgress(0);
        setUploadError(null);
        console.log("Starting upload process...");
        try {
            // 1. Upload Image
            console.log("Uploading image...");
            const path = `gallery/${user.uid}/${Date.now()}_${file.name}`;
            const imageUrl = await uploadFile(file, path, setUploadProgress);
            console.log("Image uploaded, URL:", imageUrl);

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

            console.log("Creating Firestore document...", newItem);
            const created = await createGalleryItem(newItem);
            console.log("Firestore document created:", created);

            // 3. Award XP
            console.log("Awarding XP...");
            await addXP(user.uid, 50);

            console.log("Upload complete, closing modal.");
            onUploadComplete(created);
            onClose();
        } catch (error: any) {
            console.error("Upload failed in djangoUpload:", error);

            // Handle structured upload errors
            if (error && typeof error === 'object' && 'type' in error) {
                const uploadError = error as UploadError;
                setUploadError(`${uploadError.message}\n\n${uploadError.actionableSteps}`);
            } else {
                setUploadError(`Upload failed: ${error.message || error}`);
            }
        } finally {
            setIsUploading(false);
        }
    };

    const handleRetry = () => {
        setUploadError(null);
        setUploadProgress(0);
        djangoUpload();
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

                    {/* Help Text */}
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-3">
                        <div className="flex items-start gap-2">
                            <HelpCircle size={16} className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                            <div className="flex-1">
                                <p className="text-xs text-blue-700 dark:text-blue-300">
                                    <strong>File size limit:</strong> Maximum 5MB per image. Supported formats: PNG, JPG, JPEG, GIF, WebP.
                                </p>
                                <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                                    <strong>Upload issues?</strong> If uploads hang or fail, check the{' '}
                                    <a
                                        href="SETUP.md"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="underline hover:text-blue-800 dark:hover:text-blue-200 inline-flex items-center gap-1"
                                    >
                                        setup guide <ExternalLink size={10} />
                                    </a>
                                    {' '}for CORS configuration instructions.
                                </p>
                            </div>
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

                    {/* Upload Progress Bar */}
                    {isUploading && (
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span className="font-bold text-slate-700 dark:text-slate-300">Uploading...</span>
                                <span className="text-slate-500 dark:text-slate-400">{Math.round(uploadProgress)}%</span>
                            </div>
                            <div className="w-full h-2 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-[#38BDF8] to-[#6366F1] transition-all duration-300 ease-out"
                                    style={{ width: `${uploadProgress}%` }}
                                />
                            </div>
                        </div>
                    )}

                    {/* Error Display */}
                    {uploadError && (
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
                            <div className="flex items-start gap-3">
                                <AlertCircle size={20} className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                                <div className="flex-1">
                                    <h4 className="font-bold text-red-900 dark:text-red-200 mb-1">Upload Failed</h4>
                                    <p className="text-sm text-red-700 dark:text-red-300 whitespace-pre-line">{uploadError}</p>
                                    <div className="mt-2 pt-2 border-t border-red-200 dark:border-red-800">
                                        <p className="text-xs text-red-600 dark:text-red-400">
                                            <strong>Common solutions:</strong>
                                        </p>
                                        <ul className="text-xs text-red-600 dark:text-red-400 list-disc list-inside mt-1 space-y-0.5">
                                            <li>Check your internet connection</li>
                                            <li>Ensure file is under 5MB</li>
                                            <li>Try a different image format</li>
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
                            Retry Upload
                        </button>
                    ) : (
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
                    )}
                </div>
            </div>
        </div>
    );
};
