# Déploiement — Front sur Vercel, base + backend sur le Mac mini

> Statut : **plan à valider** (rien n'est encore déployé selon ce schéma).

## Architecture cible

```
Navigateur ──HTTPS──► Vercel (Next.js : pages + API routes /api/*)
    │                        │
    │ (auth, lecture REST)   │ (clé service, routes admin)
    ▼                        ▼
https://api.<ton-domaine> ── Cloudflare Tunnel ──► Mac mini
                                                   └─ docker compose : kong → auth (GoTrue), rest (PostgREST), db (Postgres 17)
```

- **Vercel** héberge le front et les API routes Next (`/api/pricing`, `/api/students`…). Rien à installer.
- **Mac mini** fait tourner la pile Supabase de `docker-compose.yml` (sans le service `app` de dev ni Studio exposé).
- **Cloudflare Tunnel** (`cloudflared`) expose uniquement Kong en HTTPS sur `api.<ton-domaine>` : aucun port ouvert sur la box, certificat géré par Cloudflare. Alternative : Tailscale Funnel.

## Ce qu'il faut changer par rapport au docker compose de dev

| Élément | Dev (actuel) | Production Mac mini |
|---|---|---|
| Secrets | Clés de démo publiques | **Nouveau `JWT_SECRET`** + clés anon / service **régénérées** et signées avec lui, mot de passe Postgres fort — dans un `.env` non versionné |
| URL publique | `http://localhost:54321` | `https://api.<ton-domaine>` (`API_EXTERNAL_URL`, `GOTRUE_SITE_URL` = domaine Vercel) |
| Emails | Mailpit (local) | Vrai SMTP (Brevo, Resend, OVH…) |
| Services | app + studio + mailpit | db, auth, rest, kong (+ studio accessible seulement en local / via Tailscale) |
| Redémarrage | manuel | `restart: unless-stopped` + Docker lancé au démarrage du Mac |
| Sauvegardes | aucune | `pg_dump` quotidien (cron/launchd) vers un disque externe + une copie hors site |

## Variables d'environnement Vercel

```
NEXT_PUBLIC_SUPABASE_URL=https://api.<ton-domaine>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<clé anon régénérée>
SUPABASE_SERVICE_ROLE_KEY=<clé service régénérée>   # jamais côté client
ADMIN_EMAILS=<email admin>
LEARNER_TOKEN_SECRET=<chaîne aléatoire longue>   # signe les sessions apprenant (sinon dérivé de SUPABASE_SERVICE_ROLE_KEY)
NEXT_PUBLIC_SITE_URL=https://<domaine du site>
```
`SUPABASE_INTERNAL_URL` ne doit **pas** être défini sur Vercel.

## Réglages du Mac mini
- Empêcher la veille : `sudo pmset -a sleep 0 disksleep 0` et « Redémarrer automatiquement après une coupure de courant »
- Docker Desktop (ou OrbStack / Colima) lancé à l'ouverture de session
- `cloudflared` installé en service (`cloudflared service install`)

## Migration depuis Supabase cloud
1. `pg_dump` des schémas `public` et `auth` du projet actuel
2. Restauration dans le Postgres du Mac mini, puis `npm run db:migrate` pour les migrations manquantes
3. Bascule des variables Vercel, test, puis mise en pause du projet cloud (garder en secours quelques semaines)

## Risques à accepter
- Disponibilité = celle de la connexion internet et de l'électricité de la maison
- Débit montant de la box et latence Vercel ↔ maison (choisir la région Vercel `cdg1` Paris)
- Mises à jour de sécurité (macOS, Docker, images Supabase) à ta charge

## Décisions à prendre
1. Nom de domaine (et DNS chez Cloudflare ?)
2. Tunnel : Cloudflare Tunnel (recommandé) ou Tailscale Funnel
3. ~~Fournisseur SMTP~~ : **Brevo** (`smtp-relay.brevo.com`, port 587) — voir ci-dessous
4. Garder Supabase cloud en secours ou non

## Emails d'inscription (Brevo)

Les mails de confirmation / reset sont envoyés par Supabase Auth (GoTrue) ; Brevo en est le relais SMTP.
1. Brevo → *SMTP & API* → créer une **clé SMTP** (≠ mot de passe du compte) ; valider l'expéditeur (ou le domaine : SPF + DKIM) dans *Expéditeurs, domaines*
2. Supabase (prod) → *Authentication → Emails → SMTP Settings* → activer le SMTP personnalisé :
   host `smtp-relay.brevo.com` · port `587` · user = identifiant SMTP Brevo (`…@smtp-brevo.com`) · password = clé SMTP · sender = expéditeur validé
3. *Authentication → Rate Limits* : relever la limite d'emails (le défaut est très bas)
4. *Authentication → URL Configuration* : Site URL = domaine Vercel, et `…/auth/confirm` dans les Redirect URLs
5. Test : créer un compte avec une adresse neuve, puis consulter *Brevo → Transactionnel → Logs*

Auto-hébergé (Mac mini) : mêmes valeurs dans `GOTRUE_SMTP_*` (variables `SMTP_*` lues par `docker-compose.yml`). Ne jamais commiter la clé SMTP.
