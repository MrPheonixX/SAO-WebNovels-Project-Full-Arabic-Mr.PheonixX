import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Smartphone, 
  Tablet, 
  Vibrate, 
  Volume2, 
  Eye, 
  Battery,
  Wifi,
  Sun,
  Moon,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Navigation,
  Settings,
  X
} from 'lucide-react';

interface MobileOptimizationProps {
  isVisible?: boolean;
  onClose?: () => void;
}

interface MobileSettings {
  fontSize: number;
  brightness: number;
  hapticFeedback: boolean;
  autoRotate: boolean;
  batteryOptimization: boolean;
  offlineMode: boolean;
  gestureNavigation: boolean;
  darkModeAuto: boolean;
}

const MobileOptimization: React.FC<MobileOptimizationProps> = ({ 
  isVisible = false, 
  onClose 
}) => {
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [settings, setSettings] = useState<MobileSettings>({
    fontSize: 16,
    brightness: 80,
    hapticFeedback: true,
    autoRotate: true,
    batteryOptimization: true,
    offlineMode: false,
    gestureNavigation: true,
    darkModeAuto: true
  });
  const [showOptimizations, setShowOptimizations] = useState(false);

  // Detect device type and orientation
  useEffect(() => {
    const checkDevice = () => {
      const userAgent = navigator.userAgent;
      const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
      const isTabletDevice = /iPad|Android.*Tablet|Windows.*Touch/i.test(userAgent);
      
      setIsMobile(isMobileDevice && !isTabletDevice);
      setIsTablet(isTabletDevice);
      
      // Check orientation
      const checkOrientation = () => {
        if (window.innerHeight > window.innerWidth) {
          setOrientation('portrait');
        } else {
          setOrientation('landscape');
        }
      };
      
      checkOrientation();
      window.addEventListener('resize', checkOrientation);
      window.addEventListener('orientationchange', checkOrientation);
      
      return () => {
        window.removeEventListener('resize', checkOrientation);
        window.removeEventListener('orientationchange', checkOrientation);
      };
    };

    checkDevice();
  }, []);

  // Auto-show optimization panel on mobile
  useEffect(() => {
    if (isMobile || isTablet) {
      const timer = setTimeout(() => {
        setShowOptimizations(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isMobile, isTablet]);

  // Handle font size changes
  const updateFontSize = useCallback((newSize: number) => {
    setSettings(prev => ({ ...prev, fontSize: newSize }));
    document.documentElement.style.fontSize = `${newSize}px`;
  }, []);

  // Handle brightness (via CSS filter)
  const updateBrightness = useCallback((brightness: number) => {
    setSettings(prev => ({ ...prev, brightness }));
    document.body.style.filter = `brightness(${brightness}%)`;
  }, []);

  // Haptic feedback
  const triggerHaptic = useCallback(() => {
    if (settings.hapticFeedback && 'vibrate' in navigator) {
      navigator.vibrate(50);
    }
  }, [settings.hapticFeedback]);

  // Gesture handlers
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [touchEnd, setTouchEnd] = useState<{ x: number; y: number } | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!settings.gestureNavigation) return;
    setTouchStart({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY
    });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!settings.gestureNavigation) return;
    setTouchEnd({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY
    });
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd || !settings.gestureNavigation) return;
    
    const distance = Math.sqrt(
      Math.pow(touchEnd.x - touchStart.x, 2) + Math.pow(touchEnd.y - touchStart.y, 2)
    );
    
    if (distance > 100) {
      triggerHaptic();
      // Add gesture actions here (page navigation, etc.)
    }
  };

  // Battery optimization
  useEffect(() => {
    if (settings.batteryOptimization) {
      // Reduce animation frequency
      document.documentElement.style.setProperty('--animation-duration', '2s');
      
      // Disable non-essential animations on low battery
      if ('getBattery' in navigator) {
        (navigator as any).getBattery().then((battery: any) => {
          if (battery.level < 0.2) {
            document.body.classList.add('low-battery-mode');
          }
        });
      }
    }
  }, [settings.batteryOptimization]);

  // Auto dark mode based on time
  useEffect(() => {
    if (settings.darkModeAuto) {
      const hour = new Date().getHours();
      const isDarkTime = hour < 7 || hour > 19;
      
      if (isDarkTime) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [settings.darkModeAuto]);

  if (!isMobile && !isTablet && !isVisible) {
    return null;
  }

  return (
    <>
      {/* Mobile Optimization Panel */}
      {(showOptimizations || isVisible) && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end md:items-center justify-center p-4">
          <Card className="w-full max-w-lg bg-white dark:bg-gray-900 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-full">
                    {isMobile ? (
                      <Smartphone className="w-5 h-5 text-blue-600" />
                    ) : (
                      <Tablet className="w-5 h-5 text-blue-600" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">تحسين الهاتف المحمول</h3>
                    <p className="text-sm text-gray-600">خصّص تجربة القراءة لجهازك</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowOptimizations(false);
                    onClose?.();
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Device Info */}
              <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center justify-between text-sm">
                  <span>الجهاز:</span>
                  <Badge variant="secondary">
                    {isMobile ? 'هاتف ذكي' : isTablet ? 'تابلت' : 'سطح مكتب'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-sm mt-2">
                  <span>الاتجاه:</span>
                  <Badge variant="secondary">
                    {orientation === 'portrait' ? 'عمودي' : 'أفقي'}
                  </Badge>
                </div>
              </div>

              {/* Font Size Control */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <label className="font-medium">حجم الخط</label>
                  <span className="text-sm text-gray-600">{settings.fontSize}px</span>
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateFontSize(Math.max(12, settings.fontSize - 2))}
                  >
                    <ZoomOut className="w-4 h-4" />
                  </Button>
                  <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${((settings.fontSize - 12) / 12) * 100}%` }}
                    />
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateFontSize(Math.min(24, settings.fontSize + 2))}
                  >
                    <ZoomIn className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Brightness Control */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <label className="font-medium">إضاءة الشاشة</label>
                  <span className="text-sm text-gray-600">{settings.brightness}%</span>
                </div>
                <div className="flex items-center gap-3">
                  <Moon className="w-4 h-4 text-gray-500" />
                  <input
                    type="range"
                    min="20"
                    max="100"
                    value={settings.brightness}
                    onChange={(e) => updateBrightness(Number(e.target.value))}
                    className="flex-1"
                  />
                  <Sun className="w-4 h-4 text-yellow-500" />
                </div>
              </div>

              {/* Settings Toggles */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Vibrate className="w-4 h-4 text-gray-500" />
                    <span>الاهتزاز التفاعلي</span>
                  </div>
                  <button
                    onClick={() => {
                      setSettings(prev => ({ ...prev, hapticFeedback: !prev.hapticFeedback }));
                      triggerHaptic();
                    }}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      settings.hapticFeedback ? 'bg-blue-500' : 'bg-gray-300'
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                      settings.hapticFeedback ? 'translate-x-6' : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <RotateCcw className="w-4 h-4 text-gray-500" />
                    <span>الدوران التلقائي</span>
                  </div>
                  <button
                    onClick={() => setSettings(prev => ({ ...prev, autoRotate: !prev.autoRotate }))}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      settings.autoRotate ? 'bg-blue-500' : 'bg-gray-300'
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                      settings.autoRotate ? 'translate-x-6' : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Battery className="w-4 h-4 text-gray-500" />
                    <span>توفير البطارية</span>
                  </div>
                  <button
                    onClick={() => setSettings(prev => ({ ...prev, batteryOptimization: !prev.batteryOptimization }))}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      settings.batteryOptimization ? 'bg-blue-500' : 'bg-gray-300'
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                      settings.batteryOptimization ? 'translate-x-6' : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Navigation className="w-4 h-4 text-gray-500" />
                    <span>التنقل بالإيماءات</span>
                  </div>
                  <button
                    onClick={() => setSettings(prev => ({ ...prev, gestureNavigation: !prev.gestureNavigation }))}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      settings.gestureNavigation ? 'bg-blue-500' : 'bg-gray-300'
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                      settings.gestureNavigation ? 'translate-x-6' : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Eye className="w-4 h-4 text-gray-500" />
                    <span>الوضع الليلي التلقائي</span>
                  </div>
                  <button
                    onClick={() => setSettings(prev => ({ ...prev, darkModeAuto: !prev.darkModeAuto }))}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      settings.darkModeAuto ? 'bg-blue-500' : 'bg-gray-300'
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                      settings.darkModeAuto ? 'translate-x-6' : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>
              </div>

              {/* Quick Tips */}
              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
                  💡 نصائح للهاتف المحمول
                </h4>
                <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                  <li>• اسحب لأعلى/أسفل للتنقل بين الصفحات</li>
                  <li>• اضغط مطولاً لإضافة علامة مرجعية</li>
                  <li>• اضغط مرتين للتكبير/التصغير</li>
                  <li>• استخدم الوضع الأفقي للقراءة المريحة</li>
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mt-6">
                <Button 
                  onClick={() => {
                    setShowOptimizations(false);
                    onClose?.();
                  }}
                  className="flex-1"
                >
                  تطبيق الإعدادات
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => {
                    // Reset to defaults
                    setSettings({
                      fontSize: 16,
                      brightness: 80,
                      hapticFeedback: true,
                      autoRotate: true,
                      batteryOptimization: true,
                      offlineMode: false,
                      gestureNavigation: true,
                      darkModeAuto: true
                    });
                  }}
                >
                  إعادة تعيين
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Floating Mobile Settings Button */}
      {(isMobile || isTablet) && !showOptimizations && !isVisible && (
        <Button
          onClick={() => setShowOptimizations(true)}
          className="fixed bottom-4 left-4 z-40 w-12 h-12 rounded-full p-0 bg-blue-600 hover:bg-blue-700 shadow-lg"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <Settings className="w-5 h-5" />
        </Button>
      )}

      {/* Mobile CSS Optimizations */}
      <style>{`
        @media (max-width: 768px) {
          body {
            font-size: ${settings.fontSize}px !important;
            user-select: none;
            -webkit-user-select: none;
            -webkit-touch-callout: none;
          }
          
          .scroll-smooth {
            scroll-behavior: smooth;
          }
          
          input, textarea, [contenteditable] {
            user-select: text !important;
            -webkit-user-select: text !important;
          }
        }
        
        .low-battery-mode * {
          animation-duration: 4s !important;
          transition-duration: 0.1s !important;
        }
        
        .gesture-area {
          touch-action: pan-y;
        }
        
        @media (orientation: landscape) and (max-height: 500px) {
          .mobile-landscape-optimize {
            font-size: ${settings.fontSize - 2}px;
          }
        }
      `}</style>
    </>
  );
};

export default MobileOptimization;
