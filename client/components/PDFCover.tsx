import React from 'react';
import { usePdfCover } from '@/hooks/usePdfCover';

interface PDFCoverProps {
  pdfUrl: string;
  fallbackGradient: string;
  backgroundImage?: string | null;
}

const PDFCover: React.FC<PDFCoverProps> = ({ pdfUrl, fallbackGradient, backgroundImage }) => {
  const { cover } = usePdfCover(pdfUrl, backgroundImage || undefined);

  return (
    <div
      className="w-full overflow-hidden rounded-md mb-3 border border-white/5"
      style={{
        aspectRatio: '3 / 4',
        backgroundImage: cover
          ? `url(${cover})`
          : undefined,
      }}
    >
      {!cover && (
        <div className={`w-full h-full bg-gradient-to-br ${fallbackGradient}`} />)
      }
      {cover && (
        <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: `url(${cover})` }} />
      )}
    </div>
  );
};

export default PDFCover;
