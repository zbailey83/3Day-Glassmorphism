import React, { useEffect, useState } from 'react';

interface StreakBadgeProps {
    streak: number;
    onClose: () => void;
}

export const StreakBadge: React.FC<StreakBadgeProps> = ({ streak, onClose }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Trigger animation on mount
        setTimeout(() => setIsVisible(true), 10);

        // Auto-close after 3 seconds
        const timer = setTimeout(() => {
            setIsVisible(false);
            setTimeout(onClose, 300); // Wait for fade-out animation
        }, 3000);

        return () => clearTimeout(timer);
    }, [onClose]);

    // Get streak emoji based on streak count
    const getStreakEmoji = (days: number): string => {
        if (days >= 100) return '💎';
        if (days >= 30) return '🔥';
        if (days >= 7) return '⚡';
        return '✨';
    };

    // Get streak color based on streak count
    const getStreakColor = (days: number): string => {
        if (days >= 100) return 'linear-gradient(135deg, #B9F2FF 0%, #667eea 100%)';
        if (days >= 30) return 'linear-gradient(135deg, #FF6B6B 0%, #FFD93D 100%)';
        if (days >= 7) return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
        return 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)';
    };

    return (
        <div
            className={`streak-badge ${isVisible ? 'visible' : ''}`}
            style={{
                position: 'fixed',
                top: '20px',
                right: '20px',
                background: getStreakColor(streak),
                color: 'white',
                padding: '16px 24px',
                borderRadius: '16px',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                zIndex: 10000,
                transform: isVisible ? 'translateY(0) scale(1)' : 'translateY(-100px) scale(0.8)',
                opacity: isVisible ? 1 : 0,
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                minWidth: '180px'
            }}
        >
            {/* Streak Emoji */}
            <div
                style={{
                    fontSize: '32px',
                    animation: isVisible ? 'streakPulse 1s ease infinite' : 'none'
                }}
            >
                {getStreakEmoji(streak)}
            </div>

            {/* Streak Info */}
            <div style={{ flex: 1 }}>
                <div
                    style={{
                        fontSize: '24px',
                        fontWeight: 'bold',
                        lineHeight: '1'
                    }}
                >
                    {streak} Day{streak !== 1 ? 's' : ''}
                </div>
                <div
                    style={{
                        fontSize: '12px',
                        opacity: 0.9,
                        marginTop: '4px'
                    }}
                >
                    Streak Active!
                </div>
            </div>

            {/* Close Button */}
            <button
                onClick={() => {
                    setIsVisible(false);
                    setTimeout(onClose, 300);
                }}
                style={{
                    background: 'rgba(255, 255, 255, 0.2)',
                    border: 'none',
                    color: 'white',
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '16px',
                    transition: 'background 0.2s ease'
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                }}
            >
                ×
            </button>

            {/* Animations */}
            <style>{`
                @keyframes streakPulse {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.2); }
                }
            `}</style>
        </div>
    );
};
