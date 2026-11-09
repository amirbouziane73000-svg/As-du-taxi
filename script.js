const menu=document.getElementById('menu'),nav=document.getElementById('nav');menu.addEventListener('click',()=>{const open=nav.classList.toggle('open');menu.setAttribute('aria-expanded',String(open));menu.textContent=open?'✕':'☰'});nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{nav.classList.remove('open');menu.setAttribute('aria-expanded','false');menu.textContent='☰'}));document.getElementById('year').textContent=new Date().getFullYear();const date=document.getElementById('date');const now=new Date();const local=new Date(now.getTime()-now.getTimezoneOffset()*60000).toISOString().slice(0,10);date.min=local;const email='lasdutaxi73@gmail.com', whatsapp='33765702419';
let channel='whatsapp';
document.querySelectorAll('[data-channel]').forEach(b=>b.addEventListener('click',()=>{channel=b.dataset.channel}));
document.getElementById('bookingForm').addEventListener('submit',e=>{
 e.preventDefault();const f=e.currentTarget;if(!f.reportValidity())return;
 const d=Object.fromEntries(new FormData(f));const msg=document.getElementById('formMessage');
 const now=new Date();const today=new Date(now.getTime()-now.getTimezoneOffset()*60000).toISOString().slice(0,10);
 if(d.date<today){msg.textContent='Choisissez une date à venir.';return;}
 const subject='Demande de trajet — L’AS DU TAXI';
 const body=`Bonjour L'AS DU TAXI,\n\nJe souhaite demander un trajet :\n\nDépart : ${d.from}\nDestination : ${d.to}\nDate : ${d.date}\nHeure : ${d.time}\nPassagers : ${d.passengers}\nService : ${d.service}\nNom : ${d.name}\nTéléphone : ${d.phone}\nPrécisions : ${d.details||'Aucune'}\n\nMerci de me confirmer la disponibilité.`;
 if(channel==='email'){
  window.location.href=`mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  msg.textContent='Vérifiez puis envoyez le message dans votre messagerie.';
 }else{
  window.open(`https://wa.me/${whatsapp}?text=${encodeURIComponent(body)}`,'_blank','noopener,noreferrer');
  msg.textContent='Appuyez sur Envoyer dans WhatsApp pour transmettre votre demande.';
 }
});

// Préselection du service lorsque le visiteur clique sur une carte.
document.querySelectorAll('[data-service]').forEach(link => {
  link.addEventListener('click', () => {
    const select = document.getElementById('service');
    if (select) select.value = link.dataset.service;
  });
});
