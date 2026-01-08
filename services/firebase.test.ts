import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { uploadFile, UploadErrorType, UploadError } from './firebase';

// Mock Firebase modules
vi.mock('firebase/storage', () => ({
    ref: vi.fn(),
    uploadBytesResumable: vi.fn(),
    getDownloadURL: vi.fn(),
    getStorage: vi.fn(),
}));

vi.mock('firebase/app', () => ({
    initializeApp: vi.fn(() => ({})),
}));

vi.mock('firebase/auth', () => ({
    getAuth: vi.fn(),
    GoogleAuthProvider: vi.fn(),
}));

vi.mock('firebase/firestore', () => ({
    getFirestore: vi.fn(),
    doc: vi.fn(),
    setDoc: vi.fn(),
    getDoc: vi.fn(),
    updateDoc: vi.fn(),
    increment: vi.fn(),
    serverTimestamp: vi.fn(),
    arrayRemove: vi.fn(),
    arrayUnion: vi.fn(),
    documentId: vi.fn(),
    collection: vi.fn(),
    addDoc: vi.fn(),
    query: vi.fn(),
    where: vi.fn(),
    getDocs: vi.fn(),
    orderBy: vi.fn(),
}));

vi.mock('firebase/analytics', () => ({
    getAnalytics: vi.fn(),
}));

import { uploadBytesResumable, getDownloadURL, ref } from 'firebase/storage';

describe('uploadFile error handling', () => {
    let mockFile: File;
    let mockUploadTask: any;
    let stateChangedCallback: any;
    let errorCallback: any;
    let completeCallback: any;

    beforeEach(() => {
        // Create a mock file
        mockFile = new File(['test content'], 'test.jpg', { type: 'image/jpeg' });

        // Reset mocks
        vi.clearAllMocks();

        // Setup mock upload task
        mockUploadTask = {
            on: vi.fn((event: string, onState: any, onError: any, onComplete: any) => {
                stateChangedCallback = onState;
                errorCallback = onError;
                completeCallback = onComplete;
            }),
            cancel: vi.fn(),
            snapshot: {
                ref: {},
                bytesTransferred: 0,
                totalBytes: 100,
            },
        };

        (uploadBytesResumable as any).mockReturnValue(mockUploadTask);
        (ref as any).mockReturnValue({});
    });

    afterEach(() => {
        vi.clearAllTimers();
    });

    it('should detect and categorize CORS errors', async () => {
        vi.useFakeTimers();

        const uploadPromise = uploadFile(mockFile, 'test/path.jpg');

        // Advance time to trigger timeout before upload starts
        vi.advanceTimersByTime(60000);

        await expect(uploadPromise).rejects.toMatchObject({
            type: UploadErrorType.CORS,
            message: expect.stringContaining('CORS'),
            actionableSteps: expect.stringContaining('gsutil'),
        });

        vi.useRealTimers();
    });

    it('should detect and categorize network errors', async () => {
        const uploadPromise = uploadFile(mockFile, 'test/path.jpg');

        // Simulate network error
        const networkError = {
            code: 'storage/unknown',
            message: 'Network request failed',
        };

        errorCallback(networkError);

        await expect(uploadPromise).rejects.toMatchObject({
            type: UploadErrorType.NETWORK,
            message: expect.stringContaining('network'),
            actionableSteps: expect.stringContaining('connection'),
            originalError: networkError,
        });
    });

    it('should detect and categorize timeout errors', async () => {
        vi.useFakeTimers();

        const uploadPromise = uploadFile(mockFile, 'test/path.jpg');

        // Simulate upload starting
        stateChangedCallback({
            bytesTransferred: 10,
            totalBytes: 100,
        });

        // Advance time to trigger timeout after upload started
        vi.advanceTimersByTime(60000);

        await expect(uploadPromise).rejects.toMatchObject({
            type: UploadErrorType.TIMEOUT,
            message: expect.stringContaining('timed out'),
            actionableSteps: expect.stringContaining('smaller file'),
        });

        vi.useRealTimers();
    });

    it('should detect and categorize permission errors', async () => {
        const uploadPromise = uploadFile(mockFile, 'test/path.jpg');

        // Simulate permission error
        const permissionError = {
            code: 'storage/unauthorized',
            message: 'User does not have permission',
        };

        errorCallback(permissionError);

        await expect(uploadPromise).rejects.toMatchObject({
            type: UploadErrorType.PERMISSION,
            message: expect.stringContaining('Permission denied'),
            actionableSteps: expect.stringContaining('Security Rules'),
            originalError: permissionError,
        });
    });

    it('should call progress callback during upload', async () => {
        const progressCallback = vi.fn();
        const uploadPromise = uploadFile(mockFile, 'test/path.jpg', progressCallback);

        // Simulate progress updates
        stateChangedCallback({
            bytesTransferred: 25,
            totalBytes: 100,
        });

        expect(progressCallback).toHaveBeenCalledWith(25);

        stateChangedCallback({
            bytesTransferred: 50,
            totalBytes: 100,
        });

        expect(progressCallback).toHaveBeenCalledWith(50);

        stateChangedCallback({
            bytesTransferred: 100,
            totalBytes: 100,
        });

        expect(progressCallback).toHaveBeenCalledWith(100);

        // Complete the upload
        (getDownloadURL as any).mockResolvedValue('https://example.com/file.jpg');
        await completeCallback();

        await expect(uploadPromise).resolves.toBe('https://example.com/file.jpg');
    });

    it('should handle canceled uploads', async () => {
        const uploadPromise = uploadFile(mockFile, 'test/path.jpg');

        // Simulate canceled error
        const canceledError = {
            code: 'storage/canceled',
            message: 'Upload canceled',
        };

        errorCallback(canceledError);

        await expect(uploadPromise).rejects.toMatchObject({
            type: UploadErrorType.NETWORK,
            message: expect.stringContaining('canceled'),
            actionableSteps: expect.stringContaining('try uploading again'),
            originalError: canceledError,
        });
    });

    it('should handle unknown errors', async () => {
        const uploadPromise = uploadFile(mockFile, 'test/path.jpg');

        // Simulate unknown error
        const unknownError = {
            code: 'storage/some-unknown-error',
            message: 'Something went wrong',
        };

        errorCallback(unknownError);

        await expect(uploadPromise).rejects.toMatchObject({
            type: UploadErrorType.UNKNOWN,
            message: expect.stringContaining('Something went wrong'),
            actionableSteps: expect.stringContaining('try again'),
            originalError: unknownError,
        });
    });

    it('should handle errors when getting download URL', async () => {
        const uploadPromise = uploadFile(mockFile, 'test/path.jpg');

        // Simulate successful upload but failed download URL retrieval
        const downloadError = new Error('Failed to get download URL');
        (getDownloadURL as any).mockRejectedValue(downloadError);

        await completeCallback();

        await expect(uploadPromise).rejects.toMatchObject({
            type: UploadErrorType.UNKNOWN,
            message: expect.stringContaining('failed to get download URL'),
            actionableSteps: expect.stringContaining('try again'),
            originalError: downloadError,
        });
    });
});
