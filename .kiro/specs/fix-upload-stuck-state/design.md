# Design Document: Fix Upload Stuck State

## Overview

This design addresses the Firebase Storage upload issue causing profile and project uploads to hang indefinitely. The solution involves configuring CORS on the Firebase Storage bucket and improving error handling and user feedback during uploads.

## Architecture

The upload flow consists of three main components:

1. **Upload Modals** (EditProfileModal, UploadProjectModal) - UI components that handle user interaction
2. **Firebase Service** (firebase.ts) - Service layer that manages Firebase Storage operations
3. **Firebase Storage Bucket** - Cloud storage that requires CORS configuration

The current issue occurs because Firebase Storage blocks cross-origin requests by default. The browser makes a preflight OPTIONS request that fails, causing the upload to never start.

## Components and Interfaces

### 1. Firebase Storage CORS Configuration

**File:** `cors.json` (new file in project root)

```json
[
  {
    "origin": ["*"],
    "method": ["GET", "POST", "PUT", "DELETE", "HEAD"],
    "maxAgeSeconds": 3600,
    "responseHeader": ["Content-Type", "Authorization"]
  }
]
```

This configuration allows all origins during development. For production, replace `"*"` with specific domains.

**Configuration Command:**
```bash
gsutil cors set cors.json gs://vibe-dev-26.firebasestorage.app
```

### 2. Enhanced Upload Service

**File:** `services/firebase.ts`

The `uploadFile` function already has good error handling with:
- Resumable upload tracking
- Progress monitoring
- Timeout detection (60 seconds)
- Specific CORS error messaging

**Improvements needed:**
- Add progress callback parameter
- Better error categorization
- Retry logic for transient failures

**Updated Interface:**
```typescript
export const uploadFile = async (
  file: File, 
  path: string,
  onProgress?: (progress: number) => void
): Promise<string>
```

### 3. Upload Modal Enhancements

**Files:** 
- `components/modals/EditProfileModal.tsx`
- `components/modals/UploadProjectModal.tsx`

**State additions:**
```typescript
const [uploadProgress, setUploadProgress] = useState<number>(0);
const [uploadError, setUploadError] = useState<string | null>(null);
```

**UI improvements:**
- Progress bar showing upload percentage
- Clear error messages with retry option
- Success confirmation before modal closes

## Data Models

No changes to existing data models. The upload process continues to use:

```typescript
interface GalleryItem {
  id: string;
  userId: string;
  courseId: string;
  title: string;
  description: string;
  imageUrl: string;
  submittedAt: Date;
  likes: number;
  tags: string[];
}

interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  bannerURL?: string | null;
  bio?: string;
  location?: string;
  role?: string;
  xp: number;
  level: number;
  streakDays: number;
  lastLogin: any;
  enrolledCourses: string[];
  courseProgress: CourseProgress[];
  savedProjects: string[];
  likedProjects: string[];
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Upload Completion
*For any* valid image file under 5MB, when uploaded through the upload modal, the upload should either complete successfully and return a URL, or fail with a specific error message within 60 seconds.
**Validates: Requirements 1.1, 1.2**

### Property 2: Progress Monotonicity
*For any* upload in progress, the progress percentage should be monotonically increasing (never decrease) from 0 to 100.
**Validates: Requirements 3.1, 3.2**

### Property 3: Error State Recovery
*For any* upload that fails, the modal UI state should reset to allow the user to retry the upload without closing and reopening the modal.
**Validates: Requirements 2.3**

### Property 4: CORS Configuration Validation
*For any* Firebase Storage bucket, when CORS is properly configured, preflight OPTIONS requests should succeed before the actual upload begins.
**Validates: Requirements 1.4**

## Error Handling

### Error Categories

1. **CORS Errors**
   - Detection: Upload fails to start (uploadStarted = false) within timeout
   - Message: "Upload blocked by browser security. Please configure CORS on Firebase Storage."
   - Action: Provide setup instructions

2. **Network Errors**
   - Detection: Upload starts but fails during transfer
   - Message: "Upload failed due to network issues. Please check your connection and try again."
   - Action: Enable retry button

3. **Timeout Errors**
   - Detection: Upload exceeds 60 second timeout
   - Message: "Upload timed out. Please try a smaller file or check your connection."
   - Action: Enable retry button

4. **Permission Errors**
   - Detection: Firebase returns permission-denied error
   - Message: "Permission denied. Please check Firebase Security Rules."
   - Action: Log user out and back in, or contact support

### Error Display

All errors should:
- Display in a prominent alert/toast notification
- Include actionable next steps
- Log detailed error information to console
- Reset the upload UI to allow retry

## Testing Strategy

### Unit Tests

1. **Test CORS Configuration Detection**
   - Mock fetch to simulate CORS preflight failure
   - Verify error message mentions CORS
   - Verify setup instructions are provided

2. **Test Progress Tracking**
   - Mock uploadBytesResumable with progress events
   - Verify progress callback is called with increasing values
   - Verify progress reaches 100% on completion

3. **Test Error Recovery**
   - Simulate upload failure
   - Verify modal state resets
   - Verify retry button appears
   - Verify user can retry upload

4. **Test Timeout Handling**
   - Mock slow upload that exceeds timeout
   - Verify timeout error is thrown
   - Verify upload task is cancelled

### Property-Based Tests

1. **Property Test: Upload Progress Monotonicity**
   - Generate random file sizes (1KB - 5MB)
   - Track all progress updates during upload
   - Verify each progress value >= previous value
   - **Feature: fix-upload-stuck-state, Property 2: Progress Monotonicity**

2. **Property Test: Upload Completion**
   - Generate random valid image files
   - Attempt upload
   - Verify result is either success URL or specific error
   - Verify completion within 60 seconds
   - **Feature: fix-upload-stuck-state, Property 1: Upload Completion**

### Integration Tests

1. **Test Full Upload Flow**
   - Open upload modal
   - Select file
   - Fill in required fields
   - Click upload
   - Verify progress updates
   - Verify success state
   - Verify modal closes
   - Verify item appears in gallery/profile

2. **Test CORS Configuration**
   - Make actual upload to Firebase Storage
   - Verify preflight request succeeds
   - Verify upload completes
   - Verify download URL is accessible

### Manual Testing Checklist

- [ ] Upload profile image successfully
- [ ] Upload project image successfully
- [ ] See progress bar during upload
- [ ] See success message on completion
- [ ] Retry after network error
- [ ] See clear error for CORS issue
- [ ] Upload works on different browsers (Chrome, Firefox, Safari)
- [ ] Upload works on mobile devices

## Implementation Notes

### CORS Setup Priority

The CORS configuration MUST be completed first before any code changes will work. Without proper CORS setup:
- Uploads will continue to hang
- Error messages will appear but uploads won't succeed
- Testing will be blocked

### Setup Instructions for User

1. Install Google Cloud SDK (includes gsutil)
2. Authenticate: `gcloud auth login`
3. Create cors.json file with configuration
4. Run: `gsutil cors set cors.json gs://vibe-dev-26.firebasestorage.app`
5. Verify: `gsutil cors get gs://vibe-dev-26.firebasestorage.app`

### Alternative: Firebase Console Method

If gsutil is not available:
1. Go to Firebase Console → Storage
2. Click on bucket name
3. Go to "Permissions" tab
4. Add CORS configuration through UI (if available)
5. Or use Firebase CLI: `firebase deploy --only storage`

### Development vs Production

- **Development**: Use `"origin": ["*"]` to allow all origins
- **Production**: Restrict to specific domains:
  ```json
  "origin": ["https://yourdomain.com", "https://www.yourdomain.com"]
  ```
