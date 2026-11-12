import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { resolveWork } from "@/lib/readerRoutes";
import {
  BookOpen,
  Star,
  Play,
  Download,
  Users,
  Heart,
  Sparkles,
  Clock,
  Award,
  TrendingUp,
  Filter,
  Search,
  Zap,
  Crown,
  Globe,
  FileText,
  Flame,
  Shield,
  Sword,
} from "lucide-react";
import {
  InteractiveButton,
  InteractiveCard,
} from "@/components/InteractiveElements";

const lightNovels = [
  {
    id: 1,
    title: "Re:Zero - Starting Life in Another World",
    arabicTitle: "ري:زيرو - بداية الحياة في عالم آخر",
    author: "تابيي ناغاتسوكي",
    illustrator: "شينيتشيرو أوتسوكا",
    translator: "MrPheonixX Team",
    volumes: 33,
    status: "مستمر",
    rating: 9.4,
    genre: ["إيسيكاي", "نفسي", "رومانسي", "دراما"],
    description:
      "سوبارو ناتسوكي ينتقل إلى عالم فانتازي ويكتشف أن لديه قدرة على العودة من الموت. رحلة مؤلمة مليئة بالمعاناة والنمو.",
    cover: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400",
    readTime: "45 ساعة",
    chapters: 650,
    language: "عربي",
    popularity: "عالية جداً",
    themes: ["قوة الإرادة", "الحب", "التضحية", "النمو الشخصي"],
    ageRating: "17+",
  },
  {
    id: 2,
    title: "Overlord",
    arabicTitle: "أوفرلورد",
    author: "كوغاني ماروياما",
    illustrator: "سو-بين",
    translator: "MrPheonixX Team",
    volumes: 16,
    status: "مستمر",
    rating: 9.1,
    genre: ["إيسيكاي", "أكشن", "كوميدي", "فانتازي"],
    description:
      "لاعب يجد نفسه محاصراً في لعبة MMO كسيد الظلام مومونغا. يحكم عالماً جديداً بقوة مطلقة.",
    cover: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400",
    readTime: "30 ساعة",
    chapters: 400,
    language: "عربي",
    popularity: "عالية",
    themes: ["القوة", "الحكم", "الولاء", "الاستراتيجية"],
    ageRating: "16+",
  },
  {
    id: 3,
    title: "Konosuba - God's Blessing on This Wonderful World!",
    arabicTitle: "كونوسوبا - بركة الإله على هذا العالم الرائع!",
    author: "ناتسومه أكاتسوكي",
    illustrator: "كومي مشيما",
    translator: "MrPheonixX Team",
    volumes: 17,
    status: "مكتمل",
    rating: 8.9,
    genre: ["إيسيكاي", "كوميدي", "مغامرة", "باروديا"],
    description:
      "كازوما يموت بطريقة محرجة وينتقل لعالم فانتازي مع إلهة عديمة الفائدة. كوميديا خفيفة ومرحة.",
    cover: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400",
    readTime: "25 ساعة",
    chapters: 340,
    language: "عربي",
    popularity: "عالية",
    themes: ["الصداقة", "المرح", "المغامرة", "النمو"],
    ageRating: "13+",
  },
  {
    id: 4,
    title: "No Game No Life",
    arabicTitle: "لا لعبة لا حياة",
    author: "يو كامياه",
    illustrator: "يو كامياه",
    translator: "MrPheonixX Team",
    volumes: 12,
    status: "مستمر",
    rating: 9.0,
    genre: ["إيسيكاي", "استراتيجي", "كوميدي", "إثارة"],
    description:
      "الأخوين سورا وشي��و ينتقلان لعالم حيث كل شيء يُحل بالألعاب. معارك ذهنية وألعاب استراتيجية معقدة.",
    cover: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400",
    readTime: "20 ساعة",
    chapters: 240,
    language: "عربي",
    popularity: "عالية",
    themes: ["الذكاء", "الألعاب", "الاستراتيجية", "الأخوة"],
    ageRating: "15+",
  },
  {
    id: 5,
    title: "That Time I Got Reincarnated as a Slime",
    arabicTitle: "تلك المرة التي تجسدت فيها كوحل",
    author: "فوز",
    illustrator: "ميتز فوز",
    translator: "MrPheonixX Team",
    volumes: 21,
    status: "مستمر",
    rating: 8.8,
    genre: ["إيسيكاي", "أكشن", "بناء الحضارة", "فانتازي"],
    description:
      "سالاري مان يتجسد كوحل في عالم فانتازي ويبني إمبراطورية. قصة عن ب���اء الحضارة والقيادة الحكيمة.",
    cover: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400",
    readTime: "35 ساعة",
    chapters: 420,
    language: "عربي",
    popularity: "عالية",
    themes: ["القيادة", "بناء ��لمجتمع", "التطور", "الحكمة"],
    ageRating: "13+",
  },
  {
    id: 6,
    title: "Classroom of the Elite",
    arabicTitle: "فصل النخبة",
    author: "شوغو كينوغاشا",
    illustrator: "شوخي سيكي",
    translator: "MrPheonixX Team",
    volumes: 28,
    status: "مستمر",
    rating: 9.2,
    genre: ["نفسي", "إثارة", "مدرسي", "استراتيجي"],
    description:
      "كيوتاكا أيانوكوجي في مدرسة نخبة حيث الطلاب يتنافسون بكل الطرق. ألعاب نفسية ومعارك ذكية.",
    cover: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400",
    readTime: "40 ساعة",
    chapters: 560,
    language: "عربي",
    popularity: "عالية جداً",
    themes: ["التنافس", "الذكاء", "المدرسة", "النفسية"],
    ageRating: "16+",
  },
  {
    id: 7,
    title: "Oregairu - My Youth Romantic Comedy Is Wrong, As I Expected",
    arabicTitle: "أوريغايرو - كوميديا شبابي الرومانسية خاطئة كما توقعت",
    author: "واتاري واتارو",
    illustrator: "بونتي كان",
    translator: "MrPheonixX Team",
    volumes: 18,
    status: "مكتمل",
    rating: 9.3,
    genre: ["رومانسي", "دراما", "مدرسي", "نفسي"],
    description:
      "هاتشيمان هيكيغايا شاب متشائم ينضم لنادي التطوع. قصة عن النمو الشخصي والعلاقات الإنسانية الحقيقية.",
    cover: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400",
    readTime: "30 ساعة",
    chapters: 360,
    language: "عربي",
    popularity: "عالية",
    themes: ["الحب", "النمو", "الصداقة", "فهم الذات"],
    ageRating: "15+",
  },
  {
    id: 8,
    title: "The Rising of the Shield Hero",
    arabicTitle: "صعود بطل الدرع",
    author: "أنيكو يوساغي",
    illustrator: "مينامي سيرا",
    translator: "MrPheonixX Team",
    volumes: 22,
    status: "مستمر",
    rating: 8.7,
    genre: ["إيسيكاي", "أكشن", "مغامرة", "انتقام"],
    description:
      "نافومي إيواتاني يُستدعى كبطل الدرع لكنه يُخان من الجميع. رحلة انتقام وإثبات الذات في عالم قاسٍ.",
    cover: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400",
    readTime: "28 ساعة",
    chapters: 440,
    language: "عربي",
    popularity: "متوسطة",
    themes: ["الانتقام", "الثقة", "العدالة", "القوة"],
    ageRating: "16+",
  },
];

