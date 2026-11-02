# Security cleanup and credential rotation

## Status: operationally unverified

The supplied backend export contained a local `.env`, a SQLite database and JaaS/Jitsi key material references. The environment file and database were excluded from this source handoff. No replacement secret values were requested, copied, printed or embedded.

Treat all credentials present in the supplied export as exposed. The operator must rotate/revoke each applicable item in its issuing system and confirm completion outside this chat:

- Database username/password and any database connection string.
- Django `SECRET_KEY` (also invalidate sessions/tokens as operationally appropriate after rotation).
- Paystack test secret; rotate the live secret too if it was ever present in the same environment or reused.
- JaaS/Jitsi application keypair: revoke the old key ID/key pair and provision a new private key securely.
- Any SMTP, Redis, Sentry or other service credentials if they were populated in any copied environment.

Do not put new secret values in Git, ZIPs, tickets or chat. Store them in Render's secret/environment manager. Keep `.env` ignored and commit only `.env.example` placeholders.

## Handoff hygiene

- Excluded `.env`, SQLite database, Jitsi private key, nested source bundle and generated Python caches.
- `.env.example` contains placeholders/local defaults only.
- Scan the final archive before release and inspect the hosting provider's environment settings for old credentials.
- Credential rotation is not marked complete until the operator confirms revocation and replacement.
