import React, { useEffect } from 'react';

const PDFSecurityLayer: React.FC = () => {
  useEffect(() => {
    // منع تحمي�� PDF بشكل إضافي
    const preventPDFDownload = () => {
      // حجب المواقع المعروفة لتحميل PDF
      const blockedDomains = [
        'drive.google.com',
        'docs.google.com', 
        'dropbox.com',
        'onedrive.live.com',
        'icloud.com'
      ];

      // مراقبة محاولات فتح نوافذ جديدة
      try {
        const originalOpen = window.open;
        Object.defineProperty(window, 'open', {
          value: function(url?: string | URL, target?: string, features?: string) {
            if (url && typeof url === 'string') {
              const urlStr = url.toLowerCase();
              const hasBlockedDomain = blockedDomains.some(domain => urlStr.includes(domain));
              const isPDFUrl = urlStr.includes('.pdf') || urlStr.includes('pdf');

              if (hasBlockedDomain || isPDFUrl) {
                console.warn('🚫 فتح الروابط الخارجية محظور لحماية المحتوى');
                return null;
              }
            }
            return originalOpen.call(window, url, target, features);
          },
          writable: false,
          configurable: false
        });
      } catch (error) {
        console.warn('تعذر حماية window.open:', error);
      }

      // منع تحميل الملفات
      const preventDownload = (e: Event) => {
        const target = e.target as HTMLElement;
        if (target && (
          target.tagName === 'A' || 
          target.closest('a') ||
          target.getAttribute('download') !== null
        )) {
          e.preventDefault();
          e.stopPropagation();
          alert('🚫 التحميل محظور - المحتوى محمي');
          return false;
        }
      };

      // إضافة مستمعات للأحداث
      document.addEventListener('click', preventDownload, true);
      document.addEventListener('contextmenu', preventDownload, true);
    };

    // حماية إضافية للإطارات المدمجة (iframes)
    const protectIframes = () => {
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as Element;
              
              // حماية إطارات PDF
              if (element.tagName === 'IFRAME' || element.tagName === 'EMBED' || element.tagName === 'OBJECT') {
                const src = element.getAttribute('src') || '';
                
                if (src.includes('.pdf')) {
                  // إضافة معاملات أمان
                  const secureParams = '#toolbar=0&navpanes=0&scrollbar=0&statusbar=0&messages=0&zoom=page-fit&view=fit';
                  if (!src.includes('#')) {
                    element.setAttribute('src', src + secureParams);
                  }
                  
                  // منع التفاعل المباشر
                  element.setAttribute('sandbox', 'allow-same-origin allow-scripts');
                  
                  // إضافة حماية CSS
                  (element as HTMLElement).style.cssText += `
                    pointer-events: auto !important;
                    user-select: none !important;
                    -webkit-user-select: none !important;
                    -moz-user-select: none !important;
                  `;
                }
              }
              
              // البحث عن إطارات متداخلة
              const iframes = element.querySelectorAll('iframe, embed, object');
              iframes.forEach((iframe) => {
                const src = iframe.getAttribute('src') || '';
                if (src.includes('.pdf')) {
                  iframe.setAttribute('sandbox', 'allow-same-origin allow-scripts');
                }
              });
            }
          });
        });
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true
      });

      return observer;
    };

    // منع استخدام أدوات المطور لتحميل الملفات
    const blockDevToolsDownload = () => {
      try {
        // حجب console.save إذا كان متاحاً
        if (window.console && (window.console as any).save) {
          try {
            Object.defineProperty(window.console, 'save', {
              value: function() {
                console.warn('🚫 حفظ المحتوى من الكونسول محظور');
              },
              writable: false,
              configurable: false
            });
          } catch (error) {
            console.warn('تعذر حجب console.save:', error);
          }
        }

        // حجب تحميل البيانات من الشبكة
        if (typeof window.fetch === 'function') {
          try {
            const originalFetch = window.fetch;
            Object.defineProperty(window, 'fetch', {
              value: function(input: RequestInfo | URL, init?: RequestInit) {
                const url = typeof input === 'string' ? input : input.url;
                if (url && url.includes('.pdf')) {
                  console.warn('🚫 محاولة تحميل PDF محجوبة');
                  return Promise.reject(new Error('PDF download blocked'));
                }
                return originalFetch.call(window, input, init);
              },
              writable: false,
              configurable: false
            });
          } catch (error) {
            console.warn('تعذر حجب fetch:', error);
          }
        }

        // حجب XMLHttpRequest للملفات
        if (typeof XMLHttpRequest !== 'undefined' && XMLHttpRequest.prototype.open) {
          try {
            const originalXHROpen = XMLHttpRequest.prototype.open;
            Object.defineProperty(XMLHttpRequest.prototype, 'open', {
              value: function(method: string, url: string | URL) {
                const urlStr = typeof url === 'string' ? url : url.toString();
                if (urlStr.includes('.pdf')) {
                  console.warn('🚫 محاولة تحميل PDF عبر XHR محجوبة');
                  throw new Error('PDF download blocked');
                }
                return originalXHROpen.apply(this, arguments as any);
              },
              writable: false,
              configurable: false
            });
          } catch (error) {
            console.warn('تعذر حجب XMLHttpRequest:', error);
          }
        }
      } catch (error) {
        console.warn('تعذر تطبيق حجب أدوات التحميل:', error);
      }
    };

    // منع الطباعة للمحتوى المحمي
    const blockPrinting = () => {
      // منع طباعة النافذة
      window.addEventListener('beforeprint', (e) => {
        e.preventDefault();
        alert('🚫 طباعة المحتوى محظورة');
        return false;
      });

      // حجب CSS للطباعة
      const style = document.createElement('style');
      style.textContent = `
        @media print {
          * {
            display: none !important;
            visibility: hidden !important;
          }
          body::before {
            content: "🚫 الطباعة محظورة - المحتوى محم�� بحقوق الطبع والنشر © MrPheonixX";
            display: block !important;
            position: fixed !important;
            top: 50% !important;
            left: 50% !important;
            transform: translate(-50%, -50%) !important;
            font-size: 24px !important;
            color: red !important;
            background: white !important;
            padding: 20px !important;
            border: 3px solid red !important;
            z-index: 999999 !important;
            visibility: visible !important;
          }
        }
      `;
      document.head.appendChild(style);
    };

    // حماية من تقنيات الالتفاف الشائعة
    const preventBypassTechniques = () => {
      try {
        // منع تشغيل كود JavaScript خارجي
        if (typeof window.eval === 'function') {
          try {
            Object.defineProperty(window, 'eval', {
              value: function(code: string) {
                console.warn('🚫 تشغيل eval محجوب لأسباب أمنية');
                throw new Error('eval blocked for security');
              },
              writable: false,
              configurable: false
            });
          } catch (error) {
            console.warn('تعذر حجب eval:', error);
          }
        }

        // منع Function constructor
        if (typeof window.Function === 'function') {
          try {
            Object.defineProperty(window, 'Function', {
              value: function() {
                console.warn('🚫 Function constructor محجوب لأسباب أمنية');
                throw new Error('Function constructor blocked for security');
              },
              writable: false,
              configurable: false
            });
          } catch (error) {
            console.warn('تعذر حجب Function constructor:', error);
          }
        }

        // حماية من تعديل document.write
        if (typeof document.write === 'function') {
          try {
            const originalDocumentWrite = document.write.bind(document);
            Object.defineProperty(document, 'write', {
              value: function(markup: string) {
                if (markup.includes('pdf') || markup.includes('download')) {
                  console.warn('🚫 محاولة كتابة محتوى مشبوه محجوبة');
                  return;
                }
                return originalDocumentWrite(markup);
              },
              writable: false,
              configurable: false
            });
          } catch (error) {
            console.warn('تعذر حماية document.write:', error);
          }
        }
      } catch (error) {
        console.warn('تعذر تطبيق حماية تقنيات الالتفاف:', error);
      }
    };

    // مراقبة الحافظة لمنع النسخ
    const protectClipboard = () => {
      document.addEventListener('copy', (e) => {
        e.preventDefault();
        e.clipboardData?.setData('text/plain', '🚫 النسخ محظور - المحتوى محمي');
        alert('🚫 نسخ المحتوى محظور');
      });

      document.addEventListener('cut', (e) => {
        e.preventDefault();
        alert('🚫 قص المحتوى محظور');
      });

      document.addEventListener('paste', (e) => {
        const clipboardData = e.clipboardData?.getData('text/plain') || '';
        if (clipboardData.includes('pdf') || clipboardData.includes('download')) {
          e.preventDefault();
          alert('🚫 لصق محتوى مشبو�� محظور');
        }
      });
    };

    // تطبيق جميع الحمايات
    preventPDFDownload();
    const observer = protectIframes();
    blockDevToolsDownload();
    blockPrinting();
    preventBypassTechniques();
    protectClipboard();

    // تنظيف عند إلغاء التحميل
    return () => {
      observer.disconnect();
    };
  }, []);

  return null; // هذا المكون غير مرئي
};

export default PDFSecurityLayer;
