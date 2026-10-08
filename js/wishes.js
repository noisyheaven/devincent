// WISHES v2: (1) guests must choose Hadir / Tidak hadir, (2) the name comes from the link (?to=Nama).
// Loads after main.js and takes over the "Ucapan & Doa" form. WISHES_URL is still set in main.js.
(function () {
  var old = document.getElementById("wishForm"); if (!old) return;
  var form = old.cloneNode(true); old.parentNode.replaceChild(form, old);      // drops the old submit handler
  if (window.io) io.observe(form); else form.classList.add("in");            // keep the fade-in on scroll
  var $ = function (id) { return document.getElementById(id); };
  var nm = $("wName"), msg = $("wMsg"), btn = $("wBtn"), st = $("wStatus"), list = $("wishList");
  var URL_ = window.WISHES_URL || "";

  var css = document.createElement("style");
  css.textContent =
    '.wish .att{display:grid;grid-template-columns:1fr 1fr;gap:10px;border:0;padding:0;margin:0;min-width:0}' +
    '.wish .att legend{font-size:.85rem;color:#8a7378;margin-bottom:6px;padding:0}' +
    '.wish .att label{position:relative;display:block}' +
    '.wish .att input{position:absolute;opacity:0;width:1px;height:1px;padding:0;border:0}' +
    '.wish .att span{display:block;text-align:center;border:1px solid var(--wine);border-radius:10px;padding:11px 8px;cursor:pointer;color:var(--wine);background:#fff}' +
    '.wish .att input:checked+span{background:var(--wine);color:#fff}' +
    '.wish .att input:focus-visible+span{outline:2px solid var(--wine);outline-offset:2px}' +
    '.wish input[readonly]{background:#f7eef0;color:#6b5a5f}' +
    '.wi .tag{display:inline-block;font-size:.7rem;border-radius:99px;padding:1px 9px;margin-left:8px;vertical-align:middle}' +
    '.wi .tag.y{background:#e3f2e8;color:#1e6b3a}.wi .tag.n{background:#f3e6e8;color:#8a4a56}';
  document.head.appendChild(css);

  // attendance choice (placed between name and message)
  var fs = document.createElement("fieldset"); fs.className = "att";
  fs.innerHTML = '<legend>Konfirmasi kehadiran</legend>' +
    '<label><input type="radio" name="att" value="Hadir" required><span>Hadir</span></label>' +
    '<label><input type="radio" name="att" value="Tidak hadir" required><span>Tidak hadir</span></label>';
  msg.parentNode.insertBefore(fs, msg);

  // name from the link
  var to = (new URLSearchParams(location.search).get("to") || "").trim().slice(0, 60);
  if (to) { nm.value = to; nm.readOnly = true; nm.title = "Nama sesuai undangan"; }

  function ago(t) {
    var s = (Date.now() - t) / 1000;
    if (s < 60) return "baru saja"; if (s < 3600) return Math.floor(s / 60) + " menit lalu";
    if (s < 86400) return Math.floor(s / 3600) + " jam lalu"; return Math.floor(s / 86400) + " hari lalu";
  }
  function item(w) {
    var d = document.createElement("div"); d.className = "wi";
    var b = document.createElement("b"); b.textContent = w.n; d.appendChild(b);
    if (w.a === "Hadir" || w.a === "Tidak hadir") {
      var g = document.createElement("span"); g.className = "tag " + (w.a === "Hadir" ? "y" : "n"); g.textContent = w.a; d.appendChild(g);
    }
    var p = document.createElement("p"); p.textContent = w.m; d.appendChild(p);
    var s = document.createElement("small"); s.textContent = ago(w.t); d.appendChild(s);
    return d;
  }
  window.wishItem = item;                                                       // keeps main.js's list the same
  function render(items) {
    list.innerHTML = "";
    if (!items.length) { list.innerHTML = '<div class="empty">Jadilah yang pertama mengirim ucapan.</div>'; return; }
    items.forEach(function (w) { list.appendChild(item(w)); });
  }
  function localGet() { try { return JSON.parse(localStorage.getItem("wishes") || "[]"); } catch (e) { return []; } }
  function load() {
    if (!URL_) { render(localGet()); st.textContent = "Mode uji coba: ucapan hanya tersimpan di browser ini."; return; }
    fetch(URL_).then(function (r) { return r.json(); }).then(render)
      .catch(function () { list.innerHTML = '<div class="empty">Ucapan belum dapat dimuat.</div>'; });
  }
  load();

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if ($("wHp").value) return;                                                 // spam trap
    var c = form.querySelector("input[name=att]:checked");
    var w = { n: nm.value.trim(), m: msg.value.trim(), a: c ? c.value : "", t: Date.now() };
    if (!w.n || !w.m || !w.a) { st.textContent = "Mohon pilih konfirmasi kehadiran."; return; }
    btn.disabled = true; st.textContent = "Mengirim...";
    function done() {
      if (list.querySelector(".empty")) list.innerHTML = "";
      list.insertBefore(item(w), list.firstChild);
      msg.value = ""; st.textContent = "Terima kasih atas ucapan dan doanya."; btn.disabled = false;
    }
    function fail() { st.textContent = "Gagal mengirim, silakan coba lagi."; btn.disabled = false; }
    if (!URL_) { try { var l = localGet(); l.unshift(w); localStorage.setItem("wishes", JSON.stringify(l.slice(0, 100))); } catch (x) {} done(); return; }
    fetch(URL_, { method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ n: w.n, m: w.m, a: w.a, h: "" }) })
      .then(function (r) { return r.json(); }).then(function (r) { r.ok ? done() : fail(); }).catch(fail);
  });
})();
