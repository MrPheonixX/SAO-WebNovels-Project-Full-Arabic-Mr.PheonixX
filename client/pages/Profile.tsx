import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Award,
  BookOpen,
  Clock,
  Crown,
  Edit,
  Heart,
  Save,
  Settings,
  Star,
  Trophy,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { pdfWorks } from "@/data/pdfWorks";
import {
  cloudEnabled,
  getSessionUser,
  readLocalProgress,
  signOut as cloudSignOut,
  syncProgress,
} from "@/lib/cloud";
import { buildAchievements, summarize, XP_PER_LEVEL } from "@/lib/profileStats";

interface UserProfile {
  id: string;
  username: string;
  email: string;
  level: number;
  xp: number;
  joinDate: string;
  avatar: string;
  badge: string;
  readingStreak: number;
  totalPagesRead: number;
  favoriteCharacter: string;
  readingPreferences: { theme: string; fontSize: number; readingMode: string };
}

const RARITY: Record<string, { text: string; border: string }> = {
  common: { text: "text-gray-300", border: "border-gray-500/40" },
  rare: { text: "text-blue-400", border: "border-blue-500/50" },
  epic: { text: "text-purple-400", border: "border-purple-500/50" },
  legendary: { text: "text-yellow-400", border: "border-yellow-500/50" },
};
const RARITY_LABEL: Record<string, string> = {
  common: "عادي",
  rare: "نادر",
  epic: "ملحمي",
  legendary: "أسطوري",
};

