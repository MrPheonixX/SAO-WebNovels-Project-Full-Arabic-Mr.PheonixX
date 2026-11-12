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
  Calendar,
  User,
  Grid,
  List,
  ArrowUpDown,
  Tags,
  Eye,
} from "lucide-react";
import { InteractiveButton, InteractiveCard } from "@/components/InteractiveElements";

// بيانات جميع الأعمال مجمعة
const allWorks = [
  // SAO Series
  {
    id: "sao-1",
    title: "Sword Art Online",
    arabicTitle: "ساو - الرواية الأصلية",
    author: "ريكي كاواهارا",
    category: "SAO",
    type: "رواية خفيفة",
    volumes: 28,
    status: "مكتمل",
    rating: 9.6,
    popularity: "عالية جداً",
    genre: ["إيسيكاي", "أكشن", "رومانسي", "مغامرة"],
    description: "الرواية الأصلية التي بدأت كل شيء. كيريتو وأسونا في عالم ساو الافتراضي الخطير.",
    readTime: "50 ساعة",
    year: 2009,
    language: "عربي",
    ageRating: "13+",
    route: "/sao"
  },
  {
    id: "sao-prog-1", 
    title: "SAO Progressive",
    arabicTitle: "ساو التدريجي",
    author: "ريكي كاواهارا",
    category: "SAO",
    type: "رواية خفيفة",
    volumes: 8,
    status: "مستمر",
    rating: 9.4,
    popularity: "عالية",
    genre: ["إيسيكاي", "أكشن", "رومانسي", "مفصل"],
    description: "نفس قصة ساو ولكن بتفاصيل أكثر ومن منظور أسونا. كل طابق بتفاصيل مذهلة.",
    readTime: "25 ساعة",
    year: 2012,
    language: "عربي",
    ageRating: "13+",
    route: "/progressive"
  },
  
  // Light Novels
  {
    id: "ln-1",
    title: "Re:Zero",
    arabicTitle: "ري:زيرو - بداية الحياة في عالم آخر",
    author: "تابيي ناغاتسوكي",
    category: "روايات خفيفة",
    type: "رواية خفيفة",
    volumes: 33,
    status: "مستمر",
    rating: 9.4,
    popularity: "عالية جداً",
    genre: ["إيسيكاي", "نفسي", "رومانسي", "دراما"],
    description: "سوبارو ناتسوكي ينتقل إلى عالم فانتازي ويكتشف أن لديه قدرة على العودة من الموت.",
    readTime: "45 ساعة",
    year: 2014,
    language: "عربي",
    ageRating: "17+",
    route: "/light-novels"
  },
  {
    id: "ln-2",
    title: "Overlord",
    arabicTitle: "أوفرلورد",
    author: "كوغاني ماروياما",
    category: "روايات خفيفة", 
    type: "رواية خفيفة",
    volumes: 16,
    status: "مستمر",
    rating: 9.1,
    popularity: "عالية",
    genre: ["إيسيكاي", "أكشن", "كوميدي", "فانتازي"],
    description: "لاعب يجد نفسه محاصراً في لعبة MMO كسيد الظلام مومونغا.",
    readTime: "30 ساعة",
    year: 2012,
    language: "عربي",
    ageRating: "16+",
    route: "/light-novels"
  },
  
  // Anime Works
  {
    id: "anime-1",
    title: "Attack on Titan",
    arabicTitle: "هجوم العمالقة",
    author: "هاجيمه إيساياما",
    category: "أنمي ومانجا",
    type: "مانجا",
    volumes: 34,
    status: "مكتمل",
    rating: 9.5,
    popularity: "عالية جداً",
    genre: ["أكشن", "دراما", "خيال", "إثارة"],
    description: "البشرية محاصرة خلف جدران عملاقة من العمالقة المرعبين.",
    readTime: "25 ساعة",
    year: 2009,
    language: "عربي",
    ageRating: "17+",
    route: "/anime-works"
  },
  {
    id: "anime-2",
    title: "Death Note",
    arabicTitle: "مذكرة الموت",
    author: "تسوغومي أوبا",
    category: "أنمي ومانجا",
    type: "مانجا",
    volumes: 12,
    status: "مكتمل",
    rating: 9.8,
    popularity: "عالية جداً",
    genre: ["إثارة", "نفسي", "خارق للطبيعة"],
    description: "قصة طالب عبقري يحصل على دفتر غامض له القدرة على قتل أي شخص.",
    readTime: "8 ساعات",
    year: 2003,
    language: "عربي",
    ageRating: "17+",
    route: "/anime-works"
  },
  
  // Classic Literature
  {
    id: "classic-1",
    title: "Norwegian Wood",
    arabicTitle: "الغابة النرويجية",
    author: "موراكامي هاروكي",
    category: "أدب كلاسيكي",
    type: "رواية",
    volumes: 1,
    status: "مكتمل",
    rating: 9.0,
    popularity: "عالية",
    genre: ["أدب معاصر", "رومانسي", "درامي"],
    description: "قصة حب معقدة في اليابان في الستينات.",
    readTime: "7 ساعات",
    year: 1987,
    language: "عربي",
    ageRating: "16+",
    route: "/classic-literature"
  },
  {
    id: "classic-2",
    title: "No Longer Human",
    arabicTitle: "لم أعد إنساناً",
    author: "دازاي أوسامو",
    category: "أدب كلاسيكي",
    type: "رواية",
    volumes: 1,
    status: "مكتمل",
    rating: 9.1,
    popularity: "متوسطة",
    genre: ["أدب كلاسيكي", "نفسي", "سيرة ذاتية"],
    description: "عمل أدبي ياباني مؤثر يحكي قصة رجل يشعر بالاغتراب التام عن المجتمع.",
    readTime: "4 ساعات",
    year: 1948,
    language: "عربي",
    ageRating: "18+",
    route: "/classic-literature"
  }
];

