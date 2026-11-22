// قاعدة بيانات الروايات. البيانات نفسها في catalog.json (ملف واحد يعدّله الأدمن من لوحة التحكم
// أو يدويًا)، وملفات الـ PDF في المجلد books-source/ — كل شيء في ريبو واحد.
import catalog from "./catalog.json";

export interface PDFWork {
  id: string;
  /** اسم ملف الـ PDF داخل books-source/ */
  file: string;
  series: string;
  titleEn: string;
  titleAr: string;
  volumeNumber?: number;
  arc?: string;
  description?: string;
  publishYear?: number;
  /** عدد الصفحات التقريبي؛ العدد الحقيقي يأتي من الملف بعد المعالجة */
  pages?: number;
  rating?: number;
  coverColor?: string;
  tags?: string[];
}

export const pdfWorks: PDFWork[] = catalog.works as PDFWork[];

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
