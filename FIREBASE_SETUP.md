# Firebase Security Rules Setup

If you are seeing "Missing or insufficient permissions", your Firebase Security Rules are likely blocking the application from saving data. 

Please go to your Firebase Console and update the rules for **both** Firestore and Storage.

## 1. Firestore Database Rules

1. Go to **Build** > **Firestore Database** > **Rules** tab.
2. Paste the following code (allows any logged-in user to read/write everything - strictly for development):

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow any logged in user to read/write everything
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

3. Click **Publish**.

## 2. Storage Rules

1. Go to **Build** > **Storage** > **Rules** tab.
2. Paste the following code:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      // Allow any logged in user to read/write files
      allow read, write: if request.auth != null;
    }
  }
}
```

3. Click **Publish**.

---

### Why this happens
Even in "Test Mode", Firebase sometimes sets rules that expire after 30 days or requires specific conditions. The rules above explicitly allow any user who has signed in (via Google or Email) to save their data.
