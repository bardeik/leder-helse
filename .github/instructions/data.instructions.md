---
applyTo: "src/data/**/*"
description: "Local persistence (IndexedDB/Dexie)"
---

# Data layer instructions

- Use Dexie for IndexedDB.
- Keep database versioning explicit.
- Implement repositories with clear interfaces (e.g., `dailyLogsRepo`).
- Never store secrets.
- Provide a minimal export/import (JSON) capability for user backups.
