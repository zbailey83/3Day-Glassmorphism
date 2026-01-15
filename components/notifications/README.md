# Notification System

This directory contains the notification components and service for the gamification XP system.

## Components

### XPToast
A small floating notification that appears in the top-right corner showing XP gains.

**Props:**
- `amount: number` - Amount of XP gained
- `reason: string` - Reason for XP gain
- `onClose: () => void` - Callback when notification closes

**Auto-closes after:** 3 seconds

### LevelUpModal
A full-screen modal celebrating level ups with animations.

**Props:**
- `newLevel: LevelInfo` - The new level information
- `onClose: () => void` - Callback when modal closes

**Auto-closes after:** 5 seconds

### AchievementUnlock
An animated card showing achievement unlock details.

**Props:**
- `achievement: Achievement` - The unlocked achievement
- `onClose: () => void` - Callback when notification closes

**Auto-closes after:** 4 seconds

### StreakBadge
A corner notification showing current streak status.

**Props:**
- `streak: number` - Current streak count
- `onClose: () => void` - Callback when notification closes

**Auto-closes after:** 3 seconds

### NotificationContainer
Container component that manages and renders all active notifications.

**Usage:**
Add this component to your app root (e.g., in App.tsx):

```tsx
import { NotificationContainer } from './components/notifications/NotificationContainer';

function App() {
  return (
    <>
      {/* Your app content */}
      <NotificationContainer />
    </>
  );
}
```

## Notification Service

The notification service (`services/notificationService.ts`) provides functions to trigger notifications:

### Functions

#### `showXPGain(amount: number, reason: string): void`
Shows an XP gain toast notification.

```tsx
import { showXPGain } from '../services/notificationService';

showXPGain(50, 'Completed lesson');
```

#### `showLevelUp(newLevel: LevelInfo): void`
Shows a level up modal.

```tsx
import { showLevelUp } from '../services/notificationService';
import { getLevelFromXP } from '../src/data/gamification';

const newLevel = getLevelFromXP(500);
showLevelUp(newLevel);
```

#### `showAchievementUnlock(achievement: Achievement): void`
Shows an achievement unlock notification.

```tsx
import { showAchievementUnlock } from '../services/notificationService';
import { ACHIEVEMENTS } from '../src/data/gamification';

const achievement = ACHIEVEMENTS.find(a => a.id === 'first-vibe');
if (achievement) {
  showAchievementUnlock(achievement);
}
```

#### `showStreakUpdate(streak: number): void`
Shows a streak badge notification.

```tsx
import { showStreakUpdate } from '../services/notificationService';

showStreakUpdate(7);
```

## Notification Queue

The notification service includes a queue system that:
- Prevents notification spam by spacing them out (500ms delay between notifications)
- Ensures notifications appear in order
- Allows multiple notifications to be queued without overwhelming the UI

## Integration with GamificationContext

The notification service is automatically integrated with the GamificationContext:
- XP awards trigger XP toast notifications
- Level ups trigger level up modals
- Achievement unlocks trigger achievement notifications
- Streak updates trigger streak badges

No manual notification calls are needed when using GamificationContext methods.

## Styling

All notification components use inline styles with CSS transitions for animations. Key features:
- Smooth entrance/exit animations
- Responsive design (works on mobile and desktop)
- Accessible color contrasts
- Hover effects on interactive elements

## Customization

To customize notification appearance:
1. Edit the inline styles in each component
2. Adjust animation durations in the `useEffect` hooks
3. Modify the `DELAY_BETWEEN_NOTIFICATIONS` constant in `notificationService.ts` to change queue timing
