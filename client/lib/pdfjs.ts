// Loads the self-hosted pdf.js (public/vendor/pdfjs) on first use.
const BASE: string = (import.meta as any).env?.BASE_URL ?? "/";
const DIR = `${BASE}vendor/pdfjs/`;

let loading: Promise<any> | null = null;

export function loadPdfJs(): Promise<any> {
  loading ??= import(/* @vite-ignore */ `${DIR}pdf.min.mjs`)
    .then((lib) => {
      lib.GlobalWorkerOptions.workerSrc = `${DIR}pdf.worker.min.mjs`;
      return lib;
    })
    .catch((err) => {
      loading = null; // allow a retry
      throw err;
    });
  return loading;
}

/** Options for getDocument(): fonts, CMaps, image decoders served from our own origin. */
export const pdfJsOptions = {
  cMapUrl: `${DIR}cmaps/`,
  cMapPacked: true,
  standardFontDataUrl: `${DIR}standard_fonts/`,
  wasmUrl: `${DIR}wasm/`,
  iccUrl: `${DIR}iccs/`,
};
