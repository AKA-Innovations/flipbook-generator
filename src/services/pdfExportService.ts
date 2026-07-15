import { jsPDF } from 'jspdf';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import { useBookStore } from '@/store/bookStore';

function drawSvgPath(ctx: CanvasRenderingContext2D, pathStr: string, width: number, height: number, color: string) {
  ctx.beginPath();
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  const commands = pathStr.split(/(?=[ML])/);
  commands.forEach((cmd) => {
    const parts = cmd.trim().split(/\s+/);
    if (parts.length < 3) return;
    const type = parts[0];
    const x = (parseFloat(parts[1]) / 100) * width;
    const y = (parseFloat(parts[2]) / 100) * height;

    if (type === 'M') {
      ctx.moveTo(x, y);
    } else if (type === 'L') {
      ctx.lineTo(x, y);
    }
  });
  ctx.stroke();
}

function drawTextBox(ctx: CanvasRenderingContext2D, text: string, xPct: number, yPct: number, wPct: number, hPct: number, width: number, height: number, color: string) {
  const x = (xPct / 100) * width;
  const y = (yPct / 100) * height;
  const w = (wPct / 100) * width;
  const h = (hPct / 100) * height;

  // Background card
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(x, y, w, h);

  // Border card
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y, w, h);

  // Draw text
  ctx.fillStyle = '#0f172a';
  ctx.font = '14px sans-serif';
  ctx.textBaseline = 'top';
  
  const words = text.split(/\s+/);
  let line = '';
  let currentY = y + 6;
  const lineHeight = 18;
  const padding = 6;

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = ctx.measureText(testLine);
    if (metrics.width > w - padding * 2 && n > 0) {
      ctx.fillText(line, x + padding, currentY);
      line = words[n] + ' ';
      currentY += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, x + padding, currentY);
}

export async function exportAnnotatedPdf(
  doc: PDFDocumentProxy,
  title: string,
  onProgress?: (progress: number) => void
): Promise<Blob> {
  const totalPages = doc.numPages;
  const overlays = useBookStore.getState().overlays;
  
  let pdf: jsPDF | null = null;
  const scale = 3.0; // Render density scale

  for (let i = 1; i <= totalPages; i++) {
    const page = await doc.getPage(i);
    
    // Original page dimensions at scale 1.0 (standard PDF points)
    const baseViewport = page.getViewport({ scale: 1.0 });
    const originalWidth = baseViewport.width;
    const originalHeight = baseViewport.height;

    // Render viewport at scale 3.0 for crisp details
    const renderViewport = page.getViewport({ scale });
    const renderWidth = Math.ceil(renderViewport.width);
    const renderHeight = Math.ceil(renderViewport.height);
    
    const canvas = document.createElement('canvas');
    canvas.width = renderWidth;
    canvas.height = renderHeight;
    const ctx = canvas.getContext('2d', { alpha: false })!;
    
    // Clear canvas with white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, renderWidth, renderHeight);
    
    // Render the PDF page onto the canvas
    await page.render({ canvasContext: ctx, viewport: renderViewport }).promise;
    page.cleanup();

    // Get overlays for this page
    const pageOverlays = overlays[i] || [];

    // Draw each overlay
    pageOverlays.forEach((item) => {
      if (item.type === 'highlight') {
        const x = (item.x / 100) * renderWidth;
        const y = (item.y / 100) * renderHeight;
        const w = (item.w / 100) * renderWidth;
        const h = (item.h / 100) * renderHeight;
        
        ctx.fillStyle = `${item.color || '#eab308'}44`; // semi-transparent
        ctx.fillRect(x, y, w, h);
      } else if (item.type === 'pencil') {
        drawSvgPath(ctx, item.value, renderWidth, renderHeight, item.color || '#eab308');
      } else if (item.type === 'textbox') {
        drawTextBox(ctx, item.value, item.x, item.y, item.w, item.h, renderWidth, renderHeight, item.color || '#6366f1');
      } else if (item.type === 'link') {
        const x = (item.x / 100) * renderWidth;
        const y = (item.y / 100) * renderHeight;
        const w = (item.w / 100) * renderWidth;
        const h = (item.h / 100) * renderHeight;
        ctx.strokeStyle = 'rgba(59, 130, 246, 0.4)';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, w, h);
      }
    });

    const pageImg = canvas.toDataURL('image/png'); // Lossless PNG for crisp text

    if (!pdf) {
      pdf = new jsPDF({
        orientation: originalWidth > originalHeight ? 'landscape' : 'portrait',
        unit: 'px',
        format: [originalWidth, originalHeight],
      });
    } else {
      pdf.addPage([originalWidth, originalHeight], originalWidth > originalHeight ? 'landscape' : 'portrait');
    }

    // Embed the high-resolution image inside standard points boundaries
    pdf.addImage(pageImg, 'PNG', 0, 0, originalWidth, originalHeight, undefined, 'FAST');
    onProgress?.(Math.round((i / totalPages) * 100));
  }

  if (!pdf) {
    throw new Error('Failed to generate PDF');
  }

  return pdf.output('blob');
}
