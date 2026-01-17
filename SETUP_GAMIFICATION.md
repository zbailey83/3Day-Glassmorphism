# Gamification System Setup Guide

## Critical: Deploy Firestore Rules

The gamification system requires proper Firestore security rules to function. Follow these steps:

### Step 1: Deploy Firestore Rules

```bash
# Install Firebase CLI if not already installed
npm install -g firebase-tools

# Login to Firebase
firebase login

# Deploy Firestore rules
firebase deploy --only firestore:rules
```

### Step 2: Verify Rules in Firebase Console

1. Go to: https://console.firebase.google.com/project/vibe-dev-26/firestore/rules
2. You should see the rules from `firestore.rules`
3. Click "Publish" if they're not already published

### Step 3: Initialize Your User Profile Manually

If your user profile doesn't have gamification fields, run this in the browser console:

```javascript
// Get your user ID
const userId = firebase.auth().currentUser.uid;

// Initialize gamification fields
firebase.firestore().collection('users').doc(userId).set({
  xp: 0,
  level: 1,
  streakDays: 1,
  unlockedAchievements: [],
  lastLogin: firebase.firestore.FieldValue.serverTimestamp()
}, { merge: true }).then(() => {
  console.log('✅ Gamification fields initialized!');
  location.reload(); // Refresh the page
}).catch(err => console.error('❌ Error:', err));
```

### Step 4: Test XP Award

After initialization, test by completing a lesson:

1. Navigate to any lesson
2. Scroll to bottom
3. Click "Complete Lesson & Earn XP"
4. Check console for logs
5. XP should update in sidebar

## Troubleshooting

### Error: "client is offline"

**Cause**: Firestore rules are blocking access or not deployed

**Fix**:
1. Deploy rules: `firebase deploy --only firestore:rules`
2. Check Firebase Console for rule errors
3. Ensure you're logged in with correct account

### Error: "Missing or insufficient permissions"

**Cause**: Firestore rules don't allow the operation

**Fix**:
1. Check rules in Firebase Console
2. Ensure rules match `firestore.rules` file
3. Redeploy rules

### XP Not Updating

**Check these in order**:

1. **Console Logs** - Look for error messages
2. **Firestore Rules** - Ensure they're deployed
3. **User Profile** - Check if gamification fields exist
4. **Network Tab** - Check if Firestore requests are succeeding

### Manual Profile Check

Check your profile in Firebase Console:

1. Go to: https://console.firebase.google.com/project/vibe-dev-26/firestore/data
2. Navigate to `users` collection
3. Find your user document (by UID)
4. Verify these fields exist:
   - `xp` (number)
   - `level` (number)
   - `streakDays` (number)
   - `unlockedAchievements` (array)
   - `lastLogin` (timestamp)

If any are missing, add them manually or use the console script above.

## Expected Behavior

### On Login
```
✅ Firestore connected and ready
[Firebase] Firestore ready, syncing user profile...
[Firebase] ✅ User profile synced
```

### On Lesson Completion
```
[CourseView] Completing lesson: {...}
[GamificationContext] Completing lesson: {...}
[GamificationContext] Queued 20 XP for: Completed lesson: ...
[GamificationContext] ✅ Flushed XP queue: 20 XP from 1 awards
```

### In Sidebar
- XP count should update immediately
- Progress bar should fill
- Level should update when threshold reached

## Quick Fix Commands

### Deploy Everything
```bash
firebase deploy
```

### Deploy Only Rules
```bash
firebase deploy --only firestore:rules
```

### Check Current Rules
```bash
firebase firestore:rules get
```

### Test Rules Locally
```bash
firebase emulators:start --only firestore
```

## Support

If issues persist:
1. Share console logs (all messages)
2. Share Firestore rules from console
3. Share user profile structure from Firestore
4. Check Network tab for failed requests