export default function LightNovels() {
  const navigate = useNavigate();
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("rating");
  const [filteredNovels, setFilteredNovels] = useState(lightNovels);

  // استخراج جميع الأنواع والحالات
  const allGenres = Array.from(
    new Set(lightNovels.flatMap((novel) => novel.genre)),
  );
  const allStatuses = Array.from(
    new Set(lightNovels.map((novel) => novel.status)),
  );

  // تصفية الروايات
  useEffect(() => {
    let filtered = lightNovels;

    // تصفية حسب البحث
    if (searchTerm) {
      filtered = filtered.filter(
        (novel) =>
          novel.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          novel.arabicTitle.includes(searchTerm) ||
          novel.author.includes(searchTerm),
      );
    }

    // تصفية حسب النوع
    if (selectedGenres.length > 0) {
      filtered = filtered.filter((novel) =>
        selectedGenres.some((genre) => novel.genre.includes(genre)),
      );
    }

    // تصفية حسب الحالة
    if (selectedStatus) {
      filtered = filtered.filter((novel) => novel.status === selectedStatus);
    }

    // ترتيب النتائج
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "rating":
          return b.rating - a.rating;
        case "title":
          return a.title.localeCompare(b.title);
        case "volumes":
          return b.volumes - a.volumes;
        case "popularity":
          const popularityOrder = {
            "عالية جداً": 4,
            عالية: 3,
            متوسطة: 2,
            منخفضة: 1,
          };
          return (
            (popularityOrder[b.popularity as keyof typeof popularityOrder] ||
              0) -
            (popularityOrder[a.popularity as keyof typeof popularityOrder] || 0)
          );
        default:
          return 0;
      }
    });

    setFilteredNovels(filtered);
  }, [searchTerm, selectedGenres, selectedStatus, sortBy]);

  const toggleGenre = (genre: string) => {
    setSelectedGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre],
    );
  };

  const getPopularityColor = (popularity: string) => {
    switch (popularity) {
      case "عالية جداً":
        return "text-red-400 border-red-500/50";
      case "عالية":
        return "text-orange-400 border-orange-500/50";
      case "متوسطة":
        return "text-yellow-400 border-yellow-500/50";
      case "منخفضة":
        return "text-gray-400 border-gray-500/50";
      default:
        return "text-gray-400 border-gray-500/50";
    }
  };

  const getGenreIcon = (genre: string) => {
    switch (genre) {
      case "إيسيكاي":
        return "";
      case "أكشن":
        return "";
      case "رومانسي":
        return "";
      case "كوميدي":
        return "😄";
      case "نفسي":
        return "";
      case "فانتازي":
        return "🔮";
      case "مدرسي":
        return "🏫";
      case "استراتيجي":
        return "♟️";
      case "إثارة":
        return "";
      case "دراما":
        return "🎭";
      default:
        return "📖";
    }
  };

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* خلفية متحركة */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/20 via-blue-900/20 to-purple-900/20"></div>

        {/* جسيمات عائمة */}
        {Array.from({ length: 30 }, (_, i) => (
          <div
            key={i}
            className="absolute rounded-full animate-pulse"
            style={{
              width: `${2 + Math.random() * 3}px`,
              height: `${2 + Math.random() * 3}px`,
              background: ["#06b6d4", "#3b82f6", "#8b5cf6", "#ec4899"][i % 4],
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animation: `float ${3 + Math.random() * 4}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 2}s`,
            }}
          ></div>
        ))}
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-cyan-500/20 bg-black/40 backdrop-blur-xl">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-2">
                  الروايات الخفيفة
                </h1>
                <p className="text-gray-400">
                  أحدث وأفضل الروايات الخفيفة اليابانية
                </p>
              </div>

              <InteractiveButton
                variant="crystal"
                onClick={() => navigate("/")}
              >
                العودة للرئيسية
              </InteractiveButton>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          {/* شريط البحث والتصفية */}
          <div className="mb-8 space-y-6">
            {/* البحث */}
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="ابحث في الروايات الخفيفة..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-gray-900/50 border border-cyan-500/30 rounded-lg px-12 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400"
              />
            </div>

            {/* فلاتر الأنواع */}
            <div className="flex flex-wrap justify-center gap-3">
              <span className="text-cyan-400 font-semibold flex items-center gap-2">
                <Filter className="w-4 h-4" />
                ����أنواع:
              </span>
              {allGenres.map((genre) => (
                <button
                  key={genre}
                  onClick={() => toggleGenre(genre)}
                  className={`px-4 py-2 rounded-full text-sm transition-all duration-300 flex items-center gap-1 ${
                    selectedGenres.includes(genre)
                      ? "bg-cyan-500 text-white"
                      : "bg-gray-800/50 text-gray-300 hover:bg-gray-700/50"
                  }`}
                >
                  <span>{getGenreIcon(genre)}</span>
                  {genre}
                </button>
              ))}
            </div>

            {/* فلتر الحالة */}
            <div className="flex flex-wrap justify-center gap-3">
              <span className="text-purple-400 font-semibold">الحالة:</span>
              {allStatuses.map((status) => (
                <button
                  key={status}
                  onClick={() =>
                    setSelectedStatus(selectedStatus === status ? "" : status)
                  }
                  className={`px-4 py-2 rounded-full text-sm transition-all duration-300 ${
                    selectedStatus === status
                      ? "bg-purple-500 text-white"
                      : "bg-gray-800/50 text-gray-300 hover:bg-gray-700/50"
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>

            {/* خيارات الترتيب */}
            <div className="flex justify-center items-center gap-4">
              <span className="text-cyan-400 font-semibold">ترتيب حسب:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-gray-900/50 border border-cyan-500/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-400"
              >
                <option value="rating">التقييم</option>
                <option value="title">الاسم</option>
                <option value="volumes">عدد المجلدات</option>
                <option value="popularity">الشعبية</option>
              </select>
            </div>
          </div>

          {/* إحصائيات */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 max-w-4xl mx-auto">
            <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-cyan-400">
                {filteredNovels.length}
              </div>
              <div className="text-gray-400 text-sm">رواية متاحة</div>
            </div>
            <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-400">
                {filteredNovels.reduce((sum, novel) => sum + novel.volumes, 0)}
              </div>
              <div className="text-gray-400 text-sm">مجلد</div>
            </div>
            <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-purple-400">
                {(
                  filteredNovels.reduce((sum, novel) => sum + novel.rating, 0) /
                  filteredNovels.length
                ).toFixed(1)}
              </div>
              <div className="text-gray-400 text-sm">متوسط التقييم</div>
            </div>
            <div className="bg-gradient-to-r from-green-500/10 to-teal-500/10 border border-green-500/30 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-400">
                {
                  filteredNovels.filter((novel) => novel.status === "مستمر")
                    .length
                }
              </div>
              <div className="text-gray-400 text-sm">رواية مستمرة</div>
            </div>
          </div>

          {/* قائمة الروايات */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredNovels.map((novel) => (
              <InteractiveCard
                key={novel.id}
                className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 border border-cyan-500/30 backdrop-blur-xl hover:border-cyan-400/50 transition-all duration-500 group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500"></div>

                <CardHeader className="relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <CardTitle className="text-xl text-cyan-400 mb-2 group-hover:text-cyan-300 transition-colors">
                        {novel.arabicTitle}
                      </CardTitle>
                      <CardDescription className="text-gray-300 text-sm">
                        {novel.title}
                      </CardDescription>
                      <CardDescription className="text-gray-400 text-xs mt-1">
                        {novel.author} • رسوم: {novel.illustrator}
                      </CardDescription>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <div className="flex items-center gap-1 bg-yellow-500/20 px-2 py-1 rounded-full">
                        <Star className="w-4 h-4 text-yellow-400" />
                        <span className="text-yellow-400 text-sm font-bold">
                          {novel.rating}
                        </span>
                      </div>
                      <Badge
                        variant="outline"
                        className={`${getPopularityColor(novel.popularity)} text-xs`}
                      >
                        <TrendingUp className="w-3 h-3 mr-1" />
                        {novel.popularity}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {novel.genre.slice(0, 3).map((genre) => (
                      <Badge
                        key={genre}
                        variant="secondary"
                        className="bg-cyan-500/20 text-cyan-300 border-cyan-500/50 text-xs"
                      >
                        <span className="mr-1">{getGenreIcon(genre)}</span>
                        {genre}
                      </Badge>
                    ))}
                  </div>
                </CardHeader>

                <CardContent className="relative z-10">
                  <p className="text-gray-300 mb-4 leading-relaxed text-sm">
                    {novel.description}
                  </p>

                  <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                    <div className="flex items-center gap-2 text-gray-400">
                      <BookOpen className="w-4 h-4" />
                      <span>{novel.volumes} مجلد</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-400">
                      <Clock className="w-4 h-4" />
                      <span>{novel.readTime}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-400">
                      <FileText className="w-4 h-4" />
                      <span>{novel.chapters} فصل</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-400">
                      <Shield className="w-4 h-4" />
                      <span>{novel.ageRating}</span>
                    </div>
                  </div>

                  {/* المواضيع */}
                  <div className="mb-4">
                    <p className="text-sm text-gray-400 mb-2">
                      المواضيع الرئيسية:
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {novel.themes.slice(0, 3).map((theme) => (
                        <span
                          key={theme}
                          className="bg-purple-500/10 text-purple-300 text-xs px-2 py-1 rounded"
                        >
                          {theme}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <Badge
                      className={`${
                        novel.status === "مكتمل"
                          ? "bg-green-500/20 text-green-300 border-green-500/50"
                          : "bg-blue-500/20 text-blue-300 border-blue-500/50"
                      }`}
                    >
                      {novel.status}
                    </Badge>

                    <Badge
                      variant="outline"
                      className="border-gray-500/50 text-gray-300 text-xs"
                    >
                      {novel.language}
                    </Badge>
                  </div>

                  <div className="space-y-3">
                    {resolveWork("lightnovel", String(novel.id)) ? (
<InteractiveButton
                      variant="crystal"
                      className="w-full group-hover:scale-105 transition-all duration-300"
                      onClick={() => navigate(`/reader/lightnovel/${novel.id}`)}
                    >
                      <Play className="w-4 h-4 mr-2" />
                      ابدأ القراءة
                    </InteractiveButton>

                    ) : (

                      <Button variant="outline" disabled className="w-full">

                        قريباً

                      </Button>

                    )}

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 border-cyan-500/50 text-cyan-300 hover:bg-cyan-500/10"
                      >
                        <Download className="w-4 h-4 mr-1" />
                        تحميل
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 border-pink-500/50 text-pink-300 hover:bg-pink-500/10"
                      >
                        <Heart className="w-4 h-4 mr-1" />
                        إعجاب
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </InteractiveCard>
            ))}
          </div>

          {/* رسالة عدم وجود نتائج */}
          {filteredNovels.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📚</div>
              <h3 className="text-2xl font-bold text-gray-400 mb-2">
                لا توجد نتائج
              </h3>
              <p className="text-gray-500">
                جرب البحث بكلمات مختلفة أو قم بتغيير المرشحات
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
