import React, { useEffect, useState } from "react";

interface EmojiNotification {
  id: number;
  emoji: string;
  message: string;
  x: number;
  y: number;
  duration: number;
}

const RandomAnimeEmojis: React.FC = () => {
  const [notifications, setNotifications] = useState<EmojiNotification[]>([]);

  // مجموعة الإيموجيهات الأنمي
  const animeEmojis = [
    { emoji: "🎌", message: "أهلاً بك في عالم الأنمي!" },
    { emoji: "⚡", message: "طاقة خارقة!" },
    { emoji: "🗾", message: "اليابان الجميلة" },
    { emoji: "🌸", message: "زهر الساكورا" },
    { emoji: "🎭", message: "مسرح الدراما" },
    { emoji: "🥷", message: "نينجا خفي" },
    { emoji: "👺", message: "أوني قوي" },
    { emoji: "🦸", message: "بطل خارق" },
    { emoji: "🎯", message: "هدف محدد" },
    { emoji: "⭐", message: "نجم ساطع" },
    { emoji: "💫", message: "سحر متلألئ" },
    { emoji: "🌟", message: "ضوء براق" },
    { emoji: "✨", message: "تأثير سحري" },
    { emoji: "🔥", message: "قوة النار" },
    { emoji: "❄️", message: "برودة الثلج" },
    { emoji: "🌊", message: "أمواج قوية" },
    { emoji: "⚡", message: "صاعقة البرق" },
    { emoji: "🌪️", message: "عاصفة شديدة" },
    { emoji: "💎", message: "جوهرة نادرة" },
    { emoji: "🗡️", message: "سيف حاد" },
    { emoji: "🏹", message: "سهم دقيق" },
    { emoji: "🛡️", message: "درع قوي" },
    { emoji: "👑", message: "تاج الملك" },
    { emoji: "🎪", message: "عرض مثير" },
    { emoji: "🎨", message: "فن جميل" },
    { emoji: "📚", message: "معرفة عميقة" },
    { emoji: "🔮", message: "كرة السحر" },
    { emoji: "🎵", message: "موسيقى رائعة" },
    { emoji: "🎶", message: "لحن جميل" },
    { emoji: "🎤", message: "صوت قوي" },
    { emoji: "🎧", message: "استمتع بالصوت" },
    { emoji: "🕰️", message: "الوقت ثمين" },
    { emoji: "🌙", message: "ليل هادئ" },
    { emoji: "☀️", message: "شمس مشرقة" },
    { emoji: "🌈", message: "قوس قزح جميل" },
    { emoji: "🦋", message: "فراشة رقيقة" },
    { emoji: "🌺", message: "زهرة جميلة" },
    { emoji: "🍃", message: "نسيم الطبيعة" },
    { emoji: "🌿", message: "خضرة منعشة" },
    { emoji: "🔥", message: "إرادة قوية" },
    { emoji: "💨", message: "سرعة البرق" },
    { emoji: "🌀", message: "دوامة قوية" },
    { emoji: "💥", message: "انفجار هائل" },
    { emoji: "⚔️", message: "معركة شرسة" },
    { emoji: "🏆", message: "انتصار مستحق" },
    { emoji: "🎖️", message: "شرف عظيم" },
    { emoji: "🏅", message: "إنجاز رائع" },
    { emoji: "🎗️", message: "دعم قوي" },
    { emoji: "🌪️", message: "قوة الإعصار" },
    { emoji: "🌊", message: "تسونامي القوة" },
    { emoji: "⚡", message: "كيريتو سام!" },
    { emoji: "🌸", message: "أسونا تشان!" },
    { emoji: "🗡️", message: "Dark Repulser!" },
    { emoji: "✨", message: "Starburst Stream!" },
    { emoji: "💫", message: "Dual Blades!" },
    { emoji: "🔥", message: "Incarnate Arms!" },
    { emoji: "❄️", message: "Blue Rose Sword!" },
    { emoji: "🌟", message: "Night Sky Sword!" },
    { emoji: "⭐", message: "بقاء على قيد الحياة!" },
    { emoji: "🎯", message: "Floor 100!" },
    { emoji: "👥", message: "Guild Knights!" },
    { emoji: "🏰", message: "Aincrad Castle!" },
    { emoji: "🌺", message: "ALO Alfheim!" },
    { emoji: "🎪", message: "GGO Gun Gale!" },
    { emoji: "🌊", message: "Underworld!" },
    { emoji: "💎", message: "Divine Object!" },
    { emoji: "🛡️", message: "Sacred Arts!" },
    { emoji: "🎨", message: "Perfect Weapon!" },
    { emoji: "🔮", message: "System Call!" },
  ];

  // رسائل إضافية عربية
  const arabicMessages = [
    "مرحباً بك يا مقاتل!",
    "استعد للمغامرة!",
    "قوتك تتزايد!",
    "مهارة جديدة!",
    "انتصار رائع!",
    "تقدم ممتاز!",
    "إنجاز عظيم!",
    "تألق مذهل!",
    "قدرة خارقة!",
    "سرعة البرق!",
    "قوة النار!",
    "برودة الجليد!",
    "حكمة عميقة!",
    "شجاعة نادرة!",
    "عزيمة قوية!",
    "تصميم راسخ!",
    "هدف واضح!",
    "تركيز تام!",
    "دقة عالية!",
    "توقيت مثالي!",
    "تنفيذ مبهر!",
    "أداء استثنائي!",
    "موهبة فطرية!",
    "تطور سريع!",
    "نمو مستمر!",
    "تحسن ملحوظ!",
    "مستوى جديد!",
    "قدرة متقدمة!",
    "تقنية سرية!",
    "فن قتالي!",
    "استراتيجية ذكية!",
    "خطة محكمة!",
    "تكتيك بارع!",
    "حركة سريعة!",
    "رد فعل سريع!",
    "انعكاس طبيعي!",
    "تآزر رائع!",
    "تناغم تام!",
    "انسجام مثالي!",
    "توازن دقيق!",
  ];

  const createNotification = () => {
    const randomEmoji =
      animeEmojis[Math.floor(Math.random() * animeEmojis.length)];
    const randomArabicMessage =
      arabicMessages[Math.floor(Math.random() * arabicMessages.length)];

    const notification: EmojiNotification = {
      id: Date.now() + Math.random(),
      emoji: randomEmoji.emoji,
      message: Math.random() > 0.5 ? randomEmoji.message : randomArabicMessage,
      x: Math.random() * (window.innerWidth - 300),
      y: Math.random() * (window.innerHeight - 100),
      duration: Math.random() * 3000 + 2000, // 2-5 ثواني
    };

    setNotifications((prev) => [...prev, notification]);

    // إزالة الإشعار بعد مدة
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== notification.id));
    }, notification.duration);
  };

  useEffect(() => {
    // إنشاء إشعار كل 3-8 ثواني
    const interval = setInterval(
      () => {
        // احتمال 70% لظهور إشعار
        if (Math.random() > 0.3) {
          createNotification();
        }
      },
      Math.random() * 5000 + 3000,
    );

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-40">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className="absolute animate-pulse"
          style={{
            left: `${notification.x}px`,
            top: `${notification.y}px`,
            animation: "fadeInOut 3s ease-in-out",
          }}
        >
          <div className="bg-black/80 backdrop-blur-sm rounded-full px-4 py-2 border border-cyan-500/30 shadow-lg shadow-cyan-500/20">
            <div className="flex items-center gap-2 text-white">
              <span className="text-2xl animate-bounce">
                {notification.emoji}
              </span>
              <span className="text-sm font-medium whitespace-nowrap">
                {notification.message}
              </span>
            </div>
          </div>
        </div>
      ))}

      <style jsx>{`
        @keyframes fadeInOut {
          0% {
            opacity: 0;
            transform: translateY(20px) scale(0.8);
          }
          20% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
          80% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
          100% {
            opacity: 0;
            transform: translateY(-20px) scale(0.8);
          }
        }
      `}</style>
    </div>
  );
};

export default RandomAnimeEmojis;
