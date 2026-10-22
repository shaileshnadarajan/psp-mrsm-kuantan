import { firebaseConfig, firebaseReady } from "./firebase-config.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, collection, onSnapshot, updateDoc } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";
const $=s=>document.querySelector(s);let db,auth,content={};
const defaults={siteTitle:"PUSAT SUMBER PEMBELAJARAN MRSM KUANTAN",tagline:"Gateway to Knowledge and Academic Excellence",welcomeTitle:"Selamat Datang ke Pusat Sumber Pembelajaran MRSM Kuantan",welcomeMessage:"Ruang untuk meneroka ilmu, mengembangkan idea dan mencapai kecemerlangan akademik.",heroImage:"",aboutTitle:"Gerbang ilmu dan kecemerlangan akademik",aboutText:"Pusat Sumber Pembelajaran menyediakan akses kepada bahan rujukan, teknologi dan ruang pembelajaran untuk warga MRSM Kuantan.",contactText:"Pusat Sumber Pembelajaran MRSM Kuantan",schoolLink:"https://kuantan.mrsm.edu.my/",videoCaption:"Tonton video untuk mengenali ruang dan kemudahan kami.",youtubeUrl:"",services:[{name:"General Information",description:"Waktu operasi, peraturan dan maklumat umum PSP.",url:"#about",icon:"ⓘ"},{name:"WebOPAC",description:"Cari koleksi buku, media dan sumber pembelajaran.",url:"https://pspmrsmkuantan.com/opac/",icon:"⌕"},{name:"SpTeks",description:"Sistem Pengurusan Buku Teks.",url:"https://pspmrsmkuantan.com/spteks/login.php",icon:"▤"},{name:"V-Booking",description:"Semak kalendar dan mohon tempahan ruang PSP.",url:"#booking",icon:"▦"},{name:"Web MRSM Kuantan",description:"Portal rasmi MRSM Kuantan.",url:"https://kuantan.mrsm.edu.my/",icon:"⌂"},{name:"Digital Archive",description:"Arkib digital, bahan rujukan dan hasil kerja.",url:"#gallery",icon:"▣"}],announcements:[{title:"Selamat datang ke portal PSP",date:"Makluman",description:"Layari portal ini untuk akses pautan, kemudahan dan maklumat PSP."}],facilities:[{name:"Ruang bacaan",description:"Ruang selesa untuk membaca dan belajar.",image:""},{name:"Ruang komputer",description:"Kemudahan teknologi untuk tugasan akademik.",image:""},{name:"Bilik perbincangan",description:"Ruang untuk perbincangan dan kerja berkumpulan.",image:""}],gallery:[],hours:[{day:"Isnin – Khamis",time:"Sila rujuk makluman PSP"},{day:"Jumaat",time:"Sila rujuk makluman PSP"},{day:"Sabtu – Ahad",time:"Mengikut jadual / program"}]};
function toast(s){const t=$("#toast");t.textContent=s;t.classList.add("show");setTimeout(()=>t.classList.remove("show"),3000)}
function status(id,s){$("#"+id).textContent=s}
function parseLines(id,keys){return $("#"+id).value.split("\n").map(s=>s.trim()).filter(Boolean).map(line=>{const parts=line.split("|").map(x=>x.trim());return Object.fromEntries(keys.map((k,i)=>[k,parts[i]||""]))})}
function lines(items,keys){return (items||[]).map(o=>keys.map(k=>o[k]||"").join(" | ")).join("\n")}
function fillForm(form,obj){Object.entries(obj).forEach(([k,v])=>{const el=form.elements[k];if(el)el.value=v??""})}
function readForm(form){return Object.fromEntries([...form.elements].filter(el=>el.name).map(el=>[el.name,el.value.trim()]))}
function fillEditors(){
 fillForm($("#general-form"),content);
 $("#services-json").value=lines(content.services,[ "name","description","url","icon"]);
 $("#announcements-json").value=lines(content.announcements,["title","date","description"]);
 $("#facilities-json").value=lines(content.facilities,["name","description","image"]);
 $("#gallery-json").value=lines(content.gallery,["caption","image"]);
 $("#hours-json").value=lines(content.hours,["day","time"]);
 fillForm($("#video-form"),content);
}
async function save(patch,statusId){try{content={...content,...patch};await setDoc(doc(db,"site","content"),content,{merge:true});status(statusId,"Disimpan ✓");toast("Perubahan berjaya disimpan.");setTimeout(()=>status(statusId,""),3000)}catch(e){console.error(e);status(statusId,"Gagal menyimpan. Semak sambungan dan rules Firebase.");toast("Tidak dapat menyimpan perubahan.")}}
if(!firebaseReady){$("#login-status").textContent="Firebase belum dikonfigurasi. Buka README.md dan lengkapkan firebase-config.js untuk mengaktifkan log masuk, simpanan online dan dashboard.";$("#login-form").addEventListener("submit",e=>{e.preventDefault();toast("Sila lengkapkan konfigurasi Firebase dahulu.")})}
else{
 const app=initializeApp(firebaseConfig);auth=getAuth(app);db=getFirestore(app);
 onAuthStateChanged(auth,async user=>{if(user){$("#login-panel").hidden=true;$("#dashboard").hidden=false;$("#admin-user").textContent="Log masuk sebagai "+user.email;const snap=await getDoc(doc(db,"site","content"));content={...structuredClone(defaults),...(snap.exists()?snap.data():{})};fillEditors();listenBookings()}else{$("#login-panel").hidden=false;$("#dashboard").hidden=true}});
 $("#login-form").addEventListener("submit",async e=>{e.preventDefault();status("login-status","Sedang log masuk…");try{await signInWithEmailAndPassword(auth,$("#login-email").value,$("#login-password").value);status("login-status","")}catch(err){console.error(err);status("login-status","Log masuk gagal. Semak e-mel/kata laluan atau tetapan Firebase.")}});
 $("#logout-button").addEventListener("click",()=>signOut(auth));
 $("#general-form").addEventListener("submit",e=>{e.preventDefault();save(readForm(e.target),"general-status")});
 $("#video-form").addEventListener("submit",e=>{e.preventDefault();save(readForm(e.target),"video-status")});
 const handlers=[
 ["save-services","services-json",["name","description","url","icon"],"services","services-status"],
 ["save-announcements","announcements-json",["title","date","description"],"announcements","announcements-status"],
 ["save-facilities","facilities-json",["name","description","image"],"facilities","facilities-status"],
 ["save-gallery","gallery-json",["caption","image"],"gallery","gallery-status"],
 ["save-hours","hours-json",["day","time"],"hours","hours-status"]];
 handlers.forEach(([button,input,keys,key,sid])=>$("#"+button).addEventListener("click",()=>save({[key]:parseLines(input,keys)},sid)));
}
document.querySelectorAll(".tab").forEach(b=>b.addEventListener("click",()=>{document.querySelectorAll(".tab").forEach(x=>x.classList.toggle("active",x===b));document.querySelectorAll(".tab-panel").forEach(x=>x.hidden=x.id!=="tab-"+b.dataset.tab)}));
function listenBookings(){
 onSnapshot(collection(db,"bookings"),snap=>{const rows=snap.docs.map(d=>({id:d.id,...d.data()})).sort((a,b)=>(a.date||"").localeCompare(b.date||""));$("#booking-admin-list").innerHTML=rows.length?rows.map(b=>`<article class="booking-admin-card"><div><strong>${esc(b.name)}</strong><p>${esc(b.date)} · ${esc(b.time)} · ${esc(b.room)}</p><p>${esc(b.notes||"Tiada catatan")}</p><small>Status: ${esc(b.status||"Menunggu semakan")}</small></div><select data-status-id="${b.id}" aria-label="Status tempahan"><option ${b.status==="Menunggu semakan"?"selected":""}>Menunggu semakan</option><option ${b.status==="Diluluskan"?"selected":""}>Diluluskan</option><option ${b.status==="Ditolak"?"selected":""}>Ditolak</option></select></article>`).join(""):'<p>Belum ada permohonan tempahan.</p>';$("#booking-admin-list").querySelectorAll("[data-status-id]").forEach(s=>s.addEventListener("change",async()=>{try{await updateDoc(doc(db,"bookings",s.dataset.statusId),{status:s.value});toast("Status tempahan dikemas kini.")}catch(e){toast("Gagal mengemas kini status.")}}))},e=>{console.error(e);$("#booking-admin-list").textContent="Tidak dapat memuatkan tempahan. Semak Firestore rules."});
}
function esc(s=""){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
