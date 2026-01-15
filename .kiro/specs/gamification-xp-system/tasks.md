# Implementation Plan: Gamification XP System

## Overview

This implementation plan builds out the functional gamification XP system for the Vibe Dev platform. The tasks are organized to deliver incremental value, starting with core XP tracking, then adding achievements, streaks, and finally UI enhancements. Each task builds on previous work to ensure a stable, testable implementation.

## Tasks

- [x] 1. Update Firestore schema and data models
  - Update `types.ts` to include new gamification fields
  - Add `CourseProgress` interface with `completedLessons` array
  - Add `XPTransaction`, `AchievementUnlock`, and `DailyChallengeProgress` interfaces
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [ ]* 1.1 Write unit tests for type definitions
  - Test that interfaces have required fields
  - Test type compatibility with existing code
  - _Requirements: 8.1_

- [x] 2. Create XP Service module
  - [x] 2.1 Implement XP calculation functions
    - Create `services/xpService.ts`
    - Implement `calculateLessonXP(lessonType)` function
    - Implement `calculateAchievementXP(achievement)` function
    - Implement `calculateStreakBonus(streakDays)` function
    - Define XP_REWARDS constants
    - _Requirements: 1.1_

  - [ ]* 2.2 Write property test for XP non-negativity
    - **Property 1: XP Non-Negativity**
    - **Validates: Requirements 1.5**

  - [ ]* 2.3 Write unit tests for XP calculations
    - Test lesson XP for each lesson type
    - Test achievement XP for each tier
    - Test streak bonus calculation
    - _Requirements: 1.1_

  - [x] 2.4 Implement XP award function with retry logic
    - Create `awardXP(userId, amount, reason)` function
    - Add validation for XP amounts
    - Implement retry logic with exponential backoff
    - Log XP transactions to `xpTransactions` collection
    - Check for level up after XP award
    - _Requirements: 1.1, 1.2, 1.4, 10.1_

  - [ ]* 2.5 Write property test for XP persistence consistency
    - **Property 2: XP Persistence Consistency**
    - **Validates: Requirements 1.2**

  - [ ]* 2.6 Write property test for XP transaction logging
    - **Property 10: XP Transaction Logging**
    - **Validates: Requirements 1.2**

- [x] 3. Create Achievement Service module
  - [x] 3.1 Implement achievement checking logic
    - Create `services/achievementService.ts`
    - Implement `evaluateRequirement(requirement, context, userProfile)` function
    - Implement `checkAchievements(userId, context)` function
    - Handle all requirement types (lesson_complete, course_complete, streak, xp_total, projects, likes)
    - _Requirements: 2.1, 2.6_

  - [ ]* 3.2 Write property test for achievement requirement evaluation
    - **Property 9: Achievement Requirement Evaluation**
    - **Validates: Requirements 2.1**

  - [x] 3.3 Implement achievement unlock function
    - Create `unlockAchievement(userId, achievementId)` function
    - Check if achievement is already unlocked (prevent duplicates)
    - Add achievement ID to user's `unlockedAchievements` array
    - Award achievement XP
    - Log unlock to `achievementUnlocks` collection
    - _Requirements: 2.2, 2.3, 2.5_

  - [ ]* 3.4 Write property test for achievement unlock idempotence
    - **Property 3: Achievement Unlock Idempotence**
    - **Validates: Requirements 2.5**

  - [ ]* 3.5 Write unit tests for achievement service
    - Test requirement evaluation for each type
    - Test secret achievement handling
    - Test achievement unlock flow
    - _Requirements: 2.1, 2.2, 2.3_

- [x] 4. Create Streak Service module
  - [x] 4.1 Implement streak calculation logic
    - Create `services/streakService.ts`
    - Implement `updateStreak(userId)` function
    - Calculate hours since last login
    - Increment streak if 24-48 hours
    - Reset streak if >48 hours
    - Award streak bonus XP
    - Update `lastLogin` timestamp
    - _Requirements: 5.1, 5.2, 5.3, 5.5_

  - [ ]* 4.2 Write property test for streak increment logic
    - **Property 6: Streak Increment Logic**
    - **Validates: Requirements 5.2**

  - [ ]* 4.3 Write property test for streak reset logic
    - **Property 7: Streak Reset Logic**
    - **Validates: Requirements 5.3**

  - [ ]* 4.4 Write unit tests for streak service
    - Test streak increment on consecutive days
    - Test streak reset after missed day
    - Test same-day login (no change)
    - Test streak bonus XP calculation
    - _Requirements: 5.2, 5.3_

