export function buildExportCss(accentColor: string): string {
  return `:root {
  --accent: ${accentColor};
  --bg-light: #f8fafc;
  --bg-dark: #0f172a;
}
* { box-sizing: border-box; }
html, body { height: 100%; margin: 0; }
body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Inter, Roboto, sans-serif;
  background: var(--bg-light);
  color: #0f172a;
  overflow: hidden;
  transition: background .2s ease, color .2s ease;
}
body.dark { background: var(--bg-dark); color: #f1f5f9; }

#app { height: 100vh; display: flex; flex-direction: column; }

#toolbar {
  display: flex; align-items: center; gap: 4px;
  padding: 8px 12px; z-index: 10;
  background: rgba(255,255,255,0.8); backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(0,0,0,0.06);
}
body.dark #toolbar { background: rgba(15,23,42,0.8); border-bottom-color: rgba(255,255,255,0.08); }

#toolbar button {
  border: none; background: transparent; cursor: pointer;
  width: 34px; height: 34px; border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  color: inherit; font-size: 16px;
}
#toolbar button:hover { background: rgba(0,0,0,0.06); }
body.dark #toolbar button:hover { background: rgba(255,255,255,0.1); }
#toolbar button:disabled { opacity: .35; cursor: default; }
#toolbar .spacer { flex: 1; }
#pageIndicator { font-size: 13px; padding: 0 6px; min-width: 64px; text-align: center; }

#stage {
  flex: 1; display: flex; align-items: center; justify-content: center;
  perspective: 2400px; overflow: hidden; position: relative;
}

#book {
  position: relative;
  width: 90vw;
  height: 80vh;
  max-width: 1000px;
  max-height: 700px;
  transition: transform .25s ease;
}

#loading {
  position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;
  background: var(--bg-light); z-index: 20;
}
body.dark #loading { background: var(--bg-dark); }
.spinner {
  width: 40px; height: 40px; border-radius: 50%;
  border: 4px solid color-mix(in srgb, var(--accent) 30%, transparent);
  border-top-color: var(--accent); animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

#searchBox {
  position: absolute; top: 56px; right: 12px; width: 280px;
  background: rgba(255,255,255,0.95); border-radius: 12px; padding: 10px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.15); display: none;
}
body.dark #searchBox { background: rgba(30,41,59,0.95); }
#searchBox.open { display: block; }
#searchBox input {
  width: 100%; padding: 6px 10px; border-radius: 8px; border: 1px solid #e2e8f0;
  outline: none; font-size: 13px;
}

#errorBanner {
  display: none; position: absolute; top: 12px; left: 50%; transform: translateX(-50%);
  background: #fee2e2; color: #b91c1c; padding: 8px 14px; border-radius: 8px; font-size: 13px;
}
#errorBanner.show { display: block; }

#footer {
  text-align: center;
  font-size: 11px;
  padding: 8px;
  color: #64748b;
  border-top: 1px solid rgba(0,0,0,0.05);
  background: rgba(255,255,255,0.5);
  backdrop-filter: blur(5px);
  z-index: 10;
}
body.dark #footer {
  color: #94a3b8;
  border-top-color: rgba(255,255,255,0.05);
  background: rgba(15,23,42,0.5);
}
#footer a {
  color: var(--accent);
  text-decoration: none;
  font-weight: 500;
}
#footer a:hover {
  text-decoration: underline;
}

#logoContainer {
  font-size: 14px;
  font-weight: 600;
  display: flex;
  align-items: center;
  margin-right: 12px;
}
#logoContainer img {
  height: 24px;
  max-width: 120px;
  object-fit: contain;
}

/* Page Overlay Styles */
.page-overlay-container {
  position: absolute;
  pointer-events: none;
  overflow: hidden;
  z-index: 30;
}
.page-overlay-container a {
  position: absolute;
  background: rgba(59, 130, 246, 0.04);
  border: 1px solid transparent;
  transition: background .15s, border .15s;
  pointer-events: auto;
}
.page-overlay-container a:hover {
  background: rgba(59, 130, 246, 0.12);
  border-color: rgba(59, 130, 246, 0.3);
}
.page-overlay-container iframe {
  position: absolute;
  border: 0;
  pointer-events: auto;
}
.page-overlay-container .highlight-box {
  position: absolute;
  pointer-events: none;
}
.page-overlay-container .text-box {
  position: absolute;
  padding: 4px;
  border-radius: 4px;
  border: 1px solid;
  font-size: 10px;
  line-height: 1.25;
  background: rgba(255, 255, 255, 0.95);
  pointer-events: auto;
  overflow-y: auto;
  white-space: pre-wrap;
  font-family: inherit;
}
body.dark .page-overlay-container .text-box {
  background: rgba(15, 23, 42, 0.95);
}
.page-overlay-container svg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}
`;
}
