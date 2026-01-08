# Firebase Storage CORS Setup

This document provides instructions for configuring Cross-Origin Resource Sharing (CORS) on your Firebase Storage bucket to enable file uploads from your application.

## Why CORS Configuration is Needed

Firebase Storage blocks cross-origin requests by default for security. Without proper CORS configuration, file uploads (profile images, project images) will hang indefinitely because the browser's preflight OPTIONS request will fail.

## Prerequisites

You need one of the following tools to configure CORS:

### Option 1: Google Cloud SDK (Recommended)

The Google Cloud SDK includes the `gsutil` command-line tool needed to configure CORS.

**Installation:**

- **macOS (Homebrew):**
  ```bash
  brew install google-cloud-sdk
  ```

- **Windows:**
  Download and run the installer from: https://cloud.google.com/sdk/docs/install

- **Linux:**
  ```bash
  curl https://sdk.cloud.google.com | bash
  exec -l $SHELL
  ```

- **Alternative (Python pip):**
  ```bash
  pip install gsutil
  ```

For detailed installation instructions, visit: https://cloud.google.com/sdk/docs/install

## Configuration Steps

### Step 1: Authenticate with Google Cloud

```bash
gcloud auth login
```

This will open a browser window for you to authenticate with your Google account.

### Step 2: Verify the CORS Configuration File

The `cors.json` file in the project root contains the CORS configuration:

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

**Note:** The `"origin": ["*"]` setting allows all origins during development. For production, you should restrict this to your specific domain(s).

### Step 3: Apply CORS Configuration

Run the following command to apply the CORS configuration to your Firebase Storage bucket:

```bash
gsutil cors set cors.json gs://vibe-dev-26.firebasestorage.app
```

**Important:** Replace `vibe-dev-26.firebasestorage.app` with your actual Firebase Storage bucket name if different.

### Step 4: Verify Configuration

Verify that the CORS configuration was applied successfully:

```bash
gsutil cors get gs://vibe-dev-26.firebasestorage.app
```

This should output the CORS configuration you just applied.

## Production Configuration

For production environments, update the `cors.json` file to restrict origins to your specific domain(s):

```json
[
  {
    "origin": ["https://yourdomain.com", "https://www.yourdomain.com"],
    "method": ["GET", "POST", "PUT", "DELETE", "HEAD"],
    "maxAgeSeconds": 3600,
    "responseHeader": ["Content-Type", "Authorization"]
  }
]
```

Then reapply the configuration using the same `gsutil cors set` command.

## Troubleshooting

### Issue: "gsutil: command not found"

**Solution:** Install the Google Cloud SDK following the prerequisites section above.

### Issue: "AccessDeniedException: 403"

**Solution:** Ensure you're authenticated with an account that has permission to modify the Firebase Storage bucket:
1. Run `gcloud auth login` again
2. Verify you're using the correct Google account associated with your Firebase project
3. Check that your account has the "Storage Admin" role in the Firebase Console

### Issue: Uploads still hanging after CORS configuration

**Solutions:**
1. Clear your browser cache and cookies
2. Verify the CORS configuration was applied: `gsutil cors get gs://your-bucket-name`
3. Check the browser console for specific error messages
4. Ensure your Firebase Storage Security Rules allow uploads
5. Try uploading from an incognito/private browser window

### Issue: "Invalid bucket name"

**Solution:** Find your correct bucket name:
1. Go to Firebase Console → Storage
2. Copy the bucket name from the URL or the bucket list
3. The format is usually: `your-project-id.firebasestorage.app`

## Alternative: Firebase Console Method

If you cannot install gsutil, you may be able to configure CORS through the Firebase Console:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to Storage
4. Click on your bucket name
5. Look for CORS configuration options in the bucket settings

**Note:** The Firebase Console UI for CORS configuration may vary. The gsutil method is more reliable and consistent.

## Testing the Configuration

After applying the CORS configuration:

1. Start your development server: `npm run dev`
2. Try uploading a profile image or project image
3. Check the browser console for any CORS-related errors
4. The upload should now complete successfully with a progress indicator

## Additional Resources

- [Firebase Storage CORS Documentation](https://firebase.google.com/docs/storage/web/download-files#cors_configuration)
- [Google Cloud Storage CORS Documentation](https://cloud.google.com/storage/docs/configuring-cors)
- [gsutil CORS Command Reference](https://cloud.google.com/storage/docs/gsutil/commands/cors)
