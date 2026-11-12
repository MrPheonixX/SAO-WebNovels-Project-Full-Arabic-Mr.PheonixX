import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Trophy,
  Target,
  Clock,
  Book,
  Star,
  TrendingUp,
  Award,
  Calendar,
  Zap,
  Brain,
  Heart,
  Eye,
} from "lucide-react";

interface ReadingSession {
  id: string;
  date: Date;
  duration: number; // minutes
  pagesRead: number;
  wordsRead: number;
  averageSpeed: number; // words per minute
  comprehensionScore?: number;
  series: string;
  volume: string;
  chapter: string;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  rarity: "common" | "rare" | "epic" | "legendary";
  unlockedAt?: Date;
  progress: number;
  maxProgress: number;
}

interface ReadingGoal {
  id: string;
  type: "daily" | "weekly" | "monthly" | "yearly";
  target: number;
  current: number;
  unit: "pages" | "minutes" | "chapters" | "books";
  endDate: Date;
}

interface ReadingInsight {
  type: "improvement" | "pattern" | "recommendation" | "milestone";
  title: string;
  description: string;
  actionable?: string;
  priority: "low" | "medium" | "high";
}

const ReadingAnalytics: React.FC = () => {
  const [sessions, setSessions] = useState<ReadingSession[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [goals, setGoals] = useState<ReadingGoal[]>([]);
  const [insights, setInsights] = useState<ReadingInsight[]>([]);
  const [activeTab, setActiveTab] = useState("overview");

  // بيانات تجريبية
  useEffect(() => {
    // محاكاة جلسات القراءة
    const mockSessions: ReadingSession[] = [
      {
        id: "1",
        date: new Date(2024, 0, 1),
        duration: 45,
        pagesRead: 12,
        wordsRead: 3000,
        averageSpeed: 67,
        comprehensionScore: 85,
        series: "SAO",
        volume: "المجلد 1",
        chapter: "الفصل 1",
      },
      {
        id: "2",
        date: new Date(2024, 0, 2),
        duration: 60,
        pagesRead: 18,
        wordsRead: 4500,
        averageSpeed: 75,
        comprehensionScore: 92,
        series: "SAO",
        volume: "المجلد 1",
        chapter: "الفصل 2",
      },
      {
        id: "3",
        date: new Date(2024, 0, 3),
        duration: 30,
        pagesRead: 8,
        wordsRead: 2000,
        averageSpeed: 67,
        comprehensionScore: 78,
        series: "SAO Progressive",
        volume: "المجلد 1",
        chapter: "الفصل 1",
      },
    ];

    const mockAchievements: Achievement[] = [
      {
        id: "first_chapter",
        title: "القارئ المبتدئ",
        description: "أكمل أول فصل لك",
        icon: "📖",
        rarity: "common",
        unlockedAt: new Date(2024, 0, 1),
        progress: 1,
        maxProgress: 1,
      },
      {
        id: "speed_reader",
        title: "القارئ السريع",
        description: "اقرأ بسرعة 100 كلمة في الدقيقة",
        icon: "⚡",
        rarity: "rare",
        progress: 75,
        maxProgress: 100,
      },
      {
        id: "weekly_warrior",
        title: "محارب أسبوعي",
        description: "اقرأ 7 أيام متتالية",
        icon: "🗡️",
        rarity: "epic",
        progress: 5,
        maxProgress: 7,
      },
      {
        id: "sao_master",
        title: "سيد ساو",
        description: "أكمل جميع مجلدات SAO الأساسية",
        icon: "👑",
        rarity: "legendary",
        progress: 3,
        maxProgress: 25,
      },
    ];

    const mockGoals: ReadingGoal[] = [
      {
        id: "daily_pages",
        type: "daily",
        target: 20,
        current: 12,
        unit: "pages",
        endDate: new Date(),
      },
      {
        id: "weekly_time",
        type: "weekly",
        target: 300,
        current: 135,
        unit: "minutes",
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
      {
        id: "monthly_books",
        type: "monthly",
        target: 3,
        current: 1,
        unit: "books",
        endDate: new Date(2024, 1, 1),
      },
    ];

    const mockInsights: ReadingInsight[] = [
      {
        type: "improvement",
        title: "تحسن في سرعة القراءة",
        description: "سرعة قراءتك زادت بنسبة 12% هذا الأسبوع!",
        actionable: "حافظ على هذا المعدل للوصول لهدف 100 كلمة/دقيقة",
        priority: "high",
      },
      {
        type: "pattern",
        title: "أفضل أوقات القراءة",
        description: "تقرأ بفعالية أكبر في المساء (19:00-21:00)",
        actionable: "جدول جلسات القراءة في هذا الوقت",
        priority: "medium",
      },
      {
        type: "recommendation",
        title: "اقتراح للقراءة التالية",
        description: "بناء على تفضيلاتك، ننصح بـ SAO Progressive",
        priority: "low",
      },
    ];

    setSessions(mockSessions);
    setAchievements(mockAchievements);
    setGoals(mockGoals);
    setInsights(mockInsights);
  }, []);

  // حساب الإحصائيات
  const totalStats = {
    totalTime: sessions.reduce((sum, session) => sum + session.duration, 0),
    totalPages: sessions.reduce((sum, session) => sum + session.pagesRead, 0),
    totalWords: sessions.reduce((sum, session) => sum + session.wordsRead, 0),
    averageSpeed:
      sessions.length > 0
        ? sessions.reduce((sum, session) => sum + session.averageSpeed, 0) /
          sessions.length
        : 0,
    currentStreak: 5, // يتم حسابه بناء على التواريخ الفعلية
    unlockedAchievements: achievements.filter((a) => a.unlockedAt).length,
  };

  // بيانات المخططات
  const weeklyData = [
    { day: "السبت", pages: 15, time: 45 },
    { day: "الأحد", pages: 20, time: 60 },
    { day: "الاثنين", pages: 12, time: 35 },
    { day: "الثلاثاء", pages: 18, time: 50 },
    { day: "الأربعاء", pages: 25, time: 70 },
    { day: "الخميس", pages: 22, time: 65 },
    { day: "الجمعة", pages: 16, time: 40 },
  ];

  const seriesData = [
    { name: "SAO الأساسي", value: 45, color: "#3b82f6" },
    { name: "SAO Progressive", value: 30, color: "#10b981" },
    { name: "الأعمال الجانبية", value: 15, color: "#f59e0b" },
    { name: "أعمال الأنمي", value: 10, color: "#ec4899" },
  ];

  const getRarityColor = (rarity: Achievement["rarity"]) => {
    const colors = {
      common: "bg-gray-100 text-gray-800",
      rare: "bg-blue-100 text-blue-800",
      epic: "bg-purple-100 text-purple-800",
      legendary: "bg-yellow-100 text-yellow-800",
    };
    return colors[rarity];
  };

  const getInsightIcon = (type: ReadingInsight["type"]) => {
    const icons = {
      improvement: TrendingUp,
      pattern: Brain,
      recommendation: Heart,
      milestone: Trophy,
    };
    return icons[type];
  };

  return (
    <div className="reading-analytics max-w-7xl mx-auto p-6">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
          📊 تحليلات القراءة الذكية
        </h1>
        <p className="text-gray-600">تتبع تقدمك واكتشف أنماط قراءتك</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
          <TabsTrigger value="achievements">الإنجازات</TabsTrigger>
          <TabsTrigger value="goals">الأهداف</TabsTrigger>
          <TabsTrigger value="insights">التحليلات</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* إحصائيات سريعة */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <Card className="p-4 text-center">
              <Clock className="w-8 h-8 mx-auto text-blue-500 mb-2" />
              <div className="text-2xl font-bold">{totalStats.totalTime}</div>
              <div className="text-sm text-gray-600">دقيقة قراءة</div>
            </Card>
            <Card className="p-4 text-center">
              <Book className="w-8 h-8 mx-auto text-green-500 mb-2" />
              <div className="text-2xl font-bold">{totalStats.totalPages}</div>
              <div className="text-sm text-gray-600">صفحة مقروءة</div>
            </Card>
            <Card className="p-4 text-center">
              <Zap className="w-8 h-8 mx-auto text-yellow-500 mb-2" />
              <div className="text-2xl font-bold">
                {Math.round(totalStats.averageSpeed)}
              </div>
              <div className="text-sm text-gray-600">كلمة/دقيقة</div>
            </Card>
            <Card className="p-4 text-center">
              <Target className="w-8 h-8 mx-auto text-red-500 mb-2" />
              <div className="text-2xl font-bold">
                {totalStats.currentStreak}
              </div>
              <div className="text-sm text-gray-600">يوم متتالي</div>
            </Card>
            <Card className="p-4 text-center">
              <Trophy className="w-8 h-8 mx-auto text-purple-500 mb-2" />
              <div className="text-2xl font-bold">
                {totalStats.unlockedAchievements}
              </div>
              <div className="text-sm text-gray-600">إنجاز محقق</div>
            </Card>
            <Card className="p-4 text-center">
              <Eye className="w-8 h-8 mx-auto text-indigo-500 mb-2" />
              <div className="text-2xl font-bold">
                {Math.round(totalStats.totalWords / 1000)}K
              </div>
              <div className="text-sm text-gray-600">كلمة مقروءة</div>
            </Card>
          </div>

          {/* مخططات الأداء */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4">الأداء الأسبوعي</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="pages" fill="#3b82f6" name="الصفحات" />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4">
                توزيع القراءة حسب السلسلة
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={seriesData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={(entry) => `${entry.name}: ${entry.value}%`}
                  >
                    {seriesData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="achievements" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {achievements.map((achievement) => {
              const isUnlocked = achievement.unlockedAt !== undefined;
              const progressPercentage =
                (achievement.progress / achievement.maxProgress) * 100;

              return (
                <Card
                  key={achievement.id}
                  className={`p-6 transition-all duration-300 ${
                    isUnlocked
                      ? "bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200"
                      : "bg-gray-50"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`text-4xl ${isUnlocked ? "" : "grayscale opacity-50"}`}
                    >
                      {achievement.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold">{achievement.title}</h4>
                        <Badge className={getRarityColor(achievement.rarity)}>
                          {achievement.rarity}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">
                        {achievement.description}
                      </p>

                      {!isUnlocked && (
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>التقدم</span>
                            <span>
                              {achievement.progress}/{achievement.maxProgress}
                            </span>
                          </div>
                          <Progress
                            value={progressPercentage}
                            className="h-2"
                          />
                        </div>
                      )}

                      {isUnlocked && (
                        <div className="flex items-center gap-2 text-sm text-green-600">
                          <Trophy className="w-4 h-4" />
                          محقق في{" "}
                          {achievement.unlockedAt!.toLocaleDateString("ar")}
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="goals" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {goals.map((goal) => {
              const progressPercentage = (goal.current / goal.target) * 100;
              const isCompleted = goal.current >= goal.target;

              return (
                <Card key={goal.id} className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">
                      الهدف ال
                      {goal.type === "daily"
                        ? "يومي"
                        : goal.type === "weekly"
                          ? "أسبوعي"
                          : goal.type === "monthly"
                            ? "شهري"
                            : "سنوي"}
                    </h3>
                    {isCompleted && (
                      <Trophy className="w-5 h-5 text-yellow-500" />
                    )}
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>التقدم</span>
                      <span>
                        {goal.current}/{goal.target} {goal.unit}
                      </span>
                    </div>
                    <Progress
                      value={Math.min(progressPercentage, 100)}
                      className={`h-3 ${isCompleted ? "bg-green-100" : ""}`}
                    />
                    <div className="text-xs text-gray-500">
                      ينتهي في: {goal.endDate.toLocaleDateString("ar")}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4">إنشاء هدف جديد</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Button variant="outline" className="h-20 flex flex-col">
                <Calendar className="w-6 h-6 mb-2" />
                هدف يومي
              </Button>
              <Button variant="outline" className="h-20 flex flex-col">
                <Calendar className="w-6 h-6 mb-2" />
                هدف أسبوعي
              </Button>
              <Button variant="outline" className="h-20 flex flex-col">
                <Calendar className="w-6 h-6 mb-2" />
                هدف شهري
              </Button>
              <Button variant="outline" className="h-20 flex flex-col">
                <Calendar className="w-6 h-6 mb-2" />
                هدف سنوي
              </Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <div className="space-y-4">
            {insights.map((insight, index) => {
              const IconComponent = getInsightIcon(insight.type);
              const priorityColors = {
                low: "border-l-blue-500 bg-blue-50",
                medium: "border-l-yellow-500 bg-yellow-50",
                high: "border-l-red-500 bg-red-50",
              };

              return (
                <Card
                  key={index}
                  className={`p-6 border-l-4 ${priorityColors[insight.priority]}`}
                >
                  <div className="flex items-start gap-4">
                    <IconComponent className="w-6 h-6 mt-1 text-gray-600" />
                    <div className="flex-1">
                      <h4 className="font-semibold mb-2">{insight.title}</h4>
                      <p className="text-gray-600 mb-3">
                        {insight.description}
                      </p>
                      {insight.actionable && (
                        <div className="bg-white p-3 rounded-lg border-l-2 border-blue-300">
                          <div className="font-medium text-sm text-blue-800 mb-1">
                            إجراء مقترح:
                          </div>
                          <div className="text-sm text-blue-700">
                            {insight.actionable}
                          </div>
                        </div>
                      )}
                    </div>
                    <Badge variant="secondary">
                      {insight.priority === "high"
                        ? "عالي"
                        : insight.priority === "medium"
                          ? "متوسط"
                          : "منخفض"}
                    </Badge>
                  </div>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ReadingAnalytics;
