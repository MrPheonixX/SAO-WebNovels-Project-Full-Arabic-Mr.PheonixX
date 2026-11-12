import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Volume2,
  VolumeX,
  Play,
  Pause,
  Square,
  Settings,
  Mic,
  Volume1,
  SkipForward,
  SkipBack,
  RotateCcw,
  Check,
  AlertCircle,
} from "lucide-react";
import { ttsManager } from "@/lib/tts";

interface TTSControlsProps {
  text?: string;
  elementId?: string;
  className?: string;
  size?: "sm" | "default" | "lg";
  showSettings?: boolean;
}

interface TTSState {
  isPlaying: boolean;
  isPaused: boolean;
  currentText: string;
  progress: number;
}

export default function TTSControls({
  text = "",
  elementId,
  className = "",
  size = "default",
  showSettings = false,
}: TTSControlsProps) {
  const [ttsState, setTtsState] = useState<TTSState>({
    isPlaying: false,
    isPaused: false,
    currentText: "",
    progress: 0,
  });
  const [showSettingsPanel, setShowSettingsPanel] = useState(false);
  const [settings, setSettings] = useState(ttsManager.getSettings());
  const [voices, setVoices] = useState(ttsManager.getAvailableVoices());
  const [isSupported, setIsSupported] = useState(ttsManager.isSupported());

  useEffect(() => {
    // Set up TTS state callback
    ttsManager.setStateChangeCallback(setTtsState);

    // Check if TTS is supported
    setIsSupported(ttsManager.isSupported());

    // Update voices list
    setVoices(ttsManager.getAvailableVoices());

    return () => {
      ttsManager.setStateChangeCallback(() => {});
    };
  }, []);

  const handleSpeak = async () => {
    try {
      if (elementId) {
        await ttsManager.speakWithHighlight(text, elementId);
      } else {
        await ttsManager.speak(text);
      }
    } catch (error) {
      console.error("TTS Error:", error);
    }
  };

  const handlePause = () => {
    ttsManager.pause();
  };

  const handleResume = () => {
    ttsManager.resume();
  };

  const handleStop = () => {
    ttsManager.stop();
  };

  const handleSettingsChange = (key: string, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    ttsManager.setSettings(newSettings);
  };

  const getSizeClasses = () => {
    switch (size) {
      case "sm":
        return "text-xs space-x-1";
      case "lg":
        return "text-lg space-x-3";
      default:
        return "text-sm space-x-2";
    }
  };

  const getButtonSize = () => {
    switch (size) {
      case "sm":
        return "sm";
      case "lg":
        return "lg";
      default:
        return "default";
    }
  };

  if (!isSupported) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <AlertCircle className="w-4 h-4 text-red-400" />
        <span className="text-red-400 text-sm">
          TTS غير مدعوم في هذا المتصفح
        </span>
      </div>
    );
  }

  if (voices.length === 0) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <AlertCircle className="w-4 h-4 text-yellow-400" />
        <span className="text-yellow-400 text-sm">
          لا توجد أصوات عربية متاحة
        </span>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {/* Main Controls */}
      <div className={`flex items-center ${getSizeClasses()}`}>
        {/* Play/Pause/Stop Controls */}
        <div className="flex items-center space-x-1 bg-black/20 rounded-lg p-1">
          {!ttsState.isPlaying ? (
            <Button
              variant="ghost"
              size={getButtonSize()}
              onClick={handleSpeak}
              disabled={!text.trim()}
              className="text-green-400 hover:text-green-300 hover:bg-green-500/10"
              title="تشغيل القراءة الصوتية"
            >
              <Play
                className={`${size === "sm" ? "w-3 h-3" : size === "lg" ? "w-6 h-6" : "w-4 h-4"}`}
              />
            </Button>
          ) : (
            <>
              {!ttsState.isPaused ? (
                <Button
                  variant="ghost"
                  size={getButtonSize()}
                  onClick={handlePause}
                  className="text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/10"
                  title="إيقاف مؤقت"
                >
                  <Pause
                    className={`${size === "sm" ? "w-3 h-3" : size === "lg" ? "w-6 h-6" : "w-4 h-4"}`}
                  />
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  size={getButtonSize()}
                  onClick={handleResume}
                  className="text-green-400 hover:text-green-300 hover:bg-green-500/10"
                  title="متابعة"
                >
                  <Play
                    className={`${size === "sm" ? "w-3 h-3" : size === "lg" ? "w-6 h-6" : "w-4 h-4"}`}
                  />
                </Button>
              )}

              <Button
                variant="ghost"
                size={getButtonSize()}
                onClick={handleStop}
                className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                title="إيقاف"
              >
                <Square
                  className={`${size === "sm" ? "w-3 h-3" : size === "lg" ? "w-6 h-6" : "w-4 h-4"}`}
                />
              </Button>
            </>
          )}
        </div>

        {/* Voice Indicator */}
        {ttsState.isPlaying && (
          <div className="flex items-center space-x-1">
            <div className="flex space-x-1">
              <div className="w-1 h-4 bg-blue-400 rounded animate-pulse"></div>
              <div className="w-1 h-3 bg-blue-400 rounded animate-pulse delay-100"></div>
              <div className="w-1 h-5 bg-blue-400 rounded animate-pulse delay-200"></div>
            </div>
            <Badge variant="secondary" className="text-xs">
              {ttsState.isPaused ? "موقف مؤقتاً" : "يقرأ"}
            </Badge>
          </div>
        )}

        {/* Volume Indicator */}
        <div className="flex items-center space-x-1">
          {settings.volume > 0.7 ? (
            <Volume2
              className={`text-blue-400 ${size === "sm" ? "w-3 h-3" : size === "lg" ? "w-5 h-5" : "w-4 h-4"}`}
            />
          ) : settings.volume > 0.3 ? (
            <Volume1
              className={`text-blue-400 ${size === "sm" ? "w-3 h-3" : size === "lg" ? "w-5 h-5" : "w-4 h-4"}`}
            />
          ) : (
            <VolumeX
              className={`text-gray-400 ${size === "sm" ? "w-3 h-3" : size === "lg" ? "w-5 h-5" : "w-4 h-4"}`}
            />
          )}
        </div>

        {/* Settings Button */}
        {showSettings && (
          <Button
            variant="ghost"
            size={getButtonSize()}
            onClick={() => setShowSettingsPanel(!showSettingsPanel)}
            className="text-gray-400 hover:text-gray-300"
            title="إعدادات الصوت"
          >
            <Settings
              className={`${size === "sm" ? "w-3 h-3" : size === "lg" ? "w-5 h-5" : "w-4 h-4"}`}
            />
          </Button>
        )}
      </div>

      {/* Settings Panel */}
      {showSettingsPanel && (
        <Card className="absolute top-full left-0 mt-2 w-80 bg-black/90 border-blue-500/30 backdrop-blur-xl z-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-blue-400 flex items-center gap-2">
              <Mic className="w-5 h-5" />
              إعدادات القراءة الصوتية
            </CardTitle>
            <CardDescription>
              اختر الصوت وضبط الإعدادات حسب تفضيلك
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Voice Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                اختيار الصوت
              </label>
              <select
                value={settings.voice}
                onChange={(e) => handleSettingsChange("voice", e.target.value)}
                className="w-full px-3 py-2 bg-black/40 border border-gray-500/30 rounded-md text-white text-sm focus:border-blue-400 focus:outline-none"
              >
                {voices.map((voice) => (
                  <option key={voice.id} value={voice.lang}>
                    {voice.nameArabic} (
                    {voice.gender === "male" ? "ذكر" : "أنثى"})
                    {voice.quality === "high" && " - جودة عالية"}
                  </option>
                ))}
              </select>
            </div>

            {/* Rate Control */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                سرعة القراءة: {settings.rate.toFixed(1)}x
              </label>
              <input
                type="range"
                min="0.5"
                max="2.0"
                step="0.1"
                value={settings.rate}
                onChange={(e) =>
                  handleSettingsChange("rate", parseFloat(e.target.value))
                }
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>بطيء</span>
                <span>عادي</span>
                <span>سريع</span>
              </div>
            </div>

            {/* Pitch Control */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                طبقة الصوت: {settings.pitch.toFixed(1)}
              </label>
              <input
                type="range"
                min="0.5"
                max="2.0"
                step="0.1"
                value={settings.pitch}
                onChange={(e) =>
                  handleSettingsChange("pitch", parseFloat(e.target.value))
                }
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>منخفض</span>
                <span>عادي</span>
                <span>مرتفع</span>
              </div>
            </div>

            {/* Volume Control */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                مستوى الصوت: {Math.round(settings.volume * 100)}%
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={settings.volume}
                onChange={(e) =>
                  handleSettingsChange("volume", parseFloat(e.target.value))
                }
                className="w-full"
              />
            </div>

            {/* Additional Options */}
            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={settings.autoPlay}
                  onChange={(e) =>
                    handleSettingsChange("autoPlay", e.target.checked)
                  }
                  className="rounded"
                />
                <span className="text-sm text-gray-300">تشغيل تلقائي</span>
              </label>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={settings.highlightText}
                  onChange={(e) =>
                    handleSettingsChange("highlightText", e.target.checked)
                  }
                  className="rounded"
                />
                <span className="text-sm text-gray-300">
                  تمييز النص أثناء القراءة
                </span>
              </label>
            </div>

            {/* Test Button */}
            <Button
              onClick={() => handleSpeak()}
              disabled={ttsState.isPlaying}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500"
            >
              <Play className="w-4 h-4 mr-2" />
              اختبار الصوت
            </Button>

            {/* Close Button */}
            <Button
              variant="outline"
              onClick={() => setShowSettingsPanel(false)}
              className="w-full border-gray-500 text-gray-300"
            >
              <Check className="w-4 h-4 mr-2" />
              تم
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Quick TTS button component
export function QuickTTSButton({
  text,
  className = "",
  size = "sm",
}: {
  text: string;
  className?: string;
  size?: "sm" | "default" | "lg";
}) {
  const [isPlaying, setIsPlaying] = useState(false);

  const handleQuickSpeak = async () => {
    if (isPlaying) {
      ttsManager.stop();
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      try {
        await ttsManager.speak(text);
      } catch (error) {
        console.error("TTS Error:", error);
      } finally {
        setIsPlaying(false);
      }
    }
  };

  const iconSize =
    size === "sm" ? "w-3 h-3" : size === "lg" ? "w-6 h-6" : "w-4 h-4";

  return (
    <Button
      variant="ghost"
      size={size}
      onClick={handleQuickSpeak}
      className={`text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 ${className}`}
      title="استمع للنص"
    >
      {isPlaying ? (
        <Square className={iconSize} />
      ) : (
        <Volume2 className={iconSize} />
      )}
    </Button>
  );
}
