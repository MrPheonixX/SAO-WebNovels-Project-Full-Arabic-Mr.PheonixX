import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, Heart, Sparkles } from "lucide-react";

interface AnimeEmojiProps {
  id: string;
  imageUrl: string;
  type: "adblock" | "devtools" | "random" | "greeting";
  message: string;
  duration?: number;
  persistent?: boolean;
}

interface FloatingEmojiProps {
  id: string;
  imageUrl: string;
  x: number;
  y: number;
  scale: number;
  rotation: number;
  duration: number;
}

// صور مناسبة للترحيب والرسائل العادية (اللطيفة والمحترمة فقط)
const CUTE_EMOJIS = [
  "https://cdn.builder.io/o/assets%2F15999d2412c04cefb5e665795b57bb74%2Fc95924a0fc444e14b84a3e4e4aaa1835?alt=media&token=876fb3a0-4450-41fe-857b-f2b8c2c81f14&apiKey=15999d2412c04cefb5e665795b57bb74",
  "https://cdn.builder.io/o/assets%2F15999d2412c04cefb5e665795b57bb74%2F83f88278eed0424baad8ae192a6b861e?alt=media&token=390a794f-1fb7-4894-8160-c835e8d09ab4&apiKey=15999d2412c04cefb5e665795b57bb74",
  "https://cdn.builder.io/o/assets%2F15999d2412c04cefb5e665795b57bb74%2F540ff8cfcf334d8d86b85dcf26e3d363?alt=media&token=b2a1eab5-129a-4980-8814-9e303a425856&apiKey=15999d2412c04cefb5e665795b57bb74",
  "https://cdn.builder.io/o/assets%2F15999d2412c04cefb5e665795b57bb74%2F326ce025c773434a9059094ed71bcfd4?alt=media&token=d7dd83b6-2b8e-4879-b30f-de9d05f5bf49&apiKey=15999d2412c04cefb5e665795b57bb74",
];

// صور للتحذيرات والأمان فقط
const WARNING_EMOJIS = [
  "https://cdn.builder.io/o/assets%2F15999d2412c04cefb5e665795b57bb74%2F50086dbb9ccf4873b677aa240e6a8f89?alt=media&token=e4e0855b-b210-47d5-9e29-e604b4716067&apiKey=15999d2412c04cefb5e665795b57bb74",
  "https://cdn.builder.io/o/assets%2F15999d2412c04cefb5e665795b57bb74%2F485b50c978ba4e509f4fb8cfe6c27152?alt=media&token=2546bab0-ac0d-4182-9ada-90d33ad2ead9&apiKey=15999d2412c04cefb5e665795b57bb74",
  "https://cdn.builder.io/o/assets%2F15999d2412c04cefb5e665795b57bb74%2F4a600db401354a84b3ce0b5f8673ca8f?alt=media&token=7184e77a-ed5d-461b-a5e9-9627372fa6f5&apiKey=15999d2412c04cefb5e665795b57bb74",
  "https://cdn.builder.io/o/assets%2F15999d2412c04cefb5e665795b57bb74%2Fda92ce7343c84b18912f7334aef4b8c7?alt=media&token=35cdc573-edff-45a6-bfe8-ffc448e0d3c8&apiKey=15999d2412c04cefb5e665795b57bb74",
];

// ايموجيات طائرة عادية (2 فقط)
const FLOATING_EMOJIS = [
  "https://cdn.builder.io/o/assets%2F15999d2412c04cefb5e665795b57bb74%2Fc95924a0fc444e14b84a3e4e4aaa1835?alt=media&token=876fb3a0-4450-41fe-857b-f2b8c2c81f14&apiKey=15999d2412c04cefb5e665795b57bb74",
  "https://cdn.builder.io/o/assets%2F15999d2412c04cefb5e665795b57bb74%2F540ff8cfcf334d8d86b85dcf26e3d363?alt=media&token=b2a1eab5-129a-4980-8814-9e303a425856&apiKey=15999d2412c04cefb5e665795b57bb74",
];

// رسائل عشوائية تناسب الشخصيات الأنمي
const RANDOM_MESSAGES = [
  "✨ أهلاً بك في عالم SAO الرقمي!",
  "🎮 استمتع بالقراءة والمغامرة!",
  "💫 الشخصيات تحييك بحماس!",
  "🌸 وقت ممتع في عالم الأنمي",
  "⭐ كيريتو يرحب بك!",
  "🌟 أسونا تتمنى لك قراءة ممتعة",
  "🎯 مغامرة جديدة تنتظرك",
  "💖 شخصياتك المفضلة هنا",
  "🔮 عالم الخيال في انتظارك",
  "🌈 اكتشف قصص جديدة ومثيرة",
];

