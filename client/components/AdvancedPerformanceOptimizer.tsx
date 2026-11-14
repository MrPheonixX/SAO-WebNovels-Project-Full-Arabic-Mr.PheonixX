import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Zap, 
  Gauge, 
  Wifi, 
  HardDrive, 
  Cpu, 
  Eye, 
  Settings,
  CheckCircle,
  AlertTriangle,
  Info
} from 'lucide-react';

interface PerformanceMetrics {
  fps: number;
  memory: number;
  loadTime: number;
  connectionSpeed: 'slow' | 'fast' | 'unknown';
  deviceType: 'high-end' | 'mid-range' | 'low-end';
  batteryLevel: number;
  isOnBattery: boolean;
}

interface Optimization {
  id: string;
  name: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  enabled: boolean;
  category: 'performance' | 'battery' | 'network' | 'visual';
}

const AdvancedPerformanceOptimizer: React.FC = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 60,
    memory: 0,
    loadTime: 0,
    connectionSpeed: 'unknown',
    deviceType: 'mid-range',
    batteryLevel: 100,
    isOnBattery: false
  });

  const [optimizations, setOptimizations] = useState<Optimization[]>([
    {
      id: 'lazy-loading',
      name: 'تحميل كسول للصور',
      description: 'تحميل الصور عند الحاجة فقط',
      impact: 'high',
      enabled: true,
      category: 'performance'
    },
    {
      id: 'code-splitting',
      name: 'تقسيم الكود',
      description: 'تحميل الصفحات حسب الحاجة',
      impact: 'high',
      enabled: true,
      category: 'performance'
    },
    {
      id: 'animation-reduction',
      name: 'تقليل الحركات',
      description: 'تقليل التأثيرات المرئية لتوفير البطارية',
      impact: 'medium',
      enabled: false,
      category: 'battery'
    },
    {
      id: 'prefetch-content',
      name: 'التحميل المسبق',
      description: 'تحميل المحتوى المتوقع قراءته',
      impact: 'medium',
      enabled: true,
      category: 'network'
    },
    {
      id: 'gpu-acceleration',
      name: 'تسريع الرسوميات',
      description: 'استخدام كرت الرسوميات للتحسين',
      impact: 'high',
      enabled: true,
      category: 'visual'
    },
    {
      id: 'memory-cleanup',
      name: 'تنظيف الذاكرة',
      description: 'تنظيف دوري للذاكرة المستخدمة',
      impact: 'medium',
      enabled: true,
      category: 'performance'
    }
  ]);

  const [showDetails, setShowDetails] = useState(false);

  // Performance monitoring
  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();
    
    const measureFPS = () => {
      frameCount++;
      const currentTime = performance.now();
      
      if (currentTime - lastTime >= 1000) {
        setMetrics(prev => ({ ...prev, fps: frameCount }));
        frameCount = 0;
        lastTime = currentTime;
      }
      
      requestAnimationFrame(measureFPS);
    };
    
    requestAnimationFrame(measureFPS);

    // Memory monitoring
    const updateMemory = () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        const usedMB = memory.usedJSHeapSize / 1048576;
        setMetrics(prev => ({ ...prev, memory: usedMB }));
      }
    };

    const memoryInterval = setInterval(updateMemory, 5000);

    // Network speed detection
    const detectConnection = () => {
      if ('connection' in navigator) {
        const connection = (navigator as any).connection;
        const effectiveType = connection.effectiveType;
        
        if (effectiveType === '4g' || effectiveType === '5g') {
          setMetrics(prev => ({ ...prev, connectionSpeed: 'fast' }));
        } else {
          setMetrics(prev => ({ ...prev, connectionSpeed: 'slow' }));
        }
      }
    };

    detectConnection();

    // Battery monitoring
    const updateBattery = () => {
      if ('getBattery' in navigator) {
        (navigator as any).getBattery().then((battery: any) => {
          setMetrics(prev => ({
            ...prev,
            batteryLevel: Math.round(battery.level * 100),
            isOnBattery: !battery.charging
          }));
        });
      }
    };

    updateBattery();
    const batteryInterval = setInterval(updateBattery, 30000);

    // Device performance estimation
    const estimateDevicePerformance = () => {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl') as WebGLRenderingContext;

      if (gl && 'getParameter' in gl) {
        const vendor = gl.getParameter(gl.VENDOR);
        const renderer = gl.getParameter(gl.RENDERER);
        
        // Simple heuristic based on GPU
        if (renderer.includes('Apple') || renderer.includes('NVIDIA') || renderer.includes('Radeon')) {
          setMetrics(prev => ({ ...prev, deviceType: 'high-end' }));
        } else if (renderer.includes('Intel')) {
          setMetrics(prev => ({ ...prev, deviceType: 'mid-range' }));
        } else {
          setMetrics(prev => ({ ...prev, deviceType: 'low-end' }));
        }
      }
    };

    estimateDevicePerformance();

    return () => {
      clearInterval(memoryInterval);
      clearInterval(batteryInterval);
    };
  }, []);

  // Auto-adjust settings based on performance
  useEffect(() => {
    const autoOptimize = () => {
      const newOptimizations = [...optimizations];
      
      // Enable battery optimizations if battery is low
      if (metrics.batteryLevel < 20 && metrics.isOnBattery) {
        const animationOpt = newOptimizations.find(opt => opt.id === 'animation-reduction');
        if (animationOpt) animationOpt.enabled = true;
      }
      
      // Adjust based on FPS
      if (metrics.fps < 30) {
        const gpuOpt = newOptimizations.find(opt => opt.id === 'gpu-acceleration');
        const animationOpt = newOptimizations.find(opt => opt.id === 'animation-reduction');
        if (gpuOpt) gpuOpt.enabled = true;
        if (animationOpt) animationOpt.enabled = true;
      }
      
      // Adjust based on memory usage
      if (metrics.memory > 100) {
        const memoryOpt = newOptimizations.find(opt => opt.id === 'memory-cleanup');
        if (memoryOpt) memoryOpt.enabled = true;
      }
      
      // Adjust based on connection speed
      if (metrics.connectionSpeed === 'slow') {
        const lazyOpt = newOptimizations.find(opt => opt.id === 'lazy-loading');
        const prefetchOpt = newOptimizations.find(opt => opt.id === 'prefetch-content');
        if (lazyOpt) lazyOpt.enabled = true;
        if (prefetchOpt) prefetchOpt.enabled = false;
      }
      
      setOptimizations(newOptimizations);
    };

    const optimizeInterval = setInterval(autoOptimize, 10000);
    return () => clearInterval(optimizeInterval);
  }, [metrics, optimizations]);

  // Apply optimizations
  useEffect(() => {
    optimizations.forEach(opt => {
      if (opt.enabled) {
        applyOptimization(opt.id);
      } else {
        removeOptimization(opt.id);
      }
    });
  }, [optimizations]);

  const applyOptimization = (id: string) => {
    switch (id) {
      case 'lazy-loading':
        document.body.classList.add('lazy-loading-enabled');
        break;
      case 'animation-reduction':
        document.body.classList.add('reduced-motion');
        break;
      case 'gpu-acceleration':
        document.body.classList.add('gpu-accelerated');
        break;
      case 'memory-cleanup':
        // Force garbage collection (if available)
        if ('gc' in window) {
          (window as any).gc();
        }
        break;
    }
  };

  const removeOptimization = (id: string) => {
    switch (id) {
      case 'lazy-loading':
        document.body.classList.remove('lazy-loading-enabled');
        break;
      case 'animation-reduction':
        document.body.classList.remove('reduced-motion');
        break;
      case 'gpu-acceleration':
        document.body.classList.remove('gpu-accelerated');
        break;
    }
  };

  const toggleOptimization = (id: string) => {
    setOptimizations(prev => 
      prev.map(opt => 
        opt.id === id ? { ...opt, enabled: !opt.enabled } : opt
      )
    );
  };

  const getPerformanceScore = () => {
    let score = 100;
    
    if (metrics.fps < 30) score -= 20;
    else if (metrics.fps < 45) score -= 10;
    
    if (metrics.memory > 150) score -= 20;
    else if (metrics.memory > 100) score -= 10;
    
    if (metrics.connectionSpeed === 'slow') score -= 15;
    
    if (metrics.deviceType === 'low-end') score -= 15;
    else if (metrics.deviceType === 'mid-range') score -= 5;
    
    return Math.max(0, score);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const performanceScore = getPerformanceScore();

  return (
    <div className="advanced-performance-optimizer max-w-4xl mx-auto p-6">
      {/* Performance Score Header */}
      <Card className="mb-6 p-6 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">محسن الأداء المتقدم</h2>
            <p className="text-gray-600">مراقبة وتحسين أداء التطبيق تلقائياً</p>
          </div>
          <div className="text-center">
            <div className={`text-4xl font-bold ${getScoreColor(performanceScore)}`}>
              {performanceScore}
            </div>
            <div className="text-sm text-gray-600">نقاط الأداء</div>
          </div>
        </div>
      </Card>

      {/* Real-time Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card className="p-4 text-center">
          <Gauge className="w-8 h-8 mx-auto text-blue-500 mb-2" />
          <div className="text-2xl font-bold">{metrics.fps}</div>
          <div className="text-sm text-gray-600">إطار/ثانية</div>
        </Card>

        <Card className="p-4 text-center">
          <HardDrive className="w-8 h-8 mx-auto text-green-500 mb-2" />
          <div className="text-2xl font-bold">{metrics.memory.toFixed(0)}</div>
          <div className="text-sm text-gray-600">ميجابايت</div>
        </Card>

        <Card className="p-4 text-center">
          <Wifi className="w-8 h-8 mx-auto text-purple-500 mb-2" />
          <div className="text-2xl font-bold">
            {metrics.connectionSpeed === 'fast' ? '🚀' : 
             metrics.connectionSpeed === 'slow' ? '🐌' : '❓'}
          </div>
          <div className="text-sm text-gray-600">سرعة الشبكة</div>
        </Card>

        <Card className="p-4 text-center">
          <Cpu className="w-8 h-8 mx-auto text-orange-500 mb-2" />
          <div className="text-2xl font-bold">
            {metrics.deviceType === 'high-end' ? '⚡' : 
             metrics.deviceType === 'mid-range' ? '🔋' : '🐢'}
          </div>
          <div className="text-sm text-gray-600">قوة الجهاز</div>
        </Card>
      </div>

      {/* Battery Status */}
      {metrics.isOnBattery && (
        <Card className="mb-6 p-4 bg-yellow-50 border-yellow-200">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
            <div className="flex-1">
              <div className="font-medium text-yellow-800">وضع البطارية</div>
              <div className="text-sm text-yellow-700">
                مستوى البطارية: {metrics.batteryLevel}% - تم تفعيل تحسينات توفير الطاقة
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Optimization Controls */}
      <Card className="mb-6">
        <div className="p-4 border-b flex items-center justify-between">
          <h3 className="text-lg font-semibold">إعدادات التحسين</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDetails(!showDetails)}
          >
            <Settings className="w-4 h-4 mr-2" />
            {showDetails ? 'إخفاء التفاصيل' : 'عرض التفاصيل'}
          </Button>
        </div>
        
        <div className="p-4 space-y-4">
          {optimizations.map(opt => (
            <div key={opt.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h4 className="font-medium">{opt.name}</h4>
                  <Badge className={getImpactColor(opt.impact)}>
                    {opt.impact === 'high' ? 'تأثير عالي' : 
                     opt.impact === 'medium' ? 'تأثير متوسط' : 'تأثير منخفض'}
                  </Badge>
                  {opt.enabled && <CheckCircle className="w-4 h-4 text-green-500" />}
                </div>
                {showDetails && (
                  <p className="text-sm text-gray-600 mt-1">{opt.description}</p>
                )}
              </div>
              
              <button
                onClick={() => toggleOptimization(opt.id)}
                className={`w-12 h-6 rounded-full transition-colors ${
                  opt.enabled ? 'bg-blue-500' : 'bg-gray-300'
                }`}
              >
                <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                  opt.enabled ? 'translate-x-6' : 'translate-x-0.5'
                }`} />
              </button>
            </div>
          ))}
        </div>
      </Card>

      {/* Performance Tips */}
      <Card className="p-6 bg-blue-50 border-blue-200">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-800 mb-2">نصائح تحسين الأداء</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• أغلق علامات التبويب الأخرى لتوفير الذاكرة</li>
              <li>• استخدم شبكة Wi-Fi سريعة للتحميل الأمثل</li>
              <li>• شحن الجهاز يحسن الأداء ويقلل التحسينات التقييدية</li>
              <li>• تنظيف cache المتصفح دورياً يحسن السرعة</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* CSS Optimizations */}
      <style>{`
        .reduced-motion * {
          animation-duration: 0.1s !important;
          transition-duration: 0.1s !important;
        }
        
        .gpu-accelerated * {
          transform: translateZ(0);
          will-change: transform;
        }
        
        .lazy-loading-enabled img[data-src] {
          opacity: 0;
          transition: opacity 0.3s;
        }
        
        .lazy-loading-enabled img[data-loaded] {
          opacity: 1;
        }
        
        @media (prefers-reduced-motion: reduce) {
          .reduced-motion * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </div>
  );
};

export default AdvancedPerformanceOptimizer;
