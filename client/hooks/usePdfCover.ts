import { useEffect, useState } from "react";

export function usePdfCover(pdfUrl: string | undefined, initial?: string) {
  const [cover, setCover] = useState<string | undefined>(initial);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      if (!pdfUrl) return;

      const width = 600;
      const key = `pdf-cover|${pdfUrl}|${width}`;

      try {
        const cached = localStorage.getItem(key);
        if (cached && !cover) {
          setCover(cached);
          return;
        }
      } catch {}

      // If no precomputed cover exists, rely on provided initial or gradient fallback in UI
      if (!cover) {
        setCover(initial);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [pdfUrl, initial]);

  return { cover, loading, error };
}
