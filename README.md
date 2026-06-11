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

Copier `.env.example` vers `.env.local` si une URL publique est disponible:

```powershell
Copy-Item .env.example .env.local
```

Mettre a jour:

```txt
NEXT_PUBLIC_SITE_URL=https://votre-domaine.com
```

Cette variable sert aux images Open Graph et Twitter Card.

## Contact

- Appel normal: +243 819 428 849
- WhatsApp Business: +243 819 428 849