- [x] 5. Create Lesson Completion Service
  - [x] 5.1 Implement lesson completion tracking
    - Create `services/lessonService.ts`
    - Implement `completeLesson(userId, courseId, lessonId)` function
    - Check if lesson already completed (prevent duplicates)
    - Add lesson to user's `completedLessons` array in course progress
    - Award lesson XP based on lesson type
    - Check for lesson-related achievements
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

  - [ ]* 5.2 Write property test for lesson completion idempotence
    - **Property 5: Lesson Completion Idempotence**
    - **Validates: Requirements 4.4**

  - [x] 5.3 Implement course completion tracking
    - Implement `completeCourse(userId, courseId)` function
    - Mark course as completed in user's course progress
    - Award course completion XP
    - Check for course completion achievements
    - _Requirements: 4.5_

  - [ ]* 5.4 Write unit tests for lesson service
    - Test lesson completion flow
    - Test duplicate lesson completion prevention
    - Test course completion flow
    - _Requirements: 4.1, 4.4, 4.5_

- [ ] 6. Checkpoint - Core services complete
  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. Create GamificationContext
  - [x] 7.1 Set up context structure
    - Create `contexts/GamificationContext.tsx`
    - Define `GamificationContextType` interface
    - Set up `useReducer` for state management
    - Create context provider component
    - _Requirements: 9.1, 9.2, 9.3_

  - [x] 7.2 Implement real-time Firestore listeners
    - Subscribe to user profile document with `onSnapshot`
    - Update context state when XP, level, or achievements change
    - Handle listener cleanup on unmount
    - _Requirements: 1.3, 9.1_

  - [x] 7.3 Implement context action methods
    - Implement `awardXP(amount, reason)` method
    - Implement `completeLesson(courseId, lessonId)` method
    - Implement `completeCourse(courseId)` method
    - Implement `checkAchievements()` method
    - Implement `updateStreak()` method
    - Wire methods to service functions
    - _Requirements: 1.1, 4.1, 4.5, 5.2_

  - [ ]* 7.4 Write integration tests for GamificationContext
    - Test XP award flow
    - Test lesson completion flow
    - Test achievement unlock flow
    - Test real-time updates
    - _Requirements: 1.1, 4.1, 2.2_

- [x] 8. Implement Daily Challenges
  - [x] 8.1 Create daily challenge service
    - Create `services/dailyChallengeService.ts`
    - Implement `getDailyChallenges(userId)` function
    - Implement `completeDailyChallenge(userId, challengeId)` function
    - Check if challenge already completed today
    - Award challenge XP
    - Store completion in `dailyChallengeProgress` collection
    - _Requirements: 6.1, 6.2, 6.3, 6.5_

  - [ ]* 8.2 Write property test for daily challenge reset
    - **Property 8: Daily Challenge Reset**
    - **Validates: Requirements 6.5**

  - [ ]* 8.3 Write unit tests for daily challenge service
    - Test challenge completion
    - Test duplicate completion prevention
    - Test daily reset logic
    - _Requirements: 6.2, 6.3, 6.5_

  - [x] 8.4 Add daily challenge methods to GamificationContext
    - Implement `completeDailyChallenge(challengeId)` method
    - Add `dailyChallenges` state to context
    - _Requirements: 6.1, 6.2_

- [x] 9. Implement Social Activity XP
  - [x] 9.1 Create social XP functions
    - Add `uploadProject(userId, projectId)` function to XP service
    - Add `receiveProjectLike(userId, projectId)` function to XP service
    - Award XP for project uploads
    - Award XP for likes received
    - Check for social achievements
    - _Requirements: 7.1, 7.2, 7.3_

  - [ ]* 9.2 Write unit tests for social XP
    - Test project upload XP award
    - Test like received XP award
    - Test social achievement unlocks
    - _Requirements: 7.1, 7.2, 7.3_

  - [x] 9.3 Integrate social XP with existing upload/like functions
    - Update `createGalleryItem` in `firebase.ts` to call `uploadProject`
    - Update `toggleProjectLike` in `firebase.ts` to call `receiveProjectLike`
    - _Requirements: 7.1, 7.2_

- [x] 10. Create Notification Service
  - [x] 10.1 Implement notification components
    - Create `components/notifications/XPToast.tsx`
    - Create `components/notifications/LevelUpModal.tsx`
    - Create `components/notifications/AchievementUnlock.tsx`
    - Create `components/notifications/StreakBadge.tsx`
    - Add animations with CSS transitions
    - _Requirements: 2.4, 3.2, 3.3, 9.2, 9.3_

  - [x] 10.2 Create notification service
    - Create `services/notificationService.ts`
    - Implement notification queue to prevent spam
    - Implement `showXPGain(amount, reason)` function
    - Implement `showLevelUp(newLevel)` function
    - Implement `showAchievementUnlock(achievement)` function
    - Implement `showStreakUpdate(streak)` function
    - _Requirements: 2.4, 3.2, 3.3_

  - [x] 10.3 Integrate notifications with GamificationContext
    - Call notification service when XP is awarded
    - Call notification service when level up occurs
    - Call notification service when achievement unlocks
    - Call notification service when streak updates
    - _Requirements: 9.2, 9.3, 9.4_

