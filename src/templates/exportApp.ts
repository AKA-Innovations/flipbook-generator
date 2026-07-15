export function buildExportAppJs(): string {
  return `(function () {
  'use strict';

  var state = { current: 0, total: 0, zoom: 1, pages: [], searchIndex: [] };
  var flip = null;

  function $(id) { return document.getElementById(id); }

  function applyTheme(dark) {
    document.body.classList.toggle('dark', dark);
    localStorage.setItem('flipbook-theme', dark ? 'dark' : 'light');
  }

  function updateToolbar() {
    $('pageIndicator').textContent = (state.current + 1) + ' / ' + state.total;
    $('prevBtn').disabled = state.current <= 0;
    $('nextBtn').disabled = state.current >= state.total - 1;
    $('book').style.transform = 'scale(' + state.zoom + ')';
  }

  function goTo(index) {
    if (flip) flip.flip(index);
  }

  function next() { if (flip) flip.flipNext(); }
  function prev() { if (flip) flip.flipPrev(); }

  function setZoom(z) {
    state.zoom = Math.min(3, Math.max(0.4, z));
    updateToolbar();
  }

  function toggleFullscreen() {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen();
    else document.exitFullscreen();
  }

  function showError(message) {
    var el = $('errorBanner');
    el.textContent = message;
    el.classList.add('show');
  }

  function runSearch(query) {
    var resultsEl = $('searchResults');
    resultsEl.innerHTML = '';
    if (!query || query.length < 2) return;
    var lower = query.toLowerCase();
    var matches = state.searchIndex.filter(function (p) {
      return p.text && p.text.toLowerCase().indexOf(lower) !== -1;
    }).slice(0, 30);
    matches.forEach(function (m) {
      var btn = document.createElement('button');
      btn.textContent = 'Page ' + (m.page + 1);
      btn.className = 'search-result';
      btn.onclick = function () { goTo(m.page); };
      resultsEl.appendChild(btn);
    });
    if (matches.length === 0) {
      var none = document.createElement('div');
      none.textContent = 'No matches';
      none.style.fontSize = '12px';
      none.style.color = '#94a3b8';
      resultsEl.appendChild(none);
    }
  }

  function init(manifest) {
    state.pages = manifest.pages;
    state.total = manifest.pages.length;
    state.searchIndex = manifest.searchIndex || [];

    var savedTheme = localStorage.getItem('flipbook-theme');
    applyTheme(savedTheme ? savedTheme === 'dark' : !!manifest.defaultDark);

    var imageUrls = state.pages.map(function (p) { return p.src; });
    var bookSettings = manifest.settings || {
      viewMode: 'double',
      showCover: true,
      hardCover: false,
      shadowIntensity: 0.5,
      animationSpeedMs: 600
    };

    var bookEl = $('book');
    if (bookSettings.viewMode === 'single') {
      bookEl.style.width = '500px';
      bookEl.style.maxWidth = '100%';
      bookEl.style.height = '700px';
      bookEl.style.maxHeight = '80vh';
    } else {
      bookEl.style.width = '1000px';
      bookEl.style.maxWidth = '100%';
      bookEl.style.height = '700px';
      bookEl.style.maxHeight = '80vh';
    }

    flip = new St.PageFlip(bookEl, {
      width: 500,
      height: 700,
      size: 'stretch',
      minWidth: 300,
      maxWidth: 1200,
      minHeight: 400,
      maxHeight: 1600,
      maxShadowOpacity: bookSettings.shadowIntensity,
      showCover: bookSettings.showCover,
      usePortrait: bookSettings.viewMode === 'single',
      flippingTime: bookSettings.animationSpeedMs,
      mobileScrollSupport: true,
      useMouseEvents: true,
      drawShadow: true,
      autoSize: true,
    });

    // Create overlays container
    var overlaysContainer = document.getElementById('overlaysContainer');
    if (!overlaysContainer) {
      overlaysContainer = document.createElement('div');
      overlaysContainer.id = 'overlaysContainer';
      overlaysContainer.style.position = 'absolute';
      overlaysContainer.style.inset = '0';
      overlaysContainer.style.pointerEvents = 'none';
      overlaysContainer.style.zIndex = '30';
      $('stage').appendChild(overlaysContainer);
    }

    function renderOverlays() {
      if (!overlaysContainer) return;
      overlaysContainer.innerHTML = '';
      var bounds = flip.getBoundsRect();
      if (!bounds) return;

      var current = state.current + 1; // 1-indexed

      function createPageOverlay(pageNum, isLeft) {
        if (pageNum < 1 || pageNum > state.total) return;
        var list = (manifest.overlays && manifest.overlays[pageNum]) || [];
        if (list.length === 0) return;

        var width = bounds.pageWidth;
        var height = bounds.height;
        var top = bounds.top;
        var left = isLeft ? bounds.left : (bounds.left + bounds.pageWidth);

        var pageDiv = document.createElement('div');
        pageDiv.className = 'page-overlay-container';
        pageDiv.style.position = 'absolute';
        pageDiv.style.left = left + 'px';
        pageDiv.style.top = top + 'px';
        pageDiv.style.width = width + 'px';
        pageDiv.style.height = height + 'px';
        pageDiv.style.pointerEvents = 'none';

        // Render pencil sketches
        var pencils = list.filter(function(item) { return item.type === 'pencil'; });
        if (pencils.length > 0) {
          var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
          svg.setAttribute('viewBox', '0 0 100 100');
          svg.setAttribute('preserveAspectRatio', 'none');
          svg.style.position = 'absolute';
          svg.style.inset = '0';
          svg.style.width = '100%';
          svg.style.height = '100%';
          svg.style.pointerEvents = 'none';

          pencils.forEach(function(item) {
            var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path.setAttribute('d', item.value);
            path.setAttribute('fill', 'none');
            path.setAttribute('stroke', item.color || '#eab308');
            path.setAttribute('stroke-width', '1.5');
            path.setAttribute('stroke-linecap', 'round');
            path.setAttribute('stroke-linejoin', 'round');
            svg.appendChild(path);
          });
          pageDiv.appendChild(svg);
        }

        // Render other elements
        list.forEach(function(item) {
          if (item.type === 'pencil') return;

          var el;
          var style = 'left: ' + item.x + '%; top: ' + item.y + '%; width: ' + item.w + '%; height: ' + item.h + '%; position: absolute;';
          
          if (item.type === 'link') {
            el = document.createElement('a');
            el.href = item.value.indexOf('http') === 0 ? item.value : 'https://' + item.value;
            el.target = '_blank';
            el.rel = 'noopener noreferrer';
            el.style.cssText = style;
          } else if (item.type === 'video') {
            el = document.createElement('iframe');
            el.src = 'https://www.youtube.com/embed/' + item.value + '?rel=0';
            el.style.cssText = style;
          } else if (item.type === 'highlight') {
            el = document.createElement('div');
            el.className = 'highlight-box';
            el.style.cssText = style + ' background-color: ' + (item.color || '#eab308') + '66;';
          } else if (item.type === 'textbox') {
            el = document.createElement('div');
            el.className = 'text-box';
            el.innerText = item.value;
            el.style.cssText = style + ' border-color: ' + (item.color || '#6366f1') + '; color: ' + (item.color || 'inherit') + ';';
          }
          
          if (el) {
            pageDiv.appendChild(el);
          }
        });

        overlaysContainer.appendChild(pageDiv);
      }

      var viewMode = manifest.settings.viewMode;
      var showCover = manifest.settings.showCover;

      if (viewMode === 'single') {
        createPageOverlay(current, false);
      } else {
        if (current === 1 && showCover) {
          createPageOverlay(1, false);
        } else if (current === state.total && state.total % 2 === 1) {
          createPageOverlay(state.total, true);
        } else {
          var leftPage = current % 2 === 0 ? current : current - 1;
          var rightPage = leftPage + 1;
          createPageOverlay(leftPage, true);
          createPageOverlay(rightPage, false);
        }
      }
    }

    flip.loadFromImages(imageUrls);
    
    // Initial overlays render
    setTimeout(renderOverlays, 150);
    window.addEventListener('resize', renderOverlays);

    flip.on('flip', function (e) {
      state.current = e.data;
      updateToolbar();
      setTimeout(renderOverlays, 50);
    });

    $('prevBtn').addEventListener('click', prev);
    $('nextBtn').addEventListener('click', next);
    $('firstBtn').addEventListener('click', function () { goTo(0); });
    $('lastBtn').addEventListener('click', function () { goTo(state.total - 1); });
    $('zoomInBtn').addEventListener('click', function () { setZoom(state.zoom + 0.15); setTimeout(renderOverlays, 300); });
    $('zoomOutBtn').addEventListener('click', function () { setZoom(state.zoom - 0.15); setTimeout(renderOverlays, 300); });
    $('fullscreenBtn').addEventListener('click', toggleFullscreen);
    $('themeBtn').addEventListener('click', function () { applyTheme(!document.body.classList.contains('dark')); });
    $('searchBtn').addEventListener('click', function () { $('searchBox').classList.toggle('open'); });
    $('searchInput').addEventListener('input', function (e) { runSearch(e.target.value); });

    document.addEventListener('keydown', function (e) {
      if (e.target.tagName === 'INPUT') return;
      if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); next(); }
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'f' || e.key === 'F') toggleFullscreen();
      if (e.key === '+' || e.key === '=') { setZoom(state.zoom + 0.15); setTimeout(renderOverlays, 300); }
      if (e.key === '-') { setZoom(state.zoom - 0.15); setTimeout(renderOverlays, 300); }
    });

    $('book').addEventListener('dblclick', function () { setZoom(state.zoom === 1 ? 1.8 : 1); setTimeout(renderOverlays, 300); });

    // Custom branding logo
    if (manifest.logoDataUrl) {
      var logoContainer = $('logoContainer');
      if (logoContainer) {
        logoContainer.innerHTML = '<img src="' + manifest.logoDataUrl + '" alt="Logo" />';
      }
    }

    // Custom branding footer
    if (manifest.footerText) {
      var footer = $('footer');
      if (footer) {
        footer.innerHTML = manifest.footerText;
      }
    }

    $('loading').style.display = 'none';
    updateToolbar();
  }

  if (typeof window !== 'undefined' && window.FLIPBOOK_MANIFEST) {
    init(window.FLIPBOOK_MANIFEST);
  } else {
    $('loading').style.display = 'none';
    showError('Could not load this flipbook (Manifest missing).');
  }

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('sw.js').catch(function () {});
    });
  }
})();
`;
}
