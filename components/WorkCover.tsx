import { useState } from "react";
import type { PDFWork } from "@/data/pdfWorks";
import { coverUrl, getBookInfo, useBooksIndex } from "@/lib/books";

// The book's cover (first page or the cover the admin uploaded). While the book is
// not processed yet, or the image fails, a coloured placeholder is shown instead.
export default function WorkCover({
  work,
  className = "",
  rounded = "rounded-md",
  showNumber = true,
}: {
  work: Pick<PDFWork, "id" | "titleAr" | "coverColor" | "volumeNumber">;
  className?: string;
  rounded?: string;
  showNumber?: boolean;
}) {
  useBooksIndex();
  const [failed, setFailed] = useState(false);
  const info = getBookInfo(work.id);
  const showImage = Boolean(info?.cover) && !failed;

  return (
    <div
      className={`relative overflow-hidden ${rounded} bg-gradient-to-br ${work.coverColor ?? "from-slate-700 to-slate-900"} ${className}`}
      style={{ aspectRatio: "2 / 3" }}
    >
      {showImage ? (
        <img
          src={coverUrl(work.id)}
          alt={`غلاف ${work.titleAr}`}
          loading="lazy"
          decoding="async"
          draggable={false}
          onError={() => setFailed(true)}
          onContextMenu={(e) => e.preventDefault()}
          className="absolute inset-0 w-full h-full object-cover select-none"
        />
      ) : (
        showNumber && (
          <div className="absolute inset-0 flex items-center justify-center text-5xl font-black text-white/70">
            {work.volumeNumber ? String(work.volumeNumber).padStart(2, "0") : "★"}
          </div>
        )
      )}
    </div>
  );
}
