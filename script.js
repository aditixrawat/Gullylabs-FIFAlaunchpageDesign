// GL Baaz Rabona / Gully Number 001 — vanilla JS build (no React / no build step)
(function () {
  'use strict';

  // ---------------------------------------------------------------------
  // State
  // ---------------------------------------------------------------------
  var state = { size: 'UK8', frame: 'cover', added: false };
  var galleryKeys = ['cover', 'g1', 'g2', 'g3', 'g4', 'g5'];
  var gallerySrc = {
    cover: 'assets/pdp-cover.jpg',
    g1: 'assets/pdp-gallery-1.jpg',
    g2: 'assets/pdp-gallery-2.jpg',
    g3: 'assets/pdp-gallery-3.jpg',
    g4: 'assets/pdp-gallery-4.jpg',
    g5: 'assets/pdp-gallery-5.jpg'
  };

  function $(id) { return document.getElementById(id); }

  // ---------------------------------------------------------------------
  // Particles (drifting dust / stars behind the shoe)
  // ---------------------------------------------------------------------
  function buildParticles() {
    var host = $('particles');
    if (!host) return;
    var frag = document.createDocumentFragment();
    for (var i = 0; i < 30; i++) {
      var isStar = i % 3 === 0;
      var d = document.createElement('div');
      d.textContent = isStar ? '★' : '●';
      d.style.position = 'absolute';
      d.style.left = (Math.random() * 100).toFixed(2) + '%';
      d.style.top = (Math.random() * 100).toFixed(2) + '%';
      d.style.lineHeight = '1';
      d.style.fontSize = isStar
        ? (8 + Math.random() * 10).toFixed(1) + 'px'
        : (2 + Math.random() * 3).toFixed(1) + 'px';
      d.style.color = isStar
        ? 'rgba(240,230,200,' + (0.2 + Math.random() * 0.4).toFixed(2) + ')'
        : 'rgba(224,168,46,' + (0.25 + Math.random() * 0.45).toFixed(2) + ')';
      d.style.animation = 'glDrift ' + (11 + Math.random() * 16).toFixed(1) + 's ease-in-out ' +
        (-Math.random() * 22).toFixed(1) + 's infinite';
      frag.appendChild(d);
    }
    host.appendChild(frag);
  }

  // ---------------------------------------------------------------------
  // PDP: 360 viewer / gallery
  // ---------------------------------------------------------------------
  function renderGallery() {
    var img = document.querySelector('#viewer360 img');
    if (img) img.src = gallerySrc[state.frame] || gallerySrc.cover;
    var idx = Math.max(0, galleryKeys.indexOf(state.frame));
    var dots = document.querySelectorAll('#viewer360-dots span');
    dots.forEach(function (dot, i) {
      dot.style.background = i === idx ? '#E0A82E' : 'rgba(240,230,200,.4)';
    });
  }

  function stepFrame(dir) {
    var n = galleryKeys.length;
    var i = galleryKeys.indexOf(state.frame);
    state.frame = galleryKeys[((i + dir) % n + n) % n];
    renderGallery();
  }

  // ---------------------------------------------------------------------
  // PDP: size selector
  // ---------------------------------------------------------------------
  var sizeBtnBase = 'padding:12px 0;font-family:"Agency FB","Arial Narrow",Arial,sans-serif;font-weight:700;font-size:15px;cursor:pointer;text-transform:uppercase;';
  function sizeBtnStyle(on) {
    return sizeBtnBase + (on
      ? 'background:#F0E6C8;color:#143421;border:2px solid #F0E6C8;'
      : 'background:rgba(240,230,200,.04);color:rgba(240,230,200,.85);border:2px solid rgba(224,168,46,.3);');
  }
  function renderSizes() {
    var host = $('size-grid');
    if (!host) return;
    Array.prototype.forEach.call(host.children, function (btn) {
      btn.setAttribute('style', sizeBtnStyle(btn.dataset.size === state.size));
    });
  }

  // ---------------------------------------------------------------------
  // PDP: Add to cart
  // ---------------------------------------------------------------------
  function renderAtc() {
    var btn = $('atc');
    if (!btn) return;
    btn.textContent = state.added ? 'Added — INR 8990.00 ★' : 'Add to cart — INR 8990.00';
  }
  function addToCart() {
    state.added = true;
    renderAtc();
    setTimeout(function () { state.added = false; renderAtc(); }, 1800);
  }

  // ---------------------------------------------------------------------
  // Wire up PDP interactions
  // ---------------------------------------------------------------------
  function initPdp() {
    var prevBtn = $('pdp-prev'), nextBtn = $('pdp-next');
    if (prevBtn) prevBtn.addEventListener('click', function () { stepFrame(-1); });
    if (nextBtn) nextBtn.addEventListener('click', function () { stepFrame(1); });

    var thumbs = document.querySelectorAll('#thumbs [data-frame]');
    thumbs.forEach(function (t) {
      t.addEventListener('click', function () { state.frame = t.dataset.frame; renderGallery(); });
    });

    var sizeHost = $('size-grid');
    if (sizeHost) {
      Array.prototype.forEach.call(sizeHost.children, function (btn) {
        btn.addEventListener('click', function () { state.size = btn.dataset.size; renderSizes(); });
      });
    }

    var atcBtn = $('atc');
    if (atcBtn) atcBtn.addEventListener('click', addToCart);

    var ownBtn = $('own-story-btn');
    if (ownBtn) ownBtn.addEventListener('click', function () {
      var pdp = $('pdp');
      if (pdp) window.scrollTo({ top: pdp.offsetTop - 40, behavior: 'smooth' });
    });

    // drag-to-cycle on the 360 viewer
    var viewer = $('viewer360');
    var dragging = false, lastX = 0;
    if (viewer) {
      viewer.addEventListener('pointerdown', function (e) {
        dragging = true; lastX = e.clientX; viewer.style.cursor = 'grabbing';
      });
    }
    window.addEventListener('pointerup', function () {
      dragging = false; if (viewer) viewer.style.cursor = 'grab';
    });
    window.addEventListener('pointermove', function (e) {
      if (!dragging) return;
      var dx = e.clientX - lastX;
      if (Math.abs(dx) > 16) {
        stepFrame(dx > 0 ? -1 : 1);
        lastX = e.clientX;
      }
    });

    renderGallery();
    renderSizes();
    renderAtc();
  }

  // ---------------------------------------------------------------------
  // Scroll-driven cinematic timeline (fixed-rig tick loop)
  // Timing mirrors the live site's tick(): 5 focused Indian-Fan scenes with
  // wide holds and gaps, product-reveal blur-in, then handoff into the PDP.
  // ---------------------------------------------------------------------
  var mx = 0, my = 0, ex = 0, ey = 0;
  window.addEventListener('mousemove', function (e) {
    mx = (e.clientX / window.innerWidth - 0.5);
    my = (e.clientY / window.innerHeight - 0.5);
  });

  function set(id, fn) { var el = $(id); if (el) fn(el); }
  function setCls(id, on) { var el = $(id); if (el) el.classList.toggle('in', !!on); }

  function tick() {
    var vh = window.innerHeight;
    var p = window.scrollY / vh;
    function cl(x) { return Math.max(0, Math.min(1, x)); }
    function ramp(a, b) { return cl((p - a) / (b - a)); }
    function band(a, b, c, d) { return Math.min(ramp(a, b), 1 - ramp(c, d)); }
    var mobile = window.innerWidth < 820;

    ex = ex + (mx - ex) * 0.08;
    ey = ey + (my - ey) * 0.08;

    set('bg-hero', function (el) { el.style.opacity = (1 - ramp(0.6, 1.3)).toFixed(3); });
    var night = band(0.7, 1.25, 7.2, 7.9);
    set('bg-night', function (el) { el.style.opacity = night.toFixed(3); });
    set('bg-reveal', function (el) { el.style.opacity = band(7.8, 8.3, 8.9, 9.2).toFixed(3); });
    set('bg-everyfan', function (el) { el.style.opacity = ramp(9.1, 9.7).toFixed(3); });
    set('floods', function (el) { el.style.opacity = (0.45 * (1 - ramp(0.6, 1.4)) + 0.2 * ramp(7.3, 8.0)).toFixed(3); });
    set('halftone', function (el) { el.style.opacity = (0.5 - 0.34 * night).toFixed(3); });
    set('herostars', function (el) {
      el.style.opacity = (1 - ramp(0.5, 1.2)).toFixed(3);
      el.style.transform = 'translate(' + (ex * 18).toFixed(1) + 'px,' + (-Math.min(p, 2) * 38).toFixed(1) + 'px)';
    });

    set('copy-hero', function (el) {
      var o = 1 - ramp(0.4, 0.85);
      el.style.opacity = o.toFixed(3);
      var baseUp = (mobile ? 0.04 : 0.08) * vh;
      el.style.transform = 'translateY(' + (-baseUp - ramp(0.4, 0.95) * 70).toFixed(1) + 'px)';
      el.style.filter = 'blur(' + (ramp(0.45, 0.9) * 5).toFixed(2) + 'px)';
    });

    // THE INDIAN FAN scenes — wide holds + generous gaps so each moment is focussed alone
    var scenes = [
      ['sc-time', band(1.0, 1.35, 2.0, 2.35)],
      ['sc-match', band(2.3, 2.65, 3.3, 3.65)],
      ['sc-subs', band(3.6, 3.95, 4.6, 4.95)],
      ['sc-dist', band(4.9, 5.25, 6.25, 6.6)],
      ['sc-fan', band(6.5, 6.85, 7.15, 7.5)]
    ];
    scenes.forEach(function (sc0) {
      var id = sc0[0], o = sc0[1];
      set(id, function (el) { el.style.opacity = o.toFixed(3); });
      setCls(id, o > 0.4);
    });

    var everyfanOn = band(9.5, 9.9, 10.35, 10.7);
    set('copy-everyfan', function (el) { el.style.opacity = everyfanOn.toFixed(3); });
    setCls('copy-everyfan', everyfanOn > 0.35);

    var heroDrop = 1 - ramp(0.1, 0.9);
    var dropPx = heroDrop * vh * 0.22;
    var trans = ramp(10.9, 11.7);
    var rig = 1 - ramp(11.0, 11.7);

    // Transition to Product: particles assemble into the shoe's silhouette
    // (only after sc-fan text has fully cleared)
    var assemble = band(7.85, 8.15, 8.45, 8.75);
    set('softlight', function (el) { el.style.opacity = (assemble * 0.85).toFixed(3); });
    var converge = 1 - assemble * 0.68;
    set('particles', function (el) {
      var baseOp = (rig * (0.22 + 0.35 * ramp(8.1, 8.7)));
      el.style.opacity = Math.min(1, baseOp + assemble * 0.6).toFixed(3);
      el.style.transform = 'translate(' + (ex * -16).toFixed(1) + 'px,' + (ey * -11).toFixed(1) + 'px) scale(' + converge.toFixed(3) + ')';
      el.style.transformOrigin = '50% 50%';
    });

    var shoeEnv = ramp(8.1, 8.7);
    var holdZoom = ramp(8.7, 9.6);
    var rotY = Math.min(p, 9.7) * 1.6 + ramp(8.7, 9.7) * 4;
    var sc = (0.84 + shoeEnv * 0.24) + holdZoom * 0.05;
    sc = sc * (1 - 0.5 * trans);
    rotY += ex * 8;
    var baseTY = dropPx + trans * (-6) + (1 - shoeEnv) * 30;
    var tx = ex * 22, ty = ey * 15 + baseTY;
    set('shoe-stage', function (el) {
      el.style.opacity = shoeEnv.toFixed(3);
      el.style.filter = 'blur(' + ((1 - shoeEnv) * 14).toFixed(1) + 'px)';
      el.style.transform = 'translate(calc(-50% + ' + tx.toFixed(1) + 'px), calc(-50% + ' + ty.toFixed(1) + 'px)) scale(' + sc.toFixed(3) + ') rotateY(' + rotY.toFixed(1) + 'deg)';
    });
    set('floor', function (el) {
      el.style.transform = 'translate(-50%, calc(120% + ' + dropPx.toFixed(1) + 'px)) scale(' + sc.toFixed(3) + ')';
      el.style.opacity = (rig * 0.9 * shoeEnv).toFixed(3);
    });
    set('rimglow', function (el) {
      el.style.transform = 'translate(-50%, calc(-50% + ' + baseTY.toFixed(1) + 'px))';
      el.style.opacity = (rig * shoeEnv * (0.4 + holdZoom * 0.3)).toFixed(3);
    });
    set('fixed-rig', function (el) { el.style.opacity = rig.toFixed(3); });
    set('topnav', function (el) { el.style.opacity = rig.toFixed(3); el.style.pointerEvents = rig > 0.5 ? 'auto' : 'none'; });
    set('progress', function (el) {
      var h = document.documentElement.scrollHeight - window.innerHeight;
      el.style.width = (h > 0 ? window.scrollY / h * 100 : 0).toFixed(2) + '%';
    });
    set('scrollcue', function (el) { el.style.opacity = (1 - ramp(0.05, 0.35)).toFixed(3); });

    requestAnimationFrame(tick);
  }

  // ---------------------------------------------------------------------
  // Boot
  // ---------------------------------------------------------------------
  function boot() {
    buildParticles();
    initPdp();

    var loader = $('gl-loader');
    setTimeout(function () {
      if (loader) {
        loader.style.opacity = '0';
        loader.style.pointerEvents = 'none';
        setTimeout(function () { loader.style.visibility = 'hidden'; }, 900);
      }
    }, 2500);

    requestAnimationFrame(tick);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
