# Firestore Connection Troubleshooting

## Error: "Failed to get document because the client is offline"

This error means Firestore cannot connect to the Firebase servers. Here's how to fix it:

### Quick Fixes

1. **Check Internet Connection**
   - Ensure you have an active internet connection
   - Try opening https://firebase.google.com in a new tab

2. **Disable Browser Extensions**
   - Ad blockers (uBlock Origin, AdBlock Plus)
   - Privacy extensions (Privacy Badger, Ghostery)
   - VPN extensions
   - Try in Incognito/Private mode

3. **Check Firestore Rules**
   - Go to Firebase Console: https://console.firebase.google.com
   - Select project: `vibe-dev-26`
   - Navigate to Firestore Database → Rules
   - Ensure rules allow authenticated users to read/write

### Recommended Firestore Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow authenticated users to read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Allow authenticated users to read/write XP transactions
    match /xpTransactions/{transactionId} {
      allow read, write: if request.auth != null;
    }
    
    // Allow authenticated users to read/write achievement unlocks
    match /achievementUnlocks/{unlockId} {
      allow read, write: if request.auth != null;
    }
    
    // Allow authenticated users to read/write daily challenge progress
    match /dailyChallengeProgress/{progressId} {
      allow read, write: if request.auth != null;
    }
    
    // Allow authenticated users to read/write gallery items
    match /gallery/{itemId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Allow authenticated users to read/write tool usage
    match /toolUsage/{usageId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### Check Browser Console

Open DevTools (F12) and look for:

1. **Red errors** about Firebase or Firestore
2. **Network tab** - Check if requests to `firestore.googleapis.com` are blocked
3. **Console warnings** about CORS or CSP

### Test Firestore Connection

Run this in the browser console:

```javascript
// Test if Firestore is accessible
import { getFirestore, doc, getDoc } from 'firebase/firestore';
const db = getFirestore();
const testRef = doc(db, 'users', 'test');
getDoc(testRef).then(() => console.log('✅ Firestore connected')).catch(err => console.error('❌ Firestore error:', err));
```

### Common Causes

1. **Firestore Rules Too Restrictive**
   - Default rules deny all access after 30 days
   - Update rules in Firebase Console

2. **Network Blocking**
   - Corporate firewall blocking Firebase
   - ISP blocking Google services
   - Browser extension blocking requests

3. **Multiple Tabs**
   - Firestore persistence can fail with multiple tabs
   - Close other tabs and refresh

4. **Browser Cache**
   - Clear browser cache and cookies
   - Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)

### Still Not Working?

1. Check Firebase Console for service status
2. Verify project ID matches: `vibe-dev-26`
3. Check if billing is enabled (required for some features)
4. Try a different browser
5. Check if you're logged in to Firebase Console with the correct account

### Manual XP Update (Temporary Workaround)

If you need to manually update XP while troubleshooting:

1. Go to Firebase Console
2. Navigate to Firestore Database
3. Find your user document in `users` collection
4. Manually edit the `xp` and `level` fields

This is temporary - the real fix is getting Firestore connection working.
