import React, { useEffect } from "react";

const SimpleDevToolsBlocker: React.FC = () => {
  useEffect(() => {
    // التحقق من وضع المطور أولاً
    const isDeveloperMode = () => {
      return (
        (window as any).__DEVELOPER_MODE__ ||
        (window as any).__SECURITY_BYPASS__ ||
        localStorage.getItem("developer_mode") === "true" ||
        localStorage.getItem("legitimate_developer") === "true" ||
        process.env.NODE_ENV === "development" ||
        window.location.hostname.includes("localhost") ||
        window.location.hostname.includes("builder.io") ||
        window.location.hostname.includes("127.0.0.1") ||
        window.location.search.includes("dev=true")
      );
    };

    // إذا كان وضع المطور نشط، لا نطبق أي حماية
    if (isDeveloperMode()) {
      console.log(
        "🔧 Developer mode active - Security disabled for development",
      );
      return;
    }

    // حماية بسيطة ضد النقر الأيمن
    const preventRightClick = (e: MouseEvent) => {
      e.preventDefault();
      console.warn("🛡️ Right click blocked for content protection");
      return false;
    };

    // حماية بسيطة ضد اختصارات لوحة المفاتيح
    const preventKeyShortcuts = (e: KeyboardEvent) => {
      // F12, Ctrl+Shift+I, Ctrl+U فقط
      if (
        e.key === "F12" ||
        (e.ctrlKey && e.shiftKey && e.key === "I") ||
        (e.ctrlKey && e.key === "u")
      ) {
        e.preventDefault();
        console.warn("🛡️ Developer tools access blocked");
        return false;
      }
    };

    // حماية بسيطة ضد التحديد
    const preventSelection = (e: Event) => {
      e.preventDefault();
      return false;
    };

    // رسالة ترحيب في الكونسول للمستخدمين العاديين
    console.log(
      "%c🛡️ Content Protection Active",
      "color: #3b82f6; font-size: 16px; font-weight: bold;",
    );
    console.log(
      "%cThis website is protected by MrPheonixX © 2024",
      "color: #6b7280; font-size: 12px;",
    );
    console.log(
      '%cFor developers: Use Ctrl+Shift+Alt+D or call enableDeveloperMode("password")',
      "color: #10b981; font-size: 12px;",
    );

    // تطبيق الحماية البسيطة
    document.addEventListener("contextmenu", preventRightClick);
    document.addEventListener("keydown", preventKeyShortcuts);
    document.addEventListener("selectstart", preventSelection);

    // تنظيف عند إلغاء التحميل
    return () => {
      document.removeEventListener("contextmenu", preventRightClick);
      document.removeEventListener("keydown", preventKeyShortcuts);
      document.removeEventListener("selectstart", preventSelection);
    };
  }, []);

  return null;
};

export default SimpleDevToolsBlocker;
