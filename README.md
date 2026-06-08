# EDUmind Robotics Lab

EDUmind Robotics Lab is an educational robotics learning platform with a
FastAPI backend, React frontend and local AI-assisted learning flows.

This public repository is a sanitized source release for code review,
educational reuse and community audit. Production secrets, deployment
configuration, private runbooks, generated environments and operational
state are not included.

## Development

Frontend:

```bash
cd frontend
npm install
npm run build
```

Backend:

```bash
cd backend
python3 -m venv .venv
. .venv/bin/activate
pip install -r requirements.txt
```

Use `.env.example` as a placeholder template only.

## Release Scope

See `OPEN_SOURCE_RELEASE.md` for what is included and excluded.

## License

Licensed under `AGPL-3.0-or-later OR EUPL-1.2`.

EDUmind(R), logos and brand assets are reserved. See `TRADEMARKS.md`.
