import React, { useEffect, useState } from 'react';
import { LevelInfo } from '../../src/data/gamification';

interface LevelUpModalProps {
    newLevel: LevelInfo;
    onClose: () => void;
}

export const LevelUpModal: React.FC<LevelUpModalProps> = ({ newLevel, onClose }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Trigger animation on mount
        setTimeout(() => setIsVisible(true), 10);

        // Auto-close after 5 seconds
        const timer = setTimeout(() => {
            handleClose();
        }, 5000);

        return () => clearTimeout(timer);
    }, []);

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(onClose, 300); // Wait for fade-out animation
    };

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
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    zIndex: 10001,
                    opacity: isVisible ? 1 : 0,
                    transition: 'opacity 0.3s ease'
                }}
            />

            {/* Modal */}
            <div
                style={{
                    position: 'fixed',
                    top: '50%',
                    left: '50%',
                    transform: `translate(-50%, -50%) scale(${isVisible ? 1 : 0.8})`,
                    backgroundColor: 'white',
                    borderRadius: '20px',
                    padding: '40px',
                    zIndex: 10002,
                    maxWidth: '500px',
                    width: '90%',
                    textAlign: 'center',
                    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
                    opacity: isVisible ? 1 : 0,
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
            >
                {/* Celebration Header */}
                <div
                    style={{
                        fontSize: '48px',
                        marginBottom: '20px',
                        animation: isVisible ? 'bounce 0.6s ease' : 'none'
                    }}
                >
                    🎉
                </div>

                <h2
                    style={{
                        fontSize: '32px',
                        fontWeight: 'bold',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        marginBottom: '10px'
                    }}
                >
                    Level Up!
                </h2>

                {/* Animal Avatar */}
                {newLevel.animalSvg && (
                    <div
                        style={{
                            width: '120px',
                            height: '120px',
                            margin: '20px auto',
                            animation: isVisible ? 'pulse 1s ease infinite' : 'none'
                        }}
                    >
                        <img
                            src={newLevel.animalSvg}
                            alt={newLevel.animal}
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'contain'
                            }}
                        />
                    </div>
                )}

                {/* Level Info */}
                <div style={{ marginBottom: '20px' }}>
                    <div
                        style={{
                            fontSize: '24px',
                            fontWeight: 'bold',
                            color: '#333',
                            marginBottom: '5px'
                        }}
                    >
                        Level {newLevel.level}
                    </div>
                    <div
                        style={{
                            fontSize: '20px',
                            color: '#667eea',
                            fontWeight: '600'
                        }}
                    >
                        {newLevel.title}
                    </div>
                </div>

                {/* Perks */}
                {newLevel.perks && newLevel.perks.length > 0 && (
                    <div
                        style={{
                            backgroundColor: '#f7f7f7',
                            borderRadius: '12px',
                            padding: '20px',
                            marginTop: '20px'
                        }}
                    >
                        <div
                            style={{
                                fontSize: '14px',
                                fontWeight: '600',
                                color: '#666',
                                marginBottom: '10px'
                            }}
                        >
                            New Perks Unlocked:
                        </div>
                        <ul
                            style={{
                                listStyle: 'none',
                                padding: 0,
                                margin: 0
                            }}
                        >
                            {newLevel.perks.map((perk, index) => (
                                <li
                                    key={index}
                                    style={{
                                        fontSize: '14px',
                                        color: '#333',
                                        padding: '5px 0',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '8px'
                                    }}
                                >
                                    <span style={{ color: '#667eea' }}>✓</span>
                                    {perk}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Close Button */}
                <button
                    onClick={handleClose}
                    style={{
                        marginTop: '30px',
                        padding: '12px 30px',
                        fontSize: '16px',
                        fontWeight: '600',
                        color: 'white',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        transition: 'transform 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.05)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                    }}
                >
                    Continue
                </button>
            </div>

            {/* Animations */}
            <style>{`
                @keyframes bounce {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-20px); }
                }

                @keyframes pulse {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.1); }
                }
            `}</style>
        </>
    );
};
