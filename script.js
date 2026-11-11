const menu=document.getElementById('menu'),nav=document.getElementById('nav');
menu.addEventListener('click',()=>{const open=nav.classList.toggle('open');menu.setAttribute('aria-expanded',String(open));menu.textContent=open?'✕':'☰'});
nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{nav.classList.remove('open');menu.setAttribute('aria-expanded','false');menu.textContent='☰'}));
document.getElementById('year').textContent=new Date().getFullYear();
const form=document.getElementById('bookingForm');
const dateField=document.getElementById('date');
const msg=document.getElementById('formMessage');
const whatsapp='33765702419';
const email='lasdutaxi73@gmail.com';
const localDate=(d)=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
const localTime=(d)=>`${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
dateField.min=localDate(new Date());
async function prepare(channel){
 msg.textContent='';
 dateField.min=localDate(new Date());
 if(!form.reportValidity())return;
 const d=Object.fromEntries(new FormData(form));
 const depart=new Date(`${d.date}T${d.time}:00`);
 if(Number.isNaN(depart.getTime())||depart.getTime()<Date.now()-60000){msg.textContent='Choisissez une date et une heure de départ futures.';dateField.focus();return;}
 const phone=d.phone.trim();
 if(!/^[+\d\s().-]{8,25}$/.test(phone)||phone.replace(/\D/g,'').length<8){msg.textContent='Vérifiez le numéro de téléphone.';document.getElementById('phone').focus();return;}
 const body=`Bonjour L'AS DU TAXI,\n\nJe souhaite demander un trajet :\n\nDépart : ${d.from.trim()}\nDestination : ${d.to.trim()}\nDate : ${d.date}\nHeure : ${d.time}\nPassagers : ${d.passengers}\nService : ${d.service}\nNom : ${d.name.trim()}\nTéléphone : ${phone}\nPrécisions : ${d.details?.trim()||'Aucune'}\n\nMerci de me confirmer la disponibilité et le tarif.`;
 if(channel==='email'){
  const button=document.querySelector('[data-channel="email"]');
  button.disabled=true;
  const label=button.textContent;
  button.textContent='Envoi en cours…';
  msg.textContent='Envoi de votre demande…';
  try{
   const response=await fetch('/api/reservation',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...d,website:document.getElementById('website').value})});
   const result=await response.json();
   if(!response.ok||!result.ok)throw new Error(result.error||'Envoi impossible.');
   msg.textContent='Votre demande a bien été envoyée par e-mail ! Nous vous recontacterons pour confirmer le trajet.';
   form.reset();
  }catch(err){msg.textContent=err.message||'Impossible d’envoyer la demande. Essayez WhatsApp.';}
  finally{button.disabled=false;button.textContent=label;}
 }else{
  const url=`https://wa.me/${whatsapp}?text=${encodeURIComponent(body)}`;
  // Navigation directe, fiable sur les navigateurs mobiles qui bloquent les fenêtres.
  window.location.href=url;
  msg.textContent='WhatsApp va s’ouvrir. Appuyez sur Envoyer pour transmettre votre demande.';
 }
}
document.querySelectorAll('[data-channel]').forEach(button=>button.addEventListener('click',()=>prepare(button.dataset.channel)));
form.addEventListener('submit',e=>{e.preventDefault();prepare('whatsapp')});
document.querySelectorAll('[data-service]').forEach(link=>link.addEventListener('click',()=>{const select=document.getElementById('service');if(select)select.value=link.dataset.service;}));
