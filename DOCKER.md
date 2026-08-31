# Self-hosting the frontend with Docker Compose

The frontend (SSR + server functions) runs as a plain Node server and talks to the
existing backend exactly as it does today. Nothing on the backend changes.

## 1. Configure environment

```bash
cp .env.docker.example .env
```

The `VITE_*` values are compiled into the browser bundle; the non-prefixed ones are
read by the Node server at runtime. Both point to the same backend project.

## 2. Build and run

```bash
docker compose up -d --build
```

The app is served on `http://<your-server>:3000` (change with `PORT` in `.env`).

## 3. Update after code changes

```bash
git pull && docker compose up -d --build
```

## Notes

- The image is built with `NITRO_PRESET=node-server`, so the output is
  `.output/server/index.mjs`, runnable on any Node 22 host.
- Put nginx/Caddy in front for TLS and proxy to port 3000.
- Add your server's origin to the backend auth "Redirect URLs" so Google sign-in
  returns to your domain.
- `SUPABASE_SERVICE_ROLE_KEY` is optional and only needed for admin actions that
  bypass row level security; leave it unset if you don't use them.
