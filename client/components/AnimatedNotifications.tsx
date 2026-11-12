import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, RefreshCw } from "lucide-react";

interface NotificationProps {
  id: string;
  type: "adblock" | "security" | "update" | "success" | "warning" | "error";
  title: string;
  message: string;
  emoji?: string;
  duration?: number;
  actions?: { label: string; action: () => void }[];
  persistent?: boolean;
}

interface FloatingEmojiProps {
  emoji: string;
  x: number;
  y: number;
  duration?: number;
}

interface AnimatedNotificationsProps {
  notifications: NotificationProps[];
}

export function AnimatedNotifications({
  notifications: propNotifications,
}: AnimatedNotificationsProps) {
  const [notifications, setNotifications] = useState<NotificationProps[]>(
    propNotifications || [],
  );
  const [floatingEmojis, setFloatingEmojis] = useState<FloatingEmojiProps[]>(
    [],
  );

  // Update notifications when props change
  useEffect(() => {
    setNotifications(propNotifications || []);
  }, [propNotifications]);

  // إضافة إشعار جديد
  const addNotification = (notification: Omit<NotificationProps, "id">) => {
    const id = Date.now().toString();
    const newNotification = { ...notification, id };

    setNotifications((prev) => [...prev, newNotification]);

    // إزالة تلقائية إذا لم يكن دائماً
    if (!notification.persistent && notification.duration !== 0) {
      setTimeout(() => {
        removeNotification(id);
      }, notification.duration || 5000);
    }
  };

  // إزالة إشعار
  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  // إضافة إيموجي طائر
  const addFloatingEmoji = (emoji: string, x?: number, y?: number) => {
    const floatingEmoji: FloatingEmojiProps = {
      emoji,
      x: x || Math.random() * window.innerWidth,
      y: y || window.innerHeight,
      duration: 3000,
    };

    setFloatingEmojis((prev) => [...prev, floatingEmoji]);

    setTimeout(() => {
      setFloatingEmojis((prev) => prev.filter((e) => e !== floatingEmoji));
    }, floatingEmoji.duration);
  };

  // تحديد ألوان ونمط الإشعار
  const getNotificationStyle = (type: string) => {
    switch (type) {
      case "adblock":
        return {
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          border: "border-purple-400/50",
          animation: "bounce",
        };
      case "security":
        return {
          background: "linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)",
          border: "border-red-400/50",
          animation: "shake",
        };
      case "update":
        return {
          background: "linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%)",
          border: "border-teal-400/50",
          animation: "pulse",
        };
      case "success":
        return {
          background: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
          border: "border-green-400/50",
          animation: "fadeIn",
        };
      case "warning":
        return {
          background: "linear-gradient(135deg, #ffeaa7 0%, #fab1a0 100%)",
          border: "border-yellow-400/50",
          animation: "wobble",
        };
      default:
        return {
          background: "linear-gradient(135deg, #74b9ff 0%, #0984e3 100%)",
          border: "border-blue-400/50",
          animation: "slideIn",
        };
    }
  };

  return (
    <>
      {/* حاوي الإشعارات */}
      <div className="fixed top-4 right-4 z-[9999] space-y-3 max-w-sm">
        {notifications.map((notification) => {
          const style = getNotificationStyle(notification.type);

          return (
            <Card
              key={notification.id}
              className={`${style.border} backdrop-blur-xl transform transition-all duration-500 animate-slideInRight`}
              style={{ background: style.background }}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                                        <div className="flex-1">
                      <h4 className="font-bold text-white mb-1">
                        {notification.title}
                      </h4>
                      <p className="text-white/90 text-sm leading-relaxed">
                        {notification.message}
                      </p>

                      {notification.actions && (
                        <div className="mt-3 flex space-x-2">
                          {notification.actions.map((action, index) => (
                            <Button
                              key={index}
                              variant="outline"
                              size="sm"
                              onClick={action.action}
                              className="bg-white/20 text-white border-white/30 hover:bg-white/30 text-xs"
                            >
                              {action.label}
                            </Button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {!notification.persistent && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeNotification(notification.id)}
                      className="text-white/70 hover:text-white hover:bg-white/20 p-1 h-auto"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* الإيموجيات الطائرة */}

      {/* إضافة الأنماط المطلوبة */}
      <style>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @keyframes floatUp {
          0% {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
          50% {
            transform: translateY(-50px) scale(1.2);
            opacity: 0.8;
          }
          100% {
            transform: translateY(-100px) scale(0.8);
            opacity: 0;
          }
        }

        @keyframes bounce {
          0%,
          20%,
          53%,
          80%,
          100% {
            animation-timing-function: cubic-bezier(0.215, 0.61, 0.355, 1);
            transform: translate3d(0, 0, 0);
          }
          40%,
          43% {
            animation-timing-function: cubic-bezier(0.755, 0.05, 0.855, 0.06);
            transform: translate3d(0, -8px, 0);
          }
          70% {
            animation-timing-function: cubic-bezier(0.755, 0.05, 0.855, 0.06);
            transform: translate3d(0, -4px, 0);
          }
          90% {
            transform: translate3d(0, -2px, 0);
          }
        }

        @keyframes shake {
          0%,
          100% {
            transform: translateX(0);
          }
          10%,
          30%,
          50%,
          70%,
          90% {
            transform: translateX(-2px);
          }
          20%,
          40%,
          60%,
          80% {
            transform: translateX(2px);
          }
        }

        @keyframes wobble {
          0% {
            transform: translateX(0%);
          }
          15% {
            transform: translateX(-6px) rotate(-6deg);
          }
          30% {
            transform: translateX(3px) rotate(6deg);
          }
          45% {
            transform: translateX(-3px) rotate(-3.6deg);
          }
          60% {
            transform: translateX(2px) rotate(2.4deg);
          }
          75% {
            transform: translateX(-1px) rotate(-1.2deg);
          }
          100% {
            transform: translateX(0%);
          }
        }
      `}</style>
    </>
  );
}

// Hook للتحكم في الإشعارات
export function useNotifications() {
  const [notificationComponent, setNotificationComponent] = useState<any>(null);

  useEffect(() => {
    setNotificationComponent(<AnimatedNotifications notifications={[]} />);
  }, []);

  const showAdBlockWarning = () => {
    if (notificationComponent) {
      notificationComponent.addNotification({
        type: "adblock",
        title: "مانع الإعلانات مُفعل",
        message:
          "الإعل��نات تساعدنا في تقدي�� المحتوى مجاناً. يرجى تعطيل مانع الإعلانات للمتابعة.",
        emoji: "😢",
        persistent: true,
        actions: [
          {
            label: "تحديث الصفحة",
            action: () => window.location.reload(),
          },
          {
            label: "المساعدة",
            action: () => alert("تعليمات تعطيل مانع الإعلانات..."),
          },
        ],
      });
    }
  };

  const showSecurityWarning = (message: string) => {
    if (notificationComponent) {
      notificationComponent.addNotification({
        type: "security",
        title: "تحذير أمني",
        message,
        emoji: "🛡️",
        duration: 3000,
      });
    }
  };

  const showUpdateNotification = () => {
    if (notificationComponent) {
      notificationComponent.addNotification({
        type: "update",
        title: "تحديث متاح",
        message: "يتوفر إصدار جديد من التطبيق. هل تريد التحديث الآن؟",
        emoji: "🔄",
        actions: [
          {
            label: "تحديث الآن",
            action: () => window.location.reload(),
          },
          {
            label: "لاحقاً",
            action: () => {},
          },
        ],
      });
    }
  };

  const showSuccessMessage = (message: string) => {
    if (notificationComponent) {
      notificationComponent.addNotification({
        type: "success",
        title: "نجح!",
        message,
        emoji: "✅",
        duration: 3000,
      });
    }
  };

  const showWarningMessage = (message: string) => {
    if (notificationComponent) {
      notificationComponent.addNotification({
        type: "warning",
        title: "تحذير",
        message,
        emoji: "⚠️",
        duration: 4000,
      });
    }
  };

  const showFloatingEmoji = (emoji: string, x?: number, y?: number) => {
    if (notificationComponent) {
      notificationComponent.addFloatingEmoji(emoji, x, y);
    }
  };

  return {
    component: notificationComponent,
    showAdBlockWarning,
    showSecurityWarning,
    showUpdateNotification,
    showSuccessMessage,
    showWarningMessage,
    showFloatingEmoji,
  };
}

// مكونات إشعارات سريعة
export function QuickNotification({
  type,
  message,
  emoji,
  onClose,
}: {
  type: string;
  message: string;
  emoji?: string;
  onClose?: () => void;
}) {
  const [isVisible, setIsVisible] = useState(true);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      if (onClose) onClose();
    }, 300);
  };

  if (!isVisible) return null;

  return (
    <div
      className={`fixed bottom-4 left-4 max-w-sm transform transition-all duration-300 ${isVisible ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"}`}
    >
      <Card className="bg-gradient-to-r from-blue-600/90 to-purple-600/90 border-blue-400/50 backdrop-blur-xl">
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            {emoji && <div className="text-2xl animate-pulse">{emoji}</div>}
            <div className="flex-1">
              <p className="text-white text-sm">{message}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="text-white/70 hover:text-white p-1 h-auto"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// إشعار شريط الأدوات
export function ToolbarNotification({
  message,
  type = "info",
  action,
}: {
  message: string;
  type?: "info" | "success" | "warning" | "error";
  action?: { label: string; onClick: () => void };
}) {
  const [isVisible, setIsVisible] = useState(true);

  const getColors = () => {
    switch (type) {
      case "success":
        return "bg-green-500/90 text-white";
      case "warning":
        return "bg-yellow-500/90 text-black";
      case "error":
        return "bg-red-500/90 text-white";
      default:
        return "bg-blue-500/90 text-white";
    }
  };

  if (!isVisible) return null;

  return (
    <div
      className={`${getColors()} px-4 py-2 text-center text-sm flex items-center justify-center space-x-4`}
    >
      <span>{message}</span>
      {action && (
        <Button
          variant="ghost"
          size="sm"
          onClick={action.onClick}
          className="text-current hover:bg-white/20 h-auto py-1 px-2"
        >
          {action.label}
        </Button>
      )}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsVisible(false)}
        className="text-current hover:bg-white/20 p-1 h-auto"
      >
        <X className="w-3 h-3" />
      </Button>
    </div>
  );
}

export default AnimatedNotifications;
