import { describe, test, expect } from 'vitest';
import { getLevelFromXP, getXPProgress, getNextLevel, LEVELS } from './gamification';

describe('Level Calculation Utilities', () => {
    describe('getLevelFromXP', () => {
        test('returns level 1 for 0 XP', () => {
            const level = getLevelFromXP(0);
            expect(level.level).toBe(1);
            expect(level.title).toBe('Curious Crab');
        });

        test('returns level 2 for 150 XP', () => {
            const level = getLevelFromXP(150);
            expect(level.level).toBe(2);
            expect(level.title).toBe('Eager Rabbit');
        });

        test('returns level 3 for 500 XP', () => {
            const level = getLevelFromXP(500);
            expect(level.level).toBe(3);
            expect(level.title).toBe('Steady Penguin');
        });

        test('returns level 10 for very high XP', () => {
            const level = getLevelFromXP(10000);
            expect(level.level).toBe(10);
            expect(level.title).toBe('Legendary Dino');
        });

        test('returns correct level at exact boundary (minXP)', () => {
            const level = getLevelFromXP(100); // Exact start of level 2
            expect(level.level).toBe(2);
        });

        test('returns correct level just before boundary', () => {
            const level = getLevelFromXP(99); // Just before level 2
            expect(level.level).toBe(1);
        });

        test('XP falls within returned level range', () => {
            const testXPs = [0, 50, 100, 250, 500, 1000, 2000, 3500, 5000, 10000];

            testXPs.forEach(xp => {
                const level = getLevelFromXP(xp);
                expect(xp).toBeGreaterThanOrEqual(level.minXP);
                expect(xp).toBeLessThan(level.maxXP);
            });
        });
    });

    describe('getXPProgress', () => {
        test('returns 0% progress at level start', () => {
            const progress = getXPProgress(0);
            expect(progress.current).toBe(0);
            expect(progress.percentage).toBe(0);
        });

        test('returns 50% progress at level midpoint', () => {
            // Level 1: 0-100, midpoint is 50
            const progress = getXPProgress(50);
            expect(progress.current).toBe(50);
            expect(progress.needed).toBe(100);
            expect(progress.percentage).toBe(50);
        });

        test('returns correct progress for level 2', () => {
            // Level 2: 100-300 (200 XP range)
            // At 200 XP, we're 100 XP into the level (50%)
            const progress = getXPProgress(200);
            expect(progress.current).toBe(100);
            expect(progress.needed).toBe(200);
            expect(progress.percentage).toBe(50);
        });

        test('returns 100% progress at max level', () => {
            const progress = getXPProgress(10000);
            expect(progress.percentage).toBe(100);
        });

        test('handles level boundaries correctly', () => {
            // At exact level boundary
            const progress = getXPProgress(100);
            expect(progress.current).toBe(0);
            expect(progress.percentage).toBe(0);
        });
    });

    describe('getNextLevel', () => {
        test('returns level 2 when at level 1', () => {
            const nextLevel = getNextLevel(0);
            expect(nextLevel).not.toBeNull();
            expect(nextLevel?.level).toBe(2);
            expect(nextLevel?.title).toBe('Eager Rabbit');
        });

        test('returns level 3 when at level 2', () => {
            const nextLevel = getNextLevel(150);
            expect(nextLevel).not.toBeNull();
            expect(nextLevel?.level).toBe(3);
        });

        test('returns null when at max level', () => {
            const nextLevel = getNextLevel(10000);
            expect(nextLevel).toBeNull();
        });

        test('returns correct next level for each level', () => {
            LEVELS.forEach((level, index) => {
                if (index < LEVELS.length - 1) {
                    const nextLevel = getNextLevel(level.minXP);
                    expect(nextLevel).not.toBeNull();
                    expect(nextLevel?.level).toBe(level.level + 1);
                }
            });
        });
    });

    describe('Edge cases', () => {
        test('handles negative XP gracefully', () => {
            const level = getLevelFromXP(-100);
            expect(level.level).toBe(1);
        });

        test('handles fractional XP', () => {
            const level = getLevelFromXP(150.5);
            expect(level.level).toBe(2);
        });

        test('all levels have valid ranges', () => {
            LEVELS.forEach((level, index) => {
                expect(level.minXP).toBeGreaterThanOrEqual(0);
                if (index < LEVELS.length - 1) {
                    expect(level.maxXP).toBeGreaterThan(level.minXP);
                    expect(LEVELS[index + 1].minXP).toBe(level.maxXP);
                } else {
                    expect(level.maxXP).toBe(Infinity);
                }
            });
        });
    });
});

describe('Memoization', () => {
    test('getLevelFromXP returns same object reference for same XP', () => {
        const level1 = getLevelFromXP(150);
        const level2 = getLevelFromXP(150);
        expect(level1).toBe(level2); // Same reference
    });

    test('getXPProgress returns same object reference for same XP', () => {
        const progress1 = getXPProgress(150);
        const progress2 = getXPProgress(150);
        expect(progress1).toBe(progress2); // Same reference
    });

    test('getNextLevel returns same object reference for same XP', () => {
        const next1 = getNextLevel(150);
        const next2 = getNextLevel(150);
        expect(next1).toBe(next2); // Same reference
    });
});
