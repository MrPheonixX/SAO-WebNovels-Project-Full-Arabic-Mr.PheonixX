import React, { createContext, useContext, useEffect, useState } from "react";
import { AnimatedNotifications } from "./AnimatedNotifications";

interface SecurityContextType {
  isSecurityActive: boolean;
  adBlockDetected: boolean;
  devToolsDetected: boolean;
  copyAttempts: number;
  screenshotAttempts: number;
  triggerSecurityAlert: (type: string, message: string) => void;
  toggleSecurity: (enabled: boolean) => void;
}

const SecurityContext = createContext<SecurityContextType | undefined>(
  undefined,
);

export const useSecurityContext = () => {
  const context = useContext(SecurityContext);
  if (!context) {
    throw new Error("useSecurityContext must be used within SecurityProvider");
  }
  return context;
};

interface SecurityProviderProps {
  children: React.ReactNode;
  enableSecurity?: boolean;
  disableDevToolsProtection?: boolean;
}

export const SecurityProvider: React.FC<SecurityProviderProps> = ({
  children,
  enableSecurity = true,
  disableDevToolsProtection = false,
}) => {
  // Check localStorage for admin security settings
  const getSecuritySetting = () => {
    try {
      const savedSetting = localStorage.getItem("admin-security-enabled");
      if (savedSetting !== null) {
        return savedSetting === "true";
      }
      return enableSecurity;
    } catch {
      return enableSecurity;
    }
  };

  const [isSecurityActive, setIsSecurityActive] =
    useState(getSecuritySetting());
  const [adBlockDetected, setAdBlockDetected] = useState(false);
  const [devToolsDetected, setDevToolsDetected] = useState(false);
  const [copyAttempts, setCopyAttempts] = useState(0);
  const [screenshotAttempts, setScreenshotAttempts] = useState(0);
  const [notifications, setNotifications] = useState<any[]>([]);

  const triggerSecurityAlert = (type: string, message: string) => {
    const notification = {
      id: Date.now().toString(),
      type: type as any,
      title: "تنبيه أمني",
      message,
      timestamp: new Date(),
    };
    setNotifications((prev) => [...prev, notification]);

    // إيقاف أي تأثيرات إيموجي/أنيميشن للأحداث الأمنية
  };

  // Toggle security function for admin control
  const toggleSecurity = (enabled: boolean) => {
    setIsSecurityActive(enabled);
    localStorage.setItem("admin-security-enabled", enabled.toString());

    // silent toggle; لا رسائل/إيموجي
  };

  // AdBlock Detection
  useEffect(() => {
    if (!isSecurityActive) return;

    const detectAdBlock = () => {
      const testAd = document.createElement("div");
      testAd.innerHTML = "&nbsp;";
      testAd.className = "adsbox";
      testAd.style.position = "absolute";
      testAd.style.left = "-999px";
      testAd.style.top = "-999px";

      document.body.appendChild(testAd);

      setTimeout(() => {
        if (testAd.offsetHeight === 0) {
          setAdBlockDetected(true);
          triggerSecurityAlert(
            "adblock",
            "تم اكتشاف مانع الإعلانات. يرجى إلغاء تفعيله لدعم المنصة.",
          );
        }
        document.body.removeChild(testAd);
      }, 100);
    };

    detectAdBlock();
  }, [isSecurityActive]);

  // DevTools Detection (optional)
  useEffect(() => {
    if (!isSecurityActive || disableDevToolsProtection) return;

    let devtools = false;
    const threshold = 160;

    const checkDevTools = () => {
      if (
        window.outerHeight - window.innerHeight > threshold ||
        window.outerWidth - window.innerWidth > threshold
      ) {
        if (!devtools) {
          devtools = true;
          setDevToolsDetected(true);
          triggerSecurityAlert(
            "security",
            "تم اكتشاف أدوات المطور. المحتوى محمي من النسخ.",
          );
          document.body.style.filter = "blur(5px)";

          setTimeout(() => {
            document.body.style.filter = "none";
            devtools = false;
            setDevToolsDetected(false);
          }, 3000);
        }
      }
    };

    const interval = setInterval(checkDevTools, 500);
    return () => clearInterval(interval);
  }, [isSecurityActive, disableDevToolsProtection]);

  // Disable Right Click and Copy
  useEffect(() => {
    if (!isSecurityActive) return;

    const handleContextMenu = (e: Event) => {
      e.preventDefault();
      setCopyAttempts((prev) => prev + 1);
      triggerSecurityAlert(
        "security",
        "النقر بالزر الأيمن غير مسموح لحماية المحتوى.",
      );
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Always block copy/save/print shortcuts
      if (e.ctrlKey && (e.key === "c" || e.key === "a" || e.key === "s" || e.key === "p")) {
        e.preventDefault();
        setCopyAttempts((prev) => prev + 1);
        triggerSecurityAlert("security", "هذا الاختصار غير مسموح لحماية المحتوى.");
        return;
      }
      // Optionally block devtools shortcuts (F12, Ctrl+Shift+I/J/C)
      if (!disableDevToolsProtection) {
        if (
          (e.ctrlKey && e.shiftKey && (e.key === "I" || e.key === "J" || e.key === "C")) ||
          e.key === "F12"
        ) {
          e.preventDefault();
          triggerSecurityAlert("security", "هذا الاختصار غير مسموح لحماية المحتوى.");
        }
      }
    };

    const handlePrintScreen = (e: KeyboardEvent) => {
      if (e.key === "PrintScreen") {
        e.preventDefault();
        setScreenshotAttempts((prev) => prev + 1);
        triggerSecurityAlert(
          "security",
          "لقطات الشاشة غير مسموحة لحماية المحتوى.",
        );

        // Temporarily hide content
        document.body.style.visibility = "hidden";
        setTimeout(() => {
          document.body.style.visibility = "visible";
        }, 1000);
      }
    };

    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keyup", handlePrintScreen);

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("keyup", handlePrintScreen);
    };
  }, [isSecurityActive]);

  // Disable Text Selection
  useEffect(() => {
    if (!isSecurityActive) return;

    const style = document.createElement("style");
    style.textContent = `
      * {
        -webkit-user-select: none !important;
        -moz-user-select: none !important;
        -ms-user-select: none !important;
        user-select: none !important;
        -webkit-touch-callout: none !important;
        -webkit-tap-highlight-color: transparent !important;
      }
      
      input, textarea {
        -webkit-user-select: auto !important;
        -moz-user-select: auto !important;
        -ms-user-select: auto !important;
        user-select: auto !important;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, [isSecurityActive]);

  // Disable Drag and Drop
  useEffect(() => {
    if (!isSecurityActive) return;

    const handleDragStart = (e: Event) => {
      e.preventDefault();
      triggerSecurityAlert("security", "سحب المحتوى غير مسموح.");
    };

    document.addEventListener("dragstart", handleDragStart);
    return () => document.removeEventListener("dragstart", handleDragStart);
  }, [isSecurityActive]);

  // Console Warning
  useEffect(() => {
    if (!isSecurityActive) return;

    console.clear();
    console.log(
      "%c🛡️ MrPheonixX Team - حماية المحتوى نشطة",
      "color: #3b82f6; font-size: 24px; font-weight: bold;",
    );
    console.log(
      "%c⚠️ تحذير: هذا الموقع محمي من النسخ والتحميل",
      "color: #ef4444; font-size: 16px; font-weight: bold;",
    );
    console.log(
      "%c📚 للاستمتاع بالمحتوى، يرجى استخدام واجهة الموقع",
      "color: #10b981; font-size: 14px;",
    );
  }, [isSecurityActive]);

  const contextValue: SecurityContextType = {
    isSecurityActive,
    adBlockDetected,
    devToolsDetected,
    copyAttempts,
    screenshotAttempts,
    triggerSecurityAlert,
    toggleSecurity,
  };

  return (
    <SecurityContext.Provider value={contextValue}>
      {isSecurityActive && adBlockDetected ? (
        <div
          style={{
            position: "fixed",
            inset: 0 as any,
            background: "rgba(0,0,0,0.95)",
            color: "#fff",
            zIndex: 99999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            padding: "2rem",
          }}
        >
          <div>
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🛡️</div>
            <h2 style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>
              تم اكتشاف مانع الإعلانات
            </h2>
            <p style={{ color: "#9ca3af" }}>
              يرجى تعطيل مانع الإعلانات لمتابعة التصفح. المحتوى للعرض فقط ومحمّي
              من النسخ والتحميل.
            </p>
          </div>
        </div>
      ) : null}
      {children}
      <AnimatedNotifications notifications={notifications} />
    </SecurityContext.Provider>
  );
};

export default SecurityProvider;
