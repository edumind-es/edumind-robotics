"""Global pytest isolation from the production deployment environment."""

import os


# Tests use signed-session fixtures explicitly when authentication is relevant.
# Keeping the default suite in local mode prevents the repository .env from
# turning ordinary API tests into production-authentication tests.
os.environ["AUTHENTIK_ENABLED"] = "false"