const ADBLOCK_MESSAGES = [
  "😭 مانع الإعلانات يمنع دعم المنصة",
  "🥺 ساعدنا بإلغاء مانع الإعلانات",
  "😢 الإعلانات تساعدنا في الاستمرار",
  "🙏 نحتاج دعمك لتقديم المحتوى",
  "💔 مانع الإعلانات يؤثر على عملنا",
];

const DEVTOOLS_MESSAGES = [
  "😱 أدوات المطور مكتشفة!",
  "🔐 المحتوى محمي من النسخ",
  "🛡️ نظام الحماية نشط",
  "⚠️ تصرف مشبوه مكتشف",
  "🚫 الوصول غير المصرح محظور",
];

export const AnimeEmojiNotifications: React.FC = () => {
  const [notifications, setNotifications] = useState<AnimeEmojiProps[]>([]);
  const [floatingEmojis, setFloatingEmojis] = useState<FloatingEmojiProps[]>(
    [],
  );

  // الحصول على صورة مناسبة حسب النوع
  const getRandomEmoji = (type: string = "cute") => {
    if (type === "warning") {
      return WARNING_EMOJIS[Math.floor(Math.random() * WARNING_EMOJIS.length)];
    } else if (type === "floating") {
      return FLOATING_EMOJIS[
        Math.floor(Math.random() * FLOATING_EMOJIS.length)
      ];
    } else {
      return CUTE_EMOJIS[Math.floor(Math.random() * CUTE_EMOJIS.length)];
    }
  };

  // الحصول على رسالة عشوائية
  const getRandomMessage = (type: string) => {
    switch (type) {
      case "adblock":
        return ADBLOCK_MESSAGES[
          Math.floor(Math.random() * ADBLOCK_MESSAGES.length)
        ];
      case "devtools":
        return DEVTOOLS_MESSAGES[
          Math.floor(Math.random() * DEVTOOLS_MESSAGES.length)
        ];
      default:
        return RANDOM_MESSAGES[
          Math.floor(Math.random() * RANDOM_MESSAGES.length)
        ];
    }
  };

  // إضافة إشعار جديد
  const addNotification = (
    type: AnimeEmojiProps["type"],
    message?: string,
    duration = 5000,
  ) => {
    const id = Date.now().toString();
    // استخدام النوع المناسب للصورة
    const emojiType =
      type === "adblock" || type === "devtools" ? "warning" : "cute";
    const imageUrl = getRandomEmoji(emojiType);
    const finalMessage = message || getRandomMessage(type);

    const notification: AnimeEmojiProps = {
      id,
      imageUrl,
      type,
      message: finalMessage,
      duration,
      persistent: type === "adblock",
    };

    setNotifications((prev) => [...prev, notification]);

    // إزالة تلقائية إذا لم يكن دائماً
    if (!notification.persistent && duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, duration);
    }
  };

  // إزالة إشعار
  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  // إضافة ايموجي طائر (فقط للشخصيات اللطيفة)
  const addFloatingEmoji = (imageUrl?: string) => {
    const id = Date.now().toString();
    const finalImageUrl = imageUrl || getRandomEmoji("floating");

    const floatingEmoji: FloatingEmojiProps = {
      id,
      imageUrl: finalImageUrl,
      x: Math.random() * (window.innerWidth - 100),
      y: window.innerHeight,
      scale: 0.8 + Math.random() * 0.4,
      rotation: -15 + Math.random() * 30,
      duration: 4000 + Math.random() * 2000,
    };

    setFloatingEmojis((prev) => [...prev, floatingEmoji]);

    setTimeout(() => {
      setFloatingEmojis((prev) =>
        prev.filter((e) => e.id !== floatingEmoji.id),
      );
    }, floatingEmoji.duration);
  };

  // ملاحظة: تم إزالة كشف مانع الإعلانات وأدوات المطور لتجنب التكرار
  // نظام الحماية الرئيسي يتولى هذه المهام ويرسل الأحداث لهذا المكون

  // إشعارات ترحيبية وعشوائية (مقللة جداً)
  useEffect(() => {
    // إشعار ترحيبي بعد 5 ثوان
    const welcomeTimer = setTimeout(() => {
      addNotification("greeting", "🎌 مرحباً بك في مكتبة SAO العربية!", 6000);
    }, 5000);

    // إشعارات عشوائية نادرة جداً (كل 10 دقائق وباحتمال 10% فقط)
    const randomTimer = setInterval(() => {
      if (Math.random() < 0.1) {
        // 10% احتمال فقط
        addNotification("random");

        // ايموجي طائر نادر جداً (2% احتمال فقط)
        if (Math.random() < 0.02) {
          setTimeout(() => addFloatingEmoji(), 1000);
        }
      }
    }, 600000); // كل 10 دقائق

    return () => {
      clearTimeout(welcomeTimer);
      clearInterval(randomTimer);
    };
  }, []);

  // مستمعي الأحداث للتحكم الخارجي
  useEffect(() => {
    const handleTriggerEmoji = () => addFloatingEmoji();
    const handleAdBlockAnime = () => addNotification("adblock", undefined, 0);
    const handleDevToolsAnime = () =>
      addNotification("devtools", undefined, 4000);
    const handleRandomAnime = () => addNotification("random");

    window.addEventListener("trigger-anime-emoji", handleTriggerEmoji);
    window.addEventListener("trigger-adblock-anime", handleAdBlockAnime);
    window.addEventListener("trigger-devtools-anime", handleDevToolsAnime);
    window.addEventListener("trigger-random-anime", handleRandomAnime);

    return () => {
      window.removeEventListener("trigger-anime-emoji", handleTriggerEmoji);
      window.removeEventListener("trigger-adblock-anime", handleAdBlockAnime);
      window.removeEventListener("trigger-devtools-anime", handleDevToolsAnime);
      window.removeEventListener("trigger-random-anime", handleRandomAnime);
    };
  }, []);

  // تحديد ألوان ونمط الإشعار
  const getNotificationStyle = (type: string) => {
    switch (type) {
      case "adblock":
        return {
          background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
          border: "border-red-400/50",
          glow: "shadow-red-500/25",
        };
      case "devtools":
        return {
          background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
          border: "border-yellow-400/50",
          glow: "shadow-yellow-500/25",
        };
      case "greeting":
        return {
          background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
          border: "border-green-400/50",
          glow: "shadow-green-500/25",
        };
      default:
        return {
          background: "linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)",
          border: "border-blue-400/50",
          glow: "shadow-blue-500/25",
        };
    }
  };

  return (
    <>
      {/* حاوي الإشعارات */}
      <div className="fixed top-4 left-4 z-[9999] space-y-3 max-w-sm">
        {notifications.map((notification) => {
          const style = getNotificationStyle(notification.type);

          return (
            <Card
              key={notification.id}
              className={`${style.border} ${style.glow} backdrop-blur-xl transform transition-all duration-500 animate-slideInLeft shadow-xl`}
              style={{ background: style.background }}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <div
                      className="sao-holographic relative w-12 h-12 rounded-full overflow-hidden border-2 border-white/30 shadow-lg animate-bounce"
                      style={{
                        animation:
                          "bounce 2s infinite, saoGlow 2s ease-in-out infinite alternate",
                      }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 via-purple-400/20 to-violet-400/20 animate-pulse"></div>
                      <img
                        src={notification.imageUrl}
                        alt="Anime Character"
                        className="w-full h-full object-cover transform hover:scale-110 transition-transform duration-300 relative z-10"
                        style={{
                          filter:
                            "drop-shadow(0 0 8px rgba(59, 130, 246, 0.4)) brightness(1.1)",
                        }}
                      />
                    </div>
                    <div className="flex-1">
                      <p className="text-white text-sm leading-relaxed font-medium">
                        {notification.message}
                      </p>
                      <div className="flex items-center space-x-1 mt-2">
                        <Sparkles className="w-3 h-3 text-white/70" />
                        <span className="text-white/70 text-xs">SAO Team</span>
                      </div>
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

                {notification.persistent && (
                  <div className="mt-3 flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.location.reload()}
                      className="bg-white/20 text-white border-white/30 hover:bg-white/30 text-xs"
                    >
                      🔄 تحديث
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeNotification(notification.id)}
                      className="bg-white/20 text-white border-white/30 hover:bg-white/30 text-xs"
                    >
                      ❌ إخفاء
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* الإيموجيات الطائرة */}
      {floatingEmojis.map((emoji) => (
        <div
          key={emoji.id}
          className="fixed pointer-events-none z-[10000]"
          style={{
            left: emoji.x,
            top: emoji.y,
            transform: `scale(${emoji.scale}) rotate(${emoji.rotation}deg)`,
            animation: `floatUpAnime ${emoji.duration}ms ease-out forwards`,
          }}
        >
          <div
            className="sao-holographic relative w-16 h-16 rounded-full overflow-hidden border-2 border-blue-400/50 shadow-xl backdrop-blur-sm"
            style={{ animation: "saoGlow 1.5s ease-in-out infinite alternate" }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/30 via-purple-500/30 to-violet-500/30 animate-pulse"></div>
            <img
              src={emoji.imageUrl}
              alt="Floating Anime"
              className="w-full h-full object-cover relative z-10"
              style={{
                filter:
                  "drop-shadow(0 0 12px rgba(99, 102, 241, 0.6)) brightness(1.1) contrast(1.1) saturate(1.2)",
              }}
            />
            <div className="absolute inset-0 rounded-full border border-blue-300/40 animate-ping"></div>
          </div>
        </div>
      ))}

      {/* إضافة الأنماط المطلوبة */}
      <style>{`
        @keyframes slideInLeft {
          from {
            transform: translateX(-100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @keyframes floatUpAnime {
          0% {
            transform: translateY(0) scale(var(--scale, 1)) rotate(var(--rotation, 0deg));
            opacity: 1;
          }
          25% {
            transform: translateY(-100px) scale(calc(var(--scale, 1) * 1.1)) rotate(calc(var(--rotation, 0deg) + 5deg));
            opacity: 0.9;
          }
          50% {
            transform: translateY(-200px) scale(calc(var(--scale, 1) * 1.2)) rotate(calc(var(--rotation, 0deg) + 10deg));
            opacity: 0.8;
          }
          75% {
            transform: translateY(-300px) scale(calc(var(--scale, 1) * 1.1)) rotate(calc(var(--rotation, 0deg) + 15deg));
            opacity: 0.5;
          }
          100% {
            transform: translateY(-400px) scale(var(--scale, 1)) rotate(calc(var(--rotation, 0deg) + 20deg));
            opacity: 0;
          }
        }

        @keyframes bounce {
          0%, 20%, 53%, 80%, 100% {
            animation-timing-function: cubic-bezier(0.215, 0.61, 0.355, 1);
            transform: translate3d(0, 0, 0) scale(1);
          }
          40%, 43% {
            animation-timing-function: cubic-bezier(0.755, 0.05, 0.855, 0.06);
            transform: translate3d(0, -8px, 0) scale(1.05);
          }
          70% {
            animation-timing-function: cubic-bezier(0.755, 0.05, 0.855, 0.06);
            transform: translate3d(0, -4px, 0) scale(1.02);
          }
          90% {
            transform: translate3d(0, -2px, 0) scale(1.01);
          }
        }

        @keyframes saoGlow {
          0%, 100% {
            box-shadow: 0 0 5px rgba(59, 130, 246, 0.4), 0 0 10px rgba(99, 102, 241, 0.3);
          }
          50% {
            box-shadow: 0 0 10px rgba(59, 130, 246, 0.6), 0 0 20px rgba(99, 102, 241, 0.5), 0 0 30px rgba(139, 92, 246, 0.3);
          }
        }

        @keyframes holographicShimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }

        .sao-holographic {
          position: relative;
          overflow: hidden;
        }

        .sao-holographic::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(59, 130, 246, 0.2),
            rgba(99, 102, 241, 0.4),
            rgba(139, 92, 246, 0.2),
            transparent
          );
          background-size: 200% 100%;
          animation: holographicShimmer 3s ease-in-out infinite;
          z-index: 1;
        }

        .sao-holographic img {
          position: relative;
          z-index: 2;
        }
      `}</style>
    </>
  );
};

// Hook للتحكم في الإشعارات من مكونات أخرى
export const useAnimeNotifications = () => {
  const [component, setComponent] = useState<any>(null);

  useEffect(() => {
    // يمكن استخدام هذا للتحكم في الإشعارات من الخارج
    setComponent(AnimeEmojiNotifications);
  }, []);

  const triggerRandomEmoji = () => {
    const event = new CustomEvent("trigger-anime-emoji");
    window.dispatchEvent(event);
  };

  const triggerAdBlockWarning = () => {
    const event = new CustomEvent("trigger-adblock-anime");
    window.dispatchEvent(event);
  };

  const triggerDevToolsWarning = () => {
    const event = new CustomEvent("trigger-devtools-anime");
    window.dispatchEvent(event);
  };

  return {
    component,
    triggerRandomEmoji,
    triggerAdBlockWarning,
    triggerDevToolsWarning,
  };
};

export default AnimeEmojiNotifications;
