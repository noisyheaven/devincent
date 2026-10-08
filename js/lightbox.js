// GALLERY VIEWER: tap a gallery photo to open it full screen.
// Swipe or use the arrows to move between photos. Close with X, Esc, or by tapping the dark area.
(function () {
  var gal = document.getElementById("gal"); if (!gal) return;

  var st = document.createElement("style");
  st.textContent =
    '#gal .bg{cursor:zoom-in}' +
    '#lb{position:fixed;inset:0;z-index:100;background:rgba(24,0,9,.97);display:flex;align-items:center;justify-content:center;touch-action:pan-y}' +
    '#lb[hidden]{display:none}' +
    '#lb img{max-width:94vw;max-height:80vh;border-radius:6px;box-shadow:0 8px 40px rgba(0,0,0,.5);opacity:0;transform:scale(.97);transition:opacity .3s,transform .3s;user-select:none;-webkit-user-drag:none}' +
    '#lb img.in{opacity:1;transform:none}' +
    '#lb button{position:absolute;width:44px;height:44px;border-radius:50%;border:2px solid #fff;background:rgba(128,0,32,.9);color:#fff;font:400 28px/1 Poppins,sans-serif;cursor:pointer;display:grid;place-items:center;padding:0 0 4px}' +
    '#lb .lb-x{top:calc(14px + env(safe-area-inset-top,0px));right:14px}' +
    '#lb .lb-p{left:10px;top:50%;margin-top:-22px}#lb .lb-n{right:10px;top:50%;margin-top:-22px}' +
    '#lb.one .lb-p,#lb.one .lb-n{display:none}' +
    '#lb .lb-c{position:absolute;bottom:calc(20px + env(safe-area-inset-bottom,0px));left:0;right:0;text-align:center;color:#fff;font:300 .9rem Poppins,sans-serif;letter-spacing:.08em;pointer-events:none}' +
    '@media(max-width:600px){#lb .lb-p,#lb .lb-n{top:auto;margin:0;bottom:calc(8px + env(safe-area-inset-bottom,0px))}#lb .lb-p{left:calc(50% - 110px)}#lb .lb-n{left:auto;right:calc(50% - 110px)}}' +
    'html.lb-open,html.lb-open body{overflow:hidden}' +
    '@media(prefers-reduced-motion:reduce){#lb img{transition:none}}';
  document.head.appendChild(st);

  var box = document.createElement("div");
  box.id = "lb"; box.hidden = true;
  box.setAttribute("role", "dialog"); box.setAttribute("aria-modal", "true"); box.setAttribute("aria-label", "Galeri foto");
  box.innerHTML = '<button class="lb-x" aria-label="Tutup">&times;</button>' +
    '<button class="lb-p" aria-label="Foto sebelumnya">&#8249;</button>' +
    '<button class="lb-n" aria-label="Foto berikutnya">&#8250;</button>' +
    '<img alt=""><div class="lb-c"></div>';
  document.body.appendChild(box);

  var img = box.querySelector("img"), cnt = box.querySelector(".lb-c"),
      bx = box.querySelector(".lb-x"), bp = box.querySelector(".lb-p"), bn = box.querySelector(".lb-n"),
      list = [], cur = 0, lastFocus = null;

  function url(el) { var m = /url\(["']?(.*?)["']?\)/.exec(el.style.backgroundImage || ""); return m ? m[1] : ""; }
  function build() { list = [].slice.call(gal.children).filter(function (t) { return url(t); }); }

  function show(i) {
    cur = (i + list.length) % list.length;
    img.classList.remove("in");
    img.onload = function () { img.classList.add("in"); };
    img.src = url(list[cur]);
    img.alt = "Foto " + (cur + 1);
    cnt.textContent = (cur + 1) + " / " + list.length;
    box.classList.toggle("one", list.length < 2);
  }
  function open(i) {
    lastFocus = document.activeElement;
    if (window.auto && window.setAuto) setAuto(false);       // stop auto-scroll
    box.hidden = false; document.documentElement.classList.add("lb-open");
    show(i); bx.focus();
  }
  function close() {
    box.hidden = true; document.documentElement.classList.remove("lb-open"); img.removeAttribute("src");
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  gal.addEventListener("click", function (e) {
    var t = e.target.closest(".bg"); if (!t || !gal.contains(t)) return;
    build(); var i = list.indexOf(t); if (i > -1) open(i);
  });
  gal.addEventListener("keydown", function (e) {
    if ((e.key === "Enter" || e.key === " ") && e.target.classList.contains("bg")) { e.preventDefault(); e.target.click(); }
  });
  bx.addEventListener("click", close);
  bp.addEventListener("click", function () { show(cur - 1); });
  bn.addEventListener("click", function () { show(cur + 1); });
  box.addEventListener("click", function (e) { if (e.target === box) close(); });

  document.addEventListener("keydown", function (e) {
    if (box.hidden) return;
    if (e.key === "Escape") close();
    else if (e.key === "ArrowLeft") show(cur - 1);
    else if (e.key === "ArrowRight") show(cur + 1);
    else if (e.key === "Tab") {                                // keep focus inside the viewer
      var f = [bx, bp, bn].filter(function (b) { return b.offsetParent !== null; });
      var k = f.indexOf(document.activeElement);
      e.preventDefault(); f[(k + (e.shiftKey ? -1 : 1) + f.length) % f.length].focus();
    }
  });

  // swipe left / right
  var x0 = null;
  box.addEventListener("touchstart", function (e) { x0 = e.touches[0].clientX; }, { passive: true });
  box.addEventListener("touchend", function (e) {
    if (x0 === null) return;
    var dx = e.changedTouches[0].clientX - x0; x0 = null;
    if (Math.abs(dx) > 50) show(cur + (dx < 0 ? 1 : -1));
  }, { passive: true });

  // keyboard access for tiles that have a photo
  function mark() {
    [].slice.call(gal.children).forEach(function (t) {
      if (url(t) && !t.hasAttribute("role")) { t.setAttribute("role", "button"); t.setAttribute("tabindex", "0"); t.setAttribute("aria-label", "Perbesar foto"); }
    });
  }
  new MutationObserver(mark).observe(gal, { subtree: true, attributes: true, attributeFilter: ["style"], childList: true });
  mark();
})();
