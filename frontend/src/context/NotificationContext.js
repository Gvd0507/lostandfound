import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getNotifications, getUnreadCount, markAsRead, markAllAsRead } from '../services/api';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [latestNotification, setLatestNotification] = useState(null);
  const [showPopup, setShowPopup] = useState(false);

  const fetchNotifications = useCallback(async () => {
    if (!currentUser) return;
    
    try {
      const data = await getNotifications();
      setNotifications(data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  }, [currentUser]);

  const fetchUnreadCount = useCallback(async () => {
    if (!currentUser) return;
    
    try {
      const data = await getUnreadCount();
      const newCount = data.count;
      
      // If count increased, fetch latest notification and show popup
      if (newCount > unreadCount) {
        const allNotifications = await getNotifications({ unreadOnly: true });
        if (allNotifications.length > 0) {
          const latest = allNotifications[0];
          setLatestNotification(latest);
          setShowPopup(true);
          
          // Auto-hide after 3 seconds
          setTimeout(() => {
            setShowPopup(false);
          }, 3000);
        }
      }
      
      setUnreadCount(newCount);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  }, [currentUser, unreadCount]);

  const markNotificationAsRead = async (id) => {
    try {
      await markAsRead(id);
      await fetchNotifications();
      await fetchUnreadCount();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllNotificationsAsRead = async () => {
    try {
      await markAllAsRead();
      await fetchNotifications();
      await fetchUnreadCount();
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  // Poll for new notifications every 10 seconds
  useEffect(() => {
    if (!currentUser) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    fetchNotifications();
    fetchUnreadCount();

    const interval = setInterval(() => {
      fetchUnreadCount();
    }, 10000); // Poll every 10 seconds

    return () => clearInterval(interval);
  }, [currentUser, fetchNotifications, fetchUnreadCount]);

  const value = {
    notifications,
    unreadCount,
    latestNotification,
    showPopup,
    setShowPopup,
    fetchNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
