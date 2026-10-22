import { firebaseConfig, firebaseReady } from "./firebase-config.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getFirestore, doc, getDoc, setDoc, collection, addDoc, getDocs, query, orderBy, onSnapshot } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

const defaults = {
 siteTitle:"PUSAT SUMBER PEMBELAJARAN MRSM KUANTAN", tagline:"Gateway to Knowledge and Academic Excellence",
 welcomeTitle:"Selamat Datang ke Pusat Sumber Pembelajaran MRSM Kuantan",
 welcomeMessage:"Ruang untuk meneroka ilmu, mengembangkan idea dan mencapai kecemerlangan akademik.",
 heroImage:"", aboutTitle:"Gerbang ilmu dan kecemerlangan akademik",
 aboutText:"Pusat Sumber Pembelajaran menyediakan akses kepada bahan rujukan, teknologi dan ruang pembelajaran untuk warga MRSM Kuantan.",
 contactText:"Pusat Sumber Pembelajaran MRSM Kuantan · Jalan Tok Sira, Alor Akar, 25250 Kuantan, Pahang",
 schoolLink:"https://kuantan.mrsm.edu.my/", videoCaption:"Tonton video untuk mengenali ruang dan kemudahan kami.", youtubeUrl:"",
 services:[
  {name:"General Information",description:"Waktu operasi, peraturan dan maklumat umum PSP.",url:"#about",icon:"ⓘ"},
  {name:"WebOPAC",description:"Cari koleksi buku, media dan sumber pembelajaran.",url:"https://pspmrsmkuantan.com/opac/",icon:"⌕"},
  {name:"SpTeks",description:"Sistem Pengurusan Buku Teks.",url:"https://pspmrsmkuantan.com/spteks/login.php",icon:"▤"},
  {name:"V-Booking",description:"Semak kalendar dan mohon tempahan ruang PSP.",url:"#booking",icon:"▦"},
  {name:"Web MRSM Kuantan",description:"Portal rasmi MRSM Kuantan.",url:"https://kuantan.mrsm.edu.my/",icon:"⌂"},
  {name:"Digital Archive",description:"Arkib digital, bahan rujukan dan hasil kerja.",url:"#gallery",icon:"▣"}
 ],
 announcements:[{title:"Selamat datang ke portal PSP",date:"Makluman",description:"Layari portal ini untuk akses pautan, kemudahan dan maklumat PSP."}],
 facilities:[{name:"Ruang bacaan",description:"Ruang selesa untuk membaca dan belajar.",image:""},{name:"Ruang komputer",description:"Kemudahan teknologi untuk tugasan akademik.",image:""},{name:"Bilik perbincangan",description:"Ruang untuk perbincangan dan kerja berkumpulan.",image:""}],
 gallery:[], hours:[{day:"Isnin – Khamis",time:"Sila rujuk makluman PSP"},{day:"Jumaat",time:"Sila rujuk makluman PSP"},{day:"Sabtu – Ahad",time:"Mengikut jadual / program"}]
};
let db=null, online=false, state=structuredClone(defaults);
const $=s=>document.querySelector(s);
function toast(msg){const el=$("#toast");if(!el)return;el.textContent=msg;el.classList.add("show");setTimeout(()=>el.classList.remove("show"),3200)}
function safeUrl(url){try{const u=new URL(url,location.href);return ["https:","http:"].includes(u.protocol)?u.href:"#"}catch{return "#"}}
function youtubeId(url){try{const u=new URL(url);if(u.hostname.includes("youtu.be"))return u.pathname.slice(1);if(u.searchParams.get("v"))return u.searchParams.get("v");const m=u.pathname.match(/\/(embed|shorts)\/([^/?]+)/);return m?m[2]:""}catch{return ""}}
function render(){
 $("#site-title").textContent=state.siteTitle;$("#site-tagline").textContent=state.tagline;
 $("#welcome-title").textContent=state.welcomeTitle;$("#welcome-message").textContent=state.welcomeMessage;
 $("#about-title").textContent=state.aboutTitle;$("#about-text").textContent=state.aboutText;
 $("#contact-text").textContent=state.contactText;$("#school-link").href=safeUrl(state.schoolLink);
 $("#hero-photo").style.backgroundImage=state.heroImage?`linear-gradient(90deg,rgba(8,35,30,.15),rgba(8,35,30,.02)),url("${state.heroImage.replace(/"/g,"%22")}")`:"";
 $("#service-grid").innerHTML=state.services.map((s,i)=>`<a class="service-card" href="${safeUrl(s.url)}" ${s.url.startsWith("http")?'target="_blank" rel="noopener"':""}><span class="service-icon">${escapeHtml(s.icon||"↗")}</span><strong>${escapeHtml(s.name)}</strong><p>${escapeHtml(s.description)}</p><span class="card-arrow">Teroka ↗</span></a>`).join("");
 $("#announcement-list").innerHTML=state.announcements.length?state.announcements.map(a=>`<article class="announcement-card"><span class="date-pill">${escapeHtml(a.date||"Pengumuman")}</span><h3>${escapeHtml(a.title)}</h3><p>${escapeHtml(a.description)}</p></article>`).join(""):'<p>Tiada pengumuman buat masa ini.</p>';
 $("#facility-grid").innerHTML=state.facilities.map(f=>`<article class="facility-card">${f.image?`<img src="${safeUrl(f.image)}" alt="${escapeHtml(f.name)}" loading="lazy">`:'<div class="facility-art">✦</div>'}<div><h3>${escapeHtml(f.name)}</h3><p>${escapeHtml(f.description)}</p></div></article>`).join("");
 $("#gallery-grid").innerHTML=state.gallery.length?state.gallery.map(g=>`<figure class="gallery-item"><img src="${safeUrl(g.image)}" alt="${escapeHtml(g.caption)}" loading="lazy"><figcaption>${escapeHtml(g.caption)}</figcaption></figure>`).join(""):'<div class="gallery-empty">Galeri akan dikemas kini oleh pentadbir PSP.</div>';
 const id=youtubeId(state.youtubeUrl||"");$("#video-caption").textContent=state.videoCaption||"";
 $("#video-frame").innerHTML=id?`<iframe src="https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}" title="Video PSP MRSM Kuantan" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>`:'<div class="video-placeholder">Video PSP akan dipaparkan di sini apabila pautan YouTube ditambah oleh admin.</div>';
 $("#opening-hours").innerHTML=state.hours.map(h=>`<div class="hour-row"><span>${escapeHtml(h.day)}</span><strong>${escapeHtml(h.time)}</strong></div>`).join("");
}
function escapeHtml(s=""){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
$("#year").textContent=new Date().getFullYear();
$("#menu-toggle").addEventListener("click",()=>{const nav=$("#main-nav"),open=nav.classList.toggle("open");$("#menu-toggle").setAttribute("aria-expanded",String(open))});
document.querySelectorAll("#main-nav a").forEach(a=>a.addEventListener("click",()=>$("#main-nav").classList.remove("open")));
if(firebaseReady){try{const app=initializeApp(firebaseConfig);db=getFirestore(app);online=true;onSnapshot(doc(db,"site","content"),snap=>{if(snap.exists()){state={...structuredClone(defaults),...snap.data()};render()}else render()},err=>{console.warn(err);render()})}catch(e){console.warn(e);render()}}else render();

// V-Booking calendar and request form. Requests are pending until PSP admin confirms.
let shownMonth=new Date();shownMonth.setDate(1);let chosenDate="";
function renderCalendar(){
 const year=shownMonth.getFullYear(),month=shownMonth.getMonth();$("#calendar-month").textContent=new Intl.DateTimeFormat("ms-MY",{month:"long",year:"numeric"}).format(shownMonth);
 const first=new Date(year,month,1),offset=(first.getDay()+6)%7,days=new Date(year,month+1,0).getDate(),arr=[];
 for(let i=0;i<offset;i++)arr.push('<span class="calendar-empty"></span>');
 for(let d=1;d<=days;d++){const iso=`${year}-${String(month+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;arr.push(`<button type="button" class="calendar-day ${iso===chosenDate?"selected":""}" data-date="${iso}">${d}</button>`)}
 $("#calendar-days").innerHTML=arr.join("");
 $("#calendar-days").querySelectorAll("[data-date]").forEach(b=>b.addEventListener("click",()=>{chosenDate=b.dataset.date;$("#booking-date").value=chosenDate;renderCalendar()}));
}
$("#prev-month").addEventListener("click",()=>{shownMonth.setMonth(shownMonth.getMonth()-1);renderCalendar()});
$("#next-month").addEventListener("click",()=>{shownMonth.setMonth(shownMonth.getMonth()+1);renderCalendar()});
$("#booking-date").addEventListener("change",e=>{chosenDate=e.target.value;if(chosenDate){const d=new Date(chosenDate+"T12:00:00");shownMonth=new Date(d.getFullYear(),d.getMonth(),1);renderCalendar()}});
renderCalendar();
$("#booking-form").addEventListener("submit",async e=>{e.preventDefault();const req={date:$("#booking-date").value,name:$("#booking-name").value.trim(),room:$("#booking-room").value,time:$("#booking-time").value.trim(),notes:$("#booking-notes").value.trim(),status:"Menunggu semakan",createdAt:new Date().toISOString()};
 if(!req.date||!req.name||!req.time){toast("Sila lengkapkan medan wajib.");return}
 if(online){try{await addDoc(collection(db,"bookings"),req);$("#booking-status").textContent="Permohonan dihantar. Sila tunggu pengesahan PSP.";toast("Permohonan tempahan dihantar.");e.target.reset();return}catch(err){console.error(err);}}
 const saved=JSON.parse(localStorage.getItem("psp-bookings")||"[]");saved.push(req);localStorage.setItem("psp-bookings",JSON.stringify(saved));$("#booking-status").textContent="Mod pratonton sahaja: permohonan disimpan pada peranti ini. Aktifkan Firebase untuk perkongsian online.";toast("Disimpan dalam mod pratonton.");e.target.reset();
});
