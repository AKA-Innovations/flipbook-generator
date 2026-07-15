// This file just points pdf.js at its own worker bundle. Vite will hash and
// emit this as a separate chunk; we import it with `?url` wherever we need
// the worker's URL (see services/pdfService.ts).
import 'pdfjs-dist/build/pdf.worker.mjs';