export default function AllWorksLibrary() {
  const navigate = useNavigate();
  const [filteredWorks, setFilteredWorks] = useState(allWorks);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [sortBy, setSortBy] = useState("rating");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // استخراج الفئات والأنواع
  const allCategories = Array.from(new Set(allWorks.map(work => work.category)));
  const allGenres = Array.from(new Set(allWorks.flatMap(work => work.genre)));
  const allStatuses = Array.from(new Set(allWorks.map(work => work.status)));

  // تصفية الأعمال
  useEffect(() => {
    let filtered = allWorks;

    // تصفية حسب البحث
    if (searchTerm) {
      filtered = filtered.filter(work => 
        work.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        work.arabicTitle.includes(searchTerm) ||
        work.author.includes(searchTerm) ||
        work.category.includes(searchTerm)
      );
    }

    // تصفية حسب الفئة
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(work => 
        selectedCategories.includes(work.category)
      );
    }

    // تصفية حسب النوع
    if (selectedGenres.length > 0) {
      filtered = filtered.filter(work => 
        selectedGenres.some(genre => work.genre.includes(genre))
      );
    }

    // تصفية حسب الحالة
    if (selectedStatus) {
      filtered = filtered.filter(work => work.status === selectedStatus);
    }

    // ترتيب النتائج
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "rating":
          return b.rating - a.rating;
        case "title":
          return a.title.localeCompare(b.title);
        case "year":
          return b.year - a.year;
        case "popularity":
          const popularityOrder = { "عالية جداً": 4, "عالية": 3, "متوسطة": 2, "منخفضة": 1 };
          return (popularityOrder[b.popularity as keyof typeof popularityOrder] || 0) - 
                 (popularityOrder[a.popularity as keyof typeof popularityOrder] || 0);
        default:
          return 0;
      }
    });

    setFilteredWorks(filtered);
  }, [searchTerm, selectedCategories, selectedGenres, selectedStatus, sortBy]);

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const toggleGenre = (genre: string) => {
    setSelectedGenres(prev => 
      prev.includes(genre) 
        ? prev.filter(g => g !== genre)
        : [...prev, genre]
    );
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "SAO": return "text-blue-400 border-blue-500/50 bg-blue-500/10";
      case "روايات خفيفة": return "text-cyan-400 border-cyan-500/50 bg-cyan-500/10";
      case "أنمي ومانجا": return "text-orange-400 border-orange-500/50 bg-orange-500/10";
      case "أدب كلاسيكي": return "text-purple-400 border-purple-500/50 bg-purple-500/10";
      default: return "text-gray-400 border-gray-500/50 bg-gray-500/10";
    }
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 9.5) return "text-gold-400";
    if (rating >= 9.0) return "text-yellow-400";
    if (rating >= 8.5) return "text-orange-400";
    return "text-gray-400";
  };

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* خلفية متحركة */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-cyan-900/20"></div>
        
        {/* جسيمات عائمة */}
        {Array.from({ length: 40 }, (_, i) => (
          <div
            key={i}
            className="absolute rounded-full animate-pulse"
            style={{
              width: `${1 + Math.random() * 3}px`,
              height: `${1 + Math.random() * 3}px`,
              background: ['#3b82f6', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b'][i % 5],
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
        <header className="border-b border-blue-500/20 bg-black/40 backdrop-blur-xl">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent mb-2">
                  📚 المكتبة الشاملة 
                </h1>
                <p className="text-gray-400">جميع الأعمال الأدبية في مكان واحد</p>
              </div>
              
              <div className="flex items-center gap-4">
                <InteractiveButton
                  variant="magic"
                  onClick={() => navigate("/")}
                >
                  العودة للرئيسية
                </InteractiveButton>
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          {/* شريط البحث والتصفية المتقدم */}
          <div className="mb-8 space-y-6">
            {/* البحث الرئيسي */}
            <div className="relative max-w-3xl mx-auto">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="ابحث في جميع الأعمال (العنوان، المؤلف، الفئة)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-gray-900/50 border border-blue-500/30 rounded-lg px-12 py-4 text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 text-lg"
              />
            </div>

            {/* أدوات التحكم */}
            <div className="flex flex-wrap justify-between items-center gap-4">
              <div className="flex items-center gap-4">
                <span className="text-blue-400 font-semibold">عرض:</span>
                <div className="flex bg-gray-800/50 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-2 rounded ${viewMode === "grid" ? "bg-blue-500 text-white" : "text-gray-400"}`}
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-2 rounded ${viewMode === "list" ? "bg-blue-500 text-white" : "text-gray-400"}`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-purple-400 font-semibold">ترتيب:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-gray-900/50 border border-purple-500/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-400"
                >
                  <option value="rating">التقييم</option>
                  <option value="title">الاسم</option>
                  <option value="year">سنة النشر</option>
                  <option value="popularity">الشعبية</option>
                </select>
              </div>
            </div>

            {/* فلاتر الفئات */}
            <div className="flex flex-wrap justify-center gap-3">
              <span className="text-blue-400 font-semibold flex items-center gap-2">
                <Tags className="w-4 h-4" />
                الفئات:
              </span>
              {allCategories.map(category => (
                <button
                  key={category}
                  onClick={() => toggleCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm transition-all duration-300 border ${
                    selectedCategories.includes(category)
                      ? getCategoryColor(category)
                      : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 border-gray-600'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* فلاتر الأنواع */}
            <div className="flex flex-wrap justify-center gap-3">
              <span className="text-cyan-400 font-semibold flex items-center gap-2">
                <Filter className="w-4 h-4" />
                الأنواع:
              </span>
              {allGenres.slice(0, 10).map(genre => (
                <button
                  key={genre}
                  onClick={() => toggleGenre(genre)}
                  className={`px-3 py-1 rounded-full text-sm transition-all duration-300 ${
                    selectedGenres.includes(genre)
                      ? 'bg-cyan-500 text-white'
                      : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50'
                  }`}
                >
                  {genre}
                </button>
              ))}
            </div>

            {/* فلتر الحالة */}
            <div className="flex flex-wrap justify-center gap-3">
              <span className="text-green-400 font-semibold">الحالة:</span>
              {allStatuses.map(status => (
                <button
                  key={status}
                  onClick={() => setSelectedStatus(selectedStatus === status ? "" : status)}
                  className={`px-4 py-2 rounded-full text-sm transition-all duration-300 ${
                    selectedStatus === status
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {/* إحصائيات */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8 max-w-5xl mx-auto">
            <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-400">{filteredWorks.length}</div>
              <div className="text-gray-400 text-sm">عمل متاح</div>
            </div>
            <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-purple-400">
                {filteredWorks.reduce((sum, work) => sum + work.volumes, 0)}
              </div>
              <div className="text-gray-400 text-sm">مجلد</div>
            </div>
            <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-cyan-400">
                {(filteredWorks.reduce((sum, work) => sum + work.rating, 0) / filteredWorks.length).toFixed(1)}
              </div>
              <div className="text-gray-400 text-sm">متوسط التقييم</div>
            </div>
            <div className="bg-gradient-to-r from-green-500/10 to-teal-500/10 border border-green-500/30 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-400">
                {allCategories.length}
              </div>
              <div className="text-gray-400 text-sm">فئة</div>
            </div>
            <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/30 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-orange-400">
                {Math.round(filteredWorks.reduce((sum, work) => sum + parseInt(work.readTime), 0))}
              </div>
              <div className="text-gray-400 text-sm">ساعة قراءة</div>
            </div>
          </div>

          {/* قائمة الأعمال */}
          <div className={`${viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" : "space-y-4"}`}>
            {filteredWorks.map((work) => (
              <InteractiveCard
                key={work.id}
                className={`bg-gradient-to-br from-gray-900/50 to-gray-800/50 border border-blue-500/30 backdrop-blur-xl hover:border-blue-400/50 transition-all duration-500 group relative overflow-hidden ${
                  viewMode === "list" ? "flex items-center p-4" : ""
                }`}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                
                {viewMode === "grid" ? (
                  <>
                    <CardHeader className="relative z-10">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <CardTitle className="text-xl text-blue-400 mb-2 group-hover:text-blue-300 transition-colors">
                            {work.arabicTitle}
                          </CardTitle>
                          <CardDescription className="text-gray-300 text-sm">
                            {work.title} • {work.author}
                          </CardDescription>
                        </div>
                        
                        <div className="flex flex-col items-end gap-2">
                          <div className="flex items-center gap-1 bg-yellow-500/20 px-2 py-1 rounded-full">
                            <Star className="w-4 h-4 text-yellow-400" />
                            <span className={`text-sm font-bold ${getRatingColor(work.rating)}`}>{work.rating}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-4">
                        <Badge className={getCategoryColor(work.category)}>
                          {work.category}
                        </Badge>
                        {work.genre.slice(0, 2).map((genre) => (
                          <Badge
                            key={genre}
                            variant="secondary"
                            className="bg-cyan-500/20 text-cyan-300 border-cyan-500/50 text-xs"
                          >
                            {genre}
                          </Badge>
                        ))}
                      </div>
                    </CardHeader>

                    <CardContent className="relative z-10">
                      <p className="text-gray-300 mb-4 leading-relaxed text-sm">
                        {work.description}
                      </p>

                      <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                        <div className="flex items-center gap-2 text-gray-400">
                          <BookOpen className="w-4 h-4" />
                          <span>{work.volumes} مجلد</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-400">
                          <Clock className="w-4 h-4" />
                          <span>{work.readTime}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-400">
                          <Calendar className="w-4 h-4" />
                          <span>{work.year}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-400">
                          <Eye className="w-4 h-4" />
                          <span>{work.ageRating}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mb-4">
                        <Badge
                          className={`${
                            work.status === "مكتمل" 
                              ? "bg-green-500/20 text-green-300 border-green-500/50"
                              : "bg-blue-500/20 text-blue-300 border-blue-500/50"
                          }`}
                        >
                          {work.status}
                        </Badge>
                        
                        <Badge variant="outline" className="border-gray-500/50 text-gray-300 text-xs">
                          {work.type}
                        </Badge>
                      </div>

                      <InteractiveButton
                        variant="magic"
                        className="w-full group-hover:scale-105 transition-all duration-300"
                        onClick={() => navigate(work.route)}
                      >
                        <Play className="w-4 h-4 mr-2" />
                        ابدأ القراءة
                      </InteractiveButton>
                    </CardContent>
                  </>
                ) : (
                  <div className="flex-1 flex items-center gap-6">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-blue-400 mb-1">{work.arabicTitle}</h3>
                      <p className="text-gray-300 text-sm mb-2">{work.title} • {work.author}</p>
                      <div className="flex items-center gap-4">
                        <Badge className={getCategoryColor(work.category)}>{work.category}</Badge>
                        <span className="text-gray-400 text-sm">{work.volumes} مجلد</span>
                        <span className="text-gray-400 text-sm">{work.readTime}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 mb-2">
                        <Star className="w-4 h-4 text-yellow-400" />
                        <span className={`font-bold ${getRatingColor(work.rating)}`}>{work.rating}</span>
                      </div>
                      <Button
                        variant="outline"
                        className="border-blue-500 text-blue-300 hover:bg-blue-500/10"
                        onClick={() => navigate(work.route)}
                      >
                        <Play className="w-4 h-4 mr-2" />
                        قراءة
                      </Button>
                    </div>
                  </div>
                )}
              </InteractiveCard>
            ))}
          </div>

          {/* رسالة عدم وجود نتائج */}
          {filteredWorks.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-2xl font-bold text-gray-400 mb-2">لا توجد نتائج</h3>
              <p className="text-gray-500">جرب البحث بكلمات مختلفة أو قم بتغيير المرشحات</p>
              <Button
                variant="outline"
                className="mt-4 border-blue-500 text-blue-300 hover:bg-blue-500/10"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategories([]);
                  setSelectedGenres([]);
                  setSelectedStatus("");
                }}
              >
                إعادة تعيين المرشحات
              </Button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
