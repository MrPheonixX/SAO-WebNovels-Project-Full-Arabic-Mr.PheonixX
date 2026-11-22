import React, { useEffect, useState, useRef } from 'react';
import { performanceOptimizer, type DeviceInfo, type PerformanceSettings } from '@/lib/performance';

interface PerformanceOptimizerProps {
  children: React.ReactNode;
  enableDebugInfo?: boolean;
}

interface PerformanceState {
  deviceInfo: DeviceInfo | null;
  settings: PerformanceSettings | null;
  frameRate: number;
  isOptimized: boolean;
  loadTime: number;
}

export default function PerformanceOptimizer({ children, enableDebugInfo = false }: PerformanceOptimizerProps) {
  const [performanceState, setPerformanceState] = useState<PerformanceState>({
    deviceInfo: null,
    settings: null,
    frameRate: 60,
    isOptimized: false,
    loadTime: 0
  });

  const startTime = useRef(performance.now());
  const frameId = useRef<number>();
  const frameCount = useRef(0);
  const lastTime = useRef(performance.now());

  // تتبع الأداء في الوقت الفعلي
  const measurePerformance = () => {
    const now = performance.now();
    frameCount.current++;

    if (now - lastTime.current >= 1000) {
      const fps = Math.round((frameCount.current * 1000) / (now - lastTime.current));
      setPerformanceState(prev => ({ ...prev, frameRate: fps }));
      frameCount.current = 0;
      lastTime.current = now;
    }

    frameId.current = requestAnimationFrame(measurePerformance);
  };

  useEffect(() => {
    // تهيئة محسن الأداء
    const deviceInfo = performanceOptimizer.getDeviceInfo();
    const settings = performanceOptimizer.getSettings();
    const loadTime = performance.now() - startTime.current;

    setPerformanceState({
      deviceInfo,
      settings,
      frameRate: 60,
      isOptimized: true,
      loadTime
    });

    // بدء قياس الأداء
    frameId.current = requestAnimationFrame(measurePerformance);

    // الاستماع لتحديثات الأداء
    const handlePerformanceUpdate = (event: CustomEvent) => {
      const { settings: newSettings, frameRate, deviceInfo: newDeviceInfo } = event.detail;
      setPerformanceState(prev => ({
        ...prev,
        settings: newSettings,
        frameRate,
        deviceInfo: newDeviceInfo
      }));
    };

    window.addEventListener('performance-settings-update', handlePerformanceUpdate as EventListener);

    // تطبيق تحسينات CSS المتقدمة
    applyAdvancedOptimizations(deviceInfo, settings);

    return () => {
      if (frameId.current) {
        cancelAnimationFrame(frameId.current);
      }
      window.removeEventListener('performance-settings-update', handlePerformanceUpdate as EventListener);
    };
  }, []);

  // تطبيق تحسينات CSS متقدمة
  const applyAdvancedOptimizations = (deviceInfo: DeviceInfo, settings: PerformanceSettings) => {
    const styleElement = document.createElement('style');
    let optimizationCSS = '';

    // تحسينات للأجهزة الضعيفة
    if (deviceInfo.isLowEnd) {
      optimizationCSS += `
        /* تحسينات شاملة للأجهزة الضعيفة */
        .sao-optimized {
          will-change: auto !important;
          transform: translateZ(0);
          -webkit-transform: translateZ(0);
        }

        .sao-optimized * {
          will-change: auto !important;
        }

        .sao-optimized .animate-pulse {
          animation-duration: 3s !important;
        }

        .sao-optimized .animate-bounce {
          animation-duration: 2s !important;
          animation-iteration-count: 3 !important;
        }

        .sao-optimized .animate-ping {
          animation-duration: 2.5s !important;
        }

        .sao-optimized .transition-all {
          transition-duration: 0.15s !important;
          transition-property: opacity, transform !important;
        }

        /* إزالة التأثيرات الثقيلة */
        .sao-optimized .blur-xl,
        .sao-optimized .blur-2xl,
        .sao-optimized .blur-3xl {
          filter: none !important;
        }

        .sao-optimized .backdrop-blur-xl {
          backdrop-filter: none !important;
          background-color: rgba(0, 0, 0, 0.9) !important;
        }

        .sao-optimized .shadow-2xl,
        .sao-optimized .shadow-xl {
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3) !important;
        }
      `;
    }

    // تحسينات للهواتف والأجهزة اللوحية
    if (deviceInfo.isMobile || deviceInfo.isTablet) {
      optimizationCSS += `
        /* تحسينات للشاشات اللمسية */
        .sao-mobile-optimized {
          touch-action: manipulation;
          -webkit-tap-highlight-color: transparent;
        }

        .sao-mobile-optimized .hover\\:scale-105:hover,
        .sao-mobile-optimized .hover\\:scale-105:active {
          transform: scale(1.02) !important;
        }

        .sao-mobile-optimized .group:hover .group-hover\\:scale-105 {
          transform: scale(1.01) !important;
        }

        /* تحسين التمرير */
        .sao-mobile-optimized {
          -webkit-overflow-scrolling: touch;
          scroll-behavior: smooth;
        }

        /* تقليل المسافات للشاشات الصغيرة */
        @media (max-width: 640px) {
          .sao-mobile-optimized .container {
            padding-left: 1rem !important;
            padding-right: 1rem !important;
          }

          .sao-mobile-optimized .py-16 {
            padding-top: 2rem !important;
            padding-bottom: 2rem !important;
          }

          .sao-mobile-optimized .mb-20 {
            margin-bottom: 3rem !important;
          }
        }
      `;
    }

    // تحسينات للشبكات البطيئة
    if (deviceInfo.connection.effectiveType === '2g' || deviceInfo.connection.downlink < 1) {
      optimizationCSS += `
        /* تحسينات للشبكات البطيئة */
        .sao-slow-network {
          background-image: none !important;
        }

        .sao-slow-network .bg-gradient-to-r,
        .sao-slow-network .bg-gradient-to-br,
        .sao-slow-network .bg-gradient-radial {
          background: rgba(59, 130, 246, 0.2) !important;
        }

        .sao-slow-network img {
          loading: lazy;
        }
      `;
    }

    // تحسينات للأجهزة عالية الأداء
    if (deviceInfo.performanceLevel === 'high') {
      optimizationCSS += `
        /* تحسينات للأجهزة عالية الأداء */
        .sao-high-performance {
          will-change: transform, opacity;
        }

        .sao-high-performance .animate-pulse {
          animation-duration: 1.5s !important;
        }

        .sao-high-performance .transition-all {
          transition-duration: 0.3s !important;
          transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1) !important;
        }

        /* تفعيل GPU للرسوميات المتقدمة */
        .sao-high-performance .bg-gradient-to-r,
        .sao-high-performance .bg-gradient-to-br {
          transform: translateZ(0);
          -webkit-transform: translateZ(0);
        }
      `;
    }

    // تحسينات لدعم WebGL
    if (!deviceInfo.supportedFeatures.webGL) {
      optimizationCSS += `
        /* بدائل لعدم دعم WebGL */
        .sao-no-webgl canvas {
          display: none !important;
        }

        .sao-no-webgl .particle-effects {
          display: none !important;
        }
      `;
    }

    styleElement.textContent = optimizationCSS;
    styleElement.id = 'sao-performance-optimizations';
    
    // إزالة التحسينات السابقة
    const existingStyle = document.getElementById('sao-performance-optimizations');
    if (existingStyle) {
      existingStyle.remove();
    }
    
    document.head.appendChild(styleElement);
  };

  // تطبيق فئات CSS المناسبة
  const getOptimizationClasses = () => {
    if (!performanceState.deviceInfo) return '';

    const classes = [];

    if (performanceState.deviceInfo.isLowEnd) {
      classes.push('sao-optimized');
    }

    if (performanceState.deviceInfo.isMobile || performanceState.deviceInfo.isTablet) {
      classes.push('sao-mobile-optimized');
    }

    if (performanceState.deviceInfo.connection.effectiveType === '2g' || 
        performanceState.deviceInfo.connection.downlink < 1) {
      classes.push('sao-slow-network');
    }

    if (performanceState.deviceInfo.performanceLevel === 'high') {
      classes.push('sao-high-performance');
    }

    if (!performanceState.deviceInfo.supportedFeatures.webGL) {
      classes.push('sao-no-webgl');
    }

    return classes.join(' ');
  };

  return (
    <div className={`sao-performance-container ${getOptimizationClasses()}`}>
      {children}
      
      {/* معلومات التشخيص للتطوير */}
      {enableDebugInfo && performanceState.deviceInfo && (
        <div className="fixed bottom-1 left-1 bg-black/80 text-white p-1 rounded-md text-[10px] leading-tight font-mono z-50 max-w-[160px]">
          <h3 className="text-green-400 mb-1">Performance Debug</h3>
          <div className="space-y-1">
            <div>FPS: <span className={performanceState.frameRate < 30 ? 'text-red-400' : 'text-green-400'}>{performanceState.frameRate}</span></div>
            <div>Device: {performanceState.deviceInfo.isMobile ? 'mobile' : performanceState.deviceInfo.isTablet ? 'tablet' : 'desktop'}</div>
            <div>Performance: <span className={`${
              performanceState.deviceInfo.performanceLevel === 'high' ? 'text-green-400' :
              performanceState.deviceInfo.performanceLevel === 'medium' ? 'text-yellow-400' : 'text-red-400'
            }`}>{performanceState.deviceInfo.performanceLevel}</span></div>
            <div>RAM: {performanceState.deviceInfo.ram}GB</div>
            <div>Cores: {performanceState.deviceInfo.cores}</div>
            <div>WebGL: {performanceState.deviceInfo.supportedFeatures.webGL ? 'yes' : 'no'}</div>
            <div>Connection: {performanceState.deviceInfo.connection.effectiveType}</div>
            <div>Particles: {performanceState.settings?.enableParticles ? 'yes' : 'no'}</div>
            <div>Load Time: {performanceState.loadTime.toFixed(0)}ms</div>
          </div>
        </div>
      )}
    </div>
  );
}

// Hook لاستخدام معلومات الأداء في المكونات الأخرى
export function usePerformance() {
  const [performanceData, setPerformanceData] = useState({
    deviceInfo: performanceOptimizer.getDeviceInfo(),
    settings: performanceOptimizer.getSettings(),
    frameRate: performanceOptimizer.getFrameRate()
  });

  useEffect(() => {
    const handleUpdate = (event: CustomEvent) => {
      const { settings, frameRate, deviceInfo } = event.detail;
      setPerformanceData({ deviceInfo, settings, frameRate });
    };

    window.addEventListener('performance-settings-update', handleUpdate as EventListener);
    
    return () => {
      window.removeEventListener('performance-settings-update', handleUpdate as EventListener);
    };
  }, []);

  return performanceData;
}
