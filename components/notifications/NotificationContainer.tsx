import React, { useEffect, useState } from 'react';
import { subscribeToNotifications, Notification } from '../../services/notificationService';
import { XPToast } from './XPToast';
import { LevelUpModal } from './LevelUpModal';
import { AchievementUnlock } from './AchievementUnlock';
import { StreakBadge } from './StreakBadge';

export const NotificationContainer: React.FC = () => {
    const [activeNotifications, setActiveNotifications] = useState<Notification[]>([]);

    useEffect(() => {
        // Subscribe to notification events
        const unsubscribe = subscribeToNotifications((notification) => {
            setActiveNotifications(prev => [...prev, notification]);
        });

        return unsubscribe;
    }, []);

    const handleClose = (notificationId: string) => {
        setActiveNotifications(prev =>
            prev.filter(n => n.id !== notificationId)
        );
    };

    return (
        <>
            {activeNotifications.map(notification => {
                switch (notification.type) {
                    case 'xp':
                        return (
                            <XPToast
                                key={notification.id}
                                amount={notification.data.amount}
                                reason={notification.data.reason}
                                onClose={() => handleClose(notification.id)}
                            />
                        );

                    case 'levelUp':
                        return (
                            <LevelUpModal
                                key={notification.id}
                                newLevel={notification.data.newLevel}
                                onClose={() => handleClose(notification.id)}
                            />
                        );

                    case 'achievement':
                        return (
                            <AchievementUnlock
                                key={notification.id}
                                achievement={notification.data.achievement}
                                onClose={() => handleClose(notification.id)}
                            />
                        );

                    case 'streak':
                        return (
                            <StreakBadge
                                key={notification.id}
                                streak={notification.data.streak}
                                onClose={() => handleClose(notification.id)}
                            />
                        );

                    default:
                        return null;
                }
            })}
        </>
    );
};
