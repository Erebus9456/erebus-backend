# PocketBase Schema Blueprint

- **Generated**: `2026-04-21 17:39:23`

> Blueprint-style schema: collections (tables), fields (columns), and access rules. Internal IDs and runtime-only metadata are intentionally omitted.

## `chats`

- **type**: `base`

### Rules

- **listRule**: `members ~ @request.auth.id`
- **viewRule**: `members ~ @request.auth.id`
- **createRule**: `@request.auth.id != ""`
- **updateRule**: `members ~ @request.auth.id`
- **deleteRule**: `members ~ @request.auth.id`

### Fields

- **`title`**: `text`
- **`type`**: `select` — values=private,group; single
- **`members`**: `relation` — ref `users`; multi
- **`admins`**: `relation` — ref `users`; multi
- **`archived`**: `bool`
- **`banned_users`**: `relation` — ref `users`; multi
- **`last_message`**: `date`

---

## `messages`

- **type**: `base`

### Rules

- **listRule**: `@request.auth.id != ""`
- **viewRule**: `@request.auth.id != ""`
- **createRule**: `@request.auth.id != ""`
- **updateRule**: `@request.auth.id != ""`
- **deleteRule**: `@request.auth.id != ""`

### Fields

- **`chat`**: `relation` — ref `chats`; single
- **`sender`**: `relation` — ref `users`; single
- **`content`**: `editor`
- **`attachments`**: `file` — maxSelect=99; maxSize=200000000
- **`edited`**: `bool`
- **`deleted`**: `bool`
- **`reply_to`**: `relation` — ref `messages`; single
- **`recipient`**: `relation` — ref `users`; single
- **`kem_ciphertext`**: `file` — maxSelect=1; maxSize=5242880
- **`hkdf_salt`**: `file` — maxSelect=1; maxSize=5242880
- **`xc20_nonce`**: `file` — maxSelect=1; maxSize=5242880
- **`ciphertext`**: `file` — maxSelect=1; maxSize=5242880
- **`auth_tag`**: `file` — maxSelect=1; maxSize=5242880
- **`signature`**: `file` — maxSelect=1; maxSize=5242880

---

## `users`

- **type**: `auth`

### Rules

- **listRule**: `@request.auth.id != ""`
- **viewRule**: `@request.auth.id != ""`
- **createRule**: null
- **updateRule**: `@request.auth.id != ""`
- **deleteRule**: `@request.auth.id != ""`

### Fields

- **`name`**: `text`
- **`avatar`**: `file` — maxSelect=1; maxSize=5242880; mimeTypes=image/jpeg,image/png,image/svg+xml,image/gif,image/webp
- **`status`**: `select` — values=online,offline,away,busy; single
- **`bio`**: `editor`
- **`blocked_users`**: `relation` — ref `users`; multi
- **`kyber_public_key`**: `file` — maxSelect=1; maxSize=2097152; mimeTypes=application/octet-stream,application/octet-stream
- **`dilithium_public_key`**: `file` — maxSelect=1; maxSize=2097152; mimeTypes=application/octet-stream,application/octet-stream
- **`key_version`**: `number` — required
- **`key_rotated_at`**: `date`

