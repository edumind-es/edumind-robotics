# Security Policy

Please do not publish vulnerabilities, credentials or personal data in
public issues.

If you find a security problem, report it privately to the project
maintainer or through the contact channel published by EDUmind / Los
Mundos Edufis.

This public repository intentionally excludes production secrets, live
configuration, private backups, uploaded user content and deployment
state. Use the included `.env.example` files as templates and generate
fresh secrets for every installation.

Before deploying a fork, review authentication, CORS, cookies, database
permissions, upload handling, rate limits, logging, backups and any
third-party integrations.
