# Open Source Release Scope

This repository is a public, sanitized source release prepared for code
review, educational reuse and community audit.

Included:

- Application source code.
- Build metadata and dependency manifests.
- Tests and safe development helpers where applicable.
- Public documentation needed to understand and run the project.
- License, copyright, trademark, security and privacy notices.
- Placeholder `.env.example` files where runtime configuration is needed.

Excluded:

- Production `.env` files and secrets.
- Live server, nginx and systemd configuration.
- Production databases, SQLite files, SQL dumps and backups.
- Uploaded user/classroom content.
- Local logs, analytics exports, reports and runtime state.
- Dependency folders and generated builds.
- Private deployment notes and operational handoff documents.

The public history is intentionally clean and may not match the private
development history. If you operate a deployment, generate fresh secrets,
review all configuration and perform your own security and privacy checks.
