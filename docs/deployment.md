# Weddings Deployment Guide

This repository deploys the Weddings app to the existing Coolify server and exposes three HTTPS environments through the Coolify proxy.

## Environments

| Environment | Branch | Compose project | Internal app port | Public URL |
| --- | --- | --- | --- | --- |
| Development | `develop` | `weddings-development` | `3021` | `https://dev-weddings.apps.cortanexai.com` |
| Staging | `staging` | `weddings-staging` | `3021` | `https://staging-weddings.apps.cortanexai.com` |
| Production | `main` | `weddings-production` | `3021` | `https://weddings.apps.cortanexai.com` |

The app does not publish host ports directly. Traefik routes HTTPS traffic from the `coolify` Docker network to container port `3021`.

## GitHub Pipelines

`CI` runs on pull requests and pushes to `main`, `staging`, and `develop`.

`Deploy` runs on pushes to:

- `main` for production
- `staging` for staging
- `develop` for development

Manual deployments are available from GitHub Actions using the `Deploy` workflow and the `workflow_dispatch` environment input.

## Required GitHub Secrets

| Secret | Purpose |
| --- | --- |
| `DEPLOY_HOST` | Server IP or hostname. |
| `DEPLOY_PORT` | SSH port, normally `22`. |
| `DEPLOY_USER` | SSH deployment user, normally `qualixa-deploy`. |
| `DEPLOY_SSH_KEY` | Private SSH key authorized for the deployment user. |
| `DEPLOY_NOTIFY_EMAIL_TO` | Mailcow recipient for deployment notifications. |
| `DEPLOY_NOTIFY_EMAIL_FROM` | Mailcow sender address for deployment notifications. |
| `DEPLOY_NOTIFY_SLACK_WEBHOOK_URL` | Slack incoming webhook URL. Store as a secret only. |
| `DEPLOY_NOTIFY_SLACK_CHANNEL` | Optional Slack channel override. |
| `DEPLOY_NOTIFY_N8N_WEBHOOK_URL` | Optional n8n webhook endpoint. |
| `DEPLOY_NOTIFY_N8N_WEBHOOK_SECRET` | Optional shared secret sent to n8n as `X-Deployment-Webhook-Secret`. |
| `VITE_SUPABASE_URL` | Public Supabase URL baked into the client build. |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Public Supabase publishable key baked into the client build. |
| `VITE_SUPABASE_PROJECT_ID` | Public Supabase project ID baked into the client build. |
| `SUPABASE_URL` | Runtime Supabase URL for SSR and server functions. |
| `SUPABASE_PUBLISHABLE_KEY` | Runtime Supabase publishable key for SSR and server functions. |
| `SUPABASE_PROJECT_ID` | Runtime Supabase project ID. |
| `SUPABASE_SERVICE_ROLE_KEY` | Optional, required only for admin operations that bypass RLS. |
| `LOVABLE_DB_MIGRATION_URL` | Optional Drizzle/Lovable migration URL. |

The deployment script can read public Supabase defaults from `.env.docker.example`, but production values should still be managed through GitHub secrets.

## Coolify

Coolify dashboard:

`https://coolify.cortanexai.com`

Project:

`weddings`

Environments:

- `development`
- `staging`
- `production`

Each environment contains one service named `weddings-<environment>` and one application named `web`.

Use Coolify to monitor service status, inspect environment metadata, and view container logs from the service page. The same logs are available from SSH:

```bash
docker compose -f /opt/weddings/development/current/docker-compose.deploy.yml --env-file /opt/weddings/development/shared/.env -p weddings-development logs -f web
docker compose -f /opt/weddings/staging/current/docker-compose.deploy.yml --env-file /opt/weddings/staging/shared/.env -p weddings-staging logs -f web
docker compose -f /opt/weddings/production/current/docker-compose.deploy.yml --env-file /opt/weddings/production/shared/.env -p weddings-production logs -f web
```

## Server Layout

Runtime files are stored under:

```text
/opt/weddings/development
/opt/weddings/staging
/opt/weddings/production
```

Each environment has:

- `releases/<git-sha>` for immutable release archives.
- `current` as a symlink to the active release.
- `shared/.env` for runtime values.
- `shared/notify.env` for Mailcow, Slack, and optional n8n notification settings.

The deployer keeps the newest five releases per environment.

## Notifications

Every deployment sends success or failure details to:

- Mailcow through the local postfix container.
- Slack through the configured incoming webhook.
- n8n if `DEPLOY_NOTIFY_N8N_WEBHOOK_URL` is configured.

Notifications include environment, URL, branch, commit, actor, GitHub run URL, duration, status, and Docker Compose service state.

## Switching GitHub Accounts

To deploy from a different GitHub account:

1. Add the new account as an admin or maintainer on the GitHub repository.
2. Authenticate locally with `gh auth login`.
3. Confirm the active account with `gh auth status`.
4. Recreate repository secrets under the target repository or organization.
5. Make sure the deployment SSH public key remains in `/home/qualixa-deploy/.ssh/authorized_keys` on the server.
6. Push to `main`, `staging`, or `develop`, or run the `Deploy` workflow manually.

For organization repositories, also check that Actions are enabled and that environment protection rules allow deployments to `development`, `staging`, and `production`.
