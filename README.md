# L’AS DU TAXI — réservations e-mail automatiques

Le bouton « Envoyer par e-mail » appelle `/api/reservation` sur Vercel. Il envoie la demande à **lasdutaxi73@gmail.com** via Resend, sans ouvrir Gmail. Le bouton WhatsApp reste inchangé.

## Configuration indispensable (une seule fois)
1. Créer un compte sur https://resend.com et vérifier un domaine que vous possédez dans Resend (DNS SPF/DKIM selon leurs indications).
2. Créer une clé API Resend.
3. Dans Vercel > Project > Settings > Environment Variables, ajouter `RESEND_API_KEY` et `RESERVATION_FROM_EMAIL` (exemple : `L'AS DU TAXI <reservations@votre-domaine.fr>`). Ne jamais mettre la clé dans GitHub.
4. Redéployer le projet sur Vercel. Tester une demande et vérifier la réception sur lasdutaxi73@gmail.com, y compris les spams.

Sans ces variables, le formulaire affiche un message d'indisponibilité et le client peut utiliser WhatsApp. Les demandes ne sont pas des réservations confirmées. Le formulaire contient une protection basique contre les robots, mais pour une exposition importante, ajouter un CAPTCHA et une limitation de débit côté serveur.
