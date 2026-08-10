<div align="center">
  <img src="public/logo-mr-delivery.jpeg" alt="Logo Mr. Delivery" width="220" />

  # Mr. Delivery

  **Vos colis pris en charge rapidement, suivis simplement.**

  Plateforme de commande et de suivi de livraison conçue pour les particuliers,
  commerces et entreprises de Lubumbashi.

  [Accéder à Mr. Delivery](https://mr-delivery-nine.vercel.app) · [Suivre un colis](https://mr-delivery-nine.vercel.app/track)
</div>

## Une livraison plus simple

Mr. Delivery centralise le parcours essentiel d'une livraison dans une expérience mobile claire. Le client décrit son besoin, partage les lieux de ramassage et de destination, échange avec l'équipe sur WhatsApp, puis suit l'évolution de son colis grâce à un code personnel.

L'objectif du MVP est concret: réduire les échanges inutiles, rassurer le client et permettre à l'équipe de gérer chaque commande depuis un seul espace.

## Expérience client

- Assistant guidé pour préparer une demande de livraison
- Recommandation de pack selon le besoin, le colis et l'urgence
- Position GPS pour préciser le ramassage et la destination
- Commande et confirmation via WhatsApp
- Code de suivi individuel et facture avec QR code
- Progression visible: paiement, récupération, livraison et arrivée
- Notifications push lors des changements de statut
- Installation mobile sous forme d'application PWA
- Contact direct par WhatsApp ou appel téléphonique

## Outils pour l'équipe

La console opérateur permet à Mr. Delivery de gérer l'activité quotidienne sans multiplier les outils:

- création et modification des commandes confirmées;
- historique, recherche et filtrage des livraisons;
- tableau de bord avec les principaux indicateurs;
- mise à jour des statuts et relances WhatsApp;
- notifications automatiques envoyées aux clients abonnés;
- génération de factures et QR codes de suivi;
- archivage des commandes terminées.

## Parcours d'une commande

1. Le client prépare sa demande depuis le site.
2. L'équipe confirme le service et le paiement sur WhatsApp.
3. La commande est enregistrée avec un code de suivi unique.
4. Le client installe Mr. Delivery sur son téléphone et active les notifications.
5. L'équipe met à jour l'état du colis à chaque étape.
6. Le client suit la progression jusqu'à la livraison.

## Confiance et confidentialité

- Les informations publiques de suivi sont partiellement masquées.
- Les notes internes ne sont jamais affichées au client.
- L'accès opérateur est protégé par une session sécurisée et un mot de passe haché.
- Les codes de suivi sont générés de manière cryptographiquement sûre.
- Les données de commande sont stockées dans PostgreSQL sur Neon.
- Les pages [Confidentialité](https://mr-delivery-nine.vercel.app/confidentialite) et [Conditions](https://mr-delivery-nine.vercel.app/conditions) présentent les règles du service.

## État du produit

Mr. Delivery est actuellement un MVP prêt pour un pilote opérationnel. WhatsApp reste le canal principal de confirmation, tandis que la plateforme prend en charge la préparation des demandes, le suivi, les notifications et la gestion interne.

## Contact

- Téléphone et WhatsApp: [+243 819 428 849](tel:+243819428849)
- Email: [mrdelivery004@gmail.com](mailto:mrdelivery004@gmail.com)
- Zone actuelle: Lubumbashi, République démocratique du Congo

---

## Documentation technique

### Technologies

Next.js App Router, TypeScript, Tailwind CSS, GSAP, Neon Postgres, Web Push et pnpm.

### Démarrage local

```powershell
pnpm install
Copy-Item .env.example .env.local
pnpm run dev
```

L'application est alors disponible sur `http://localhost:3000`. Pour un test sur le même réseau Wi-Fi, utiliser `pnpm run dev:network` puis ouvrir `http://VOTRE-IPV4:3000` sur le téléphone.

### Configuration

Les variables nécessaires sont documentées dans `.env.example`. Les principales concernent Neon, la session administrateur, l'URL publique et les clés VAPID utilisées pour les notifications.

```powershell
pnpm hash:admin "votre-mot-de-passe"
pnpm push:keys
pnpm run db:migrate
```

### Vérification

```powershell
pnpm run typecheck
pnpm run test
pnpm run build
```

Les procédures d'exploitation, de sauvegarde et de gestion d'incident se trouvent dans [`docs/operations.md`](docs/operations.md).

## Déploiement

La branche `main` est déployée automatiquement sur Vercel après chaque push GitHub. Les secrets restent configurés dans Vercel et ne doivent jamais être ajoutés au dépôt.
