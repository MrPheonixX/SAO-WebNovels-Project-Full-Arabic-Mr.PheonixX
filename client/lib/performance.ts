// مكتبة تحسين الأداء والكشف عن الأجهزة
// Performance optimization and device detection library

export interface DeviceInfo {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isLowEnd: boolean;
  supportedFeatures: {
    webGL: boolean;
    webGL2: boolean;
    canvas: boolean;
    requestAnimationFrame: boolean;
    intersectionObserver: boolean;
    resizeObserver: boolean;
  };
  performanceLevel: 'low' | 'medium' | 'high';
  ram: number; // تقدير تقريبي بالجيجابايت
  cores: number;
  connection: {
    type: string;
    downlink: number;
    effectiveType: string;
    rtt: number;
  };
}

export interface PerformanceSettings {
  enableParticles: boolean;
  particleCount: number;
  enableAnimations: boolean;
  enableBlur: boolean;
  enableShadows: boolean;
  animationQuality: 'low' | 'medium' | 'high';
  textureQuality: 'low' | 'medium' | 'high';
  enableGPUAcceleration: boolean;
}

class PerformanceOptimizer {
  private deviceInfo: DeviceInfo;
  private settings: PerformanceSettings;
  private frameRate: number = 60;
  private lastFrameTime: number = 0;
  private frameCount: number = 0;
  private performanceMonitorInterval: number | null = null;

  constructor() {
    this.deviceInfo = this.detectDevice();
    this.settings = this.calculateOptimalSettings();
    this.startPerformanceMonitoring();
  }

  // كشف نوع الجهاز والإمكانيات
  private detectDevice(): DeviceInfo {
    const userAgent = navigator.userAgent.toLowerCase();
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    const gl2 = canvas.getContext('webgl2');

    // كشف نوع الجهاز
    const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
    const isTablet = /(ipad|tablet|(android(?!.*mobile))|(windows(?!.*phone)(.*touch))|kindle|playbook|silk|(puffin(?!.*(IP|AP|WP))))/i.test(userAgent);
    const isDesktop = !isMobile && !isTablet;

    // تقدير عدد النوى
    const cores = navigator.hardwareConcurrency || 2;

    // تقدير الذاكرة (تقريب��)
    const ram = (navigator as any).deviceMemory || (cores >= 8 ? 8 : cores >= 4 ? 4 : 2);

    // معلومات الاتصال
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection || {
      type: 'unknown',
      downlink: 1.5,
      effectiveType: '3g',
      rtt: 100
    };

    // كشف الميزات المدعومة
    const supportedFeatures = {
      webGL: !!gl,
      webGL2: !!gl2,
      canvas: !!canvas.getContext('2d'),
      requestAnimationFrame: 'requestAnimationFrame' in window,
      intersectionObserver: 'IntersectionObserver' in window,
      resizeObserver: 'ResizeObserver' in window,
    };

    // تحديد مستوى الأداء
    let performanceLevel: 'low' | 'medium' | 'high' = 'medium';
    
    if (isMobile && ram <= 2) {
      performanceLevel = 'low';
    } else if (isMobile && ram <= 4) {
      performanceLevel = 'medium';
    } else if (cores >= 8 && ram >= 8 && supportedFeatures.webGL2) {
      performanceLevel = 'high';
    } else if (cores >= 4 && ram >= 4) {
      performanceLevel = 'medium';
    } else {
      performanceLevel = 'low';
    }

    // تحديد الأجهزة الضعيفة
    const isLowEnd = performanceLevel === 'low' || 
                    (isMobile && (ram <= 2 || cores <= 2)) ||
                    connection.effectiveType === '2g' ||
                    connection.downlink < 0.5;

    return {
      isMobile,
      isTablet,
      isDesktop,
      isLowEnd,
      supportedFeatures,
      performanceLevel,
      ram,
      cores,
      connection
    };
  }

  // حساب الإعدادات المثلى
  private calculateOptimalSettings(): PerformanceSettings {
    const { performanceLevel, isLowEnd, supportedFeatures } = this.deviceInfo;

    switch (performanceLevel) {
      case 'low':
        return {
          enableParticles: false,
          particleCount: 0,
          enableAnimations: true,
          enableBlur: false,
          enableShadows: false,
          animationQuality: 'low',
          textureQuality: 'low',
          enableGPUAcceleration: supportedFeatures.webGL
        };

      case 'medium':
        return {
          enableParticles: !isLowEnd,
          particleCount: isLowEnd ? 5 : 15,
          enableAnimations: true,
          enableBlur: !isLowEnd,
          enableShadows: false,
          animationQuality: 'medium',
          textureQuality: 'medium',
          enableGPUAcceleration: supportedFeatures.webGL
        };

      case 'high':
        return {
          enableParticles: true,
          particleCount: 30,
          enableAnimations: true,
          enableBlur: true,
          enableShadows: true,
          animationQuality: 'high',
          textureQuality: 'high',
          enableGPUAcceleration: supportedFeatures.webGL2 || supportedFeatures.webGL
        };

      default:
        return this.calculateOptimalSettings();
    }
  }

