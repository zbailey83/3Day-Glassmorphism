import React, { useEffect, useState } from 'react';
import { Achievement, ACHIEVEMENT_TIERS } from '../../src/data/gamification';

interface AchievementUnlockProps {
    achievement: Achievement;
    onClose: () => void;
}

export const AchievementUnlock: React.FC<AchievementUnlockProps> = ({ achievement, onClose }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Trigger animation on mount
        setTimeout(() => setIsVisible(true), 10);

        // Auto-close after 4 seconds
        const timer = setTimeout(() => {
            handleClose();
        }, 4000);

        return () => clearTimeout(timer);
    }, []);

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(onClose, 300); // Wait for fade-out animation
    };

    const tierInfo = ACHIEVEMENT_TIERS[achievement.tier];

    return (
        <>
            {/* Backdrop */}
            <div
                onClick={handleClose}
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.6)',
                    zIndex: 10001,
                    opacity: isVisible ? 1 : 0,
                    transition: 'opacity 0.3s ease'
                }}
            />

            {/* Achievement Card */}
            <div
                style={{
                    position: 'fixed',
                    top: '50%',
                    left: '50%',
                    transform: `translate(-50%, -50%) scale(${isVisible ? 1 : 0.8})`,
                    backgroundColor: 'white',
                    borderRadius: '16px',
                    padding: '30px',
                    zIndex: 10002,
                    maxWidth: '400px',
                    width: '90%',
                    textAlign: 'center',
                    boxShadow: `0 20px 60px ${tierInfo.glow}, 0 0 40px ${tierInfo.glow}`,
                    border: `2px solid ${tierInfo.color}`,
                    opacity: isVisible ? 1 : 0,
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
            >
                {/* Header */}
                <div
                    style={{
                        fontSize: '14px',
                        fontWeight: '600',
                        color: tierInfo.color,
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                        marginBottom: '15px'
                    }}
                >
                    Achievement Unlocked!
                </div>

                {/* Icon */}
                {achievement.icon && (
                    <div
                        style={{
                            width: '100px',
                            height: '100px',
                            margin: '0 auto 20px',
                            animation: isVisible ? 'achievementPop 0.6s ease' : 'none',
                            filter: `drop-shadow(0 0 10px ${tierInfo.glow})`
                        }}
                    >
                        <img
                            src={achievement.icon}
                            alt={achievement.title}
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'contain'
                            }}
                        />
                    </div>
                )}

                {/* Title */}
                <h3
                    style={{
                        fontSize: '24px',
                        fontWeight: 'bold',
                        color: '#333',
                        marginBottom: '10px'
                    }}
                >
                    {achievement.title}
                </h3>

                {/* Description */}
                <p
                    style={{
                        fontSize: '14px',
                        color: '#666',
                        marginBottom: '20px',
                        lineHeight: '1.5'
                    }}
                >
                    {achievement.description}
                </p>

                {/* Tier Badge */}
                <div
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        backgroundColor: tierInfo.color,
                        color: achievement.tier === 'gold' || achievement.tier === 'bronze' ? '#333' : 'white',
                        padding: '8px 16px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: '600',
                        textTransform: 'uppercase',
                        marginBottom: '15px'
                    }}
                >
                    <span>⭐</span>
                    {achievement.tier}
                </div>

                {/* XP Reward */}
                <div
                    style={{
                        fontSize: '18px',
                        fontWeight: 'bold',
                        color: '#667eea',
                        marginTop: '10px'
                    }}
                >
                    +{achievement.xpReward} XP
                </div>

                {/* Close Button */}
                <button
                    onClick={handleClose}
                    style={{
                        marginTop: '20px',
                        padding: '10px 24px',
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#666',
                        backgroundColor: '#f0f0f0',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#e0e0e0';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#f0f0f0';
                    }}
                >
                    Awesome!
                </button>
            </div>

            {/* Animations */}
            <style>{`
                @keyframes achievementPop {
                    0% { transform: scale(0) rotate(-180deg); }
                    60% { transform: scale(1.2) rotate(10deg); }
                    100% { transform: scale(1) rotate(0deg); }
                }
            `}</style>
        </>
    );
};
