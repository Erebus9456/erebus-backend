migrate(
  (db) => {
    const dao = new Dao(db)

    const addFieldIfMissing = (collection, field) => {
      try {
        const existing = collection.schema.getFieldByName(field.name)
        if (existing) return
      } catch (_) {
        // If this PocketBase version doesn't expose getFieldByName,
        // we fallback to best-effort add (may fail if duplicate exists).
      }
      collection.schema.addField(field)
    }

    // --- users (auth) updates ---
    // PocketBase always has the auth collection with id `_pb_users_auth_`,
    // but its display name may vary. We try both id and common name.
    let users = null
    try {
      users = dao.findCollectionByNameOrId("_pb_users_auth_")
    } catch (_) {
      users = dao.findCollectionByNameOrId("users")
    }

    users.options = {
      allowEmailAuth: false,
      allowOAuth2Auth: false,
      allowUsernameAuth: true,
      exceptEmailDomains: null,
      manageRule: null,
      minPasswordLength: 8,
      onlyEmailDomains: null,
      onlyVerified: false,
      requireEmail: false,
    }

    addFieldIfMissing(
      users,
      new SchemaField({
        system: false,
        name: "name",
        type: "text",
        required: false,
        unique: false,
        options: { min: null, max: null, pattern: "" },
      })
    )

    addFieldIfMissing(
      users,
      new SchemaField({
        system: false,
        name: "avatar",
        type: "file",
        required: false,
        unique: false,
        options: {
          mimeTypes: ["image/jpeg", "image/png", "image/svg+xml", "image/gif", "image/webp"],
          thumbs: null,
          maxSelect: 1,
          maxSize: 5242880,
          protected: false,
        },
      })
    )

    addFieldIfMissing(
      users,
      new SchemaField({
        system: false,
        name: "status",
        type: "select",
        required: false,
        unique: false,
        options: { maxSelect: 1, values: ["online", "offline", "away", "busy"] },
      })
    )

    addFieldIfMissing(
      users,
      new SchemaField({
        system: false,
        name: "bio",
        type: "editor",
        required: false,
        unique: false,
        options: { convertUrls: false },
      })
    )

    addFieldIfMissing(
      users,
      new SchemaField({
        system: false,
        name: "blocked_users",
        type: "relation",
        required: false,
        unique: false,
        options: {
          collectionId: users.id,
          cascadeDelete: false,
          minSelect: null,
          maxSelect: null,
          displayFields: null,
        },
      })
    )

    addFieldIfMissing(
      users,
      new SchemaField({
        system: false,
        name: "kyber_public_key",
        type: "file",
        required: false,
        unique: false,
        options: {
          mimeTypes: ["application/octet-stream", "application/octet-stream"],
          thumbs: [],
          maxSelect: 1,
          maxSize: 2097152,
          protected: false,
        },
      })
    )

    addFieldIfMissing(
      users,
      new SchemaField({
        system: false,
        name: "dilithium_public_key",
        type: "file",
        required: false,
        unique: false,
        options: {
          mimeTypes: ["application/octet-stream", "application/octet-stream"],
          thumbs: [],
          maxSelect: 1,
          maxSize: 2097152,
          protected: false,
        },
      })
    )

    addFieldIfMissing(
      users,
      new SchemaField({
        system: false,
        name: "key_version",
        type: "number",
        required: true,
        unique: false,
        options: { min: null, max: null, noDecimal: false },
      })
    )

    addFieldIfMissing(
      users,
      new SchemaField({
        system: false,
        name: "key_rotated_at",
        type: "date",
        required: false,
        unique: false,
        options: { min: "", max: "" },
      })
    )

    dao.saveCollection(users)

    // --- chats collection ---
    let chats = null
    try {
      chats = dao.findCollectionByNameOrId("chats")
    } catch (_) {
      chats = new Collection({
        name: "chats",
        type: "base",
        system: false,
        schema: [],
        indexes: [],
        options: {},
        listRule: "members ~ @request.auth.id",
        viewRule: "members ~ @request.auth.id",
        createRule: '@request.auth.id != ""',
        updateRule: "members ~ @request.auth.id",
        deleteRule: "members ~ @request.auth.id",
      })
    }

    addFieldIfMissing(
      chats,
      new SchemaField({
        system: false,
        name: "title",
        type: "text",
        required: false,
        unique: false,
        options: { min: null, max: null, pattern: "" },
      })
    )

    addFieldIfMissing(
      chats,
      new SchemaField({
        system: false,
        name: "type",
        type: "select",
        required: false,
        unique: false,
        options: { maxSelect: 1, values: ["private", "group"] },
      })
    )

    addFieldIfMissing(
      chats,
      new SchemaField({
        system: false,
        name: "members",
        type: "relation",
        required: false,
        unique: false,
        options: {
          collectionId: users.id,
          cascadeDelete: false,
          minSelect: null,
          maxSelect: null,
          displayFields: null,
        },
      })
    )

    addFieldIfMissing(
      chats,
      new SchemaField({
        system: false,
        name: "admins",
        type: "relation",
        required: false,
        unique: false,
        options: {
          collectionId: users.id,
          cascadeDelete: false,
          minSelect: null,
          maxSelect: null,
          displayFields: null,
        },
      })
    )

    addFieldIfMissing(
      chats,
      new SchemaField({
        system: false,
        name: "archived",
        type: "bool",
        required: false,
        unique: false,
        options: {},
      })
    )

    addFieldIfMissing(
      chats,
      new SchemaField({
        system: false,
        name: "banned_users",
        type: "relation",
        required: false,
        unique: false,
        options: {
          collectionId: users.id,
          cascadeDelete: false,
          minSelect: null,
          maxSelect: null,
          displayFields: null,
        },
      })
    )

    addFieldIfMissing(
      chats,
      new SchemaField({
        system: false,
        name: "last_message",
        type: "date",
        required: false,
        unique: false,
        options: { min: "", max: "" },
      })
    )

    dao.saveCollection(chats)

    // --- messages collection ---
    let messages = null
    try {
      messages = dao.findCollectionByNameOrId("messages")
    } catch (_) {
      messages = new Collection({
        name: "messages",
        type: "base",
        system: false,
        schema: [],
        indexes: [],
        options: {},
        listRule: '@request.auth.id != ""',
        viewRule: '@request.auth.id != ""',
        createRule: '@request.auth.id != ""',
        updateRule: '@request.auth.id != ""',
        deleteRule: '@request.auth.id != ""',
      })
    }

    addFieldIfMissing(
      messages,
      new SchemaField({
        system: false,
        name: "chat",
        type: "relation",
        required: false,
        unique: false,
        options: {
          collectionId: chats.id,
          cascadeDelete: false,
          minSelect: null,
          maxSelect: 1,
          displayFields: null,
        },
      })
    )

    addFieldIfMissing(
      messages,
      new SchemaField({
        system: false,
        name: "sender",
        type: "relation",
        required: false,
        unique: false,
        options: {
          collectionId: users.id,
          cascadeDelete: false,
          minSelect: null,
          maxSelect: 1,
          displayFields: null,
        },
      })
    )

    addFieldIfMissing(
      messages,
      new SchemaField({
        system: false,
        name: "content",
        type: "editor",
        required: false,
        unique: false,
        options: { convertUrls: false },
      })
    )

    addFieldIfMissing(
      messages,
      new SchemaField({
        system: false,
        name: "attachments",
        type: "file",
        required: false,
        unique: false,
        options: {
          mimeTypes: [],
          thumbs: [],
          maxSelect: 99,
          maxSize: 200000000,
          protected: false,
        },
      })
    )

    addFieldIfMissing(
      messages,
      new SchemaField({
        system: false,
        name: "edited",
        type: "bool",
        required: false,
        unique: false,
        options: {},
      })
    )

    addFieldIfMissing(
      messages,
      new SchemaField({
        system: false,
        name: "deleted",
        type: "bool",
        required: false,
        unique: false,
        options: {},
      })
    )

    addFieldIfMissing(
      messages,
      new SchemaField({
        system: false,
        name: "recipient",
        type: "relation",
        required: false,
        unique: false,
        options: {
          collectionId: users.id,
          cascadeDelete: false,
          minSelect: null,
          maxSelect: 1,
          displayFields: null,
        },
      })
    )

    addFieldIfMissing(
      messages,
      new SchemaField({
        system: false,
        name: "kem_ciphertext",
        type: "file",
        required: false,
        unique: false,
        options: { mimeTypes: [], thumbs: [], maxSelect: 1, maxSize: 5242880, protected: false },
      })
    )

    addFieldIfMissing(
      messages,
      new SchemaField({
        system: false,
        name: "hkdf_salt",
        type: "file",
        required: false,
        unique: false,
        options: { mimeTypes: [], thumbs: [], maxSelect: 1, maxSize: 5242880, protected: false },
      })
    )

    addFieldIfMissing(
      messages,
      new SchemaField({
        system: false,
        name: "xc20_nonce",
        type: "file",
        required: false,
        unique: false,
        options: { mimeTypes: [], thumbs: [], maxSelect: 1, maxSize: 5242880, protected: false },
      })
    )

    addFieldIfMissing(
      messages,
      new SchemaField({
        system: false,
        name: "ciphertext",
        type: "file",
        required: false,
        unique: false,
        options: { mimeTypes: [], thumbs: [], maxSelect: 1, maxSize: 5242880, protected: false },
      })
    )

    addFieldIfMissing(
      messages,
      new SchemaField({
        system: false,
        name: "auth_tag",
        type: "file",
        required: false,
        unique: false,
        options: { mimeTypes: [], thumbs: [], maxSelect: 1, maxSize: 5242880, protected: false },
      })
    )

    addFieldIfMissing(
      messages,
      new SchemaField({
        system: false,
        name: "signature",
        type: "file",
        required: false,
        unique: false,
        options: { mimeTypes: [], thumbs: [], maxSelect: 1, maxSize: 5242880, protected: false },
      })
    )

    dao.saveCollection(messages)

    // self-referencing relation requires the collection id after save
    addFieldIfMissing(
      messages,
      new SchemaField({
        system: false,
        name: "reply_to",
        type: "relation",
        required: false,
        unique: false,
        options: {
          collectionId: messages.id,
          cascadeDelete: false,
          minSelect: null,
          maxSelect: 1,
          displayFields: null,
        },
      })
    )

    // index to speed up chat timeline reads
    messages.indexes = ['CREATE INDEX idx_messages_chat_created ON messages (chat, created)']
    dao.saveCollection(messages)
  },
  (db) => {
    const dao = new Dao(db)

    // delete content collections
    try {
      const messages = dao.findCollectionByNameOrId("messages")
      dao.deleteCollection(messages)
    } catch (_) {}

    try {
      const chats = dao.findCollectionByNameOrId("chats")
      dao.deleteCollection(chats)
    } catch (_) {}

    // remove users custom fields and restore auth options to PocketBase defaults
    let users = null
    try {
      users = dao.findCollectionByNameOrId("_pb_users_auth_")
    } catch (_) {
      users = dao.findCollectionByNameOrId("users")
    }

    for (const fieldName of [
      "name",
      "avatar",
      "status",
      "bio",
      "blocked_users",
      "kyber_public_key",
      "dilithium_public_key",
      "key_version",
      "key_rotated_at",
    ]) {
      try {
        const f = users.schema.getFieldByName(fieldName)
        if (f) users.schema.removeField(f.id)
      } catch (_) {}
    }

    users.options = {
      allowEmailAuth: true,
      allowOAuth2Auth: true,
      allowUsernameAuth: true,
      exceptEmailDomains: null,
      manageRule: null,
      minPasswordLength: 8,
      onlyEmailDomains: null,
      onlyVerified: false,
      requireEmail: false,
    }

    dao.saveCollection(users)
  }
)

