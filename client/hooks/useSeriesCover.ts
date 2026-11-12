import { useEffect, useState } from "react";
import { pdfWorks } from "@/data/pdfWorks";

export function useSeriesCover(seriesName: string) {
  const [cover, setCover] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      try {
        const key = `series-cover|${seriesName}`;
        const cached = localStorage.getItem(key);
        if (cached) {
          setCover(cached);
          setLoading(false);
          return;
        }

        const works = pdfWorks.filter((w) => w.series === seriesName);
        // Prefer any predefined backgroundImage in data
        const bg = works.find((w) => !!w.backgroundImage)?.backgroundImage as
          | string
          | undefined;
        if (!cancelled && bg) {
          setCover(bg);
          try {
            localStorage.setItem(key, bg);
          } catch {}
          return;
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [seriesName]);

  return { cover, loading };
}
