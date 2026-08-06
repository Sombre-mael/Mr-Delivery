# Exploitation Mr. Delivery

## Avant chaque déploiement

1. Exécuter `pnpm run typecheck`, `pnpm run test` et `pnpm run build`.
2. Appliquer les migrations avec `pnpm run db:migrate` avant de déployer le code qui en dépend.
3. Vérifier les variables Vercel `DATABASE_URL`, `ADMIN_PASSWORD_HASH`, `SESSION_SECRET`, `NEXT_PUBLIC_SITE_URL` et `NEXT_PUBLIC_APP_URL`.
4. Tester une commande, une mise à jour de statut, le QR et le suivi depuis un téléphone.

## Données et sauvegarde

- Neon reste la source de vérité des commandes.
- Vérifier régulièrement la fenêtre de restauration disponible dans Neon et effectuer un test de restauration sur une branche isolée.
- Les commandes archivées restent accessibles depuis la console opérateur.
- Après 24 mois sans activité, supprimer ou anonymiser les données personnelles, sauf obligation légale ou litige en cours.
- Toute demande de suppression doit être vérifiée avec le code de suivi et une preuve raisonnable d’identité.

## Incidents

- Consulter les Runtime Logs du déploiement Vercel concerné.
- En cas d’indisponibilité Neon, ne pas recréer la commande plusieurs fois: conserver la confirmation WhatsApp puis réessayer.
- En cas de fuite ou d’accès suspect, changer immédiatement `ADMIN_PASSWORD_HASH` et `SESSION_SECRET`; cela invalide les sessions existantes.
- Contrôler les erreurs et les performances dans Vercel Analytics et Speed Insights après chaque mise en production.
