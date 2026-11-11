
const LIMIT = 12000;
const clean = (v, max = 200) =>
  typeof v === 'string' ? v.trim().slice(0, max) : '';

const esc = s => s.replace(/[&<>"']/g, c => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;',
  '"': '&quot;', "'": '&#39;'
}[c]));

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Méthode non autorisée.' });
  }

  if (Number(req.headers['content-length'] || 0) > LIMIT) {
    return res.status(413).json({ error: 'Demande trop longue.' });
  }

  const origin = req.headers.origin;
  const host = req.headers.host;

  if (origin) {
    try {
      if (new URL(origin).host !== host) {
        return res.status(403).json({ error: 'Origine non autorisée.' });
      }
    } catch {
      return res.status(403).json({ error: 'Origine invalide.' });
    }
  }

  const b = req.body || {};
  if (b.website) return res.status(200).json({ ok: true });

  const d = {
    from: clean(b.from, 180),
    to: clean(b.to, 180),
    date: clean(b.date, 10),
    time: clean(b.time, 5),
    passengers: clean(b.passengers, 2),
    service: clean(b.service, 60),
    name: clean(b.name, 100),
    phone: clean(b.phone, 30),
    details: clean(b.details, 500)
  };

  if (
    !d.from || !d.to || !d.name ||
    !/^[+\d\s().-]{8,30}$/.test(d.phone) ||
    d.phone.replace(/\D/g, '').length < 8 ||
    !/^[1-8]$/.test(d.passengers) ||
    !/^\d{4}-\d{2}-\d{2}$/.test(d.date) ||
    !/^([01]\d|2[0-3]):[0-5]\d$/.test(d.time)
  ) {
    return res.status(400).json({
      error: 'Vérifiez les informations de votre réservation.'
    });
  }

  const nowLocal = new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Europe/Paris',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hourCycle: 'h23'
  }).format(new Date()).replace(' ', 'T');

  if (`${d.date}T${d.time}` < nowLocal) {
    return res.status(400).json({
      error: 'Choisissez une date et une heure futures.'
    });
  }

  if (!process.env.RESEND_API_KEY ||
      !process.env.RESERVATION_FROM_EMAIL) {
    return res.status(503).json({
      error: 'Le service e-mail est en cours de configuration.'
    });
  }

  const fields = [
    ['Nom', d.name],
    ['Téléphone', d.phone],
    ['Départ', d.from],
    ['Destination', d.to],
    ['Date', d.date],
    ['Heure', d.time],
    ['Passagers', d.passengers],
    ['Service', d.service],
    ['Précisions', d.details || 'Aucune']
  ];

  const text = fields.map(([k, v]) => `${k} : ${v}`).join('\n') +
    '\n\nDemande à confirmer par le chauffeur.';

  const html = '<h2>Nouvelle demande de réservation — L’AS DU TAXI</h2>' +
    fields.map(([k, v]) =>
      `<p><strong>${esc(k)} :</strong> ${esc(v)}</p>`
    ).join('') +
    '<p>Demande à confirmer par le chauffeur.</p>';

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: process.env.RESERVATION_FROM_EMAIL,
        to: ['lasdutaxi73@gmail.com'],
        subject: `Nouvelle réservation taxi — ${d.date} — ${d.name}`,
        text,
        html
      })
    });

    if (!response.ok) {
      console.error('Resend status:', response.status);
      return res.status(502).json({
        error: 'Envoi impossible. Réessayez ou utilisez WhatsApp.'
      });
    }

    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error('Email delivery request failed');
    return res.status(502).json({
      error: 'Le service e-mail est momentanément indisponible.'
    });
  }
}