const TABS = [
  { id: "overview", label: "نظرة عامة", icon: User },
  { id: "history", label: "سجل القراءة", icon: Clock },
  { id: "achievements", label: "الإنجازات", icon: Award },
  { id: "settings", label: "الإعدادات", icon: Settings },
] as const;

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]["id"]>("overview");
  const [historyVersion, setHistoryVersion] = useState(0);
  const [syncMessage, setSyncMessage] = useState("");

  useEffect(() => {
    // A leftover profile from the old demo login has no real account behind it.
    if (
      cloudEnabled &&
      !getSessionUser() &&
      localStorage.getItem("auth-token") !== "guest-token"
    ) {
      localStorage.removeItem("user-profile");
      navigate("/login");
      return;
    }
    const saved = localStorage.getItem("user-profile");
    if (!saved) {
      navigate("/login");
      return;
    }
    try {
      setUser(JSON.parse(saved));
    } catch {
      localStorage.removeItem("user-profile");
      navigate("/login");
    }
  }, [navigate]);

  // Real reading history of this device (kept in sync with the account when signed in)
  const hasAccount = Boolean(getSessionUser());
  const history = useMemo(() => readLocalProgress().works, [historyVersion]);
  const summary = useMemo(() => summarize(history, pdfWorks), [history]);
  const achievements = useMemo(
    () => buildAchievements(history, pdfWorks, hasAccount),
    [history, hasAccount],
  );
  const unlocked = achievements.filter((a) => a.unlocked).length;

  const handleSaveProfile = () => {
    if (user) {
      localStorage.setItem("user-profile", JSON.stringify(user));
      setIsEditing(false);
    }
  };

  const handleLogout = () => {
    void cloudSignOut();
    localStorage.removeItem("user-profile");
    localStorage.removeItem("auth-token");
    navigate("/");
  };

  const handleSync = async () => {
    setSyncMessage("جاري المزامنة...");
    const result = await syncProgress();
    setHistoryVersion((v) => v + 1);
    setSyncMessage(
      result === "error"
        ? "تعذرت المزامنة. تأكد من الاتصال وحاول مرة أخرى."
        : result === "pulled"
          ? "تم تحديث السجل من حسابك."
          : result === "pushed"
            ? "تم حفظ سجل هذا الجهاز في حسابك."
            : "السجل محدّث.",
    );
  };

  const handleClearHistory = () => {
    if (!window.confirm("حذف سجل القراءة من هذا الجهاز؟")) return;
    try {
      localStorage.removeItem("sao-progress");
    } catch {
      /* storage unavailable */
    }
    setHistoryVersion((v) => v + 1);
    setSyncMessage("تم حذف السجل من هذا الجهاز.");
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-violet-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full mx-auto mb-4" />
          <p>جاري تحميل الملف الشخصي...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-violet-900 text-white">
      <header className="border-b border-blue-500/20 bg-black/20 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="text-blue-400 hover:text-blue-300">
            <ArrowLeft className="w-4 h-4 mr-2" />
            العودة للرئيسية
          </Button>
          <Button variant="outline" size="sm" onClick={handleLogout} className="border-red-500 text-red-400 hover:bg-red-500/10">
            تسجيل خروج
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Profile header */}
        <Card className="mb-8 bg-black/40 border-blue-500/30 backdrop-blur-xl">
          <CardContent className="p-8">
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-24 h-24 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-4xl">
                  {user.avatar}
                </div>
                <div className="absolute -bottom-2 -right-2 bg-yellow-500 text-black rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                  {summary.level}
                </div>
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                  {isEditing ? (
                    <input
                      type="text"
                      aria-label="الاسم"
                      maxLength={40}
                      value={user.username}
                      onChange={(e) => setUser({ ...user, username: e.target.value })}
                      className="text-2xl font-bold bg-transparent border-b border-blue-400 text-blue-400 focus:outline-none"
                    />
                  ) : (
                    <h1 className="text-3xl font-bold text-blue-400">{user.username}</h1>
                  )}
                  <Badge className="bg-gradient-to-r from-purple-600 to-pink-600">
                    <Crown className="w-3 h-3 mr-1" />
                    {user.badge}
                  </Badge>
                </div>
                <p className="text-gray-300 mb-3">
                  عضو منذ {new Date(user.joinDate).toLocaleDateString("ar-EG")}
                </p>
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-400 mb-1">
                    <span>المستوى {summary.level}</span>
                    <span>
                      {summary.xp % XP_PER_LEVEL} / {XP_PER_LEVEL} XP
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-400 to-purple-400 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${summary.levelProgress}%` }}
                    />
                  </div>
                </div>
              </div>

              <Button
                variant={isEditing ? "default" : "outline"}
                size="sm"
                onClick={isEditing ? handleSaveProfile : () => setIsEditing(true)}
                className={isEditing ? "bg-green-600 hover:bg-green-700" : ""}
              >
                {isEditing ? (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    حفظ
                  </>
                ) : (
                  <>
                    <Edit className="w-4 h-4 mr-2" />
                    تعديل
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <div className="mb-8 flex gap-2 bg-black/30 p-2 rounded-lg overflow-x-auto" role="tablist">
          {TABS.map((tab) => (
            <Button
              key={tab.id}
              role="tab"
              aria-selected={activeTab === tab.id}
              variant={activeTab === tab.id ? "default" : "ghost"}
              onClick={() => setActiveTab(tab.id)}
              className="flex-shrink-0 min-w-fit"
            >
              <tab.icon className="w-4 h-4 mr-2" />
              {tab.label}
            </Button>
          ))}
        </div>

        {activeTab === "overview" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 border-blue-500/30">
              <CardContent className="p-6 text-center">
                <BookOpen className="w-12 h-12 text-blue-400 mx-auto mb-3" />
                <h3 className="text-2xl font-bold text-blue-300">{summary.distinct}</h3>
                <p className="text-gray-300">عمل فتحته</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-purple-600/20 to-purple-800/20 border-purple-500/30">
              <CardContent className="p-6 text-center">
                <Clock className="w-12 h-12 text-purple-400 mx-auto mb-3" />
                <h3 className="text-2xl font-bold text-purple-300">{summary.totalOpens}</h3>
                <p className="text-gray-300">مرة فتح</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-green-600/20 to-green-800/20 border-green-500/30">
              <CardContent className="p-6 text-center">
                <Trophy className="w-12 h-12 text-green-400 mx-auto mb-3" />
                <h3 className="text-2xl font-bold text-green-300">
                  {unlocked} / {achievements.length}
                </h3>
                <p className="text-gray-300">إنجاز مفتوح</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-yellow-600/20 to-yellow-800/20 border-yellow-500/30">
              <CardContent className="p-6 text-center">
                <Star className="w-12 h-12 text-yellow-400 mx-auto mb-3" />
                <h3 className="text-2xl font-bold text-yellow-300">{summary.level}</h3>
                <p className="text-gray-300">المستوى</p>
              </CardContent>
            </Card>
            <p className="md:col-span-2 lg:col-span-4 text-xs text-gray-400">
              النقاط: 50 لأول فتح لكل عمل و10 لكل مرة فتح. المستوى الجديد كل {XP_PER_LEVEL} نقطة.
            </p>
          </div>
        )}

        {activeTab === "history" && (
          <Card className="bg-black/40 border-blue-500/30 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-blue-400">آخر ما قرأته</CardTitle>
            </CardHeader>
            <CardContent>
              {summary.items.length === 0 ? (
                <div className="text-center py-10 text-gray-400">
                  <BookOpen className="w-12 h-12 mx-auto mb-3" />
                  <p className="mb-4">لم تفتح أي عمل بعد.</p>
                  <Button onClick={() => navigate("/pdf-works")}>تصفح المكتبة</Button>
                </div>
              ) : (
                <ul className="divide-y divide-white/10">
                  {summary.items.map((item) => (
                    <li key={item.id} className="py-3 flex items-center justify-between gap-4">
                      <div>
                        <p className="font-semibold text-blue-300">{item.title}</p>
                        <p className="text-xs text-gray-400">
                          آخر فتح {new Date(item.lastOpened).toLocaleDateString("ar-EG")} · {item.opens} مرة
                        </p>
                      </div>
                      <Button size="sm" onClick={() => navigate(`/pdf-reader/${item.id}`)}>
                        متابعة
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === "achievements" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {achievements.map((a) => {
              const r = RARITY[a.rarity];
              return (
                <Card
                  key={a.id}
                  className={`bg-black/40 backdrop-blur-xl ${a.unlocked ? r.border : "border-gray-600/30"}`}
                >
                  <CardContent className="p-6 flex items-center gap-4">
                    <div className={`text-4xl ${a.unlocked ? "" : "grayscale opacity-50"}`}>{a.icon}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className={`font-bold ${a.unlocked ? r.text : "text-gray-400"}`}>{a.title}</h3>
                        <Badge variant="outline" className={`${r.text} text-xs`}>
                          {RARITY_LABEL[a.rarity]}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-300 mb-2">{a.description}</p>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-blue-400 to-purple-400 h-2 rounded-full"
                          style={{ width: `${(a.progress / a.max) * 100}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        {a.progress} / {a.max}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {activeTab === "settings" && (
          <div className="space-y-6">
            <Card className="bg-black/40 border-blue-500/30 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-blue-400">الملف الشخصي</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label htmlFor="fav-char" className="block text-sm font-medium text-gray-300 mb-2">
                    <Heart className="inline w-4 h-4 mr-1 text-red-400" />
                    شخصيتك المفضلة
                  </label>
                  <input
                    id="fav-char"
                    type="text"
                    maxLength={40}
                    value={user.favoriteCharacter}
                    onChange={(e) => setUser({ ...user, favoriteCharacter: e.target.value })}
                    className="w-full px-3 py-2 bg-black/40 border border-gray-500/30 rounded-md text-white focus:border-blue-400 focus:outline-none"
                  />
                </div>
                <Button onClick={handleSaveProfile} className="w-full bg-gradient-to-r from-blue-600 to-purple-600">
                  <Save className="w-4 h-4 mr-2" />
                  حفظ
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-black/40 border-blue-500/30 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-blue-400">سجل القراءة</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-gray-300">
                  {hasAccount
                    ? "سجلك محفوظ في حسابك ويمكنك مزامنته بين أجهزتك."
                    : "أنت تستخدم وضع الضيف: السجل محفوظ على هذا الجهاز فقط. أنشئ حساباً لحفظه."}
                </p>
                <div className="flex flex-wrap gap-3">
                  {hasAccount && (
                    <Button variant="outline" onClick={handleSync}>
                      مزامنة الآن
                    </Button>
                  )}
                  <Button variant="outline" onClick={handleClearHistory} className="border-red-500 text-red-400">
                    حذف السجل من هذا الجهاز
                  </Button>
                </div>
                {syncMessage && (
                  <p className="text-sm text-green-400" role="status">
                    {syncMessage}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
