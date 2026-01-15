import React, { useEffect, useState } from 'react';

interface XPToastProps {
    amount: number;
    reason: string;
    onClose: () => void;
}

export const XPToast: React.FC<XPToastProps> = ({ amount, reason, onClose }) => {
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

    return (
        <div
            className={`xp-toast ${isVisible ? 'visible' : ''}`}
            style={{
                position: 'fixed',
                top: '80px',
                right: '20px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                padding: '12px 20px',
                borderRadius: '12px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                zIndex: 10000,
                transform: isVisible ? 'translateX(0)' : 'translateX(400px)',
                opacity: isVisible ? 1 : 0,
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                minWidth: '200px',
                maxWidth: '350px'
            }}
        >
            <div
                style={{
                    fontSize: '24px',
                    fontWeight: 'bold',
                    color: '#FFD700'
                }}
            >
                +{amount} XP
            </div>
            <div
                style={{
                    fontSize: '14px',
                    opacity: 0.9,
                    flex: 1
                }}
            >
                {reason}
            </div>
        </div>
    );
};
