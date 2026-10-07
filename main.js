/* ============ EDIT YOUR DETAILS HERE ============ */
// Wedding date & time (used by the countdown). Format: YYYY-MM-DDTHH:MM:SS+07:00 (WIB)
var WEDDING = new Date("2026-12-26T09:00:00+07:00");

// Photo files. Put them in the "images" folder using these names (or change the names here).
// Until a file exists, a coloured placeholder is shown.
var PHOTOS = {
  groom: "images/groom.jpg",
  bride: "images/bride.jpg",
  gallery: [
    "images/gallery-1.jpg", "images/gallery-2.jpg", "images/gallery-3.jpg",
    "images/gallery-4.jpg", "images/gallery-5.jpg", "images/gallery-6.jpg"
    // add more lines to show more photos
  ]
};
/* ================================================= */

var rm = matchMedia("(prefers-reduced-motion: reduce)").matches;

// ---- hero: names slide in from the sides as you scroll ----
var hero=document.getElementById("hero"),n1=document.getElementById("n1"),n2=document.getElementById("n2"),
amp=document.getElementById("amp"),hd=document.getElementById("hd"),hint=document.getElementById("hint");
function clamp(x){return Math.max(0,Math.min(1,x))}
function tick(){
  var p = rm ? 1 : clamp(scrollY/(hero.offsetHeight-innerHeight)), e=1-Math.pow(1-clamp(p/.7),3), d=(1-e)*70;
  n1.style.transform="translateX("+(-d)+"vw)";n2.style.transform="translateX("+d+"vw)";
  n1.style.opacity=n2.style.opacity=.15+.85*e;
  amp.style.transform="scale("+clamp((p-.6)/.25)+")";
  hd.style.opacity=clamp((p-.8)/.2);hint.style.opacity=p>.05?0:1;
}
addEventListener("scroll",tick,{passive:true});addEventListener("resize",tick);tick();

// ---- photos: show the image only if the file exists ----
function addPhoto(box,src,alt){
  var im=new Image();im.alt=alt||"";
  im.onload=function(){box.appendChild(im);var s=box.querySelector("span");if(s)s.remove()};
  im.src=src;
}
document.querySelectorAll("[data-photo]").forEach(function(b){addPhoto(b,PHOTOS[b.dataset.photo],b.dataset.photo)});
var gal=document.getElementById("gal");
PHOTOS.gallery.forEach(function(src,i){
  var w=document.createElement("div");w.className="gi rv";          // wrapper triggers the scroll reveal
  w.style.transitionDelay=((i+1)%3)*120+"ms";
  var d=document.createElement("div");d.className="ph";d.innerHTML="<span>Photo "+(i+1)+"</span>";
  w.appendChild(d);gal.appendChild(w);addPhoto(d,src,"Gallery photo "+(i+1));
});

// ---- scroll reveal ----
var io=new IntersectionObserver(function(es){es.forEach(function(x){if(x.isIntersecting){x.target.classList.add("in");io.unobserve(x.target)}})},{threshold:.2});
document.querySelectorAll(".rv").forEach(function(el){io.observe(el)});

// ---- countdown ----
var cd=document.getElementById("cd");
function cdTick(){
  var s=Math.max(0,Math.floor((WEDDING-new Date())/1000)),
  v=[[Math.floor(s/86400),"days"],[Math.floor(s%86400/3600),"hours"],[Math.floor(s%3600/60),"minutes"],[s%60,"seconds"]];
  cd.innerHTML=v.map(function(a){return "<div><strong>"+a[0]+"</strong><span>"+a[1]+"</span></div>"}).join("");
}
cdTick();setInterval(cdTick,1000);
