// قاعدة بيانات أعمال PDF - MrPheonixX Collection
export interface PDFWork {
  id: string;
  fileName: string;
  series: string;
  titleEn: string;
  titleAr: string;
  pdfUrlRaw: string;
  backgroundImage?: string;
  volumeNumber?: number;
  arc?: string;
  description?: string;
  publishYear?: number;
  pages?: number;
  rating?: number;
  status: 'available' | 'coming_soon' | 'reading';
  readProgress?: number;
  lastRead?: string;
  coverColor?: string;
  tags?: string[];
}

export const pdfWorks: PDFWork[] = [
  // Other Works
  {
    id: "no-longer-human-dazai",
    fileName: "No_Longer_Human_Dazai_Osamu_ar.pdf",
    series: "Other",
    titleEn: "No Longer Human - Dazai Osamu ar",
    titleAr: "لم أعد إنسانًا - دازاي أوسامو",
    pdfUrlRaw: "https://raw.githubusercontent.com/MrPheonixX/My-Works-PDF-/main/No_Longer_Human_Dazai_Osamu_ar.pdf",
    backgroundImage: null,
    description: "رواية كلاسيكية عن الألم النفسي والانعزال الاجتماعي",
    publishYear: 1948,
    pages: 180,
    rating: 9.2,
    status: 'available',
    readProgress: 0,
    coverColor: "from-gray-700 to-gray-900",
    tags: ["أدب ياباني", "فلسفي", "نفسي", "كلاسيكي"]
  },

  {
    id: "welcome-to-nhk",
    fileName: "Welcome_To_The_NHK_ar.pdf",
    series: "Welcome to the NHK",
    titleEn: "Welcome To The NHK ar",
    titleAr: "مرحبًا بك في NHK",
    pdfUrlRaw: "https://raw.githubusercontent.com/MrPheonixX/My-Works-PDF-/main/Welcome_To_The_NHK_ar.pdf",
    backgroundImage: null,
    description: "قصة مؤثرة عن الانطوائية والمشاكل الاجتماعية في اليابان الحديثة",
    publishYear: 2002,
    pages: 320,
    rating: 8.8,
    status: 'available',
    readProgress: 0,
    coverColor: "from-blue-600 to-purple-600",
    tags: ["دراما", "اجتماعي", "نفسي", "حديث"]
  },

  // Sword Art Online Main Series - Aincrad Arc
  {
    id: "sao-vol-01-aincrad",
    fileName: "Sword_Art_Online_Volume_01_Aincrad.pdf",
    series: "Sword Art Online",
    titleEn: "Sword Art Online - Volume 01 - Aincrad",
    titleAr: "فن السيف عبر الإنترنت - المجلد 01 - آينكراد",
    pdfUrlRaw: "https://raw.githubusercontent.com/MrPheonixX/My-Works-PDF-/main/Sword_Art_Online_Volume_01_Aincrad.pdf",
    backgroundImage: null,
    volumeNumber: 1,
    arc: "Aincrad",
    description: "بداية مغامرة كيريتو في عالم ساو الافتراضي المميت",
    publishYear: 2009,
    pages: 280,
    rating: 9.5,
    status: 'available',
    readProgress: 0,
    coverColor: "from-blue-500 to-cyan-500",
    tags: ["أكشن", "مغامرة", "خيال علمي", "رومانسي"]
  },

  {
    id: "sao-vol-02-aincrad",
    fileName: "Sword_Art_Online_Volume_02_Aincrad.pdf",
    series: "Sword Art Online",
    titleEn: "Sword Art Online - Volume 02 - Aincrad",
    titleAr: "فن السيف عبر الإنترنت - المجلد 02 - آينكراد",
    pdfUrlRaw: "https://raw.githubusercontent.com/MrPheonixX/My-Works-PDF-/main/Sword_Art_Online_Volume_02_Aincrad.pdf",
    backgroundImage: null,
    volumeNumber: 2,
    arc: "Aincrad",
    description: "استمرار مغامرات كيريتو وأسونا في طوابق آينكراد",
    publishYear: 2009,
    pages: 260,
    rating: 9.3,
    status: 'available',
    readProgress: 0,
    coverColor: "from-blue-500 to-cyan-500",
    tags: ["أكشن", "مغامرة", "خيال علمي", "رومانسي"]
  },

  // Fairy Dance Arc
  {
    id: "sao-vol-03-fairy-dance",
    fileName: "Sword_Art_Online_Volume_03_Fairy_Dance.pdf",
    series: "Sword Art Online",
    titleEn: "Sword Art Online - Volume 03 - Fairy Dance",
    titleAr: "فن السيف عبر الإنترنت - المجلد 03 - رقصة الجنيات",
    pdfUrlRaw: "https://raw.githubusercontent.com/MrPheonixX/My-Works-PDF-/main/Sword_Art_Online_Volume_03_Fairy_Dance.pdf",
    backgroundImage: null,
    volumeNumber: 3,
    arc: "Fairy Dance",
    description: "كيريتو يدخل عالم ALO لإنقاذ أسونا المحتجزة",
    publishYear: 2010,
    pages: 290,
    rating: 8.9,
    status: 'available',
    readProgress: 0,
    coverColor: "from-green-500 to-emerald-500",
    tags: ["أكشن", "مغامرة", "خيال", "إنقاذ"]
  },

  {
    id: "sao-vol-04-fairy-dance",
    fileName: "Sword_Art_Online_Volume_04_Fairy_Dance.pdf",
    series: "Sword Art Online",
    titleEn: "Sword Art Online - Volume 04 - Fairy Dance",
    titleAr: "فن السيف عبر الإنترنت - المجلد 04 - رقصة الجنيات",
    pdfUrlRaw: "https://raw.githubusercontent.com/MrPheonixX/My-Works-PDF-/main/Sword_Art_Online_Volume_04_Fairy_Dance.pdf",
    backgroundImage: null,
    volumeNumber: 4,
    arc: "Fairy Dance",
    description: "نهاية ملحمة إنقاذ أسونا ولم الشمل",
    publishYear: 2010,
    pages: 280,
    rating: 9.1,
    status: 'available',
    readProgress: 0,
    coverColor: "from-green-500 to-emerald-500",
    tags: ["أكشن", "مغامرة", "خيال", "إنقاذ"]
  },

  // Phantom Bullet Arc
  {
    id: "sao-vol-05-phantom-bullet",
    fileName: "Sword_Art_Online_Volume_05_Phantom_Bullet.pdf",
    series: "Sword Art Online",
    titleEn: "Sword Art Online - Volume 05 - Phantom Bullet",
    titleAr: "فن السيف عبر الإنترنت - المجلد 05 - رصاصة الشبح",
    pdfUrlRaw: "https://raw.githubusercontent.com/MrPheonixX/My-Works-PDF-/main/Sword_Art_Online_Volume_05_Phantom_Bullet.pdf",
    backgroundImage: null,
    volumeNumber: 5,
    arc: "Phantom Bullet",
    description: "كيريتو يدخل عالم GGO لحل لغز القاتل الغامض",
    publishYear: 2011,
    pages: 300,
    rating: 9.0,
    status: 'available',
    readProgress: 0,
    coverColor: "from-red-500 to-orange-500",
    tags: ["أكشن", "إثارة", "غموض", "أسلحة"]
  },

  {
    id: "sao-vol-06-phantom-bullet",
    fileName: "Sword_Art_Online_Volume_06_Phantom_Bullet.pdf",
    series: "Sword Art Online",
    titleEn: "Sword Art Online - Volume 06 - Phantom Bullet",
    titleAr: "فن السيف عبر الإنترنت - المجلد 06 - رصاصة الشبح",
    pdfUrlRaw: "https://raw.githubusercontent.com/MrPheonixX/My-Works-PDF-/main/Sword_Art_Online_Volume_06_Phantom_Bullet.pdf",
    backgroundImage: null,
    volumeNumber: 6,
    arc: "Phantom Bullet",
    description: "المواجهة النهائية مع Death Gun ولقاء سينون",
    publishYear: 2011,
    pages: 290,
    rating: 9.2,
    status: 'available',
    readProgress: 0,
    coverColor: "from-red-500 to-orange-500",
    tags: ["أكشن", "إثارة", "غموض", "أسلحة"]
  },

  // Mother's Rosario Arc
  {
    id: "sao-vol-07-mothers-rosario",
    fileName: "Sword_Art_Online_Volume_07_Mothers_Rosario.pdf",
    series: "Sword Art Online",
    titleEn: "Sword Art Online - Volume 07 - Mother's Rosario",
    titleAr: "فن السيف عبر الإنترنت - المجلد 07 - وردية الأم",
    pdfUrlRaw: "https://raw.githubusercontent.com/MrPheonixX/My-Works-PDF-/main/Sword_Art_Online_Volume_07_Mother's_Rosario.pdf",
    backgroundImage: null,
    volumeNumber: 7,
    arc: "Mother's Rosario",
    description: "قصة أسونا المؤثرة مع يوكي والكلمة الأخيرة",
    publishYear: 2012,
    pages: 270,
    rating: 9.8,
    status: 'available',
    readProgress: 0,
    coverColor: "from-pink-500 to-rose-500",
    tags: ["دراما", "مؤثر", "صداقة", "تضحية"]
  },

  // Early and Late
  {
    id: "sao-vol-08-early-late",
    fileName: "Sword_Art_Online_Volume_08_Early_and_Late.pdf",
    series: "Sword Art Online",
    titleEn: "Sword Art Online - Volume 08 - Early and Late",
    titleAr: "فن السيف عبر الإنترنت - المجلد 08 - مبكر ومتأخر",
    pdfUrlRaw: "https://raw.githubusercontent.com/MrPheonixX/My-Works-PDF-/main/Sword_Art_Online_Volume_08_Early_and_Late.pdf",
    backgroundImage: null,
    volumeNumber: 8,
    arc: "Side Stories",
    description: "قصص جانبية من مختلف العوالم الافتراضية",
    publishYear: 2013,
    pages: 260,
    rating: 8.7,
    status: 'available',
    readProgress: 0,
    coverColor: "from-purple-500 to-indigo-500",
    tags: ["قصص جانبية", "متنوع", "مغامرة"]
  },

  // Alicization Arc
  {
    id: "sao-vol-09-alicization-beginning",
    fileName: "Sword_Art_Online_Volume_09_Alicization_Beginning.pdf",
    series: "Sword Art Online",
    titleEn: "Sword Art Online - Volume 09 - Alicization Beginning",
    titleAr: "فن السيف عبر الإنترنت - المجلد 09 - بداية أليسيزيشن",
    pdfUrlRaw: "https://raw.githubusercontent.com/MrPheonixX/My-Works-PDF-/main/Sword_Art_Online_Volume_09_Alicization_Beginning.pdf",
    backgroundImage: null,
    volumeNumber: 9,
    arc: "Alicization",
    description: "بداية أطول وأعظم قوس في ساو - عالم أندرورلد",
    publishYear: 2014,
    pages: 350,
    rating: 9.6,
    status: 'available',
    readProgress: 0,
    coverColor: "from-violet-500 to-purple-500",
    tags: ["خيال علمي", "ذكاء اصطناعي", "مغامرة عظيمة"]
  },

  {
    id: "sao-vol-10-alicization-running",
    fileName: "Sword_Art_Online_Volume_10_Alicization_Running.pdf",
    series: "Sword Art Online",
    titleEn: "Sword Art Online - Volume 10 - Alicization Running",
    titleAr: "فن السيف عبر الإنترنت - المجلد 10 - أليسيزيش�� الجارية",
    pdfUrlRaw: "https://raw.githubusercontent.com/MrPheonixX/My-Works-PDF-/main/Sword_Art_Online_Volume_10_Alicization_Running.pdf",
    backgroundImage: null,
    volumeNumber: 10,
    arc: "Alicization",
    description: "كيريتو يكتشف أسرار أندرورلد ويلتقي يوجيو",
    publishYear: 2014,
    pages: 330,
    rating: 9.4,
    status: 'available',
    readProgress: 0,
    coverColor: "from-violet-500 to-purple-500",
    tags: ["خيال علمي", "ذكاء اصطناعي", "صداقة"]
  },

  {
    id: "sao-vol-11-alicization-turning",
    fileName: "Sword_Art_Online_Volume_11_Alicization_Turning.pdf",
    series: "Sword Art Online",
    titleEn: "Sword Art Online - Volume 11 - Alicization Turning",
    titleAr: "فن السيف عبر الإنترنت - المجلد 11 - تحول أليسيزيشن",
    pdfUrlRaw: "https://raw.githubusercontent.com/MrPheonixX/My-Works-PDF-/main/Sword_Art_Online_Volume_11_Alicization_Turning.pdf",
    backgroundImage: null,
    volumeNumber: 11,
    arc: "Alicization",
    description: "نقطة تحول مهمة في رحلة كيريتو وأليس",
    publishYear: 2015,
    pages: 340,
    rating: 9.5,
    status: 'available',
    readProgress: 0,
    coverColor: "from-violet-500 to-purple-500",
    tags: ["تطور الشخصيات", "أكشن", "دراما"]
  },

  {
    id: "sao-vol-12-alicization-rising",
    fileName: "Sword_Art_Online_Volume_12_Alicization_Rising.pdf",
    series: "Sword Art Online",
    titleEn: "Sword Art Online - Volume 12 - Alicization Rising",
    titleAr: "فن السيف عبر الإنترنت - المجلد 12 - صعود أليسيزيشن",
    pdfUrlRaw: "https://raw.githubusercontent.com/MrPheonixX/My-Works-PDF-/main/Sword_Art_Online_Volume_12_Alicization_Rising.pdf",
    backgroundImage: null,
    volumeNumber: 12,
    arc: "Alicization",
    description: "صعود كيريتو وأليس لمواجهة التحديات الكبرى",
    publishYear: 2015,
    pages: 360,
    rating: 9.3,
    status: 'available',
    readProgress: 0,
    coverColor: "from-violet-500 to-purple-500",
    tags: ["أكشن مكثف", "تضحية", "بطولة"]
  },

  {
    id: "sao-vol-13-alicization-dividing",
    fileName: "Sword_Art_Online_Volume_13_Alicization_Dividing.pdf",
    series: "Sword Art Online",
    titleEn: "Sword Art Online - Volume 13 - Alicization Dividing",
    titleAr: "فن السيف عبر الإنترنت - المجلد 13 - تقسيم أليسيزيشن",
    pdfUrlRaw: "https://raw.githubusercontent.com/MrPheonixX/My-Works-PDF-/main/Sword_Art_Online_Volume_13_Alicization_Dividing.pdf",
    backgroundImage: null,
    volumeNumber: 13,
    arc: "Alicization",
    description: "انقسام الطرق والاختيارات الصعبة",
    publishYear: 2016,
    pages: 370,
    rating: 9.1,
    status: 'available',
    readProgress: 0,
    coverColor: "from-violet-500 to-purple-500",
    tags: ["تعقيد", "خيارات صعبة", "أكشن"]
  },

  {
    id: "sao-vol-14-alicization-uniting",
    fileName: "Sword_Art_Online_Volume_14_Alicization_Uniting.pdf",
    series: "Sword Art Online",
    titleEn: "Sword Art Online - Volume 14 - Alicization Uniting",
    titleAr: "فن السيف عبر الإنترنت - المجلد 14 - توحيد أليسيزيشن",
    pdfUrlRaw: "https://raw.githubusercontent.com/MrPheonixX/My-Works-PDF-/main/Sword_Art_Online_Volume_14_Alicization_Uniting.pdf",
    backgroundImage: null,
    volumeNumber: 14,
    arc: "Alicization",
    description: "توحيد القوى لمواجهة الخطر الأعظم",
    publishYear: 2016,
    pages: 380,
    rating: 9.4,
    status: 'available',
    readProgress: 0,
    coverColor: "from-violet-500 to-purple-500",
    tags: ["وحدة", "قوة", "��حالف"]
  },

  {
    id: "sao-vol-15-alicization-invading",
    fileName: "Sword_Art_Online_Volume_15_Alicization_Invading.pdf",
    series: "Sword Art Online",
    titleEn: "Sword Art Online - Volume 15 - Alicization Invading",
    titleAr: "فن السيف عبر الإنترنت - المجلد 15 - غزو أليسيزيشن",
    pdfUrlRaw: "https://raw.githubusercontent.com/MrPheonixX/My-Works-PDF-/main/Sword_Art_Online_Volume_15_Alicization_Invading.pdf",
    backgroundImage: null,
    volumeNumber: 15,
    arc: "Alicization",
    description: "الغزو الأمريكي لأندرورلد ودخول اللاعبين",
    publishYear: 2017,
    pages: 400,
    rating: 9.6,
    status: 'available',
    readProgress: 0,
    coverColor: "from-violet-500 to-purple-500",
    tags: ["حرب", "غزو", "صراع كبير"]
  },

  {
    id: "sao-vol-16-alicization-exploding",
    fileName: "Sword_Art_Online_Volume_16_Alicization_Exploding.pdf",
    series: "Sword Art Online",
    titleEn: "Sword Art Online - Volume 16 - Alicization Exploding",
    titleAr: "فن السيف عبر الإنترنت - المجلد 16 - انفجار أليسيزيشن",
    pdfUrlRaw: "https://raw.githubusercontent.com/MrPheonixX/My-Works-PDF-/main/Sword_Art_Online_Volume_16_Alicization_Exploding.pdf",
    backgroundImage: null,
    volumeNumber: 16,
    arc: "Alicization",
    description: "الأحداث تنفجر والمعارك تشتعل",
    publishYear: 2017,
    pages: 390,
    rating: 9.5,
    status: 'available',
    readProgress: 0,
    coverColor: "from-violet-500 to-purple-500",
    tags: ["معارك ملحمية", "انفجار أحداث", "إثارة"]
  },

  {
    id: "sao-vol-17-alicization-awakening",
    fileName: "Sword_Art_Online_Volume_17_Alicization_Awakening.pdf",
    series: "Sword Art Online",
    titleEn: "Sword Art Online - Volume 17 - Alicization Awakening",
    titleAr: "فن السيف عبر الإنترنت - المجلد 17 - استيقاظ أليسيزيشن",
    pdfUrlRaw: "https://raw.githubusercontent.com/MrPheonixX/My-Works-PDF-/main/Sword_Art_Online_Volume_17_Alicization_Awakening.pdf",
    backgroundImage: null,
    volumeNumber: 17,
    arc: "Alicization",
    description: "استيقاظ كيريتو وقوته الحقيقية",
    publishYear: 2018,
    pages: 410,
    rating: 9.8,
    status: 'available',
    readProgress: 0,
    coverColor: "from-violet-500 to-purple-500",
    tags: ["استيقاظ", "قوة مطلقة", "ملحمي"]
  },

  {
    id: "sao-vol-18-alicization-lasting",
    fileName: "Sword_Art_Online_Volume_18_Alicization_Lasting.pdf",
    series: "Sword Art Online",
    titleEn: "Sword Art Online - Volume 18 - Alicization Lasting",
    titleAr: "فن السيف عبر الإنترنت - المجلد 18 - استمرار أليسيزيشن",
    pdfUrlRaw: "https://raw.githubusercontent.com/MrPheonixX/My-Works-PDF-/main/Sword_Art_Online_Volume_18_Alicization_Lasting.pdf",
    backgroundImage: null,
    volumeNumber: 18,
    arc: "Alicization",
    description: "نهاية قوس أليسيزيشن العظيم",
    publishYear: 2018,
    pages: 380,
    rating: 9.7,
    status: 'available',
    readProgress: 0,
    coverColor: "from-violet-500 to-purple-500",
    tags: ["نهاية عظيمة", "إنجاز", "تخرج"]
  },

  // Moon Cradle Arc
  {
    id: "sao-vol-19-moon-cradle",
    fileName: "Sword_Art_Online_Volume_19_Moon_Cradle.pdf",
    series: "Sword Art Online",
    titleEn: "Sword Art Online - Volume 19 - Moon Cradle",
    titleAr: "فن السيف عبر الإنترنت - المجلد 19 - مهد القمر",
    pdfUrlRaw: "https://raw.githubusercontent.com/MrPheonixX/My-Works-PDF-/main/Sword_Art_Online_Volume_19_Moon_Cradle.pdf",
    backgroundImage: null,
    volumeNumber: 19,
    arc: "Moon Cradle",
    description: "قصة أليس وكيريتو في أندرورلد بعد الحرب",
    publishYear: 2019,
    pages: 320,
    rating: 9.0,
    status: 'available',
    readProgress: 0,
    coverColor: "from-indigo-500 to-blue-500",
    tags: ["استكشاف", "علاقات", "هدوء بعد العاصفة"]
  },

  {
    id: "sao-vol-20-moon-cradle",
    fileName: "Sword_Art_Online_Volume_20_Moon_Cradle.pdf",
    series: "Sword Art Online",
    titleEn: "Sword Art Online - Volume 20 - Moon Cradle",
    titleAr: "فن السيف عبر الإنترنت - المجلد 20 - مهد القمر",
    pdfUrlRaw: "https://raw.githubusercontent.com/MrPheonixX/My-Works-PDF-/main/Sword_Art_Online_Volume_20_Moon_Cradle.pdf",
    backgroundImage: null,
    volumeNumber: 20,
    arc: "Moon Cradle",
    description: "تكملة رحلة أليس واكتشاف عالم جديد",
    publishYear: 2019,
    pages: 310,
    rating: 8.9,
    status: 'available',
    readProgress: 0,
    coverColor: "from-indigo-500 to-blue-500",
    tags: ["مغامرة هادئة", "تطور", "اكتشاف"]
  },

  // Unital Ring Arc
  {
    id: "sao-vol-21-unital-ring-1",
    fileName: "Sword_Art_Online_Volume_21_Unital_Ring_I.pdf",
    series: "Sword Art Online",
    titleEn: "Sword Art Online - Volume 21 - Unital Ring I",
    titleAr: "فن السيف عبر الإنترنت - المجلد 21 - حلقة يونيتال 1",
    pdfUrlRaw: "https://raw.githubusercontent.com/MrPheonixX/My-Works-PDF-/main/Sword_Art_Online_Volume_21_Unital_Ring_I.pdf",
    backgroundImage: null,
    volumeNumber: 21,
    arc: "Unital Ring",
    description: "بداية قوس جديد مع عودة جميع العوالم الافتراضية",
    publishYear: 2020,
    pages: 350,
    rating: 9.2,
    status: 'available',
    readProgress: 0,
    coverColor: "from-emerald-500 to-teal-500",
    tags: ["عودة", "توحيد العوالم", "مغامرة جديدة"]
  },

  // Kiss and Fly
  {
    id: "sao-vol-22-kiss-fly",
    fileName: "Sword_Art_Online_Volume_22_Kiss_and_Fly.pdf",
    series: "Sword Art Online",
    titleEn: "Sword Art Online - Volume 22 - Kiss and Fly",
    titleAr: "فن السيف عبر الإنترنت - المجلد 22 - القبلة والطيران",
    pdfUrlRaw: "https://raw.githubusercontent.com/MrPheonixX/My-Works-PDF-/main/Sword_Art_Online_Volume_22_Kiss_and_Fly.pdf",
    backgroundImage: null,
    volumeNumber: 22,
    arc: "Side Stories",
    description: "قصص جانبية رومانسية ومؤثرة",
    publishYear: 2020,
    pages: 280,
    rating: 8.8,
    status: 'available',
    readProgress: 0,
    coverColor: "from-pink-500 to-red-500",
    tags: ["رومانسي", "قصص ��انبية", "مؤثر"]
  },

  // Unital Ring Continued
  {
    id: "sao-vol-23-unital-ring-2",
    fileName: "Sword_Art_Online_Volume_23_Unital_Ring_II.pdf",
    series: "Sword Art Online",
    titleEn: "Sword Art Online - Volume 23 - Unital Ring II",
    titleAr: "فن السيف عبر الإنترنت - المجلد 23 - حلقة يونيتال 2",
    pdfUrlRaw: "https://raw.githubusercontent.com/MrPheonixX/My-Works-PDF-/main/Sword_Art_Online_Volume_23_Unital_Ring_II.pdf",
    backgroundImage: null,
    volumeNumber: 23,
    arc: "Unital Ring",
    description: "تطور أحداث حلقة يونيتال والتحديات الجديدة",
    publishYear: 2021,
    pages: 340,
    rating: 9.1,
    status: 'available',
    readProgress: 0,
    coverColor: "from-emerald-500 to-teal-500",
    tags: ["تطور", "تحديات", "استراتيجية"]
  },

  {
    id: "sao-vol-24-unital-ring-3",
    fileName: "Sword_Art_Online_Volume_24_Unital_Ring_III.pdf",
    series: "Sword Art Online",
    titleEn: "Sword Art Online - Volume 24 - Unital Ring III",
    titleAr: "فن السيف عبر الإنترنت - المجلد 24 - حلقة يونيتال 3",
    pdfUrlRaw: "https://raw.githubusercontent.com/MrPheonixX/My-Works-PDF-/main/Sword_Art_Online_Volume_24_Unital_Ring_III.pdf",
    backgroundImage: null,
    volumeNumber: 24,
    arc: "Unital Ring",
    description: "استمرار مغامرات حلقة يونيتال",
    publishYear: 2021,
    pages: 330,
    rating: 9.0,
    status: 'available',
    readProgress: 0,
    coverColor: "from-emerald-500 to-teal-500",
    tags: ["استمرار", "تعاون", "مغامرة"]
  },

  {
    id: "sao-vol-25-unital-ring-4",
    fileName: "Sword_Art_Online_Volume_25_Unital_Ring_IV.pdf",
    series: "Sword Art Online",
    titleEn: "Sword Art Online - Volume 25 - Unital Ring IV",
    titleAr: "فن السيف عبر الإنترنت - المجلد 25 - حلقة يونيتال 4",
    pdfUrlRaw: "https://raw.githubusercontent.com/MrPheonixX/My-Works-PDF-/main/Sword_Art_Online_Volume_25_Unital_Ring_IV.pdf",
    backgroundImage: null,
    volumeNumber: 25,
    arc: "Unital Ring",
    description: "أحداث متصاعدة في عالم حلقة يونيتال",
    publishYear: 2022,
    pages: 360,
    rating: 9.3,
    status: 'available',
    readProgress: 0,
    coverColor: "from-emerald-500 to-teal-500",
    tags: ["تصاعد", "إثارة", "أحداث كبيرة"]
  },

  {
    id: "sao-vol-26-unital-ring-5",
    fileName: "Sword_Art_Online_Volume_26_Unital_Ring_V.pdf",
    series: "Sword Art Online",
    titleEn: "Sword Art Online - Volume 26 - Unital Ring V",
    titleAr: "فن السيف عبر الإنترنت - المجلد 26 - حلقة يونيتال 5",
    pdfUrlRaw: "https://raw.githubusercontent.com/MrPheonixX/My-Works-PDF-/main/Sword_Art_Online_Volume_26_Unital_Ring_V.pdf",
    backgroundImage: null,
    volumeNumber: 26,
    arc: "Unital Ring",
    description: "المزيد من الكشوفات والمغامرات",
    publishYear: 2022,
    pages: 350,
    rating: 9.2,
    status: 'available',
    readProgress: 0,
    coverColor: "from-emerald-500 to-teal-500",
    tags: ["كشوفات", "مغامرة متقدمة", "تطور القصة"]
  },

  {
    id: "sao-vol-27-unital-ring-6",
    fileName: "Sword_Art_Online_Volume_27_Unital_Ring_VI.pdf",
    series: "Sword Art Online",
    titleEn: "Sword Art Online - Volume 27 - Unital Ring VI",
    titleAr: "فن السيف عبر الإنترنت - المجلد 27 - حلقة يونيتال 6",
    pdfUrlRaw: "https://raw.githubusercontent.com/MrPheonixX/My-Works-PDF-/main/Sword_Art_Online_Volume_27_Unital_Ring_VI.pdf",
    backgroundImage: null,
    volumeNumber: 27,
    arc: "Unital Ring",
    description: "تعقيدات جديدة وتحديات متزايدة",
    publishYear: 2023,
    pages: 370,
    rating: 9.1,
    status: 'available',
    readProgress: 0,
    coverColor: "from-emerald-500 to-teal-500",
    tags: ["تعقيد��ت", "تحديات", "تطور"]
  },

  {
    id: "sao-vol-28-unital-ring-7",
    fileName: "Sword_Art_Online_Volume_28_Unital_Ring_VII.pdf",
    series: "Sword Art Online",
    titleEn: "Sword Art Online - Volume 28 - Unital Ring VII",
    titleAr: "فن السيف عبر الإنترنت - المجلد 28 - حلقة يونيتال 7",
    pdfUrlRaw: "https://raw.githubusercontent.com/MrPheonixX/My-Works-PDF-/main/Sword_Art_Online_Volume_28_Unital_Ring_VII.pdf",
    backgroundImage: null,
    volumeNumber: 28,
    arc: "Unital Ring",
    description: "أحدث مجلد في السلسلة الرئيسية",
    publishYear: 2023,
    pages: 380,
    rating: 9.4,
    status: 'available',
    readProgress: 0,
    coverColor: "from-emerald-500 to-teal-500",
    tags: ["أحدث", "مستمر", "متطور"]
  },

  // Progressive Series
  {
    id: "sao-progressive-vol-01",
    fileName: "Sword_Art_Online_Progressive_Volume_01_ar.pdf",
    series: "Sword Art Online Progressive",
    titleEn: "Sword Art Online - Progressive - Volume 01 ar",
    titleAr: "فن السيف عبر الإنترنت - بروغريسيف - المجلد 01",
    pdfUrlRaw: "https://raw.githubusercontent.com/MrPheonixX/My-Works-PDF-/main/Sword_Art_Online_Progressive_Volume_01_ar.pdf",
    backgroundImage: null,
    volumeNumber: 1,
    arc: "Progressive",
    description: "تفاصيل دقيقة لرحلة كيريتو وأسونا طابق بطابق",
    publishYear: 2012,
    pages: 290,
    rating: 9.4,
    status: 'available',
    readProgress: 0,
    coverColor: "from-cyan-500 to-blue-500",
    tags: ["تفصيلي", "طابق بطابق", "بداية الرحلة"]
  },

  {
    id: "sao-progressive-vol-02",
    fileName: "Sword_Art_Online_Progressive_Volume_02_ar.pdf",
    series: "Sword Art Online Progressive",
    titleEn: "Sword Art Online - Progressive - Volume 02 ar",
    titleAr: "فن السيف عبر الإنترنت - بروغريسيف - المجلد 02",
    pdfUrlRaw: "https://raw.githubusercontent.com/MrPheonixX/My-Works-PDF-/main/Sword_Art_Online_Progressive_Volume_02_ar.pdf",
    backgroundImage: null,
    volumeNumber: 2,
    arc: "Progressive",
    description: "استمرار الرحلة المفصلة في آينكراد",
    publishYear: 2013,
    pages: 280,
    rating: 9.3,
    status: 'available',
    readProgress: 0,
    coverColor: "from-cyan-500 to-blue-500",
    tags: ["استمرار", "تفاصيل", "تطور العلاقات"]
  },

  {
    id: "sao-progressive-vol-03",
    fileName: "Sword_Art_Online_Progressive_Volume_03_ar.pdf",
    series: "Sword Art Online Progressive",
    titleEn: "Sword Art Online - Progressive - Volume 03 ar",
    titleAr: "فن السيف عبر الإنترنت - بروغريسيف - المجلد 03",
    pdfUrlRaw: "https://raw.githubusercontent.com/MrPheonixX/My-Works-PDF-/main/Sword_Art_Online_Progressive_Volume_03_ar.pdf",
    backgroundImage: null,
    volumeNumber: 3,
    arc: "Progressive",
    description: "مغامرات أعمق في طوابق آينكراد",
    publishYear: 2014,
    pages: 300,
    rating: 9.2,
    status: 'available',
    readProgress: 0,
    coverColor: "from-cyan-500 to-blue-500",
    tags: ["عمق", "مغامرة", "استكشاف"]
  },

  {
    id: "sao-progressive-vol-04",
    fileName: "Sword_Art_Online_Progressive_Volume_04_ar.pdf",
    series: "Sword Art Online Progressive",
    titleEn: "Sword Art Online - Progressive - Volume 04 ar",
    titleAr: "فن السيف عبر الإنترنت - بروغريسيف - المجلد 04",
    pdfUrlRaw: "https://raw.githubusercontent.com/MrPheonixX/My-Works-PDF-/main/Sword_Art_Online_Progressive_Volume_04_ar.pdf",
    backgroundImage: null,
    volumeNumber: 4,
    arc: "Progressive",
    description: "المزيد من التفا��يل المذهلة",
    publishYear: 2015,
    pages: 310,
    rating: 9.1,
    status: 'available',
    readProgress: 0,
    coverColor: "from-cyan-500 to-blue-500",
    tags: ["تفاصيل مذهلة", "تطور", "إثارة"]
  },

  {
    id: "sao-progressive-vol-05",
    fileName: "Sword_Art_Online_Progressive_Volume_05_ar.pdf",
    series: "Sword Art Online Progressive",
    titleEn: "Sword Art Online - Progressive - Volume 05 ar",
    titleAr: "فن السيف عبر الإنترنت - بروغريسيف - المجلد 05",
    pdfUrlRaw: "https://raw.githubusercontent.com/MrPheonixX/My-Works-PDF-/main/Sword_Art_Online_Progressive_Volume_05_ar.pdf",
    backgroundImage: null,
    volumeNumber: 5,
    arc: "Progressive",
    description: "استمرار الرحلة التفصيلية الرائعة",
    publishYear: 2016,
    pages: 320,
    rating: 9.0,
    status: 'available',
    readProgress: 0,
    coverColor: "from-cyan-500 to-blue-500",
    tags: ["رحلة رائعة", "تفصيلي", "مستمر"]
  },

  {
    id: "sao-progressive-vol-06",
    fileName: "Sword_Art_Online_Progressive_Volume_06_ar.pdf",
    series: "Sword Art Online Progressive",
    titleEn: "Sword Art Online - Progressive - Volume 06 ar",
    titleAr: "فن السيف عبر الإنترنت - بروغريسيف - المجلد 06",
    pdfUrlRaw: "https://raw.githubusercontent.com/MrPheonixX/My-Works-PDF-/main/Sword_Art_Online_Progressive_Volume_06_ar.pdf",
    backgroundImage: null,
    volumeNumber: 6,
    arc: "Progressive",
    description: "تطورات مهمة في العلاقات والقصة",
    publishYear: 2017,
    pages: 330,
    rating: 9.2,
    status: 'available',
    readProgress: 0,
    coverColor: "from-cyan-500 to-blue-500",
    tags: ["تطورات مهمة", "علاقات", "قصة عميقة"]
  },

  {
    id: "sao-progressive-vol-07",
    fileName: "Sword_Art_Online_Progressive_Volume_07_ar.pdf",
    series: "Sword Art Online Progressive",
    titleEn: "Sword Art Online - Progressive - Volume 07 ar",
    titleAr: "فن السيف عبر الإنترنت - بروغريسيف - المجلد 07",
    pdfUrlRaw: "https://raw.githubusercontent.com/MrPheonixX/My-Works-PDF-/main/Sword_Art_Online_Progressive_Volume_07_ar.pdf",
    backgroundImage: null,
    volumeNumber: 7,
    arc: "Progressive",
    description: "أحداث متقدمة ومثيرة في آينكراد",
    publishYear: 2018,
    pages: 340,
    rating: 9.3,
    status: 'available',
    readProgress: 0,
    coverColor: "from-cyan-500 to-blue-500",
    tags: ["متقدم", "مثير", "آينكراد"]
  },

  {
    id: "sao-progressive-vol-08",
    fileName: "Sword_Art_Online_Progressive_Volume_08_ar.pdf",
    series: "Sword Art Online Progressive",
    titleEn: "Sword Art Online - Progressive - Volume 08 ar",
    titleAr: "فن السيف عبر الإنترنت - بروغريسيف - المجلد 08",
    pdfUrlRaw: "https://raw.githubusercontent.com/MrPheonixX/My-Works-PDF-/main/Sword_Art_Online_Progressive_Volume_08_ar.pdf",
    backgroundImage: null,
    volumeNumber: 8,
    arc: "Progressive",
    description: "أحدث مجلد في السلسلة التفصيلية",
    publishYear: 2020,
    pages: 350,
    rating: 9.4,
    status: 'available',
    readProgress: 0,
    coverColor: "from-cyan-500 to-blue-500",
    tags: ["أحدث", "تفصيلي", "متميز"]
  },

  // Side Stories Collection
  {
    id: "sao-side-stories",
    fileName: "Sword_Art_Online_Side_Story_Compilations.pdf",
    series: "Sword Art Online",
    titleEn: "Sword Art Online - Side Story Compilations",
    titleAr: "فن السيف عبر الإنترنت - تجميع القصص الجانبية",
    pdfUrlRaw: "https://raw.githubusercontent.com/MrPheonixX/My-Works-PDF-/main/Sword_Art_Online_Side_Story_Compilations.pdf",
    backgroundImage: null,
    arc: "Side Stories",
    description: "مجموعة من أفضل القصص الجانبية من عالم ساو",
    publishYear: 2021,
    pages: 400,
    rating: 8.9,
    status: 'available',
    readProgress: 0,
    coverColor: "from-yellow-500 to-orange-500",
    tags: ["قصص جانبية", "مجموعة", "متنوع", "شامل"]
  }
];

