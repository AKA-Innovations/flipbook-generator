export function buildExportHtml(title: string): string {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<meta name="theme-color" content="#0f172a" />
<title>${escapeHtml(title)}</title>
<link rel="manifest" href="manifest.json" />
<link rel="stylesheet" href="css/style.css" />
</head>
<body>
<div id="app">
  <div id="toolbar">
    <div id="logoContainer" class="logo-text">${escapeHtml(title)}</div>
    <span class="spacer"></span>
    <button id="firstBtn" title="First page">⏮</button>
    <button id="prevBtn" title="Previous page">◀</button>
    <span id="pageIndicator">– / –</span>
    <button id="nextBtn" title="Next page">▶</button>
    <button id="lastBtn" title="Last page">⏭</button>
    <span class="spacer"></span>
    <button id="zoomOutBtn" title="Zoom out">−</button>
    <button id="zoomInBtn" title="Zoom in">+</button>
    <button id="searchBtn" title="Search">🔍</button>
    <button id="themeBtn" title="Toggle theme">🌓</button>
    <button id="fullscreenBtn" title="Fullscreen">⛶</button>
  </div>
  <div id="stage">
    <div id="book">
      <img id="pageImage" class="page" alt="" />
    </div>
    <div id="searchBox">
      <input id="searchInput" type="text" placeholder="Search this book…" />
      <div id="searchResults"></div>
    </div>
    <div id="errorBanner"></div>
    <div id="loading"><div class="spinner"></div></div>
  </div>
  <footer id="footer">
    Designed and maintained by <a href="https://akainnovations.com" target="_blank" rel="noopener noreferrer">AKA Innovations</a>
  </footer>
</div>
<script src="js/page-flip.js"></script>
<script src="js/manifest.js"></script>
<script src="js/app.js"></script>
</body>
</html>
`;
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
}
