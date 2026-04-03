'use client';

import { useState, useEffect, useRef } from 'react';
import { notificationsApi } from '@/lib/api';
import type { Notification } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { Bell, X } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

const notificationTypeColors: Record<string, { bg: string; text: string; dot: string }> = {
  INFO: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-400' },
  WARNING: { bg: 'bg-orange-50', text: 'text-orange-700', dot: 'bg-orange-400' },
  ALERT: { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-400' },
  OVERDUE_ALERT: { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-400' },
  PAYMENT_REMINDER: { bg: 'bg-yellow-50', text: 'text-yellow-700', dot: 'bg-yellow-400' },
  PAYMENT_RECEIVED: { bg: 'bg-green-50', text: 'text-green-700', dot: 'bg-green-400' },
  LOAN_ACCEPTED: { bg: 'bg-green-50', text: 'text-green-700', dot: 'bg-green-400' },
  LOAN_DECLINED: { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-400' },
  LOAN_REQUEST: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-400' },
};

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const bellRef = useRef<HTMLButtonElement>(null);

  // Fetch unread count periodically
  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const { count } = await notificationsApi.getUnreadCount();
        setUnreadCount(count);
      } catch (err) {
        console.error('Failed to fetch unread count:', err);
      }
    };

    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000); // Poll every 30 seconds
    return () => clearInterval(interval);
  }, []);

  // Fetch notifications when dropdown opens
  useEffect(() => {
    if (isOpen) {
      const fetchNotifications = async () => {
        try {
          setIsLoading(true);
          const data = await notificationsApi.getUnread();
          setNotifications(data.slice(0, 10)); // Show last 10 unread
        } catch (err) {
          console.error('Failed to fetch notifications:', err);
        } finally {
          setIsLoading(false);
        }
      };

      fetchNotifications();
    }
  }, [isOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        bellRef.current &&
        !bellRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationsApi.markAsRead(id);
      setNotifications(notifications.filter((n) => n.id !== id));
      setUnreadCount(Math.max(0, unreadCount - 1));
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationsApi.markAllAsRead();
      setNotifications([]);
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  const getNotificationColors = (type: Notification['type']) => {
    return notificationTypeColors[type] || notificationTypeColors.INFO;
  };

  return (
    <div className="relative">
      {/* Bell Icon Button */}
      <button
        ref={bellRef}
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label="Notifications"
        title="Notifications"
      >
        <Bell className="w-6 h-6" />

        {/* Unread Badge */}
        {unreadCount > 0 && (
          <Badge
            variant="danger"
            className="absolute -top-1 -right-1 min-w-[20px] h-5 flex items-center justify-center p-0 text-xs"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute right-0 mt-2 w-96 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium"
              >
                Mark all as read
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-center text-gray-500">Loading notifications...</div>
            ) : notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">No new notifications</div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.map((notification) => {
                  const colors = getNotificationColors(notification.type);
                  return (
                    <div
                      key={notification.id}
                      className={`p-4 ${colors.bg} hover:bg-gray-50 transition-colors border-l-4 ${colors.dot}`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <p className={`font-medium ${colors.text} text-sm line-clamp-1`}>
                            {notification.title}
                          </p>
                          <p className="text-gray-700 text-sm mt-1 line-clamp-2">
                            {notification.message}
                          </p>
                          <p className="text-gray-500 text-xs mt-2">
                            {formatDistanceToNow(new Date(notification.createdAt), {
                              addSuffix: true,
                            })}
                          </p>
                        </div>
                        <button
                          onClick={() => handleMarkAsRead(notification.id)}
                          className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
                          aria-label="Dismiss"
                          title="Mark as read"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer Link */}
          {notifications.length > 0 && (
            <div className="border-t border-gray-200 p-4 text-center">
              <a href="/notifications" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                View all notifications
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
