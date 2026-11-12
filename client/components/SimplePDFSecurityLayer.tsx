import React, { useEffect } from "react";

const SimplePDFSecurityLayer: React.FC = () => {
  useEffect(() => {
    // التحقق من وضع المطور
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

    // إذا كان وضع المطور نشط، لا نطبق حماية PDF
    if (isDeveloperMode()) {
      console.log(
        "🔧 Developer mode active - PDF security disabled for development",
      );
      return;
    }

    // حماية بسيطة ضد تحميل PDF للمستخدمين العاديين فقط
    const preventPDFDownload = () => {
      // منع تحميل الملفات
      const preventDownload = (e: Event) => {
        const target = e.target as HTMLElement;
        if (
          target &&
          (target.tagName === "A" ||
            target.closest("a") ||
            target.getAttribute("download") !== null)
        ) {
          const href = target.getAttribute("href") || "";
          if (href.includes(".pdf")) {
            e.preventDefault();
            e.stopPropagation();
            console.warn("🚫 PDF download blocked - Content protected");
            return false;
          }
        }
      };

      // إضافة مستمعات للأحداث
      document.addEventListener("click", preventDownload, true);
      document.addEventListener("contextmenu", preventDownload, true);

      return () => {
        document.removeEventListener("click", preventDownload, true);
        document.removeEventListener("contextmenu", preventDownload, true);
      };
    };

    // حماية بسيطة من تقنيات الالتفاف
    const basicBypassProtection = () => {
      // حماية خفيفة ضد window.open للملفات PDF
      const originalOpen = window.open;
      try {
        (window as any).open = function (
          url?: string | URL,
          target?: string,
          features?: string,
        ) {
          if (url && typeof url === "string" && url.includes(".pdf")) {
            console.warn("🚫 PDF opening blocked via window.open");
            return null;
          }
          return originalOpen.call(window, url, target, features);
        };
      } catch (error) {
        // تجاهل الأخطاء
        console.warn("Could not protect window.open:", error);
      }

      return () => {
        try {
          window.open = originalOpen;
        } catch (error) {
          // تجاهل الأخطاء
        }
      };
    };

    // حماية الطباعة البسيطة
    const simplePrintProtection = () => {
      const preventPrint = (e: Event) => {
        e.preventDefault();
        console.warn("🚫 Printing blocked - Content protected");
        return false;
      };

      window.addEventListener("beforeprint", preventPrint);

      return () => {
        window.removeEventListener("beforeprint", preventPrint);
      };
    };

    // تطبيق الحماية البسيطة
    console.log("🛡️ Basic PDF protection active for regular users");

    const cleanupDownload = preventPDFDownload();
    const cleanupBypass = basicBypassProtection();
    const cleanupPrint = simplePrintProtection();

    // تنظيف عند إلغاء التحميل
    return () => {
      if (cleanupDownload) cleanupDownload();
      if (cleanupBypass) cleanupBypass();
      if (cleanupPrint) cleanupPrint();
    };
  }, []);

  return null; // مكون غير مرئي
};

export default SimplePDFSecurityLayer;