  // مراقبة الأداء في الوقت الفعلي
  private startPerformanceMonitoring(): void {
    if (this.performanceMonitorInterval) return;

    this.performanceMonitorInterval = window.setInterval(() => {
      this.measureFrameRate();
      this.adjustSettingsBasedOnPerformance();
    }, 5000) as unknown as number;
  }

  // قياس معدل الإطارات
  private measureFrameRate(): void {
    const now = performance.now();
    this.frameCount++;

    if (now - this.lastFrameTime >= 1000) {
      this.frameRate = Math.round((this.frameCount * 1000) / (now - this.lastFrameTime));
      this.frameCount = 0;
      this.lastFrameTime = now;
    }
  }

  // تعديل الإعدادات حسب الأداء
  private adjustSettingsBasedOnPerformance(): void {
    if (this.frameRate < 30 && this.settings.enableParticles) {
      // تقليل الجسيمات إذا كان الأداء منخفض
      this.settings.particleCount = Math.max(0, this.settings.particleCount - 5);
      if (this.settings.particleCount === 0) {
        this.settings.enableParticles = false;
      }
    } else if (this.frameRate > 55 && !this.settings.enableParticles && this.deviceInfo.performanceLevel !== 'low') {
      // إعادة تفعيل الجسيمات إذا تحسن الأداء
      this.settings.enableParticles = true;
      this.settings.particleCount = 10;
    }

    if (this.frameRate < 20) {
      // إيقاف التأثيرات الثقيلة في حالة الأداء المنخفض جداً
      this.settings.enableBlur = false;
      this.settings.enableShadows = false;
      this.settings.animationQuality = 'low';
    }

    // إرسال تحديث الإعدادات للمكونات
    this.broadcastSettingsUpdate();
  }

  // إرسال تحديث الإعدادات
  private broadcastSettingsUpdate(): void {
    window.dispatchEvent(new CustomEvent('performance-settings-update', {
      detail: { 
        settings: this.settings,
        frameRate: this.frameRate,
        deviceInfo: this.deviceInfo
      }
    }));
  }

  // الحصول على معلومات الجهاز
  public getDeviceInfo(): DeviceInfo {
    return this.deviceInfo;
  }

  // الحصول على الإعدادات ��لحالية
  public getSettings(): PerformanceSettings {
    return this.settings;
  }

  // تحديث الإعدادات يدوياً
  public updateSettings(newSettings: Partial<PerformanceSettings>): void {
    this.settings = { ...this.settings, ...newSettings };
    this.broadcastSettingsUpdate();
  }

  // الحصول على معدل الإطارات الحالي
  public getFrameRate(): number {
    return this.frameRate;
  }

  // تحسين عملية التحميل
  public optimizeLoading(): void {
    // تأجيل تحميل الموارد غير الضرورية
    if (this.deviceInfo.isLowEnd) {
      // تأجيل تحميل الخطوط الإضافية
      document.querySelectorAll('link[rel="preload"][as="font"]').forEach(link => {
        (link as HTMLLinkElement).rel = 'stylesheet';
      });

      // تقليل جودة الصور للأجهزة الضعيفة
      document.querySelectorAll('img[data-src-hd]').forEach(img => {
        const hdSrc = img.getAttribute('data-src-hd');
        const lowSrc = img.getAttribute('data-src-low');
        if (lowSrc) {
          img.setAttribute('src', lowSrc);
        }
      });
    }
  }

  // تنظيف الموارد
  public cleanup(): void {
    if (this.performanceMonitorInterval) {
      clearInterval(this.performanceMonitorInterval);
      this.performanceMonitorInterval = null;
    }
  }

  // تحسين CSS للأجهزة المختلفة
  public applyDeviceOptimizations(): void {
    const styleSheet = document.createElement('style');
    let css = '';

    if (this.deviceInfo.isLowEnd) {
      css += `
        /* تحسينات للأجهزة الضعيفة */
        * {
          transform: translateZ(0);
          -webkit-transform: translateZ(0);
        }
        
        .animate-bounce, .animate-pulse, .animate-ping {
          animation-duration: 2s !important;
        }
        
        .blur-xl, .blur-2xl, .blur-3xl {
          filter: none !important;
        }
        
        .backdrop-blur-xl {
          backdrop-filter: none !important;
          background-color: rgba(0, 0, 0, 0.8) !important;
        }
      `;
    }

    if (this.deviceInfo.isMobile) {
      css += `
        /* تحسينات للهواتف */
        .hover\\:scale-105:hover {
          transform: scale(1.02) !important;
        }
        
        .transition-all {
          transition-duration: 0.2s !important;
        }
      `;
    }

    if (!this.deviceInfo.supportedFeatures.webGL) {
      css += `
        /* بديل للأجهزة التي لا تدعم WebGL */
        canvas {
          display: none !important;
        }
      `;
    }

    styleSheet.textContent = css;
    document.head.appendChild(styleSheet);
  }
}

// إنشاء مثيل عام
export const performanceOptimizer = new PerformanceOptimizer();

// تطبيق التحسينات عند تحميل الصفحة
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    performanceOptimizer.applyDeviceOptimizations();
    performanceOptimizer.optimizeLoading();
  });
}

// تنظيف الموارد عند إلغاء تحميل الصفحة
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    performanceOptimizer.cleanup();
  });
}

export default performanceOptimizer;
