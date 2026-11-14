import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import PdfCanvasViewer from "@/components/PdfCanvasViewer";
import { ArrowLeft, Maximize, Minimize, Star } from "lucide-react";

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

// The book is always drawn inside the page (pdf.js on a canvas). There is no
// browser PDF toolbar, no "download" and no "open in a new tab".
const ProtectedPDFViewer: React.FC<ProtectedPDFViewerProps> = ({
  pdfUrl,
  titleAr,
  series,
  volumeNumber,
  onBack,
  onShowInfo,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      containerRef.current?.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
    setIsFullscreen(!isFullscreen);
  };

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

          <Badge
            variant="secondary"
            className="bg-blue-500/20 text-blue-400 border-blue-500/30"
          >
            القراءة داخل الموقع
          </Badge>
        </div>
      </div>

      {/* Viewer area */}
      <div className="w-full h-screen pt-20 pb-16">
        <PdfCanvasViewer pdfUrl={pdfUrl} />
      </div>

      {/* Bottom bar */}
      <div className="absolute bottom-0 left-0 right-0 bg-black/80 text-white backdrop-blur-sm border-t border-blue-500/30 z-40">
        <div className="flex items-center justify-end p-4 gap-2 flex-row-reverse">
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
            aria-label={isFullscreen ? "إنهاء ملء الشاشة" : "ملء الشاشة"}
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
