import React, { useEffect } from 'react';
import { isAdmin } from '@/lib/cloud';

// نظام استثناءات المطورين والأدوات البرمجية
const DeveloperExceptions: React.FC = () => {
  useEffect(() => {
    // قائمة بيئات التطوير المشروعة
    const legitimateDevelopmentEnvironments = [
      // بيئات التطوير المحلية
      'localhost',
      '127.0.0.1',
      '0.0.0.0',
      '::1',
      
      // منصات التطوير السحابية
      'builder.io',
      'github.dev',
      'github.com',
      'codesandbox.io',
      'stackblitz.com',
      'replit.com',
      'glitch.me',
      'gitpod.io',
      'codespaces.new',
      
      // منصات النشر والاستضافة
      'vercel.app',
      'vercel.com',
      'netlify.app',
      'netlify.com',
      'surge.sh',
      'herokuapp.com',
      'railway.app',
      'render.com',
      'fly.dev',
      'fly.io',
      
      // أدوات Git ومراجعة الكود
      'gitlab.com',
      'bitbucket.org',
      'azure.com',
      'visualstudio.com',
      
      // أدوات التطوير الأخرى
      'jsbin.com',
      'jsfiddle.net',
      'codepen.io',
      'observablehq.com'
    ];

    // كشف عوامل التطوير المختلفة
    const detectDevelopmentContext = () => {
      const currentHost = window.location.hostname.toLowerCase();
      const currentOrigin = window.location.origin.toLowerCase();
      const userAgent = navigator.userAgent.toLowerCase();
      
      // التحقق من النطاق/المضيف
      const isLegitimateHost = legitimateDevelopmentEnvironments.some(env => 
        currentHost.includes(env) || currentOrigin.includes(env)
      );
      
      // التحقق من متغيرات البيئة
      const isDevMode = process.env.NODE_ENV === 'development';
      
      // التحقق من معاملات URL
      const urlParams = new URLSearchParams(window.location.search);
      const hasDevParam = urlParams.has('dev') || urlParams.has('debug') || urlParams.has('developer');
      
      // التحقق من localStorage للمطورين
      const isDeveloperMode = localStorage.getItem('developer_mode') === 'true';
      
      // التحقق من User Agent لأدوات التطوير
      const developmentTools = [
        'electron', // VS Code, Atom, etc.
        'puppeteer',
        'playwright',
        'selenium',
        'webdriver',
        'chrome-headless',
        'phantomjs'
      ];
      
      const isToolUserAgent = developmentTools.some(tool => userAgent.includes(tool));
      
      // التحقق من وجود أدوات تطوير مفتوحة (طريقة غير مباشرة)
      let devToolsOpen = false;
      try {
        const before = performance.now();
        console.count('dev-check');
        const after = performance.now();
        devToolsOpen = (after - before) > 1; // إذا كانت الكونسول مفتوحة، هذا سيكون أبطأ
      } catch (e) {
        // تجاهل الأخطاء
      }
      
      return {
        isLegitimateHost,
        isDevMode,
        hasDevParam,
        isDeveloperMode,
        isToolUserAgent,
        devToolsOpen,
        shouldBypassSecurity: isLegitimateHost || isDevMode || hasDevParam || isDeveloperMode || isToolUserAgent
      };
    };

    // تطبيق الاستثناءات
    const applyDeveloperExceptions = () => {
      const context = detectDevelopmentContext();
      
      if (context.shouldBypassSecurity) {
        console.log('🔧 بيئة تطوير مشروعة مكتشفة - تم تطبيق استثناءات المطورين');
        console.log('📊 تفاصيل البيئة:', context);
        
        // تعيين علامة عامة للاستثناء
        (window as any).__DEVELOPER_MODE__ = true;
        (window as any).__SECURITY_BYPASS__ = true;
        
        // حفظ في localStorage للجلسات المستقبلية
        localStorage.setItem('legitimate_developer', 'true');
        localStorage.setItem('security_bypass_reason', JSON.stringify({
          host: window.location.hostname,
          timestamp: new Date().toISOString(),
          context: context
        }));
        
        // إظهار رسالة ترحيب للمطورين
        const welcomeMessage = `
🎉 مرحباً بك في بيئة التطوير!
🔧 تم إيقاف جميع قيود الأمان
💻 يمكنك الآن استخدام أدوات المطور بحرية
📱 جميع وظائف الكونسول متاحة
        `;
        
        console.log(welcomeMessage);
        
        // إضافة CSS خاص للمطورين
        const devStyles = document.createElement('style');
        devStyles.id = 'developer-mode-styles';
        devStyles.textContent = `
          body::before {
            content: "🔧 Developer Mode Active";
            position: fixed;
            top: 10px;
            right: 10px;
            background: #00ff00;
            color: #000;
            padding: 5px 10px;
            border-radius: 5px;
            font-size: 12px;
            z-index: 999999;
            font-family: monospace;
          }
        `;
        document.head.appendChild(devStyles);
        
        return true;
      }
      
      return false;
    };

    // إنشاء واجهة للمطورين لتفعيل الوضع يدوياً
    const createDeveloperInterface = () => {
      // إضافة اختصار لوحة مفاتيح سري للمطورين
      document.addEventListener('keydown', (e) => {
        // Ctrl+Shift+Alt+D = تفعيل وضع المطور
        if (e.ctrlKey && e.shiftKey && e.altKey && e.code === 'KeyD') {
          isAdmin().then((ok) => {
            if (ok) {
              localStorage.setItem('developer_mode', 'true');
              alert('✅ تم تفعيل وضع المطور - قم بإعادة تحميل الصفحة');
              window.location.reload();
            } else {
              alert('❌ سجّل الدخول بحساب المدير أولاً');
            }
          });
        }
      });

      // إضافة وظيفة عامة للتفعيل من الكونسول
      (window as any).enableDeveloperMode = async () => {
        if (await isAdmin()) {
          localStorage.setItem('developer_mode', 'true');
          window.location.reload();
          return 'تم تفعيل وضع المطور';
        }
        return 'سجّل الدخول بحساب المدير أولاً';
      };

      // إضافة وظيفة لإيقاف وضع المطور
      (window as any).disableDeveloperMode = () => {
        localStorage.removeItem('developer_mode');
        localStorage.removeItem('legitimate_developer');
        localStorage.removeItem('security_bypass_reason');
        delete (window as any).__DEVELOPER_MODE__;
        delete (window as any).__SECURITY_BYPASS__;
        alert('تم إيقاف وضع المطور - سيتم إعادة تحميل الصفحة');
        window.location.reload();
      };

      // معلومات مساعدة للمطورين
      (window as any).developerHelp = () => {
        console.log(`
🔧 أوامر المطور المتاحة:
━━━━━━��━━━━━━━━━━━━━━━━━

🟢 enableDeveloperMode() - تفعيل وضع المطور (حساب المدير)
🔴 disableDeveloperMode() - إيقاف وضع المطور  
ℹ️  developerHelp() - عرض هذه المساعدة

🔐 اختصار لوحة المفاتيح: Ctrl+Shift+Alt+D

💡 يعمل فقط إذا كنت مسجّلاً بحساب مدير

🌐 بيئات التطوير المدعومة تلقائياً:
   - localhost, 127.0.0.1
   - builder.io, github.dev
   - vercel.app, netlify.app
   - codesandbox.io, stackblitz.com
   - وغيرها...
        `);
      };
    };

    // تطبيق النظام
    const isDeveloper = applyDeveloperExceptions();
    createDeveloperInterface();

    // رسالة ترحيب في الكونسول (للجميع)
    if (!isDeveloper) {
      console.log(`
🎯 للمطورين: اكتب developerHelp() للحصول على المساعدة
🔧 أو استخدم الاختصار: Ctrl+Shift+Alt+D
      `);
    }

    // تنظيف عند إلغاء التحميل
    return () => {
      const devStyles = document.getElementById('developer-mode-styles');
      if (devStyles) {
        devStyles.remove();
      }
    };
  }, []);

  return null; // مكون غير مرئي
};

export default DeveloperExceptions;
