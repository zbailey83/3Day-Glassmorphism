<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1aFdDMSr2rLagJab1i9Iz7HYJ9Wzmwk6j

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. **Configure Firebase Storage CORS** (required for file uploads):
   See [SETUP.md](SETUP.md) for detailed instructions
4. Run the app:
   `npm run dev`

## Firebase Storage Setup

File uploads (profile images, project images) require CORS configuration on your Firebase Storage bucket. Without this, uploads will hang indefinitely.

**Quick setup:**
```bash
gsutil cors set cors.json gs://vibe-dev-26.firebasestorage.app
```

For detailed instructions, troubleshooting, and alternative methods, see [SETUP.md](SETUP.md).


---

## Gamification System

Vibe Dev includes a comprehensive gamification system that rewards users for learning activities, tracks progress, and unlocks achievements. The system is designed to motivate users and provide instant feedback on their accomplishments.

### Overview

The gamification system consists of:
- **XP (Experience Points)**: Earned through various activities
- **Levels**: Progress through 10 levels as you earn XP
- **Achievements**: Unlock 20+ achievements by completing milestones
- **Streaks**: Maintain daily login streaks for bonus XP
- **Daily Challenges**: Complete daily tasks for extra rewards

### XP Earning Methods

Users earn XP through the following activities:

#### Learning Activities
- **Video Lesson**: 25 XP
- **Reading Lesson**: 20 XP
- **Lab Lesson**: 50 XP
- **Course Completion**: 200 XP

#### Social Activities
- **Project Upload**: 30 XP
- **Project Like Received**: 5 XP

#### Daily Activities
- **Login Streak Bonus**: 5 XP per day (max 50 XP at 10+ days)
- **Daily Challenges**: 15-50 XP depending on difficulty

#### Achievements
- **Bronze Achievement**: 50 XP
- **Silver Achievement**: 100 XP
- **Gold Achievement**: 300 XP
- **Platinum Achievement**: 500 XP
- **Diamond Achievement**: 1000 XP

### Level Progression

Users progress through 10 levels, each with unique titles and perks:

| Level | Title | XP Required | Perks |
|-------|-------|-------------|-------|
| 1 | Novice | 0 | Welcome to Vibe Dev! |
| 2 | Learner | 100 | Unlocked achievements panel |
| 3 | Explorer | 300 | Unlocked project gallery |
| 4 | Builder | 600 | Can upload projects |
| 5 | Creator | 1000 | Unlocked daily challenges |
| 6 | Innovator | 1500 | Custom profile banner |
| 7 | Expert | 2100 | Priority support |
| 8 | Master | 2800 | Exclusive badges |
| 9 | Legend | 3600 | Leaderboard access |
| 10 | Guru | 4500 | All features unlocked |

### Achievement System

The platform features 20+ achievements across multiple categories:

#### Learning Achievements
- **First Steps**: Complete your first lesson
- **Quick Learner**: Complete 5 lessons in one course
- **Course Master**: Complete an entire course
- **Knowledge Seeker**: Complete 3 different courses

#### Streak Achievements
- **Consistent**: Maintain a 3-day streak
- **Dedicated**: Maintain a 7-day streak
- **Unstoppable**: Maintain a 30-day streak

#### XP Achievements
- **Rising Star**: Earn 100 total XP
- **Power User**: Earn 500 total XP
- **XP Master**: Earn 1000 total XP

#### Social Achievements
- **First Share**: Upload your first project
- **Content Creator**: Upload 5 projects
- **Popular**: Receive 10 likes on your projects

#### Special Achievements
- **Early Bird**: Complete a lesson before 8 AM
- **Night Owl**: Complete a lesson after 10 PM
- **Weekend Warrior**: Complete 5 lessons on a weekend

### Achievement Tiers

Achievements are categorized by difficulty:
- **Bronze**: Entry-level achievements
- **Silver**: Moderate difficulty
- **Gold**: Challenging milestones
- **Platinum**: Significant accomplishments
- **Diamond**: Elite achievements

### Daily Challenges

Daily challenges reset at midnight UTC and provide bonus XP:

- **Daily Lesson**: Complete any lesson (15 XP)
- **Lab Master**: Complete a lab lesson (25 XP)
- **Social Butterfly**: Upload a project or like 3 projects (20 XP)
- **Streak Keeper**: Maintain your login streak (10 XP)
- **Course Progress**: Complete 3 lessons in one course (30 XP)

### Streak System

The streak system rewards consistent daily engagement:

#### Streak Rules
- **Same Day** (< 24 hours): Streak unchanged
- **Next Day** (24-48 hours): Streak increments by 1, bonus XP awarded
- **Missed Day** (> 48 hours): Streak resets to 1

#### Streak Bonuses
- Earn 5 XP per day of streak
- Maximum bonus: 50 XP (10+ day streak)
- Bonus XP awarded on each consecutive login

### Real-time Notifications

The system provides instant feedback through various notification types:

- **XP Toast**: Small notification showing XP gained and reason
- **Level Up Modal**: Full-screen celebration when leveling up
- **Achievement Unlock**: Animated card displaying new achievement
- **Streak Badge**: Corner notification showing current streak

### Technical Implementation

The gamification system is built with:

- **Frontend**: React with TypeScript
- **State Management**: React Context API with useReducer
- **Database**: Firebase Firestore
- **Real-time Updates**: Firestore onSnapshot listeners
- **Notifications**: Custom queue system to prevent spam

#### Key Services

- **xpService**: Handles XP calculations and awards
- **achievementService**: Manages achievement unlocking and validation
- **streakService**: Tracks daily login streaks
- **lessonService**: Handles lesson and course completions
- **dailyChallengeService**: Manages daily challenge logic
- **notificationService**: Queues and displays notifications

#### Data Models

All gamification data is stored in Firestore:

- **users**: User profiles with XP, level, streak, and achievements
- **xpTransactions**: Log of all XP awards
- **achievementUnlocks**: Record of achievement unlocks
- **dailyChallengeProgress**: Daily challenge completion tracking

### Error Handling

The system includes robust error handling:

- **Retry Logic**: Database operations retry up to 3 times with exponential backoff
- **Validation**: All inputs validated before processing
- **Idempotency**: Duplicate operations (same lesson, achievement) prevented
- **Graceful Degradation**: Errors don't break the user experience

### Performance Optimizations

- **Debouncing**: Multiple XP awards batched within 1 second
- **Caching**: Level calculations memoized
- **Lazy Checks**: Only relevant achievements checked per action
- **Indexed Queries**: Firestore composite indexes for fast queries

### Future Enhancements

Planned features for future releases:

- **Leaderboards**: Competitive XP rankings
- **Weekly Challenges**: Special challenges with bigger rewards
- **XP Multiplier Events**: 2x XP weekends
- **Achievement Badges**: Display badges on user profiles
- **XP Shop**: Spend XP on cosmetic rewards
- **Teams/Guilds**: Collaborative XP earning

---

## Documentation

For more detailed information:

- **Setup Guide**: [SETUP.md](SETUP.md)
- **Firebase Configuration**: [FIREBASE_SETUP.md](FIREBASE_SETUP.md)
- **Gamification Spec**: [.kiro/specs/gamification-xp-system/](.kiro/specs/gamification-xp-system/)
