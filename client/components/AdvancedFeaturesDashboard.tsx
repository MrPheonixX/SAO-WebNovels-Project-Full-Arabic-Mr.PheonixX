import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";
import {
  Palette,
  BarChart,
  Brain,
  Users,
  Zap,
  Star,
  Trophy,
  Target,
  Sparkles,
  Eye,
  Settings,
  PlayCircle,
  BookOpen,
  Crown,
} from "lucide-react";

interface Feature {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  progress: number;
  isNew: boolean;
  category: "reading" | "social" | "analytics" | "customization";
  route?: string;
  action?: () => void;
}

const AdvancedFeaturesDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [features, setFeatures] = useState<Feature[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  useEffect(() => {
    const featuresData: Feature[] = [
      {
        id: "reading-enhancement",
        title: "نظام القراءة المتقدم",
        description: "تخصيص شامل لتجربة القراءة مع التمرير التلقائي والثيمات",
        icon: Brain,
        color: "blue",
        progress: 100,
        isNew: true,
        category: "reading",
        route: "/profile",
      },
      {
        id: "personalization",
        title: "محرك التخصيص الشخصي",
        description: "ثيمات شخصيات وتخصيص كامل للواجهة والاختصارات",
        icon: Palette,
        color: "purple",
        progress: 100,
        isNew: true,
        category: "customization",
        route: "/profile",
      },
      {
        id: "reading-analytics",
        title: "التحليلات الذكية",
        description: "تتبع متقدم للقراءة مع إحصائيات تفصيلية وتوصيات",
        icon: BarChart,
        color: "green",
        progress: 100,
        isNew: true,
        category: "analytics",
        route: "/profile",
      },
      {
        id: "social-hub",
        title: "مركز التفاعل الاجتماعي",
        description: "نوادي قراءة، مناقشات، اقتباسات وتحديات جماعية",
        icon: Users,
        color: "orange",
        progress: 100,
        isNew: true,
        category: "social",
        route: "/profile",
      },
      {
        id: "achievement-system",
        title: "نظام الإنجازات المتقدم",
        description: "إنجازات متدرجة مع نظام XP وترقيات المستوى",
        icon: Trophy,
        color: "yellow",
        progress: 95,
        isNew: false,
        category: "reading",
        route: "/profile",
      },
      {
        id: "performance-optimizer",
        title: "محسن الأداء الذكي",
        description: "تحسين تلقائي للأداء حسب قوة الجهاز والشبكة",
        icon: Zap,
        color: "red",
        progress: 90,
        isNew: false,
        category: "customization",
      },
      {
        id: "ai-assistant",
        title: "المساعد الذكي",
        description: "ملخصات فورية وترجمة المصطلحات اليابانية",
        icon: Star,
        color: "indigo",
        progress: 75,
        isNew: true,
        category: "reading",
      },
      {
        id: "voice-reading",
        title: "القراءة الصوتية المتقدمة",
        description: "تحويل النص لصوت مع أصوات الشخصيات وإعدادات متقدمة",
        icon: PlayCircle,
        color: "pink",
        progress: 85,
        isNew: false,
        category: "reading",
      },
    ];

    setFeatures(featuresData);
  }, []);

  const categories = [
    { id: "all", name: "جميع الخصائص", count: features.length },
    {
      id: "reading",
      name: "القراءة",
      count: features.filter((f) => f.category === "reading").length,
    },
    {
      id: "social",
      name: "التفاعل الاجتماعي",
      count: features.filter((f) => f.category === "social").length,
    },
    {
      id: "analytics",
      name: "التحليلات",
      count: features.filter((f) => f.category === "analytics").length,
    },
    {
      id: "customization",
      name: "التخصيص",
      count: features.filter((f) => f.category === "customization").length,
    },
  ];

  const filteredFeatures =
    selectedCategory === "all"
      ? features
      : features.filter((f) => f.category === selectedCategory);

  const getColorClasses = (color: string) => {
    const colors = {
      blue: "from-blue-500 to-blue-600 border-blue-300 bg-blue-50",
      purple: "from-purple-500 to-purple-600 border-purple-300 bg-purple-50",
      green: "from-green-500 to-green-600 border-green-300 bg-green-50",
      orange: "from-orange-500 to-orange-600 border-orange-300 bg-orange-50",
      yellow: "from-yellow-500 to-yellow-600 border-yellow-300 bg-yellow-50",
      red: "from-red-500 to-red-600 border-red-300 bg-red-50",
      indigo: "from-indigo-500 to-indigo-600 border-indigo-300 bg-indigo-50",
      pink: "from-pink-500 to-pink-600 border-pink-300 bg-pink-50",
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  const handleFeatureClick = (feature: Feature) => {
    if (feature.route) {
      navigate(feature.route);
    } else if (feature.action) {
      feature.action();
    }
  };

  return (
    <div className="advanced-features-dashboard max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
          🚀 الخصائص المتقدمة
        </h2>
        <p className="text-gray-600">
          اكتشف جميع الخصائص المتطورة المتاحة في منصة ساو العربية
        </p>
      </div>

      {/* Categories Filter */}
      <div className="mb-8">
        <div className="flex flex-wrap gap-3 justify-center">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              onClick={() => setSelectedCategory(category.id)}
              className="flex items-center gap-2"
            >
              {category.name}
              <Badge variant="secondary" className="ml-1">
                {category.count}
              </Badge>
            </Button>
          ))}
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredFeatures.map((feature) => {
          const IconComponent = feature.icon;
          const colorClasses = getColorClasses(feature.color);

          return (
            <Card
              key={feature.id}
              className={`relative p-6 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg border-2 ${colorClasses.split(" ").slice(2).join(" ")}`}
              onClick={() => handleFeatureClick(feature)}
            >
              {/* New Badge */}
              {feature.isNew && (
                <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold animate-pulse">
                  جديد!
                </div>
              )}

              {/* Feature Icon */}
              <div
                className={`w-16 h-16 bg-gradient-to-r ${colorClasses.split(" ").slice(0, 2).join(" ")} rounded-full flex items-center justify-center mb-4 mx-auto`}
              >
                <IconComponent className="w-8 h-8 text-white" />
              </div>

              {/* Feature Info */}
              <div className="text-center">
                <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                  {feature.description}
                </p>

                {/* Progress */}
                <div className="mb-4">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>مكتمل</span>
                    <span>{feature.progress}%</span>
                  </div>
                  <Progress value={feature.progress} className="h-2" />
                </div>

                {/* Action Button */}
                <Button
                  size="sm"
                  className={`w-full bg-gradient-to-r ${colorClasses.split(" ").slice(0, 2).join(" ")} hover:opacity-90`}
                >
                  {feature.progress === 100 ? (
                    <>
                      <Eye className="w-4 h-4 mr-2" />
                      استكشف الآن
                    </>
                  ) : (
                    <>
                      <Settings className="w-4 h-4 mr-2" />
                      قريباً
                    </>
                  )}
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Quick Stats */}
      <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6">
        <Card className="p-6 text-center bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <div className="text-3xl font-bold text-blue-600 mb-2">
            {features.filter((f) => f.progress === 100).length}
          </div>
          <div className="text-sm text-blue-700">خصائص مكتملة</div>
        </Card>

        <Card className="p-6 text-center bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <div className="text-3xl font-bold text-green-600 mb-2">
            {features.filter((f) => f.isNew).length}
          </div>
          <div className="text-sm text-green-700">خصائص جديدة</div>
        </Card>

        <Card className="p-6 text-center bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <div className="text-3xl font-bold text-purple-600 mb-2">
            {Math.round(
              features.reduce((acc, f) => acc + f.progress, 0) /
                features.length,
            )}
            %
          </div>
          <div className="text-sm text-purple-700">نسبة الإكمال</div>
        </Card>

        <Card className="p-6 text-center bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <div className="text-3xl font-bold text-orange-600 mb-2">
            {features.filter((f) => f.progress < 100).length}
          </div>
          <div className="text-sm text-orange-700">قيد التطوير</div>
        </Card>
      </div>

      {/* Call to Action */}
      <div className="mt-12 text-center">
        <Card className="p-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <Crown className="w-16 h-16 mx-auto mb-4" />
          <h3 className="text-2xl font-bold mb-4">
            استمتع بتجربة القراءة المتطورة
          </h3>
          <p className="text-lg mb-6 opacity-90">
            اكتشف جميع الخصائص المتقدمة وشخصّ تجربة القراءة حسب تفضيلاتك
          </p>
          <div className="flex gap-4 justify-center">
            <Button
              variant="secondary"
              size="lg"
              onClick={() => navigate("/profile")}
              className="bg-white text-blue-600 hover:bg-gray-100"
            >
              <Settings className="w-5 h-5 mr-2" />
              الملف الشخصي
            </Button>
            <Button
              variant="secondary"
              size="lg"
              onClick={() => navigate("/sao")}
              className="bg-white text-purple-600 hover:bg-gray-100"
            >
              <BookOpen className="w-5 h-5 mr-2" />
              ابدأ القراءة
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdvancedFeaturesDashboard;
