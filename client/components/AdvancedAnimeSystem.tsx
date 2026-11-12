import React, { useState, useEffect, useRef } from "react";

interface AdvancedAnimeProps {
  id: string;
  imageUrl: string;
  type: "celebration" | "warning" | "welcome" | "achievement" | "special";
  message: string;
  duration?: number;
  priority?: "low" | "medium" | "high" | "critical";
  sound?: boolean;
  particles?: boolean;
  interactive?: boolean;
}

interface AnimeNotification extends AdvancedAnimeProps {
  timestamp: number;
  visible: boolean;
}

export default function AdvancedAnimeSystem() {
  const [notifications, setNotifications] = useState<AnimeNotification[]>([]);
  const [isEnabled, setIsEnabled] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  // إعدادات الشخصيات والرسائل
  const animeCharacters = {
    kirito: {
      url: "https://i.imgur.com/kirito-avatar.png",
      messages: {
        welcome: "مرحباً بك في عالم ساو! 🗡️",
        celebration: "ممتاز! لقد تقدمت في المغامرة! ⭐",
        achievement: "إنجاز رائع! استمر في القراءة! 🏆"
      }
    },
    asuna: {
      url: "https://i.imgur.com/asuna-avatar.png", 
      messages: {
        welcome: "أهلاً وسهلاً! استمتع بالقراءة! 💖",
        celebration: "رائع! أنت قارئ مذهل! ✨",
        achievement: "تهانيّ على إتمام هذا الفصل! 🌟"
      }
    }
  };

  // تشغيل أنيميشن الجسيمات
  const animateParticles = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: Array<{x: number, y: number, vx: number, vy: number, life: number, color: string}> = [];

    const createParticle = (x: number, y: number) => {
      return {
        x,
        y,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4,
        life: 1,
        color: ['#3b82f6', '#8b5cf6', '#06b6d4', '#f59e0b'][Math.floor(Math.random() * 4)]
      };
    };

    // إنشاء جسيمات عشوائية
    for (let i = 0; i < 20; i++) {
      particles.push(createParticle(Math.random() * canvas.width, Math.random() * canvas.height));
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((particle, index) => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.life -= 0.01;

        if (particle.life <= 0) {
          particles[index] = createParticle(Math.random() * canvas.width, Math.random() * canvas.height);
        }

        ctx.save();
        ctx.globalAlpha = particle.life;
        ctx.fillStyle = particle.color;
        ctx.fillRect(particle.x, particle.y, 2, 2);
        ctx.restore();
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();
  };

  // إضافة إشعار جديد
  const addNotification = (notification: AdvancedAnimeProps) => {
    if (!isEnabled) return;

    const newNotification: AnimeNotification = {
      ...notification,
      timestamp: Date.now(),
      visible: true,
      duration: notification.duration || 4000
    };

    setNotifications(prev => [...prev, newNotification]);

    // إزالة الإشعار تلقائياً
    setTimeout(() => {
      setNotifications(prev => 
        prev.map(n => 
          n.timestamp === newNotification.timestamp 
            ? { ...n, visible: false }
            : n
        )
      );
    }, newNotification.duration);

    // حذف الإشعار نهائياً
    setTimeout(() => {
      setNotifications(prev => 
        prev.filter(n => n.timestamp !== newNotification.timestamp)
      );
    }, newNotification.duration + 500);
  };

  // الاستماع للأحداث المخصصة
  useEffect(() => {
    const handleCelebration = () => {
      addNotification({
        id: 'celebration-' + Date.now(),
        imageUrl: animeCharacters.kirito.url,
        type: 'celebration',
        message: animeCharacters.kirito.messages.celebration,
        particles: true,
        sound: true
      });
    };

    const handleWelcome = () => {
      addNotification({
        id: 'welcome-' + Date.now(),
        imageUrl: animeCharacters.asuna.url,
        type: 'welcome', 
        message: animeCharacters.asuna.messages.welcome,
        particles: true
      });
    };

    const handleSpecialEvent = () => {
      addNotification({
        id: 'special-' + Date.now(),
        imageUrl: animeCharacters.kirito.url,
        type: 'special',
        message: "🎉 حدث خاص! لقد حصلت على مكافأة! 🎁",
        duration: 6000,
        particles: true,
        interactive: true
      });
    };

    // تسجيل مستمعي الأحداث
    window.addEventListener('sao-celebration', handleCelebration);
    window.addEventListener('sao-welcome', handleWelcome);
    window.addEventListener('sao-special-event', handleSpecialEvent);

    // بدء أنيميشن الجسيمات
    if (isEnabled) {
      animateParticles();
    }

    return () => {
      window.removeEventListener('sao-celebration', handleCelebration);
      window.removeEventListener('sao-welcome', handleWelcome);
      window.removeEventListener('sao-special-event', handleSpecialEvent);
      
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isEnabled]);

  // تنظيف الموارد
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  if (!isEnabled) return null;

  return (
    <>
      {/* Canvas للجسيمات */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-40"
        style={{ zIndex: 40 }}
      />

      {/* حاوية الإشعارات */}
      <div className="fixed top-4 right-4 z-50 space-y-4 max-w-sm">
        {notifications.map((notification) => (
          <div
            key={notification.timestamp}
            className={`
              transform transition-all duration-500 ease-out
              ${notification.visible 
                ? 'translate-x-0 opacity-100 scale-100' 
                : 'translate-x-full opacity-0 scale-95'
              }
              bg-gradient-to-r from-purple-900/95 to-blue-900/95 
              backdrop-blur-xl border border-purple-500/30 
              rounded-lg p-4 shadow-2xl
              hover:scale-105 hover:border-purple-400/50
            `}
          >
            {/* رأس الإشعار */}
            <div className="flex items-center space-x-3 mb-2">
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 p-0.5">
                  <div className="w-full h-full rounded-full bg-black flex items-center justify-center">
                    <span className="text-2xl">
                      {notification.type === 'celebration' ? '🎉' :
                       notification.type === 'welcome' ? '👋' :
                       notification.type === 'achievement' ? '🏆' :
                       notification.type === 'special' ? '⭐' : '✨'}
                    </span>
                  </div>
                </div>
                
                {/* تأثير النبض */}
                <div className="absolute inset-0 rounded-full bg-blue-400/30 animate-ping"></div>
              </div>

              <div className="flex-1">
                <h3 className="text-sm font-semibold text-white mb-1">
                  نظام SAO المتقدم
                </h3>
                <div className="flex items-center space-x-2">
                  <div className={`
                    w-2 h-2 rounded-full animate-pulse
                    ${notification.type === 'celebration' ? 'bg-green-400' :
                      notification.type === 'warning' ? 'bg-red-400' :
                      notification.type === 'special' ? 'bg-yellow-400' : 'bg-blue-400'}
                  `}></div>
                  <span className="text-xs text-gray-300 capitalize">
                    {notification.type}
                  </span>
                </div>
              </div>
            </div>

            {/* محتوى الرسالة */}
            <div className="text-gray-100 text-sm leading-relaxed">
              {notification.message}
            </div>

            {/* شريط التقدم */}
            <div className="mt-3 w-full h-1 bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse"
                style={{
                  animation: `progressBar ${notification.duration}ms linear forwards`
                }}
              ></div>
            </div>

            {/* تأثيرات إضافية للإشعارات التفاعلية */}
            {notification.interactive && (
              <div className="mt-2 flex space-x-2">
                <button className="px-3 py-1 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/50 rounded text-xs text-blue-300 transition-colors">
                  عرض
                </button>
                <button className="px-3 py-1 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/50 rounded text-xs text-purple-300 transition-colors">
                  حفظ
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* إضافة CSS للأنيميشن */}
      <style>{`
        @keyframes progressBar {
          from { width: 100%; }
          to { width: 0%; }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.5); }
          50% { box-shadow: 0 0 30px rgba(139, 92, 246, 0.7); }
        }
      `}</style>
    </>
  );
}
