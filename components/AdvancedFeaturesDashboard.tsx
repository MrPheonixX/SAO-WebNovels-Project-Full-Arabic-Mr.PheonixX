import { useNavigate } from "react-router-dom";
import {
  Bot,
  BookOpen,
  MessageSquare,
  Palette,
  Smartphone,
  Star,
  Users,
  Volume2,
  type LucideIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

// What the platform really offers today, and what is only planned.
// (No completion percentages: a feature either works or it is "coming soon".)
interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
  color: string;
  to?: string; // present = available now
  action?: string;
}

const AVAILABLE: Feature[] = [
  {
    icon: BookOpen,
    title: "القراءة داخل الموقع",
    description: "اقرأ الروايات مباشرة من المتصفح على الكمبيوتر والهاتف، مع تكبير وتنقل بين الصفحات وحفظ آخر صفحة وصلت لها.",
    color: "from-blue-500 to-cyan-500",
    to: "/pdf-works",
    action: "تصفح المكتبة",
  },
  {
    icon: Users,
    title: "حساب وسجل قراءة",
    description: "أنشئ حساباً مجانياً ليُحفظ سجل قراءتك ويتزامن بين أجهزتك، مع مستويات وإنجازات حقيقية.",
    color: "from-purple-500 to-pink-500",
    to: "/login",
    action: "إنشاء حساب",
  },
  {
    icon: Star,
    title: "التقييمات والتعليقات",
    description: "قيّم كل عمل من 1 إلى 5 نجوم واكتب رأيك واقرأ آراء القرّاء الآخرين.",
    color: "from-yellow-500 to-orange-500",
    to: "/pdf-works",
    action: "اختر عملاً",
  },
  {
    icon: Smartphone,
    title: "تثبيت كتطبيق",
    description: "ثبّت الموقع على شاشة هاتفك من قائمة المتصفح ليفتح مثل أي تطبيق.",
    color: "from-green-500 to-emerald-500",
  },
];

const PLANNED: Feature[] = [
  { icon: Volume2, title: "القراءة الصوتية", description: "تحويل النص إلى صوت عربي.", color: "from-pink-500 to-rose-500" },
  { icon: Bot, title: "مساعد ذكي", description: "ملخصات وشرح للمصطلحات اليابانية.", color: "from-indigo-500 to-blue-500" },
  { icon: MessageSquare, title: "نوادي القراءة", description: "نقاشات وتحديات جماعية بين القرّاء.", color: "from-orange-500 to-red-500" },
  { icon: Palette, title: "ثيمات وتخصيص", description: "ألوان وأحجام خطوط حسب ذوقك.", color: "from-teal-500 to-cyan-500" },
];

export default function AdvancedFeaturesDashboard() {
  const navigate = useNavigate();

  return (
    <div className="space-y-10">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-blue-300">🚀 مميزات المنصة</h2>
        <p className="text-gray-400 mt-2">ما هو متاح الآن، وما نعمل عليه</p>
      </div>

      <div>
        <h3 className="text-xl font-semibold text-green-400 mb-4">متاح الآن</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {AVAILABLE.map((f) => (
            <Card key={f.title} className="bg-black/40 border-white/10 backdrop-blur-xl">
              <CardHeader className="text-center">
                <div className={`w-14 h-14 mx-auto mb-3 rounded-full bg-gradient-to-br ${f.color} flex items-center justify-center`}>
                  <f.icon className="w-7 h-7 text-white" />
                </div>
                <CardTitle className="text-white text-lg">{f.title}</CardTitle>
                <CardDescription className="text-gray-300">{f.description}</CardDescription>
              </CardHeader>
              {f.to && (
                <CardContent>
                  <Button className="w-full" onClick={() => navigate(f.to!)}>
                    {f.action}
                  </Button>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-xl font-semibold text-yellow-400 mb-4">قريباً</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {PLANNED.map((f) => (
            <Card key={f.title} className="bg-black/30 border-white/10 opacity-80">
              <CardHeader className="text-center">
                <div className={`w-14 h-14 mx-auto mb-3 rounded-full bg-gradient-to-br ${f.color} flex items-center justify-center opacity-70`}>
                  <f.icon className="w-7 h-7 text-white" />
                </div>
                <CardTitle className="text-gray-200 text-lg">{f.title}</CardTitle>
                <CardDescription className="text-gray-400">{f.description}</CardDescription>
                <Badge variant="outline" className="mx-auto mt-2 border-yellow-500/50 text-yellow-400">
                  قريباً
                </Badge>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
