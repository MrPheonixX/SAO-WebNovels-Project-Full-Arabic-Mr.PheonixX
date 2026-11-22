import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Palette,
  Keyboard,
  Layout,
  Star,
  Download,
  Upload,
  Sparkles,
  Crown,
  Sword,
  Shield,
  Heart,
} from "lucide-react";

interface PersonalTheme {
  id: string;
  name: string;
  character: "kirito" | "asuna" | "alice" | "sinon" | "leafa" | "silica";
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  effects: {
    particles: boolean;
    glow: boolean;
    animations: boolean;
    sounds: boolean;
  };
  customCSS?: string;
}

interface KeyboardShortcut {
  id: string;
  action: string;
  key: string;
  description: string;
  category: "reading" | "navigation" | "actions";
}

interface LayoutPreset {
  id: string;
  name: string;
  sidebar: "left" | "right" | "hidden";
  toolbar: "top" | "bottom" | "floating";
  readingArea: "center" | "full" | "split";
  minimap: boolean;
}

interface PersonalizationSettings {
  currentTheme: string;
  customThemes: PersonalTheme[];
  shortcuts: KeyboardShortcut[];
  layout: LayoutPreset;
  favorites: string[];
  recentlyRead: string[];
  cloudSync: boolean;
}

const PersonalizationEngine: React.FC = () => {
  const [settings, setSettings] = useState<PersonalizationSettings>({
    currentTheme: "kirito",
    customThemes: [],
    shortcuts: [
      {
        id: "1",
        action: "nextPage",
        key: "ArrowRight",
        description: "الصفحة التالية",
        category: "reading",
      },
      {
        id: "2",
        action: "prevPage",
        key: "ArrowLeft",
        description: "الصفحة السابقة",
        category: "reading",
      },
      {
        id: "3",
        action: "bookmark",
        key: "KeyB",
        description: "إضافة علامة مرجعية",
        category: "actions",
      },
      {
        id: "4",
        action: "search",
        key: "KeyF",
        description: "البحث",
        category: "navigation",
      },
      {
        id: "5",
        action: "fullscreen",
        key: "F11",
        description: "ملء الشاشة",
        category: "reading",
      },
    ],
    layout: {
      id: "default",
      name: "افتراضي",
      sidebar: "right",
      toolbar: "top",
      readingArea: "center",
      minimap: false,
    },
    favorites: [],
    recentlyRead: [],
    cloudSync: false,
  });

  const [activeTab, setActiveTab] = useState("themes");
  const [isCustomizing, setIsCustomizing] = useState(false);

  // ثيمات الشخصيات المحددة مسبقاً
  const characterThemes: PersonalTheme[] = [
    {
      id: "kirito",
      name: "كيريتو - سيد السيوف",
      character: "kirito",
      colors: {
        primary: "#000000",
        secondary: "#1a1a1a",
        accent: "#3b82f6",
        background: "linear-gradient(135deg, #000000, #1e293b)",
        text: "#ffffff",
      },
      effects: {
        particles: true,
        glow: true,
        animations: true,
        sounds: true,
      },
    },
    {
      id: "asuna",
      name: "أسونا - فارسة البرق",
      character: "asuna",
      colors: {
        primary: "#f97316",
        secondary: "#fed7aa",
        accent: "#fbbf24",
        background: "linear-gradient(135deg, #f97316, #fbbf24)",
        text: "#1a1a1a",
      },
      effects: {
        particles: true,
        glow: true,
        animations: true,
        sounds: true,
      },
    },
    {
      id: "alice",
      name: "أليس - فارسة النزاهة",
      character: "alice",
      colors: {
        primary: "#3b82f6",
        secondary: "#dbeafe",
        accent: "#60a5fa",
        background: "linear-gradient(135deg, #3b82f6, #60a5fa)",
        text: "#ffffff",
      },
      effects: {
        particles: true,
        glow: true,
        animations: true,
        sounds: true,
      },
    },
    {
      id: "sinon",
      name: "سينون - القناصة",
      character: "sinon",
      colors: {
        primary: "#10b981",
        secondary: "#6ee7b7",
        accent: "#34d399",
        background: "linear-gradient(135deg, #10b981, #34d399)",
        text: "#ffffff",
      },
      effects: {
        particles: true,
        glow: false,
        animations: true,
        sounds: false,
      },
    },
  ];

  // إعدادات التخطيط المحددة مسبقاً
  const layoutPresets: LayoutPreset[] = [
    {
      id: "default",
      name: "افتراضي",
      sidebar: "right",
      toolbar: "top",
      readingArea: "center",
      minimap: false,
    },
    {
      id: "minimal",
      name: "مبسط",
      sidebar: "hidden",
      toolbar: "floating",
      readingArea: "full",
      minimap: false,
    },
    {
      id: "professional",
      name: "احترافي",
      sidebar: "left",
      toolbar: "top",
      readingArea: "split",
      minimap: true,
    },
    {
      id: "mobile",
      name: "محمول",
      sidebar: "hidden",
      toolbar: "bottom",
      readingArea: "full",
      minimap: false,
    },
  ];

  // تطبيق الثيم المحدد
  useEffect(() => {
    const currentTheme =
      characterThemes.find((t) => t.id === settings.currentTheme) ||
      settings.customThemes.find((t) => t.id === settings.currentTheme);

    if (currentTheme) {
      applyTheme(currentTheme);
    }
  }, [settings.currentTheme, settings.customThemes]);

  // تطبيق اختصارات لوحة المفاتيح
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const shortcut = settings.shortcuts.find((s) => s.key === e.code);
      if (shortcut) {
        e.preventDefault();
        executeShortcut(shortcut.action);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [settings.shortcuts]);

  const applyTheme = (theme: PersonalTheme) => {
    const root = document.documentElement;

    // تطبيق المتغيرات CSS
    root.style.setProperty("--theme-primary", theme.colors.primary);
    root.style.setProperty("--theme-secondary", theme.colors.secondary);
    root.style.setProperty("--theme-accent", theme.colors.accent);
    root.style.setProperty("--theme-text", theme.colors.text);

    // تطبيق الخلفية
    document.body.style.background = theme.colors.background;

    // تطبيق فئة الشخصية
    document.body.className = `theme-${theme.character} ${theme.effects.particles ? "particles-enabled" : ""} ${theme.effects.glow ? "glow-enabled" : ""}`;

    // تطبيق CSS مخصص
    if (theme.customCSS) {
      let styleElement = document.getElementById("custom-theme-styles");
      if (!styleElement) {
        styleElement = document.createElement("style");
        styleElement.id = "custom-theme-styles";
        document.head.appendChild(styleElement);
      }
      styleElement.textContent = theme.customCSS;
    }
  };

  const executeShortcut = (action: string) => {
    switch (action) {
      case "nextPage":
        window.scrollBy(0, window.innerHeight);
        break;
      case "prevPage":
        window.scrollBy(0, -window.innerHeight);
        break;
      case "bookmark":
        // تنفيذ منطق إضافة علامة مرجعية
        console.log("Bookmark added");
        break;
      case "search":
        // تنفيذ منطق البحث
        const searchBox = document.querySelector(
          'input[type="search"]',
        ) as HTMLInputElement;
        if (searchBox) {
          searchBox.focus();
        }
        break;
      case "fullscreen":
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen();
        } else {
          document.exitFullscreen();
        }
        break;
    }
  };

  const updateSettings = (newSettings: Partial<PersonalizationSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const exportSettings = () => {
    const dataStr = JSON.stringify(settings, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "sao-personalization-settings.json";
    link.click();
    URL.revokeObjectURL(url);
  };

  const importSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedSettings = JSON.parse(e.target?.result as string);
          setSettings(importedSettings);
        } catch (error) {
          console.error("خطأ في استيراد الإعدادات:", error);
        }
      };
      reader.readAsText(file);
    }
  };

  const getCharacterIcon = (character: PersonalTheme["character"]) => {
    const icons = {
      kirito: Sword,
      asuna: Crown,
      alice: Shield,
      sinon: Star,
      leafa: Heart,
      silica: Sparkles,
    };
    return icons[character] || Sword;
  };

  return (
    <div className="personalization-engine max-w-6xl mx-auto p-6">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
          🎨 محرك التخصيص الشخصي
        </h1>
        <p className="text-gray-600">
          اجعل تجربة القراءة فريدة ومخصصة حسب ذوقك
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="themes" className="flex items-center gap-2">
            <Palette className="w-4 h-4" />
            الثيمات
          </TabsTrigger>
          <TabsTrigger value="shortcuts" className="flex items-center gap-2">
            <Keyboard className="w-4 h-4" />
            الاختصارات
          </TabsTrigger>
          <TabsTrigger value="layout" className="flex items-center gap-2">
            <Layout className="w-4 h-4" />
            التخطيط
          </TabsTrigger>
          <TabsTrigger value="sync" className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            المزامنة
          </TabsTrigger>
        </TabsList>

        <TabsContent value="themes" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4">ثيمات الشخصيات</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {characterThemes.map((theme) => {
                const IconComponent = getCharacterIcon(theme.character);
                return (
                  <Card
                    key={theme.id}
                    className={`p-4 cursor-pointer transition-all duration-300 hover:scale-105 ${
                      settings.currentTheme === theme.id
                        ? "border-blue-500 bg-blue-50"
                        : "hover:border-gray-300"
                    }`}
                    onClick={() => updateSettings({ currentTheme: theme.id })}
                  >
                    <div className="text-center">
                      <div
                        className="w-12 h-12 mx-auto mb-2 rounded-full flex items-center justify-center"
                        style={{ background: theme.colors.background }}
                      >
                        <IconComponent className="w-6 h-6 text-white" />
                      </div>
                      <h4 className="font-medium text-sm">{theme.name}</h4>
                      <div className="flex justify-center mt-2 gap-1">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: theme.colors.primary }}
                        />
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: theme.colors.accent }}
                        />
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>

            <div className="mt-6 flex justify-between items-center">
              <Button variant="outline" onClick={() => setIsCustomizing(true)}>
                <Sparkles className="w-4 h-4 mr-2" />
                إنشاء ثيم مخصص
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={exportSettings}>
                  <Download className="w-4 h-4 mr-2" />
                  تصدير
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <label>
                    <Upload className="w-4 h-4 mr-2" />
                    استيراد
                    <input
                      type="file"
                      accept=".json"
                      onChange={importSettings}
                      className="hidden"
                    />
                  </label>
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="shortcuts" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4">
              اختصارات لوحة المفاتيح
            </h3>
            <div className="space-y-3">
              {settings.shortcuts.map((shortcut) => (
                <div
                  key={shortcut.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <div className="font-medium">{shortcut.description}</div>
                    <Badge variant="secondary" className="text-xs mt-1">
                      {shortcut.category}
                    </Badge>
                  </div>
                  <Badge variant="outline">
                    {shortcut.key.replace("Key", "").replace("Arrow", "")}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="layout" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4">تخطيط الواجهة</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {layoutPresets.map((preset) => (
                <Card
                  key={preset.id}
                  className={`p-4 cursor-pointer transition-all duration-300 hover:scale-105 ${
                    settings.layout.id === preset.id
                      ? "border-blue-500 bg-blue-50"
                      : "hover:border-gray-300"
                  }`}
                  onClick={() => updateSettings({ layout: preset })}
                >
                  <div className="text-center">
                    <Layout className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                    <h4 className="font-medium">{preset.name}</h4>
                    <div className="text-xs text-gray-500 mt-2">
                      <div>الشريط: {preset.sidebar}</div>
                      <div>الأدوات: {preset.toolbar}</div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="sync" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4">
              المزامنة والنسخ الاحتياطي
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">مزامنة الإعدادات</div>
                  <div className="text-sm text-gray-500">
                    حفظ الإعدادات في السحابة
                  </div>
                </div>
                <Switch
                  checked={settings.cloudSync}
                  onCheckedChange={(checked) =>
                    updateSettings({ cloudSync: checked })
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4 mt-6">
                <Button onClick={exportSettings} className="w-full">
                  <Download className="w-4 h-4 mr-2" />
                  تصدير الإعدادات
                </Button>
                <Button variant="outline" className="w-full" asChild>
                  <label>
                    <Upload className="w-4 h-4 mr-2" />
                    استيراد الإعدادات
                    <input
                      type="file"
                      accept=".json"
                      onChange={importSettings}
                      className="hidden"
                    />
                  </label>
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* CSS للثيمات */}
      <style>{`
        .theme-kirito {
          --theme-character: 'kirito';
        }
        .theme-asuna {
          --theme-character: 'asuna';
        }
        .theme-alice {
          --theme-character: 'alice';
        }
        .theme-sinon {
          --theme-character: 'sinon';
        }
        .particles-enabled::before {
          content: '';
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="20" cy="20" r="1" fill="%23ffffff20"><animate attributeName="opacity" values="0;1;0" dur="3s" repeatCount="indefinite"/></circle><circle cx="80" cy="40" r="1" fill="%23ffffff20"><animate attributeName="opacity" values="0;1;0" dur="2s" repeatCount="indefinite"/></circle></svg>');
          pointer-events: none;
          z-index: 1;
        }
        .glow-enabled * {
          text-shadow: 0 0 10px var(--theme-accent, #3b82f6);
        }
      `}</style>
    </div>
  );
};

export default PersonalizationEngine;
