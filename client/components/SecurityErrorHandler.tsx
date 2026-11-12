import React, { useEffect } from 'react';

const SecurityErrorHandler: React.FC = () => {
  useEffect(() => {
    // معالج أخطاء شامل للمكونات الأمنية
    const handleSecurityError = (error: ErrorEvent) => {
      // تصفية الأخطاء المتعلقة بالحماية لتجنب إزعاج المستخدم
      const securityRelatedMessages = [
        'Cannot assign to read only property',
        'Cannot add property',
        'object is not extensible',
        'Cannot redefine property',
        'Cannot define property',
        'property is not configurable',
        'eval blocked for security',
        'Function constructor blocked',
        'PDF download blocked'
      ];

      const isSecurityError = securityRelatedMessages.some(msg => 
        error.message && error.message.includes(msg)
      );

      if (isSecurityError) {
        // منع إظهار هذه الأخطاء في الكونسول للمستخدم العادي
        error.preventDefault();
        
        // تسجيل داخلي صامت للتطوير
        if (process.env.NODE_ENV === 'development') {
          console.log('🛡️ Security protection active:', error.message);
        }
        
        return false;
      }
    };

    // معالج أخطاء الوعود غير المعالجة
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const errorMessage = event.reason?.message || event.reason?.toString() || '';
      
      const securityRelatedMessages = [
        'PDF download blocked',
        'eval blocked for security',
        'Function constructor blocked'
      ];

      const isSecurityError = securityRelatedMessages.some(msg => 
        errorMessage.includes(msg)
      );

      if (isSecurityError) {
        // منع إظهار هذه الأخطاء
        event.preventDefault();
        
        if (process.env.NODE_ENV === 'development') {
          console.log('🛡️ Security promise rejection handled:', errorMessage);
        }
      }
    };

    // إضافة معالجات الأخطاء
    window.addEventListener('error', handleSecurityError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    // تنظيف المعالجات عند إلغاء التحميل
    return () => {
      window.removeEventListener('error', handleSecurityError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  return null; // هذا المكون غير مرئي
};

export default SecurityErrorHandler;
