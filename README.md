# PocketBase (Docker) + Auto Schema Migrations

This folder runs a PocketBase instance via Docker Compose and **automatically applies PocketBase migrations** on startup to create/update the required collections (schema).

## What happens when you run it

`docker compose up` starts these services:

- **`pocketbase`**
  - Downloads PocketBase `v0.21.0` into the container at runtime.
  - Uses `./pb_data` (bind-mounted) for the SQLite database and storage.
  - Runs:
    - `pocketbase migrate up` (applies `./pb_migrations`)
    - then `pocketbase serve --http=0.0.0.0:8090`
  - Exposes PocketBase on `http://localhost:8090`.

- **`tor`**
  - Runs a Tor hidden service that forwards to `pocketbase:8090`.
  - Persists hidden-service state in `./tor_data` (bind-mounted).

- **`socat-onion`**
  - Forwards connections through Tor to PocketBase.

All services use `restart: unless-stopped` so they automatically restart on failure.

## Schema / migrations

- **Schema source of truth**: `pb_migrations/`
- **Human-readable blueprint**: `SCHEMA.md`

On startup, PocketBase runs `migrate up`, which creates/updates the collections and rules defined in `pb_migrations/`.

## Quickstart

Start everything:

```bash
docker compose up
```

Run in background:

```bash
docker compose up -d
```

Stop:

```bash
docker compose down
```

## Tor hidden service hostname (`tor_data/hostname`)

On the **first** `docker compose up` / `docker compose up -d`, Tor will generate an onion service identity and write the hostname to:

- `tor_data/hostname`

This file is **persisted** via the `./tor_data` bind mount, so the onion hostname stays the same across restarts.

If you delete `tor_data/` and start again, Tor will generate a **new** hostname.

## Reset to a fresh database (recreate schema from migrations)

Because `pb_data/` is bind-mounted, it persists between runs. To start from a clean DB:

```bash
docker compose down
rm -rf pb_data/*
docker compose up
```

PocketBase will recreate `pb_data/data.db` and apply migrations again.

## Git notes

- `pb_data/` and `tor_data/` are **ignored** (runtime state).
- `pb_migrations/` is **tracked** (schema).

