import React, { useEffect, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { loadPdfBlobUrl } from "@/lib/pdfSource";
import {
  BookOpen,
  ArrowLeft,
  Maximize,
  Minimize,
  ExternalLink,
  Star,
} from "lucide-react";

interface ProtectedPDFViewerProps {
  pdfUrl: string;
  title: string;
  titleAr: string;
  series: string;
  volumeNumber?: number;
  onBack?: () => void;
  /** opens the work's details page (description + readers' reviews) */
  onShowInfo?: () => void;
}

const ProtectedPDFViewer: React.FC<ProtectedPDFViewerProps> = ({
  pdfUrl,
  title,
  titleAr,
  series,
  volumeNumber,
  onBack,
  onShowInfo,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [loadProgress, setLoadProgress] = useState(0);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Download the PDF into a blob: URL (works on a static host with no server)
  useEffect(() => {
    let cancelled = false;
    let created: string | null = null;
    const controller = new AbortController();
    setIsLoading(true);
    setLoadError(null);
    setLoadProgress(5);
    setBlobUrl(null);

    loadPdfBlobUrl(pdfUrl, {
      signal: controller.signal,
      onProgress: (p) => {
        if (!cancelled) setLoadProgress(p);
      },
    })
      .then((url) => {
        if (cancelled) {
          URL.revokeObjectURL(url);
          return;
        }
        created = url;
        setBlobUrl(url);
        setLoadProgress(90);
        setIframeLoaded(true);
        setIsLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setLoadError("تعذر تحميل الملف. تأكد من اتصالك بالإنترنت وحاول مرة أخرى.");
        setIsLoading(false);
      });

    return () => {
      cancelled = true;
      controller.abort();
      if (created) URL.revokeObjectURL(created);
    };
  }, [pdfUrl]);

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      containerRef.current?.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
    setIsFullscreen(!isFullscreen);
  };

  const src = blobUrl ?? ""; // native browser PDF toolbar

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Card className="w-96 bg-black/40 backdrop-blur-xl border border-blue-500/30">
          <CardContent className="p-8 text-center">
            <div className="mb-6">
              <BookOpen className="w-16 h-16 mx-auto text-blue-400 animate-pulse" />
            </div>
            <h3 className="text-xl font-bold text-white mb-4">{titleAr}</h3>
            <Progress value={loadProgress || 30} className="mb-4" />
            <p className="text-gray-300 text-sm">جاري تجهيز العارض المدمج...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-6 text-center">
        <div>
          <h3 className="text-xl font-bold mb-2">
            تعذّر عرض الـ PDF داخل الموقع
          </h3>
          <p className="text-gray-300 mb-4">{loadError}</p>
          <div className="flex gap-2 justify-center">
            <Button
              onClick={() => window.location.reload()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              إعادة المحاولة
            </Button>
            <Button
              variant="outline"
              onClick={() => window.open(pdfUrl, "_blank")}
              className="border-gray-600 text-gray-300 hover:text-white"
            >
              فتح مباشر
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      dir="rtl"
      className={`min-h-screen relative ${isFullscreen ? "fixed inset-0 z-50" : ""} bg-black text-white`}
      style={{ fontFamily: "Noto Sans Arabic, system-ui, sans-serif" }}
    >
      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 bg-black/80 backdrop-blur-sm border-b border-blue-500/30 z-40">
        <div className="flex items-center justify-between p-4 flex-row-reverse">
          <div className="flex items-center gap-4 flex-row-reverse">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="text-white hover:text-blue-400"
            >
              <ArrowLeft className="w-4 h-4 ml-2" />
              العودة
            </Button>
            <div>
              <h1 className="text-lg font-bold">{titleAr}</h1>
              <p className="text-sm opacity-70">
                {series} {volumeNumber && `- المجلد ${volumeNumber}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge
              variant="secondary"
              className="bg-blue-500/20 text-blue-400 border-blue-500/30"
            >
              عارض النظام
            </Badge>
          </div>
        </div>
      </div>

      {/* Viewer Area */}
      <div className="w-full h-screen pt-20">
        <iframe
          title={title}
          src={src}
          className="w-full h-full border-0 bg-white"
          onLoad={() => {
            setIframeLoaded(true);
            setIsLoading(false);
            setLoadProgress(100);
          }}
          onError={() => {
            setLoadError("تعذر تحميل الملف");
          }}
          allow="fullscreen"
          allowFullScreen
        />
      </div>

      {/* Bottom bar */}
      <div className="absolute bottom-0 left-0 right-0 bg-black/80 text-white backdrop-blur-sm border-t border-blue-500/30 z-40">
        <div className="flex items-center justify-end p-4 gap-2 flex-row-reverse">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.open(pdfUrl, "_blank")}
            className="text-white hover:text-blue-400"
          >
            <ExternalLink className="w-4 h-4 ml-2" />
            فتح في تبويب جديد
          </Button>
          {onShowInfo && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onShowInfo}
              className="text-white hover:text-yellow-400"
            >
              <Star className="w-4 h-4 ml-2" />
              التقييمات والتفاصيل
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleFullscreen}
            className="text-white hover:text-blue-400"
          >
            {isFullscreen ? (
              <Minimize className="w-4 h-4" />
            ) : (
              <Maximize className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProtectedPDFViewer;
