import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { 
  Palette, 
  Type, 
  Moon, 
  Sun, 
  BookOpen, 
  Bookmark,
  RotateCcw,
  Settings,
  Eye,
  Zap,
  Timer,
  Target
} from 'lucide-react';

interface ReadingSettings {
  theme: 'light' | 'dark' | 'sepia' | 'high-contrast';
  fontSize: number;
  lineHeight: number;
  wordSpacing: number;
  autoScroll: boolean;
  scrollSpeed: number;
  focusMode: boolean;
  readingGuide: boolean;
  bookmarks: Array<{id: string, chapter: string, position: number, note?: string}>;
  readingStats: {
    wordsPerMinute: number;
    totalTimeRead: number;
    pagesRead: number;
    currentStreak: number;
  };
}

interface ReadingEnhancementSystemProps {
  content?: string;
  onSettingsChange?: (settings: ReadingSettings) => void;
}

const ReadingEnhancementSystem: React.FC<ReadingEnhancementSystemProps> = ({
  content,
  onSettingsChange
}) => {
  const [settings, setSettings] = useState<ReadingSettings>({
    theme: 'light',
    fontSize: 16,
    lineHeight: 1.6,
    wordSpacing: 0,
    autoScroll: false,
    scrollSpeed: 2,
    focusMode: false,
    readingGuide: false,
    bookmarks: [],
    readingStats: {
      wordsPerMinute: 250,
      totalTimeRead: 0,
      pagesRead: 0,
      currentStreak: 1
    }
  });

  const [showSettings, setShowSettings] = useState(false);
  const [readingMode, setReadingMode] = useState(false);
  const [currentBookmark, setCurrentBookmark] = useState<string>('');
  const readingAreaRef = useRef<HTMLDivElement>(null);
  const [readingStartTime, setReadingStartTime] = useState<number>(0);

  // تطبيق إعدادات القراءة
  useEffect(() => {
    if (readingAreaRef.current) {
      const area = readingAreaRef.current;
      area.style.fontSize = `${settings.fontSize}px`;
      area.style.lineHeight = `${settings.lineHeight}`;
      area.style.wordSpacing = `${settings.wordSpacing}px`;
      
      // تطبيق الثيم
      area.className = `reading-area ${settings.theme}-theme ${settings.focusMode ? 'focus-mode' : ''}`;
    }
    
    onSettingsChange?.(settings);
  }, [settings, onSettingsChange]);

  // التمرير التلقائي
  useEffect(() => {
    let scrollInterval: NodeJS.Timeout;
    
    if (settings.autoScroll && readingMode) {
      scrollInterval = setInterval(() => {
        window.scrollBy(0, settings.scrollSpeed);
      }, 100);
    }
    
    return () => {
      if (scrollInterval) clearInterval(scrollInterval);
    };
  }, [settings.autoScroll, settings.scrollSpeed, readingMode]);

  // تتبع وقت القراءة
  useEffect(() => {
    if (readingMode && readingStartTime === 0) {
      setReadingStartTime(Date.now());
    } else if (!readingMode && readingStartTime > 0) {
      const timeSpent = Date.now() - readingStartTime;
      setSettings(prev => ({
        ...prev,
        readingStats: {
          ...prev.readingStats,
          totalTimeRead: prev.readingStats.totalTimeRead + timeSpent
        }
      }));
      setReadingStartTime(0);
    }
  }, [readingMode, readingStartTime]);

  const updateSetting = <K extends keyof ReadingSettings>(
    key: K, 
    value: ReadingSettings[K]
  ) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const addBookmark = () => {
    const note = currentBookmark || `علامة تلقائية - ${new Date().toLocaleString('ar')}`;
    const newBookmark = {
      id: Date.now().toString(),
      chapter: 'الفصل الحالي',
      position: window.scrollY,
      note
    };
    
    updateSetting('bookmarks', [...settings.bookmarks, newBookmark]);
    setCurrentBookmark('');
  };

  const goToBookmark = (bookmark: typeof settings.bookmarks[0]) => {
    window.scrollTo(0, bookmark.position);
  };

  const themes = [
    { key: 'light', name: 'فاتح', icon: Sun, color: 'bg-white' },
    { key: 'dark', name: 'داكن', icon: Moon, color: 'bg-gray-900' },
    { key: 'sepia', name: 'بني', icon: BookOpen, color: 'bg-amber-100' },
    { key: 'high-contrast', name: 'تباين عالي', icon: Eye, color: 'bg-black' }
  ];

  return (
    <div className="reading-enhancement-system">
      {/* شريط التحكم السريع */}
      <div className="fixed top-4 right-4 z-50 flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setReadingMode(!readingMode)}
          className={`transition-all duration-300 ${readingMode ? 'bg-green-100 border-green-400' : ''}`}
        >
          {readingMode ? <Target className="w-4 h-4" /> : <BookOpen className="w-4 h-4" />}
          {readingMode ? 'وضع القراءة' : 'بدء القراءة'}
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowSettings(!showSettings)}
        >
          <Settings className="w-4 h-4" />
        </Button>
      </div>

      {/* لوحة الإعدادات */}
      {showSettings && (
        <Card className="fixed top-20 right-4 w-80 max-h-96 overflow-y-auto z-50 p-4 backdrop-blur-xl bg-white/90 dark:bg-gray-900/90">
          <div className="space-y-6">
            {/* إعدادات الثيم */}
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Palette className="w-4 h-4" />
                المظهر
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {themes.map(theme => (
                  <Button
                    key={theme.key}
                    variant={settings.theme === theme.key ? "default" : "outline"}
                    size="sm"
                    onClick={() => updateSetting('theme', theme.key as any)}
                    className="justify-start"
                  >
                    <theme.icon className="w-4 h-4 mr-2" />
                    {theme.name}
                  </Button>
                ))}
              </div>
            </div>

            {/* إعدادات النص */}
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Type className="w-4 h-4" />
                النص
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-gray-600">حجم الخط: {settings.fontSize}px</label>
                  <Slider
                    value={[settings.fontSize]}
                    onValueChange={([value]) => updateSetting('fontSize', value)}
                    min={12}
                    max={24}
                    step={1}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600">ارتفاع السطر: {settings.lineHeight}</label>
                  <Slider
                    value={[settings.lineHeight]}
                    onValueChange={([value]) => updateSetting('lineHeight', value)}
                    min={1.2}
                    max={2.5}
                    step={0.1}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600">تباعد الكلمات: {settings.wordSpacing}px</label>
                  <Slider
                    value={[settings.wordSpacing]}
                    onValueChange={([value]) => updateSetting('wordSpacing', value)}
                    min={0}
                    max={10}
                    step={1}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>

            {/* إعدادات القراءة */}
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Zap className="w-4 h-4" />
                القراءة المتقدمة
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm">التمرير التلقائي</label>
                  <Switch
                    checked={settings.autoScroll}
                    onCheckedChange={(checked) => updateSetting('autoScroll', checked)}
                  />
                </div>
                {settings.autoScroll && (
                  <div>
                    <label className="text-sm text-gray-600">سرعة التمرير: {settings.scrollSpeed}</label>
                    <Slider
                      value={[settings.scrollSpeed]}
                      onValueChange={([value]) => updateSetting('scrollSpeed', value)}
                      min={1}
                      max={10}
                      step={1}
                      className="mt-1"
                    />
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <label className="text-sm">وضع التركيز</label>
                  <Switch
                    checked={settings.focusMode}
                    onCheckedChange={(checked) => updateSetting('focusMode', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-sm">دليل القراءة</label>
                  <Switch
                    checked={settings.readingGuide}
                    onCheckedChange={(checked) => updateSetting('readingGuide', checked)}
                  />
                </div>
              </div>
            </div>

            {/* إحصائيات القراءة */}
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Timer className="w-4 h-4" />
                إحصائيات القراءة
              </h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-center p-2 bg-blue-50 rounded">
                  <div className="font-semibold">{settings.readingStats.wordsPerMinute}</div>
                  <div className="text-gray-600">كلمة/دقيقة</div>
                </div>
                <div className="text-center p-2 bg-green-50 rounded">
                  <div className="font-semibold">{Math.round(settings.readingStats.totalTimeRead / 60000)}</div>
                  <div className="text-gray-600">دقيقة قراءة</div>
                </div>
                <div className="text-center p-2 bg-purple-50 rounded">
                  <div className="font-semibold">{settings.readingStats.pagesRead}</div>
                  <div className="text-gray-600">صفحة مقروءة</div>
                </div>
                <div className="text-center p-2 bg-orange-50 rounded">
                  <div className="font-semibold">{settings.readingStats.currentStreak}</div>
                  <div className="text-gray-600">يوم متتالي</div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* منطقة القراءة */}
      <div 
        ref={readingAreaRef}
        className={`reading-area transition-all duration-300 ${settings.focusMode ? 'focus-mode' : ''}`}
      >
        {content && (
          <div className="max-w-4xl mx-auto p-6">
            {content}
          </div>
        )}
      </div>

      {/* علامات المرجعية */}
      {readingMode && (
        <div className="fixed bottom-4 left-4 z-50">
          <div className="flex items-center gap-2 mb-2">
            <input
              type="text"
              placeholder="إضافة علامة مرجعية..."
              value={currentBookmark}
              onChange={(e) => setCurrentBookmark(e.target.value)}
              className="px-3 py-2 border rounded-lg text-sm"
            />
            <Button size="sm" onClick={addBookmark}>
              <Bookmark className="w-4 h-4" />
            </Button>
          </div>
          
          {settings.bookmarks.length > 0 && (
            <div className="max-h-32 overflow-y-auto space-y-1">
              {settings.bookmarks.slice(-3).map(bookmark => (
                <Badge
                  key={bookmark.id}
                  variant="secondary"
                  className="cursor-pointer text-xs block"
                  onClick={() => goToBookmark(bookmark)}
                >
                  {bookmark.note}
                </Badge>
              ))}
            </div>
          )}
        </div>
      )}

      {/* CSS للثيمات */}
      <style>{`
        .reading-area {
          transition: all 0.3s ease;
        }
        
        .light-theme {
          background: #ffffff;
          color: #1a1a1a;
        }
        
        .dark-theme {
          background: #1a1a1a;
          color: #e5e5e5;
        }
        
        .sepia-theme {
          background: #f4f1ea;
          color: #5c4b37;
        }
        
        .high-contrast-theme {
          background: #000000;
          color: #ffffff;
        }
        
        .focus-mode {
          max-width: 60ch;
          margin: 0 auto;
          padding: 2rem;
          box-shadow: 0 0 0 9999px rgba(0,0,0,0.8);
        }
        
        .reading-guide {
          position: relative;
        }
        
        .reading-guide::before {
          content: '';
          position: fixed;
          top: 50%;
          left: 0;
          right: 0;
          height: 1px;
          background: rgba(59, 130, 246, 0.5);
          z-index: 10;
        }
      `}</style>
    </div>
  );
};

export default ReadingEnhancementSystem;