// وظائف مساعدة للبحث والتصفية
export const getWorksByPages = (page: number = 1, limit: number = 12): PDFWork[] => {
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  return pdfWorks.slice(startIndex, endIndex);
};

export const getWorksBySeries = (series: string): PDFWork[] => {
  return pdfWorks.filter(work => work.series === series);
};

export const getWorksByArc = (arc: string): PDFWork[] => {
  return pdfWorks.filter(work => work.arc === arc);
};

export const getWorkById = (id: string): PDFWork | undefined => {
  return pdfWorks.find(work => work.id === id);
};

export const searchWorks = (query: string): PDFWork[] => {
  const lowercaseQuery = query.toLowerCase();
  return pdfWorks.filter(work => 
    work.titleAr.toLowerCase().includes(lowercaseQuery) ||
    work.titleEn.toLowerCase().includes(lowercaseQuery) ||
    work.series.toLowerCase().includes(lowercaseQuery) ||
    work.tags?.some(tag => tag.toLowerCase().includes(lowercaseQuery))
  );
};

export const getSeriesList = (): string[] => {
  return [...new Set(pdfWorks.map(work => work.series))];
};

export const getArcsList = (): string[] => {
  return [...new Set(pdfWorks.map(work => work.arc).filter(Boolean))];
};

// إحصائيات
export const getStatistics = () => {
  return {
    totalWorks: pdfWorks.length,
    totalSeries: getSeriesList().length,
    totalArcs: getArcsList().length,
    averageRating: pdfWorks.reduce((sum, work) => sum + (work.rating || 0), 0) / pdfWorks.length,
    totalPages: pdfWorks.reduce((sum, work) => sum + (work.pages || 0), 0)
  };
};