- [x] 11. Update UI components to use GamificationContext
  - [x] 11.1 Update Sidebar to show real-time XP
    - Import and use `useGamification` hook
    - Display current XP and level
    - Show XP progress bar
    - _Requirements: 9.1, 9.4_

  - [x] 11.2 Update AchievementsPanel to show unlocked achievements
    - Use real `unlockedAchievements` from context instead of mock data
    - Update achievement cards to reflect unlock status
    - _Requirements: 9.5_

  - [x] 11.3 Update Dashboard to show daily challenges
    - Display available daily challenges
    - Show completion status
    - Add click handlers to complete challenges
    - _Requirements: 6.1_

  - [x] 11.4 Update CourseView to trigger lesson completions
    - Call `completeLesson` when user finishes a lesson
    - Show XP gain notification
    - _Requirements: 4.1, 9.1_

- [x] 12. Implement error handling and validation
  - [x] 12.1 Add error handling to all service functions
    - Wrap database operations in try-catch blocks
    - Use `retryOperation` helper for transient failures
    - Log errors with context
    - Show user-friendly error messages
    - _Requirements: 10.1, 10.2, 10.3, 10.4_

  - [ ]* 12.2 Write unit tests for error handling
    - Test retry logic
    - Test error logging
    - Test fallback behavior
    - _Requirements: 10.1, 10.2_

  - [x] 12.3 Add validation to all input parameters
    - Validate XP amounts are positive integers
    - Validate user IDs are non-empty strings
    - Validate achievement IDs exist in ACHIEVEMENTS array
    - _Requirements: 1.5, 10.2, 10.3_

  - [ ]* 12.4 Write unit tests for validation
    - Test invalid XP amounts
    - Test invalid user IDs
    - Test invalid achievement IDs
    - _Requirements: 1.5, 10.2, 10.3_

- [-] 13. Add level calculation utilities
  - [x] 13.1 Implement level progression functions
    - Verify `getLevelFromXP` function works correctly
    - Verify `getXPProgress` function works correctly
    - Verify `getNextLevel` function works correctly
    - Add memoization for performance
    - _Requirements: 3.1, 3.3, 3.4_

  - [ ]* 13.2 Write property test for level calculation consistency
    - **Property 4: Level Calculation Consistency**
    - **Validates: Requirements 3.1**

  - [ ]* 13.3 Write unit tests for level utilities
    - Test level calculation for various XP values
    - Test XP progress calculation
    - Test next level retrieval
    - Test maximum level handling
    - _Requirements: 3.1, 3.4, 3.5_

- [ ] 14. Update AuthContext to trigger streak updates
  - [ ] 14.1 Call updateStreak on user login
    - Import `updateStreak` from streak service
    - Call `updateStreak` in `onAuthStateChanged` handler
    - Handle streak update errors gracefully
    - _Requirements: 5.1, 5.5_

  - [ ]* 14.2 Write integration test for login streak flow
    - Test streak increment on consecutive logins
    - Test streak reset after missed day
    - _Requirements: 5.1, 5.2, 5.3_

- [ ] 15. Final checkpoint - Integration testing
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 16. Performance optimizations
  - [ ] 16.1 Add XP update debouncing
    - Implement debounce logic in GamificationContext
    - Batch multiple XP awards within 1 second
    - _Requirements: 1.1, 1.2_

  - [ ] 16.2 Add caching for level calculations
    - Memoize `getLevelFromXP` results
    - Clear cache when LEVELS configuration changes
    - _Requirements: 3.1_

  - [ ] 16.3 Optimize achievement checks
    - Only check achievements relevant to the action performed
    - Skip already-unlocked achievements early
    - _Requirements: 2.1_

- [ ] 17. Documentation and cleanup
  - [ ] 17.1 Add JSDoc comments to all service functions
    - Document parameters, return values, and side effects
    - Add usage examples
    - _Requirements: All_

  - [ ] 17.2 Update README with gamification system overview
    - Document XP earning methods
    - Document achievement system
    - Document level progression
    - _Requirements: All_

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties
- Unit tests validate specific examples and edge cases
- Integration tests validate end-to-end workflows
