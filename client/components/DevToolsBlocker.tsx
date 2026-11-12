import React, { useEffect } from "react";

const DevToolsBlocker: React.FC = () => {
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
        window.location.search.includes("dev=true")
      );
    };

    // وظيفة لكشف أدوات المطور (مع استثناءات)
    const detectDevTools = () => {
      if (isDeveloperMode()) {
        console.log("🔧 وضع المطور نشط - تم تجاهل كشف أدوات التطوير");
        return;
      }
      const devtools = {
        open: false,
        orientation: null,
      };

      // كشف الفرق في الحجم
      const threshold = 160;

      setInterval(() => {
        if (
          window.outerHeight - window.innerHeight > threshold ||
          window.outerWidth - window.innerWidth > threshold
        ) {
          if (!devtools.open) {
            devtools.open = true;
            // إخفاء المحتوى فوراً
            document.body.style.display = "none";
            alert("🚫 تم اكتشاف أدوات المطور\nالموقع محمي ضد السرقة");

            // إعادة توجيه لصفحة فارغة
            setTimeout(() => {
              window.location.href = "about:blank";
            }, 1000);
          }
        } else {
          devtools.open = false;
        }
      }, 500);
    };

    // كشف كونسول الطرفية
    const detectConsole = () => {
      const originalLog = console.log;
      const originalError = console.error;
      const originalWarn = console.warn;
      const originalInfo = console.info;

      // إعادة تعريف console
      console.log = function () {
        alert("🚫 استخدام الكونسول غير مسموح");
        window.location.href = "about:blank";
      };

      console.error = function () {
        alert("🚫 استخدام الكونسول غير مسموح");
        window.location.href = "about:blank";
      };

      console.warn = function () {
        alert("🚫 استخدام الكونسول غير مسموح");
        window.location.href = "about:blank";
      };

      console.info = function () {
        alert("🚫 استخدام الكونسول غير مسموح");
        window.location.href = "about:blank";
      };
    };

    // كشف Debugger
    const preventDebugger = () => {
      setInterval(() => {
        debugger;
      }, 100);
    };

    // منع فحص العناصر
    const preventInspect = () => {
      document.addEventListener("keydown", (e) => {
        // F12
        if (e.keyCode === 123) {
          e.preventDefault();
          alert("🚫 F12 غير مسموح");
          return false;
        }

        // Ctrl+Shift+I
        if (e.ctrlKey && e.shiftKey && e.keyCode === 73) {
          e.preventDefault();
          alert("🚫 فحص العناصر غير مسموح");
          return false;
        }

        // Ctrl+Shift+J
        if (e.ctrlKey && e.shiftKey && e.keyCode === 74) {
          e.preventDefault();
          alert("🚫 الكونسول غير مسموح");
          return false;
        }

        // Ctrl+U
        if (e.ctrlKey && e.keyCode === 85) {
          e.preventDefault();
          alert("🚫 عرض مصدر الصفحة غير مسموح");
          return false;
        }

        // Ctrl+Shift+C
        if (e.ctrlKey && e.shiftKey && e.keyCode === 67) {
          e.preventDefault();
          alert("🚫 أداة التحديد غير مسموحة");
          return false;
        }

        // Ctrl+S
        if (e.ctrlKey && e.keyCode === 83) {
          e.preventDefault();
          alert("🚫 حفظ الصفحة غير مسموح");
          return false;
        }

        // Ctrl+A
        if (e.ctrlKey && e.keyCode === 65) {
          e.preventDefault();
          alert("🚫 تحديد الكل غير مسموح");
          return false;
        }

        // Ctrl+C
        if (e.ctrlKey && e.keyCode === 67) {
          e.preventDefault();
          alert("🚫 النسخ غير مسموح");
          return false;
        }

        // Ctrl+V
        if (e.ctrlKey && e.keyCode === 86) {
          e.preventDefault();
          alert("🚫 اللصق غير مسموح");
          return false;
        }

        // Ctrl+X
        if (e.ctrlKey && e.keyCode === 88) {
          e.preventDefault();
          alert("🚫 القص غير مسموح");
          return false;
        }

        // Ctrl+P
        if (e.ctrlKey && e.keyCode === 80) {
          e.preventDefault();
          alert("🚫 الطباعة غير مسموحة");
          return false;
        }

        // Print Screen
        if (e.keyCode === 44) {
          e.preventDefault();
          alert("🚫 لقطة الشاشة غير مسموحة");
          return false;
        }
      });
    };

    // كشف النقر الأيمن
    const preventRightClick = () => {
      document.addEventListener("contextmenu", (e) => {
        e.preventDefault();
        alert("🚫 النقر الأيمن غير مسموح");
        return false;
      });
    };

    // كشف التحديد
    const preventSelection = () => {
      document.addEventListener("selectstart", (e) => {
        e.preventDefault();
        return false;
      });

      document.onselectstart = () => false;
      document.onmousedown = () => false;
    };

    // كشف السحب والإفلات
    const preventDragDrop = () => {
      document.addEventListener("dragstart", (e) => {
        e.preventDefault();
        return false;
      });

      document.addEventListener("drop", (e) => {
        e.preventDefault();
        return false;
      });
    };

    // م��ع فتح المصدر في نافذة جديدة
    const blockViewSource = () => {
      // منع window.open
      const originalOpen = window.open;
      window.open = function () {
        alert("🚫 فتح نوافذ جديدة غير مسموح");
        return null;
      };
    };

    // كشف أدوات التطوير عبر العرض
    const detectByRendering = () => {
      let devtools = { open: false };

      setInterval(() => {
        const before = new Date();
        debugger;
        const after = new Date();

        if (after.getTime() - before.getTime() > 100) {
          if (!devtools.open) {
            devtools.open = true;
            document.body.style.display = "none";
            alert("🚫 تم اكتشاف أدوات التطوير");
            window.location.href = "about:blank";
          }
        } else {
          devtools.open = false;
        }
      }, 1000);
    };

    // تجميد الكائنات المهمة
    const freezeImportantObjects = () => {
      try {
        // تجميد console بطريقة آمنة
        if (typeof console === "object" && console !== null) {
          try {
            Object.freeze(console);
          } catch (error) {
            console.warn("تعذر تجميد console:", error);
          }
        }

        // تجميد document بطريقة آمنة
        if (typeof document === "object" && document !== null) {
          try {
            Object.freeze(document);
          } catch (error) {
            console.warn("تعذر تجميد document:", error);
          }
        }

        // منع تعديل prototype بطريقة آمنة
        try {
          Object.freeze(Object.prototype);
        } catch (error) {
          console.warn("تعذر تجميد Object.prototype:", error);
        }

        try {
          Object.freeze(Array.prototype);
        } catch (error) {
          console.warn("تعذر تجميد Array.prototype:", error);
        }

        try {
          Object.freeze(Function.prototype);
        } catch (error) {
          console.warn("تعذر تجميد Function.prototype:", error);
        }
      } catch (error) {
        console.warn("تعذر تطبيق تج��يد الكائنات:", error);
      }
    };

    // إخفاء رموز JavaScript في الذاكرة
    const obfuscateCode = () => {
      try {
        // إعادة تعريف setTimeout و setInterval لكشف التلاعب
        const originalSetTimeout = window.setTimeout;
        const originalSetInterval = window.setInterval;

        try {
          Object.defineProperty(window, "setTimeout", {
            value: function (fn: Function, delay: number) {
              if (typeof fn === "string") {
                console.warn("🚫 تشغيل كود نصي غير مسموح");
                return 0;
              }
              return originalSetTimeout(fn, delay);
            },
            writable: false,
            configurable: false,
          });
        } catch (error) {
          console.warn("تعذر حماية setTimeout:", error);
        }

        try {
          Object.defineProperty(window, "setInterval", {
            value: function (fn: Function, delay: number) {
              if (typeof fn === "string") {
                console.warn("🚫 تشغيل كود نصي غير مسموح");
                return 0;
              }
              return originalSetInterval(fn, delay);
            },
            writable: false,
            configurable: false,
          });
        } catch (error) {
          console.warn("تعذر حماية setInterval:", error);
        }
      } catch (error) {
        console.warn("تعذر تطبيق حماية الكود:", error);
      }
    };

    // نظام كشف البيئات البرمجية والاستثناءات
    const isDevelopmentEnvironment = () => {
      // كشف بيئات التطوير المشروعة
      const devEnvironments = [
        "localhost",
        "127.0.0.1",
        "builder.io",
        "github.dev",
        "codesandbox.io",
        "stackblitz.com",
        "vercel.app",
        "netlify.app",
        "surge.sh",
        "glitch.me",
        "gitpod.io",
        "codespaces.new",
      ];

      const currentHost = window.location.hostname.toLowerCase();
      const isDevHost = devEnvironments.some((env) =>
        currentHost.includes(env),
      );
      const isDevMode = process.env.NODE_ENV === "development";
      const hasDevTools = window.location.search.includes("dev=true");

      return isDevHost || isDevMode || hasDevTools;
    };

    // حماية الكونسول الذكية (فقط للمستخدمين العاديين)
    const smartConsoleProtection = () => {
      if (isDevelopmentEnvironment()) {
        console.log("🔧 بيئة تطوير مكتشفة - تم إيقاف حماية الكونسول");
        return; // لا نحمي الكونسول في بيئات التطوير
      }

      try {
        // حماية خفيفة للمستخدمين العاديين فقط
        const originalWarn = console.warn;
        const showWarningOnce = (() => {
          let warningShown = false;
          return () => {
            if (!warningShown) {
              originalWarn(
                "🛡️ هذا الموقع محمي - لا تحاول الوصول للكود المصدري",
              );
              warningShown = true;
            }
          };
        })();

        // مراقبة بدلاً من منع
        ["log", "error", "warn", "info"].forEach((method) => {
          const original = (console as any)[method];
          try {
            (console as any)[method] = function (...args: any[]) {
              showWarningOnce();
              return original.apply(console, args);
            };
          } catch (error) {
            // تجاهل الأخطاء وترك الكونسول يعمل عادي
          }
        });
      } catch (error) {
        // تجاهل أي أخطاء في الحماية
      }
    };

    // تطبيق جميع الحمايات
    detectDevTools();
    detectConsole();
    preventDebugger();
    preventInspect();
    preventRightClick();
    preventSelection();
    preventDragDrop();
    blockViewSource();
    detectByRendering();
    freezeImportantObjects();
    obfuscateCode();
    smartConsoleProtection();

    // رسالة تحذير في الكونسول قبل تطبيق الحماية
    console.clear();
    console.log(
      "%c🚫 تحذير أمني",
      "color: red; font-size: 40px; font-weight: bold;",
    );
    console.log(
      "%cهذا الموقع محمي بحقوق الطبع والنشر",
      "color: red; font-size: 20px;",
    );
    console.log(
      "%cأي محاولة لسرقة المحتوى أو الكود ستؤدي لحجب الوصول",
      "color: red; font-size: 16px;",
    );
    console.log(
      "%c© MrPheonixX 2024",
      "color: red; font-size: 16px; font-weight: bold;",
    );
  }, []);

  return null;
};

export default DevToolsBlocker;
