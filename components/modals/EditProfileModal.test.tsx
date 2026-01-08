import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { EditProfileModal } from './EditProfileModal';
import * as firebase from '../../services/firebase';
import { UploadErrorType } from '../../services/firebase';
import { updateProfile } from 'firebase/auth';

// Mock the firebase service
vi.mock('../../services/firebase', () => ({
    uploadFile: vi.fn(),
    updateUserProfile: vi.fn(),
    auth: {
        currentUser: {
            uid: 'test-user-id',
            email: 'test@example.com',
            displayName: 'Test User',
        },
    },
    UploadErrorType: {
        CORS: 'CORS',
        NETWORK: 'NETWORK',
        TIMEOUT: 'TIMEOUT',
        PERMISSION: 'PERMISSION',
        UNKNOWN: 'UNKNOWN',
    },
}));

// Mock firebase/auth
vi.mock('firebase/auth', () => ({
    updateProfile: vi.fn(),
}));

// Mock the useAuth hook
vi.mock('../../hooks/useAuth', () => ({
    useAuth: () => ({
        user: {
            uid: 'test-user-id',
            email: 'test@example.com',
            displayName: 'Test User',
            photoURL: 'https://example.com/avatar.jpg',
        },
    }),
}));

describe('EditProfileModal Integration Tests', () => {
    const mockOnClose = vi.fn();
    const mockOnUpdateComplete = vi.fn();
    const mockInitialData = {
        uid: 'test-user-id',
        email: 'test@example.com',
        displayName: 'Test User',
        photoURL: 'https://example.com/avatar.jpg',
        bannerURL: null,
        bio: 'Test bio',
        location: 'Test City',
        role: 'Developer',
        xp: 100,
        level: 1,
        streakDays: 1,
        lastLogin: new Date(),
        enrolledCourses: [],
        courseProgress: [],
        savedProjects: [],
        likedProjects: [],
    };

    let mockAvatarFile: File;
    let mockBannerFile: File;

    beforeEach(() => {
        vi.clearAllMocks();
        mockAvatarFile = new File(['avatar content'], 'avatar.jpg', { type: 'image/jpeg' });
        mockBannerFile = new File(['banner content'], 'banner.jpg', { type: 'image/jpeg' });
    });

    it('should complete profile update successfully with avatar upload and progress tracking', async () => {
        // Mock uploadFile to call progress callback
        (firebase.uploadFile as any).mockImplementation(
            async (file: File, path: string, onProgress?: (progress: number) => void) => {
                // Simulate progress updates
                if (onProgress) {
                    onProgress(50);
                    onProgress(100);
                }
                return 'https://example.com/new-avatar.jpg';
            }
        );

        (firebase.updateUserProfile as any).mockResolvedValue(undefined);
        (updateProfile as any).mockResolvedValue(undefined);

        render(
            <EditProfileModal
                onClose={mockOnClose}
                onUpdateComplete={mockOnUpdateComplete}
                initialData={mockInitialData}
            />
        );

        // Upload avatar file
        const fileInputs = document.querySelectorAll('input[type="file"]');
        const avatarInput = fileInputs[1] as HTMLInputElement; // Second file input is avatar
        fireEvent.change(avatarInput, { target: { files: [mockAvatarFile] } });

        // Click save button
        const saveButton = screen.getByText(/Save Changes/i);
        fireEvent.click(saveButton);

        // Wait for upload to complete
        await waitFor(() => {
            expect(firebase.uploadFile).toHaveBeenCalledWith(
                mockAvatarFile,
                expect.stringContaining('avatars/test-user-id/'),
                expect.any(Function) // Progress callback was passed
            );
            expect(mockOnUpdateComplete).toHaveBeenCalled();
            expect(mockOnClose).toHaveBeenCalled();
        });
    });

    it('should handle concurrent avatar and banner uploads', async () => {
        const mockAvatarUrl = 'https://example.com/new-avatar.jpg';
        const mockBannerUrl = 'https://example.com/new-banner.jpg';

        // Mock uploadFile to return different URLs based on path
        (firebase.uploadFile as any).mockImplementation(
            async (file: File, path: string, onProgress?: (progress: number) => void) => {
                if (onProgress) {
                    onProgress(50);
                    onProgress(100);
                }
                if (path.includes('avatars')) {
                    return mockAvatarUrl;
                } else {
                    return mockBannerUrl;
                }
            }
        );

        (firebase.updateUserProfile as any).mockResolvedValue(undefined);
        (updateProfile as any).mockResolvedValue(undefined);

        render(
            <EditProfileModal
                onClose={mockOnClose}
                onUpdateComplete={mockOnUpdateComplete}
                initialData={mockInitialData}
            />
        );

        // Upload both files
        const fileInputs = document.querySelectorAll('input[type="file"]');
        const bannerInput = fileInputs[0] as HTMLInputElement; // First file input is banner
        const avatarInput = fileInputs[1] as HTMLInputElement; // Second file input is avatar

        fireEvent.change(bannerInput, { target: { files: [mockBannerFile] } });
        fireEvent.change(avatarInput, { target: { files: [mockAvatarFile] } });

        // Click save button
        const saveButton = screen.getByText(/Save Changes/i);
        fireEvent.click(saveButton);

        // Wait for both uploads to complete
        await waitFor(() => {
            expect(firebase.uploadFile).toHaveBeenCalledTimes(2);
            expect(firebase.uploadFile).toHaveBeenCalledWith(
                mockAvatarFile,
                expect.stringContaining('avatars/test-user-id/'),
                expect.any(Function)
            );
            expect(firebase.uploadFile).toHaveBeenCalledWith(
                mockBannerFile,
                expect.stringContaining('banners/test-user-id/'),
                expect.any(Function)
            );
            expect(firebase.updateUserProfile).toHaveBeenCalledWith(
                'test-user-id',
                expect.objectContaining({
                    photoURL: mockAvatarUrl,
                    bannerURL: mockBannerUrl,
                })
            );
            expect(mockOnUpdateComplete).toHaveBeenCalled();
            expect(mockOnClose).toHaveBeenCalled();
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
            <EditProfileModal
                onClose={mockOnClose}
                onUpdateComplete={mockOnUpdateComplete}
                initialData={mockInitialData}
            />
        );

        // Upload avatar file
        const fileInputs = document.querySelectorAll('input[type="file"]');
        const avatarInput = fileInputs[1] as HTMLInputElement;
        fireEvent.change(avatarInput, { target: { files: [mockAvatarFile] } });

        // Click save button
        const saveButton = screen.getByText(/Save Changes/i);
        fireEvent.click(saveButton);

        // Wait for error message to appear
        await waitFor(() => {
            const errorHeading = screen.getAllByText(/Update Failed/i)[0];
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
                return Promise.resolve('https://example.com/new-avatar.jpg');
            }
        });

        (firebase.updateUserProfile as any).mockResolvedValue(undefined);
        (updateProfile as any).mockResolvedValue(undefined);

        render(
            <EditProfileModal
                onClose={mockOnClose}
                onUpdateComplete={mockOnUpdateComplete}
                initialData={mockInitialData}
            />
        );

        // Upload avatar file
        const fileInputs = document.querySelectorAll('input[type="file"]');
        const avatarInput = fileInputs[1] as HTMLInputElement;
        fireEvent.change(avatarInput, { target: { files: [mockAvatarFile] } });

        // Click save button
        const saveButton = screen.getByText(/Save Changes/i);
        fireEvent.click(saveButton);

        // Wait for error and retry button
        await waitFor(() => {
            const errorHeading = screen.getAllByText(/Update Failed/i)[0];
            expect(errorHeading).toBeTruthy();
        });

        const retryButton = screen.getByText(/Retry Update/i);
        expect(retryButton).toBeTruthy();

        // Click retry
        fireEvent.click(retryButton);

        // Wait for successful upload
        await waitFor(() => {
            expect(mockOnUpdateComplete).toHaveBeenCalled();
            expect(mockOnClose).toHaveBeenCalled();
        });

        expect(firebase.uploadFile).toHaveBeenCalledTimes(2);
    });

    it('should update profile without image uploads', async () => {
        (firebase.updateUserProfile as any).mockResolvedValue(undefined);
        (updateProfile as any).mockResolvedValue(undefined);

        render(
            <EditProfileModal
                onClose={mockOnClose}
                onUpdateComplete={mockOnUpdateComplete}
                initialData={mockInitialData}
            />
        );

        // Update text fields only
        const displayNameInput = screen.getByDisplayValue('Test User');
        fireEvent.change(displayNameInput, { target: { value: 'Updated User' } });

        const bioInput = screen.getByDisplayValue('Test bio');
        fireEvent.change(bioInput, { target: { value: 'Updated bio' } });

        // Click save button
        const saveButton = screen.getByText(/Save Changes/i);
        fireEvent.click(saveButton);

        // Wait for update to complete
        await waitFor(() => {
            expect(firebase.uploadFile).not.toHaveBeenCalled();
            expect(firebase.updateUserProfile).toHaveBeenCalledWith(
                'test-user-id',
                expect.objectContaining({
                    displayName: 'Updated User',
                    bio: 'Updated bio',
                })
            );
            expect(mockOnUpdateComplete).toHaveBeenCalled();
            expect(mockOnClose).toHaveBeenCalled();
        });
    });
});
