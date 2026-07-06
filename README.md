# Mr. Delivery

Landing page interactive pour Mr. Delivery, service de livraison rapide a Lubumbashi, RDC.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- GSAP
- pnpm

## Fonctionnalites

- Landing page mobile-first
- Assistant de commande WhatsApp
- Capture GPS pour ramassage et livraison
- Avis clients envoyes via WhatsApp
- Section reglement avec paiement avant reservation
- Suivi colis par code et QR facture
- Console equipe protegee par mot de passe
- Stockage des commandes et statuts via Neon Postgres
- Animations GSAP et loading screen
- Metadata Open Graph avec logo

## Installation

```powershell
pnpm install
```

## Developpement

```powershell
pnpm run dev
```

Ouvrir ensuite:

```txt
http://localhost:3000
```

Pour tester depuis un telephone ou un autre ordinateur du meme Wi-Fi:

```powershell
pnpm run dev:network
```

Puis trouver l'adresse IPv4 locale:

```powershell
ipconfig
```

Ouvrir ensuite `http://VOTRE-IPV4:3000` depuis l'autre appareil.

## Verification

```powershell
pnpm run typecheck
pnpm run build
```

Ou:

```powershell
pnpm run check
```

## Configuration

Copier `.env.example` vers `.env.local`:

```powershell
Copy-Item .env.example .env.local
```

Mettre a jour:

```txt
NEXT_PUBLIC_SITE_URL=https://mr-delivery-nine.vercel.app
NEXT_PUBLIC_APP_URL=https://mr-delivery-nine.vercel.app
DATABASE_URL=postgresql://neondb_owner:...@ep-...pooler.../neondb?sslmode=require
ADMIN_PASSWORD_HASH=generate-with-pnpm-hash-admin
SESSION_SECRET=long-secret-aleatoire
```

- `NEXT_PUBLIC_SITE_URL` sert aux images Open Graph et Twitter Card.
- `NEXT_PUBLIC_APP_URL` sert de fallback pour les liens QR de suivi; en production, le domaine de la requete est detecte automatiquement.
- `DATABASE_URL` est la connection string Neon.
- `ADMIN_PASSWORD_HASH` protege `/operator` sans stocker le mot de passe en clair.
- `SESSION_SECRET` signe le cookie de session operateur.

Generer le hash du mot de passe equipe:

```powershell
pnpm hash:admin "votre-mot-de-passe"
```

Copier ensuite la valeur affichee par le script dans les variables d'environnement Vercel.
En local uniquement, `ADMIN_PASSWORD` reste accepte comme fallback de developpement.

Dans Vercel, creer une variable nommee `ADMIN_PASSWORD_HASH` et coller uniquement la valeur qui commence par
`scrypt$...`. Ne pas coller `ADMIN_PASSWORD_HASH=` dans le champ valeur.

## Deploiement Vercel

Configurer ces variables dans Vercel Project Settings > Environment Variables:

```txt
DATABASE_URL
ADMIN_PASSWORD_HASH
SESSION_SECRET
NEXT_PUBLIC_APP_URL
NEXT_PUBLIC_SITE_URL
```

Pour `DATABASE_URL`, copier la connection string complete depuis Neon > Connect > Connection string. Elle doit contenir
le vrai domaine Neon `ep-...neon.tech`; ne pas garder `USER`, `PASSWORD` ou `HOST`.

Puis pousser sur GitHub:

```powershell
git push origin main
```

Le projet Vercel connecte au repo GitHub redeploiera automatiquement la branche `main`.

## Workflow equipe

1. Aller sur `/operator`.
2. Se connecter avec le mot de passe equipe.
3. Creer une commande apres confirmation client.
4. Envoyer au client le message WhatsApp avec son code de suivi.
5. Mettre a jour le statut quand le colis est recupere, en livraison ou livre.

Le client peut suivre son colis via `/track`, avec son code, ou via le QR code de la facture.

## Contact

- Appel normal: +243 819 428 849
- WhatsApp Business: +243 819 428 849
