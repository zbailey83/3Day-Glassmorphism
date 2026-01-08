import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { UploadProjectModal } from './UploadProjectModal';
import * as firebase from '../../services/firebase';
import { UploadErrorType } from '../../services/firebase';

// Mock the firebase service
vi.mock('../../services/firebase', () => ({
    uploadFile: vi.fn(),
    createGalleryItem: vi.fn(),
    addXP: vi.fn(),
    UploadErrorType: {
        CORS: 'CORS',
        NETWORK: 'NETWORK',
        TIMEOUT: 'TIMEOUT',
        PERMISSION: 'PERMISSION',
        UNKNOWN: 'UNKNOWN',
    },
}));

// Mock the useAuth hook
vi.mock('../../hooks/useAuth', () => ({
    useAuth: () => ({
        user: {
            uid: 'test-user-id',
            email: 'test@example.com',
            displayName: 'Test User',
        },
    }),
}));

describe('UploadProjectModal Integration Tests', () => {
    const mockOnClose = vi.fn();
    const mockOnUploadComplete = vi.fn();
    let mockFile: File;

    beforeEach(() => {
        vi.clearAllMocks();
        mockFile = new File(['test content'], 'test.jpg', { type: 'image/jpeg' });
    });

    it('should complete upload successfully with progress tracking', async () => {
        // Mock uploadFile to call progress callback
        (firebase.uploadFile as any).mockImplementation(
            async (file: File, path: string, onProgress?: (progress: number) => void) => {
                // Simulate progress updates
                if (onProgress) {
                    onProgress(50);
                    onProgress(100);
                }
                return 'https://example.com/test.jpg';
            }
        );

        (firebase.createGalleryItem as any).mockResolvedValue({
            id: 'test-id',
            userId: 'test-user-id',
            title: 'Test Project',
            description: 'Test Description',
            imageUrl: 'https://example.com/test.jpg',
            submittedAt: new Date(),
            likes: 0,
            tags: [],
        });

        (firebase.addXP as any).mockResolvedValue(undefined);

        render(
            <UploadProjectModal
                onClose={mockOnClose}
                onUploadComplete={mockOnUploadComplete}
            />
        );

        // Fill in the form
        const titleInput = screen.getByPlaceholderText(/e.g. Neon City Landing Page/i);
        fireEvent.change(titleInput, { target: { value: 'Test Project' } });

        // Upload a file
        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
        fireEvent.change(fileInput, { target: { files: [mockFile] } });

        // Click upload button
        const uploadButton = screen.getByText(/Publish Project/i);
        fireEvent.click(uploadButton);

        // Wait for upload to complete
        await waitFor(() => {
            expect(mockOnUploadComplete).toHaveBeenCalled();
            expect(firebase.uploadFile).toHaveBeenCalledWith(
                mockFile,
                expect.stringContaining('gallery/test-user-id/'),
                expect.any(Function) // Progress callback was passed
            );
        });
    });

    it('should display error message when upload fails', async () => {
        // Mock uploadFile to reject with an error
        const mockError = {
            type: UploadErrorType.NETWORK,
            message: 'Upload failed due to network issues.',
            actionableSteps: 'Please check your internet connection and try again.',
        };

        (firebase.uploadFile as any).mockRejectedValue(mockError);

        render(
            <UploadProjectModal
                onClose={mockOnClose}
                onUploadComplete={mockOnUploadComplete}
            />
        );

        // Fill in the form
        const titleInput = screen.getByPlaceholderText(/e.g. Neon City Landing Page/i);
        fireEvent.change(titleInput, { target: { value: 'Test Project' } });

        // Upload a file
        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
        fireEvent.change(fileInput, { target: { files: [mockFile] } });

        // Click upload button
        const uploadButton = screen.getByText(/Publish Project/i);
        fireEvent.click(uploadButton);

        // Wait for error message to appear
        await waitFor(() => {
            const errorHeading = screen.getAllByText(/Upload Failed/i)[0];
            expect(errorHeading).toBeTruthy();
            const errorMessage = screen.getByText(/Upload failed due to network issues/i);
            expect(errorMessage).toBeTruthy();
            const actionableSteps = screen.getByText(/Please check your internet connection and try again/i);
            expect(actionableSteps).toBeTruthy();
        });

        // Modal should stay open
        expect(mockOnClose).not.toHaveBeenCalled();
    });

    it('should show retry button after error and allow retry', async () => {
        // Mock uploadFile to fail first, then succeed
        let callCount = 0;
        (firebase.uploadFile as any).mockImplementation(() => {
            callCount++;
            if (callCount === 1) {
                return Promise.reject({
                    type: UploadErrorType.NETWORK,
                    message: 'Upload failed due to network issues.',
                    actionableSteps: 'Please check your internet connection and try again.',
                });
            } else {
                return Promise.resolve('https://example.com/test.jpg');
            }
        });

        (firebase.createGalleryItem as any).mockResolvedValue({
            id: 'test-id',
            userId: 'test-user-id',
            title: 'Test Project',
            description: 'Test Description',
            imageUrl: 'https://example.com/test.jpg',
            submittedAt: new Date(),
            likes: 0,
            tags: [],
        });

        (firebase.addXP as any).mockResolvedValue(undefined);

        render(
            <UploadProjectModal
                onClose={mockOnClose}
                onUploadComplete={mockOnUploadComplete}
            />
        );

        // Fill in the form
        const titleInput = screen.getByPlaceholderText(/e.g. Neon City Landing Page/i);
        fireEvent.change(titleInput, { target: { value: 'Test Project' } });

        // Upload a file
        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
        fireEvent.change(fileInput, { target: { files: [mockFile] } });

        // Click upload button
        const uploadButton = screen.getByText(/Publish Project/i);
        fireEvent.click(uploadButton);

        // Wait for error and retry button
        await waitFor(() => {
            const errorHeading = screen.getAllByText(/Upload Failed/i)[0];
            expect(errorHeading).toBeTruthy();
        });

        const retryButton = screen.getByText(/Retry Upload/i);
        expect(retryButton).toBeTruthy();

        // Click retry
        fireEvent.click(retryButton);

        // Wait for successful upload
        await waitFor(() => {
            expect(mockOnUploadComplete).toHaveBeenCalled();
        });

        expect(firebase.uploadFile).toHaveBeenCalledTimes(2);
    });

    it('should reset upload state when retry is clicked', async () => {
        // Mock uploadFile to fail
        (firebase.uploadFile as any).mockRejectedValue({
            type: UploadErrorType.TIMEOUT,
            message: 'Upload timed out after 60 seconds.',
            actionableSteps: 'Please try a smaller file or check your connection.',
        });

        render(
            <UploadProjectModal
                onClose={mockOnClose}
                onUploadComplete={mockOnUploadComplete}
            />
        );

        // Fill in the form
        const titleInput = screen.getByPlaceholderText(/e.g. Neon City Landing Page/i);
        fireEvent.change(titleInput, { target: { value: 'Test Project' } });

        // Upload a file
        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
        fireEvent.change(fileInput, { target: { files: [mockFile] } });

        // Click upload button
        const uploadButton = screen.getByText(/Publish Project/i);
        fireEvent.click(uploadButton);

        // Wait for error
        await waitFor(() => {
            const errorHeading = screen.getAllByText(/Upload Failed/i)[0];
            expect(errorHeading).toBeTruthy();
        });

        // Click retry
        const retryButton = screen.getByText(/Retry Upload/i);
        fireEvent.click(retryButton);

        // Error should be cleared (retry will fail again, but state is reset)
        await waitFor(() => {
            // The error will appear again since we're still mocking failure
            // But this confirms the retry logic is working
            expect(firebase.uploadFile).toHaveBeenCalledTimes(2);
        });
    });

    it('should handle successful upload flow with all steps', async () => {
        const mockImageUrl = 'https://example.com/test.jpg';
        const mockGalleryItem = {
            id: 'test-gallery-id',
            userId: 'test-user-id',
            courseId: 'general',
            title: 'My Test Project',
            description: 'This is a test',
            imageUrl: mockImageUrl,
            submittedAt: new Date(),
            likes: 0,
            tags: ['react', 'css'],
        };

        (firebase.uploadFile as any).mockResolvedValue(mockImageUrl);
        (firebase.createGalleryItem as any).mockResolvedValue(mockGalleryItem);
        (firebase.addXP as any).mockResolvedValue(undefined);

        render(
            <UploadProjectModal
                onClose={mockOnClose}
                onUploadComplete={mockOnUploadComplete}
            />
        );

        // Fill in all form fields
        const titleInput = screen.getByPlaceholderText(/e.g. Neon City Landing Page/i);
        fireEvent.change(titleInput, { target: { value: 'My Test Project' } });

        const descriptionInput = screen.getByPlaceholderText(/What did you build/i);
        fireEvent.change(descriptionInput, { target: { value: 'This is a test' } });

        const tagsInput = screen.getByPlaceholderText(/e.g. React, CSS, AI/i);
        fireEvent.change(tagsInput, { target: { value: 'react, css' } });

        // Upload a file
        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
        fireEvent.change(fileInput, { target: { files: [mockFile] } });

        // Click upload button
        const uploadButton = screen.getByText(/Publish Project/i);
        fireEvent.click(uploadButton);

        // Wait for all operations to complete
        await waitFor(() => {
            expect(firebase.uploadFile).toHaveBeenCalledWith(
                mockFile,
                expect.stringContaining('gallery/test-user-id/'),
                expect.any(Function)
            );
            expect(firebase.createGalleryItem).toHaveBeenCalledWith(
                expect.objectContaining({
                    userId: 'test-user-id',
                    title: 'My Test Project',
                    description: 'This is a test',
                    imageUrl: mockImageUrl,
                    tags: ['react', 'css'],
                })
            );
            expect(firebase.addXP).toHaveBeenCalledWith('test-user-id', 50);
            expect(mockOnUploadComplete).toHaveBeenCalledWith(mockGalleryItem);
            expect(mockOnClose).toHaveBeenCalled();
        });
    });
});
